@echo off
echo ========================================
echo   PratChat - Project Verification
echo ========================================
echo.

set PASS=0
set FAIL=0

echo Checking Project Structure...
echo.

if exist "client\src\components\Main\Main.jsx" (
    echo [PASS] Frontend Main component
    set /a PASS+=1
) else (
    echo [FAIL] Frontend Main component missing
    set /a FAIL+=1
)

if exist "client\src\components\Sidebar\Sidebar.jsx" (
    echo [PASS] Frontend Sidebar component
    set /a PASS+=1
) else (
    echo [FAIL] Frontend Sidebar component missing
    set /a FAIL+=1
)

if exist "client\src\context\Context.jsx" (
    echo [PASS] Frontend Context
    set /a PASS+=1
) else (
    echo [FAIL] Frontend Context missing
    set /a FAIL+=1
)

if exist "client\src\config\api.js" (
    echo [PASS] Frontend API client
    set /a PASS+=1
) else (
    echo [FAIL] Frontend API client missing
    set /a FAIL+=1
)

if exist "server\main.py" (
    echo [PASS] Backend main server
    set /a PASS+=1
) else (
    echo [FAIL] Backend main server missing
    set /a FAIL+=1
)

if exist "server\routes\chat.py" (
    echo [PASS] Chat route
    set /a PASS+=1
) else (
    echo [FAIL] Chat route missing
    set /a FAIL+=1
)

if exist "server\routes\train.py" (
    echo [PASS] Train route
    set /a PASS+=1
) else (
    echo [FAIL] Train route missing
    set /a FAIL+=1
)

if exist "server\routes\stats.py" (
    echo [PASS] Stats route
    set /a PASS+=1
) else (
    echo [FAIL] Stats route missing
    set /a FAIL+=1
)

if exist "server\utils\ml_model.py" (
    echo [PASS] ML Model utility
    set /a PASS+=1
) else (
    echo [FAIL] ML Model utility missing
    set /a FAIL+=1
)

if exist "server\utils\sentiment.py" (
    echo [PASS] Sentiment analyzer
    set /a PASS+=1
) else (
    echo [FAIL] Sentiment analyzer missing
    set /a FAIL+=1
)

if exist "server\utils\embeddings.py" (
    echo [PASS] Embeddings/RAG system
    set /a PASS+=1
) else (
    echo [FAIL] Embeddings/RAG system missing
    set /a FAIL+=1
)

if exist "server\utils\gemini_client.py" (
    echo [PASS] Gemini API client
    set /a PASS+=1
) else (
    echo [FAIL] Gemini API client missing
    set /a FAIL+=1
)

if exist "server\utils\database.py" (
    echo [PASS] Database utility
    set /a PASS+=1
) else (
    echo [FAIL] Database utility missing
    set /a FAIL+=1
)

if exist "data\intents.json" (
    echo [PASS] Intent training data
    set /a PASS+=1
) else (
    echo [FAIL] Intent training data missing
    set /a FAIL+=1
)

if exist "data\knowledge_base\about_pratchat.txt" (
    echo [PASS] Knowledge base - PratChat info
    set /a PASS+=1
) else (
    echo [FAIL] Knowledge base - PratChat info missing
    set /a FAIL+=1
)

if exist "data\knowledge_base\pratyush_info.txt" (
    echo [PASS] Knowledge base - Creator info
    set /a PASS+=1
) else (
    echo [FAIL] Knowledge base - Creator info missing
    set /a FAIL+=1
)

if exist "server\.env" (
    echo [PASS] Environment configuration
    set /a PASS+=1
) else (
    echo [WARN] Environment configuration missing - create server\.env
)

if exist "README.md" (
    echo [PASS] README documentation
    set /a PASS+=1
) else (
    echo [FAIL] README documentation missing
    set /a FAIL+=1
)

if exist "train_model.ipynb" (
    echo [PASS] Training notebook
    set /a PASS+=1
) else (
    echo [FAIL] Training notebook missing
    set /a FAIL+=1
)

if exist "docker-compose.yml" (
    echo [PASS] Docker configuration
    set /a PASS+=1
) else (
    echo [FAIL] Docker configuration missing
    set /a FAIL+=1
)

if exist "docs\INTERVIEW_NOTES.md" (
    echo [PASS] Interview preparation
    set /a PASS+=1
) else (
    echo [FAIL] Interview preparation missing
    set /a FAIL+=1
)

echo.
echo ========================================
echo   Results: %PASS% PASS, %FAIL% FAIL
echo ========================================
echo.

if %FAIL% gtr 0 (
    echo Some components are missing!
    echo Please check the failed items above.
) else (
    echo All components verified successfully!
    echo Project is complete and ready to use.
)

echo.
pause
