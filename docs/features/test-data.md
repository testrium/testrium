# Test Data Management

Store and manage test data centrally — accessible from the UI and from automation frameworks via API.

## Why Centralized Test Data?

When test data is scattered across scripts, spreadsheets, and config files it becomes a maintenance problem. Testrium gives you one place to define, update, and retrieve test data per environment.

## Data Types

| Type | Use Case |
|---|---|
| `KEY_VALUE` | Simple credential pairs, config values |
| `JSON` | Structured request payloads, user profiles |
| `CSV` | Data-driven test inputs |
| `XML` | Legacy system test data |

## Environments

Each test data entry is tagged to an environment:

`DEV` · `QA` · `STAGING` · `PROD`

This means you can store the same logical data (e.g. "Login Credentials") with different values for each environment — and your automation scripts just pass the environment name at runtime.

## Using Test Data in Automation

Fetch test data from your automation framework using the API:

```bash
GET /api/automation/test-data/by-name?projectId=1&name=Login+Credentials&environment=QA
Authorization: Bearer <your-jwt-token>
```

Response:
```json
{
  "id": 1,
  "name": "Login Credentials",
  "environment": "QA",
  "dataType": "KEY_VALUE",
  "data": "{\"username\":\"testuser@example.com\",\"password\":\"Test@123\"}"
}
```

[Full API Reference →](/api/)
