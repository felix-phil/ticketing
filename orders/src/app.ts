import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSesion from 'cookie-session';

import {
  errorHandler,
  NotFoundError,
  currentUser,
} from '@fphtickets/common/build';

import { createOrderRouter } from './routes/new';
import { indexOrderRouter } from './routes/indexes';
import { showOrderRouter } from './routes/show';
import { deleteOrderRouter } from './routes/delete';

const app = express();
app.set('trust proxy', true);

app.use(json());
app.use(
  cookieSesion({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  })
);
app.use(currentUser);

app.use(createOrderRouter);
app.use(indexOrderRouter);
app.use(showOrderRouter);
app.use(deleteOrderRouter);

// Handling no routes found
app.all('*', async (req, res, next) => {
  throw new NotFoundError();
});
app.use(errorHandler);

export { app };
