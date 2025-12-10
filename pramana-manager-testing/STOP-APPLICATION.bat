@echo off
echo Stopping Pramana Manager...
taskkill /F /IM java.exe 2>nul
taskkill /F /IM node.exe 2>nul
echo Stopped!
pause
