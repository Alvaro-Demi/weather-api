const request = require('supertest');
const app = require('../app');

describe('Precipitación', () => {
  let token, sondaId, itemId;

  beforeAll(async () => {
    const login = await request(app).post('/api/auth/login')
      .send({ username: 'admin', password: '1234' });
    token = login.body.token;

    const nombreSonda = `sonda_jest_${Date.now()}`;
    const sondaRes = await request(app)
      .post('/api/sondas')
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: nombreSonda, descripcion: 'Sonda Jest', localizacion: 'Madrid' });

    expect(sondaRes.statusCode).toBe(201);
    sondaId = sondaRes.body._id;
  });

  test('GET /api/precipitacion -> 200 (público)', async () => {
    const res = await request(app).get('/api/precipitacion');
    expect(res.statusCode).toBe(200);
  });

  test('POST /api/precipitacion -> 201 (JWT)', async () => {
    const res = await request(app)
      .post('/api/precipitacion')
      .set('Authorization', `Bearer ${token}`)
      .send({
        tipo: 'Agua',
        probabilidad: 40,
        acumulada: 2.5,
        sonda: sondaId,
        timestamp: new Date().toISOString()
      });

    expect(res.statusCode).toBe(201);
    itemId = res.body._id;
  });

  test('PUT /api/precipitacion/:id -> 200 (JWT)', async () => {
    const res = await request(app)
      .put(`/api/precipitacion/${itemId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ acumulada: 3.2 });

    expect(res.statusCode).toBe(200);
    expect(res.body.acumulada).toBe(3.2);
  });

  test('GET /api/precipitacion?sondaId=... -> 200', async () => {
    const res = await request(app).get(`/api/precipitacion?sondaId=${sondaId}`);
    expect(res.statusCode).toBe(200);
  });

  test('GET /api/precipitacion/stats/avg -> 200 o 404', async () => {
    const from = new Date(Date.now() - 86400000).toISOString();
    const to = new Date(Date.now() + 86400000).toISOString();
    const res = await request(app)
      .get(`/api/precipitacion/stats/avg?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&sondaId=${sondaId}`);
    expect([200, 404]).toContain(res.statusCode);
  });

  test('DELETE /api/precipitacion/:id -> 200 (JWT)', async () => {
    const res = await request(app)
      .delete(`/api/precipitacion/${itemId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });

  test('GET /api/precipitacion/:id (tras delete) -> 404', async () => {
    const res = await request(app).get(`/api/precipitacion/${itemId}`);
    expect(res.statusCode).toBe(404);
  });
});
