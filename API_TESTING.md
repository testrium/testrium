# API Testing Guide - Pramana Manager

## Base URL
```
http://localhost:8080/api
```

---

## Authentication Endpoints

### 1. Register New User

**Endpoint:** `POST /auth/register`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "role": "USER"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "message": "Email already exists"
}
```
or
```json
{
  "message": "Username already exists"
}
```

**Testing with cURL:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"johndoe\",\"email\":\"john@example.com\",\"password\":\"password123\"}"
```

**Testing with Postman:**
1. Create new request: POST
2. URL: `http://localhost:8080/api/auth/register`
3. Headers: `Content-Type: application/json`
4. Body → raw → JSON
5. Paste request body
6. Click Send

---

### 2. Login

**Endpoint:** `POST /auth/login`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "role": "USER"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "message": "Invalid credentials"
}
```

**Testing with cURL:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"john@example.com\",\"password\":\"password123\"}"
```

**Testing with Postman:**
1. Create new request: POST
2. URL: `http://localhost:8080/api/auth/login`
3. Headers: `Content-Type: application/json`
4. Body → raw → JSON
5. Paste request body
6. Click Send
7. **Save the token** from response for next requests

---

### 3. Get Current User

**Endpoint:** `GET /auth/me`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Request Body:** None

**Success Response (200 OK):**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "role": "USER"
}
```

**Error Response (401 Unauthorized):**
- No response body, just 401 status

**Testing with cURL:**
```bash
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Testing with Postman:**
1. Create new request: GET
2. URL: `http://localhost:8080/api/auth/me`
3. Headers: `Authorization: Bearer <paste-your-token-here>`
4. Click Send

---

### 4. Logout

**Endpoint:** `POST /auth/logout`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Request Body:** None

**Success Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

**Important Notes:**
- After logout, the token is added to a blacklist
- The same token **cannot be used** for subsequent requests
- Using the token after logout will return **401 Unauthorized**
- The token remains blacklisted until its natural expiration (24 hours)

**Testing with cURL:**
```bash
curl -X POST http://localhost:8080/api/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Testing with Postman:**
1. Create new request: POST
2. URL: `http://localhost:8080/api/auth/logout`
3. Headers: `Authorization: Bearer <paste-your-token-here>`
4. Click Send
5. **Test:** Try using the same token for `/auth/me` - should get 401

---

### 5. Forgot Password

**Endpoint:** `POST /auth/forgot-password`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Success Response (200 OK):**
```json
{
  "message": "Password reset email sent"
}
```

**Testing with cURL:**
```bash
curl -X POST http://localhost:8080/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"john@example.com\"}"
```

**Testing with Postman:**
1. Create new request: POST
2. URL: `http://localhost:8080/api/auth/forgot-password`
3. Headers: `Content-Type: application/json`
4. Body → raw → JSON
5. Paste request body
6. Click Send

---

## Testing Workflow

### Complete Flow Test

1. **Register a new user**
   ```bash
   POST /auth/register
   ```
   - Save the returned token

2. **Login with credentials**
   ```bash
   POST /auth/login
   ```
   - Verify you get the same user data
   - Save the new token

3. **Get current user info**
   ```bash
   GET /auth/me
   Headers: Authorization: Bearer <token>
   ```
   - Verify user data matches

4. **Test protected endpoint without token**
   ```bash
   GET /auth/me
   (no Authorization header)
   ```
   - Should return 401 Unauthorized

5. **Logout**
   ```bash
   POST /auth/logout
   Headers: Authorization: Bearer <token>
   ```
   - Should return success message
   - Token is now blacklisted

6. **Test blacklisted token**
   ```bash
   GET /auth/me
   Headers: Authorization: Bearer <same-token>
   ```
   - Should return 401 Unauthorized
   - Token no longer works after logout

7. **Try forgot password**
   ```bash
   POST /auth/forgot-password
   ```
   - Should return success message

---

## Postman Collection Setup

### Environment Variables
Create environment with:
- `baseUrl`: `http://localhost:8080/api`
- `token`: (will be set automatically from login response)

### Collection Structure
```
Pramana Manager
├── Auth
│   ├── Register
│   ├── Login
│   ├── Get Current User
│   ├── Logout
│   └── Forgot Password
```

### Auto-save Token Script
In Login request, add to **Tests** tab:
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("token", jsonData.token);
}
```

Then in other requests, use:
```
Authorization: Bearer {{token}}
```

---

## Common Issues

### CORS Error
**Problem:** Browser blocks request
**Solution:** Backend already configured for `http://localhost:5173`

### 401 Unauthorized
**Problem:** Token invalid or missing
**Solution:**
- Check token format: `Bearer <token>`
- Verify token not expired (24 hours)
- Re-login to get new token

### 400 Bad Request
**Problem:** Invalid request data
**Solution:**
- Check JSON format
- Verify all required fields present
- Check email format valid

---

## Database Access

### H2 Console
**URL:** http://localhost:8080/h2-console

**Settings:**
- JDBC URL: `jdbc:h2:mem:pramana`
- Username: `sa`
- Password: (leave empty)

**Query Users:**
```sql
SELECT * FROM USERS;
```

---

## Notes

- All responses are JSON
- Token expires after 24 hours
- **Logout invalidates token** - blacklisted tokens cannot be reused
- Database is in-memory (data lost on restart, including blacklist)
- Password minimum length: 6 characters (frontend validation)
- Email must be unique
- Username must be unique

---

## Project Management Endpoints

### 1. Create Project

**Endpoint:** `POST /api/projects`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "My First Project",
  "description": "Test automation project for web application"
}
```

**Success Response (200 OK):**
```json
{
  "id": 1,
  "name": "My First Project",
  "description": "Test automation project for web application",
  "status": "ACTIVE",
  "userId": 1,
  "username": "testuser",
  "createdAt": "2025-11-09T18:04:49.462217",
  "updatedAt": "2025-11-09T18:04:49.462217"
}
```

**Error Response (401 Unauthorized):**
- No/invalid token provided

**Testing with cURL:**
```bash
curl -X POST http://localhost:8080/api/projects \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"My First Project","description":"Test automation project"}'
```

---

### 2. Get All Projects

**Endpoint:** `GET /api/projects`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Query Parameters:**
- `status` (optional) - Filter by status: ACTIVE, COMPLETED, ARCHIVED

**Success Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "My First Project",
    "description": "Test automation project for web application",
    "status": "ACTIVE",
    "userId": 1,
    "username": "testuser",
    "createdAt": "2025-11-09T18:04:49.462217",
    "updatedAt": "2025-11-09T18:04:49.462217"
  }
]
```

**Testing with cURL:**
```bash
# Get all projects
curl http://localhost:8080/api/projects \
  -H "Authorization: Bearer <your-token>"

# Get projects by status
curl "http://localhost:8080/api/projects?status=ACTIVE" \
  -H "Authorization: Bearer <your-token>"
```

---

### 3. Get Project by ID

**Endpoint:** `GET /api/projects/{id}`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Success Response (200 OK):**
```json
{
  "id": 1,
  "name": "My First Project",
  "description": "Test automation project for web application",
  "status": "ACTIVE",
  "userId": 1,
  "username": "testuser",
  "createdAt": "2025-11-09T18:04:49.462217",
  "updatedAt": "2025-11-09T18:04:49.462217"
}
```

**Error Response (404 Not Found):**
```json
{
  "message": "Project not found"
}
```

**Error Response (403 Forbidden):**
```json
{
  "message": "Access denied"
}
```

**Testing with cURL:**
```bash
curl http://localhost:8080/api/projects/1 \
  -H "Authorization: Bearer <your-token>"
```

---

### 4. Update Project

**Endpoint:** `PUT /api/projects/{id}`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Updated Project Name",
  "description": "Updated description",
  "status": "COMPLETED"
}
```

**Notes:**
- All fields are optional
- Only provided fields will be updated
- Status values: ACTIVE, COMPLETED, ARCHIVED

**Success Response (200 OK):**
```json
{
  "id": 1,
  "name": "Updated Project Name",
  "description": "Updated description",
  "status": "COMPLETED",
  "userId": 1,
  "username": "testuser",
  "createdAt": "2025-11-09T18:04:49.462217",
  "updatedAt": "2025-11-09T18:05:05.415724"
}
```

**Testing with cURL:**
```bash
curl -X PUT http://localhost:8080/api/projects/1 \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Project Name","status":"COMPLETED"}'
```

---

### 5. Delete Project

**Endpoint:** `DELETE /api/projects/{id}`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Success Response (200 OK):**
```json
{
  "message": "Project deleted successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "message": "Project not found"
}
```

**Error Response (403 Forbidden):**
```json
{
  "message": "Access denied"
}
```

**Testing with cURL:**
```bash
curl -X DELETE http://localhost:8080/api/projects/1 \
  -H "Authorization: Bearer <your-token>"
```

---

## Test Case Management Endpoints

### 1. Get All Test Cases

**Endpoint:** `GET /api/test-cases`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Query Parameters (all optional):**
- `projectId` - Filter by project ID
- `suiteId` - Filter by test suite ID
- `status` - Filter by status: ACTIVE, DEPRECATED, DRAFT
- `priority` - Filter by priority: LOW, MEDIUM, HIGH, CRITICAL

**Success Response (200 OK):**
```json
[
  {
    "id": 1,
    "title": "Login with valid credentials",
    "description": "Test user login functionality",
    "preconditions": "User account exists in the system",
    "steps": "1. Navigate to login page\n2. Enter valid email\n3. Enter valid password\n4. Click login button",
    "expectedResult": "User should be logged in and redirected to dashboard",
    "priority": "HIGH",
    "status": "ACTIVE",
    "type": "FUNCTIONAL",
    "projectId": 1,
    "projectName": "My First Project",
    "suiteId": 1,
    "suiteName": "Authentication Tests",
    "createdByUsername": "testuser",
    "updatedByUsername": null,
    "createdAt": "2025-11-10T06:00:00",
    "updatedAt": "2025-11-10T06:00:00"
  }
]
```

**Testing with cURL:**
```bash
# Get all test cases
curl http://localhost:8080/api/test-cases \
  -H "Authorization: Bearer <your-token>"

# Filter by project
curl "http://localhost:8080/api/test-cases?projectId=1" \
  -H "Authorization: Bearer <your-token>"

# Filter by multiple criteria
curl "http://localhost:8080/api/test-cases?projectId=1&status=ACTIVE&priority=HIGH" \
  -H "Authorization: Bearer <your-token>"
```

---

### 2. Get Test Case by ID

**Endpoint:** `GET /api/test-cases/{id}`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Success Response (200 OK):**
```json
{
  "id": 1,
  "title": "Login with valid credentials",
  "description": "Test user login functionality",
  "preconditions": "User account exists in the system",
  "steps": "1. Navigate to login page\n2. Enter valid email\n3. Enter valid password\n4. Click login button",
  "expectedResult": "User should be logged in and redirected to dashboard",
  "priority": "HIGH",
  "status": "ACTIVE",
  "type": "FUNCTIONAL",
  "projectId": 1,
  "projectName": "My First Project",
  "suiteId": 1,
  "suiteName": "Authentication Tests",
  "createdByUsername": "testuser",
  "updatedByUsername": null,
  "createdAt": "2025-11-10T06:00:00",
  "updatedAt": "2025-11-10T06:00:00"
}
```

**Error Response (404 Not Found):**
```json
{
  "message": "Test case not found with id: 1"
}
```

**Testing with cURL:**
```bash
curl http://localhost:8080/api/test-cases/1 \
  -H "Authorization: Bearer <your-token>"
```

---

### 3. Create Test Case

**Endpoint:** `POST /api/test-cases`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Login with valid credentials",
  "description": "Test user login functionality",
  "preconditions": "User account exists in the system",
  "steps": "1. Navigate to login page\n2. Enter valid email\n3. Enter valid password\n4. Click login button",
  "expectedResult": "User should be logged in and redirected to dashboard",
  "priority": "HIGH",
  "status": "ACTIVE",
  "type": "FUNCTIONAL",
  "projectId": 1,
  "suiteId": 1
}
```

**Field Details:**
- `title` (required) - Test case title
- `description` (optional) - Detailed description
- `preconditions` (optional) - Prerequisites before running test
- `steps` (required) - Steps to execute the test
- `expectedResult` (required) - Expected outcome
- `priority` (required) - LOW, MEDIUM, HIGH, CRITICAL
- `status` (required) - ACTIVE, DEPRECATED, DRAFT
- `type` (required) - FUNCTIONAL, INTEGRATION, REGRESSION, SMOKE, PERFORMANCE, SECURITY, UI, API
- `projectId` (required) - Project ID
- `suiteId` (optional) - Test suite ID

**Success Response (201 Created):**
```json
{
  "id": 1,
  "title": "Login with valid credentials",
  "description": "Test user login functionality",
  "preconditions": "User account exists in the system",
  "steps": "1. Navigate to login page\n2. Enter valid email\n3. Enter valid password\n4. Click login button",
  "expectedResult": "User should be logged in and redirected to dashboard",
  "priority": "HIGH",
  "status": "ACTIVE",
  "type": "FUNCTIONAL",
  "projectId": 1,
  "projectName": "My First Project",
  "suiteId": 1,
  "suiteName": "Authentication Tests",
  "createdByUsername": "testuser",
  "updatedByUsername": null,
  "createdAt": "2025-11-10T06:00:00",
  "updatedAt": "2025-11-10T06:00:00"
}
```

**Testing with cURL:**
```bash
curl -X POST http://localhost:8080/api/test-cases \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Login with valid credentials",
    "steps": "1. Open login page\n2. Enter credentials\n3. Click login",
    "expectedResult": "User logged in successfully",
    "priority": "HIGH",
    "status": "ACTIVE",
    "type": "FUNCTIONAL",
    "projectId": 1
  }'
```

---

### 4. Update Test Case

**Endpoint:** `PUT /api/test-cases/{id}`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Updated test case title",
  "description": "Updated description",
  "preconditions": "Updated preconditions",
  "steps": "Updated steps",
  "expectedResult": "Updated expected result",
  "priority": "CRITICAL",
  "status": "ACTIVE",
  "type": "REGRESSION",
  "projectId": 1,
  "suiteId": 2
}
```

**Success Response (200 OK):**
```json
{
  "id": 1,
  "title": "Updated test case title",
  "description": "Updated description",
  "preconditions": "Updated preconditions",
  "steps": "Updated steps",
  "expectedResult": "Updated expected result",
  "priority": "CRITICAL",
  "status": "ACTIVE",
  "type": "REGRESSION",
  "projectId": 1,
  "projectName": "My First Project",
  "suiteId": 2,
  "suiteName": "Regression Tests",
  "createdByUsername": "testuser",
  "updatedByUsername": "testuser",
  "createdAt": "2025-11-10T06:00:00",
  "updatedAt": "2025-11-10T06:30:00"
}
```

**Testing with cURL:**
```bash
curl -X PUT http://localhost:8080/api/test-cases/1 \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated test case",
    "steps": "New steps",
    "expectedResult": "New result",
    "priority": "CRITICAL",
    "status": "ACTIVE",
    "type": "REGRESSION",
    "projectId": 1
  }'
```

---

### 5. Delete Test Case

**Endpoint:** `DELETE /api/test-cases/{id}`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Success Response (204 No Content)**
- No response body

**Error Response (404 Not Found):**
```json
{
  "message": "Test case not found with id: 1"
}
```

**Testing with cURL:**
```bash
curl -X DELETE http://localhost:8080/api/test-cases/1 \
  -H "Authorization: Bearer <your-token>"
```

---

## Test Suite Management Endpoints

### 1. Get All Test Suites

**Endpoint:** `GET /api/test-suites`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Query Parameters:**
- `projectId` (optional) - Filter by project ID

**Success Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Authentication Tests",
    "description": "Test suite for authentication features",
    "projectId": 1,
    "projectName": "My First Project",
    "testCaseCount": 5,
    "createdByUsername": "testuser",
    "createdAt": "2025-11-10T06:00:00",
    "updatedAt": "2025-11-10T06:00:00"
  }
]
```

**Testing with cURL:**
```bash
# Get all test suites
curl http://localhost:8080/api/test-suites \
  -H "Authorization: Bearer <your-token>"

# Filter by project
curl "http://localhost:8080/api/test-suites?projectId=1" \
  -H "Authorization: Bearer <your-token>"
```

---

### 2. Get Test Suite by ID

**Endpoint:** `GET /api/test-suites/{id}`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Success Response (200 OK):**
```json
{
  "id": 1,
  "name": "Authentication Tests",
  "description": "Test suite for authentication features",
  "projectId": 1,
  "projectName": "My First Project",
  "testCaseCount": 5,
  "createdByUsername": "testuser",
  "createdAt": "2025-11-10T06:00:00",
  "updatedAt": "2025-11-10T06:00:00"
}
```

**Error Response (404 Not Found):**
```json
{
  "message": "Test suite not found with id: 1"
}
```

**Testing with cURL:**
```bash
curl http://localhost:8080/api/test-suites/1 \
  -H "Authorization: Bearer <your-token>"
```

---

### 3. Create Test Suite

**Endpoint:** `POST /api/test-suites`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Authentication Tests",
  "description": "Test suite for authentication features",
  "projectId": 1
}
```

**Field Details:**
- `name` (required) - Test suite name
- `description` (optional) - Suite description
- `projectId` (required) - Project ID

**Success Response (201 Created):**
```json
{
  "id": 1,
  "name": "Authentication Tests",
  "description": "Test suite for authentication features",
  "projectId": 1,
  "projectName": "My First Project",
  "testCaseCount": 0,
  "createdByUsername": "testuser",
  "createdAt": "2025-11-10T06:00:00",
  "updatedAt": "2025-11-10T06:00:00"
}
```

**Testing with cURL:**
```bash
curl -X POST http://localhost:8080/api/test-suites \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Authentication Tests",
    "description": "Test suite for authentication features",
    "projectId": 1
  }'
```

---

### 4. Update Test Suite

**Endpoint:** `PUT /api/test-suites/{id}`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Updated Suite Name",
  "description": "Updated suite description"
}
```

**Success Response (200 OK):**
```json
{
  "id": 1,
  "name": "Updated Suite Name",
  "description": "Updated suite description",
  "projectId": 1,
  "projectName": "My First Project",
  "testCaseCount": 5,
  "createdByUsername": "testuser",
  "createdAt": "2025-11-10T06:00:00",
  "updatedAt": "2025-11-10T06:30:00"
}
```

**Testing with cURL:**
```bash
curl -X PUT http://localhost:8080/api/test-suites/1 \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Suite Name",
    "description": "Updated description"
  }'
```

---

### 5. Delete Test Suite

**Endpoint:** `DELETE /api/test-suites/{id}`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Success Response (204 No Content)**
- No response body

**Error Response (404 Not Found):**
```json
{
  "message": "Test suite not found with id: 1"
}
```

**Testing with cURL:**
```bash
curl -X DELETE http://localhost:8080/api/test-suites/1 \
  -H "Authorization: Bearer <your-token>"
```

---

## Complete Testing Workflow

### Test Case Management Flow

1. **Create a project** (if not exists)
   ```bash
   POST /api/projects
   ```

2. **Create a test suite**
   ```bash
   POST /api/test-suites
   Body: { "name": "Auth Tests", "projectId": 1 }
   ```

3. **Create test cases**
   ```bash
   POST /api/test-cases
   Body: {
     "title": "Login test",
     "steps": "...",
     "expectedResult": "...",
     "priority": "HIGH",
     "status": "ACTIVE",
     "type": "FUNCTIONAL",
     "projectId": 1,
     "suiteId": 1
   }
   ```

4. **List test cases by project**
   ```bash
   GET /api/test-cases?projectId=1
   ```

5. **Filter test cases**
   ```bash
   GET /api/test-cases?projectId=1&status=ACTIVE&priority=HIGH
   ```

6. **Update test case**
   ```bash
   PUT /api/test-cases/1
   Body: { "status": "DEPRECATED" }
   ```

7. **Delete test case**
   ```bash
   DELETE /api/test-cases/1
   ```

---

## Enums Reference

### Test Case Priority
- `LOW` - Low priority
- `MEDIUM` - Medium priority (default)
- `HIGH` - High priority
- `CRITICAL` - Critical priority

### Test Case Status
- `ACTIVE` - Active test case (default)
- `DEPRECATED` - Deprecated test case
- `DRAFT` - Draft test case

### Test Case Type
- `FUNCTIONAL` - Functional test (default)
- `INTEGRATION` - Integration test
- `REGRESSION` - Regression test
- `SMOKE` - Smoke test
- `PERFORMANCE` - Performance test
- `SECURITY` - Security test
- `UI` - UI test
- `API` - API test

---

**Last Updated:** Phase 4 - Test Case Management Complete
**Version:** 2.0.0
