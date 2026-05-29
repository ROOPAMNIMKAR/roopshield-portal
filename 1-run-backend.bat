@echo off
title RoopShield Backend Server (Port 5000)
echo =================================================================
echo        RoopShield Internship Portal - Backend Launcher
echo =================================================================
echo.

cd /d "%~dp0"

echo [1/3] Freeing up port 5000 if occupied...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do taskkill /f /pid %%a >nul 2>&1

echo [2/3] Checking dependencies...
if not exist "backend\node_modules\" (
    echo Installing backend dependencies...
    cd backend
    call npm install
    cd /d "%~dp0"
)

echo [3/3] Starting backend server on http://127.0.0.1:5000...
cd backend
node server.js
pause
