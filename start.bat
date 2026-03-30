@echo off
echo Starting Testrium...
docker compose up -d
if %errorlevel% neq 0 (
    echo Failed to start. Make sure Docker is running.
    pause
    exit /b 1
)
echo.
echo Testrium is starting up. This may take a minute on first run.
echo Open http://localhost:8080 in your browser.
echo.
pause
