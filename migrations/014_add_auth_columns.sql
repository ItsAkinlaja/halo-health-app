-- Add missing authentication columns to users table

-- Add last_login_at column
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;

-- Add failed_login_attempts column
ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;

-- Add account_locked_until column
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMP WITH TIME ZONE;

-- Create index for account lockout queries
CREATE INDEX IF NOT EXISTS idx_users_account_locked ON users(account_locked_until) WHERE account_locked_until IS NOT NULL;

-- Create index for last login
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login_at);

-- Update existing users to have 0 failed attempts
UPDATE users SET failed_login_attempts = 0 WHERE failed_login_attempts IS NULL;
