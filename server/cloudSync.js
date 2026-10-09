const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, 'database.sqlite');
const GIST_FILENAME = 'gecwc-academics-db.b64';
const GIST_DESC = 'GECWC Academics SQLite Cloud Backup';

let gistId = process.env.GITHUB_GIST_ID || null;
let isSyncing = false;
let syncTimeout = null;
let lastSyncTime = null;
let lastSyncStatus = process.env.GITHUB_BACKUP_TOKEN ? 'Configured & Ready' : 'Not Configured (Add GITHUB_BACKUP_TOKEN in Render)';
let lastError = null;

function getToken() {
  return process.env.GITHUB_BACKUP_TOKEN || process.env.GITHUB_TOKEN || null;
}

function getSyncStatus() {
  const token = getToken();
  return {
    configured: !!token,
    hasToken: !!token,
    gistId: gistId || null,
    lastSyncTime,
    status: lastSyncStatus,
    lastError,
    dbSizeBytes: fs.existsSync(dbPath) ? fs.statSync(dbPath).size : 0
  };
}

/**
 * On server boot, safely restore database from GitHub Gist if available
 * CRITICAL SAFEGUARD: Never overwrite local data if local has more users than cloud!
 */
async function restoreFromCloudOnBoot(reloadCallback) {
  const token = getToken();
  if (!token) {
    console.log('[CloudSync] No GITHUB_BACKUP_TOKEN configured. Using local database.');
    return false;
  }

  try {
    console.log('[CloudSync] Checking for cloud database backup on GitHub Gist...');
    lastSyncStatus = 'Checking cloud backup...';

    // 1. Locate or retrieve Gist
    let targetGist = null;
    if (gistId) {
      try {
        const res = await fetch(`https://api.github.com/gists/${gistId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'User-Agent': 'GECWC-Academics-Sync',
            Accept: 'application/vnd.github.v3+json'
          }
        });
        if (res.ok) {
          targetGist = await res.json();
        }
      } catch (e) {
        console.warn('[CloudSync] Failed to fetch gist by ID:', e.message);
      }
    }

    if (!targetGist) {
      const listRes = await fetch('https://api.github.com/gists', {
        headers: {
          Authorization: `Bearer ${token}`,
          'User-Agent': 'GECWC-Academics-Sync',
          Accept: 'application/vnd.github.v3+json'
        }
      });
      if (listRes.ok) {
        const gists = await listRes.json();
        const found = gists.find(g => g.description === GIST_DESC);
        if (found) {
          gistId = found.id;
          // IMPORTANT: GET /gists list endpoint truncates all file bodies! Fetch the single gist directly:
          try {
            const singleRes = await fetch(`https://api.github.com/gists/${gistId}`, {
              headers: {
                Authorization: `Bearer ${token}`,
                'User-Agent': 'GECWC-Academics-Sync',
                Accept: 'application/vnd.github.v3+json'
              }
            });
            if (singleRes.ok) {
              targetGist = await singleRes.json();
            } else {
              targetGist = found;
            }
          } catch (_) {
            targetGist = found;
          }
        }
      }
    }

    if (!targetGist || !targetGist.files || !targetGist.files[GIST_FILENAME]) {
      console.log('[CloudSync] No cloud backup found yet. Will create initial backup from local database.');
      lastSyncStatus = 'Creating initial cloud backup...';
      await performCloudBackup();
      return false;
    }

    const fileMeta = targetGist.files[GIST_FILENAME];
    let b64Content = fileMeta.content;

    // CRITICAL: GitHub Usercontent (raw_url) MUST NOT have the Authorization header!
    // Sending Authorization: Bearer to raw_url causes an immediate HTTP 404 from GitHub CDN!
    if ((fileMeta.truncated || !b64Content) && fileMeta.raw_url) {
      console.log('[CloudSync] Backup file truncated in API response. Fetching full content from raw_url (without auth header)...');
      const rawRes = await fetch(fileMeta.raw_url);
      if (rawRes.ok) {
        b64Content = await rawRes.text();
      } else {
        console.error(`[CloudSync] Failed to download from raw_url (${rawRes.status} ${rawRes.statusText})`);
        return false;
      }
    }

    if (!b64Content) {
      console.log('[CloudSync] Cloud backup file was empty.');
      return false;
    }

    const buffer = Buffer.from(b64Content.trim(), 'base64');
    // Verify SQLite header magic bytes ("SQLite format 3\0")
    if (buffer.length < 16 || buffer.toString('utf8', 0, 15) !== 'SQLite format 3') {
      console.error('[CloudSync] Downloaded data is not a valid SQLite database (header mismatch).');
      return false;
    }

    // Inspect cloud backup data in a temporary file
    const tempCheckPath = dbPath + '.cloud-check.tmp';
    fs.writeFileSync(tempCheckPath, buffer);

    let cloudUserCount = 0;
    let cloudNoteCount = 0;
    try {
      const cloudDb = new Database(tempCheckPath, { readonly: true });
      cloudUserCount = cloudDb.prepare('SELECT COUNT(*) as c FROM users').get().c;
      cloudNoteCount = cloudDb.prepare('SELECT COUNT(*) as c FROM notes').get().c;
      cloudDb.close();
    } catch (e) {
      console.error('[CloudSync] Failed to read downloaded database tables:', e.message);
    }

    // Inspect local database data
    let localUserCount = 0;
    let localNoteCount = 0;
    if (fs.existsSync(dbPath)) {
      try {
        const localDb = new Database(dbPath, { readonly: true });
        localUserCount = localDb.prepare('SELECT COUNT(*) as c FROM users').get().c;
        localNoteCount = localDb.prepare('SELECT COUNT(*) as c FROM notes').get().c;
        localDb.close();
      } catch (e) {
        console.warn('[CloudSync] Failed to inspect local database:', e.message);
      }
    }

    console.log(`[CloudSync] Comparison: Cloud DB has ${cloudUserCount} users, ${cloudNoteCount} notes. Local DB has ${localUserCount} users, ${localNoteCount} notes.`);

    // SAFEGUARD 1: If local database has MORE users, NEVER overwrite local!
    // Instead, upload the newer local data to the cloud!
    if (localUserCount > cloudUserCount) {
      console.log(`[CloudSync] 🛡️ SAFEGUARD: Local database has more users (${localUserCount} > ${cloudUserCount}). Preserving local data and updating cloud backup!`);
      try { if (fs.existsSync(tempCheckPath)) fs.unlinkSync(tempCheckPath); } catch (_) {}
      await performCloudBackup();
      return false;
    }

    // SAFEGUARD 2: If cloud has more or equal data, safely restore from cloud
    console.log(`[CloudSync] Restoring cloud database (${cloudUserCount} users, ${cloudNoteCount} notes)...`);
    
    // Safely close local database connection before replacing file
    try {
      const { closeDatabase } = require('./db');
      closeDatabase();
    } catch (e) {
      console.warn('[CloudSync] Error closing DB before file copy:', e.message);
    }

    fs.copyFileSync(tempCheckPath, dbPath);
    try { if (fs.existsSync(tempCheckPath)) fs.unlinkSync(tempCheckPath); } catch (_) {}

    // Clean stale WAL/SHM
    try {
      if (fs.existsSync(dbPath + '-wal')) fs.unlinkSync(dbPath + '-wal');
      if (fs.existsSync(dbPath + '-shm')) fs.unlinkSync(dbPath + '-shm');
    } catch (_) {}

    // Reload active database connection
    try {
      const { reloadDatabase } = require('./db');
      reloadDatabase();
    } catch (e) {
      console.warn('[CloudSync] Error reloading DB:', e.message);
    }

    lastSyncTime = new Date().toISOString();
    lastSyncStatus = `Synced (${cloudUserCount} users, ${cloudNoteCount} notes)`;
    console.log(`[CloudSync] ✅ Successfully restored SQLite database from cloud (${cloudUserCount} users)!`);

    if (typeof reloadCallback === 'function') {
      reloadCallback();
    }
    return true;
  } catch (err) {
    console.error('[CloudSync] Error restoring from cloud:', err.message);
    lastError = err.message;
    lastSyncStatus = 'Error restoring: ' + err.message;
    return false;
  }
}

/**
 * Trigger an asynchronous cloud backup (debounced 5 seconds)
 */
function triggerCloudBackup() {
  const token = getToken();
  if (!token) return;

  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(async () => {
    await performCloudBackup();
  }, 5000); // 5 seconds debounce
}

/**
 * Flush WAL and upload database to GitHub Gist immediately
 */
async function performCloudBackup() {
  const token = getToken();
  if (!token || isSyncing) return false;

  isSyncing = true;
  lastSyncStatus = 'Uploading backup to cloud...';

  try {
    if (!fs.existsSync(dbPath)) {
      isSyncing = false;
      return false;
    }

    // CRITICAL: Flush WAL into database.sqlite before reading!
    try {
      const { db } = require('./db');
      db.pragma('wal_checkpoint(TRUNCATE)');
    } catch (e) {
      console.warn('[CloudSync] WAL checkpoint warning:', e.message);
    }

    const dataBuffer = fs.readFileSync(dbPath);
    const b64Data = dataBuffer.toString('base64');

    const payload = {
      description: GIST_DESC,
      public: false,
      files: {
        [GIST_FILENAME]: {
          content: b64Data
        }
      }
    };

    // If gistId not known in memory, check if existing Gist already exists
    if (!gistId) {
      try {
        const listRes = await fetch('https://api.github.com/gists', {
          headers: {
            Authorization: `Bearer ${token}`,
            'User-Agent': 'GECWC-Academics-Sync',
            Accept: 'application/vnd.github.v3+json'
          }
        });
        if (listRes.ok) {
          const gists = await listRes.json();
          const existing = gists.find(g => g.description === GIST_DESC);
          if (existing) {
            gistId = existing.id;
          }
        }
      } catch (_) {}
    }

    let response;
    if (gistId) {
      response = await fetch(`https://api.github.com/gists/${gistId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'User-Agent': 'GECWC-Academics-Sync',
          'Content-Type': 'application/json',
          Accept: 'application/vnd.github.v3+json'
        },
        body: JSON.stringify(payload)
      });
    }

    if (!response || !response.ok) {
      response = await fetch('https://api.github.com/gists', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'User-Agent': 'GECWC-Academics-Sync',
          'Content-Type': 'application/json',
          Accept: 'application/vnd.github.v3+json'
        },
        body: JSON.stringify(payload)
      });
    }

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`GitHub Gist API error (${response.status}): ${errText.slice(0, 100)}`);
    }

    const gistData = await response.json();
    gistId = gistData.id;
    lastSyncTime = new Date().toISOString();
    lastSyncStatus = 'Synced successfully';
    lastError = null;
    console.log(`[CloudSync] ✅ Database backed up to GitHub Gist (${gistId}) at ${lastSyncTime}`);
    return true;
  } catch (err) {
    console.error('[CloudSync] Backup failed:', err.message);
    lastError = err.message;
    lastSyncStatus = 'Backup failed: ' + err.message;
    return false;
  } finally {
    isSyncing = false;
  }
}

module.exports = {
  getSyncStatus,
  restoreFromCloudOnBoot,
  triggerCloudBackup,
  performCloudBackup
};
