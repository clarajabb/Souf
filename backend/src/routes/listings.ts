import { Router, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';
import { authenticate, requireRole } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { AuthRequest } from '../types';

const router = Router();

// GET /api/listings
router.get(
  '/',
  [
    query('materialType').optional().isString(),
    query('country').optional().isString(),
    query('minPrice').optional().isNumeric(),
    query('maxPrice').optional().isNumeric(),
    query('allowSamples').optional().isBoolean(),
    query('minQuantity').optional().isNumeric(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { materialType, country, minPrice, maxPrice, allowSamples, minQuantity, page = '1', limit = '12' } = req.query as Record<string, string>;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 12;
    const skip = (pageNum - 1) * limitNum;

    try {
      const where: Record<string, unknown> = { status: 'ACTIVE' };

      if (materialType) where.materialType = materialType;
      if (allowSamples === 'true') where.allowSamples = true;
      if (minQuantity) where.availableKg = { gte: parseFloat(minQuantity) };

      if (minPrice || maxPrice) {
        where.pricePerKg = {
          ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
          ...(maxPrice ? { lte: parseFloat(maxPrice) } : {}),
        };
      }

      if (country) {
        where.supplier = { country };
      }

      const [listings, total] = await Promise.all([
        prisma.listing.findMany({
          where,
          include: {
            supplier: {
              select: {
                id: true,
                name: true,
                country: true,
                isVerified: true,
                avatarUrl: true,
                supplierProfile: {
                  select: {
                    farmName: true,
                    rating: true,
                    totalSales: true,
                    farmingPractice: true,
                    certifications: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limitNum,
        }),
        prisma.listing.count({ where }),
      ]);

      res.json({
        listings,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
      });
    } catch (err) {
      console.error('[listings/get]', err);
      res.status(500).json({ error: 'Failed to fetch listings' });
    }
  }
);

// GET /api/listings/:id
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: req.params.id },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            country: true,
            isVerified: true,
            avatarUrl: true,
            createdAt: true,
            supplierProfile: true,
          },
        },
      },
    });

    if (!listing) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }

    res.json(listing);
  } catch (err) {
    console.error('[listings/:id]', err);
    res.status(500).json({ error: 'Failed to fetch listing' });
  }
});

// POST /api/listings — create (SUPPLIER only)
router.post(
  '/',
  authenticate,
  requireRole('SUPPLIER'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('materialType').isIn(['WOOL','COTTON','LINEN','SILK','LEATHER','CASHMERE','ALPACA','OTHER']),
    body('description').trim().notEmpty(),
    body('pricePerKg').isFloat({ min: 0.01 }).withMessage('Price must be > 0'),
    body('minimumOrderKg').isFloat({ min: 0.1 }),
    body('availableKg').isFloat({ min: 0.1 }),
    body('allowSamples').optional().isBoolean(),
    body('samplePriceUsd').optional().isFloat({ min: 0 }),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { title, materialType, description, pricePerKg, minimumOrderKg, availableKg, allowSamples, samplePriceUsd } = req.body;

    try {
      const listing = await prisma.listing.create({
        data: {
          supplierId: req.user!.id,
          title,
          materialType,
          description,
          pricePerKg: parseFloat(pricePerKg),
          minimumOrderKg: parseFloat(minimumOrderKg),
          availableKg: parseFloat(availableKg),
          allowSamples: allowSamples === true || allowSamples === 'true',
          samplePriceUsd: samplePriceUsd ? parseFloat(samplePriceUsd) : null,
          images: [],
        },
      });

      res.status(201).json(listing);
    } catch (err) {
      console.error('[listings/create]', err);
      res.status(500).json({ error: 'Failed to create listing' });
    }
  }
);

// PUT /api/listings/:id — update (owner only)
router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
    if (!listing) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }
    if (listing.supplierId !== req.user!.id) {
      res.status(403).json({ error: 'Not your listing' });
      return;
    }

    const allowed = ['title','materialType','description','pricePerKg','minimumOrderKg','availableKg','status','allowSamples','samplePriceUsd'];
    const data: Record<string, unknown> = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        data[key] = req.body[key];
      }
    }

    const updated = await prisma.listing.update({
      where: { id: req.params.id },
      data,
    });

    res.json(updated);
  } catch (err) {
    console.error('[listings/update]', err);
    res.status(500).json({ error: 'Failed to update listing' });
  }
});

// DELETE /api/listings/:id — delete (owner only)
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
    if (!listing) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }
    if (listing.supplierId !== req.user!.id) {
      res.status(403).json({ error: 'Not your listing' });
      return;
    }

    await prisma.listing.delete({ where: { id: req.params.id } });
    res.json({ message: 'Listing deleted' });
  } catch (err) {
    console.error('[listings/delete]', err);
    res.status(500).json({ error: 'Failed to delete listing' });
  }
});

// POST /api/listings/:id/images — upload images (up to 5)
router.post(
  '/:id/images',
  authenticate,
  upload.array('images', 5),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
      if (!listing) {
        res.status(404).json({ error: 'Listing not found' });
        return;
      }
      if (listing.supplierId !== req.user!.id) {
        res.status(403).json({ error: 'Not your listing' });
        return;
      }

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        res.status(400).json({ error: 'No images uploaded' });
        return;
      }

      const newImages = files.map((f) => (f as any).path ?? `/uploads/${f.filename}`);
      const allImages = [...listing.images, ...newImages].slice(0, 5);

      const updated = await prisma.listing.update({
        where: { id: req.params.id },
        data: { images: allImages },
      });

      res.json({ images: updated.images });
    } catch (err) {
      console.error('[listings/images]', err);
      res.status(500).json({ error: 'Failed to upload images' });
    }
  }
);

export default router;
