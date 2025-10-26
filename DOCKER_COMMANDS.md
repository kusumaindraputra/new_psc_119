# PSC 119 - Docker Commands Reference

Quick reference for Docker development commands.

## 🚀 Quick Start

```powershell
# Start everything
docker-compose up -d

# Seed database (first time only)
docker-compose exec backend node src/scripts/seed.js

# View logs
docker-compose logs -f
```

## 📋 Essential Commands

### Start/Stop

```powershell
docker-compose up -d              # Start all services in background
docker-compose up                 # Start with logs in foreground
docker-compose stop               # Stop all services
docker-compose down               # Stop and remove containers
docker-compose down -v            # Stop and remove volumes (DELETE DATA!)
```

### Status & Logs

```powershell
docker-compose ps                 # List running containers
docker-compose logs -f            # Follow all logs
docker-compose logs -f backend    # Follow backend logs only
docker-compose logs --tail=50 backend  # Last 50 lines
```

### Restart Services

```powershell
docker-compose restart            # Restart all
docker-compose restart backend    # Restart backend only
docker-compose restart frontend-internal
docker-compose restart frontend-public
docker-compose restart db
```

### Rebuild

```powershell
docker-compose up -d --build      # Rebuild all and start
docker-compose build backend      # Rebuild backend only
docker-compose up -d backend      # Start rebuilt backend
```

## 🔧 Development Commands

### Access Container Shell

```powershell
docker-compose exec backend sh              # Backend shell
docker-compose exec frontend-internal sh    # Internal frontend shell
docker-compose exec db psql -U postgres     # Database shell
```

### Run Commands in Container

```powershell
# Seed database
docker-compose exec backend node src/scripts/seed.js

# Install package (temporary)
docker-compose exec backend npm install package-name

# Run npm commands
docker-compose exec backend npm run dev
docker-compose exec frontend-internal npm run build
```

### Database Operations

```powershell
# Connect to PostgreSQL
docker-compose exec db psql -U postgres -d psc119_db

# Backup database
docker-compose exec db pg_dump -U postgres psc119_db > backup.sql

# Restore database
docker-compose exec -T db psql -U postgres psc119_db < backup.sql

# SQL commands inside psql:
\dt                    # List tables
\d+ users              # Describe users table
\l                     # List databases
\du                    # List users
\q                     # Quit
```

## 🐛 Debugging

### View Specific Service Logs

```powershell
docker-compose logs backend
docker-compose logs frontend-internal
docker-compose logs frontend-public
docker-compose logs db
```

### Follow Logs in Real-Time

```powershell
docker-compose logs -f backend
```

### Check Container Status

```powershell
docker-compose ps
docker stats                      # Resource usage
```

### Inspect Container

```powershell
docker inspect psc119-backend
docker inspect psc119-db
```

## 🧹 Cleanup

### Remove Stopped Containers

```powershell
docker-compose down
```

### Remove Volumes (Delete Data)

```powershell
docker-compose down -v
```

### Remove Images

```powershell
docker-compose down --rmi all
```

### Complete Reset

```powershell
docker-compose down -v --rmi all
docker system prune -a --volumes
```

## 🔄 Hot-Reload

Code changes auto-reload:

- **Backend**: Edit `/src/**` → Nodemon restarts (~2s)
- **Frontend Internal**: Edit `/frontend-internal/src/**` → Vite HMR (instant)
- **Frontend Public**: Edit `/frontend-public/src/**` → Vite HMR (instant)

If hot-reload stops working:

```powershell
docker-compose restart backend
docker-compose restart frontend-internal
```

## 📦 Adding Dependencies

When you add packages to `package.json`:

```powershell
# Stop services
docker-compose down

# Rebuild containers (installs new dependencies)
docker-compose up -d --build
```

Or rebuild specific service:

```powershell
docker-compose build backend
docker-compose up -d backend
```

## 🌐 URLs

- Backend API: http://localhost:8080
- Backend Health: http://localhost:8080/health
- Internal PWA: http://localhost:3001
- Public Site: http://localhost:3000
- Database: localhost:5432

## 🔑 Default Credentials

Database:
- User: `postgres`
- Password: `postgres`
- Database: `psc119_db`

Application:
- Admin: `admin@psc119.id` / `admin123`
- Dispatcher: `dispatcher@psc119.id` / `dispatcher123`
- Field Officer: `field1@psc119.id` / `field123`
- Manager: `manager@psc119.id` / `manager123`

## 💡 Pro Tips

### Run Multiple Commands

```powershell
docker-compose exec backend sh -c "npm install && node src/scripts/seed.js"
```

### Watch Container Logs

```powershell
# Open multiple terminals and run:
docker-compose logs -f backend          # Terminal 1
docker-compose logs -f frontend-internal # Terminal 2
docker-compose logs -f frontend-public  # Terminal 3
```

### Export Container Logs

```powershell
docker-compose logs > logs.txt
docker-compose logs backend > backend-logs.txt
```

### Check Disk Usage

```powershell
docker system df                # Docker disk usage
docker volume ls                # List volumes
```

### Network Inspection

```powershell
docker network ls               # List networks
docker network inspect psc119_psc119  # Inspect PSC119 network
```

## 🚨 Troubleshooting

### Port Already in Use

```powershell
netstat -ano | findstr :8080    # Find process
taskkill /PID <pid> /F          # Kill process
```

Or change port in `docker-compose.yml`:

```yaml
ports:
  - "8081:8080"  # Use 8081 on host instead
```

### Container Won't Start

```powershell
docker-compose logs backend     # Check error logs
docker-compose restart backend  # Restart service
docker-compose down             # Stop all
docker-compose up -d --build    # Rebuild and start
```

### Database Connection Failed

```powershell
docker-compose ps               # Check db status
docker-compose logs db          # Check db logs
docker-compose restart db       # Restart database
```

### Out of Memory

```powershell
docker system prune -a          # Remove unused data
docker-compose down -v          # Remove volumes
```

### Permission Denied

Run PowerShell as Administrator.

## 📖 More Info

- Full guide: `DOCKER_LOCAL.md`
- Quick start: `QUICKSTART.md`
- Deployment: `DEPLOYMENT.md`

---

**Happy Docker development! 🐳**
