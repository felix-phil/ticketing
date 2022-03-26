// import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';
import request from 'supertest';
import jwt from 'jsonwebtoken';

jest.mock('../nats-wrapper');

// let mongo: any;

declare global {
  var signin: (id?: string) => string[];
}

process.env.STRIPE_KEY =
  'sk_test_51KfZvWH6hCIDmUaTBrzf59hXmJXlu3DWS42poZdj1fk52kYFgzP7AntlQ6EbawTDILHL8B8j0J5orvvvyjfaoi09004a3UmJJW';

beforeAll(async () => {
  //   mongo = new MongoMemoryServer();
  //   await mongo.start();
  process.env.JWT_KEY = 'testingKey';
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  //   const mongoUri = mongo.getUri();
  await mongoose.connect(
    'mongodb+srv://ticketinguser:ticketinguser@ticketing.yc8tr.mongodb.net/payments'
  );
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

global.signin = (id?: string): string[] => {
  // Build a JWT payload. {id, email}

  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
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
