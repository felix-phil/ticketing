import request from 'supertest';
import { app } from '../../app';

it('returns 400 if email does not exists', async () => {
  return request(app)
    .post('/api/users/signin')
    .send({ email: 'test@test.com', password: 'password' })
    .expect(400);
});

it('returns 200 on successful sign in', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({ email: 'test@test.com', password: 'password' })
    .expect(201);
  await request(app)
    .post('/api/users/signin')
    .send({ email: 'test@test.com', password: 'password' })
    .expect(200);
});

it('returns 400 if invalid email', async () => {
  return request(app)
    .post('/api/users/signin')
    .send({ email: 'test', password: 'password' })
    .expect(400);
});

it('returns 400 if invalid password', async () => {
  return request(app)
    .post('/api/users/signin')
    .send({ email: 'test@test.com', password: '' })
    .expect(400);
});

it('returns 400 with missing password or email', async () => {
  await request(app)
    .post('/api/users/signin')
    .send({ email: 'test@test.com' })
    .expect(400);
  await request(app)
    .post('/api/users/signin')
    .send({ passworld: 'password' })
    .expect(400);
});

it('disallows incorrect password', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({ email: 'test@test.com', password: 'password' })
    .expect(201);
  await request(app)
    .post('/api/users/signin')
    .send({ email: 'test@test.com', password: 'pass' })
    .expect(400);
});

it('sets a cookie after a successful sign in', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({ email: 'test@test.com', password: 'password' })
    .expect(201);
  const res = await request(app)
    .post('/api/users/signin')
    .send({ email: 'test@test.com', password: 'password' })
    .expect(200);

  expect(res.get('Set-Cookie')).toBeDefined();
});
