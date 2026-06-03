import { Pool } from 'pg';
import mongoose from 'mongoose';
import { logger } from '../utils/logger';
import { environment } from './environment';

// ============================================================================
// 1. POSTGRESQL CONNECTION CONFIGURATION (Relational Data)
// ============================================================================
export const pgPool = new Pool({
  host: environment.DB_PG_HOST || 'localhost',
  port: parseInt(environment.DB_PG_PORT || '5432', 10),
  user: environment.DB_PG_USER || 'postgres',
  password: environment.DB_PG_PASSWORD || 'password',
  database: environment.DB_PG_NAME || 'mirror_me_relational',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pgPool.on('error', (err) => {
  logger.error('Unexpected error on idle PostgreSQL client', err);
});

// ============================================================================
// 2. MONGODB CONNECTION CONFIGURATION (Document/AI Metadata Data)
// ============================================================================
const MONGO_URI = environment.MONGODB_URI || 'mongodb://localhost:27017/mirror_me_docs';

// Ensure Mongoose handles connection events gracefully
mongoose.connection.on('connected', () => {
  logger.info('MongoDB database connection established successfully.');
});

mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB connection error baseline: ${err}`);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB database disconnected.');
});

// ============================================================================
// 3. CENTRALIZED INITIALIZATION INTERFACE
// ============================================================================
export const connectDatabases = async (): Promise<void> => {
  // Initialize PostgreSQL Connection
  try {
    const client = await pgPool.connect();
    logger.info('PostgreSQL connection pool verified and active.');
    client.release(); // Return the client to the pool immediately
  } catch (error) {
    logger.error('Failed to connect to PostgreSQL database:', error);
    process.exit(1); // Kill service boot cycle if vital data engines are offline
  }

  // Initialize MongoDB Connection
  try {
    await mongoose.connect(MONGO_URI, {
      autoIndex: true, // Build indexes automatically for schema performance
    });
  } catch (error) {
    logger.error('Failed to connect to MongoDB database:', error);
    process.exit(1);
  }
};
