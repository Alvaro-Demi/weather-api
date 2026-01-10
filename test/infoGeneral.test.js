const request = require('supertest');
const app = require('../app');

describe('InfoGeneral', () => {
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

    test('POST /api/infoGeneral -> 201 (JWT)', async () => {
        const res = await request(app)
            .post('/api/infoGeneral')
            .set('Authorization', `Bearer ${token}`)
            .send({
                temperaturaReal: 18,
                sensacionTermica: 17,
                cubiertaNubes: 'Soleado despejado',
                sonda: sondaId,
                timestamp: new Date().toISOString()
            });

        expect(res.statusCode).toBe(201);
        itemId = res.body._id;
    });

    test('GET /api/infoGeneral?sondaId=... -> 200', async () => {
        const res = await request(app).get(`/api/infoGeneral?sondaId=${sondaId}`);
        expect(res.statusCode).toBe(200);
    });

    test('GET /api/infoGeneral/stats/avg -> 200 o 404', async () => {
        const from = new Date(Date.now() - 86400000).toISOString();
        const to = new Date(Date.now() + 86400000).toISOString();
        const res = await request(app)
            .get(`/api/infoGeneral/stats/avg?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&sondaId=${sondaId}`);
        expect([200, 404]).toContain(res.statusCode);
    });

    test('DELETE /api/infoGeneral/:id -> 200 (JWT)', async () => {
        const res = await request(app)
            .delete(`/api/infoGeneral/${itemId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
    });
});
