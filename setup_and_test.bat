@echo off
echo ========================================
echo   PratChat - Setup and Test Script
echo ========================================
echo.

echo [1/5] Checking Python...
python --version
if %errorlevel% neq 0 (
    echo ERROR: Python not found! Install Python 3.9+
    pause
    exit /b 1
)

echo.
echo [2/5] Checking Node.js...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found! Install Node.js 16+
    pause
    exit /b 1
)

echo.
echo [3/5] Installing Backend Dependencies...
cd server
pip install -q -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Python dependencies
    pause
    exit /b 1
)

echo.
echo [4/5] Training ML Models...
python -c "from utils.ml_model import IntentClassifier; from utils.embeddings import EmbeddingStore; c = IntentClassifier(); c.train(); c.save(); e = EmbeddingStore(); e.build_index(); e.save(); print('Models trained successfully!')"
if %errorlevel% neq 0 (
    echo ERROR: Model training failed
    pause
    exit /b 1
)

echo.
echo [5/5] Installing Frontend Dependencies...
cd ..\client
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Node dependencies
    pause
    exit /b 1
)

cd ..
echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Add your Gemini API key to server/.env
echo 2. Run: start.bat
echo.
pause
