@echo off
chcp 65001 >nul 2>&1
title 탈출로드맵 업데이트
color 1F

set "INSTALL_DIR=C:\탈출로드맵"

echo.
echo  탈출로드맵을 최신 버전으로 업데이트합니다...
echo.

if not exist "%INSTALL_DIR%\.git" (
    echo  ✗ 설치된 탈출로드맵을 찾을 수 없습니다.
    echo    먼저 install.bat을 실행하세요.
    pause
    exit /b 1
)

cd /d "%INSTALL_DIR%"

echo  [1/2] 최신 코드 다운로드 중...
git pull origin main

echo.
echo  [2/2] 패키지 업데이트 중...
call npm install --silent 2>nul

color 2F
echo.
echo  ✓ 업데이트 완료!
echo.
pause
