const request = require('supertest');
const app = require('../app');

describe('Sondas', () => {
    let token, sondaId;

    beforeAll(async () => {
        const login = await request(app).post('/api/auth/login')
            .send({ username: 'admin', password: '1234' });
        token = login.body.token;
    });

    test('GET /api/sondas -> 200 (público)', async () => {
        const res = await request(app).get('/api/sondas');
        expect(res.statusCode).toBe(200);
    });

    test('POST /api/sondas -> 201 (JWT)', async () => {
        const res = await request(app)
            .post('/api/sondas')
            .set('Authorization', `Bearer ${token}`)
            .send({
                nombre: `sonda_${Date.now()}`,
                descripcion: 'Sonda Jest',
                localizacion: 'Madrid'
            });

        expect(res.statusCode).toBe(201);
        sondaId = res.body._id;
    });

    test('GET /api/sondas?localizacion=Madrid -> 200', async () => {
        const res = await request(app).get('/api/sondas?localizacion=Madrid');
        expect(res.statusCode).toBe(200);
    });

    test('DELETE /api/sondas/:id -> 200 (JWT)', async () => {
        const res = await request(app)
            .delete(`/api/sondas/${sondaId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
    });
});
