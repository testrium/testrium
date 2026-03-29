# Test Run Execution

A **Test Run** is a collection of test cases executed together in a single testing cycle.

## Creating a Test Run

1. Go to **Test Runs** in your project
2. Click **New Test Run**
3. Select the test cases to include (filter by module, type, or priority)
4. Assign to a team member (optional)
5. Start the run

## Executing Tests

Each test case in the run can be updated with:

| Field | Description |
|---|---|
| **Status** | `PASS` · `FAIL` · `BLOCKED` · `SKIPPED` · `NOT_EXECUTED` |
| **Actual Result** | What actually happened |
| **Comments** | Notes or observations |
| **Execution Time** | Minutes taken to execute |
| **Defect Reference** | Bug ID or JIRA ticket |

## Run Statuses

| Status | Description |
|---|---|
| `NOT_STARTED` | Run created but not yet begun |
| `IN_PROGRESS` | Actively being executed |
| `COMPLETED` | All test cases have been updated |

## Progress Tracking

The test run page shows real-time progress with a breakdown of pass, fail, blocked, and skipped counts.

## JIRA Integration

On any failed test execution, click **Create JIRA Issue** to file a bug directly — pre-filled with the test case details and actual result.

[JIRA Integration →](/features/jira-integration)
