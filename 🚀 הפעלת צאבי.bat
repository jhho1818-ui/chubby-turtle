@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  Turtle  Starting Chubby the Turtle...
echo  פותח את צאבי הצב בדפדפן...
echo.
where py >nul 2>&1 && (
  start "" "http://127.0.0.1:5173"
  py -m http.server 5173
  goto :eof
)
where python >nul 2>&1 && (
  start "" "http://127.0.0.1:5173"
  python -m http.server 5173
  goto :eof
)
where npx >nul 2>&1 && (
  start "" "http://127.0.0.1:5173"
  npx --yes serve -l 5173
  goto :eof
)
echo לא נמצא Python או Node. פותח את index.html ישירות...
start "" "%~dp0index.html"
pause
