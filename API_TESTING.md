# API Testing Guide - Pramana Manager

## Base URL
```
http://localhost:8080/api
```

---

## 📋 Table of Contents
- [Authentication APIs](#authentication-endpoints)
- [Project Management APIs](#project-management-endpoints)
- [Test Case Management APIs](#test-case-management-endpoints)
- [Test Suite Management APIs](#test-suite-management-endpoints)
- [Complete Testing Workflow](#complete-testing-workflow)
- [Enums Reference](#enums-reference)

---

## Authentication Endpoints

<details>
<summary><strong>POST /auth/register</strong> - Register New User</summary>

### Request
**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Response
**Success (200 OK):**
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

**Error (400 Bad Request):**
```json
{
  "message": "Email already exists"
}
```

### Testing
**cURL:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"johndoe","email":"john@example.com","password":"password123"}'
```

</details>

<details>
<summary><strong>POST /auth/login</strong> - User Login</summary>

### Request
**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Response
**Success (200 OK):**
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

**Error (400 Bad Request):**
```json
{
  "message": "Invalid credentials"
}
```

### Testing
**cURL:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

</details>

<details>
<summary><strong>GET /auth/me</strong> - Get Current User</summary>

### Request
**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

### Response
**Success (200 OK):**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "role": "USER"
}
```

**Error (401 Unauthorized):**
- No response body

### Testing
**cURL:**
```bash
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer <your-token>"
```

</details>

<details>
<summary><strong>POST /auth/logout</strong> - Logout User</summary>

### Request
**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

### Response
**Success (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

### Important Notes
- After logout, the token is blacklisted
- The same token **cannot be used** for subsequent requests
- Token remains blacklisted until its natural expiration (24 hours)

### Testing
**cURL:**
```bash
curl -X POST http://localhost:8080/api/auth/logout \
  -H "Authorization: Bearer <your-token>"
```

</details>

<details>
<summary><strong>POST /auth/forgot-password</strong> - Forgot Password</summary>

### Request
**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "john@example.com"
}
```

### Response
**Success (200 OK):**
```json
{
  "message": "Password reset email sent"
}
```

### Testing
**cURL:**
```bash
curl -X POST http://localhost:8080/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com"}'
```

</details>

---

## Project Management Endpoints

<details>
<summary><strong>POST /api/projects</strong> - Create Project</summary>

### Request
**Headers:**
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "My First Project",
  "description": "Test automation project for web application"
}
```

### Response
**Success (200 OK):**
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

### Testing
**cURL:**
```bash
curl -X POST http://localhost:8080/api/projects \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"My First Project","description":"Test automation project"}'
```

</details>

<details>
<summary><strong>GET /api/projects</strong> - Get All Projects</summary>

### Request
**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Query Parameters:**
- `status` (optional) - Filter by status: ACTIVE, COMPLETED, ARCHIVED

### Response
**Success (200 OK):**
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

### Testing
**cURL:**
```bash
# Get all projects
curl http://localhost:8080/api/projects \
  -H "Authorization: Bearer <your-token>"

# Filter by status
curl "http://localhost:8080/api/projects?status=ACTIVE" \
  -H "Authorization: Bearer <your-token>"
```

</details>

<details>
<summary><strong>GET /api/projects/{id}</strong> - Get Project by ID</summary>

### Request
**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

### Response
**Success (200 OK):**
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

**Error (404 Not Found):**
```json
{
  "message": "Project not found"
}
```

### Testing
**cURL:**
```bash
curl http://localhost:8080/api/projects/1 \
  -H "Authorization: Bearer <your-token>"
```

</details>

<details>
<summary><strong>PUT /api/projects/{id}</strong> - Update Project</summary>

### Request
**Headers:**
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

**Body:**
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

### Response
**Success (200 OK):**
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

### Testing
**cURL:**
```bash
curl -X PUT http://localhost:8080/api/projects/1 \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Project Name","status":"COMPLETED"}'
```

</details>

<details>
<summary><strong>DELETE /api/projects/{id}</strong> - Delete Project</summary>

### Request
**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

### Response
**Success (200 OK):**
```json
{
  "message": "Project deleted successfully"
}
```

**Error (404 Not Found):**
```json
{
  "message": "Project not found"
}
```

### Testing
**cURL:**
```bash
curl -X DELETE http://localhost:8080/api/projects/1 \
  -H "Authorization: Bearer <your-token>"
```

</details>

---

## Test Case Management Endpoints

<details>
<summary><strong>GET /api/test-cases</strong> - Get All Test Cases</summary>

### Request
**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Query Parameters (all optional):**
- `projectId` - Filter by project ID
- `suiteId` - Filter by test suite ID
- `status` - Filter by status: ACTIVE, DEPRECATED, DRAFT
- `priority` - Filter by priority: LOW, MEDIUM, HIGH, CRITICAL

### Response
**Success (200 OK):**
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

### Testing
**cURL:**
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

</details>

<details>
<summary><strong>GET /api/test-cases/{id}</strong> - Get Test Case by ID</summary>

### Request
**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

### Response
**Success (200 OK):**
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

**Error (404 Not Found):**
```json
{
  "message": "Test case not found with id: 1"
}
```

### Testing
**cURL:**
```bash
curl http://localhost:8080/api/test-cases/1 \
  -H "Authorization: Bearer <your-token>"
```

</details>

<details>
<summary><strong>POST /api/test-cases</strong> - Create Test Case</summary>

### Request
**Headers:**
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

**Body:**
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

### Response
**Success (201 Created):**
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

### Testing
**cURL:**
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

</details>

<details>
<summary><strong>PUT /api/test-cases/{id}</strong> - Update Test Case</summary>

### Request
**Headers:**
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

**Body:**
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

### Response
**Success (200 OK):**
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

### Testing
**cURL:**
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

</details>

<details>
<summary><strong>DELETE /api/test-cases/{id}</strong> - Delete Test Case</summary>

### Request
**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

### Response
**Success (204 No Content)**
- No response body

**Error (404 Not Found):**
```json
{
  "message": "Test case not found with id: 1"
}
```

### Testing
**cURL:**
```bash
curl -X DELETE http://localhost:8080/api/test-cases/1 \
  -H "Authorization: Bearer <your-token>"
```

</details>

---

## Test Suite Management Endpoints

<details>
<summary><strong>GET /api/test-suites</strong> - Get All Test Suites</summary>

### Request
**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Query Parameters:**
- `projectId` (optional) - Filter by project ID

### Response
**Success (200 OK):**
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

### Testing
**cURL:**
```bash
# Get all test suites
curl http://localhost:8080/api/test-suites \
  -H "Authorization: Bearer <your-token>"

# Filter by project
curl "http://localhost:8080/api/test-suites?projectId=1" \
  -H "Authorization: Bearer <your-token>"
```

</details>

<details>
<summary><strong>GET /api/test-suites/{id}</strong> - Get Test Suite by ID</summary>

### Request
**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

### Response
**Success (200 OK):**
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

**Error (404 Not Found):**
```json
{
  "message": "Test suite not found with id: 1"
}
```

### Testing
**cURL:**
```bash
curl http://localhost:8080/api/test-suites/1 \
  -H "Authorization: Bearer <your-token>"
```

</details>

<details>
<summary><strong>POST /api/test-suites</strong> - Create Test Suite</summary>

### Request
**Headers:**
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

**Body:**
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

### Response
**Success (201 Created):**
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

### Testing
**cURL:**
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

</details>

<details>
<summary><strong>PUT /api/test-suites/{id}</strong> - Update Test Suite</summary>

### Request
**Headers:**
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Updated Suite Name",
  "description": "Updated suite description"
}
```

### Response
**Success (200 OK):**
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

### Testing
**cURL:**
```bash
curl -X PUT http://localhost:8080/api/test-suites/1 \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Suite Name",
    "description": "Updated description"
  }'
```

</details>

<details>
<summary><strong>DELETE /api/test-suites/{id}</strong> - Delete Test Suite</summary>

### Request
**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

### Response
**Success (204 No Content)**
- No response body

**Error (404 Not Found):**
```json
{
  "message": "Test suite not found with id: 1"
}
```

### Testing
**cURL:**
```bash
curl -X DELETE http://localhost:8080/api/test-suites/1 \
  -H "Authorization: Bearer <your-token>"
```

</details>

---

## Complete Testing Workflow

### Test Case Management Flow

1. **Register/Login**
   ```bash
   POST /api/auth/register  # or
   POST /api/auth/login
   # Save the token from response
   ```

2. **Create a project**
   ```bash
   POST /api/projects
   Body: { "name": "My Project", "description": "..." }
   ```

3. **Create a test suite**
   ```bash
   POST /api/test-suites
   Body: { "name": "Auth Tests", "projectId": 1 }
   ```

4. **Create test cases**
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

5. **List test cases by project**
   ```bash
   GET /api/test-cases?projectId=1
   ```

6. **Filter test cases**
   ```bash
   GET /api/test-cases?projectId=1&status=ACTIVE&priority=HIGH
   ```

7. **Update test case**
   ```bash
   PUT /api/test-cases/1
   Body: { "status": "DEPRECATED", ... }
   ```

8. **Delete test case**
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

### Project Status
- `ACTIVE` - Active project
- `COMPLETED` - Completed project
- `ARCHIVED` - Archived project

---

## Additional Resources

### H2 Database Console
**URL:** http://localhost:8080/h2-console

**Settings:**
- JDBC URL: `jdbc:h2:mem:pramana`
- Username: `sa`
- Password: (leave empty)

### Common Issues

#### CORS Error
**Problem:** Browser blocks request
**Solution:** Backend already configured for `http://localhost:5173`

#### 401 Unauthorized
**Problem:** Token invalid or missing
**Solution:**
- Check token format: `Bearer <token>`
- Verify token not expired (24 hours)
- Re-login to get new token

#### 400 Bad Request
**Problem:** Invalid request data
**Solution:**
- Check JSON format
- Verify all required fields present
- Check email format valid

---

**Last Updated:** Phase 4 - Test Case Management Complete
**Version:** 2.0.0
