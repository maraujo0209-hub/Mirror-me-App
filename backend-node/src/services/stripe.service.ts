import Stripe from 'stripe';
import { environment } from '../config/environment';
import { logger } from '../utils/logger';

// Initialize the Stripe instance if a key is present, otherwise fall back to null
const stripeInstance = environment.STRIPE_SECRET_KEY
  ? new Stripe(environment.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' as any })
  : null;

if (!stripeInstance) {
  logger.warn('Stripe Secret Key is missing. Subscription services will operate in SIMULATION MODE.');
} else {
  logger.info('Stripe payment processing infrastructure linked and initialized.');
}

interface CheckoutSessionParameters {
  userId: string;
  userEmail: string;
  stripeCustomerId: string;
  successUrl: string;
  cancelUrl: string;
  priceId?: string; // Optional: Pass a specific Stripe Price ID (e.g., 'price_12345') from your dashboard
}

/**
 * Creates a unique customer record inside Stripe's ecosystem.
 * @param email The target account email address
 * @param name Profile description parameter
 * @returns Promise string returning the generated Customer ID string ('cus_XXXX')
 */
export const createStripeCustomer = async (email: string, name: string): Promise<string> => {
  try {
    if (stripeInstance) {
      const customer = await stripeInstance.customers.create({
        email: email.toLowerCase().trim(),
        name: name,
        metadata: { sourcePlatform: 'Mirror-Me-Ecosystem' },
      });
      return customer.id;
    }

    // Simulation Fallback Mode
    const mockCustomerId = `cus_sim_${Math.random().toString(36).substring(2, 10)}`;
    logger.info(`Stripe Simulation: Created mock customer ID [${mockCustomerId}] for [${email}]`);
    return mockCustomerId;
  } catch (error: any) {
    logger.error('Stripe Customer Provisioning Exception:', error.message);
    throw new Error('Failed to synchronize payment engine registration metadata.');
  }
};

/**
 * Generates an checkout session portal configuration object.
 * @param params Operational session parameters
 * @returns Promise string returning the outward-facing target payment gateway URL
 */
export const createSubscriptionCheckoutSession = async (params: CheckoutSessionParameters): Promise<string> => {
  const { stripeCustomerId, successUrl, cancelUrl, priceId } = params;

  try {
    if (stripeInstance) {
      const session = await stripeInstance.checkout.sessions.create({
        customer: stripeCustomerId,
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: [
          {
            // Use a specific price ID if passed, or fall back to a standard default structure
            price: priceId || 'price_default_premium_tier',
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      return session.url || successUrl;
    }

    // Simulation Fallback Mode
    const mockCheckoutUrl = `https://checkout.stripe.com/pay/sim_session_${Math.random().toString(36).substring(4, 12)}`;
    logger.info(`Stripe Simulation: Generated checkout link for Stripe Customer [${stripeCustomerId}]`);
    return mockCheckoutUrl;
  } catch (error: any) {
    logger.error('Stripe Checkout Session Generation Exception:', error.message);
    throw new Error('Could not initialize billing transaction gateway interface.');
  }
};
