import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import http from 'http';

// Configuration & Base Utilities Injections
import { environment } from './config/environment';
import { connectPostgres, connectMongo } from './config/db';
import { logger, loggerStream } from './utils/logger';

// Custom Middleware Layer Infrastructure
import rateLimiter from './middlewares/rateLimiter';

// Functional Component Router Registries
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import adminRoutes from './routes/admin.routes';
import avatarRoutes from './routes/avatar.routes';
import meetingRoutes from './routes/meeting.routes';
import billingRoutes from './routes/billing.routes';
import analyticsRoutes from './routes/analytics.routes';

// ============================================================================
// 1. DATABASE CONNECTION INTROSPECTION LIFECYCLE
// ============================================================================
const initializeDatabases = async (): Promise<void> => {
  try {
    logger.info('Initializing dual-database layer connections...');
    await connectPostgres();
    await connectMongo();
    logger.info('Both database clusters synced and running smoothly.');
  } catch (error: any) {
    logger.error('CRITICAL FAULT: Failed to secure essential core database channels:', error);
    process.exit(1); // Stop execution immediately if databases fail to bind
  }
};

initializeDatabases();

// ============================================================================
// 2. EXPRESS ENGINE ASSEMBLY & GLOBAL FIREWALL LAYER SETUP
// ============================================================================
const app: Application = express();
const server = http.createServer(app);

// Strict Security headers injection configuration
app.use(helmet());

// Dynamic CORS integration setup
app.use(cors({
  origin: environment.ALLOWED_ORIGINS || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature'],
}));

// HTTP Traffic Network Logging Stream Configuration (Pipes raw request lines to Winston)
app.use(morgan(':method :url :status :res[content-length] - :response-time ms', { stream: loggerStream }));

// ⚡ WARNING: Stripe webhook signatures require access to the unparsed raw request stream layout body.
// To manage this, we selectively inject standard JSON body parsing to non-webhook routes.
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.originalUrl === '/api/billing/webhook') {
    express.raw({ type: 'application/json' })(req, res, next);
  } else {
    express.json({ limit: '15mb' })(req, res, next);
  }
});

// Attach standard URL-encoded parser block boundaries
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Apply standard global rate throttling configurations to standard traffic layers
app.use('/api/', rateLimiter(1 * 60 * 1000, 150)); // Global cushion boundary: 150 requests/minute max

// ============================================================================
// 3. MASTER ROUTING MODULES MOUNT POINT REGISTRATION
// ============================================================================
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/avatar', avatarRoutes);
app.use('/api/meeting', meetingRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/analytics', analyticsRoutes);

/**
 * Global Base Health Check Probe Entry Point
 */
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime(),
    environment: environment.NODE_ENV,
  });
});

// ============================================================================
// 4. CATCH-ALL UNHANDLED EXCEPTION FIREWALL MIDDLEWARE BOUNDARY
// ============================================================================
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const errorStatus = err.status || err.statusCode || 500;
  const errorMessage = err.message || 'An unexpected runtime service execution fault occurred.';

  logger.error(`Unhandled Exception Error caught at [${req.method} ${req.originalUrl}]:`, {
    message: errorMessage,
    status: errorStatus,
    stack: err.stack,
  });

  res.status(errorStatus).json({
    error: err.name || 'InternalServerError',
    message: environment.NODE_ENV === 'production' 
      ? 'A critical backend runtime evaluation error occurred.' 
      : errorMessage,
  });
});

// ============================================================================
// 5. BOOTSTRAP THREAD LISTEN LIFECYCLE INITIALIZATION
// ============================================================================
const PORT = environment.PORT || 5000;

server.listen(PORT, () => {
  logger.info(`===========================================================`);
  logger.info(` 🚀 MIRROR ME CORE EXPRESS CORE ENGINE ONLINE AT PORT: [${PORT}]`);
  logger.info(` ACTIVE MODE SETTING: [${environment.NODE_ENV.toUpperCase()}]`);
  logger.info(`===========================================================`);
});

// Catch rogue global promises leaks to prevent thread drop timeouts
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('CRITICAL UNHANDLED ASYNCHRONOUS REJECTION ENGINE ALERT:', reason);
});

export { app, server };
