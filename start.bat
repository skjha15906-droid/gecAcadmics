@echo off
title GECWC Academics Server
echo =======================================================
echo   GECWC Academics - CSE Branch Academic Notes Portal
echo   Government Engineering College, West Champaran
echo =======================================================
echo.
echo Starting server on http://localhost:5000 ...
timeout /t 2 /nobreak >nul
start http://localhost:5000
node server/index.js
pause
