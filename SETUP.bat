@echo off
echo ========================================
echo   PRAMANA MANAGER - First Time Setup
echo ========================================
echo.

REM Check Java
echo Checking Java installation...
java -version 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Java is not installed!
    echo Please install JDK 17 or higher from:
    echo https://www.oracle.com/java/technologies/downloads/
    echo.
    pause
    exit /b 1
)
echo [OK] Java is installed
echo.

REM Check Maven
echo Checking Maven installation...
mvn -version 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Maven is not installed!
    echo Please install Maven from:
    echo https://maven.apache.org/download.cgi
    echo.
    pause
    exit /b 1
)
echo [OK] Maven is installed
echo.

REM Check Node.js
echo Checking Node.js installation...
node -v 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)
echo [OK] Node.js is installed
echo.

REM Install frontend dependencies
echo Installing frontend dependencies...
echo This may take a few minutes...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install frontend dependencies
    pause
    exit /b 1
)
echo [OK] Frontend dependencies installed
echo.

REM Build backend (downloads dependencies)
echo Building backend...
echo This may take several minutes on first run...
cd backend
call mvn clean compile
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build backend
    cd..
    pause
    exit /b 1
)
cd..
echo [OK] Backend built successfully
echo.

echo ========================================
echo   SETUP COMPLETED SUCCESSFULLY!
echo ========================================
echo.
echo You can now run the application by double-clicking:
echo START-APPLICATION.bat
echo.
pause
