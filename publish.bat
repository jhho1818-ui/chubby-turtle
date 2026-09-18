@echo off
title Chubby - Publish
cd /d "%~dp0"

REM ==================================================================
REM  Chubby the Turtle - publish script
REM  Daniel Avraham Haddad - CBY-T7R4L2E9
REM ------------------------------------------------------------------
REM  IMPORTANT: this file is intentionally ASCII-only.
REM  cmd.exe parses a .bat file byte by byte using the console code
REM  page, NOT UTF-8. A batch file containing Hebrew or emoji gets
REM  mangled into garbage commands. chcp 65001 does not fix it,
REM  because the mangling happens while the file is being read.
REM  Keep every line here in plain English.
REM ==================================================================

echo.
echo  ==================================================
echo    CHUBBY - Publish to the web
echo  ==================================================
echo.

where git >nul 2>nul
if errorlevel 1 (
  echo  [X] Git is not installed.
  echo      Download it from https://git-scm.com and run this again.
  echo.
  pause
  exit /b 1
)

if not exist ".git" (
  echo  [!] This folder is not connected to GitHub yet.
  echo.
  echo      One-time setup - see the guide:
  echo        "hibur-oto-kishur.html"
  echo.
  echo      Short version:
  echo        1. Create an empty repository on github.com
  echo        2. Run these commands here:
  echo             git init
  echo             git add .
  echo             git commit -m "Chubby first commit"
  echo             git branch -M main
  echo             git remote add origin YOUR-REPO-URL
  echo             git push -u origin main
  echo        3. In Netlify: Project configuration - Build and deploy
  echo           - Link repository - pick that repo
  echo.
  echo      After that, this script publishes with one double-click.
  echo.
  pause
  exit /b 1
)

echo  [1/4] Updating cache version...
call node tools\cache-version.js --fix
if errorlevel 1 goto :err

echo.
echo  [2/4] Writing ownership fingerprint...
call node tools\fingerprint.js
if errorlevel 1 goto :err

echo.
echo  [3/4] Saving changes...
git add .
git diff --cached --quiet
if not errorlevel 1 (
  echo.
  echo  [i] Nothing new to publish.
  echo      The site already shows the latest version.
  echo.
  pause
  exit /b 0
)

for /f "tokens=1-3 delims=/. " %%a in ("%date%") do set D=%%a-%%b-%%c
for /f "tokens=1-2 delims=:" %%a in ("%time%") do set T=%%a:%%b
git commit -m "Chubby update - %D% %T%"
if errorlevel 1 goto :err

echo.
echo  [4/4] Pushing to GitHub...
git push
if errorlevel 1 goto :err

echo.
echo  ==================================================
echo    DONE - pushed successfully.
echo.
echo    Netlify is building now. In a minute or two
echo    the new version will be live at the SAME link:
echo.
echo      https://gilded-marzipan-5daf4b.netlify.app
echo.
echo    Phones that already installed Chubby will get
echo    the update next time the app is opened.
echo  ==================================================
echo.
choice /c YN /m "  Open the site now"
if not errorlevel 2 start "" "https://gilded-marzipan-5daf4b.netlify.app"
echo.
pause
exit /b 0

:err
echo.
echo  [X] Something failed. Scroll up to see what.
echo.
pause
exit /b 1
