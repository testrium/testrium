@echo off
echo ========================================
echo   Creating Testing Package
echo   (WITHOUT SOURCE CODE)
echo ========================================
echo.

echo WARNING: This script will build the application first.
echo This ensures the compiled version works properly.
echo.
pause

REM First, build the application
echo Step 1: Building backend...
cd backend
call mvn clean package -DskipTests
if %errorlevel% neq 0 (
    echo [ERROR] Backend build failed!
    cd..
    pause
    exit /b 1
)
cd..
echo [OK] Backend built successfully

echo.
echo Step 2: Building frontend...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Frontend build failed!
    pause
    exit /b 1
)
echo [OK] Frontend built successfully

echo.
echo Step 3: Creating package folder...

REM Create a folder for the package
set PACKAGE_NAME=pramana-manager-testing
if exist %PACKAGE_NAME% (
    echo Removing old package...
    rmdir /s /q %PACKAGE_NAME%
)

mkdir %PACKAGE_NAME%
mkdir %PACKAGE_NAME%\backend
mkdir %PACKAGE_NAME%\backend\target
mkdir %PACKAGE_NAME%\dist

echo Copying compiled files only (NO SOURCE CODE)...

REM Copy ONLY the compiled JAR file (not source code)
copy backend\target\*.jar %PACKAGE_NAME%\backend\target\ > nul
copy backend\pom.xml %PACKAGE_NAME%\backend\ > nul

REM Copy built frontend (not source code)
xcopy /E /I /Y dist %PACKAGE_NAME%\dist > nul

REM Copy configuration files
copy package.json %PACKAGE_NAME%\ > nul
copy vite.config.js %PACKAGE_NAME%\ > nul
copy index.html %PACKAGE_NAME%\ > nul

REM Copy batch files (MODIFIED)
echo Creating startup scripts...

REM Create modified START-APPLICATION.bat for production
echo @echo off > %PACKAGE_NAME%\START-APPLICATION.bat
echo echo ======================================== >> %PACKAGE_NAME%\START-APPLICATION.bat
echo echo   PRAMANA MANAGER - Test Application >> %PACKAGE_NAME%\START-APPLICATION.bat
echo echo ======================================== >> %PACKAGE_NAME%\START-APPLICATION.bat
echo echo. >> %PACKAGE_NAME%\START-APPLICATION.bat
echo echo Starting servers... >> %PACKAGE_NAME%\START-APPLICATION.bat
echo echo. >> %PACKAGE_NAME%\START-APPLICATION.bat
echo. >> %PACKAGE_NAME%\START-APPLICATION.bat
echo REM Start backend JAR >> %PACKAGE_NAME%\START-APPLICATION.bat
echo start "Pramana Backend" cmd /k "cd backend\target && java -jar pramana-manager-1.0.0.jar" >> %PACKAGE_NAME%\START-APPLICATION.bat
echo. >> %PACKAGE_NAME%\START-APPLICATION.bat
echo echo Waiting for backend to start (20 seconds)... >> %PACKAGE_NAME%\START-APPLICATION.bat
echo timeout /t 20 /nobreak ^> nul >> %PACKAGE_NAME%\START-APPLICATION.bat
echo. >> %PACKAGE_NAME%\START-APPLICATION.bat
echo REM Start frontend server >> %PACKAGE_NAME%\START-APPLICATION.bat
echo start "Pramana Frontend" cmd /k "npx serve -s dist -l 5173" >> %PACKAGE_NAME%\START-APPLICATION.bat
echo. >> %PACKAGE_NAME%\START-APPLICATION.bat
echo echo Waiting for frontend to start (10 seconds)... >> %PACKAGE_NAME%\START-APPLICATION.bat
echo timeout /t 10 /nobreak ^> nul >> %PACKAGE_NAME%\START-APPLICATION.bat
echo. >> %PACKAGE_NAME%\START-APPLICATION.bat
echo echo Opening application... >> %PACKAGE_NAME%\START-APPLICATION.bat
echo start http://localhost:5173 >> %PACKAGE_NAME%\START-APPLICATION.bat
echo. >> %PACKAGE_NAME%\START-APPLICATION.bat
echo echo ======================================== >> %PACKAGE_NAME%\START-APPLICATION.bat
echo echo Application is running! >> %PACKAGE_NAME%\START-APPLICATION.bat
echo echo Backend: http://localhost:8080 >> %PACKAGE_NAME%\START-APPLICATION.bat
echo echo Frontend: http://localhost:5173 >> %PACKAGE_NAME%\START-APPLICATION.bat
echo echo ======================================== >> %PACKAGE_NAME%\START-APPLICATION.bat
echo pause >> %PACKAGE_NAME%\START-APPLICATION.bat

REM Copy STOP script
copy STOP-APPLICATION.bat %PACKAGE_NAME%\ > nul

REM Create simplified SETUP.bat
echo Creating setup script...
echo @echo off > %PACKAGE_NAME%\SETUP.bat
echo echo ======================================== >> %PACKAGE_NAME%\SETUP.bat
echo echo   PRAMANA MANAGER - Setup >> %PACKAGE_NAME%\SETUP.bat
echo echo ======================================== >> %PACKAGE_NAME%\SETUP.bat
echo echo. >> %PACKAGE_NAME%\SETUP.bat
echo echo Checking Java installation... >> %PACKAGE_NAME%\SETUP.bat
echo java -version 2^>nul >> %PACKAGE_NAME%\SETUP.bat
echo if %%errorlevel%% neq 0 ( >> %PACKAGE_NAME%\SETUP.bat
echo     echo [ERROR] Java is not installed! >> %PACKAGE_NAME%\SETUP.bat
echo     echo Please install JDK 17 or higher >> %PACKAGE_NAME%\SETUP.bat
echo     pause >> %PACKAGE_NAME%\SETUP.bat
echo     exit /b 1 >> %PACKAGE_NAME%\SETUP.bat
echo ) >> %PACKAGE_NAME%\SETUP.bat
echo echo [OK] Java is installed >> %PACKAGE_NAME%\SETUP.bat
echo echo. >> %PACKAGE_NAME%\SETUP.bat
echo echo Checking Node.js... >> %PACKAGE_NAME%\SETUP.bat
echo node -v 2^>nul >> %PACKAGE_NAME%\SETUP.bat
echo if %%errorlevel%% neq 0 ( >> %PACKAGE_NAME%\SETUP.bat
echo     echo [ERROR] Node.js is not installed! >> %PACKAGE_NAME%\SETUP.bat
echo     pause >> %PACKAGE_NAME%\SETUP.bat
echo     exit /b 1 >> %PACKAGE_NAME%\SETUP.bat
echo ) >> %PACKAGE_NAME%\SETUP.bat
echo echo [OK] Node.js is installed >> %PACKAGE_NAME%\SETUP.bat
echo echo. >> %PACKAGE_NAME%\SETUP.bat
echo echo Installing serve package... >> %PACKAGE_NAME%\SETUP.bat
echo call npm install -g serve >> %PACKAGE_NAME%\SETUP.bat
echo echo. >> %PACKAGE_NAME%\SETUP.bat
echo echo ======================================== >> %PACKAGE_NAME%\SETUP.bat
echo echo Setup complete! >> %PACKAGE_NAME%\SETUP.bat
echo echo Run START-APPLICATION.bat to launch >> %PACKAGE_NAME%\SETUP.bat
echo echo ======================================== >> %PACKAGE_NAME%\SETUP.bat
echo pause >> %PACKAGE_NAME%\SETUP.bat

REM Copy instructions
copy README-FOR-TESTER.txt %PACKAGE_NAME%\ > nul

REM Create updated instructions
echo ======================================================================== > %PACKAGE_NAME%\README.txt
echo                PRAMANA MANAGER - COMPILED VERSION >> %PACKAGE_NAME%\README.txt
echo ======================================================================== >> %PACKAGE_NAME%\README.txt
echo. >> %PACKAGE_NAME%\README.txt
echo QUICK START: >> %PACKAGE_NAME%\README.txt
echo 1. Run SETUP.bat (first time only) >> %PACKAGE_NAME%\README.txt
echo 2. Run START-APPLICATION.bat >> %PACKAGE_NAME%\README.txt
echo 3. Login: admin@pramana.com / admin123 >> %PACKAGE_NAME%\README.txt
echo. >> %PACKAGE_NAME%\README.txt
echo NOTE: This is a COMPILED version - source code is NOT included. >> %PACKAGE_NAME%\README.txt
echo ======================================================================== >> %PACKAGE_NAME%\README.txt

echo.
echo ========================================
echo Package created: %PACKAGE_NAME%
echo ========================================
echo.
pause
