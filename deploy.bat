@echo off
REM ################################################################################
REM Pramana Manager Deployment Script for Windows
REM Version: 1.7.0
REM Description: Automated deployment script for Windows environments
REM ################################################################################

setlocal enabledelayedexpansion

set VERSION=1.7.0
set BACKEND_DIR=backend
set FRONTEND_DIR=.

:MENU
cls
echo ╔════════════════════════════════════════════╗
echo ║   Pramana Manager Deployment Script       ║
echo ║   Version: %VERSION%                         ║
echo ╚════════════════════════════════════════════╝
echo.
echo 1. Check Requirements
echo 2. Build Backend
echo 3. Build Frontend
echo 4. Start Development
echo 5. Stop Services
echo 6. Show Status
echo 7. Exit
echo.
set /p choice="Select option [1-7]: "

if "%choice%"=="1" goto CHECK_REQUIREMENTS
if "%choice%"=="2" goto BUILD_BACKEND
if "%choice%"=="3" goto BUILD_FRONTEND
if "%choice%"=="4" goto START_DEV
if "%choice%"=="5" goto STOP_SERVICES
if "%choice%"=="6" goto SHOW_STATUS
if "%choice%"=="7" goto END
echo Invalid option!
pause
goto MENU

:CHECK_REQUIREMENTS
cls
echo ================================================
echo   Checking Requirements
echo ================================================
echo.

REM Check Java
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] Java not found. Please install Java 17+
    pause
    goto MENU
) else (
    echo [√] Java found
    java -version
)

REM Check Node.js
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] Node.js not found. Please install Node.js 18+
    pause
    goto MENU
) else (
    echo [√] Node.js found
    node -v
    npm -v
)

REM Check MySQL
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] MySQL client not found. Make sure MySQL server is running.
) else (
    echo [√] MySQL found
    mysql --version
)

echo.
echo All requirements checked!
pause
goto MENU

:BUILD_BACKEND
cls
echo ================================================
echo   Building Backend
echo ================================================
echo.

cd %BACKEND_DIR%

REM Check if mvnw.cmd exists
if exist "mvnw.cmd" (
    echo Using Maven Wrapper...
    call mvnw.cmd clean package -DskipTests
) else (
    echo Using system Maven...
    mvn clean package -DskipTests
)

if %errorlevel% neq 0 (
    echo [X] Backend build failed!
    cd ..
    pause
    goto MENU
)

echo [√] Backend built successfully: pramana-manager-%VERSION%.jar
cd ..
pause
goto MENU

:BUILD_FRONTEND
cls
echo ================================================
echo   Building Frontend
echo ================================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing npm dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [X] npm install failed!
        pause
        goto MENU
    )
)

echo Building frontend...
call npm run build

if %errorlevel% neq 0 (
    echo [X] Frontend build failed!
    pause
    goto MENU
)

echo [√] Frontend built successfully!
pause
goto MENU

:START_DEV
cls
echo ================================================
echo   Starting Development Environment
echo ================================================
echo.

REM Check if backend JAR exists
if not exist "%BACKEND_DIR%\target\pramana-manager-%VERSION%.jar" (
    echo [X] Backend JAR not found. Build backend first.
    pause
    goto MENU
)

REM Start Backend
echo Starting backend on port 8080...
start "Pramana Backend" cmd /c "cd %BACKEND_DIR% && java -jar target\pramana-manager-%VERSION%.jar"
timeout /t 5 >nul
echo [√] Backend started

REM Start Frontend
echo Starting frontend on port 5173...
start "Pramana Frontend" cmd /c "npm run dev"
timeout /t 3 >nul
echo [√] Frontend started

echo.
echo ================================================
echo   Deployment Complete!
echo ================================================
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:8080
echo.
echo Press any key to return to menu...
pause >nul
goto MENU

:STOP_SERVICES
cls
echo ================================================
echo   Stopping Services
echo ================================================
echo.

REM Stop backend (looking for Java process with pramana-manager)
for /f "tokens=2" %%i in ('tasklist /fi "imagename eq java.exe" /fo list ^| findstr /i "PID"') do (
    netstat -ano | findstr ":8080" | findstr "%%i" >nul 2>&1
    if !errorlevel! equ 0 (
        echo Stopping backend (PID: %%i)...
        taskkill /PID %%i /F >nul 2>&1
        echo [√] Backend stopped
    )
)

REM Stop frontend (looking for node process on port 5173)
for /f "tokens=5" %%i in ('netstat -ano ^| findstr ":5173"') do (
    echo Stopping frontend (PID: %%i)...
    taskkill /PID %%i /F >nul 2>&1
    echo [√] Frontend stopped
)

echo.
echo Services stopped!
pause
goto MENU

:SHOW_STATUS
cls
echo ================================================
echo   Service Status
echo ================================================
echo.

REM Check backend
netstat -ano | findstr ":8080" >nul 2>&1
if %errorlevel% equ 0 (
    echo [√] Backend running on port 8080
    netstat -ano | findstr ":8080"
) else (
    echo [X] Backend not running
)

echo.

REM Check frontend
netstat -ano | findstr ":5173" >nul 2>&1
if %errorlevel% equ 0 (
    echo [√] Frontend running on port 5173
    netstat -ano | findstr ":5173"
) else (
    echo [X] Frontend not running
)

echo.
pause
goto MENU

:END
echo.
echo Thank you for using Pramana Manager Deployment Script!
exit /b 0
