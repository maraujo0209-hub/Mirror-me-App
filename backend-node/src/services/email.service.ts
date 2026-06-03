import sgMail from '@sendgrid/mail';
import { environment } from '../config/environment';
import { logger } from '../utils/logger';

// Initialize SendGrid engine configuration if key string parameter is populated
if (environment.SENDGRID_API_KEY) {
  sgMail.setApiKey(environment.SENDGRID_API_KEY);
  logger.info('SendGrid infrastructure initialized and armed for transaction dispatches.');
} else {
  logger.warn('SendGrid API Key missing from configuration environment. Outbound emails will default to local console telemetry stream logs.');
}

interface EmailParameters {
  to: string;
  subject: string;
  htmlContent: string;
}

/**
 * Core Transactional Email Dispatch Service
 * Delivers asynchronous communications to registered users.
 * @param params Object parameters containing recipient details and email contents
 * @returns Promise boolean returning true on successful execution thread loops
 */
export const sendEmail = async (params: EmailParameters): Promise<boolean> => {
  const { to, subject, htmlContent } = params;

  const mailPayload = {
    to: to.toLowerCase().trim(),
    from: environment.FROM_EMAIL || 'noreply@mirror-me.com', // Verified sender profile configuration identity
    subject: subject,
    html: htmlContent,
  };

  try {
    // Case A: Key is present -> dispatch external cloud payload request
    if (environment.SENDGRID_API_KEY) {
      await sgMail.send(mailPayload);
      logger.info(`Outbound transaction email dispatched successfully to recipient: [${mailPayload.to}]`);
      return true;
    } 
    
    // Case B: Local Development / Sandbox environment testing fallback
    else {
      logger.info('--- 📥 LOCAL ENVIRONMENT DEVELOPER TRANSLATION EMAIL STREAM ---');
      logger.info(`FROM: ${mailPayload.from}`);
      logger.info(`TO: ${mailPayload.to}`);
      logger.info(`SUBJECT: ${mailPayload.subject}`);
      logger.info(`BODY SNAPSHOT:\n${mailPayload.html}`);
      logger.info('------------------------------------------------------------');
      return true;
    }
  } catch (error: any) {
    logger.error(`Outbound Mail Delivery Exception addressing target [${to}]:`, error.message);
    
    // In production, parse nested SendGrid internal arrays for maximum clarity on validation failures
    if (error.response && error.response.body) {
      logger.error('SendGrid Engine Response Block Diagnostics:', JSON.stringify(error.response.body));
    }
    
    // Return false instead of completely locking up application threads if email networks fail
    return false;
  }
};

/**
 * Pre-compiled Transactional Layout Template: User Registration Greeting
 */
export const sendWelcomeEmail = async (userEmail: string, userName: string): Promise<boolean> => {
  const htmlLayout = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #4F46E5;">Welcome to the Mirror Me Ecosystem, ${userName}!</h2>
      <p>Your digital workspace structure and AI cloning virtualization engines have been successfully provisioned.</p>
      <p>Log in to your authoring portal or enterprise application nodes to begin rendering custom voice engines, generating avatars, or compiling session analytic frameworks.</p>
      <br />
      <hr style="border: 0; border-top: 1px solid #eee;" />
      <p style="font-size: 12px; color: #666;">If you did not execute this registration profile initialization sequence, please disregard this automated notification.</p>
    </div>
  `;

  return sendEmail({
    to: userEmail,
    subject: 'Your Mirror Me Workspace Account is Ready!',
    htmlContent: htmlLayout,
  });
};
