@echo off
echo ========================================
echo   Creating Testing Package
echo ========================================
echo.

REM Create a folder for the package
set PACKAGE_NAME=pramana-manager-testing
if exist %PACKAGE_NAME% (
    echo Removing old package...
    rmdir /s /q %PACKAGE_NAME%
)

echo Creating package folder...
mkdir %PACKAGE_NAME%

REM Copy necessary files
echo Copying application files...

REM Copy source code
xcopy /E /I /Y src %PACKAGE_NAME%\src > nul
xcopy /E /I /Y backend %PACKAGE_NAME%\backend > nul
xcopy /E /I /Y public %PACKAGE_NAME%\public > nul

REM Copy configuration files
copy package.json %PACKAGE_NAME%\ > nul
copy package-lock.json %PACKAGE_NAME%\ > nul
copy vite.config.js %PACKAGE_NAME%\ > nul
copy tailwind.config.js %PACKAGE_NAME%\ > nul
copy postcss.config.js %PACKAGE_NAME%\ > nul
copy index.html %PACKAGE_NAME%\ > nul
copy .gitignore %PACKAGE_NAME%\ > nul 2>nul

REM Copy batch files
copy START-APPLICATION.bat %PACKAGE_NAME%\ > nul
copy STOP-APPLICATION.bat %PACKAGE_NAME%\ > nul
copy SETUP.bat %PACKAGE_NAME%\ > nul
copy start-backend.bat %PACKAGE_NAME%\ > nul
copy start-frontend.bat %PACKAGE_NAME%\ > nul

REM Copy instructions
copy TESTING-INSTRUCTIONS.md %PACKAGE_NAME%\ > nul

REM Create README for tester
echo # Pramana Manager - Testing Version > %PACKAGE_NAME%\README.txt
echo. >> %PACKAGE_NAME%\README.txt
echo ## Quick Start >> %PACKAGE_NAME%\README.txt
echo 1. Run SETUP.bat (first time only) >> %PACKAGE_NAME%\README.txt
echo 2. Run START-APPLICATION.bat >> %PACKAGE_NAME%\README.txt
echo 3. Login with: admin@pramana.com / admin123 >> %PACKAGE_NAME%\README.txt
echo. >> %PACKAGE_NAME%\README.txt
echo For detailed instructions, see TESTING-INSTRUCTIONS.md >> %PACKAGE_NAME%\README.txt

echo.
echo ========================================
echo Package created: %PACKAGE_NAME%
echo ========================================
echo.
echo You can now:
echo 1. Compress '%PACKAGE_NAME%' folder to a ZIP file
echo 2. Send the ZIP to your friend
echo 3. They extract and run SETUP.bat first
echo 4. Then run START-APPLICATION.bat
echo.
pause
