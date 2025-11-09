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

## Future Endpoints (Phase 2+)

### Projects (Coming Soon)
- `GET /projects` - List all projects
- `POST /projects` - Create project
- `GET /projects/:id` - Get project details
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project

### Test Cases (Coming Soon)
- `GET /projects/:id/testcases` - List test cases
- `POST /projects/:id/testcases` - Create test case
- `GET /testcases/:id` - Get test case details
- `PUT /testcases/:id` - Update test case
- `DELETE /testcases/:id` - Delete test case

---

**Last Updated:** Phase 1 - Authentication Complete
**Version:** 1.0.0
