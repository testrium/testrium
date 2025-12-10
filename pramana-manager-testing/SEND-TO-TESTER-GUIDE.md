# How to Send Application to Your Friend for Testing

## Option 1: Quick Package (Recommended)

### Step 1: Create Package
1. **Double-click** `PACKAGE-FOR-TESTING.bat`
2. Wait for it to complete
3. You'll see a new folder: `pramana-manager-testing`

### Step 2: Compress and Send
1. Right-click on `pramana-manager-testing` folder
2. Select "Send to" → "Compressed (zipped) folder"
3. Send the ZIP file to your friend via:
   - Email (if under 25MB)
   - Google Drive / OneDrive / Dropbox
   - WeTransfer (for large files)
   - USB drive

### Step 3: Instructions for Your Friend

Tell them to:

1. **Extract the ZIP file** to any folder
2. **Run `SETUP.bat`** (FIRST TIME ONLY)
   - This checks prerequisites and installs dependencies
   - Takes 5-10 minutes
3. **Run `START-APPLICATION.bat`**
   - This starts everything automatically
   - Browser opens automatically
4. **Login with:**
   - Email: `admin@pramana.com`
   - Password: `admin123`

5. **When done testing:**
   - Run `STOP-APPLICATION.bat`

---

## Option 2: Git Repository (If Friend Has Git)

### Step 1: Push to Private Repository
```bash
git add .
git commit -m "Testing version"
git push
```

### Step 2: Share Repository
- Make repository private on GitHub/GitLab
- Add your friend as collaborator

### Step 3: Instructions for Friend
```bash
git clone [repository-url]
cd pramana-manager
SETUP.bat
START-APPLICATION.bat
```

---

## Option 3: Cloud Drive Link

### Step 1: Create Package
1. Run `PACKAGE-FOR-TESTING.bat`
2. Compress the folder

### Step 2: Upload to Cloud
- Upload ZIP to Google Drive / OneDrive / Dropbox
- Get shareable link
- Send link to your friend

---

## What Your Friend Needs (Prerequisites)

They need to install these (one-time setup):

### 1. Java JDK 17+
- Download: https://www.oracle.com/java/technologies/downloads/
- Install and add to PATH

### 2. Apache Maven
- Download: https://maven.apache.org/download.cgi
- Extract and add to PATH

### 3. Node.js (LTS)
- Download: https://nodejs.org/
- Install with npm

> **NOTE:** The `SETUP.bat` script will check for these and show instructions if missing!

---

## Testing Checklist for Your Friend

Send this checklist to your friend:

- [ ] Extract the ZIP file
- [ ] Run `SETUP.bat` (first time only)
- [ ] Run `START-APPLICATION.bat`
- [ ] Login with admin@pramana.com / admin123
- [ ] Test creating a project
- [ ] Test creating test cases
- [ ] Test creating test suites
- [ ] Test creating test runs
- [ ] Test executing tests
- [ ] Test with regular user: saddam@pramana.com / saddam123
- [ ] Run `STOP-APPLICATION.bat` when done

---

## File Size Estimates

- **With node_modules**: ~500MB (too large for email)
- **Without node_modules** (after SETUP.bat): ~50MB
- **Source code only**: ~5-10MB

> The `PACKAGE-FOR-TESTING.bat` creates a package WITHOUT node_modules and backend/target folders. These get downloaded when friend runs `SETUP.bat`.

---

## Security Notes

✅ **Included in package:**
- Source code
- Configuration files
- Batch scripts
- Instructions

❌ **NOT included (for security):**
- node_modules (gets downloaded)
- backend/target (gets built)
- .env files (if any)
- Database data (starts fresh)

---

## Troubleshooting for Tester

### "Java is not installed"
- Install JDK 17+ from Oracle website
- Restart command prompt after installation

### "Maven is not installed"
- Install Maven and add to PATH
- Restart command prompt

### "Port 8080 already in use"
- Run `STOP-APPLICATION.bat`
- Check Task Manager and kill any Java processes
- Try again

### "Application won't start"
1. Check both terminal windows are running
2. Wait 2-3 minutes on first start
3. Refresh browser if opened too early

---

## Quick Command Reference

```bash
# For You (Preparing Package)
PACKAGE-FOR-TESTING.bat

# For Your Friend (Testing)
SETUP.bat                # First time only
START-APPLICATION.bat    # Start app
STOP-APPLICATION.bat     # Stop app
```

---

## What Gets Sent vs What Gets Downloaded

### Sent in ZIP:
- Application source code (~10MB)
- Batch scripts
- Configuration files

### Downloaded During SETUP:
- Maven dependencies (~100MB)
- Node modules (~400MB)
- Build tools

This keeps the ZIP file small and manageable for sending!
