@echo off
chcp 65001 >nul 2>&1
title 탈출로드맵 배포
color 1F

set "INSTALL_DIR=C:\탈출로드맵"
set "CF_TOKEN=cfut_NzCJUOMYhlvN1dLMj56B41TAf8guVcmoIYJmxv6X9d8c0b70"

echo.
echo  탈출로드맵을 프로덕션에 배포합니다...
echo  (https://retirement-roadmap.pages.dev)
echo.

if not exist "%INSTALL_DIR%\package.json" (
    echo  ✗ 설치된 탈출로드맵을 찾을 수 없습니다.
    echo    먼저 install.bat을 실행하세요.
    pause
    exit /b 1
)

cd /d "%INSTALL_DIR%"

echo  [1/2] 빌드 중...
call npm run build

if not exist "%INSTALL_DIR%\dist\index.html" (
    echo  ✗ 빌드 실패.
    pause
    exit /b 1
)

echo.
echo  [2/2] 배포 중...
set "CLOUDFLARE_API_TOKEN=%CF_TOKEN%"
call npx wrangler pages deploy dist --project-name=retirement-roadmap

color 2F
echo.
echo  ✓ 배포 완료!
echo    https://retirement-roadmap.pages.dev
echo.
pause
