@echo off
echo ========================================
echo   Stopping Pramana Manager
echo ========================================
echo.

REM Kill Java processes (Backend)
echo Stopping backend...
taskkill /F /FI "WINDOWTITLE eq Pramana Backend*" 2>nul
powershell "Get-Process java -ErrorAction SilentlyContinue | Where-Object {$_.MainWindowTitle -like '*Pramana*'} | Stop-Process -Force" 2>nul

REM Kill Node processes (Frontend)
echo Stopping frontend...
taskkill /F /FI "WINDOWTITLE eq Pramana Frontend*" 2>nul

echo.
echo ========================================
echo Application stopped successfully!
echo ========================================
pause
