@echo off
title RoopShield Internship Portal - Local Server Launcher
echo =================================================================
echo        RoopShield Internship Portal - Local Launch Script
echo =================================================================
echo.

:: Change directory to the folder where this batch script is located
cd /d "%~dp0"

:: Free up ports 5000 and 5173 if they are occupied from a previous crash/run
echo [INFO] Freeing up local ports (5000, 5173) if previously locked...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do taskkill /f /pid %%a >nul 2>&1


:: Verify Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed! Please install Node.js first.
    echo Visit: https://nodejs.org/
    pause
    exit /b 1
)

:: Install root dependencies if node_modules doesn't exist
if not exist "node_modules\" (
    echo [INFO] Installing frontend dependencies...
    call npm install
)

:: Install backend dependencies if node_modules doesn't exist
if not exist "backend\node_modules\" (
    echo [INFO] Installing backend dependencies...
    cd backend
    call npm install
    cd /d "%~dp0"
)

echo Starting servers...
npm run dev:all

