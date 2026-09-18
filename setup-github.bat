@echo off
setlocal enabledelayedexpansion
title Chubby - One-time GitHub setup
cd /d "%~dp0"

REM ==================================================================
REM  Chubby the Turtle - one-time setup
REM  Daniel Avraham Haddad - CBY-T7R4L2E9
REM ------------------------------------------------------------------
REM  ASCII-ONLY on purpose. cmd.exe reads a .bat byte by byte using the
REM  console code page, not UTF-8. Hebrew or emoji inside a batch file
REM  turn into garbage commands. Keep every line in plain English.
REM ==================================================================

echo.
echo  ==================================================
echo    CHUBBY - one-time setup
echo  ==================================================
echo.
echo   This connects the folder to GitHub, so that from
echo   now on publishing is ONE double-click and the
echo   link never changes.
echo.

where git >nul 2>nul
if errorlevel 1 (
  echo  [X] Git is not installed.
  echo.
  echo      Download it from  https://git-scm.com
  echo      Install with all defaults, then run this again.
  echo.
  choice /c YN /m "  Open the download page now"
  if not errorlevel 2 start "" "https://git-scm.com/download/win"
  echo.
  pause
  exit /b 1
)
echo   [OK] Git is installed.
echo.

if exist ".git" (
  echo   [i] This folder is already connected to Git.
  echo       Nothing to do here - just use publish.bat.
  echo.
  pause
  exit /b 0
)

echo  --------------------------------------------------
echo   STEP 1 - create an empty repository on GitHub
echo  --------------------------------------------------
echo.
echo   1. A browser tab will open at github.com/new
echo   2. Repository name:   chubby-turtle
echo   3. Public or Private - your choice.
echo      The website stays public either way.
echo   4. IMPORTANT: do NOT tick any checkbox
echo      (no README, no .gitignore, no license)
echo   5. Click "Create repository"
echo   6. Copy the address it shows you. It looks like:
echo        https://github.com/YOURNAME/chubby-turtle.git
echo.
choice /c YN /m "  Open github.com/new now"
if not errorlevel 2 start "" "https://github.com/new"
echo.
echo  --------------------------------------------------
echo   STEP 2 - paste the address here
echo  --------------------------------------------------
echo.
set "REPO="
set /p REPO="  Paste and press Enter: "

if "!REPO!"=="" (
  echo.
  echo  [X] Nothing was pasted. Run this again when you have the address.
  echo.
  pause
  exit /b 1
)

echo.
echo  --------------------------------------------------
echo   STEP 3 - connecting
echo  --------------------------------------------------
echo.

git init
if errorlevel 1 goto :err

git add .
if errorlevel 1 goto :err

git -c user.name="Daniel Avraham Haddad" -c user.email="chubby@local" commit -m "Chubby the Turtle - first commit - CBY-T7R4L2E9"
if errorlevel 1 goto :err

git branch -M main
git remote add origin !REPO!
if errorlevel 1 goto :err

echo.
echo   Pushing to GitHub...
echo   A GitHub sign-in window may open. Sign in with your
echo   browser - this happens once only.
echo.
git push -u origin main
if errorlevel 1 goto :err

echo.
echo  ==================================================
echo    DONE - the code is on GitHub.
echo  ==================================================
echo.
echo   LAST STEP, in the browser:
echo.
echo     Netlify - your site page
echo       - Project configuration
echo       - Build and deploy
echo       - Link repository
echo       - choose GitHub, then chubby-turtle
echo.
echo   Settings are already written in netlify.toml,
echo   so there is nothing to fill in.
echo.
echo   After that: publishing = double-click publish.bat
echo   Same link, forever.
echo.
choice /c YN /m "  Open Netlify now"
if not errorlevel 2 start "" "https://app.netlify.com"
echo.
pause
exit /b 0

:err
echo.
echo  [X] Something failed. Scroll up to see the message.
echo.
echo      Most common causes:
echo        - the pasted address was wrong
echo        - the GitHub repository was created WITH a README
echo          (create a new empty one and run this again)
echo.
pause
exit /b 1
