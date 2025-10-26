# 🚀 Quick Start Guide - PSC 119

This guide will help you get the PSC 119 system up and running in minutes.

## 📋 Prerequisites Checklist

- [ ] Node.js v16 or higher installed
- [ ] PostgreSQL v13 or higher installed and running
- [ ] Git installed (optional)

## 🎯 Quick Setup (5 minutes)

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

### Step 7: Frontend Setup

```powershell
# Navigate to public frontend
cd frontend-public

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on: `http://localhost:3000`

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

### Test 2: Login to Internal System

API endpoint: `POST http://localhost:8080/api/auth/login`

```json
{
  "email": "dispatcher@psc119.id",
  "password": "dispatcher123"
}
```

You'll receive a JWT token to use for authenticated requests.

### Test 3: Track Report

1. Go to `http://localhost:3000/track`
2. Enter phone: 081234567890
3. See your submitted reports

### Test 4: SSE Stream

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
├── package.json              # Backend dependencies
├── .env                      # Environment config
└── README.md                 # Main documentation
```

## 🔄 Development Workflow

1. **Backend changes**: Edit files in `/src`, nodemon auto-restarts
2. **Frontend changes**: Edit files in `/frontend-public/src`, Vite hot-reloads
3. **Database changes**: Modify models in `/src/models`, restart server to sync
4. **Add API endpoint**: 
   - Create service in `/src/services`
   - Create controller in `/src/controllers`
   - Add route in `/src/routes`

## 📚 Next Steps

- [ ] Build internal PWA for dispatchers and field officers
- [ ] Add real-time dashboard with charts
- [ ] Implement service worker for offline support
- [ ] Add push notifications
- [ ] Deploy to production server

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
