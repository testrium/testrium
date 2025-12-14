# Pramana Manager Testing v1.7.0

Quick testing setup for different systems

## Quick Start (Windows)

1. **Build Latest Code**
   ```cmd
   BUILD-AND-DEPLOY.bat
   ```

2. **Start Application**
   ```cmd
   START-APPLICATION.bat
   ```

3. **Access Application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:8080
   - Login: `admin@pramana.com` / `admin123`

## Files

- `BUILD-AND-DEPLOY.bat` - Build and copy latest files
- `START-APPLICATION.bat` - Start backend + frontend
- `STOP-APPLICATION.bat` - Stop all services
- `application-test.properties` - Test DB config
- `test-config.json` - Environment settings
- `backend/target/` - Backend JAR
- `dist/` - Frontend build

## Database Setup

The application will auto-create tables. Just ensure MySQL is running:
```cmd
net start MySQL80
```

## Troubleshooting

**Dashboard not loading?**
1. Run `BUILD-AND-DEPLOY.bat` to get latest code
2. Clear browser cache (Ctrl+Shift+Delete)
3. Check backend is running on port 8080

**Port already in use?**
```cmd
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```
