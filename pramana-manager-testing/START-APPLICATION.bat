@echo off
echo ========================================
echo   PRAMANA MANAGER v1.7.0
echo ========================================
echo.
echo Starting servers...
echo.

REM Start backend JAR
start "Pramana Backend" cmd /k "cd backend\target && java -jar pramana-manager-1.7.0.jar"

echo Waiting for backend (20 seconds)...
timeout /t 20 /nobreak > nul

REM Create admin
curl -X POST http://localhost:8080/api/admin/create-admin 2>nul

REM Start frontend
start "Pramana Frontend" cmd /k "npx serve -s dist -l 5173"

echo Waiting for frontend (10 seconds)...
timeout /t 10 /nobreak > nul

start http://localhost:5173

echo.
echo ========================================
echo Backend: http://localhost:8080
echo Frontend: http://localhost:5173
echo ========================================
echo.
echo Login: admin@pramana.com / admin123
echo.
pause
