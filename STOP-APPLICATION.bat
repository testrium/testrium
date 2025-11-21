@echo off
echo ========================================
echo   Stopping Pramana Manager
echo ========================================
echo.

REM Kill all Java processes
echo Stopping all Java processes...
taskkill /F /IM java.exe 2>nul

REM Kill all Node processes
echo Stopping all Node processes...
taskkill /F /IM node.exe 2>nul

REM Kill by window title as backup
taskkill /F /FI "WINDOWTITLE eq Pramana Backend*" 2>nul
taskkill /F /FI "WINDOWTITLE eq Pramana Frontend*" 2>nul

echo.
echo ========================================
echo Application stopped successfully!
echo ========================================
pause
