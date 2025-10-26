# PSC 119 - Emergency Reporting & Response System

🏥 A comprehensive web-based emergency reporting and response system for medical emergencies built with Node.js, Express, PostgreSQL, React, and Server-Sent Events (SSE).

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [User Roles](#user-roles)

## 🎯 Overview

PSC 119 enables citizens to submit emergency reports without authentication, which are then verified by dispatchers, assigned to field officers, and monitored by managerial teams through real-time dashboards.

## ✨ Features

- 📱 **Public Reporting** - Citizens can submit reports without login
- 🔄 **Real-time Updates** - SSE for live notifications
- 👥 **Role-based Access** - Admin, Dispatcher, Field Officer, Managerial
- 📊 **Analytics Dashboard** - SLA tracking, performance metrics
- 🚑 **Assignment Management** - Task assignment and tracking
- 📸 **Photo Upload** - Evidence and proof photos
- 🗺️ **GPS Coordinates** - Automatic location capture
- 📈 **Performance Tracking** - Officer performance metrics

## 🏗️ Architecture

```
- [Docker Setup](#docker-setup)
    ├── Public Web (Reporting)
    └── Internal PWA (Dashboard + Management)
```

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Authentication**: JWT
- **Real-time**: Server-Sent Events (SSE)
- **File Upload**: Multer

### Frontend
- **Framework**: React
- **Styling**: Tailwind CSS
- **PWA**: Service Workers
- **State**: Context API / Redux
- **HTTP**: Axios / Fetch

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher (Vite 5 and the backend target Node 18)
- PostgreSQL 13 or higher
- npm (recommended) or yarn
- Windows users: if testing from your phone on LAN, add inbound firewall rules for TCP 8080, 3000, 3001

### Backend Setup

1. **Clone the repository**
   ```bash
   cd d:/proj/new_psc_119
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your database credentials:
   ```env
   PORT=8080
   DB_HOST=localhost
   DB_USER=psc119
   DB_PASS=yourpassword
   DB_NAME=psc119_db
   JWT_SECRET=your_secure_secret
   ```

4. **Create PostgreSQL database**
   ```sql
   CREATE DATABASE psc119_db;
   ```

5. **Initialize database and seed**
  There is no separate migration step in dev; models auto-sync on start. Seed once after first successful start:
  ```powershell
  # Start once to let Sequelize create tables
  npm run dev
  # In another terminal, seed initial data
  node src/scripts/seed.js
  ```

6. **Start the server (development)**
   ```bash
   npm run dev
   ```

Server will run on `http://localhost:8080`

Health check: `GET http://localhost:8080/health`

API base: `http://localhost:8080/api`

> Note: For development frontends, use the relative path `/api` (see frontends below). Vite or Nginx will proxy `/api` to the backend to avoid CORS issues.

### Frontend – Internal (React PWA)

1. Open the internal frontend
  ```powershell
  cd frontend-internal
  npm ci
  ```
2. Environment (already set in `.env`)
  ```env
  VITE_API_URL=/api
  ```
3. Run (development)
  ```powershell
  npm run dev
  ```
  - Local: http://localhost:3001
  - Network (LAN): http://<your_LAN_IP>:3001
  - Vite proxies:
    - `/api` → http://localhost:8080
    - `/health` → http://localhost:8080

PWA install note: Mobile install prompts require HTTPS or localhost. For a true install experience on phones, use an HTTPS tunnel or staging (see below).

### Frontend – Public (React)

1. Open the public frontend
  ```powershell
  cd frontend-public
  npm ci
  npm run dev
  ```

## 🐳 Docker Setup

**Recommended for local development - eliminates terminal conflicts!**

### Quick Start with Docker

```powershell
# 1. Start all services (PostgreSQL, Backend, Both Frontends)
docker-compose up -d

# 2. Wait for services to be ready (check logs)
docker-compose logs -f

# 3. Seed database (first time only)
docker-compose exec backend node src/scripts/seed.js

# 4. Access applications
# Backend API: http://localhost:8080
# Internal PWA: http://localhost:3001
# Public Site: http://localhost:3000
```

### Docker Benefits

- ✅ **No Terminal Conflicts** - All services in isolated containers
- ✅ **Hot-Reload Enabled** - Code changes auto-reload
- ✅ **Database Included** - PostgreSQL runs in container
- ✅ **One Command Start/Stop** - `docker-compose up -d` / `docker-compose down`
- ✅ **Consistent Environment** - Works on any machine with Docker

### Essential Docker Commands

```powershell
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart a service
docker-compose restart backend

# Check status
docker-compose ps

# Health check
.\health-check.ps1
```

### Documentation

- **Full Docker Guide**: [DOCKER_LOCAL.md](./DOCKER_LOCAL.md)
- **Command Reference**: [DOCKER_COMMANDS.md](./DOCKER_COMMANDS.md)
- **Setup Summary**: [DOCKER_SETUP.md](./DOCKER_SETUP.md)

  - Local: http://localhost:3000
  - Vite proxies:
    - `/api` → http://localhost:8080
    - `/uploads` → http://localhost:8080

### Dev commands and ports

- Backend API (Express)
  - Run: `npm run dev`
  - Port: 8080
- Internal frontend (Vite)
  - Run: `npm run dev` in `frontend-internal`
  - Port: 3001
- Public frontend (Vite)
  - Run: `npm run dev` in `frontend-public`
  - Port: 3000

### Staging deployment (Docker Compose + Cloudflare)

For a production-like HTTPS environment and a reliable PWA install experience, deploy the included staging stack:

- Compose file: `docker-compose.staging.yml`
- Services:
  - `db` (Postgres)
  - `backend` (Node/Express, internal only)
  - `internal_web` (Nginx serving internal app, exposed on host 8081)
  - `public_web` (Nginx serving public app, exposed on host 8082)
- Recommended: map subdomains via Cloudflare Tunnel → 8081/8082

See STAGING.md for full instructions.

### Default Credentials

After seeding:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@psc119.id | admin123 |
| Dispatcher | dispatcher@psc119.id | dispatcher123 |
| Field Officer 1 | field1@psc119.id | field123 |
| Field Officer 2 | field2@psc119.id | field123 |
| Manager | manager@psc119.id | manager123 |

## 📡 API Documentation

### Base URL
```
http://localhost:8080/api
```

### Authentication Routes

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "081234567890",
  "password": "password123",
  "role": "field_officer"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@psc119.id",
  "password": "admin123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### Report Routes

#### Create Report (Public - No Auth)
```http
POST /api/reports
Content-Type: multipart/form-data

{
  "reporter_name": "Jane Doe",
  "phone": "081234567890",
  "description": "Kecelakaan mobil di Jl. Sudirman",
  "coordinates": {
    "type": "Point",
    "coordinates": [106.8229, -6.2088]
  },
  "address": "Jl. Sudirman No. 123",
  "photo": <file>,
  "category_id": "uuid-here"
}
```

#### Get All Reports
```http
GET /api/reports?status=pending&page=1&limit=20
Authorization: Bearer <token>
```

#### Get Report by ID
```http
GET /api/reports/:reportId
Authorization: Bearer <token>
```

#### Update Report Status
```http
PUT /api/reports/:reportId/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "verified",
  "notes": "Laporan telah diverifikasi"
}
```

#### Track Report by Phone (Public)
```http
GET /api/reports/track/:phone
```

### Assignment Routes

#### Create Assignment
```http
POST /api/assignments
Authorization: Bearer <token>
Content-Type: application/json

{
  "report_id": "uuid-here",
  "assigned_to": "uuid-here",
  "vehicle_id": "uuid-here",
  "unit_id": "uuid-here",
  "notes": "Segera tangani"
}
```

#### Get My Assignments
```http
GET /api/assignments/my?status=pending
Authorization: Bearer <token>
```

#### Update Assignment Status
```http
PUT /api/assignments/:assignmentId/status
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "status": "completed",
  "notes": "Pasien telah dibawa ke RS",
  "photo": <file>
}
```

### Admin Routes

#### Get All Categories
```http
GET /api/admin/categories
Authorization: Bearer <token>
```

#### Create Category
```http
POST /api/admin/categories
Authorization: Bearer <token>

{
  "name": "Kebakaran",
  "description": "Emergency kebakaran"
}
```

#### Get All Vehicles
```http
GET /api/admin/vehicles?status=available
Authorization: Bearer <token>
```

### Dashboard Routes

#### Get Metrics
```http
GET /api/dashboard/metrics?dateFrom=2025-01-01&dateTo=2025-12-31
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "data": {
    "reportsByStatus": [...],
    "reportsByPriority": [...],
    "assignmentsByStatus": [...],
    "responseTime": {
      "avgVerificationMinutes": "12.5",
      "avgClosureHours": "2.3"
    },
    "sla": {
      "withinSLA": 45,
      "exceededSLA": 5,
      "totalClosed": 50,
      "slaPercentage": "90.00"
    },
    "activeFieldOfficers": 10
  }
}
```

#### Get Performance by Officer
```http
GET /api/dashboard/performance
Authorization: Bearer <token>
```

### SSE Streaming

#### Connect to Event Stream
```http
GET /api/stream/events
Authorization: Bearer <token>
```

Events:
- `connected` - Initial connection
- `new_report` - New report created
- `assigned_task` - Task assigned to officer
- `report_update` - Report status updated
- `heartbeat` - Keep-alive ping (every 30s)

Example client:
```javascript
const token = localStorage.getItem('token');
// Note: native EventSource doesn't support custom headers.
// Use a token as a query param (ensure backend supports it) or a fetch-based polyfill.
const eventSource = new EventSource(`http://localhost:8080/api/stream/events?token=${token}`);

eventSource.addEventListener('new_report', (event) => {
  const data = JSON.parse(event.data);
  console.log('New report:', data);
});
```

## 🗄️ Database Schema

### users
- id (UUID, PK)
- name (STRING)
- role (ENUM: admin, dispatcher, field_officer, managerial)
- phone (STRING, UNIQUE)
- email (STRING, UNIQUE)
- password_hash (STRING)
- is_active (BOOLEAN)
- last_login (DATE)

### reports
- id (UUID, PK)
- reporter_name (STRING)
- phone (STRING)
- description (TEXT)
- photo_url (STRING)
- coordinates (GEOMETRY POINT)
- address (TEXT)
- status (ENUM: pending, verified, assigned, in_progress, closed, rejected)
- source (ENUM: web, mobile, phone, other)
- category_id (UUID, FK)
- priority (ENUM: low, medium, high, critical)
- verified_at (DATE)
- closed_at (DATE)

### assignments
- id (UUID, PK)
- report_id (UUID, FK)
- assigned_to (UUID, FK)
- assigned_by (UUID, FK)
- vehicle_id (UUID, FK)
- unit_id (UUID, FK)
- status (ENUM: pending, accepted, in_progress, completed, cancelled)
- notes (TEXT)
- assigned_at (DATE)
- accepted_at (DATE)
- completed_at (DATE)

### report_logs
- id (UUID, PK)
- report_id (UUID, FK)
- actor_id (UUID, FK)
- action (STRING)
- notes (TEXT)
- photo_url (STRING)
- metadata (JSONB)
- created_at (DATE)

### master_categories
- id (UUID, PK)
- name (STRING, UNIQUE)
- description (TEXT)
- is_active (BOOLEAN)

### master_units
- id (UUID, PK)
- name (STRING, UNIQUE)
- location (STRING)
- coordinates (GEOMETRY POINT)
- contact_phone (STRING)
- is_active (BOOLEAN)

### master_vehicles
- id (UUID, PK)
- plate_number (STRING, UNIQUE)
- type (ENUM: ambulance, rescue, support, other)
- status (ENUM: available, in_use, maintenance, unavailable)
- unit_id (UUID, FK)
- is_active (BOOLEAN)

## 👥 User Roles

| Role | Permissions |
|------|-------------|
| **Reporter** | Submit reports (no login), track status by phone |
| **Dispatcher** | View reports, verify reports, assign to field officers |
| **Field Officer** | View assigned tasks, update status, upload proof photos |
| **Admin** | Manage users, categories, vehicles, units |
| **Managerial** | View dashboards, metrics, SLA, performance stats |

## 📊 Process Flow

1. **Citizen submits report** → System captures GPS automatically
2. **Dispatcher verifies** → Via phone call (external)
3. **Dispatcher assigns** → Assigns verified report to field team
4. **Field team updates** → In Progress → Closed with proof photo
5. **SSE notifies** → Real-time updates to all relevant users
6. **Dashboard tracks** → SLA, response time, performance

## 🔒 Security

- JWT-based authentication
- Role-based authorization
- Password hashing (bcrypt)
- Rate limiting
- Helmet.js security headers
- CORS configuration
- Input validation

## 📲 PWA install (mobile)

- The internal app includes a service worker and manifest for PWA behavior.
- Mobile browsers only show the native install prompt over HTTPS or on localhost.
- Use Cloudflare Tunnel or the staging stack for an HTTPS URL to test install flows.

## 🛠️ Troubleshooting

- “Cannot reach http://<LAN_IP>:3001”
  - Ensure you ran `npm ci` inside `frontend-internal` and then `npm run dev`.
  - Check Windows Firewall inbound rule for port 3001.
  - Confirm Vite is listening on 0.0.0.0 in `frontend-internal/vite.config.js`.
  - Check port conflicts: `netstat -ano | findstr :3001` then kill any stray `node.exe`.
- Backend health is OK in browser but frontend says “Cannot reach backend”
  - Verify the internal app uses `/api` and `/health` proxy in Vite config.
  - If bypassing the proxy, ensure `CORS_ORIGIN` allows your origin.
- Stale assets due to service worker
  - Hard refresh or clear site data; during dev, keep the app on Vite (unregister SW if needed).

## 📝 License

ISC

## 👨‍💻 Development

Built for PSC 119 Emergency Response System.

---

**Need help?** Contact the PSC 119 development team.
