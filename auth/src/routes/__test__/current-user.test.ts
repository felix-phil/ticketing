import request from 'supertest';
import { app } from '../../app';

it('responds with current user details', async () => {
  const cookie = await global.signin();

  const res = await request(app)
    .get('/api/users/currentuser')
    .set('Cookie', cookie)
    .send({})
    .expect(400); //testing github ci

  expect(res.body.currentUser.email).toEqual('test@test.com');
  expect(res.body.currentUser.id).toBeDefined();
  expect(res.body.currentUser.iat).toBeDefined();
});

it('responds with null if no cookie', async () => {
  const res = await request(app)
    .get('/api/users/currentuser')
    .send({})
    .expect(200);

  expect(res.body.currentUser).toBeNull();
});
