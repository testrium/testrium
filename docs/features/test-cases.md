# Test Case Management

The foundation of Testrium — create and manage test cases with all the details your team needs.

## Creating Test Cases

Each test case supports:

| Field | Options |
|---|---|
| **Title** | Free text |
| **Description** | Detailed description |
| **Preconditions** | Setup steps required before testing |
| **Steps** | Step-by-step test instructions |
| **Expected Result** | What should happen |
| **Priority** | `LOW` · `MEDIUM` · `HIGH` · `CRITICAL` |
| **Type** | `FUNCTIONAL` · `INTEGRATION` · `REGRESSION` · `SMOKE` · `PERFORMANCE` · `SECURITY` · `UI` · `API` |
| **Status** | `ACTIVE` · `DRAFT` · `DEPRECATED` |
| **Is Automated** | Flag for automated test cases |
| **Is Regression** | Flag for regression suite |

## Organization

Test cases belong to a **Project** and can be assigned to a **Module** within an **Application**. This gives you a clean hierarchy:

```
Project
└── Application
    └── Module
        └── Test Cases
```

## Bulk Import

Import test cases in bulk from Excel (`.xlsx`) or CSV files.

1. Download the template from the Test Cases page
2. Fill in your test cases
3. Upload the file — Testrium validates and imports all rows
4. Review the import report (success count, failures with reasons)

## Search & Filter

Filter test cases by:
- Project / Module / Application
- Priority
- Type
- Status
- Automation flag
