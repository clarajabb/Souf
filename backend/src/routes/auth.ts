import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

// POST /api/auth/register
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('role').isIn(['SUPPLIER', 'BUYER']).withMessage('Role must be SUPPLIER or BUYER'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password, name, role, country, phone, language, farmName, description, location, region, farmingPractice } = req.body;

    try {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        res.status(409).json({ error: 'Email already registered' });
        return;
      }

      const hashed = await bcrypt.hash(password, 12);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashed,
          name,
          role,
          country: country || null,
          phone: phone || null,
          language: language || 'en',
        },
      });

      // If supplier, create profile
      if (role === 'SUPPLIER' && farmName) {
        await prisma.supplierProfile.create({
          data: {
            userId: user.id,
            farmName,
            description: description || '',
            location: location || country || '',
            region: region || null,
            farmingPractice: farmingPractice || 'CONVENTIONAL',
            certifications: [],
          },
        });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          country: user.country,
          isVerified: user.isVerified,
          language: user.language,
        },
      });
    } catch (err) {
      console.error('[register]', err);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password } = req.body;

    try {
      const user = await prisma.user.findUnique({
        where: { email },
        include: { supplierProfile: true },
      });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      const { password: _pw, ...safeUser } = user;
      res.json({ token, user: safeUser });
    } catch (err) {
      console.error('[login]', err);
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

// GET /api/auth/me
router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { supplierProfile: true },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const { password: _pw, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    console.error('[me]', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;
