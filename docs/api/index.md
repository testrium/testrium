# Automation API

Testrium exposes REST endpoints designed for integration with automation frameworks like Selenium, RestAssured, Playwright, and Cypress.

## Authentication

All API calls require a JWT token. Get one by logging in:

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@testrium.com",
  "password": "Admin@123"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": { "id": 1, "email": "admin@testrium.com", "role": "ADMIN" }
}
```

Use the token in all subsequent requests:
```
Authorization: Bearer <token>
```

---

## Fetch Test Data

Retrieve test data by name and environment — use this in your test setup to avoid hardcoding credentials or config.

```
GET /api/automation/test-data/by-name?projectId={id}&name={name}&environment={env}
```

**Parameters:**

| Parameter | Required | Description |
|---|---|---|
| `projectId` | Yes | Project ID |
| `name` | Yes | Test data name |
| `environment` | Yes | `DEV`, `QA`, `STAGING`, or `PROD` |

**Example:**
```bash
curl "http://localhost:8080/api/automation/test-data/by-name?projectId=1&name=Login+Credentials&environment=QA" \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "id": 1,
  "name": "Login Credentials",
  "environment": "QA",
  "dataType": "KEY_VALUE",
  "data": "{\"username\":\"testuser@qa.com\",\"password\":\"Test@123\"}"
}
```

---

## Update Test Execution

Post a test result back to Testrium from your automation framework.

```
PUT /api/test-executions/{id}
Content-Type: application/json

{
  "status": "PASS",
  "actualResult": "Login successful, redirected to dashboard",
  "comments": "Executed by Selenium Grid",
  "executionTimeMinutes": 2
}
```

**Status values:** `PASS` · `FAIL` · `BLOCKED` · `SKIPPED` · `NOT_EXECUTED`

---

## Bulk Update Executions

Update multiple test executions in one call.

```
POST /api/test-executions/bulk-update
Content-Type: application/json

{
  "executionIds": [101, 102, 103],
  "status": "PASS",
  "comments": "Automated regression run passed"
}
```

---

## Java / RestAssured Example

```java
// Fetch test data
Response response = given()
    .header("Authorization", "Bearer " + token)
    .queryParam("projectId", 1)
    .queryParam("name", "Login Credentials")
    .queryParam("environment", "QA")
    .get("http://localhost:8080/api/automation/test-data/by-name");

String data = response.jsonPath().getString("data");
Map<String, String> credentials = new ObjectMapper().readValue(data, Map.class);

// Post result
given()
    .header("Authorization", "Bearer " + token)
    .contentType(ContentType.JSON)
    .body(Map.of("status", "PASS", "actualResult", "Login successful"))
    .put("http://localhost:8080/api/test-executions/101");
```
