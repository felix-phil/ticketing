import request from 'supertest';
import { app } from '../../app';

it('returns 201 on successful sign up', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({ email: 'test@test.com', password: 'password' })
    .expect(201);
});

it('returns 400 if invalid email', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({ email: 'test', password: 'password' })
    .expect(400);
});

it('returns 400 if invalid password', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({ email: 'test@test.com', password: 'pas' })
    .expect(400);
});

it('returns 400 with missing password or email', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({ email: 'test@test.com' })
    .expect(400);
  await request(app)
    .post('/api/users/signup')
    .send({ passworld: 'password' })
    .expect(400);
});

it('disallows duplicate emails', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({ email: 'test@test.com', password: 'password' })
    .expect(201);
  await request(app)
    .post('/api/users/signup')
    .send({ email: 'test@test.com', password: 'password' })
    .expect(400);
});

it('sets a cookie after a successful sign up', async () => {
  const res = await request(app)
    .post('/api/users/signup')
    .send({ email: 'test@test.com', password: 'password' })
    .expect(201);

  expect(res.get('Set-Cookie')).toBeDefined();
});
