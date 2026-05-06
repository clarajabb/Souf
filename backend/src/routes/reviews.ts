import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

// POST /api/reviews — submit review after DELIVERED order
router.post(
  '/',
  authenticate,
  [
    body('orderId').notEmpty(),
    body('rating').isInt({ min: 1, max: 5 }),
    body('comment').optional().trim(),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { orderId, rating, comment } = req.body;

    try {
      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }
      if (order.status !== 'DELIVERED') {
        res.status(400).json({ error: 'Can only review after delivery is confirmed' });
        return;
      }

      const userId = req.user!.id;
      if (order.buyerId !== userId && order.supplierId !== userId) {
        res.status(403).json({ error: 'Not part of this order' });
        return;
      }

      // Reviewer reviews the other party
      const targetUserId = order.buyerId === userId ? order.supplierId : order.buyerId;

      // One review per order per reviewer
      const existing = await prisma.review.findFirst({ where: { orderId, reviewerId: userId } });
      if (existing) {
        res.status(409).json({ error: 'You have already reviewed this order' });
        return;
      }

      const review = await prisma.review.create({
        data: {
          orderId,
          reviewerId: userId,
          targetUserId,
          rating: parseInt(rating),
          comment: comment || null,
        },
        include: {
          reviewer: { select: { id: true, name: true, avatarUrl: true } },
        },
      });

      // Update supplier/user rating average
      const allReviews = await prisma.review.findMany({ where: { targetUserId } });
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

      await prisma.supplierProfile.updateMany({
        where: { userId: targetUserId },
        data: { rating: Math.round(avgRating * 10) / 10 },
      });

      res.status(201).json(review);
    } catch (err) {
      console.error('[reviews/create]', err);
      res.status(500).json({ error: 'Failed to submit review' });
    }
  }
);

// GET /api/reviews/:userId — get reviews for a user
router.get('/:userId', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reviews = await prisma.review.findMany({
      where: { targetUserId: req.params.userId },
      include: {
        reviewer: { select: { id: true, name: true, avatarUrl: true } },
        order: {
          select: {
            id: true,
            listing: { select: { title: true, materialType: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(reviews);
  } catch (err) {
    console.error('[reviews/get]', err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

export default router;
