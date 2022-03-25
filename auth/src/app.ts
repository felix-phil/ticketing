import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSesion from 'cookie-session';

import { currentUserRouter } from './routes/current-user';
import { signInRouter } from './routes/signin';
import { signUpRouter } from './routes/signup';
import { signOutRouter } from './routes/signout';
import { errorHandler, NotFoundError } from '@fphtickets/common/build';

const app = express();
app.set('trust proxy', true);

app.use(json());
app.use(
  cookieSesion({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  })
);

app.use(currentUserRouter);
app.use(signInRouter);
app.use(signUpRouter);
app.use(signOutRouter);

app.all('*', async (req, res, next) => {
  throw new NotFoundError();
});
app.use(errorHandler);

export { app };
