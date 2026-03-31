@echo off
setlocal

echo =============================================
echo  Testrium - Starting Application
echo =============================================
echo.

REM ── Try Docker first ──────────────────────────
docker info >nul 2>&1
if %errorlevel% == 0 (
    echo [Docker detected] Starting with Docker Compose...
    docker compose up -d
    if %errorlevel% neq 0 (
        echo ERROR: Docker Compose failed. See above for details.
        pause
        exit /b 1
    )

    echo.
    echo Waiting for app to be ready...
    timeout /t 10 /nobreak >nul

    docker ps --filter "name=testrium" --filter "status=running" --format "{{.Names}}" | findstr "^testrium$" >nul 2>&1
    if %errorlevel% neq 0 (
        echo.
        echo WARNING: App container did not start. Showing logs...
        echo.
        docker compose logs app
        pause
        exit /b 1
    )

    echo Testrium is running at http://localhost:8080
    start http://localhost:8080
    goto done
)

REM ── Docker not available — try Java ───────────
echo [No Docker] Trying direct Java run...
echo.

java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Neither Docker nor Java 17+ found.
    echo.
    echo Please install one of:
    echo   Docker Desktop : https://www.docker.com/products/docker-desktop
    echo   Java 17+       : https://adoptium.net
    pause
    exit /b 1
)

REM ── Find or download the JAR ──────────────────
set JAR=testrium.jar
set VERSION=2.1.0
set DOWNLOAD_URL=https://github.com/testrium/testrium/releases/download/v%VERSION%/testrium-%VERSION%.jar

REM Check current directory first, then backend/target
if exist "%JAR%" goto run_jar
if exist "backend\target\testrium-%VERSION%.jar" (
    set JAR=backend\target\testrium-%VERSION%.jar
    goto run_jar
)

REM Download from GitHub Releases
echo JAR not found locally. Downloading testrium-%VERSION%.jar from GitHub...
echo.
curl -L -o "%JAR%" "%DOWNLOAD_URL%"
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Download failed. Check your internet connection or download manually:
    echo %DOWNLOAD_URL%
    pause
    exit /b 1
)
echo Download complete.
echo.

:run_jar
echo Starting Testrium on http://localhost:8080
echo Using embedded H2 database ^(data stored in ./data/testrium^)
echo Press Ctrl+C to stop.
echo.
start http://localhost:8080
java -jar "%JAR%"

:done
echo.
pause
endlocal
