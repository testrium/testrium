# Bulk Test Case Import Guide - Pramana Manager v1.8.0

## Overview
The bulk import feature allows you to import hundreds or thousands of test cases from TestRail or other test management tools using Excel or CSV files.

## Features

✅ **Multi-Format Support**: Import from Excel (.xlsx, .xls) or CSV files
✅ **Auto-Create Modules**: Automatically creates test modules (sections) if they don't exist
✅ **Duplicate Detection**: Skips test cases that already exist (by title)
✅ **Partial Success**: Imports valid rows even if some fail
✅ **Detailed Error Report**: Shows exactly which rows failed and why
✅ **Smart Field Mapping**: Intelligently maps TestRail fields to Pramana fields
✅ **TestRail Compatible**: Direct support for TestRail CSV export format

---

## Quick Start

### 1. Download Template
**API Endpoint**: `GET /api/test-cases/bulk/template`

```bash
curl -O http://localhost:8080/api/test-cases/bulk/template
```

Or visit in browser:
```
http://localhost:8080/api/test-cases/bulk/template
```

This downloads an Excel template with:
- All required and optional columns
- Sample data row
- Proper formatting

### 2. Prepare Your Data

**For TestRail Migration:**
1. Export your test suite from TestRail as CSV
2. The export will have columns: ID, Title, Automation Type, Created By, Section, Steps
3. You can use this file directly or add optional columns

**Column Mapping (TestRail → Pramana):**
| TestRail Column | Pramana Column | Required | Notes |
|----------------|----------------|----------|-------|
| ID | ID | No | Reference only, not used |
| Title | Title | **Yes** | Must be unique |
| Section | Section | No | Maps to Module, auto-created if missing |
| Steps | Steps | **Yes** | Defaults to "N/A" if empty |
| Expected Result | Expected Result | **Yes** | Defaults to "N/A" if empty |
| Automation Type | Automation Type | No | Maps to "Is Automated" flag |
| Created By | Created By | No | Info only, creator = current user |
| Priority | Priority | No | LOW/MEDIUM/HIGH/CRITICAL, defaults to MEDIUM |
| Type | Type | No | FUNCTIONAL/API/UI/etc., defaults to FUNCTIONAL |

**Additional Optional Columns:**
- Description
- Preconditions
- Is Automated (true/false)
- Is Regression (true/false)

### 3. Import Your File

**API Endpoint**: `POST /api/test-cases/bulk/import`

**Parameters:**
- `file`: Your Excel or CSV file (multipart/form-data)
- `projectId`: Target project ID (required)
- `applicationId`: Target application ID (required)

**Example using cURL:**
```bash
curl -X POST http://localhost:8080/api/test-cases/bulk/import \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@testcases.xlsx" \
  -F "projectId=1" \
  -F "applicationId=1"
```

**Example using Postman:**
1. Method: POST
2. URL: `http://localhost:8080/api/test-cases/bulk/import`
3. Headers: `Authorization: Bearer YOUR_JWT_TOKEN`
4. Body: form-data
   - Key: `file`, Type: File, Value: Select your Excel/CSV
   - Key: `projectId`, Type: Text, Value: `1`
   - Key: `applicationId`, Type: Text, Value: `1`

---

## Import Response

### Success Response:
```json
{
  "totalRows": 2000,
  "successCount": 1950,
  "failureCount": 10,
  "skippedCount": 40,
  "errors": [
    {
      "rowNumber": 15,
      "testCaseTitle": "Login Test",
      "error": "Test case with this title already exists (skipped)",
      "field": "title"
    },
    {
      "rowNumber": 102,
      "testCaseTitle": "",
      "error": "Title is required",
      "field": "title"
    }
  ],
  "createdModules": [
    "Login Module",
    "Payment Module",
    "User Management"
  ],
  "message": "Import completed: 1950 successful, 40 skipped, 10 failed. Created 3 new modules."
}
```

### Field Descriptions:
- **totalRows**: Total rows processed (excludes header)
- **successCount**: Successfully imported test cases
- **failureCount**: Failed imports due to validation errors
- **skippedCount**: Skipped due to duplicates
- **errors**: Array of detailed error information
- **createdModules**: List of new modules created during import
- **message**: Summary message

---

## Import Behavior

### 1. Module (Section) Handling
- **If module exists**: Uses existing module
- **If module doesn't exist**: Automatically creates it under the specified application
- **If no section specified**: Creates test case without a module

### 2. Duplicate Handling
- **Detection**: Based on exact title match (case-insensitive)
- **Behavior**: Skips the row and adds to skipped count
- **Report**: Listed in errors array with message

### 3. Validation Rules
**Required Fields:**
- Title (must not be blank)
- Steps (defaults to "N/A" if not provided)
- Expected Result (defaults to "N/A" if not provided)

**Field Validation:**
- Priority: Must be LOW, MEDIUM, HIGH, or CRITICAL (defaults to MEDIUM)
- Type: Must be valid TestCaseType enum (defaults to FUNCTIONAL)
- Is Automated: true/false/yes/no/1/0/automated (defaults to false)
- Is Regression: true/false/yes/no/1/0 (defaults to false)

### 4. Smart Field Mapping
**Automation Type Intelligence:**
```
"Automated" → isAutomated=true, type=FUNCTIONAL
"API Automated" → isAutomated=true, type=API
"UI Test" → type=UI
"Functional" → type=FUNCTIONAL
```

**Priority Mapping:**
```
"P0" → CRITICAL
"P1" → HIGH
"P2" → MEDIUM
"P3" → LOW
```

---

## Excel Template Format

### Header Row (Row 1):
```
ID | Title | Automation Type | Created By | Section | Steps | Description | Preconditions | Expected Result | Priority | Type | Is Automated | Is Regression
```

### Sample Data (Row 2):
```
TC001 | Sample Test Case | Automated | John Doe | Login Module | 1. Open app\n2. Enter creds\n3. Click login | Verify login | User exists | User logged in | HIGH | FUNCTIONAL | true | true
```

---

## Migrating from TestRail

### Step-by-Step Process:

**1. Export from TestRail:**
- Go to your test suite in TestRail
- Click "Export" → "Export as CSV"
- Select all test cases
- Download the CSV file

**2. (Optional) Enhance the Export:**
Add these columns to your CSV if not present:
- Expected Result
- Priority
- Description
- Preconditions

**3. Map Your Data:**
TestRail's export typically includes:
- `ID` → Keep as is
- `Title` → Keep as is
- `Section` → This becomes your Module name
- `Steps` → Keep as is
- `Automation Type` → Maps to automated flag and type

**4. Handle Special Cases:**

**Missing Application:**
Since TestRail doesn't have "Application" concept, you need to:
1. Create Application in Pramana first
2. Use that Application ID in import

**Multiple Test Suites:**
- Export each suite separately
- Import to different applications or projects
- Or combine into one file with proper section names

**Custom Fields:**
TestRail custom fields won't be imported. You can:
1. Add them to Description field before import
2. Update manually after import

### 5. Import to Pramana:
```bash
curl -X POST http://localhost:8080/api/test-cases/bulk/import \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@testrail_export.csv" \
  -F "projectId=YOUR_PROJECT_ID" \
  -F "applicationId=YOUR_APP_ID"
```

---

## Troubleshooting

### Common Issues:

**1. "File format not supported"**
- Ensure file has .xlsx, .xls, or .csv extension
- CSV must be comma-separated (not semicolon or tab)

**2. "Project not found"**
- Verify projectId exists
- Check you have access to the project

**3. "Application not found"**
- Verify applicationId exists
- Ensure application belongs to the specified project

**4. "Title is required" errors**
- Check for empty title cells
- Remove completely blank rows

**5. All rows skipped as duplicates**
- Test cases already exist in the system
- Check if you're importing to the wrong project
- Clear existing test cases if this is a re-import

**6. Modules not created**
- Verify Section column has values
- Check column name is exactly "Section" (case-insensitive)

**7. Wrong automation type mapping**
- Check "Automation Type" column values
- Use explicit "Is Automated" column for precise control

### Error Messages Explained:

| Error | Meaning | Solution |
|-------|---------|----------|
| "Title is required" | Title column is empty | Fill in the title |
| "Test case with this title already exists" | Duplicate detected | Change title or skip |
| "Project not found" | Invalid projectId | Use correct project ID |
| "Application not found" | Invalid applicationId | Use correct application ID |
| "Module not found" | (Won't occur - auto-created) | - |

---

## Best Practices

### For Large Imports (1000+ test cases):

1. **Split into batches**: Import 500-1000 rows at a time
2. **Test with small sample first**: Import 10-20 rows to verify format
3. **Review created modules**: Check auto-created modules are named correctly
4. **Check error report**: Fix issues in failed rows and re-import
5. **Verify in UI**: Spot-check imported test cases for accuracy

### Data Preparation:

1. **Clean your data**: Remove empty rows, trailing spaces
2. **Standardize values**: Use consistent Priority and Type values
3. **Unique titles**: Ensure all test case titles are unique
4. **Section names**: Use consistent naming for modules/sections
5. **Required fields**: Ensure Steps and Expected Result are populated

### Performance Tips:

- Close other applications during large imports
- Use CSV for very large files (2000+ rows) - it's faster
- Don't refresh the page during import
- Wait for the response before making changes

---

## API Reference

### Bulk Import
**Endpoint**: `POST /api/test-cases/bulk/import`

**Request:**
```
Content-Type: multipart/form-data

file: <binary>
projectId: <number>
applicationId: <number>
```

**Response**: `200 OK`
```json
{
  "totalRows": 2000,
  "successCount": 1980,
  "failureCount": 5,
  "skippedCount": 15,
  "errors": [...],
  "createdModules": [...],
  "message": "Import completed..."
}
```

### Download Template
**Endpoint**: `GET /api/test-cases/bulk/template`

**Response**: `200 OK`
```
Content-Type: application/octet-stream
Content-Disposition: attachment; filename="TestCase_Import_Template.xlsx"

<binary Excel file>
```

---

## FAQ

**Q: Can I import test cases without modules/sections?**
A: Yes, leave the Section column empty. Test cases will be created without a module.

**Q: What happens to TestRail IDs?**
A: They are ignored. Pramana generates its own IDs.

**Q: Can I update existing test cases via import?**
A: No, duplicates are skipped. Delete existing ones first if you want to re-import.

**Q: Can I import test executions or results?**
A: No, only test case definitions. Executions must be created separately.

**Q: Can I import attachments or custom fields?**
A: No, import is for basic test case data only.

**Q: How do I handle test cases in multiple languages?**
A: The import supports UTF-8, so any language is fine.

**Q: Can I schedule automatic imports?**
A: Not currently. Use the API endpoint in your own automation script.

**Q: What's the maximum file size?**
A: Default Spring Boot limit is 1MB. Contact admin to increase if needed.

**Q: Can I import to multiple projects at once?**
A: No, import is per project. Run separate imports for each project.

---

## Version History

**v1.8.0** (Current)
- Initial release of bulk import feature
- Support for Excel and CSV formats
- Auto-create modules
- Duplicate detection
- Partial success imports
- TestRail compatibility

---

## Support

For issues or questions:
1. Check this guide first
2. Review error messages in import response
3. Test with template file
4. Contact your Pramana Manager administrator
