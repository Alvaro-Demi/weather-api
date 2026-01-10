const request = require('supertest');
const app = require('../app');

describe('Imagen', () => {
    let token, itemId;
    const loc = 'Madrid';

    beforeAll(async () => {
        const login = await request(app).post('/api/auth/login')
            .send({ username: 'admin', password: '1234' });
        token = login.body.token;
    });

    test('GET /api/imagen -> 200 (público)', async () => {
        const res = await request(app).get('/api/imagen');
        expect(res.statusCode).toBe(200);
    });

    test('POST /api/imagen -> 201 (JWT)', async () => {
        const res = await request(app)
            .post('/api/imagen')
            .set('Authorization', `Bearer ${token}`)
            .send({
                localizacion: loc,
                url: `https://example.com/${Date.now()}.jpg`,
                timestamp: new Date().toISOString()
            });

        expect(res.statusCode).toBe(201);
        itemId = res.body._id;
    });

    test('GET /api/imagen?localizacion=Madrid -> 200', async () => {
        const res = await request(app).get(`/api/imagen?localizacion=${encodeURIComponent(loc)}`);
        expect(res.statusCode).toBe(200);
    });

    test('GET /api/imagen con rango from/to -> 200', async () => {
        const from = new Date(Date.now() - 86400000).toISOString();
        const to = new Date(Date.now() + 86400000).toISOString();
        const res = await request(app).get(`/api/imagen?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
        expect(res.statusCode).toBe(200);
    });

    test('DELETE /api/imagen/:id -> 200 (JWT)', async () => {
        const res = await request(app)
            .delete(`/api/imagen/${itemId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
    });
});
