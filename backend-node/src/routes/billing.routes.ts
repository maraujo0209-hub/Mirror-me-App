import { Router, Request, Response } from 'express';
import { pgPool } from '../config/db';
import authMiddleware from '../middlewares/authMiddleware';
import rateLimiter from '../middlewares/rateLimiter';
import { environment } from '../config/environment';
import { logger } from '../utils/logger';

const router = Router();

/**
 * POST /api/billing/webhook
 * ⚠️ CRITICAL ENDPOINT: Processes asynchronous automated transaction push logs from Stripe servers.
 * NOTE: This endpoint operates BEFORE the authMiddleware because it is called by Stripe, not a logged-in user.
 */
router.post('/webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  
  // In production, instantiate Stripe natively to decode and verify signatures securely:
  // const event = stripe.webhooks.constructEvent(req.body, sig, environment.STRIPE_WEBHOOK_SECRET);
  
  try {
    const payload = req.body;
    const eventType = payload.type;

    logger.info(`Received Stripe Webhook transaction signal event: [${eventType}]`);

    // 1. Evaluate incoming billing payload categories
    if (eventType === 'checkout.session.completed') {
      const session = payload.data.object;
      const stripeCustomerId = session.customer;
      const stripeSubscriptionId = session.subscription;

      // Upgrade account profile clearance layers to premium instantly upon payment verification
      const updateBillingQuery = `
        UPDATE billing 
        SET stripe_subscription_id = $1, subscription_status = 'active', tier = 'premium', current_period_end = NOW() + INTERVAL '1 month'
        WHERE stripe_customer_id = $2
        RETURNING user_id
      `;
      const billingRes = await pgPool.query(updateBillingQuery, [stripeSubscriptionId, stripeCustomerId]);

      if (billingRes.rowCount > 0) {
        const userId = billingRes.rows[0].user_id;
        await pgPool.query("UPDATE users SET role = 'premium' WHERE id = $1", [userId]);
        logger.info(`Account subscription cluster successfully upgraded to PREMIUM for User UUID: [${userId}]`);
      }
    } 
    
    else if (eventType === 'customer.subscription.deleted') {
      const subscription = payload.data.object;
      const stripeSubscriptionId = subscription.id;

      // Revoke workspace premium clearance parameters gracefully if account tier falls out of scope
      const revokeBillingQuery = `
        UPDATE billing 
        SET subscription_status = 'canceled', tier = 'free'
        WHERE stripe_subscription_id = $1
        RETURNING user_id
      `;
      const billingRes = await pgPool.query(revokeBillingQuery, [stripeSubscriptionId]);

      if (billingRes.rowCount > 0) {
        const userId = billingRes.rows[0].user_id;
        await pgPool.query("UPDATE users SET role = 'user' WHERE id = $1", [userId]);
        logger.info(`Account subscription parameter downgraded to standard free tier for User UUID: [${userId}]`);
      }
    }

    // Acknowledge receipt of verification log hook to Stripe servers instantly
    res.status(200).json({ received: true });
  } catch (error) {
    logger.error('Stripe Webhook ingestion pipeline parsing exception error:', error);
    res.status(400).json({ error: 'Webhook processing sequence failed parsing parameters.' });
  }
});

// ============================================================================
// PROTECTED USER BILLING METRIC ROUTES
// ============================================================================
router.use(authMiddleware);
router.use(rateLimiter(1 * 60 * 1000, 20)); // Limit card transactional routes to 20 inquiries per minute maximum

/**
 * POST /api/billing/create-checkout
 * Mounts secure target parameters to configure an outward-facing subscription payment session url
 */
router.post('/create-checkout', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    // Fetch account subscription data from your database pool
    const billingRecord = await pgPool.query('SELECT stripe_customer_id FROM billing WHERE user_id = $1', [userId]);

    if (billingRecord.rows.length === 0) {
      res.status(444).json({ error: 'Billing profile telemetry data not initialized for active profile.' });
      return;
    }

    const stripeCustomerId = billingRecord.rows[0].stripe_customer_id;

    // In your real setup, instantiate Stripe here to create an actual checkout page link:
    // const session = await stripe.checkout.sessions.create({ ... })
    
    // Simulating secure token redirect engine path response configurations:
    const mockCheckoutUrl = `https://checkout.stripe.com/pay/mock_session_${Math.random().toString(36).substring(5)}`;

    res.status(200).json({
      success: true,
      checkoutUrl: mockCheckoutUrl,
    });
  } catch (error) {
    logger.error(`Billing Controller Transaction Fault at POST /create-checkout for User [${req.user?.id}]:`, error);
    res.status(500).json({ error: 'Failed to instantiate transactional gateway payment connection.' });
  }
});

/**
 * GET /api/billing/status
 * Exposes active subscription status parameters to update the Next.js layout interface context
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    const billingRes = await pgPool.query(
      'SELECT subscription_status, tier, current_period_end FROM billing WHERE user_id = $1',
      [userId]
    );

    if (billingRes.rows.length === 0) {
      res.status(404).json({ error: 'No active profile logs registered to profile.' });
      return;
    }

    res.status(200).json({
      success: true,
      billing: billingRes.rows[0],
    });
  } catch (error) {
    logger.error(`Billing Controller Transaction Fault at GET /status for User [${req.user?.id}]:`, error);
    res.status(500).json({ error: 'Failed to compile payment tier record tracking details.' });
  }
});

export default router;
