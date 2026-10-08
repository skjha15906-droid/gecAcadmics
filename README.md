# GECWC Academics — CSE Academic Notes Platform
**Government Engineering College, West Champaran (GECWC)**
*Department of Computer Science & Engineering*

> **“One Place for All CSE Academic Notes”**

---

## 🏛️ Project Overview

**GECWC Academics** is a centralized, peer-reviewed, strictly academic resource platform designed specifically for the **Computer Science & Engineering (CSE)** branch at **Government Engineering College, West Champaran (GECWC)**, aligned with the **Bihar Engineering University (BEU), Patna** curriculum.

The platform provides a structured, hierarchy-driven repository for CSE students from **Semester 1 to Semester 8** to access verified handwritten notes, lecture presentations, previous years' question banks, syllabus unit breakdowns, and laboratory manuals.

---

## 🔒 Core Academic Principle

> **“Students can contribute content, but only the predefined academic structure and approved content can appear publicly.”**

1. **Predefined Academic Structure**:
   - Students **cannot** create semesters, subjects, or units.
   - All academic structures are managed exclusively by authorized faculty administrators.
2. **Mandatory Peer-Review Moderation**:
   - Every student upload is placed in `Pending Review`.
   - Content **NEVER** becomes publicly visible immediately.
   - Faculty moderators inspect syllabus alignment, readability, and content before approving or rejecting with feedback.

---

## 📚 Academic Hierarchy

```
CSE Branch
└── Semester (Semesters 1 to 8)
    └── Subject (e.g., CS301: Data Structures & Algorithms)
        └── Unit (e.g., Unit 1: Introduction, Arrays & Stacks)
            └── Notes (Approved & Peer-Reviewed Study Materials)
```

---

## 🚀 Key Features

### 1. Student Portal
- **Academic Home**:
  - GECWC branding with institutional seal.
  - Tagline: *“One Place for All CSE Academic Notes”*.
  - Instant search across note titles, subject codes, units, and descriptions.
  - Direct semester cards for Semesters 1 to 8.
  - Highlights: Recently approved notes, Most downloaded, and Most viewed.
  - Quick subject shortcuts (Data Structures, DBMS, OS, Networks, ML, FLAT).
  - Institutional footer with AICTE and BEU Patna accreditation details.
- **Semester System**:
  - Predefined Semesters 1–8.
  - Selecting a semester reveals only subjects mapped to that semester.
  - Strict protection: Students cannot add arbitrary semesters.
- **Subject & Unit Catalog**:
  - Detailed unit syllabus outlines and approved notes count.
  - Expanding a subject displays Unit 1 through Unit 5 syllabus scopes.
- **Search & Multi-Faceted Filters**:
  - Live full-text search across title, subject, unit, and descriptions (e.g., searching *"Stack"* returns relevant Data Structures notes).
  - Filters by Semester, Subject, Unit, and Resource Type (Handwritten Notes, Lecture Slides, Question Banks, Lab Manuals, Formula Sheets).
  - Sorting: Latest, Most Viewed, Most Downloaded.
- **Interactive Document Viewer & Reader**:
  - Full metadata: Title, Subject, Unit, Topic, Author, Date, File Type, File Size.
  - In-app preview modal simulating academic document review.
  - One-click secure download with live counter increment.
  - Flag / Report button with structured violation reasons.
- **Student Upload System**:
  - Dynamic cascading dropdowns: Semester → Subject → Unit.
  - Anti-spam & duplicate check: warns student if a matching or similar resource already exists in that subject.
  - Strict 25MB maximum file size limit.
  - Allowed file types: `.pdf`, `.doc`, `.docx`, `.ppt`, `.pptx`, `.jpg`, `.png`.
  - Immediate feedback: *“Your note has been submitted successfully and is waiting for academic moderation.”*
- **My Uploads**:
  - Personal student dashboard tracking submissions across: **Pending Review**, **Approved & Live**, and **Rejected**.
  - Displays moderator rejection reasons (*Poor/invalid file*, *Wrong unit*, *Duplicate*, etc.) and actionable feedback notes for revision.

---

### 2. Admin & Moderation Panel (`/admin`)
- **Role-Based Access Control (RBAC)**:
  - Accessible only to users with `admin` or `moderator` roles.
  - Non-administrators receive an access denied security barrier.
  - Backend verifies JWT token and permissions on every protected endpoint.
- **Admin Dashboard**:
  - Live metric cards: Total Students, Total Notes, Pending Submissions, Approved Notes, Rejected Notes, Reported Notes, Total Downloads, Total Views.
  - Priority **Pending Approvals Queue** with quick action buttons.
  - Real-time Admin Activity Log feed.
- **Dedicated Submission Review Page**:
  - Full inspection drawer showing student credentials (name, email, roll number, semester).
  - Document preview.
  - Moderation actions:
    - **Approve**: One-click publish to the live repository.
    - **Reject**: Preset rejection reason dropdown (*Wrong subject, Wrong unit, Duplicate, Unrelated content, Poor/invalid file, Inappropriate content, Spam, Other*) + optional custom explanation.
    - **Delete**: Permanent deletion with confirmation prompt.
- **Content Management**:
  - Full CRUD control over Semesters, Subjects, and Units.
  - Safe deletion checks (prevents deleting semesters/subjects that have active dependent content).
  - Enable/disable toggles.
- **User Management**:
  - Full directory of enrolled students, moderators, and admins.
  - Upload statistics per student (Total, Approved, Rejected).
  - One-click account suspension and activation.
  - Role management (promote to Moderator / Admin).
- **Academic Reports**:
  - Moderation queue for user-flagged content.
  - Actions: Resolve (Keep content), Dismiss, or Remove Note.
- **Portal Analytics**:
  - Bar distribution of notes across Semesters 1 to 8.
  - Top subjects by note volume.
  - Leaderboard of top student contributors.
  - Most consulted study materials.
- **Admin Activity Log**:
  - Immutable audit trail recording every administrative decision (`APPROVE_NOTE`, `REJECT_NOTE`, `DELETE_NOTE`, `CREATE_SUBJECT`, `SUSPEND_USER`) with timestamps and user attribution.
- **Platform Settings**:
  - Configure college name, portal name, tagline, announcement banner, file upload size limits, and allowed extensions.

---

## 🔑 Test Credentials (1-Click Switcher Available in UI)

For quick demonstration, the portal includes an interactive **1-Click Role Switcher** at the top bar and on the Login page:

| Role | Name | Email | Password | Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Dr. A. K. Verma | `admin@gecwc.ac.in` | `admin123` | Full control over Users, Structure, Notes, Settings |
| **Moderator** | Prof. R. N. Singh | `moderator@gecwc.ac.in` | `mod123` | Approvals, Rejections, Report Resolution |
| **Student** | Aman Kumar (5th Sem) | `aman.cse@gecwc.ac.in` | `student123` | Browsing, Downloading, Uploading, Reporting |
| **Student** | Priya Sharma (3rd Sem) | `priya.cse@gecwc.ac.in` | `student123` | Browsing, Downloading, Uploading, Reporting |

---

## 💻 Tech Stack & Architecture

- **Backend**: Node.js, Express.js (v5), JWT Authentication, bcryptjs, Multer file handling.
- **Database**: SQLite with `better-sqlite3` (WAL mode enabled, strict foreign key constraints, pre-seeded realistic CSE dataset).
- **Frontend**: React 19, Vite 8, Tailwind CSS 4, Lucide React icons.
- **Serving**: Production build served statically by Express on `http://localhost:5000`.

---

## 🛠️ Running the Application

### Option 1: Start Production Server (Both API and UI on Port 5000)
```bash
npm start
```
Open **[http://localhost:5000](http://localhost:5000)** in your browser.

### Option 2: Run Development Mode (Vite with Hot Module Reload)
```bash
# Terminal 1: Backend API
npm run server

# Terminal 2: Frontend Vite
npm run client
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### Run Automated Test Suite
```bash
node server/test-api.js


```
