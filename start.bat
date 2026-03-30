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
    echo Testrium is starting up. This may take a minute on first run.
    echo Open http://localhost:8080 in your browser.
    goto done
)

REM ── Docker not available, try Java ────────────
echo [Docker not found] Falling back to direct Java run...
echo.

java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Neither Docker nor Java found.
    echo Please install Docker Desktop or Java 17+.
    pause
    exit /b 1
)

REM ── Check if JAR already built ─────────────────
set JAR=backend\target\testrium-2.0.0.jar
if not exist "%JAR%" (
    echo JAR not found. Building the application...
    echo This requires Maven and Node.js installed.
    echo.

    call mvn -version >nul 2>&1
    if %errorlevel% neq 0 (
        echo ERROR: Maven not found. Please install Maven or build the JAR manually.
        pause
        exit /b 1
    )

    echo Building frontend...
    call npm install
    call npm run build

    echo Building backend...
    xcopy /E /I /Y dist backend\src\main\resources\static >nul
    cd backend
    call mvn clean package -DskipTests -B
    cd ..
)

REM ── Run the JAR ────────────────────────────────
echo Starting Testrium (H2 embedded database)...
echo Open http://localhost:8080 in your browser.
echo Press Ctrl+C to stop.
echo.
java -jar "%JAR%"

:done
echo.
pause
endlocal
