@echo off
title RoopShield Frontend Server (Port 5173)
echo =================================================================
echo        RoopShield Internship Portal - Frontend Launcher
echo =================================================================
echo.

cd /d "%~dp0"

echo [1/3] Freeing up port 5173 if occupied...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do taskkill /f /pid %%a >nul 2>&1

echo [2/3] Checking dependencies...
if not exist "node_modules\" (
    echo Installing frontend dependencies...
    call npm install
)

echo [3/3] Starting frontend server on http://127.0.0.1:5173...
npm run dev
pause
