@echo off
echo ========================================
echo   Halo Health App - Quick Start
echo ========================================
echo.

echo [1/3] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)
echo Node.js: OK

echo.
echo [2/3] Starting Backend Server...
cd backend
start "Halo Backend" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo [3/3] Starting Frontend App...
cd ..\frontend
start "Halo Frontend" cmd /k "npm start"

echo.
echo ========================================
echo   Both servers are starting...
echo ========================================
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:19006
echo.
echo Press any key to open browser...
pause >nul

start http://localhost:19006

echo.
echo To stop servers, close the terminal windows.
echo.
pause
