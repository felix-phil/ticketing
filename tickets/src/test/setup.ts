// import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';
import request from 'supertest';
import jwt from 'jsonwebtoken';

jest.mock('../nats-wrapper');

// let mongo: any;

declare global {
  var signin: () => string[];
}

beforeAll(async () => {
  //   mongo = new MongoMemoryServer();
  //   await mongo.start();
  process.env.JWT_KEY = 'testingKey';
  //   const mongoUri = mongo.getUri();
  await mongoose.connect('mongodb://127.0.0.1:27017/tickets');
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.close();
  //   await mongo.stop();
});

global.signin = (): string[] => {
  // Build a JWT payload. {id, email}
  const id = new mongoose.Types.ObjectId().toHexString();

  const payload = {
    id: id,
    email: 'test@test.com',
  };
  // Create a JWT
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // Build session Object. {jwt: myjwtklsd...}
  const session = { jwt: token };

  // Turn that session into JSON
  const sessionJSON = JSON.stringify(session);

  // encode the JSON as base64
  const base64EncodededJson = Buffer.from(sessionJSON).toString('base64');

  // return a cookie string with encoded data
  return [`express:sess=${base64EncodededJson}`];
};
