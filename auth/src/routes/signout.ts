import express, { Router } from 'express';

const router: Router = express.Router();

router.post('/api/users/signout', (req, res): void => {
  req.session = null;
  res.send({});
});

export { router as signOutRouter };
