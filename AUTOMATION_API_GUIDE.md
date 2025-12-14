# Automation Test Data API Guide

This guide explains how to use the Pramana Manager API to fetch and manage test data from your automation test frameworks (Selenium, RestAssured, Playwright, etc.).

## Base URL
```
http://localhost:8080/api/automation/test-data
```

## Authentication
All requests require JWT token authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### 1. Get All Test Data for Project

**GET** `/api/automation/test-data?projectId={projectId}&environment={environment}`

Fetch all test data for a specific project and optionally filter by environment.

**Parameters:**
- `projectId` (required): Project ID
- `environment` (optional): DEV, QA, STAGING, or PROD

**Example Request:**
```bash
curl -X GET "http://localhost:8080/api/automation/test-data?projectId=1&environment=QA" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Example Response:**
```json
[
  {
    "id": 1,
    "name": "Login Credentials",
    "description": "Valid user credentials for QA",
    "projectId": 1,
    "projectName": "INTTRA QA",
    "environment": "QA",
    "dataType": "KEY_VALUE",
    "dataContent": "{\"username\":\"testuser@example.com\",\"password\":\"Test@123\"}",
    "isActive": true
  }
]
```

---

### 2. Get Test Data by Name

**GET** `/api/automation/test-data/by-name?projectId={projectId}&name={name}&environment={environment}`

Fetch specific test data by name - useful when you know the exact data set name.

**Parameters:**
- `projectId` (required): Project ID
- `name` (required): Test data name
- `environment` (optional): Environment filter

**Example Request:**
```bash
curl -X GET "http://localhost:8080/api/automation/test-data/by-name?projectId=1&name=Login%20Credentials&environment=QA" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Example Response:**
```json
{
  "id": 1,
  "name": "Login Credentials",
  "description": "Valid user credentials for QA",
  "environment": "QA",
  "dataType": "KEY_VALUE",
  "data": "{\"username\":\"testuser@example.com\",\"password\":\"Test@123\"}"
}
```

---

### 3. Get Test Data Content

**GET** `/api/automation/test-data/{id}/content`

Get just the data content for a specific test data ID.

**Example Request:**
```bash
curl -X GET "http://localhost:8080/api/automation/test-data/1/content" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Example Response:**
```json
{
  "id": 1,
  "name": "Login Credentials",
  "environment": "QA",
  "dataType": "KEY_VALUE",
  "data": "{\"username\":\"testuser@example.com\",\"password\":\"Test@123\"}"
}
```

---

### 4. Create or Update Test Data

**POST** `/api/automation/test-data`

Create new test data or update existing one (matched by name + environment).

**Request Body:**
```json
{
  "name": "API Test Data",
  "description": "Sample API test data",
  "projectId": 1,
  "environment": "QA",
  "dataType": "JSON",
  "dataContent": "{\"apiUrl\":\"https://api.example.com\",\"apiKey\":\"abc123\"}"
}
```

**Example Request:**
```bash
curl -X POST "http://localhost:8080/api/automation/test-data" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "API Test Data",
    "description": "Sample API test data",
    "projectId": 1,
    "environment": "QA",
    "dataType": "JSON",
    "dataContent": "{\"apiUrl\":\"https://api.example.com\",\"apiKey\":\"abc123\"}"
  }'
```

---

### 5. Update Test Data Content Only

**PUT** `/api/automation/test-data/{id}/content`

Update only the data content without changing other metadata.

**Request Body:**
```json
{
  "dataContent": "{\"username\":\"newuser@example.com\",\"password\":\"NewPass@123\"}"
}
```

**Example Request:**
```bash
curl -X PUT "http://localhost:8080/api/automation/test-data/1/content" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"dataContent": "{\"username\":\"newuser@example.com\",\"password\":\"NewPass@123\"}"}'
```

---

### 6. Health Check

**GET** `/api/automation/test-data/health`

Check if the API is available.

**Example Request:**
```bash
curl -X GET "http://localhost:8080/api/automation/test-data/health" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Integration Examples

### Java (RestAssured)

```java
import io.restassured.RestAssured;
import io.restassured.response.Response;
import org.json.JSONObject;

public class TestDataFetcher {
    private static final String BASE_URL = "http://localhost:8080/api/automation/test-data";
    private static final String JWT_TOKEN = "your-jwt-token";

    public static JSONObject getLoginCredentials(long projectId, String environment) {
        Response response = RestAssured
            .given()
                .header("Authorization", "Bearer " + JWT_TOKEN)
                .queryParam("projectId", projectId)
                .queryParam("name", "Login Credentials")
                .queryParam("environment", environment)
            .when()
                .get(BASE_URL + "/by-name")
            .then()
                .statusCode(200)
                .extract()
                .response();

        String dataContent = response.jsonPath().getString("data");
        return new JSONObject(dataContent);
    }

    // Usage in test
    public void testLogin() {
        JSONObject credentials = getLoginCredentials(1, "QA");
        String username = credentials.getString("username");
        String password = credentials.getString("password");

        // Use in your Selenium test
        driver.findElement(By.id("username")).sendKeys(username);
        driver.findElement(By.id("password")).sendKeys(password);
    }
}
```

### Python (Requests)

```python
import requests
import json

class TestDataClient:
    def __init__(self, base_url, jwt_token):
        self.base_url = base_url
        self.headers = {"Authorization": f"Bearer {jwt_token}"}

    def get_test_data_by_name(self, project_id, name, environment=None):
        url = f"{self.base_url}/by-name"
        params = {
            "projectId": project_id,
            "name": name
        }
        if environment:
            params["environment"] = environment

        response = requests.get(url, headers=self.headers, params=params)
        response.raise_for_status()

        data_content = response.json()["data"]
        return json.loads(data_content)

# Usage
client = TestDataClient("http://localhost:8080/api/automation/test-data", "your-jwt-token")
credentials = client.get_test_data_by_name(1, "Login Credentials", "QA")

username = credentials["username"]
password = credentials["password"]

# Use in your test
driver.find_element(By.ID, "username").send_keys(username)
driver.find_element(By.ID, "password").send_keys(password)
```

### JavaScript/TypeScript (Playwright)

```typescript
import axios from 'axios';

interface TestDataResponse {
  id: number;
  name: string;
  environment: string;
  dataType: string;
  data: string;
}

class TestDataAPI {
  private baseUrl: string;
  private token: string;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  async getTestDataByName(projectId: number, name: string, environment?: string): Promise<any> {
    const response = await axios.get<TestDataResponse>(`${this.baseUrl}/by-name`, {
      headers: { 'Authorization': `Bearer ${this.token}` },
      params: { projectId, name, environment }
    });

    return JSON.parse(response.data.data);
  }
}

// Usage in Playwright test
const testData = new TestDataAPI('http://localhost:8080/api/automation/test-data', 'your-jwt-token');

test('login test', async ({ page }) => {
  const credentials = await testData.getTestDataByName(1, 'Login Credentials', 'QA');

  await page.goto('https://example.com/login');
  await page.fill('#username', credentials.username);
  await page.fill('#password', credentials.password);
  await page.click('button[type="submit"]');
});
```

---

## Best Practices

1. **Environment-Specific Data**: Always use environment parameter to ensure correct data for each environment
2. **Caching**: Cache test data at suite level to minimize API calls
3. **Error Handling**: Always handle API errors gracefully with fallback data
4. **Security**: Store JWT tokens securely (environment variables, secret managers)
5. **Data Updates**: Update test data through API when test execution creates/modifies data
6. **Naming Convention**: Use consistent naming like "ModuleName_DataType_Environment"

---

## Error Responses

### 404 - Not Found
```json
{
  "status": "Failed",
  "errorMessage": "Test data not found: Login Credentials"
}
```

### 401 - Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

---

## Getting JWT Token

To get a JWT token for API access:

1. **Login via API:**
```bash
curl -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com", "password": "your-password"}'
```

2. **Extract token from response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "your-email@example.com",
  "role": "USER"
}
```

3. **Use the token in subsequent requests**

---

## Support

For issues or questions, contact the Pramana Manager team.
