# 🚀 Quick Start Guide - PSC 119

This guide will help you get the PSC 119 system up and running in minutes.

## 📋 Prerequisites Checklist

### Option 1: Docker (Recommended - No Terminal Conflicts!)
- [ ] Docker Desktop installed and running
- [ ] Docker Compose v2.x or higher

### Option 2: Manual Setup
- [ ] Node.js v16 or higher installed
- [ ] PostgreSQL v13 or higher installed and running
- [ ] Git installed (optional)

## 🎯 Quick Setup (5 minutes)

## 🐳 Option 1: Docker Setup (Recommended)

**No terminal conflicts! Everything runs in isolated containers with hot-reload.**

### Step 1: Start All Services

```powershell
# Navigate to project root
cd d:\proj\new_psc_119

# Start all services (first time will download images and install dependencies)
docker-compose up -d
```

This single command will:
- ✅ Start PostgreSQL database
- ✅ Start Backend API (with hot-reload)
- ✅ Start Internal Frontend (PWA with hot-reload)
- ✅ Start Public Frontend (with hot-reload)

### Step 2: Wait for Services to Be Ready

```powershell
# Check service status
docker-compose ps

# Follow logs (optional)
docker-compose logs -f
```

Wait until you see:
```
psc119-backend    | ✅ Database connection established successfully.
psc119-backend    | 🚀 PSC 119 Backend API running on http://localhost:8080
psc119-internal   | VITE ... ready in ... ms
psc119-public     | VITE ... ready in ... ms
```

### Step 3: Seed Database (First Time Only)

```powershell
# Run seed script inside backend container
docker-compose exec backend node src/scripts/seed.js
```

This creates default users, categories, units, vehicles, and 8 sample reports for testing.

### Step 4: Access the Applications

- **Backend API**: http://localhost:8080
- **Internal PWA**: http://localhost:3001
- **Public Site**: http://localhost:3000

### Docker Commands Cheat Sheet

```powershell
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f [service-name]

# Restart a service
docker-compose restart [service-name]

# Rebuild after dependency changes
docker-compose up -d --build

# Remove everything (including database data)
docker-compose down -v

# Access container shell
docker-compose exec backend sh
docker-compose exec frontend-internal sh
```

### Benefits of Docker Setup

- ✅ **No Terminal Conflicts**: Each service runs in isolated container
- ✅ **Hot-Reload**: Code changes auto-reload without restart
- ✅ **Consistent Environment**: Same setup across all machines
- ✅ **Easy Cleanup**: `docker-compose down` stops everything
- ✅ **Database Included**: No need to install PostgreSQL
- ✅ **Volume Mounts**: Edit code on host, runs in container

---

## 💻 Option 2: Manual Setup

### Step 1: Backend Setup

```powershell
# Navigate to project root
cd d:\proj\new_psc_119

# Install backend dependencies
npm install

# Create environment file
cp .env.example .env
```

### Step 2: Configure Database

Edit `.env` file with your PostgreSQL credentials:

```env
PORT=8080
DB_HOST=localhost
DB_PORT=5432
DB_USER=psc119
DB_PASS=yourpassword
DB_NAME=psc119_db
JWT_SECRET=your_super_secret_key_change_this
```

### Step 3: Create Database

Open PostgreSQL and run:

```sql
CREATE DATABASE psc119_db;
CREATE USER psc119 WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE psc119_db TO psc119;
```

Or using `psql`:

```powershell
psql -U postgres
CREATE DATABASE psc119_db;
\q
```

### Step 4: Start Backend Server

```powershell
# This will create tables automatically
npm run dev
```

You should see:
```
✅ Database connection established successfully.
✅ Database models synchronized.
🚀 PSC 119 Backend API running on http://localhost:8080
```

### Step 5: Seed Database (First Time Only)

Open a **new terminal** and run:

```powershell
node src/scripts/seed.js
```

This will create:
- Admin user
- Dispatcher user
- 2 Field officers
- Manager user
- Sample categories
- Sample units
- Sample vehicles

### Step 6: Test Backend

Open browser to: `http://localhost:8080/health`

You should see:
```json
{
  "status": "OK",
  "timestamp": "2025-10-26T..."
}
```

### Step 7: Frontend Public Setup

```powershell
# Navigate to public frontend
cd frontend-public

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on: `http://localhost:3000`

### Step 8: Frontend Internal Setup (PWA)

```powershell
# Navigate to internal frontend
cd frontend-internal

# Install dependencies
npm install

# Start development server
npm run dev
```

Internal PWA will run on: `http://localhost:3001`

**Default login:**
- Email: `dispatcher@psc119.id`
- Password: `dispatcher123`

## 🧪 Testing the System

### Test 1: Public Report Submission

1. Go to `http://localhost:3000/report`
2. Fill in the form:
   - Name: Test User
   - Phone: 081234567890
   - Select a category
   - Add description
   - Click "Get Location" button
   - Submit report

### Test 2: Login to Internal PWA

1. Go to `http://localhost:3001/login`
2. Login with dispatcher credentials:
   - Email: `dispatcher@psc119.id`
   - Password: `dispatcher123`
3. Navigate through:
   - **Dashboard**: View metrics and recent reports
   - **Reports**: Verify/reject incoming reports
   - **Assignments**: View all field assignments
   - **Report Detail**: Create assignments for field officers

### Test 3: Field Officer Workflow

1. Login as field officer:
   - Email: `field1@psc119.id`
   - Password: `field123`
2. Go to "My Assignments"
3. Accept an assignment
4. Update status to "In Progress"
5. Upload proof photo and mark as "Completed"

### Test 4: Track Report (Public)

1. Go to `http://localhost:3000/track`
2. Enter phone: 081234567890
3. See your submitted reports

### Test 5: Install PWA

1. Open `http://localhost:3001` in Chrome/Edge
2. Look for install prompt in the bottom-right corner
3. Click "Install" to add to home screen
4. Launch PWA from desktop/home screen

### Test 6: SSE Stream

Open browser console and run:

```javascript
const eventSource = new EventSource('http://localhost:8080/api/stream/events');

eventSource.addEventListener('connected', (e) => {
  console.log('Connected:', JSON.parse(e.data));
});

eventSource.addEventListener('new_report', (e) => {
  console.log('New Report:', JSON.parse(e.data));
});
```

## 🔑 Default Credentials

| Role | Email | Password | Access |
|------|-------|----------|--------|
| **Admin** | admin@psc119.id | admin123 | Full system access |
| **Dispatcher** | dispatcher@psc119.id | dispatcher123 | Verify & assign reports |
| **Field Officer 1** | field1@psc119.id | field123 | Update assignments |
| **Field Officer 2** | field2@psc119.id | field123 | Update assignments |
| **Manager** | manager@psc119.id | manager123 | Dashboard & analytics |

## 📡 API Endpoints Quick Reference

### Public Endpoints (No Auth)

```
POST   /api/reports                    Create new report
GET    /api/reports/track/:phone       Track reports by phone
```

### Authenticated Endpoints

```
POST   /api/auth/login                 Login
GET    /api/auth/profile               Get profile

GET    /api/reports                    Get all reports
GET    /api/reports/:id                Get report by ID
PUT    /api/reports/:id/status         Update report status

GET    /api/assignments                Get all assignments
GET    /api/assignments/my             Get my assignments
POST   /api/assignments                Create assignment
PUT    /api/assignments/:id/status     Update assignment status

GET    /api/dashboard/metrics          Get dashboard metrics
GET    /api/dashboard/performance      Get officer performance

GET    /api/stream/events              SSE event stream
```

## 🐛 Common Issues

### Issue: "Cannot connect to database"

**Solution:**
1. Ensure PostgreSQL is running
2. Check database credentials in `.env`
3. Verify database exists: `psql -U postgres -l`

### Issue: "Port 8080 already in use"

**Solution:**
1. Change PORT in `.env` to another port (e.g., 8081)
2. Or kill the process: `netstat -ano | findstr :8080`

### Issue: "npm install fails"

**Solution:**
1. Clear npm cache: `npm cache clean --force`
2. Delete `node_modules` and `package-lock.json`
3. Run `npm install` again

### Issue: "CORS errors in frontend"

**Solution:**
- Check that backend is running on port 8080
- Verify `vite.config.js` proxy settings
- Clear browser cache

## 📁 Project Structure

```
new_psc_119/
├── src/                      # Backend source
│   ├── controllers/          # Request handlers
│   ├── routes/               # API routes
│   ├── models/               # Database models
│   ├── services/             # Business logic
│   ├── middlewares/          # Auth, error handling
│   ├── events/               # SSE logic
│   ├── config/               # Configuration
│   └── scripts/              # Utility scripts
│
├── frontend-public/          # Public reporting web
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
│
├── frontend-internal/        # Internal PWA for staff
│   ├── src/
│   │   ├── components/       # Modals, layout, etc
│   │   ├── pages/            # Dashboard, reports, assignments
│   │   ├── context/          # AuthContext
│   │   └── services/         # API client
│   ├── public/
│   │   ├── manifest.json     # PWA manifest
│   │   └── sw.js             # Service worker
│   └── package.json
│
├── package.json              # Backend dependencies
├── .env                      # Environment config
└── README.md                 # Main documentation
```

## 🔧 PWA Features (Internal App)

The internal frontend is a Progressive Web App with:

- ✅ **Service Worker**: Caches assets for offline access
- ✅ **Install Prompt**: Users can install to home screen/desktop
- ✅ **Offline Support**: Basic UI works without internet
- ✅ **Responsive**: Works on desktop, tablet, and mobile
- ✅ **Fast Loading**: Cached assets load instantly
- ⏳ **Push Notifications**: Coming soon

### Installing the PWA

**On Desktop (Chrome/Edge):**
1. Open `http://localhost:3001`
2. Click install icon in address bar or use install prompt
3. App opens in standalone window

**On Mobile:**
1. Open site in mobile browser
2. Tap "Add to Home Screen"
3. App appears like native app

**On iOS:**
1. Open in Safari
2. Tap Share button
3. Select "Add to Home Screen"

## 🔄 Development Workflow

1. **Backend changes**: Edit files in `/src`, nodemon auto-restarts
2. **Frontend Public**: Edit files in `/frontend-public/src`, Vite hot-reloads
3. **Frontend Internal**: Edit files in `/frontend-internal/src`, Vite hot-reloads
4. **Database changes**: Modify models in `/src/models`, restart server to sync
5. **Add API endpoint**: 
   - Create service in `/src/services`
   - Create controller in `/src/controllers`
   - Add route in `/src/routes`
6. **Update PWA**: Edit service worker in `/frontend-internal/public/sw.js`

## 📚 Next Steps

- [x] Build internal PWA for dispatchers and field officers
- [x] Add PWA features (service worker, install prompt)
- [x] Implement assignment creation and management
- [x] Add role-based access control
- [ ] Add real-time dashboard with charts
- [ ] Implement push notifications
- [ ] Add offline data sync
- [ ] Deploy to production server
- [ ] Set up CI/CD pipeline

## 💡 Tips

- Use **Postman** or **Thunder Client** (VS Code extension) to test API endpoints
- Keep backend and frontend terminals open side-by-side
- Check browser console for errors
- Use `console.log()` liberally during development
- Commit often: `git add . && git commit -m "your message"`

## 🆘 Need Help?

- Check the main `README.md` for full API documentation
- Review code comments in `/src` files
- Look at example requests in the documentation
- Test endpoints using the seed data

---

**Happy coding! 🚀**
