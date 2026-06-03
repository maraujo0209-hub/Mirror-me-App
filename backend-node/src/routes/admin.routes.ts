import { Router, Request, Response } from 'express';
import { pgPool } from '../config/db';
import authMiddleware from '../middlewares/authMiddleware';
import rbacMiddleware from '../middlewares/rbacMiddleware';
import rateLimiter from '../middlewares/rateLimiter';
import { logger } from '../utils/logger';

const router = Router();

// Secure the entire routing block: Users must be authenticated and verify as an 'admin'
router.use(authMiddleware);
router.use(rbacMiddleware(['admin']));
router.use(rateLimiter(5 * 60 * 1000, 50)); // Strict 5-minute threshold limits for administrative operations

/**
 * GET /api/admin/users
 * Fetches platform account demographic snapshots directly from the primary relational database
 */
router.get('/users', async (req: Request, res: Response) => {
  try {
    // Select core demographics while completely omitting sensitive field keys like passwords
    const result = await pgPool.query(
      'SELECT id, email, first_name, last_name, role, is_verified, created_at FROM users ORDER BY created_at DESC LIMIT 100'
    );
    
    res.status(200).json({
      success: true,
      count: result.rowCount,
      data: result.rows,
    });
  } catch (error) {
    logger.error('Admin API Fetch Exception at GET /users:', error);
    res.status(500).json({ error: 'Systemic evaluation failure processing administrative data payload.' });
  }
});

/**
 * GET /api/admin/audit-logs
 * Retrieves operations metrics and security exception records
 */
router.get('/audit-logs', async (req: Request, res: Response) => {
  try {
    // Staging mock system analysis traces. 
    // In production, integrate this layer directly with your log stream aggregator or dedicated Audit table.
    const mockAuditLogs = [
      { timestamp: new Date(), executionContext: 'USER_BAN_AUTOMATION', operator: req.user?.email, status: 'SUCCESS' },
      { timestamp: new Date(Date.now() - 3600000), executionContext: 'STRIPE_WEBHOOK_FORCE_SYNC', operator: req.user?.email, status: 'COMPLETED' }
    ];

    res.status(200).json({
      success: true,
      data: mockAuditLogs,
    });
  } catch (error) {
    logger.error('Admin API Fetch Exception at GET /audit-logs:', error);
    res.status(500).json({ error: 'Systemic evaluation failure processing administrative data payload.' });
  }
});

/**
 * GET /api/admin/compliance
 * Provides analytical telemetry counts evaluating platform registration distributions
 */
router.get('/compliance', async (req: Request, res: Response) => {
  try {
    const roleDistributionQuery = `
      SELECT role, COUNT(*) as total_accounts 
      FROM users 
      GROUP BY role
    `;
    const result = await pgPool.query(roleDistributionQuery);

    res.status(200).json({
      success: true,
      metrics: result.rows,
    });
  } catch (error) {
    logger.error('Admin API Fetch Exception at GET /compliance:', error);
    res.status(500).json({ error: 'Systemic evaluation failure processing administrative data payload.' });
  }
});

export default router;
