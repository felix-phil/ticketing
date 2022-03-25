import express, { Request, Response, NextFunction, Router } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';

import { User } from '../models/User';
import { validateRequest, BadRequestError } from '@fphtickets/common/build';

const router: Router = express.Router();

router.post(
  '/api/users/signup',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('Password must be beween 4 and 20 characters'),
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError('Email in use');
    }
    const user = User.build({
      email,
      password,
    });
    await user.save();

    // Generate jwt
    const userJWT = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_KEY!
    );
    // Store it in session object
    req.session = {
      jwt: userJWT,
    };
    res.status(201).send(user);
  }
);

export { router as signUpRouter };
