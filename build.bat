@echo off
setlocal

echo =============================================
echo  Testrium - Build (Frontend + Backend JAR)
echo =============================================
echo.

REM ── Check Node.js ─────────────────────────────
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found. Install from https://nodejs.org
    pause
    exit /b 1
)

REM ── Check Java ────────────────────────────────
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Java 17+ not found. Install from https://adoptium.net
    pause
    exit /b 1
)

REM ── Check Maven ───────────────────────────────
mvn -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Maven not found. Install from https://maven.apache.org
    pause
    exit /b 1
)

REM ── Step 1: Install npm dependencies ──────────
echo [1/4] Installing frontend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: npm install failed.
    pause
    exit /b 1
)

REM ── Step 2: Build React frontend ──────────────
echo.
echo [2/4] Building React frontend...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Frontend build failed.
    pause
    exit /b 1
)

REM ── Step 3: Inject frontend into Spring Boot ──
echo.
echo [3/4] Copying frontend into backend static resources...
if not exist "backend\src\main\resources\static" mkdir "backend\src\main\resources\static"
xcopy /E /I /Y dist backend\src\main\resources\static >nul
if %errorlevel% neq 0 (
    echo ERROR: Failed to copy frontend files.
    pause
    exit /b 1
)

REM ── Step 4: Build JAR ─────────────────────────
echo.
echo [4/4] Building backend JAR (this may take a minute)...
cd backend
call mvn clean package -DskipTests -q
if %errorlevel% neq 0 (
    echo ERROR: Maven build failed.
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo =============================================
echo  Build complete!
echo  JAR: backend\target\testrium-2.1.0.jar
echo.
echo  Run start.bat to launch the app.
echo =============================================
echo.
pause
endlocal
