import { Router, Request, Response } from 'express';
import { pgPool } from '../config/db';
import { MeetingAnalysisModel } from '../models/MongoSchemas';
import authMiddleware from '../middlewares/authMiddleware';
import rateLimiter from '../middlewares/rateLimiter';
import { logger } from '../utils/logger';

const router = Router();

// Enforce standard token authentication verification and traffic controls across all meeting nodes
router.use(authMiddleware);
router.use(rateLimiter(1 * 60 * 1000, 45)); // 45 requests per minute ceiling

/**
 * POST /api/meeting/new
 * Provisions a fresh calendar row and meeting room hook in the PostgreSQL database
 */
router.post('/new', async (req: Request, res: Response) => {
  try {
    const hostId = req.user?.id;
    const { title, scheduledTime } = req.body;

    if (!title || !scheduledTime) {
      res.status(400).json({ error: 'Meeting title and designated target schedule parameters are required.' });
      return;
    }

    // Mock an active infrastructure WebRTC room link or video call portal endpoint
    const mockRoomUrl = `https://rooms.mirror-me.com/call/room_${Math.random().toString(36).substring(4, 12)}`;

    const insertQuery = `
      INSERT INTO meetings (host_id, title, scheduled_time, status, room_url)
      VALUES ($1, $2, $3, 'scheduled', $4)
      RETURNING id, title, scheduled_time, status, room_url, created_at
    `;
    const result = await pgPool.query(insertQuery, [hostId, title, scheduledTime, mockRoomUrl]);

    res.status(201).json({
      success: true,
      meeting: result.rows[0],
    });
  } catch (error) {
    logger.error(`Meeting Router Exception at POST /new for Host [${req.user?.id}]:`, error);
    res.status(500).json({ error: 'Systemic error provision tracking parameters for new session.' });
  }
});

/**
 * GET /api/meeting/list
 * Pulls all planned, ongoing, or historical meeting assets associated with the account profile
 */
router.get('/list', async (req: Request, res: Response) => {
  try {
    const hostId = req.user?.id;

    const result = await pgPool.query(
      'SELECT id, title, scheduled_time, status, room_url, created_at FROM meetings WHERE host_id = $1 ORDER BY scheduled_time DESC',
      [hostId]
    );

    res.status(200).json({
      success: true,
      count: result.rowCount,
      data: result.rows,
    });
  } catch (error) {
    logger.error(`Meeting Router Exception at GET /list for Host [${req.user?.id}]:`, error);
    res.status(500).json({ error: 'Failed to retrieve registered session collections.' });
  }
});

/**
 * GET /api/meeting/:id/summary
 * Interrogates MongoDB to pull the deep AI analysis, sentiment scoring, and transcripts
 */
router.get('/:id/summary', async (req: Request, res: Response) => {
  try {
    const hostId = req.user?.id;
    const meetingId = req.params.id;

    // 1. Verify access permissions by checking the host ownership map in PostgreSQL first
    const ownershipCheck = await pgPool.query('SELECT id FROM meetings WHERE id = $1 AND host_id = $2', [
      meetingId,
      hostId,
    ]);

    if (ownershipCheck.rows.length === 0) {
      res.status(403).json({ error: 'Access Denied: You are not verified as the host of this interaction slot.' });
      return;
    }

    // 2. Fetch the rich, unstructured transcript analytical payload from MongoDB
    const aiAnalysisSummary = await MeetingAnalysisModel.findOne({ meetingId, hostId });

    if (!aiAnalysisSummary) {
      res.status(404).json({
        success: false,
        message: 'The AI text transcription engine or pipelines have not compiled metrics for this session ID yet.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: aiAnalysisSummary,
    });
  } catch (error) {
    logger.error(`Meeting Summary Aggregate Exception at GET /:id/summary for Host [${req.user?.id}]:`, error);
    res.status(500).json({ error: 'Failed parsing analytical profile components from structural database.' });
  }
});

export default router;
