import { Router, Request, Response } from 'react-router-dom'; // Note: express namespace routing used below
import { Router as ExpressRouter } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pgPool } from '../config/db';
import { environment } from '../config/environment';
import authMiddleware from '../middlewares/authMiddleware';
import rateLimiter from '../middlewares/rateLimiter';
import { logger } from '../utils/logger';

const router = ExpressRouter();

// Apply stricter rate limits specifically to authentication endpoints to mitigate brute-force attacks
const authThrottler = rateLimiter(15 * 60 * 1000, 15); // Maximum 15 login/signup attempts per 15 minutes

/**
 * POST /api/auth/register
 * Registers a new user on the platform and creates their relational profile record
 */
router.post('/register', authThrottler, async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password fields are strictly required.' });
      return;
    }

    // 1. Check if user already exists within the system
    const userCheck = await pgPool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (userCheck.rows.length > 0) {
      res.status(409).json({ error: 'An account with this email address is already registered.' });
      return;
    }

    // 2. Hash the raw password securely using bcrypt
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 3. Insert user record into PostgreSQL database
    const insertQuery = `
      INSERT INTO users (email, password_hash, first_name, last_name, role)
      VALUES ($1, $2, $3, $4, 'user')
      RETURNING id, email, first_name, last_name, role, created_at
    `;
    const result = await pgPool.query(insertQuery, [
      email.toLowerCase().trim(),
      passwordHash,
      firstName || null,
      lastName || null,
    ]);

    const newUser = result.rows[0];

    // 4. Automatically generate an initialization billing record row for Stripe tracking tracking
    await pgPool.query(
      'INSERT INTO billing (user_id, stripe_customer_id, subscription_status, tier) VALUES ($1, $2, $3, $4)',
      [newUser.id, `mock_cus_${Math.random().toString(36).substring(7)}`, 'none', 'free']
    );

    // 5. Generate authorization session JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      environment.JWT_SECRET,
      { expiresIn: environment.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      token,
      user: newUser,
    });
  } catch (error) {
    logger.error('Authentication Router Exception at POST /register:', error);
    res.status(500).json({ error: 'System error handling registration pipeline.' });
  }
});

/**
 * POST /api/auth/login
 * Validates user credentials and issues an active access token session
 */
router.post('/login', authThrottler, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required fields.' });
      return;
    }

    // 1. Fetch user by email address
    const result = await pgPool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid email address or password configuration.' });
      return;
    }

    const user = result.rows[0];

    // 2. Verify encrypted password against hash reference
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid email address or password configuration.' });
      return;
    }

    // 3. Issue cryptographic session token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      environment.JWT_SECRET,
      { expiresIn: environment.JWT_EXPIRES_IN }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        isVerified: user.is_verified,
      },
    });
  } catch (error) {
    logger.error('Authentication Router Exception at POST /login:', error);
    res.status(500).json({ error: 'System error handling authentication login cycle.' });
  }
});

/**
 * GET /api/auth/me
 * Retrieves the currently logged-in user profile snapshot by evaluating their active session token
 */
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    const result = await pgPool.query(
      'SELECT id, email, first_name, last_name, role, is_verified, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User profile session mapping no longer verified.' });
      return;
    }

    res.status(200).json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    logger.error('Authentication Router Exception at GET /me:', error);
    res.status(500).json({ error: 'System error extracting verification session context.' });
  }
});

export default router;
