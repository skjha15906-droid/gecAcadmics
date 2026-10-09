const fs = require('fs');
const path = require('path');

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
 * On server boot, try restoring database from GitHub Gist if available
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
    }

    if (!targetGist) {
      // Find Gist by description
      const listRes = await fetch('https://api.github.com/gists', {
        headers: {
          Authorization: `Bearer ${token}`,
          'User-Agent': 'GECWC-Academics-Sync',
          Accept: 'application/vnd.github.v3+json'
        }
      });
      if (listRes.ok) {
        const gists = await listRes.json();
        targetGist = gists.find(g => g.description === GIST_DESC);
        if (targetGist) {
          gistId = targetGist.id;
        }
      }
    }

    if (!targetGist || !targetGist.files || !targetGist.files[GIST_FILENAME]) {
      console.log('[CloudSync] No existing cloud backup found. Will create one on next database write.');
      lastSyncStatus = 'No cloud backup found yet (will auto-create on write)';
      return false;
    }

    const fileMeta = targetGist.files[GIST_FILENAME];
    let b64Content = fileMeta.content;
    if (fileMeta.truncated && fileMeta.raw_url) {
      const rawRes = await fetch(fileMeta.raw_url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      b64Content = await rawRes.text();
    }

    if (!b64Content) {
      console.log('[CloudSync] Backup file was empty.');
      return false;
    }

    const buffer = Buffer.from(b64Content, 'base64');
    // Verify SQLite header magic bytes ("SQLite format 3\0")
    if (buffer.length < 16 || buffer.toString('utf8', 0, 15) !== 'SQLite format 3') {
      console.error('[CloudSync] Downloaded data is not a valid SQLite database.');
      return false;
    }

    const localSize = fs.existsSync(dbPath) ? fs.statSync(dbPath).size : 0;
    // If local database is smaller or missing, restore from cloud
    console.log(`[CloudSync] Cloud backup found (${buffer.length} bytes, local: ${localSize} bytes). Restoring...`);

    // Remove old WAL/SHM
    try {
      if (fs.existsSync(dbPath + '-wal')) fs.unlinkSync(dbPath + '-wal');
      if (fs.existsSync(dbPath + '-shm')) fs.unlinkSync(dbPath + '-shm');
    } catch (_) {}

    fs.writeFileSync(dbPath, buffer);
    lastSyncTime = new Date().toISOString();
    lastSyncStatus = 'Restored from cloud successfully';
    console.log('[CloudSync] ✅ Successfully restored SQLite database from GitHub cloud backup!');

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
 * Trigger an asynchronous cloud backup
 */
function triggerCloudBackup() {
  const token = getToken();
  if (!token) return;

  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(async () => {
    await performCloudBackup();
  }, 10000); // Debounce 10 seconds
}

/**
 * Perform backup to GitHub Gist immediately
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
      // Create new Gist if PATCH failed or no gistId yet
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
