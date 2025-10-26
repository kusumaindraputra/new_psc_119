# 🎯 PSC 119 - Commands Cheat Sheet

Quick reference for common commands and operations.

---

## 🚀 Starting the Application

### Backend
```powershell
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start

# Check if running
curl http://localhost:8080/health
```

### Frontend
```powershell
cd frontend-public

# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

---

## 📦 Installation

### First Time Setup
```powershell
# Backend
npm install
cp .env.example .env
# Edit .env with your settings

# Frontend
cd frontend-public
npm install
cd ..
```

### Update Dependencies
```powershell
# Backend
npm update

# Frontend
cd frontend-public
npm update
```

---

## 🗄️ Database Commands

### PostgreSQL
```powershell
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE psc119_db;

# List databases
\l

# Connect to database
\c psc119_db

# List tables
\dt

# Quit
\q
```

### Sequelize Operations
```powershell
# Sync database (creates tables)
# Done automatically when starting server

# Seed database
node src/scripts/seed.js

# Drop and recreate (WARNING: deletes data)
# Edit src/index.js: sequelize.sync({ force: true })
```

---

## 🧪 Testing API Endpoints

### Using curl

#### Login
```powershell
# Login as admin
curl -X POST http://localhost:8080/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"admin@psc119.id","password":"admin123"}'

# Save token from response
$token = "your_jwt_token_here"
```

#### Create Report (Public)
```powershell
curl -X POST http://localhost:8080/api/reports `
  -H "Content-Type: application/json" `
  -d '{
    "reporter_name":"Test User",
    "phone":"081234567890",
    "description":"Emergency test",
    "coordinates":{"type":"Point","coordinates":[106.82,-6.17]},
    "address":"Test Address"
  }'
```

#### Get Reports (Authenticated)
```powershell
curl http://localhost:8080/api/reports `
  -H "Authorization: Bearer $token"
```

#### Track Report
```powershell
curl http://localhost:8080/api/reports/track/081234567890
```

---

## 🔍 Monitoring & Logs

### View Logs
```powershell
# Backend console logs
# Already visible in terminal running npm run dev

# PM2 logs (production)
pm2 logs psc119-api

# Nginx logs (production)
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Check Status
```powershell
# PM2 status
pm2 status

# PostgreSQL status
# Windows:
Get-Service -Name postgresql*

# Linux:
sudo systemctl status postgresql

# Nginx status (Linux)
sudo systemctl status nginx
```

---

## 🛠️ Development Tasks

### Create New Migration
```powershell
# Manually create in src/scripts/
# Example: src/scripts/migrate_add_field.js
```

### Add New Endpoint
```powershell
# 1. Create service in src/services/
# 2. Create controller in src/controllers/
# 3. Add route in src/routes/
# 4. Test with curl or Postman
```

### Update Model
```powershell
# 1. Edit model file in src/models/
# 2. Restart server (auto-sync in development)
# 3. For production: create migration script
```

---

## 🧹 Maintenance

### Clear Node Modules
```powershell
# Backend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install

# Frontend
cd frontend-public
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Clear Database
```powershell
# Connect to PostgreSQL
psql -U postgres

# Drop and recreate
DROP DATABASE psc119_db;
CREATE DATABASE psc119_db;
\q

# Restart backend to recreate tables
npm run dev

# Reseed
node src/scripts/seed.js
```

### Update Environment Variables
```powershell
# Edit .env
notepad .env

# Restart backend for changes to take effect
# Ctrl+C to stop
npm run dev
```

---

## 🐛 Debugging

### Check Environment Variables
```powershell
# In Node.js
node -e "console.log(require('dotenv').config())"

# Or create debug.js:
# require('dotenv').config();
# console.log(process.env);
node debug.js
```

### Test Database Connection
```powershell
# Create test-db.js:
# require('dotenv').config();
# const { sequelize } = require('./src/models');
# sequelize.authenticate().then(() => console.log('OK')).catch(console.error);

node test-db.js
```

### Check Port Usage
```powershell
# Windows
netstat -ano | findstr :8080
netstat -ano | findstr :3000

# Kill process
taskkill /PID <PID> /F
```

---

## 📤 Deployment

### Build for Production
```powershell
# Backend (no build needed, use as-is)
# Just copy files to server

# Frontend
cd frontend-public
npm run build
# Output in dist/ folder
```

### Deploy to Server (Linux)
```bash
# Pull latest code
git pull origin main

# Install dependencies
npm install --production

# Restart backend
pm2 restart psc119-api

# Rebuild frontend
cd frontend-public
npm install
npm run build
sudo cp -r dist/* /var/www/psc119-web/

# Reload Nginx
sudo systemctl reload nginx
```

---

## 🔐 Security

### Change JWT Secret
```powershell
# Generate new secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Update .env
# JWT_SECRET=new_secret_here

# Restart backend
```

### Update User Password (in database)
```powershell
# Use bcrypt to hash
node -e "console.log(require('bcryptjs').hashSync('newpassword', 10))"

# Update in database
psql -U psc119 psc119_db
UPDATE users SET password_hash='hashed_password' WHERE email='user@example.com';
```

---

## 📊 Analytics

### Query Database Directly
```sql
-- Connect
psql -U psc119 psc119_db

-- Count reports by status
SELECT status, COUNT(*) FROM reports GROUP BY status;

-- Recent reports
SELECT * FROM reports ORDER BY created_at DESC LIMIT 10;

-- Officer workload
SELECT u.name, COUNT(a.id) as assignments
FROM users u
LEFT JOIN assignments a ON u.id = a.assigned_to
WHERE u.role = 'field_officer'
GROUP BY u.id, u.name;
```

---

## 🔄 Git Commands

### Common Workflow
```powershell
# Check status
git status

# Add changes
git add .

# Commit
git commit -m "Add feature X"

# Push
git push origin main

# Pull latest
git pull origin main

# Create branch
git checkout -b feature-name

# Merge branch
git checkout main
git merge feature-name
```

---

## 📝 Quick Fixes

### "Cannot find module"
```powershell
npm install
```

### "Port already in use"
```powershell
# Change PORT in .env
# Or kill process using port
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### "Database connection failed"
```powershell
# Check PostgreSQL is running
Get-Service -Name postgresql*

# Verify .env credentials
# Test connection
psql -U psc119 -d psc119_db -h localhost
```

### "Unauthorized" errors
```powershell
# Check JWT token is valid
# Re-login to get new token
curl -X POST http://localhost:8080/api/auth/login ...
```

---

## 🎯 Useful One-Liners

```powershell
# Get all reports
curl http://localhost:8080/api/reports -H "Authorization: Bearer $token"

# Create test report
curl -X POST http://localhost:8080/api/reports -H "Content-Type: application/json" -d '{...}'

# Check API health
curl http://localhost:8080/health

# Count tables
psql -U psc119 psc119_db -c "\dt" | wc -l

# Find in code
Get-ChildItem -Recurse -Filter *.js | Select-String "search term"

# Backup database
pg_dump -U psc119 psc119_db > backup.sql

# Restore database
psql -U psc119 psc119_db < backup.sql
```

---

## 🆘 Emergency Commands

### Reset Everything
```powershell
# WARNING: Deletes all data!

# Drop database
psql -U postgres -c "DROP DATABASE psc119_db;"
psql -U postgres -c "CREATE DATABASE psc119_db;"

# Clear node_modules
Remove-Item -Recurse -Force node_modules, frontend-public/node_modules

# Reinstall
npm install
cd frontend-public; npm install; cd ..

# Restart
npm run dev

# Reseed
node src/scripts/seed.js
```

### Force Kill All Node Processes
```powershell
# Windows
taskkill /F /IM node.exe

# Linux
pkill -9 node
```

---

**Keep this file handy for quick reference! 📌**
