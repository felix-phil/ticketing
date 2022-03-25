import express, { Request, Response } from 'express';
import {
  requireAuth,
  NotFoundError,
  validateRequest,
  BadRequestError,
  NotAuthorizedError,
  OrderStatus,
} from '@fphtickets/common/build';
import { Order } from '../models/Order';
import { body } from 'express-validator';

import { stripe } from '../stripe';
import { Payment } from '../models/Payment';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
  '/api/payments',
  requireAuth,
  [
    body('token').notEmpty().withMessage('Token is required for payment'),
    body('orderId')
      .notEmpty()
      .isMongoId()
      .withMessage('Order ID is required for payment'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }
    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError('Cannot pay for a cancelled order');
    }

    const charge = await stripe.charges.create({
      currency: 'usd',
      amount: order.price * 100,
      source: token,
    });

    const payment = Payment.build({
      orderId,
      stripeId: charge.id,
    });
    await payment.save();

    new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId,
    });

    res.status(201).send({ success: true, id: payment.id });
  }
);

export { router as createChargeRouter };
