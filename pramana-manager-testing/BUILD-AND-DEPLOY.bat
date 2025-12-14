@echo off
echo ========================================
echo   Building Pramana Manager v1.7.0
echo ========================================

cd ..

echo.
echo [1/4] Building Backend...
cd backend
call mvn clean package -DskipTests
if errorlevel 1 (
    echo Backend build FAILED!
    pause
    exit /b 1
)

echo.
echo [2/4] Building Frontend...
cd ..
call npm run build
if errorlevel 1 (
    echo Frontend build FAILED!
    pause
    exit /b 1
)

echo.
echo [3/4] Copying files to testing folder...
xcopy /Y /I backend\target\pramana-manager-1.7.0.jar pramana-manager-testing\backend\target\
xcopy /E /Y /I dist pramana-manager-testing\dist

echo.
echo [4/4] Build complete!
echo ========================================
echo   Ready to run START-APPLICATION.bat
echo ========================================
pause
