#!/bin/sh
# Health check script for Docker containers

echo "🔍 Checking PSC 119 Services..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker is not running"
  exit 1
fi

echo "✅ Docker is running"
echo ""

# Check services
echo "📊 Service Status:"
docker-compose ps
echo ""

# Check backend health
echo "🔧 Backend Health:"
if curl -f http://localhost:8080/health > /dev/null 2>&1; then
  echo "✅ Backend API is healthy"
  curl -s http://localhost:8080/health | head -1
else
  echo "❌ Backend API is not responding"
fi
echo ""

# Check frontend-internal
echo "🖥️  Frontend Internal:"
if curl -f http://localhost:3001 > /dev/null 2>&1; then
  echo "✅ Internal frontend is running"
else
  echo "❌ Internal frontend is not responding"
fi
echo ""

# Check frontend-public
echo "🌐 Frontend Public:"
if curl -f http://localhost:3000 > /dev/null 2>&1; then
  echo "✅ Public frontend is running"
else
  echo "❌ Public frontend is not responding"
fi
echo ""

# Check database
echo "💾 Database:"
if docker-compose exec -T db pg_isready -U postgres > /dev/null 2>&1; then
  echo "✅ PostgreSQL is ready"
else
  echo "❌ PostgreSQL is not ready"
fi
echo ""

echo "✨ Health check complete!"
