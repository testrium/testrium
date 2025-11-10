# Admin User Setup Guide

## Overview
This guide explains how to create the initial admin user for the Pramana Manager application.

## Method 1: Using API Endpoint (Recommended)

The easiest way to create an admin user is through the provided API endpoint.

### Prerequisites
- Backend server must be running on port 8080
- Database must be accessible

### Steps

1. **Start the backend server** (if not already running):
   ```bash
   cd backend
   mvn spring-boot:run
   ```

2. **Create admin user using cURL**:
   ```bash
   curl -X POST http://localhost:8080/api/admin/create-admin
   ```

   Or using any REST client (Postman, Insomnia, etc.):
   - URL: `http://localhost:8080/api/admin/create-admin`
   - Method: `POST`
   - No request body needed

3. **Response**:
   ```json
   {
     "message": "Admin user created successfully",
     "username": "admin",
     "password": "admin123",
     "email": "admin@pramana.com",
     "warning": "Please change the password after first login"
   }
   ```

### Default Admin Credentials
- **Username**: admin
- **Email**: admin@pramana.com
- **Password**: admin123
- **Role**: ADMIN

### Login to the Application

1. **Via Web Interface**:
   - Navigate to: `http://localhost:5173/login`
   - Enter email: `admin@pramana.com`
   - Enter password: `admin123`
   - Click "Sign In"

2. **Via API**:
   ```bash
   curl -X POST http://localhost:8080/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@pramana.com","password":"admin123"}'
   ```

## Method 2: SQL Script (Alternative)

If you prefer to create the admin user directly in the database:

1. Generate a BCrypt hash for your desired password using the `PasswordHashGenerator.java` utility:
   ```bash
   cd backend
   mvn exec:java -Dexec.mainClass="com.pramana.manager.util.PasswordHashGenerator"
   ```

2. Update the SQL script at `backend/src/main/resources/create-admin.sql` with the generated hash

3. Run the SQL script against your database

## Verification

### Check if admin exists:
```bash
curl http://localhost:8080/api/admin/admin-exists
```

Response:
```json
{
  "exists": true
}
```

## Security Notes

1. The `/api/admin/create-admin` endpoint is intentionally open to allow initial setup
2. Once the admin user is created, it cannot be created again through this endpoint
3. **IMPORTANT**: Change the default password immediately after first login
4. In production, consider disabling or removing the admin creation endpoint after initial setup

## Troubleshooting

### Admin already exists
If you get an error saying "Admin user already exists", the admin user has already been created. You can either:
- Use the existing admin credentials
- Delete the admin user from the database and create a new one
- Use the H2 console at `http://localhost:8080/h2-console` to manage users directly

### Login fails
- Make sure you're using the **email** (not username) to login
- Email: `admin@pramana.com`
- Check if the backend server is running on port 8080
- Check the backend logs for any errors

### Cannot access the endpoint
- Ensure the backend server is running
- Check if port 8080 is available and not blocked by firewall
- Verify the URL is correct: `http://localhost:8080/api/admin/create-admin`

## Related Files
- [AdminController.java](backend/src/main/java/com/pramana/manager/controller/AdminController.java) - API endpoint implementation
- [SecurityConfig.java](backend/src/main/java/com/pramana/manager/config/SecurityConfig.java) - Security configuration
- [create-admin.sql](backend/src/main/resources/create-admin.sql) - SQL script alternative
- [PasswordHashGenerator.java](backend/src/main/java/com/pramana/manager/util/PasswordHashGenerator.java) - BCrypt password hash generator
