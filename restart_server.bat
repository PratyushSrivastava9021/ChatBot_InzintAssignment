@echo off
echo Restarting PratChat Server...
taskkill /F /IM python.exe 2>nul
timeout /t 2 /nobreak >nul
cd server
start cmd /k "python main.py"
echo Server restarted!
