@echo off
TITLE AI-Powered Personalized Learning Platform Runner
COLOR 0B

echo =========================================================================
echo       Starting AI-Powered Personalized Learning Platform
echo =========================================================================
echo.

echo [1/3] Starting FastAPI AI Microservice (Port 8000)...
start "AI Microservice (FastAPI)" cmd /k "cd /d D:\ai-personalized-education\ai-service && .\venv\Scripts\python.exe main.py"

timeout /t 3 /nobreak >nul

echo [2/3] Starting Spring Boot Backend API (Port 8085)...
start "Spring Boot Backend" cmd /k "cd /d D:\ai-personalized-education\backend && mvn spring-boot:run"

timeout /t 5 /nobreak >nul

echo [3/3] Starting React Vite Frontend (Port 5173)...
start "React Frontend" cmd /k "cd /d D:\ai-personalized-education\frontend && npm run dev"

timeout /t 3 /nobreak >nul

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
