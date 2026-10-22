@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0restore-after-exit.ps1"
if errorlevel 1 (
  echo.
  echo Recovery was not completed. Read the error above.
)
echo.
pause
