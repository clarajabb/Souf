import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';
import { stripe } from '../lib/stripe';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

// POST /api/orders — create order + Stripe PaymentIntent
router.post(
  '/',
  authenticate,
  [
    body('listingId').notEmpty(),
    body('quantityKg').isFloat({ min: 0.1 }),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { listingId, quantityKg } = req.body;
    const qty = parseFloat(quantityKg);

    try {
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
        include: { supplier: true },
      });

      if (!listing) {
        res.status(404).json({ error: 'Listing not found' });
        return;
      }
      if (listing.status !== 'ACTIVE') {
        res.status(400).json({ error: 'Listing is not active' });
        return;
      }
      if (listing.supplierId === req.user!.id) {
        res.status(400).json({ error: 'Cannot order your own listing' });
        return;
      }
      if (qty < listing.minimumOrderKg) {
        res.status(400).json({ error: `Minimum order is ${listing.minimumOrderKg} kg` });
        return;
      }
      if (qty > listing.availableKg) {
        res.status(400).json({ error: `Only ${listing.availableKg} kg available` });
        return;
      }

      const totalPriceUsd = parseFloat((qty * listing.pricePerKg).toFixed(2));
      const amountCents = Math.round(totalPriceUsd * 100);

      // Create Stripe PaymentIntent with manual capture (escrow-style)
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountCents,
        currency: 'usd',
        capture_method: 'manual',
        metadata: {
          listingId,
          buyerId: req.user!.id,
          supplierId: listing.supplierId,
          quantityKg: qty.toString(),
        },
      });

      const order = await prisma.order.create({
        data: {
          listingId,
          buyerId: req.user!.id,
          supplierId: listing.supplierId,
          quantityKg: qty,
          totalPriceUsd,
          status: 'PENDING',
          stripePaymentIntentId: paymentIntent.id,
        },
        include: {
          listing: { select: { title: true, materialType: true } },
          buyer: { select: { id: true, name: true, email: true } },
          supplier: { select: { id: true, name: true, email: true } },
        },
      });

      res.status(201).json({
        order,
        clientSecret: paymentIntent.client_secret,
      });
    } catch (err) {
      console.error('[orders/create]', err);
      res.status(500).json({ error: 'Failed to create order' });
    }
  }
);

// GET /api/orders — get my orders
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;

    const where = role === 'BUYER' ? { buyerId: userId } : { supplierId: userId };

    const orders = await prisma.order.findMany({
      where,
      include: {
        listing: { select: { id: true, title: true, materialType: true, images: true } },
        buyer: { select: { id: true, name: true, country: true, avatarUrl: true } },
        supplier: { select: { id: true, name: true, country: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(orders);
  } catch (err) {
    console.error('[orders/list]', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/:id — single order
router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        listing: {
          include: {
            supplier: {
              select: { id: true, name: true, country: true, avatarUrl: true, supplierProfile: true },
            },
          },
        },
        buyer: { select: { id: true, name: true, email: true, country: true, avatarUrl: true } },
        supplier: { select: { id: true, name: true, email: true, country: true, avatarUrl: true } },
        reviews: true,
      },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const userId = req.user!.id;
    if (order.buyerId !== userId && order.supplierId !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json(order);
  } catch (err) {
    console.error('[orders/:id]', err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// PATCH /api/orders/:id/status — update order status
router.patch('/:id/status', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { status } = req.body;
  const validStatuses = ['PAID', 'SHIPPED', 'DELIVERED', 'DISPUTED', 'CANCELLED'];

  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: 'Invalid status' });
    return;
  }

  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const userId = req.user!.id;
    const role = req.user!.role;

    // Permission rules
    if (status === 'SHIPPED' && order.supplierId !== userId) {
      res.status(403).json({ error: 'Only supplier can mark as shipped' });
      return;
    }
    if (status === 'DELIVERED' && order.buyerId !== userId) {
      res.status(403).json({ error: 'Only buyer can mark as delivered' });
      return;
    }
    if (status === 'CANCELLED' && order.buyerId !== userId && order.supplierId !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
    });

    res.json(updated);
  } catch (err) {
    console.error('[orders/status]', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// POST /api/orders/:id/confirm-delivery — buyer confirms → release escrow
router.post('/:id/confirm-delivery', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    if (order.buyerId !== req.user!.id) {
      res.status(403).json({ error: 'Only buyer can confirm delivery' });
      return;
    }
    if (order.status !== 'SHIPPED') {
      res.status(400).json({ error: 'Order must be in SHIPPED status to confirm delivery' });
      return;
    }

    // Capture the payment (release escrow to supplier)
    if (order.stripePaymentIntentId) {
      await stripe.paymentIntents.capture(order.stripePaymentIntentId);
    }

    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: 'DELIVERED' },
    });

    // Update supplier total sales
    await prisma.supplierProfile.updateMany({
      where: { userId: order.supplierId },
      data: { totalSales: { increment: 1 } },
    });

    res.json(updated);
  } catch (err) {
    console.error('[orders/confirm-delivery]', err);
    res.status(500).json({ error: 'Failed to confirm delivery' });
  }
});

export default router;
