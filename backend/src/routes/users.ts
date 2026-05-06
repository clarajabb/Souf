import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { AuthRequest } from '../types';

const router = Router();

// GET /api/suppliers/:id — public supplier profile
router.get('/suppliers/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id, role: 'SUPPLIER' },
      select: {
        id: true,
        name: true,
        country: true,
        avatarUrl: true,
        isVerified: true,
        createdAt: true,
        supplierProfile: true,
        listings: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        receivedReviews: {
          include: {
            reviewer: { select: { id: true, name: true, avatarUrl: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: 'Supplier not found' });
      return;
    }

    res.json(user);
  } catch (err) {
    console.error('[suppliers/:id]', err);
    res.status(500).json({ error: 'Failed to fetch supplier' });
  }
});

// PUT /api/profile — update own profile
router.put('/profile', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const allowed = ['name', 'phone', 'country', 'language'];
  const userData: Record<string, unknown> = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) userData[key] = req.body[key];
  }

  try {
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: userData,
      select: {
        id: true, name: true, email: true, role: true, country: true,
        phone: true, language: true, avatarUrl: true, isVerified: true, createdAt: true,
        supplierProfile: true,
      },
    });

    // Update supplier profile fields if present
    if (req.user!.role === 'SUPPLIER') {
      const profileAllowed = ['farmName', 'description', 'location', 'region', 'farmingPractice', 'certifications', 'lat', 'lng'];
      const profileData: Record<string, unknown> = {};
      for (const key of profileAllowed) {
        if (req.body[key] !== undefined) profileData[key] = req.body[key];
      }

      if (Object.keys(profileData).length > 0) {
        await prisma.supplierProfile.upsert({
          where: { userId: req.user!.id },
          create: {
            userId: req.user!.id,
            farmName: profileData.farmName as string || '',
            description: profileData.description as string || '',
            location: profileData.location as string || '',
            ...profileData,
          },
          update: profileData,
        });
      }
    }

    res.json(user);
  } catch (err) {
    console.error('[profile/update]', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// POST /api/profile/avatar — upload avatar
router.post(
  '/profile/avatar',
  authenticate,
  upload.single('avatar'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }
    try {
      const avatarUrl = `/uploads/${req.file.filename}`;
      await prisma.user.update({
        where: { id: req.user!.id },
        data: { avatarUrl },
      });
      res.json({ avatarUrl });
    } catch (err) {
      console.error('[profile/avatar]', err);
      res.status(500).json({ error: 'Failed to upload avatar' });
    }
  }
);

// POST /api/profile/verify — request verified badge (stub)
router.post('/profile/verify', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  res.json({ message: 'Verification request submitted. An admin will review your account.' });
});

export default router;
