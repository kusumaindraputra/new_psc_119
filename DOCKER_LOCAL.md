# 🐳 Docker Local Development Setup

Complete Docker setup for running PSC 119 without terminal conflicts.

## 📁 Files Created

```
new_psc_119/
├── docker-compose.yml              # Local development orchestration
├── Dockerfile.backend.dev          # Backend with hot-reload
├── .dockerignore                   # Backend ignore patterns
├── frontend-internal/
│   ├── Dockerfile.dev              # Internal frontend with Vite
│   └── .dockerignore
└── frontend-public/
    ├── Dockerfile.dev              # Public frontend with Vite
    └── .dockerignore
```

## 🚀 Getting Started

### 1. Start Everything

```powershell
docker-compose up -d
```

This starts 4 services:
- PostgreSQL database (port 5432)
- Backend API (port 8080)
- Internal Frontend (port 3001)
- Public Frontend (port 3000)

### 2. Check Service Status

```powershell
docker-compose ps
```

Expected output:
```
NAME                IMAGE                  STATUS         PORTS
psc119-backend      new_psc_119-backend    Up X seconds   0.0.0.0:8080->8080/tcp
psc119-db           postgres:15-alpine     Up X seconds   0.0.0.0:5432->5432/tcp
psc119-internal     frontend-internal      Up X seconds   0.0.0.0:3001->3001/tcp
psc119-public       frontend-public        Up X seconds   0.0.0.0:3000->3000/tcp
```

### 3. View Logs

```powershell
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend-internal
docker-compose logs -f frontend-public
docker-compose logs -f db
```

### 4. Seed Database (First Time)

```powershell
docker-compose exec backend node src/scripts/seed.js
```

### 5. Access Applications

- Backend API: http://localhost:8080
- Backend Health: http://localhost:8080/health
- Internal PWA: http://localhost:3001
- Public Site: http://localhost:3000

## 🔄 Development Workflow

### Code Changes Auto-Reload

All source files are mounted as volumes, so changes are reflected immediately:

**Backend (`/src/**`):**
- Edit any file in `src/`
- Nodemon detects change and restarts automatically
- API updates in ~2 seconds

**Frontend Internal (`/frontend-internal/src/**`):**
- Edit React components
- Vite HMR updates instantly
- No page reload needed

**Frontend Public (`/frontend-public/src/**`):**
- Same as internal frontend
- Hot Module Replacement (HMR)

### Adding Dependencies

If you add new npm packages:

```powershell
# Stop services
docker-compose down

# Rebuild containers (installs new dependencies)
docker-compose up -d --build
```

Or rebuild specific service:

```powershell
docker-compose up -d --build backend
docker-compose up -d --build frontend-internal
```

### Database Access

```powershell
# Connect to PostgreSQL
docker-compose exec db psql -U postgres -d psc119_db

# Run SQL commands
\dt                          # List tables
\d+ users                    # Describe users table
SELECT * FROM reports;       # Query data
\q                           # Quit
```

### Container Shell Access

```powershell
# Backend container shell
docker-compose exec backend sh

# Inside container, you can run:
node src/scripts/seed.js     # Seed database
npm install package-name     # Install package (temporary)
ls -la                       # List files
```

## 🛠️ Common Commands

### Start/Stop

```powershell
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d backend

# Stop all services
docker-compose down

# Stop and remove volumes (deletes database data!)
docker-compose down -v
```

### Restart Services

```powershell
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart frontend-internal
```

### Rebuild Containers

```powershell
# Rebuild all services
docker-compose up -d --build

# Rebuild specific service
docker-compose build backend
docker-compose up -d backend
```

### View Resource Usage

```powershell
# See CPU/memory usage
docker stats

# Specific containers
docker stats psc119-backend psc119-db
```

## 🐛 Troubleshooting

### Port Already in Use

If ports are occupied:

```powershell
# Find process using port 8080
netstat -ano | findstr :8080

# Kill process (replace PID)
taskkill /PID <pid> /F

# Or change ports in docker-compose.yml
ports:
  - "8081:8080"  # Map to different host port
```

### Container Won't Start

```powershell
# Check logs for errors
docker-compose logs backend

# Restart with fresh build
docker-compose down
docker-compose up -d --build
```

### Database Connection Issues

```powershell
# Ensure database is healthy
docker-compose ps

# Check database logs
docker-compose logs db

# Restart database
docker-compose restart db
```

### Clean Slate Reset

```powershell
# Stop everything
docker-compose down -v

# Remove all containers and images
docker-compose down --rmi all -v

# Start fresh
docker-compose up -d --build
```

### Hot-Reload Not Working

1. Ensure volumes are mounted correctly in `docker-compose.yml`
2. Check file is not in `.dockerignore`
3. Restart the service:
   ```powershell
   docker-compose restart backend
   ```

### node_modules Issues

If you see module not found errors:

```powershell
# Rebuild container to reinstall dependencies
docker-compose up -d --build backend
```

## 🔐 Environment Variables

Database credentials are in `docker-compose.yml`:

```yaml
environment:
  POSTGRES_DB: psc119_db
  POSTGRES_USER: postgres
  POSTGRES_PASSWORD: postgres
```

Backend automatically connects to `db` container (Docker network DNS).

## 📊 Architecture

```
┌─────────────────────────────────────────────┐
│           Docker Network (psc119)           │
│                                             │
│  ┌──────────┐      ┌──────────┐           │
│  │          │      │          │           │
│  │ Frontend │─────▶│ Backend  │           │
│  │ Internal │      │   API    │           │
│  │  :3001   │      │  :8080   │           │
│  │          │      │          │           │
│  └──────────┘      └────┬─────┘           │
│                          │                 │
│  ┌──────────┐           │                 │
│  │          │           │                 │
│  │ Frontend │───────────┘                 │
│  │  Public  │           │                 │
│  │  :3000   │      ┌────▼─────┐          │
│  │          │      │          │          │
│  └──────────┘      │PostgreSQL│          │
│                    │   :5432  │          │
│                    │          │          │
│                    └──────────┘          │
└─────────────────────────────────────────────┘
         │              │            │
         │              │            │
    Host Network (Windows)
         │              │            │
    localhost:3001  localhost:8080  localhost:3000
```

## 📦 Volume Mounts

### Backend
- `./src` → `/app/src` (source code)
- `./uploads` → `/app/uploads` (uploaded files)
- `backend_node_modules` → `/app/node_modules` (prevent overwrite)

### Frontend Internal
- `./frontend-internal/src` → `/app/src` (components)
- `./frontend-internal/public` → `/app/public` (PWA assets)
- `internal_node_modules` → `/app/node_modules`

### Frontend Public
- `./frontend-public/src` → `/app/src` (components)
- `public_node_modules` → `/app/node_modules`

### Database
- `db_data` → `/var/lib/postgresql/data` (persistent data)

## 🎯 Benefits Over Manual Setup

| Feature | Docker | Manual |
|---------|--------|--------|
| **Setup Time** | 5 minutes | 15+ minutes |
| **Terminal Conflicts** | None | Multiple terminals needed |
| **Database Setup** | Automatic | Manual install |
| **Hot-Reload** | ✅ Yes | ✅ Yes |
| **Port Conflicts** | Isolated | Can conflict |
| **Clean Shutdown** | 1 command | Stop each terminal |
| **Reproducible** | 100% | Environment dependent |
| **Team Onboarding** | Clone & run | Install everything |

## 🔄 Switching from Manual to Docker

If you were running manually:

1. Stop all terminals (Ctrl+C)
2. Close all PowerShell windows
3. Run: `docker-compose up -d`
4. Seed database: `docker-compose exec backend node src/scripts/seed.js`
5. Done!

Your existing code and database remain unchanged.

## 📝 Notes

- First `docker-compose up` takes 5-10 minutes (downloads images, installs dependencies)
- Subsequent starts are much faster (30 seconds)
- Database data persists across restarts (stored in `db_data` volume)
- To reset database: `docker-compose down -v` (deletes volume)
- Production deployment uses different Dockerfiles (see `DEPLOYMENT.md`)

## 🚀 Next Steps

- Edit code and see changes instantly
- Check logs: `docker-compose logs -f`
- Access shell: `docker-compose exec backend sh`
- Test APIs: http://localhost:8080/health
- Login to PWA: http://localhost:3001 (dispatcher@psc119.id / dispatcher123)

---

**Enjoy conflict-free development! 🎉**
