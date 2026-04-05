-- ProntoVoila Database Schema
-- Run: psql -d prontovoila -f src/db/schema.sql

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) UNIQUE,
  display_name  VARCHAR(255),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Form sessions (one per form-fill attempt)
CREATE TABLE IF NOT EXISTS sessions (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER REFERENCES users(id) ON DELETE SET NULL,
  file_name       VARCHAR(500) NOT NULL,
  file_mime       VARCHAR(100),
  lang_code       VARCHAR(10) NOT NULL DEFAULT 'en',
  lang_label      VARCHAR(100) NOT NULL DEFAULT 'English',
  form_title      VARCHAR(500),
  total_fields    INTEGER DEFAULT 0,
  filled_fields   INTEGER DEFAULT 0,
  skipped_fields  INTEGER DEFAULT 0,
  status          VARCHAR(20) DEFAULT 'in_progress', -- in_progress, completed, abandoned
  started_at      TIMESTAMPTZ DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Individual field answers
CREATE TABLE IF NOT EXISTS field_answers (
  id            SERIAL PRIMARY KEY,
  session_id    INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  field_id      VARCHAR(255) NOT NULL,
  field_label   VARCHAR(500),
  field_type    VARCHAR(50) DEFAULT 'text',
  value         TEXT,
  original_text TEXT, -- original form label before translation
  skipped       BOOLEAN DEFAULT FALSE,
  answered_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Chat history per session
CREATE TABLE IF NOT EXISTS chat_messages (
  id          SERIAL PRIMARY KEY,
  session_id  INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  role        VARCHAR(10) NOT NULL, -- 'ai' or 'user'
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics / KPI tracking
CREATE TABLE IF NOT EXISTS analytics_events (
  id          SERIAL PRIMARY KEY,
  session_id  INTEGER REFERENCES sessions(id) ON DELETE SET NULL,
  event_type  VARCHAR(100) NOT NULL,
  event_data  JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_field_answers_session_id ON field_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
