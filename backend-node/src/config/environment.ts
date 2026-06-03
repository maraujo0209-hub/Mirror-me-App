import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file at the root of the backend-node directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export interface EnvironmentVariables {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  
  // PostgreSQL Configuration
  DB_PG_HOST: string;
  DB_PG_PORT: string;
  DB_PG_USER: string;
  DB_PG_PASSWORD: string;
  DB_PG_NAME: string;
  
  // MongoDB Configuration
  MONGODB_URI: string;
  
  // Third-Party Microservices / AI APIs
  PYTHON_PIPELINE_URL: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  AWS_S3_BUCKET_NAME: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_REGION: string;
  SENDGRID_API_KEY: string;
  FROM_EMAIL: string;
}

export const environment: EnvironmentVariables = {
  NODE_ENV: (process.env.NODE_ENV as any) || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  JWT_SECRET: process.env.JWT_SECRET || 'super_fallback_secret_change_me_in_production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  // PostgreSQL Defaults
  DB_PG_HOST: process.env.DB_PG_HOST || 'localhost',
  DB_PG_PORT: process.env.DB_PG_PORT || '5432',
  DB_PG_USER: process.env.DB_PG_USER || 'postgres',
  DB_PG_PASSWORD: process.env.DB_PG_PASSWORD || 'password',
  DB_PG_NAME: process.env.DB_PG_NAME || 'mirror_me_relational',
  
  // MongoDB Defaults
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/mirror_me_docs',
  
  // Microservices & AI Integrations
  PYTHON_PIPELINE_URL: process.env.PYTHON_PIPELINE_URL || 'http://localhost:8000',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
  AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME || '',
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
  AWS_REGION: process.env.AWS_REGION || 'us-east-1',
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || '',
  FROM_EMAIL: process.env.FROM_EMAIL || 'noreply@mirror-me.com',
};

// Fail-fast validation check for critical keys when running in production environment
if (environment.NODE_ENV === 'production') {
  const criticalKeys: (keyof EnvironmentVariables)[] = [
    'JWT_SECRET',
    'STRIPE_SECRET_KEY',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
  ];

  criticalKeys.forEach((key) => {
    if (!environment[key]) {
      throw new Error(`CRITICAL CONFIGURATION ERROR: Missing required environment variable [${key}] in production configuration.`);
    }
  });
}
