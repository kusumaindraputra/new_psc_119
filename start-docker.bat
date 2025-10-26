@echo off
REM Quick start script for PSC 119 Docker setup

echo.
echo ============================================
echo   PSC 119 - Docker Quick Start
echo ============================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo [OK] Docker is running
echo.

REM Check if containers are already running
docker-compose ps | findstr "psc119" >nul 2>&1
if not errorlevel 1 (
    echo [INFO] PSC 119 containers are already running
    echo.
    choice /C YN /M "Do you want to restart them"
    if errorlevel 2 goto :skip_restart
    echo.
    echo [INFO] Restarting containers...
    docker-compose restart
    goto :show_urls
)

:skip_restart
echo [INFO] Starting PSC 119 services...
echo This may take a few minutes on first run...
echo.

docker-compose up -d

if errorlevel 1 (
    echo.
    echo [ERROR] Failed to start services
    echo Check the error messages above
    pause
    exit /b 1
)

echo.
echo [OK] Services started successfully!
echo.

REM Wait a bit for services to be ready
echo [INFO] Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Check if database needs seeding
echo.
choice /C YN /M "Do you want to seed the database (first time setup)"
if errorlevel 2 goto :show_urls

echo.
echo [INFO] Seeding database...
docker-compose exec backend node src/scripts/seed.js

:show_urls
echo.
echo ============================================
echo   PSC 119 Services are Ready!
echo ============================================
echo.
echo   Backend API:    http://localhost:8080
echo   Health Check:   http://localhost:8080/health
echo   Internal PWA:   http://localhost:3001
echo   Public Site:    http://localhost:3000
echo.
echo   Default Login (Internal):
echo   Email:    dispatcher@psc119.id
echo   Password: dispatcher123
echo.
echo ============================================
echo.

choice /C YN /M "Do you want to view the logs"
if errorlevel 2 goto :done

echo.
echo Press Ctrl+C to exit log view
echo.
timeout /t 2 /nobreak >nul
docker-compose logs -f

:done
echo.
echo To stop services:  docker-compose down
echo To view logs:      docker-compose logs -f
echo To restart:        docker-compose restart
echo.
pause
