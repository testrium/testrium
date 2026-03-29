# JIRA Integration

File bugs directly from failed test executions without leaving Testrium.

## Setup

1. Go to your **Project Settings**
2. Open the **JIRA Configuration** tab
3. Enter your JIRA details:

| Field | Description |
|---|---|
| **JIRA URL** | `https://your-domain.atlassian.net` |
| **Project Key** | e.g. `QA`, `BUG` |
| **Username** | Your JIRA account email |
| **API Token** | Generate at [id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens) |
| **Default Issue Type** | e.g. `Bug`, `Task` |

::: tip API Token Security
JIRA API tokens are encrypted with AES-128 before being stored in the database. The encryption key is configurable via the `JIRA_ENCRYPTION_KEY` environment variable.
:::

## Creating a Bug

1. In a test run, find a **FAIL** execution
2. Click **Create JIRA Issue**
3. The issue is pre-filled with:
   - Test case title as the summary
   - Steps to reproduce
   - Actual result
   - Environment info
4. Confirm and the issue is created in your JIRA project

The JIRA ticket ID is saved back to the test execution as a **Defect Reference**.

## Per-Project Configuration

Each project in Testrium can have its own JIRA configuration, pointing to different JIRA projects or instances.
