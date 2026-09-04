@echo off
title Book Management System - Backend (Spring Boot)
echo ========================================================
echo   Starting Book Management System - Backend (Port 8080)
echo ========================================================
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.8.9-hotspot"
set "PATH=C:\Program Files\Eclipse Adoptium\jdk-21.0.8.9-hotspot\bin;C:\WINDOWS\system32;C:\WINDOWS;C:\WINDOWS\System32\Wbem;%PATH%"
cd /d "%~dp0Book"
call .\mvnw.cmd spring-boot:run
pause
