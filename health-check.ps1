# Health check script for Docker containers (PowerShell version)

Write-Host "🔍 Checking PSC 119 Services..." -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Check services
Write-Host "📊 Service Status:" -ForegroundColor Cyan
docker-compose ps
Write-Host ""

# Check backend health
Write-Host "🔧 Backend Health:" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/health" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Backend API is healthy" -ForegroundColor Green
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Compress
} catch {
    Write-Host "❌ Backend API is not responding" -ForegroundColor Red
}
Write-Host ""

# Check frontend-internal
Write-Host "🖥️  Frontend Internal:" -ForegroundColor Cyan
try {
    $null = Invoke-WebRequest -Uri "http://localhost:3001" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Internal frontend is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Internal frontend is not responding" -ForegroundColor Red
}
Write-Host ""

# Check frontend-public
Write-Host "🌐 Frontend Public:" -ForegroundColor Cyan
try {
    $null = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Public frontend is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Public frontend is not responding" -ForegroundColor Red
}
Write-Host ""

# Check database
Write-Host "💾 Database:" -ForegroundColor Cyan
try {
    docker-compose exec -T db pg_isready -U postgres | Out-Null
    Write-Host "✅ PostgreSQL is ready" -ForegroundColor Green
} catch {
    Write-Host "❌ PostgreSQL is not ready" -ForegroundColor Red
}
Write-Host ""

Write-Host "✨ Health check complete!" -ForegroundColor Cyan
