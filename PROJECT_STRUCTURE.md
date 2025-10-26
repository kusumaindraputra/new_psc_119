# 📁 PSC 119 - Complete Project Structure

```
new_psc_119/
│
├── 📄 package.json                    # Backend dependencies
├── 📄 .env                            # Environment variables (create from .env.example)
├── 📄 .env.example                    # Environment template
├── 📄 .gitignore                      # Git ignore rules
├── 📄 README.md                       # Main documentation
├── 📄 QUICKSTART.md                   # Quick setup guide
├── 📄 API_TESTING.md                  # API testing examples
├── 📄 PROJECT_STRUCTURE.md            # This file
│
├── 📁 src/                            # Backend source code
│   │
│   ├── 📄 index.js                    # Main Express app entry point
│   │
│   ├── 📁 config/                     # Configuration files
│   │   └── database.js                # Sequelize database config
│   │
│   ├── 📁 models/                     # Sequelize database models
│   │   ├── index.js                   # Model aggregator & associations
│   │   ├── User.js                    # User model (auth, roles)
│   │   ├── Report.js                  # Emergency report model
│   │   ├── Assignment.js              # Task assignment model
│   │   ├── ReportLog.js               # Report activity log
│   │   ├── MasterCategory.js          # Emergency categories
│   │   ├── MasterUnit.js              # Medical units/stations
│   │   └── MasterVehicle.js           # Ambulances/vehicles
│   │
│   ├── 📁 controllers/                # Request handlers (thin layer)
│   │   ├── authController.js          # Login, register, profile
│   │   ├── reportController.js        # Report CRUD operations
│   │   ├── assignmentController.js    # Assignment management
│   │   ├── adminController.js         # Master data management
│   │   └── dashboardController.js     # Analytics & metrics
│   │
│   ├── 📁 services/                   # Business logic (fat layer)
│   │   ├── authService.js             # Authentication logic
│   │   ├── reportService.js           # Report business logic
│   │   └── assignmentService.js       # Assignment business logic
│   │
│   ├── 📁 middlewares/                # Express middlewares
│   │   ├── auth.js                    # JWT authentication & authorization
│   │   ├── errorHandler.js            # Global error handler
│   │   └── upload.js                  # Multer file upload config
│   │
│   ├── 📁 routes/                     # API route definitions
│   │   ├── index.js                   # Route aggregator
│   │   ├── authRoutes.js              # /api/auth/*
│   │   ├── reportRoutes.js            # /api/reports/*
│   │   ├── assignmentRoutes.js        # /api/assignments/*
│   │   ├── adminRoutes.js             # /api/admin/*
│   │   ├── dashboardRoutes.js         # /api/dashboard/*
│   │   └── sseRoutes.js               # /api/stream/*
│   │
│   ├── 📁 events/                     # Server-Sent Events (SSE)
│   │   ├── eventEmitter.js            # Custom SSE event manager
│   │   └── sseController.js           # SSE streaming controller
│   │
│   └── 📁 scripts/                    # Utility scripts
│       └── seed.js                    # Database seeding script
│
├── 📁 frontend-public/                # Public reporting web app
│   │
│   ├── 📄 package.json                # Frontend dependencies
│   ├── 📄 vite.config.js              # Vite build configuration
│   ├── 📄 tailwind.config.js          # Tailwind CSS config
│   ├── 📄 postcss.config.js           # PostCSS config
│   ├── 📄 index.html                  # HTML entry point
│   ├── 📄 README.md                   # Frontend documentation
│   │
│   └── 📁 src/
│       ├── 📄 main.jsx                # React entry point
│       ├── 📄 App.jsx                 # Main App component with routing
│       ├── 📄 index.css               # Global styles with Tailwind
│       │
│       ├── 📁 components/             # Reusable React components
│       │   ├── Header.jsx             # Top navigation bar
│       │   └── Footer.jsx             # Footer section
│       │
│       ├── 📁 pages/                  # Page components
│       │   ├── HomePage.jsx           # Landing page
│       │   ├── ReportPage.jsx         # Emergency report form
│       │   └── TrackPage.jsx          # Report tracking interface
│       │
│       └── 📁 services/               # API integration layer
│           └── api.js                 # Axios setup & API methods
│
├── 📁 uploads/                        # File upload storage (gitignored)
│   ├── reports/                       # Report photos
│   └── proofs/                        # Completion proof photos
│
└── 📁 node_modules/                   # Dependencies (gitignored)
```

## 🎯 Key Architecture Patterns

### Backend (MVC + Service Layer)

```
Request → Route → Middleware → Controller → Service → Model → Database
                                                      ↓
                                                  Event Emitter → SSE Clients
```

**Flow:**
1. **Route** defines the endpoint and attaches middlewares
2. **Middleware** handles auth, validation, file uploads
3. **Controller** receives request, calls service, sends response
4. **Service** contains business logic and data transformation
5. **Model** interacts with database via Sequelize ORM
6. **Event Emitter** broadcasts changes to SSE clients

### Frontend (Component-Based)

```
Browser → App (Router) → Page Component → API Service → Backend
                              ↓
                          Child Components
```

## 📦 Key Dependencies

### Backend
- **express**: Web framework
- **sequelize**: ORM for PostgreSQL
- **pg**: PostgreSQL client
- **jsonwebtoken**: JWT authentication
- **bcryptjs**: Password hashing
- **multer**: File upload handling
- **dotenv**: Environment variables
- **helmet**: Security headers
- **cors**: Cross-origin resource sharing
- **morgan**: HTTP request logger

### Frontend
- **react**: UI library
- **react-router-dom**: Client-side routing
- **axios**: HTTP client
- **tailwindcss**: Utility-first CSS
- **vite**: Build tool & dev server
- **react-toastify**: Toast notifications

## 🔐 Security Layers

1. **Authentication**: JWT tokens (24h expiry)
2. **Authorization**: Role-based access control (RBAC)
3. **Password**: Bcrypt hashing (10 rounds)
4. **Rate Limiting**: 100 requests per 15 min per IP
5. **Helmet**: Security headers (XSS, CSP, etc.)
6. **CORS**: Restricted origins
7. **Input Validation**: Sequelize validation
8. **SQL Injection**: Parameterized queries via ORM

## 📊 Data Flow Examples

### Create Report (Public)
```
User Form → POST /api/reports → reportController.createReport()
                                      ↓
                                reportService.createReport()
                                      ↓
                                Report.create() + ReportLog.create()
                                      ↓
                                eventEmitter.emit('new_report')
                                      ↓
                                SSE broadcast to dispatchers
```

### Assign Task (Dispatcher)
```
Dispatcher → POST /api/assignments → auth middleware (check JWT)
                                           ↓
                                     authorize('dispatcher')
                                           ↓
                                     assignmentController.createAssignment()
                                           ↓
                                     assignmentService.createAssignment()
                                           ↓
                                     Assignment.create() + Report.update()
                                           ↓
                                     eventEmitter.emit('assigned_task')
                                           ↓
                                     SSE broadcast to field officer
```

## 🗂️ Database Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| **users** | System users | id, name, role, email, phone, password_hash |
| **reports** | Emergency reports | id, reporter_name, phone, coordinates, status, photo_url |
| **assignments** | Task assignments | id, report_id, assigned_to, assigned_by, status |
| **report_logs** | Activity logs | id, report_id, actor_id, action, notes, photo_url |
| **master_categories** | Report categories | id, name, description |
| **master_units** | Medical units | id, name, location, coordinates |
| **master_vehicles** | Vehicles | id, plate_number, type, status, unit_id |

## 🔄 Status Workflows

### Report Status Flow
```
pending → verified → assigned → in_progress → closed
   ↓
rejected
```

### Assignment Status Flow
```
pending → accepted → in_progress → completed
   ↓
cancelled
```

## 🎨 UI Pages Overview

### Public Web (`/`)
- **HomePage**: Hero, features, CTA
- **ReportPage**: Emergency form with GPS
- **TrackPage**: Status tracking by phone

### Internal Web (To Be Built)
- **LoginPage**: Authentication
- **DispatcherDashboard**: Incoming reports
- **AssignmentPanel**: Create assignments
- **FieldTaskView**: Officer task list
- **AnalyticsDashboard**: Metrics & charts
- **AdminPanel**: Master data management

## 📡 API Endpoint Categories

```
/api
├── /auth              # Authentication (public + protected)
├── /reports           # Report management (mixed)
├── /assignments       # Assignment management (protected)
├── /admin             # Master data CRUD (admin only)
├── /dashboard         # Analytics & metrics (managerial)
└── /stream            # SSE event streaming (protected)
```

## 🚀 Deployment Structure

```
Production Server
├── Backend (Node.js + PM2)
│   ├── Port 8080
│   ├── PostgreSQL connection
│   └── SSE connections
│
├── Frontend (Static Files)
│   ├── Nginx serving /dist
│   └── Proxy /api → Backend
│
└── Database (PostgreSQL)
    ├── Port 5432
    └── Backup automation
```

## 🧪 Testing Strategy

1. **Unit Tests**: Service layer functions
2. **Integration Tests**: API endpoints
3. **E2E Tests**: Full user workflows
4. **Load Tests**: SSE connections, concurrent users
5. **Security Tests**: Auth bypass, SQL injection, XSS

## 📝 Environment Files

### Backend `.env`
```env
# Server
PORT=8080
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=psc119
DB_PASS=yourpassword
DB_NAME=psc119_db

# JWT
JWT_SECRET=supersecret
JWT_EXPIRES_IN=24h

# SSE
SSE_TIMEOUT=300000

# Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:8080/api
```

## 🔧 Development Commands

### Backend
```bash
npm run dev          # Start with nodemon
npm start            # Production start
node src/scripts/seed.js  # Seed database
```

### Frontend
```bash
npm run dev          # Vite dev server
npm run build        # Production build
npm run preview      # Preview build
```

## 📈 Performance Considerations

- **Database**: Indexes on status, created_at, coordinates
- **Caching**: Consider Redis for sessions/frequent queries
- **CDN**: Serve static assets via CDN
- **Image Optimization**: Compress uploads, use thumbnails
- **SSE**: Monitor connection count, implement reconnection logic
- **Database Connection Pool**: Max 10 connections

---

**This structure follows clean architecture principles with separation of concerns, making the codebase maintainable and scalable.**
