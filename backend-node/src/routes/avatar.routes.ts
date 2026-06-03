import { Router, Request, Response } from 'express';
import axios from 'axios';
import { AvatarModel } from '../models/MongoSchemas';
import authMiddleware from '../middlewares/authMiddleware';
import rateLimiter from '../middlewares/rateLimiter';
import { environment } from '../config/environment';
import { logger } from '../utils/logger';

const router = Router();

// Secure all avatar management paths under standard authentication routing and traffic control
router.use(authMiddleware);
router.use(rateLimiter(1 * 60 * 1000, 30)); // 30 requests per minute capacity limit rules

/**
 * POST /api/avatar/new
 * Dispatches raw parameters to the Python service to spin up a new AI avatar rendering job
 */
router.post('/new', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { name, voiceProvider, voiceId, visualProvider, sourceVideoUrl } = req.body;

    if (!name || !voiceProvider || !voiceId || !visualProvider) {
      res.status(400).json({ error: 'Missing core payload configuration properties.' });
      return;
    }

    // 1. Stage the initial tracking document in MongoDB with a 'processing' status
    const newAvatarRecord = await AvatarModel.create({
      userId,
      name,
      status: 'processing',
      voiceEngine: {
        provider: voiceProvider,
        voiceId,
        stability: 0.75,
        clarity: 0.75
      },
      visualModel: {
        provider: visualProvider,
        sourceVideoUrl: sourceVideoUrl || null
      }
    });

    // 2. Dispatch a non-blocking asynchronous request to your Python pipeline container 
    // This offloads heavy OpenAI/ElevenLabs/D-ID processing to keep your Node thread free
    axios.post(`${environment.PYTHON_PIPELINE_URL}/api/pipeline/generate`, {
      avatarId: newAvatarRecord._id,
      userId,
      voiceId,
      voiceProvider,
      visualProvider,
      sourceVideoUrl
    }).catch((err) => {
      // Catching asynchronously: If the python link is broken, log it immediately
      logger.error(`Asynchronous Python AI background link fault for Avatar ID [${newAvatarRecord._id}]:`, err.message);
    });

    // 3. Instantly return a 201 Created status to the frontend along with the tracking ID
    res.status(201).json({
      success: true,
      message: 'AI Avatar generation pipeline initiated successfully.',
      avatar: newAvatarRecord
    });
  } catch (error) {
    logger.error(`Avatar Pipeline Exception at POST /new for User [${req.user?.id}]:`, error);
    res.status(500).json({ error: 'Failed to initialize AI avatar rendering sequence.' });
  }
});

/**
 * GET /api/avatar/list
 * Fetches all digital twin configurations belonging to the authenticated account profile
 */
router.get('/list', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    // Fetch documents, indexed by userId for lightning-fast reads
    const avatars = await AvatarModel.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: avatars.length,
      data: avatars
    });
  } catch (error) {
    logger.error(`Avatar Pipeline Exception at GET /list for User [${req.user?.id}]:`, error);
    res.status(500).json({ error: 'Failed to retrieve registered avatar portfolio collections.' });
  }
});

/**
 * GET /api/avatar/:id
 * Fetches a single avatar document to check its real-time processing status
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const avatarId = req.params.id;

    const avatar = await AvatarModel.findOne({ _id: avatarId, userId });

    if (!avatar) {
      res.status(404).json({ error: 'Targeted avatar record not found or access restricted.' });
      return;
    }

    res.status(200).json({
      success: true,
      data: avatar
    });
  } catch (error) {
    logger.error(`Avatar Pipeline Exception at GET /:id for User [${req.user?.id}]:`, error);
    res.status(500).json({ error: 'Failed to extract targeted avatar specification metrics.' });
  }
});

export default router;
