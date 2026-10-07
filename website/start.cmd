@echo off
rem Starts the learning docs website. Double-click this file, or run it from a terminal.
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed. Get it from https://nodejs.org and run this again.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Installing the two packages the website needs. This only happens once...
  call npm install --no-fund --no-audit
  if errorlevel 1 (
    echo npm install failed. Check the message above.
    pause
    exit /b 1
  )
)

node server.js
pause
