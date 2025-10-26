const request = require('supertest');
const { app } = require('../src/index');
const { User } = require('../src/models');

describe('Auth Endpoints', () => {
  describe('POST /api/auth/login', () => {
    it('should return 400 if email or password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com' });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/email and password are required/i);
    });

    it('should return 401 if credentials are invalid', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@test.com', password: 'wrong' });

      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
    });

    it('should return token if credentials are valid', async () => {
      // Create a user in the test DB
      await User.create({
        name: 'Test User',
        email: 'test@psc119.com',
        phone: '08123456789',
        password_hash: 'password123',
        role: 'dispatcher',
        is_active: true
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@psc119.com', password: 'password123' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/login successful/i);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data.user.email).toBe('test@psc119.com');
      expect(res.body.data.user).not.toHaveProperty('password_hash');
    });
  });

  describe('GET /api/auth/profile', () => {
    let token;

    beforeEach(async () => {
      // Create user and login to get token
      await User.create({
        name: 'Profile User',
        email: 'profile@psc119.com',
        phone: '08198765432',
        password_hash: 'password123',
        role: 'field_officer'
      });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'profile@psc119.com', password: 'password123' });

      token = loginRes.body.data.token;
    });

    it('should return 401 if no token is provided', async () => {
      const res = await request(app).get('/api/auth/profile');
      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
    });

    it('should return user profile if token is valid', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('email', 'profile@psc119.com');
      expect(res.body.data).toHaveProperty('name', 'Profile User');
      expect(res.body.data).not.toHaveProperty('password_hash');
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'New User',
          email: 'new@psc119.com',
          phone: '08155555555',
          password: 'newpass123',
          role: 'field_officer'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/registered successfully/i);
      expect(res.body.data.email).toBe('new@psc119.com');

      // Verify user was actually created
      const user = await User.findOne({ where: { email: 'new@psc119.com' } });
      expect(user).toBeTruthy();
      expect(user.name).toBe('New User');
    });

    it('should return 409 if user already exists', async () => {
      await User.create({
        name: 'Existing User',
        email: 'existing@psc119.com',
        phone: '08177777777',
        password_hash: 'pass',
        role: 'dispatcher'
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Another User',
          email: 'existing@psc119.com',
          phone: '08188888888',
          password: 'pass'
        });

      expect(res.statusCode).toEqual(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already exists/i);
    });
  });
});
