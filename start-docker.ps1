# Quick start script for PSC 119 Docker setup

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   PSC 119 - Docker Quick Start" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "[OK] Docker is running" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Docker is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again." -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host ""

# Check if containers are already running
$running = docker-compose ps --services --filter "status=running" 2>$null
if ($running) {
    Write-Host "[INFO] PSC 119 containers are already running" -ForegroundColor Yellow
    Write-Host ""
    $restart = Read-Host "Do you want to restart them? (Y/N)"
    if ($restart -eq "Y" -or $restart -eq "y") {
        Write-Host ""
        Write-Host "[INFO] Restarting containers..." -ForegroundColor Cyan
        docker-compose restart
    }
} else {
    Write-Host "[INFO] Starting PSC 119 services..." -ForegroundColor Cyan
    Write-Host "This may take a few minutes on first run..." -ForegroundColor Yellow
    Write-Host ""

    docker-compose up -d

    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "[ERROR] Failed to start services" -ForegroundColor Red
        Write-Host "Check the error messages above" -ForegroundColor Yellow
        pause
        exit 1
    }

    Write-Host ""
    Write-Host "[OK] Services started successfully!" -ForegroundColor Green
    Write-Host ""

    # Wait a bit for services to be ready
    Write-Host "[INFO] Waiting for services to be ready..." -ForegroundColor Cyan
    Start-Sleep -Seconds 10

    # Ask if database needs seeding
    Write-Host ""
    $seed = Read-Host "Do you want to seed the database (first time setup)? (Y/N)"
    if ($seed -eq "Y" -or $seed -eq "y") {
        Write-Host ""
        Write-Host "[INFO] Seeding database..." -ForegroundColor Cyan
        docker-compose exec backend node src/scripts/seed.js
    }
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   PSC 119 Services are Ready!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Backend API:    http://localhost:8080" -ForegroundColor White
Write-Host "   Health Check:   http://localhost:8080/health" -ForegroundColor White
Write-Host "   Internal PWA:   http://localhost:3001" -ForegroundColor White
Write-Host "   Public Site:    http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "   Default Login (Internal):" -ForegroundColor Yellow
Write-Host "   Email:    dispatcher@psc119.id" -ForegroundColor White
Write-Host "   Password: dispatcher123" -ForegroundColor White
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$logs = Read-Host "Do you want to view the logs? (Y/N)"
if ($logs -eq "Y" -or $logs -eq "y") {
    Write-Host ""
    Write-Host "Press Ctrl+C to exit log view" -ForegroundColor Yellow
    Write-Host ""
    Start-Sleep -Seconds 2
    docker-compose logs -f
}

Write-Host ""
Write-Host "To stop services:  docker-compose down" -ForegroundColor Yellow
Write-Host "To view logs:      docker-compose logs -f" -ForegroundColor Yellow
Write-Host "To restart:        docker-compose restart" -ForegroundColor Yellow
Write-Host ""
