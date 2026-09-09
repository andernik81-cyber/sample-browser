@echo off
setlocal

cd /d "%~dp0"

echo.
echo === Sample Browser JUCE build ===
echo.

if not exist "C:\JUCE\CMakeLists.txt" (
    echo ERROR: JUCE was not found at C:\JUCE
    echo.
    pause
    exit /b 1
)

where cmake >nul 2>&1
if errorlevel 1 (
    echo ERROR: CMake was not found in PATH.
    echo.
    pause
    exit /b 1
)

rem Load the Visual Studio C++ build environment automatically when needed.
where cl >nul 2>&1
if errorlevel 1 (
    set "VSWHERE=%ProgramFiles(x86)%\Microsoft Visual Studio\Installer\vswhere.exe"

    if not exist "%VSWHERE%" (
        echo ERROR: Visual Studio installation could not be located.
        echo.
        pause
        exit /b 1
    )

    for /f "usebackq delims=" %%I in (`"%VSWHERE%" -latest -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath`) do set "VSROOT=%%I"

    if not defined VSROOT (
        echo ERROR: MSVC C++ tools were not found in Visual Studio.
        echo.
        pause
        exit /b 1
    )

    call "%VSROOT%\Common7\Tools\VsDevCmd.bat" -arch=x64 -host_arch=x64 >nul 2>&1
    if errorlevel 1 (
        echo ERROR: Could not initialize the Visual Studio C++ environment.
        echo.
        pause
        exit /b 1
    )
)

where cl >nul 2>&1
if errorlevel 1 (
    echo ERROR: MSVC compiler is unavailable.
    echo.
    pause
    exit /b 1
)

echo CMake:
cmake --version
echo.
echo MSVC:
echo   Microsoft C++ compiler environment detected.
echo.

echo Configuring...
cmake -S . -B build -DJUCE_PATH=C:/JUCE
if errorlevel 1 (
    echo.
    echo CONFIGURE FAILED.
    pause
    exit /b 1
)

echo.
echo Building Debug...
cmake --build build --config Debug
if errorlevel 1 (
    echo.
    echo BUILD FAILED.
    pause
    exit /b 1
)

echo.
echo BUILD SUCCEEDED.
echo.
pause
endlocal
