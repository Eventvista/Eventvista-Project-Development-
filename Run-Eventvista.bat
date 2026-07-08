@echo off
title Eventvista Full-Stack Desktop Terminal Launcher
cls

echo ===================================================
echo   1. RESETTING WINDOWS PORTS ^& KILLING GHOST PIDs  
echo ===================================================

echo Checking Port 3000 (Frontend Next.js)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    echo Found ghost process PID %%a on Port 3000. Force-terminating...
    taskkill /f /pid %%a 2>nul
)

echo Checking Port 5000 (Backend Express)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do (
    echo Found ghost process PID %%a on Port 5000. Force-terminating...
    taskkill /f /pid %%a 2>nul
)

echo Ports checked and cleared successfully.
echo.

echo ===================================================
echo   2. SPINNING UP EVENTVISTA FULL-STACK SYSTEM      
echo ===================================================

echo -^> Launching API Engine (Backend)...
:: Opens the backend in its own independent command window
start "Eventvista Backend Service" cmd /k "cd backend && npm run dev"

echo -^> Launching Frontend Dev Server ^& Spawning Electron App...
echo Please wait for Next.js to compile. Electron will open automatically...
echo.

:: Switches into the frontend folder and triggers your package.json concurrent workflow
cd frontend && npm run test:desktop

echo.
echo ===================================================
echo   3. COOLDOWN TERMINATION ENGINE                   
echo ===================================================
echo Main process exited. 
pause
