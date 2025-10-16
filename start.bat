@echo off
echo ========================================
echo   PratChat - Hybrid AI Chatbot
echo   Starting Backend and Frontend...
echo ========================================

echo.
echo [1/3] Starting Backend Server...
cd server
start cmd /k "python main.py"
timeout /t 5

echo.
echo [2/3] Starting Frontend...
cd ..\client
start cmd /k "npm run dev"

echo.
echo [3/3] Done!
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo API Docs: http://localhost:8000/docs
echo.
pause
