import request from 'supertest';
import app from '../app';
import { pool } from '../db/connection';

let token: string;

beforeAll(async () => {
  await pool.query('TRUNCATE users RESTART IDENTITY CASCADE');
  await pool.query('TRUNCATE decks RESTART IDENTITY CASCADE');
  await pool.query('TRUNCATE cards RESTART IDENTITY CASCADE');

  await request(app).post('/api/auth/register').send({
    email: 'test@example.com',
    password: 'test123',
    username: 'testuser',
  });

  const loginRes = await request(app).post('/api/auth/login').send({
    email: 'test@example.com',
    password: 'test123',
  });

  token = loginRes.body.token;
});

afterAll(async () => {
  await pool.end();
});

describe('Decks API (with auth)', () => {
  it('should create a new deck', async () => {
    const res = await request(app)
      .post('/api/decks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Deck',
        description: 'Test description',
        folder_id: null,
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  it('should return all decks', async () => {
    const res = await request(app)
      .get('/api/decks')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
