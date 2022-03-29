import mongoose from 'mongoose';

import { app } from './app';

const PORT: number = 3000;

const start = async () => {
  console.log('Starting up......');

  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY env variable must be defined');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI env variable must be defined');
  }
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Auth DB Connected');
  } catch (error) {
    console.error(error);
  }
  app.listen(PORT, (): void => {
    console.log('Auth listening on port ' + PORT);
  });
};

start();
