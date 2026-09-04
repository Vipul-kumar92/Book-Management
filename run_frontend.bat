@echo off
title Book Management System - Frontend (React)
echo ========================================================
echo   Starting Book Management System - Frontend (Port 3000)
echo ========================================================
set "PATH=C:\Program Files\nodejs;C:\Users\vipul\AppData\Roaming\npm;C:\WINDOWS\system32;C:\WINDOWS;C:\WINDOWS\System32\Wbem;%PATH%"
cd /d "%~dp0book_store"
call npm start
pause
