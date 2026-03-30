@echo off
echo Stopping Testrium...
docker compose down
if %errorlevel% neq 0 (
    echo Failed to stop. Make sure Docker is running.
    pause
    exit /b 1
)
echo.
echo Testrium stopped. Your data is preserved in the mysql_data volume.
echo.
pause
