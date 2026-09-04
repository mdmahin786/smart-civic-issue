@echo off
echo ===================================================
echo   Starting CivicWatch Bangalore Project Servers
echo ===================================================
echo.

:: Start Backend in a separate window
echo Starting Backend Server (Port 5000)...
start "CivicWatch Backend" cmd /k "cd backend && npm run dev"

:: Start ML Microservice in a separate window
echo Starting ML Service (Port 8000)...
start "CivicWatch ML Service" cmd /k "cd ml_service && python -m uvicorn main:app --port 8000"

:: Wait 3 seconds for backend/ML to initialize
timeout /t 3 /nobreak >nul

:: Start Frontend in a separate window
echo Starting Frontend Server (Port 3000)...
start "CivicWatch Frontend" cmd /k "npm run dev"

echo.
echo ===================================================
echo   All three servers started in independent windows!
echo   - Frontend:    http://localhost:3000
echo   - Backend:     http://localhost:5000
echo   - ML Service:  http://localhost:8000
echo.
echo   Keep the command windows open while testing.
echo   Close them when you want to stop the servers.
echo ===================================================
pause
