import mongoose from 'mongoose';
import express, { Request, Response } from 'express';
import { param } from 'express-validator';
import {
  requireAuth,
  NotFoundError,
  validateRequest,
  NotAuthorizedError,
} from '@fphtickets/common/build';
import { Order } from '../models/Order';

const router = express.Router();

router.get(
  '/api/orders/:orderId',
  requireAuth,
  [
    param('orderId')
      .notEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage('Provide a valid order id'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.orderId).populate('ticket');
    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }
    res.status(200).send(order);
  }
);

export { router as showOrderRouter };
