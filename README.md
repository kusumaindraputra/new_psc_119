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
PSC 119
├── Backend (Node.js + Express)
│   ├── REST API
│   ├── JWT Authentication
│   ├── SSE Event Streaming
│   └── PostgreSQL + Sequelize ORM
│
└── Frontend (React)
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

- Node.js (v16 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn

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

5. **Run database migrations and seed**
   ```bash
   npm run dev
   ```
   
   After first run, seed the database:
   ```bash
   node src/scripts/seed.js
   ```

6. **Start the server**
   ```bash
   npm run dev
   ```

Server will run on `http://localhost:8080`

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
const eventSource = new EventSource(`http://localhost:8080/api/stream/events`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

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

## 📝 License

ISC

## 👨‍💻 Development

Built for PSC 119 Emergency Response System.

---

**Need help?** Contact the PSC 119 development team.
