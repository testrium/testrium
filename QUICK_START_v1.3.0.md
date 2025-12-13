# Pramana Manager v1.3.0 - Quick Start Guide

## 🚀 Starting the Application

### Backend
```bash
cd backend
java -jar target/pramana-manager-1.3.0.jar
```
Backend will start on: `http://localhost:8080`

### Frontend
```bash
npm run dev
```
Frontend will start on: `http://localhost:5173`

---

## 📖 User Guide

### Managing Applications

#### Creating an Application

1. Navigate to **Applications** from the main menu
2. Click **New Application** button (visible to ADMIN and LEAD users)
3. Fill in the form:
   - **Project:** Select the parent project
   - **Name:** Application name (e.g., "Booking", "Delphi")
   - **Status:** ACTIVE or ARCHIVED
   - **Description:** Optional description
4. Click **Create**

#### Editing an Application

1. Go to **Applications** page
2. Click the **Edit** icon on the application card
3. Update the fields
4. Click **Update**

#### Archiving an Application

1. Go to **Applications** page
2. Click the **Delete** icon on the application card
3. Confirm the action
4. Application status will change to ARCHIVED

---

### Creating Test Suites with Applications

#### New Test Suite

1. Navigate to **Test Suites**
2. Click **New Test Suite**
3. Fill in the form:
   - **Project:** Select project (required)
   - **Application:** Select application (required) - filters based on project
   - **Name:** Suite name (e.g., "Create Booking")
   - **Description:** Optional description
4. Click **Create**

#### Important Notes

- Application dropdown will only show applications from the selected project
- Application field is **required** for all new test suites
- Existing test suites without applications will continue to display normally

---

## 👥 User Roles & Permissions

### ADMIN Users
- ✅ Manage all applications across all projects
- ✅ Create, edit, delete applications
- ✅ Full access to all features

### LEAD Users
- ✅ Manage applications in projects where they are LEAD
- ✅ Create, edit, delete applications in assigned projects
- ✅ Full access within their projects

### Regular Users (MEMBER)
- ✅ View applications in assigned projects
- ❌ Cannot create or modify applications
- ✅ Can use applications when creating test suites

---

## 🗂️ Data Hierarchy

```
Project (INTTRA QA)
  │
  ├── Application (Booking)
  │     │
  │     ├── Suite (Create Booking)
  │     │     └── Test Case 1, Test Case 2, ...
  │     │
  │     └── Suite (Search Booking)
  │           └── Test Case 1, Test Case 2, ...
  │
  └── Application (Delphi)
        │
        └── Suite (User Management)
              └── Test Case 1, Test Case 2, ...
```

---

## 🔄 Common Workflows

### Workflow 1: Setting Up a New Project

1. **Create Project** (Projects page)
2. **Add Team Members** (Project Members)
3. **Create Applications** (Applications page)
   - Example: Booking, Delphi, eVGM
4. **Create Test Suites** (Test Suites page)
   - Assign to appropriate applications
5. **Add Test Cases** (Test Cases page)
   - Link to test suites

### Workflow 2: Running Tests

1. Navigate to **Test Execution**
2. Select **Project** and **Suite**
3. Click **Start Execution**
4. Update test case statuses (PASS/FAIL/BLOCKED/SKIPPED)
5. Add execution notes
6. View results in Dashboard

### Workflow 3: Generating Reports

1. Go to **Dashboard** or **Reporting**
2. Select date range and filters
3. Choose export format (PDF/Excel)
4. Download report

---

## 🔍 Finding Things

### Finding Applications
- **By Project:** Use Applications page with project filter
- **Active Only:** Filter by status = ACTIVE
- **All Applications:** View all including archived

### Finding Test Suites
- **By Project:** Select project in dropdown
- **By Application:** Suites show their application name
- **By Status:** Filter by suite status

### Finding Test Cases
- **By Suite:** Select suite in Test Cases page
- **By Type:** Filter by test type (Functional, Integration, etc.)
- **By Status:** Filter by ACTIVE, DEPRECATED, DRAFT

---

## 💡 Tips & Best Practices

### Application Naming
- Use clear, descriptive names (e.g., "Booking System" not "App1")
- Match actual product/module names
- Keep names concise but meaningful

### Suite Organization
- Group related test cases together
- Use descriptive suite names (e.g., "User Login Flow")
- Assign suites to the correct application

### Test Case Management
- Mark automation status when creating tests
- Flag regression tests appropriately
- Keep test descriptions clear and up-to-date

---

## 🐛 Troubleshooting

### Applications Not Loading
1. Check backend is running on port 8080
2. Verify user has proper permissions
3. Check browser console for errors
4. Restart backend if needed

### Cannot Create Application
1. Verify you're an ADMIN or LEAD user
2. Check that project exists
3. Ensure all required fields are filled
4. Check backend logs for errors

### Test Suite Missing Application Dropdown
1. Verify applications exist for the selected project
2. Check that applications are ACTIVE status
3. Refresh the page

### Legacy Test Suites
- Existing suites without applications will display normally
- Edit them to assign an application
- Application field becomes required on update

---

## 📊 Dashboard Overview

### Summary Cards
- **Total Applications:** Count of all applications
- **Active Applications:** Count of active applications only
- **Total Test Suites:** All test suites
- **Total Test Cases:** All test cases

### Charts (Coming Soon in v1.4+)
- Application-wise test distribution
- Automation coverage percentage
- Regression coverage metrics
- Test execution trends

---

## 🔐 Security Notes

### Authentication
- JWT-based authentication
- Tokens expire after session timeout
- Re-login required after expiration

### Access Control
- Role-based permissions enforced on backend
- UI elements hidden based on permissions
- API calls validate user permissions

---

## 📞 Getting Help

### Documentation Files
- `IMPLEMENTATION_STATUS.md` - Current implementation status
- `RELEASE_NOTES_v1.3.0.md` - Detailed release notes
- This file - Quick start guide

### Common Issues
1. **Port already in use:** Stop other services on port 8080 or 5173
2. **Database errors:** Delete `backend/data/pramana.mv.db` to reset (loses data)
3. **Build errors:** Run `mvn clean install` in backend, `npm install` in frontend

---

## 🎯 Next Steps

After getting familiar with v1.3.0:

1. **Explore Phase 3 (Coming Soon):**
   - Test case automation flags
   - Enhanced filtering

2. **Prepare for Phase 4 (Planned):**
   - Automatic metrics calculation
   - Coverage reports

3. **Provide Feedback:**
   - Share your experience
   - Suggest improvements
   - Report issues

---

**Happy Testing! 🚀**
