# Pramana Manager - Testing Instructions

## Prerequisites (One-time Setup)

Before running the application for the first time, you need to install:

### 1. Java Development Kit (JDK)
- Download JDK 17 or higher from: https://www.oracle.com/java/technologies/downloads/
- Install and verify by running: `java -version` in command prompt

### 2. Apache Maven
- Download from: https://maven.apache.org/download.cgi
- Extract and add to PATH
- Verify by running: `mvn -version` in command prompt

### 3. Node.js
- Download from: https://nodejs.org/ (LTS version)
- Install and verify by running: `node -v` in command prompt

### 4. Install Dependencies (First Time Only)
1. Open command prompt in the application folder
2. Run: `npm install`

## Running the Application

### Quick Start (Easiest Method)
1. **Double-click** `START-APPLICATION.bat`
2. Wait for the application to open in your browser automatically
3. Login with credentials:
   - **Admin**: admin@pramana.com / admin123
   - **User**: saddam@pramana.com / saddam123

### Stopping the Application
- **Double-click** `STOP-APPLICATION.bat`
- OR close both terminal windows manually

## Manual Start (Alternative)

If the quick start doesn't work:

1. **Start Backend:**
   - Double-click `start-backend.bat`
   - Wait until you see "Started PramanaManagerApplication"

2. **Start Frontend:**
   - Double-click `start-frontend.bat`
   - Wait until you see "Local: http://localhost:5173/"

3. **Open Browser:**
   - Go to: http://localhost:5173

## Test Credentials

### Admin Account
- Email: `admin@pramana.com`
- Password: `admin123`
- Access: Full access to all features

### Regular User Accounts
- Email: `saddam@pramana.com`
- Password: `saddam123`

- Email: `user1@pramana.com`
- Password: `user123`

## Features to Test

### 1. Dashboard
- View projects
- Create new projects (Admin only)
- Manage project members

### 2. Test Cases
- Create test cases
- Edit and delete test cases
- Filter by project, suite, status, priority
- Group by test suite

### 3. Test Suites
- Create test suites
- Organize test cases
- Filter and search

### 4. Test Runs (NEW)
- Create test run
- Select test cases to execute
- Track execution progress
- Record pass/fail results

## Troubleshooting

### Port Already in Use
If you see "port already in use" error:
1. Run `STOP-APPLICATION.bat`
2. Wait 10 seconds
3. Try `START-APPLICATION.bat` again

### Backend Won't Start
- Make sure Java is installed: `java -version`
- Make sure Maven is installed: `mvn -version`

### Frontend Won't Start
- Make sure Node.js is installed: `node -v`
- Run `npm install` in the application folder

### Application Opens But Shows Error
- Check that both backend and frontend terminals are running
- Backend should show "Started PramanaManagerApplication"
- Frontend should show "Local: http://localhost:5173/"

## Known Issues

- First startup might take 1-2 minutes while Maven downloads dependencies
- If the browser opens too early, just refresh the page after 30 seconds

## Support

For issues or questions, contact: [Your Contact Info]
