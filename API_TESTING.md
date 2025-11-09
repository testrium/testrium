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

## Future Endpoints (Phase 3+)

### Test Cases (Coming Soon)
- `GET /projects/:id/testcases` - List test cases
- `POST /projects/:id/testcases` - Create test case
- `GET /testcases/:id` - Get test case details
- `PUT /testcases/:id` - Update test case
- `DELETE /testcases/:id` - Delete test case

---

**Last Updated:** Phase 2 - Project Management Complete
**Version:** 1.1.0
