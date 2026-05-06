import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

// POST /api/samples — request a sample
router.post(
  '/',
  authenticate,
  [body('listingId').notEmpty()],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { listingId } = req.body;

    try {
      const listing = await prisma.listing.findUnique({ where: { id: listingId } });
      if (!listing) {
        res.status(404).json({ error: 'Listing not found' });
        return;
      }
      if (!listing.allowSamples) {
        res.status(400).json({ error: 'This listing does not allow samples' });
        return;
      }
      if (listing.supplierId === req.user!.id) {
        res.status(400).json({ error: 'Cannot request sample from your own listing' });
        return;
      }

      // Check for duplicate pending request
      const existing = await prisma.sampleRequest.findFirst({
        where: { listingId, buyerId: req.user!.id, status: { in: ['PENDING', 'ACCEPTED'] } },
      });
      if (existing) {
        res.status(409).json({ error: 'Sample already requested for this listing' });
        return;
      }

      const sample = await prisma.sampleRequest.create({
        data: {
          listingId,
          buyerId: req.user!.id,
          supplierId: listing.supplierId,
          status: 'PENDING',
        },
        include: {
          listing: { select: { id: true, title: true, materialType: true, samplePriceUsd: true } },
          buyer: { select: { id: true, name: true } },
        },
      });

      res.status(201).json(sample);
    } catch (err) {
      console.error('[samples/create]', err);
      res.status(500).json({ error: 'Failed to create sample request' });
    }
  }
);

// GET /api/samples — get my sample requests
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;

    const where = role === 'BUYER' ? { buyerId: userId } : { supplierId: userId };

    const samples = await prisma.sampleRequest.findMany({
      where,
      include: {
        listing: { select: { id: true, title: true, materialType: true, images: true, samplePriceUsd: true } },
        buyer: { select: { id: true, name: true, country: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(samples);
  } catch (err) {
    console.error('[samples/list]', err);
    res.status(500).json({ error: 'Failed to fetch samples' });
  }
});

// PATCH /api/samples/:id/status — accept or ship sample
router.patch('/:id/status', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { status } = req.body;
  const validStatuses = ['ACCEPTED', 'SHIPPED', 'RECEIVED'];

  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: 'Invalid status. Must be ACCEPTED, SHIPPED, or RECEIVED' });
    return;
  }

  try {
    const sample = await prisma.sampleRequest.findUnique({ where: { id: req.params.id } });
    if (!sample) {
      res.status(404).json({ error: 'Sample request not found' });
      return;
    }

    const userId = req.user!.id;

    // Supplier accepts/ships; buyer marks received
    if ((status === 'ACCEPTED' || status === 'SHIPPED') && sample.supplierId !== userId) {
      res.status(403).json({ error: 'Only supplier can accept or ship samples' });
      return;
    }
    if (status === 'RECEIVED' && sample.buyerId !== userId) {
      res.status(403).json({ error: 'Only buyer can mark sample as received' });
      return;
    }

    const updated = await prisma.sampleRequest.update({
      where: { id: req.params.id },
      data: { status },
    });

    res.json(updated);
  } catch (err) {
    console.error('[samples/status]', err);
    res.status(500).json({ error: 'Failed to update sample status' });
  }
});

export default router;
