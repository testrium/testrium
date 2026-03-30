@echo off
setlocal

echo =============================================
echo  Testrium - Stopping Application
echo =============================================
echo.

REM ── Try stopping Docker containers ─────────────
docker info >nul 2>&1
if %errorlevel% == 0 (
    docker ps --filter "name=testrium" --format "{{.Names}}" | findstr testrium >nul 2>&1
    if %errorlevel% == 0 (
        echo [Docker] Stopping containers...
        docker compose down
        echo Testrium stopped. Your data is preserved in the mysql_data volume.
        goto done
    )
)

REM ── Try stopping Java process ──────────────────
echo [Java] Looking for running Testrium process...
for /f "tokens=1" %%p in ('wmic process where "commandline like '%%testrium-2.0.0.jar%%'" get processid ^| findstr /r "[0-9]"') do (
    echo Stopping process %%p...
    taskkill /PID %%p /F >nul 2>&1
    echo Testrium stopped.
    goto done
)

echo No running Testrium instance found.

:done
echo.
pause
endlocal
