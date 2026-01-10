const request = require('supertest');
const app = require('../app');

describe('Auth', () => {
  test('POST /api/auth/login devuelve token con credenciales válidas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: '1234' });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(typeof res.body.token).toBe('string');
  });

  test('POST /api/auth/login devuelve 401 con credenciales inválidas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'mal' });

    expect(res.statusCode).toBe(401);
  });
});
