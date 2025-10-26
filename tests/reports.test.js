const request = require('supertest');
const { app } = require('../src/index');
const { Report, User, MasterCategory } = require('../src/models');

describe('Report Endpoints', () => {
  let authToken;
  let categoryId;

  beforeEach(async () => {
    // Create dispatcher user and login to get auth token
    await User.create({
      name: 'Dispatcher Test',
      email: 'dispatcher@psc119.com',
      phone: '08123456001',
      password_hash: 'password123',
      role: 'dispatcher'
    });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'dispatcher@psc119.com', password: 'password123' });

    authToken = loginRes.body.data.token;

    // Create a test category
    const category = await MasterCategory.create({
      name: 'Kebakaran',
      description: 'Laporan kebakaran'
    });
    categoryId = category.id;
  });

  describe('POST /api/reports', () => {
    it('should create a new report without authentication (public endpoint)', async () => {
      const reportData = {
        reporter_name: 'John Doe',
        phone: '08123456789',
        description: 'Ada kebakaran di Jl. Merdeka',
        coordinates: JSON.stringify({ type: 'Point', coordinates: [106.845, -6.208] }),
        address: 'Jl. Merdeka No. 1',
        category_id: categoryId,
        source: 'web'
      };

      const res = await request(app)
        .post('/api/reports')
        .send(reportData);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/submitted successfully/i);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.reporter_name).toBe('John Doe');
      expect(res.body.data.status).toBe('pending');
    });

    it('should return 400 if coordinates are missing', async () => {
      const res = await request(app)
        .post('/api/reports')
        .send({
          reporter_name: 'Jane Doe',
          phone: '08198765432',
          description: 'Test'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/coordinates/i);
    });
  });

  describe('GET /api/reports', () => {
    beforeEach(async () => {
      // Create sample reports
      await Report.create({
        reporter_name: 'Alice',
        phone: '08111111111',
        description: 'Report 1',
        latitude: -6.2,
        longitude: 106.8,
        address: 'Address 1',
        status: 'pending',
        category_id: categoryId
      });

      await Report.create({
        reporter_name: 'Bob',
        phone: '08122222222',
        description: 'Report 2',
        latitude: -6.3,
        longitude: 106.9,
        address: 'Address 2',
        status: 'verified',
        category_id: categoryId
      });

      await Report.create({
        reporter_name: 'Charlie',
        phone: '08133333333',
        description: 'Report 3 - closed',
        latitude: -6.25,
        longitude: 106.85,
        address: 'Address 3',
        status: 'closed',
        category_id: categoryId,
        closed_at: new Date()
      });
    });

    it('should return all reports (authenticated)', async () => {
      const res = await request(app)
        .get('/api/reports')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);
      expect(res.body.pagination).toHaveProperty('total');
      expect(res.body.pagination).toHaveProperty('page');
    });

    it('should filter reports by status', async () => {
      const res = await request(app)
        .get('/api/reports?status=closed')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].status).toBe('closed');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/api/reports');

      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/reports/:reportId/status', () => {
    let reportId;

    beforeEach(async () => {
      const report = await Report.create({
        reporter_name: 'Test Reporter',
        phone: '08144444444',
        description: 'Test report for status update',
        latitude: -6.2,
        longitude: 106.8,
        address: 'Test Address',
        status: 'pending',
        category_id: categoryId
      });
      reportId = report.id;
    });

    it('should update report status to verified', async () => {
      const res = await request(app)
        .put(`/api/reports/${reportId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'verified', notes: 'Verified by dispatcher' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('verified');

      // Verify database was updated
      const updatedReport = await Report.findByPk(reportId);
      expect(updatedReport.status).toBe('verified');
      expect(updatedReport.verified_at).toBeTruthy();
    });

    it('should update report status to closed', async () => {
      const res = await request(app)
        .put(`/api/reports/${reportId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'closed', notes: 'Resolved' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.status).toBe('closed');

      const updatedReport = await Report.findByPk(reportId);
      expect(updatedReport.closed_at).toBeTruthy();
    });

    it('should return 400 if status is missing', async () => {
      const res = await request(app)
        .put(`/api/reports/${reportId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 403 if user is not authorized (field_officer)', async () => {
      // Create field officer and login
      await User.create({
        name: 'Field Officer',
        email: 'field@psc119.com',
        phone: '08199999999',
        password_hash: 'password123',
        role: 'field_officer'
      });

      const fieldLoginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'field@psc119.com', password: 'password123' });

      const fieldToken = fieldLoginRes.body.data.token;

      const res = await request(app)
        .put(`/api/reports/${reportId}/status`)
        .set('Authorization', `Bearer ${fieldToken}`)
        .send({ status: 'verified' });

      expect(res.statusCode).toEqual(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/reports/track/:phone', () => {
    beforeEach(async () => {
      // Create reports for specific phone number
      await Report.create({
        reporter_name: 'Track User',
        phone: '08155555555',
        description: 'First report',
        latitude: -6.2,
        longitude: 106.8,
        address: 'Address A',
        status: 'pending',
        category_id: categoryId
      });

      await Report.create({
        reporter_name: 'Track User',
        phone: '08155555555',
        description: 'Second report',
        latitude: -6.22,
        longitude: 106.82,
        address: 'Address B',
        status: 'verified',
        category_id: categoryId
      });
    });

    it('should return all reports for a phone number', async () => {
      const res = await request(app)
        .get('/api/reports/track/08155555555');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBe(2);
      res.body.data.forEach(report => {
        expect(report.phone).toBe('08155555555');
      });
    });
  });
});
