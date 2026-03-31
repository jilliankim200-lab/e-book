@echo off
chcp 65001 >nul 2>&1
title 탈출로드맵 설치 프로그램
color 1F

echo.
echo  ╔═══════════════════════════════════════════╗
echo  ║                                           ║
echo  ║     탈출로드맵 설치 프로그램               ║
echo  ║                                           ║
echo  ║     설치를 시작하려면 아무 키나 누르세요   ║
echo  ║                                           ║
echo  ╚═══════════════════════════════════════════╝
echo.
pause

echo.
echo  [1/5] 시스템 확인 중...
echo.

:: ─── 설치 경로 ───
set "INSTALL_DIR=C:\탈출로드맵"

:: ─── Node.js 확인 ───
where node >nul 2>&1
if %errorlevel%==0 (
    echo  ✓ Node.js 이미 설치되어 있습니다.
) else (
    echo  → Node.js 설치 중... (약 1~2분 소요)
    echo.

    :: Node.js v22 LTS 다운로드
    set "NODE_URL=https://nodejs.org/dist/v22.14.0/node-v22.14.0-x64.msi"
    set "NODE_MSI=%TEMP%\node-install.msi"

    powershell -Command "& { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '%NODE_URL%' -OutFile '%NODE_MSI%' }"

    if not exist "%NODE_MSI%" (
        echo  ✗ Node.js 다운로드 실패. 인터넷 연결을 확인하세요.
        pause
        exit /b 1
    )

    :: 자동 설치 (관리자 권한 필요할 수 있음)
    msiexec /i "%NODE_MSI%" /qn /norestart

    :: PATH 갱신
    set "PATH=%PATH%;C:\Program Files\nodejs"

    del "%NODE_MSI%" >nul 2>&1
    echo  ✓ Node.js 설치 완료
)

:: ─── Git 확인 ───
where git >nul 2>&1
if %errorlevel%==0 (
    echo  ✓ Git 이미 설치되어 있습니다.
) else (
    echo  → Git 설치 중... (약 1~2분 소요)
    echo.

    set "GIT_URL=https://github.com/git-for-windows/git/releases/download/v2.47.1.windows.2/Git-2.47.1.2-64-bit.exe"
    set "GIT_EXE=%TEMP%\git-install.exe"

    powershell -Command "& { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '%GIT_URL%' -OutFile '%GIT_EXE%' }"

    if not exist "%GIT_EXE%" (
        echo  ✗ Git 다운로드 실패. 인터넷 연결을 확인하세요.
        pause
        exit /b 1
    )

    :: 자동 설치
    "%GIT_EXE%" /VERYSILENT /NORESTART /NOCANCEL /SP- /CLOSEAPPLICATIONS /RESTARTAPPLICATIONS

    :: PATH 갱신
    set "PATH=%PATH%;C:\Program Files\Git\cmd"

    del "%GIT_EXE%" >nul 2>&1
    echo  ✓ Git 설치 완료
)

echo.
echo  [2/5] 프로젝트 다운로드 중...
echo.

:: ─── 프로젝트 클론 ───
if exist "%INSTALL_DIR%\.git" (
    echo  → 기존 설치 감지. 최신 버전으로 업데이트합니다...
    cd /d "%INSTALL_DIR%"
    git pull origin main
) else (
    if exist "%INSTALL_DIR%" (
        rmdir /s /q "%INSTALL_DIR%" >nul 2>&1
    )
    git clone https://github.com/jilliankim200-lab/e-book.git "%INSTALL_DIR%"
)

if not exist "%INSTALL_DIR%\package.json" (
    echo  ✗ 프로젝트 다운로드 실패. 인터넷 연결을 확인하세요.
    pause
    exit /b 1
)

echo  ✓ 프로젝트 다운로드 완료

echo.
echo  [3/5] 필요한 패키지 설치 중... (약 1~3분 소요)
echo.

cd /d "%INSTALL_DIR%"
call npm install --silent 2>nul
echo  ✓ 패키지 설치 완료

echo.
echo  [4/5] 실행 파일 생성 중...
echo.

:: ─── 실행 스크립트 생성 ───
(
echo @echo off
echo title 탈출로드맵 서버
echo.
echo :: 기존 vite 프로세스 종료
echo for /f "tokens=5" %%%%a in ^('netstat -ano ^^^| findstr :5173'^) do ^(
echo     taskkill /PID %%%%a /F ^>nul 2^>^&1
echo ^)
echo.
echo cd /d "%INSTALL_DIR%"
echo echo.
echo echo  탈출로드맵이 실행됩니다...
echo echo  브라우저에서 자동으로 열립니다.
echo echo  종료하려면 이 창을 닫으세요.
echo echo.
echo start http://localhost:5173
echo call npx vite
) > "%INSTALL_DIR%\start.bat"

echo  ✓ 실행 파일 생성 완료

echo.
echo  [5/5] 바탕화면 바로가기 생성 중...
echo.

:: ─── 바탕화면 바로가기 ───
set "SHORTCUT=%USERPROFILE%\Desktop\탈출로드맵.lnk"

powershell -Command "& { $ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%SHORTCUT%'); $s.TargetPath = '%INSTALL_DIR%\start.bat'; $s.WorkingDirectory = '%INSTALL_DIR%'; $s.Description = '탈출로드맵 실행'; $s.IconLocation = '%INSTALL_DIR%\public\favicon.ico,0'; $s.Save() }"

echo  ✓ 바탕화면에 "탈출로드맵" 바로가기 생성 완료

:: ─── 완료 ───
color 2F
echo.
echo  ╔═══════════════════════════════════════════╗
echo  ║                                           ║
echo  ║     설치가 완료되었습니다!                 ║
echo  ║                                           ║
echo  ║     바탕화면의 "탈출로드맵" 아이콘을       ║
echo  ║     더블클릭하면 실행됩니다.               ║
echo  ║                                           ║
echo  ║     설치 경로: C:\탈출로드맵               ║
echo  ║                                           ║
echo  ╚═══════════════════════════════════════════╝
echo.

set /p RUN_NOW="  지금 바로 실행할까요? (Y/N): "
if /i "%RUN_NOW%"=="Y" (
    start "" "%INSTALL_DIR%\start.bat"
)

pause
