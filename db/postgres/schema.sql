-- CareerOS schema for Neon Postgres.
-- Mirrors the D1 schema in drizzle/*.sql. Timestamps stay UTC text "YYYY-MM-DD HH:MM:SS"
-- (the format the app reads), integers are bigint, and booleans are 0/1.
-- chat_sessions, chat_messages and resume_versions carry an explicit "rowid" column because
-- the app orders by SQLite's rowid to keep same-second rows in insertion order.

CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY,
  email text NOT NULL UNIQUE,
  display_name text,
  auth_provider text NOT NULL DEFAULT 'neon',
  role text NOT NULL DEFAULT 'USER',
  status text NOT NULL DEFAULT 'ACTIVE',
  created_at text NOT NULL DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS'),
  updated_at text NOT NULL DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS')
);

CREATE TABLE IF NOT EXISTS cms_resources (
  id text PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  column_no bigint NOT NULL DEFAULT 1,
  published bigint NOT NULL DEFAULT 1,
  created_at text NOT NULL DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS'),
  updated_at text NOT NULL DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS'),
  resource_type text NOT NULL DEFAULT 'link',
  article_content text NOT NULL DEFAULT '',
  template_config_json text NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS grader_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at text NOT NULL DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS')
);

CREATE TABLE IF NOT EXISTS ai_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at text NOT NULL DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS')
);

CREATE TABLE IF NOT EXISTS feed_cache (
  key text PRIMARY KEY,
  payload text NOT NULL,
  fetched_at bigint NOT NULL
);

CREATE TABLE IF NOT EXISTS usage_limits (
  key text PRIMARY KEY,
  count bigint NOT NULL DEFAULT 0,
  expires_at bigint NOT NULL
);

CREATE TABLE IF NOT EXISTS resumes (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users (id),
  title text NOT NULL,
  company text NOT NULL DEFAULT '',
  bullets_json text NOT NULL DEFAULT '[]',
  created_at text NOT NULL DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS'),
  updated_at text NOT NULL DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS'),
  kind text NOT NULL DEFAULT 'resume',
  job_description text NOT NULL DEFAULT '',
  template_config_json text NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS job_applications (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users (id),
  title text NOT NULL,
  company text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'Saved',
  url text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  created_at text NOT NULL DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS'),
  updated_at text NOT NULL DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS')
);

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id text PRIMARY KEY REFERENCES users (id),
  next_goal text NOT NULL DEFAULT 'Land a new job in the same career path',
  target_title text NOT NULL DEFAULT 'General Manager',
  target_date text NOT NULL DEFAULT 'July 2024',
  salary_range text NOT NULL DEFAULT '$51,000 to $75,000',
  onboarding_json text NOT NULL DEFAULT '[]',
  lesson_done bigint NOT NULL DEFAULT 0,
  updated_at text NOT NULL DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS'),
  has_completed_tour bigint NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS resume_match_scores (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users (id),
  resume_id text NOT NULL UNIQUE REFERENCES resumes (id),
  score bigint NOT NULL,
  title text NOT NULL DEFAULT '',
  company text NOT NULL DEFAULT '',
  created_at text NOT NULL DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS')
);

CREATE TABLE IF NOT EXISTS companies (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users (id),
  name text NOT NULL,
  website text NOT NULL DEFAULT '',
  industry text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'Researching',
  notes text NOT NULL DEFAULT '',
  created_at text NOT NULL DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS'),
  updated_at text NOT NULL DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS')
);

CREATE TABLE IF NOT EXISTS contacts (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users (id),
  company_id text REFERENCES companies (id) ON DELETE SET NULL,
  name text NOT NULL,
  role text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  url text NOT NULL DEFAULT '',
  relationship text NOT NULL DEFAULT 'Recruiter',
  notes text NOT NULL DEFAULT '',
  follow_up text NOT NULL DEFAULT '',
  created_at text NOT NULL DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS'),
  updated_at text NOT NULL DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS')
);

CREATE TABLE IF NOT EXISTS application_workspace (
  job_id text PRIMARY KEY REFERENCES job_applications (id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES users (id),
  company_id text REFERENCES companies (id) ON DELETE SET NULL,
  contact_id text REFERENCES contacts (id) ON DELETE SET NULL,
  resume_id text REFERENCES resumes (id) ON DELETE SET NULL,
  cover_letter_id text REFERENCES resumes (id) ON DELETE SET NULL,
  job_description text NOT NULL DEFAULT '',
  interview_notes text NOT NULL DEFAULT '',
  follow_up text NOT NULL DEFAULT '',
  submitted_json text NOT NULL DEFAULT '{}',
  activity_json text NOT NULL DEFAULT '[]',
  updated_at text NOT NULL DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS')
);

CREATE TABLE IF NOT EXISTS resume_versions (
  id text PRIMARY KEY,
  rowid bigint GENERATED BY DEFAULT AS IDENTITY,
  user_id text NOT NULL REFERENCES users (id),
  resume_id text NOT NULL REFERENCES resumes (id) ON DELETE CASCADE,
  label text NOT NULL,
  snapshot_json text NOT NULL,
  created_at text NOT NULL DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS')
);

CREATE TABLE IF NOT EXISTS chat_sessions (
  id text PRIMARY KEY,
  rowid bigint GENERATED BY DEFAULT AS IDENTITY,
  user_id text NOT NULL REFERENCES users (id),
  title text NOT NULL,
  busy_until bigint NOT NULL DEFAULT 0,
  created_at text NOT NULL DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS'),
  updated_at text NOT NULL DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS')
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id text PRIMARY KEY,
  rowid bigint GENERATED BY DEFAULT AS IDENTITY,
  session_id text NOT NULL REFERENCES chat_sessions (id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL,
  status text NOT NULL DEFAULT 'complete',
  context_label text NOT NULL DEFAULT '',
  created_at text NOT NULL DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS')
);

CREATE INDEX IF NOT EXISTS resumes_user_idx ON resumes (user_id);
CREATE INDEX IF NOT EXISTS job_applications_user_idx ON job_applications (user_id);
CREATE INDEX IF NOT EXISTS resume_versions_resume_idx ON resume_versions (resume_id, user_id);
CREATE INDEX IF NOT EXISTS chat_sessions_user_idx ON chat_sessions (user_id);
CREATE INDEX IF NOT EXISTS chat_messages_session_idx ON chat_messages (session_id);
