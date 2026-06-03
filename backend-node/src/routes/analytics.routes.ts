import { Router, Request, Response } from 'express';
import { pgPool } from '../config/db';
import { MeetingAnalysisModel } from '../models/MongoSchemas';
import authMiddleware from '../middlewares/authMiddleware';
import rateLimiter from '../middlewares/rateLimiter';
import { logger } from '../utils/logger';

const router = Router();

// Secure all analytical routes under standard verification and rate control
router.use(authMiddleware);
router.use(rateLimiter(1 * 60 * 1000, 60)); // 60 requests per minute ceiling

/**
 * GET /api/analytics/overview
 * Compiles high-level platform telemetry (total sessions, token burn, average sentiment)
 */
router.get('/overview', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    // 1. Query PostgreSQL for total meeting history volumes
    const pgQuery = `
      SELECT COUNT(*) as total_meetings,
             COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_meetings
      FROM meetings 
      WHERE host_id = $1
    `;
    const pgResult = await pgPool.query(pgQuery, [userId]);
    const meetingStats = pgResult.rows[0];

    // 2. Query MongoDB for unstructured AI token usage and sentiment metrics compiled by the Python service
    const mongoAnalyticRecords = await MeetingAnalysisModel.find({ hostId: userId });

    let totalTokensConsumed = 0;
    let combinedSentimentScore = 0;
    const totalAnalyzedSessions = mongoAnalyticRecords.length;

    mongoAnalyticRecords.forEach((record) => {
      totalTokensConsumed += record.tokensConsumed?.total || 0;
      combinedSentimentScore += record.aiSummary?.sentimentScore || 0;
    });

    // Compute averages safely to prevent NaN errors on fresh profiles
    const averageSentiment = totalAnalyzedSessions > 0 
      ? parseFloat((combinedSentimentScore / totalAnalyzedSessions).toFixed(2)) 
      : 0.0;

    res.status(200).json({
      success: true,
      data: {
        totalMeetings: parseInt(meetingStats.total_meetings, 10),
        completedMeetings: parseInt(meetingStats.completed_meetings, 10),
        aiProcessedSessions: totalAnalyzedSessions,
        totalTokensBurned: totalTokensConsumed,
        averageSessionSentiment: averageSentiment,
      },
    });
  } catch (error) {
    logger.error(`Analytics API Aggregation Exception at GET /overview for User [${req.user?.id}]:`, error);
    res.status(500).json({ error: 'Failed to aggregate systemic profile analytical telemetry.' });
  }
});

/**
 * GET /api/analytics/tokens
 * Returns time-series distribution data of AI processing tokens spent across billing cycles
 */
router.get('/tokens', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    // Fetch the 10 most recent analyzed interaction logs to build a token consumption chart profile
    const historicalRecords = await MeetingAnalysisModel.find({ hostId: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('meetingId tokensConsumed createdAt');

    const chartData = historicalRecords.map(record => ({
      date: record.createdAt,
      meetingId: record.meetingId,
      promptTokens: record.tokensConsumed?.prompt || 0,
      completionTokens: record.tokensConsumed?.completion || 0,
      totalTokens: record.tokensConsumed?.total || 0,
    })).reverse(); // Reverse to return chronological order (oldest to newest) for charts

    res.status(200).json({
      success: true,
      data: chartData,
    });
  } catch (error) {
    logger.error(`Analytics API Aggregation Exception at GET /tokens for User [${req.user?.id}]:`, error);
    res.status(500).json({ error: 'Failed to compile token utilization time-series profile.' });
  }
});

export default router;
