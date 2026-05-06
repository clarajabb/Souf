import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

// GET /api/messages/:userId — get conversation with a specific user
router.get('/:userId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const myId = req.user!.id;
    const otherId = req.params.userId;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: myId, receiverId: otherId },
          { senderId: otherId, receiverId: myId },
        ],
      },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json(messages);
  } catch (err) {
    console.error('[messages/get]', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// GET /api/messages — get conversation list (latest message per user)
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const myId = req.user!.id;

    // Get all messages involving this user
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: myId }, { receiverId: myId }],
      },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
        receiver: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group by conversation partner — keep only the latest message per partner
    const conversationMap = new Map<string, (typeof messages)[0]>();
    for (const msg of messages) {
      const partnerId = msg.senderId === myId ? msg.receiverId : msg.senderId;
      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, msg);
      }
    }

    // Count unread per conversation
    const conversations = Array.from(conversationMap.values()).map((msg) => {
      const partner = msg.senderId === myId ? msg.receiver : msg.sender;
      return { partner, latestMessage: msg };
    });

    res.json(conversations);
  } catch (err) {
    console.error('[messages/list]', err);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// POST /api/messages — send a message
router.post(
  '/',
  authenticate,
  [
    body('receiverId').notEmpty(),
    body('content').trim().notEmpty().withMessage('Message content is required'),
    body('orderId').optional().isString(),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { receiverId, content, orderId } = req.body;

    try {
      // Verify receiver exists
      const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
      if (!receiver) {
        res.status(404).json({ error: 'Recipient not found' });
        return;
      }

      const message = await prisma.message.create({
        data: {
          senderId: req.user!.id,
          receiverId,
          content,
          orderId: orderId || null,
        },
        include: {
          sender: { select: { id: true, name: true, avatarUrl: true } },
        },
      });

      res.status(201).json(message);
    } catch (err) {
      console.error('[messages/send]', err);
      res.status(500).json({ error: 'Failed to send message' });
    }
  }
);

// PATCH /api/messages/read/:userId — mark messages from a user as read
router.patch('/read/:userId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const myId = req.user!.id;
    const senderId = req.params.userId;

    await prisma.message.updateMany({
      where: { senderId, receiverId: myId, isRead: false },
      data: { isRead: true },
    });

    res.json({ message: 'Messages marked as read' });
  } catch (err) {
    console.error('[messages/read]', err);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

export default router;
