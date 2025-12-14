@echo off
echo Setting up Pramana Manager Test Environment (Windows)

REM Create test database
echo Creating test database...
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS pramana_test;"

REM Copy test properties
echo Copying test configuration...
copy application-test.properties ..\backend\src\main\resources\application-test.properties

echo Setup complete! Use 'mvn spring-boot:run -Dspring-boot.run.profiles=test' to start
pause
