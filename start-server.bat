@echo off
title 은퇴로드맵 서버

:: 기존 vite 프로세스 종료
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do (
    taskkill /PID %%a /F >nul 2>&1
)

cd /d "c:\workspace\e-book"
call npm run dev
