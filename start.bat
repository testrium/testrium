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

    REM Check if app container is actually running
    docker ps --filter "name=testrium" --filter "status=running" --format "{{.Names}}" | findstr "^testrium$" >nul 2>&1
    if %errorlevel% neq 0 (
        echo.
        echo WARNING: App container did not start. Showing logs...
        echo.
        docker compose logs app
        echo.
        echo Try running: docker compose logs app
        pause
        exit /b 1
    )

    echo Testrium is running at http://localhost:8080
    start http://localhost:8080
    goto done
)

REM ── Docker not available, try Java ────────────
echo [Docker not found] Starting directly with Java...
echo.

java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Neither Docker nor Java 17+ found.
    echo.
    echo Install one of:
    echo   Docker Desktop : https://www.docker.com/products/docker-desktop
    echo   Java 17+       : https://adoptium.net
    pause
    exit /b 1
)

REM ── Check if JAR exists ────────────────────────
set JAR=backend\target\testrium-2.0.0.jar
if not exist "%JAR%" (
    echo JAR not found. Building the application...
    echo This requires Maven and Node.js installed.
    echo.

    call mvn -version >nul 2>&1
    if %errorlevel% neq 0 (
        echo ERROR: Maven not found. Please install Maven 3.9+.
        pause
        exit /b 1
    )

    node -v >nul 2>&1
    if %errorlevel% neq 0 (
        echo ERROR: Node.js not found. Please install Node.js 18+.
        pause
        exit /b 1
    )

    echo Building frontend...
    call npm install
    call npm run build

    echo Copying frontend to backend...
    xcopy /E /I /Y dist backend\src\main\resources\static >nul

    echo Building backend...
    cd backend
    call mvn clean package -DskipTests -B
    cd ..
)

echo Starting Testrium on http://localhost:8080
echo Press Ctrl+C to stop.
echo.
start http://localhost:8080
java -jar "%JAR%"

:done
echo.
pause
endlocal
