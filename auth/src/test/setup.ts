import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';
import request from 'supertest';
// let mongo: any;

// declare global {
//   namespace NodeJS {
//     interface Global {
//       signin(): Promise<string[]>;
//     }
//   }
// }
declare global {
  var signin: () => Promise<string[]>;
}

beforeAll(async () => {
  //   mongo = new MongoMemoryServer();
  //   await mongo.start();
  process.env.JWT_KEY = 'testingKey';
  //   const mongoUri = mongo.getUri();
  await mongoose.connect('mongodb://127.0.0.1:27017/auth');
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.close();
  //   await mongo.stop();
});

global.signin = async (): Promise<string[]> => {
  const email = 'test@test.com';
  const password = 'password';

  const res = await request(app)
    .post('/api/users/signup')
    .send({ email, password })
    .expect(201);

  const cookie = res.get('Set-Cookie');
  return cookie;
};
