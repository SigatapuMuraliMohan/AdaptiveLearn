@echo off
TITLE AI-Powered Personalized Learning Platform Runner
COLOR 0B

echo =========================================================================
echo       Starting AI-Powered Personalized Learning Platform
echo =========================================================================
echo.

echo [1/3] Starting FastAPI AI Microservice (Port 8000)...
start "AI Microservice (FastAPI)" cmd /k "cd /d "%~dp0ai-service" && if exist venv\Scripts\python.exe ( .\venv\Scripts\python.exe main.py ) else ( python main.py )"

timeout /t 3 /nobreak >nul

echo [2/3] Starting Spring Boot Backend API (Port 8085)...
start "Spring Boot Backend" cmd /k "cd /d "%~dp0backend" && mvn spring-boot:run"

echo Waiting for Spring Boot Backend to initialize on port 8085...
powershell -Command "while (!(Test-NetConnection -ComputerName localhost -Port 8085 -InformationLevel Quiet)) { Write-Host '  ...waiting for backend on port 8085...'; Start-Sleep -Seconds 2 }"
echo.
echo [OK] Spring Boot Backend is listening and ready!
echo.

echo [3/3] Starting React Vite Frontend (Port 5173)...
start "React Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo Waiting for React Frontend to initialize on port 5173...
powershell -Command "while (!(Test-NetConnection -ComputerName localhost -Port 5173 -InformationLevel Quiet)) { Start-Sleep -Seconds 1 }"

echo.
echo =========================================================================
echo  All services launched!
echo  - Frontend: http://localhost:5173
echo  - Backend API: http://localhost:8085
echo  - AI Microservice: http://localhost:8000
echo =========================================================================
echo.
start http://localhost:5173
pause
