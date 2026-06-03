// ============================================================================
// 1. TYPESCRIPT MODEL INFERENCES
// ============================================================================
export interface IUserRow {
  id: string; // UUID v4 format string
  email: string;
  password_hash: string;
  first_name: string | null;
  last_name: string | null;
  role: 'user' | 'premium' | 'admin';
  is_verified: boolean;
  created_at: Date;
  updatedAt: Date;
}

export interface IMeetingRow {
  id: string;
  host_id: string; // Foreign Key pointing to Users
  title: string;
  scheduled_time: Date;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  room_url: string | null; // Third-party room engine context hook
  created_at: Date;
}

export interface IBillingRow {
  id: string;
  user_id: string; // Foreign Key pointing to Users
  stripe_customer_id: string;
  stripe_subscription_id: string | null;
  subscription_status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'none';
  tier: 'free' | 'premium';
  current_period_end: Date | null;
}

// ============================================================================
// 2. RAW SQL INITIALIZATION CONTEXTS
// ============================================================================
export const CREATE_POSTGRES_TABLES_QUERY = `
  -- Enable UUID extension if not already present on server cluster
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

  -- -----------------------------------------------------
  -- USERS CORE TABLE DEFINITION
  -- -----------------------------------------------------
  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'premium', 'admin')),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

  -- -----------------------------------------------------
  -- MEETINGS RELATIONAL TRACKING TABLE
  -- -----------------------------------------------------
  CREATE TABLE IF NOT EXISTS meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')),
    room_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_meetings_host ON meetings(host_id);
  CREATE INDEX IF NOT EXISTS idx_meetings_schedule ON meetings(scheduled_time);

  -- -----------------------------------------------------
  -- ENTERPRISE BILLING MANAGEMENT MATRIX
  -- -----------------------------------------------------
  CREATE TABLE IF NOT EXISTS billing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    stripe_customer_id VARCHAR(255) UNIQUE NOT NULL,
    stripe_subscription_id VARCHAR(255) UNIQUE,
    subscription_status VARCHAR(50) NOT NULL DEFAULT 'none' CHECK (subscription_status IN ('active', 'trialing', 'past_due', 'canceled', 'none')),
    tier VARCHAR(20) NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'premium')),
    current_period_end TIMESTAMP WITH TIME ZONE
  );

  CREATE INDEX IF NOT EXISTS idx_billing_stripe_customer ON billing(stripe_customer_id);
`;
