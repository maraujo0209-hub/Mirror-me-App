import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { pgPool } from '../config/db';
import authMiddleware from '../middlewares/authMiddleware';
import rateLimiter from '../middlewares/rateLimiter';
import { logger } from '../utils/logger';

const router = Router();

// Enforce token validation and standard routing limits across profile management paths
router.use(authMiddleware);
router.use(rateLimiter(1 * 60 * 1000, 20)); // Max 20 adjustments per minute to mitigate database abuse

/**
 * PUT /api/user/profile
 * Updates basic demographic tracking variables on the user profile record
 */
router.put('/profile', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { firstName, lastName } = req.body;

    if (firstName === undefined && lastName === undefined) {
      res.status(400).json({ error: 'At least one modification attribute field is required to process request.' });
      return;
    }

    // Dynamic relational query building based on provided parameters
    const updateQuery = `
      UPDATE users
      SET first_name = COALESCE($1, first_name),
          last_name = COALESCE($2, last_name),
          updated_at = NOW()
      WHERE id = $3
      RETURNING id, email, first_name, last_name, role, updated_at
    `;

    const result = await pgPool.query(updateQuery, [firstName || null, lastName || null, userId]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Target account context mapping could not be verified.' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Account demographic parameters synchronized successfully.',
      user: result.rows[0],
    });
  } catch (error) {
    logger.error(`User Profile Mutation Exception at PUT /profile for User [${req.user?.id}]:`, error);
    res.status(500).json({ error: 'Systemic exception processing account demographic metadata updates.' });
  }
});

/**
 * POST /api/user/change-password
 * Overwrites active cryptographic verification credentials securely using bcrypt
 */
router.post('/change-password', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Both old and replacement password configurations are required fields.' });
      return;
    }

    // 1. Fetch current encrypted hash string from primary pool
    const userResult = await pgPool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      res.status(404).json({ error: 'Target account profile tracking verification missing.' });
      return;
    }

    const currentHash = userResult.rows[0].password_hash;

    // 2. Validate incoming password string against database hash
    const isOldPasswordValid = await bcrypt.compare(currentPassword, currentHash);
    if (!isOldPasswordValid) {
      res.status(401).json({ error: 'Authentication Failed: Verification signature mismatch.' });
      return;
    }

    // 3. Encrypt fresh password data structure using standard security factors
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // 4. Record new cryptographic parameters back to PostgreSQL
    await pgPool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [
      newPasswordHash,
      userId,
    ]);

    logger.info(`Security Alert: Account authorization password updated successfully for User UUID: [${userId}]`);

    res.status(200).json({
      success: true,
      message: 'Cryptographic credentials updated and sync-locked successfully.',
    });
  } catch (error) {
    logger.error(`User Profile Mutation Exception at POST /change-password for User [${req.user?.id}]:`, error);
    res.status(500).json({ error: 'Systemic exception updating cryptographic security credentials.' });
  }
});

export default router;
