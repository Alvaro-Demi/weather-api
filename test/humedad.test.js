const request = require('supertest');
const app = require('../app');

describe('Humedad', () => {
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

  test('GET /api/humedad -> 200 (público)', async () => {
    const res = await request(app).get('/api/humedad');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST /api/humedad -> 201 (JWT)', async () => {
    const res = await request(app)
      .post('/api/humedad')
      .set('Authorization', `Bearer ${token}`)
      .send({
        humedad: 55,
        puntoRocio: 12,
        sonda: sondaId,
        timestamp: new Date().toISOString()
      });

    expect(res.statusCode).toBe(201);
    itemId = res.body._id;
  });

  test('GET /api/humedad/:id -> 200', async () => {
    const res = await request(app).get(`/api/humedad/${itemId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(itemId);
  });

  test('PUT /api/humedad/:id -> 200 (JWT)', async () => {
    const res = await request(app)
      .put(`/api/humedad/${itemId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ humedad: 60 });

    expect(res.statusCode).toBe(200);
    expect(res.body.humedad).toBe(60);
  });

  test('GET /api/humedad?sondaId=... -> 200', async () => {
    const res = await request(app).get(`/api/humedad?sondaId=${sondaId}`);
    expect(res.statusCode).toBe(200);
  });

  test('GET /api/humedad/stats/avg -> 200 o 404', async () => {
    const from = new Date(Date.now() - 86400000).toISOString();
    const to = new Date(Date.now() + 86400000).toISOString();
    const res = await request(app)
      .get(`/api/humedad/stats/avg?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&sondaId=${sondaId}`);
    expect([200, 404]).toContain(res.statusCode);
  });

  test('DELETE /api/humedad/:id -> 200 (JWT)', async () => {
    const res = await request(app)
      .delete(`/api/humedad/${itemId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });

  test('GET /api/humedad/:id (tras delete) -> 404', async () => {
    const res = await request(app).get(`/api/humedad/${itemId}`);
    expect(res.statusCode).toBe(404);
  });
});
