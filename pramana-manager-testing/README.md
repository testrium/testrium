# Pramana Manager v1.4.0 - Testing Package

## 📦 What's Included

This is a ready-to-run testing package of Pramana Manager v1.4.0.

### Contents:
```
pramana-manager-testing/
├── backend/
│   └── target/
│       └── pramana-manager-1.4.0.jar    # Backend application
├── dist/                                 # Frontend build (static files)
├── docs/                                 # Documentation
│   ├── IMPLEMENTATION_STATUS.md         # Current feature status
│   ├── RELEASE_NOTES_v1.4.0.md         # Release notes
│   └── REFACTORING_SUMMARY.md           # Suite → Module refactoring details
└── START-APPLICATION.bat                # One-click startup script

```

---

## 🚀 Quick Start

### Prerequisites
- **Java 17 or higher** must be installed
- **Node.js** (optional, only if you want to use `npx serve`)

### Option 1: One-Click Start (Recommended)
1. Double-click `START-APPLICATION.bat`
2. Wait for both servers to start
3. Browser will open automatically at `http://localhost:5173`
4. Login with:
   - **Email:** `admin@pramana.com`
   - **Password:** `admin123`

### Option 2: Manual Start

#### Start Backend:
```bash
cd backend
java -jar target/pramana-manager-1.4.0.jar
```
Backend will run on `http://localhost:8080`

#### Serve Frontend:
```bash
# Option A: Using npx serve (recommended)
npx serve -s dist -l 5173

# Option B: Using Python
python -m http.server 5173 --directory dist

# Option C: Using any web server pointing to 'dist' folder
```
Frontend will run on `http://localhost:5173`

#### Create Admin User:
```bash
curl -X POST http://localhost:8080/api/admin/create-admin
```

---

## 🎯 What's New in v1.4.0

### Major Refactoring: Suite → Module

**Why This Change?**
- **Better Clarity:** "Module" better describes functional components of an application
- **Industry Standard:** Aligns with common software terminology
- **User Feedback:** Reflects actual usage patterns (Create Booking, Search Booking, etc.)

**New Hierarchy:**
```
Project → Application → Module → Test Case
```

**Example:**
- **Project:** INTTRA QA
  - **Application:** Booking
    - **Module:** Create Booking ← (Previously "Suite")
      - **Test Cases:** Individual test cases
    - **Module:** Search Booking
      - **Test Cases:** Individual test cases

### What Changed:
1. **Renamed Throughout:**
   - "Test Suites" → "Test Modules" (UI navigation)
   - "Suite" → "Module" (all forms and labels)
   - API endpoints: `/api/test-suites` → `/api/test-modules`
   - Database table: `test_suites` → `test_modules`

2. **Data Migration:**
   - All existing data automatically migrates on first startup
   - No manual intervention needed
   - Zero data loss

3. **Breaking Changes:**
   - Old API endpoints `/api/test-suites/*` removed
   - Use new endpoints `/api/test-modules/*` instead

### Features from v1.3.0:
1. **Application Management System**
   - Create and manage applications (Booking, Delphi, eVGM, etc.)
   - Hierarchical structure: Project → Application → Module → Test Case
   - Role-based access (ADMIN and LEAD users)

2. **Enhanced Module Management**
   - Test modules now require application assignment
   - Dynamic filtering based on project

3. **Metrics Foundation**
   - Test cases ready for automation tracking
   - Regression test identification

### User Roles:
- **ADMIN:** Full access to all features
- **LEAD:** Can manage applications in assigned projects
- **MEMBER:** Read-only access

---

## 📖 Using the Application

### First Time Setup:
1. Login as admin (`admin@pramana.com` / `admin123`)
2. Create a Project (e.g., "INTTRA QA")
3. Add team members to the project
4. Create Applications (e.g., "Booking", "Delphi")
5. Create Test Modules under applications
6. Add Test Cases to modules

### Navigation:
- **Dashboard:** Overview and metrics
- **Projects:** Manage projects and members
- **Applications:** Manage applications
- **Test Modules:** Organize test modules ← RENAMED from "Test Suites"
- **Test Cases:** Manage individual tests
- **Test Execution:** Run and track tests
- **Reporting:** Generate reports

---

## 🔧 System Requirements

### Minimum:
- **OS:** Windows 10/11, macOS, Linux
- **Java:** Version 17 or higher
- **RAM:** 2GB minimum, 4GB recommended
- **Disk:** 500MB free space
- **Browser:** Chrome, Firefox, Safari, or Edge (latest)

### Checking Java Version:
```bash
java -version
```
Should show version 17 or higher.

### Installing Java:
If Java is not installed:
1. Download from: https://adoptium.net/
2. Choose **Temurin 17 (LTS)** or higher
3. Install and restart your terminal

---

## 🗂️ Data Storage

- Database file: `backend/data/pramana.mv.db` (auto-created)
- Database type: H2 (embedded)
- Data persists between restarts

### Resetting Database:
To start fresh (⚠️ deletes all data):
1. Stop the application
2. Delete `backend/data/` folder
3. Restart application

---

## 📊 Testing Checklist

### Basic Flow Test:
- [ ] Application starts successfully
- [ ] Can login as admin
- [ ] Can create a project
- [ ] Can add team members
- [ ] Can create an application
- [ ] Can create a test module (previously suite)
- [ ] Can add test cases
- [ ] Can run test execution
- [ ] Can generate reports

### Module Management Test:
- [ ] Create module with application
- [ ] Edit module details
- [ ] Delete module
- [ ] Assign test cases to module
- [ ] Filter modules by project
- [ ] Filter modules by application

### Application Management Test:
- [ ] Create application with project
- [ ] Edit application details
- [ ] Archive application
- [ ] Assign module to application
- [ ] Filter applications by project

### Permission Test (if testing with multiple users):
- [ ] ADMIN can manage all applications and modules
- [ ] LEAD can manage applications/modules in their projects
- [ ] MEMBER has read-only access

---

## 🐛 Troubleshooting

### Backend doesn't start:
1. Check Java is installed: `java -version`
2. Check port 8080 is not in use
3. Check logs in terminal for errors

### Frontend doesn't load:
1. Check port 5173 is not in use
2. Try different port: `npx serve -s dist -l 3000`
3. Check backend is running first

### Can't login:
1. Make sure backend is running
2. Create admin: `curl -X POST http://localhost:8080/api/admin/create-admin`
3. Clear browser cache
4. Try: `admin@pramana.com` / `admin123`

### Database errors:
1. Stop application
2. Delete `backend/data/` folder
3. Restart and recreate admin

### Migration from v1.3.0:
- Data automatically migrates on first startup
- "Test Suites" become "Test Modules"
- All existing data is preserved
- No manual steps required

---

## 📞 Support & Documentation

### Documentation Files:
- **Release Notes:** `docs/RELEASE_NOTES_v1.4.0.md`
- **Implementation Status:** `docs/IMPLEMENTATION_STATUS.md`
- **Refactoring Details:** `docs/REFACTORING_SUMMARY.md`

### Key Information:
- Default admin: `admin@pramana.com` / `admin123`
- Backend API: `http://localhost:8080/api`
- H2 Console: `http://localhost:8080/h2-console` (if needed)

---

## 🎯 Next Steps

After testing v1.4.0:
1. Explore the new Module terminology
2. Create test hierarchy (Project → App → Module → Case)
3. Try different user roles
4. Test execution and reporting
5. Provide feedback on the changes

---

## 📝 Version Info

- **Version:** 1.4.0
- **Release Date:** December 13, 2025
- **Backend:** Spring Boot 3.2.0 + Java 17
- **Frontend:** React 18.2 + Vite 5.0
- **Database:** H2 (embedded)

---

## ⚠️ Important Notes

1. **This is a test build** - For testing purposes only
2. **Data is local** - Stored in embedded H2 database
3. **No production deployment** - Development/test environment only
4. **Backup data** - Copy `backend/data/` folder to preserve data
5. **Breaking Changes** - API endpoints changed from v1.3.0 (see docs)

---

**Happy Testing! 🚀**

For questions or issues, refer to the documentation in the `docs/` folder.
