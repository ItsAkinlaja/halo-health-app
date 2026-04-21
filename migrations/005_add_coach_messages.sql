-- Migration: Add coach_messages table for AI chat history
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS coach_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user history queries
CREATE INDEX idx_coach_messages_user_created ON coach_messages(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE coach_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own messages
CREATE POLICY coach_messages_user_policy ON coach_messages
  FOR ALL
  USING (auth.uid() = user_id);
