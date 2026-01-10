const request = require('supertest');
const app = require('../app');

describe('Users', () => {
    let token;
    let createdUserId;

    beforeAll(async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ username: 'admin', password: '1234' });

        token = res.body.token;
    });

    test('GET /api/user sin token -> 401', async () => {
        const res = await request(app).get('/api/user');
        expect(res.statusCode).toBe(401);
    });

    test('GET /api/user con token -> 200', async () => {
        const res = await request(app)
            .get('/api/user')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('POST /api/user crea usuario -> 201', async () => {
        const username = `jest_user_${Date.now()}`;

        const res = await request(app)
            .post('/api/user')
            .set('Authorization', `Bearer ${token}`)
            .send({
                username,
                fullName: 'User Jest',
                email: `${username}@test.local`,
                password: '1234'
            });

        expect(res.statusCode).toBe(201);
        expect(res.body._id).toBeDefined();
        expect(res.body.username).toBe(username);
        // importante: no debe devolver password
        expect(res.body.password).toBeUndefined();

        createdUserId = res.body._id;
    });

    test('PUT /api/user/:id actualiza usuario -> 200', async () => {
        const res = await request(app)
            .put(`/api/user/${createdUserId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ fullName: 'User Jest Updated' });

        expect(res.statusCode).toBe(200);
        expect(res.body.fullName).toBe('User Jest Updated');
    });

    test('DELETE /api/user/:id soft delete -> 200', async () => {
        const res = await request(app)
            .delete(`/api/user/${createdUserId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
    });
});
