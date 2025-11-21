@echo off
echo ========================================
echo   PRAMANA MANAGER - Test Application
echo ========================================
echo.
echo Starting servers, please wait...
echo.

REM Start backend in a new window
start "Pramana Backend" cmd /k "cd backend && mvn spring-boot:run"

REM Wait for backend to start
echo Waiting for backend to start (15 seconds)...
timeout /t 15 /nobreak > nul

REM Create admin user
echo Creating admin user...
curl -X POST http://localhost:8080/api/admin/create-admin 2>nul

REM Start frontend in a new window
start "Pramana Frontend" cmd /k "npm run dev"

REM Wait for frontend to start
echo Waiting for frontend to start (10 seconds)...
timeout /t 10 /nobreak > nul

REM Open browser
echo Opening application in browser...
start http://localhost:5173

echo.
echo ========================================
echo Application is starting!
echo Backend: http://localhost:8080
echo Frontend: http://localhost:5173
echo ========================================
echo.
echo IMPORTANT: Do NOT close the terminal windows!
echo Press any key to exit this launcher...
pause > nul
