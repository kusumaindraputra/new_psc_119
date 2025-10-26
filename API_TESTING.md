# PSC 119 API Testing Collection

## Authentication

### Login as Admin
```http
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "admin@psc119.id",
  "password": "admin123"
}
```

### Login as Dispatcher
```http
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "dispatcher@psc119.id",
  "password": "dispatcher123"
}
```

### Login as Field Officer
```http
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "field1@psc119.id",
  "password": "field123"
}
```

### Get Profile
```http
GET http://localhost:8080/api/auth/profile
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## Reports (Public)

### Create Report (Public - No Auth)
```http
POST http://localhost:8080/api/reports
Content-Type: application/json

{
  "reporter_name": "John Doe",
  "phone": "081234567890",
  "description": "Kecelakaan mobil di Jl. Sudirman, butuh ambulans segera!",
  "coordinates": {
    "type": "Point",
    "coordinates": [106.8229, -6.2088]
  },
  "address": "Jl. Sudirman No. 123, Jakarta Selatan",
  "category_id": "YOUR_CATEGORY_ID",
  "source": "web"
}
```

### Track Report by Phone (Public)
```http
GET http://localhost:8080/api/reports/track/081234567890
```

---

## Reports (Authenticated)

### Get All Reports
```http
GET http://localhost:8080/api/reports?status=pending&page=1&limit=10
Authorization: Bearer YOUR_TOKEN_HERE
```

### Get Report by ID
```http
GET http://localhost:8080/api/reports/REPORT_ID_HERE
Authorization: Bearer YOUR_TOKEN_HERE
```

### Update Report Status (Dispatcher/Admin)
```http
PUT http://localhost:8080/api/reports/REPORT_ID_HERE/status
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "status": "verified",
  "notes": "Laporan telah diverifikasi via telepon"
}
```

### Add Report Log
```http
POST http://localhost:8080/api/reports/REPORT_ID_HERE/logs
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "action": "contacted_reporter",
  "notes": "Pelapor dihubungi dan kondisi dikonfirmasi"
}
```

---

## Assignments

### Create Assignment (Dispatcher/Admin)
```http
POST http://localhost:8080/api/assignments
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "report_id": "REPORT_ID_HERE",
  "assigned_to": "FIELD_OFFICER_ID_HERE",
  "vehicle_id": "VEHICLE_ID_HERE",
  "unit_id": "UNIT_ID_HERE",
  "notes": "Segera tangani, prioritas tinggi"
}
```

### Get My Assignments
```http
GET http://localhost:8080/api/assignments/my?status=pending
Authorization: Bearer YOUR_TOKEN_HERE
```

### Get All Assignments
```http
GET http://localhost:8080/api/assignments
Authorization: Bearer YOUR_TOKEN_HERE
```

### Update Assignment Status
```http
PUT http://localhost:8080/api/assignments/ASSIGNMENT_ID_HERE/status
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "status": "accepted",
  "notes": "Tugas diterima, menuju lokasi"
}
```

### Complete Assignment
```http
PUT http://localhost:8080/api/assignments/ASSIGNMENT_ID_HERE/status
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "status": "completed",
  "notes": "Pasien telah dibawa ke RS Siloam, kondisi stabil"
}
```

---

## Master Data (Admin)

### Get All Categories
```http
GET http://localhost:8080/api/admin/categories
Authorization: Bearer YOUR_TOKEN_HERE
```

### Create Category
```http
POST http://localhost:8080/api/admin/categories
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "Kebakaran",
  "description": "Keadaan darurat kebakaran"
}
```

### Get All Units
```http
GET http://localhost:8080/api/admin/units
Authorization: Bearer YOUR_TOKEN_HERE
```

### Get All Vehicles
```http
GET http://localhost:8080/api/admin/vehicles?status=available
Authorization: Bearer YOUR_TOKEN_HERE
```

### Update Vehicle Status
```http
PUT http://localhost:8080/api/admin/vehicles/VEHICLE_ID_HERE
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "status": "in_use"
}
```

---

## Dashboard (Managerial/Admin)

### Get Dashboard Metrics
```http
GET http://localhost:8080/api/dashboard/metrics?dateFrom=2025-01-01&dateTo=2025-12-31
Authorization: Bearer YOUR_TOKEN_HERE
```

### Get Recent Activity
```http
GET http://localhost:8080/api/dashboard/activity?limit=20
Authorization: Bearer YOUR_TOKEN_HERE
```

### Get Officer Performance
```http
GET http://localhost:8080/api/dashboard/performance
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## Server-Sent Events (SSE)

### Connect to Event Stream
```http
GET http://localhost:8080/api/stream/events
Authorization: Bearer YOUR_TOKEN_HERE
```

**JavaScript Client Example:**
```javascript
const token = 'YOUR_JWT_TOKEN';
const eventSource = new EventSource(`http://localhost:8080/api/stream/events?token=${token}`);

// Note: EventSource doesn't support custom headers in browsers
// For production, consider passing token as query param or using a WebSocket

eventSource.addEventListener('connected', (event) => {
  console.log('Connected:', JSON.parse(event.data));
});

eventSource.addEventListener('new_report', (event) => {
  const data = JSON.parse(event.data);
  console.log('New Report:', data);
  // Show notification or update UI
});

eventSource.addEventListener('assigned_task', (event) => {
  const data = JSON.parse(event.data);
  console.log('Task Assigned:', data);
  // Notify field officer
});

eventSource.addEventListener('report_update', (event) => {
  const data = JSON.parse(event.data);
  console.log('Report Updated:', data);
  // Update report status in UI
});

eventSource.addEventListener('heartbeat', (event) => {
  console.log('Heartbeat:', JSON.parse(event.data));
});

eventSource.onerror = (error) => {
  console.error('SSE Error:', error);
  eventSource.close();
};
```

---

## Sample Workflow

### Complete Emergency Report Flow

1. **Citizen submits report** (Public)
```http
POST http://localhost:8080/api/reports
{
  "reporter_name": "Jane Smith",
  "phone": "081234567891",
  "description": "Ayah saya mengalami serangan jantung!",
  "coordinates": {"type": "Point", "coordinates": [106.827, -6.175]},
  "address": "Jl. Medan Merdeka No. 1",
  "category_id": "CATEGORY_ID"
}
```

2. **Dispatcher verifies** (requires auth)
```http
PUT http://localhost:8080/api/reports/{reportId}/status
Authorization: Bearer DISPATCHER_TOKEN
{
  "status": "verified",
  "notes": "Dikonfirmasi via telepon, kondisi gawat darurat"
}
```

3. **Dispatcher assigns to field officer**
```http
POST http://localhost:8080/api/assignments
Authorization: Bearer DISPATCHER_TOKEN
{
  "report_id": "REPORT_ID",
  "assigned_to": "FIELD_OFFICER_ID",
  "vehicle_id": "AMBULANCE_ID",
  "notes": "Prioritas tinggi - serangan jantung"
}
```

4. **Field officer accepts**
```http
PUT http://localhost:8080/api/assignments/{assignmentId}/status
Authorization: Bearer FIELD_OFFICER_TOKEN
{
  "status": "accepted",
  "notes": "Menuju lokasi, ETA 10 menit"
}
```

5. **Field officer updates to in progress**
```http
PUT http://localhost:8080/api/assignments/{assignmentId}/status
Authorization: Bearer FIELD_OFFICER_TOKEN
{
  "status": "in_progress",
  "notes": "Tiba di lokasi, memberikan pertolongan pertama"
}
```

6. **Field officer completes**
```http
PUT http://localhost:8080/api/assignments/{assignmentId}/status
Authorization: Bearer FIELD_OFFICER_TOKEN
{
  "status": "completed",
  "notes": "Pasien dibawa ke RS Jakarta Heart Center, kondisi stabil"
}
```

7. **Citizen tracks report**
```http
GET http://localhost:8080/api/reports/track/081234567891
```

---

## Testing Tips

1. **Get IDs after login**: Save the user ID and token from login response
2. **Get category IDs**: Call `/api/admin/categories` to get valid category IDs
3. **Get user IDs**: Call `/api/auth/users` (as admin) to get field officer IDs
4. **Get vehicle/unit IDs**: Call respective admin endpoints
5. **Use Postman/Thunder Client**: Save these as collections for easy testing
6. **Test SSE**: Open browser dev tools console and run the JS example

---

**Happy Testing! 🧪**
