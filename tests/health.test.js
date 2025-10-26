const request = require('supertest');
const { app } = require('../src/index');

describe('Health Endpoint', () => {
  it('GET /health should return OK status', async () => {
    const res = await request(app).get('/health');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'OK');
    expect(res.body).toHaveProperty('service', 'PSC 119 Backend API');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('environment', 'test');
  });
});
