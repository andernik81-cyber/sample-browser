@echo off
setlocal
cd /d "%~dp0frontend"

where npm >nul 2>nul
if errorlevel 1 (
    echo.
    echo Node.js / npm не найден.
    echo Установи Node.js LTS с https://nodejs.org/
    echo.
    pause
    exit /b 1
)

if not exist node_modules (
    echo Устанавливаю зависимости...
    call npm install
    if errorlevel 1 (
        echo.
        echo Не удалось установить зависимости.
        pause
        exit /b 1
    )
)

echo Собираю production-версию...
call npm run build

echo.
pause
endlocal
