import mongoose from 'mongoose';

import { natsWrapper } from './nats-wrapper';
import { app } from './app';
import { OrderCreatedListener } from './events/listeners/order-created-listener';
import { OrderCancelledListener } from './events/listeners/order-cancelled-listener';

const PORT: number = 3000;

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY env variable must be defined');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI env variable must be defined');
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID env variable must be defined');
  }
  if (!process.env.NATS_URL) {
    throw new Error('NATS_URL env variable must be defined');
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTER_ID env variable must be defined');
  }
  if (!process.env.STRIPE_KEY) {
    throw new Error('STRIPE_KEY env variable must be defined');
  }
  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );
    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed!');
      process.exit();
    });

    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    new OrderCreatedListener(natsWrapper.client).listen();
    new OrderCancelledListener(natsWrapper.client).listen();

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Tickets DB Connected');
  } catch (error) {
    console.error(error);
  }
  app.listen(PORT, (): void => {
    console.log('Tickets listening on port ' + PORT);
  });
};

start();
