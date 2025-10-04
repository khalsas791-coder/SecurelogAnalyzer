/*
  # SecureLog Analyzer Database Schema

  ## Overview
  This migration creates the complete database structure for the SecureLog Analyzer application,
  a security-focused log analysis tool that stores, parses, and analyzes log files for threats.

  ## New Tables

  ### 1. `log_files`
  Stores metadata about uploaded log files.
  - `id` (uuid, primary key) - Unique identifier for each log file
  - `name` (text, not null) - Original filename of the uploaded log
  - `size` (bigint, default 0) - File size in bytes
  - `type` (text, default 'unknown') - Detected log format (apache, nginx, syslog, json, generic)
  - `uploaded_at` (timestamptz, default now()) - When the file was uploaded
  - `line_count` (integer, default 0) - Total number of log lines in the file
  - `status` (text, default 'uploaded') - Processing status: uploaded, parsing, parsed, or error

  ### 2. `log_entries`
  Stores individual parsed log entries extracted from log files.
  - `id` (uuid, primary key) - Unique identifier for each log entry
  - `log_file_id` (uuid, foreign key) - References parent log file (cascade delete)
  - `line_number` (integer, not null) - Line number in original file
  - `timestamp` (timestamptz, nullable) - Extracted timestamp from log entry
  - `level` (text, nullable) - Log level (ERROR, WARNING, INFO, DEBUG, etc.)
  - `source` (text, nullable) - Source IP address, hostname, or service name
  - `message` (text, not null) - Full log message content
  - `parsed_data` (jsonb, default '{}') - Structured parsed data as JSON
  - `created_at` (timestamptz, default now()) - When entry was created in database

  ### 3. `security_alerts`
  Stores detected security threats and anomalies.
  - `id` (uuid, primary key) - Unique identifier for each alert
  - `log_entry_id` (uuid, foreign key, nullable) - References related log entry
  - `alert_type` (text, not null) - Type of threat (sql_injection, xss, brute_force, etc.)
  - `severity` (text, default 'medium') - Severity level: low, medium, high, or critical
  - `description` (text, not null) - Detailed description of the security alert
  - `created_at` (timestamptz, default now()) - When alert was created

  ### 4. `analysis_sessions`
  Tracks user analysis sessions for organizing work.
  - `id` (uuid, primary key) - Session identifier
  - `name` (text, not null) - User-defined session name
  - `created_at` (timestamptz, default now()) - Session creation time
  - `last_accessed` (timestamptz, default now()) - Last time session was accessed

  ## Security

  ### Row Level Security (RLS)
  - RLS is enabled on all tables for security
  - Public access policies are configured for offline/portable use
  - No authentication is required (suitable for local/offline usage)

  ### Important Notes
  1. All tables use `gen_random_uuid()` for automatic UUID generation
  2. Foreign key constraints include `ON DELETE CASCADE` for data integrity
  3. Check constraints ensure valid enum values for status and severity
  4. Default values are provided for timestamps, status fields, and JSON data

  ## Performance

  ### Indexes
  Performance indexes are created on frequently queried columns:
  - `log_entries.log_file_id` - Fast filtering by parent file
  - `log_entries.timestamp` - Time-based queries and sorting
  - `log_entries.level` - Filtering by log level
  - `log_entries.source` - Queries by source IP/host
  - `security_alerts.severity` - Alert priority filtering
  - `security_alerts.alert_type` - Threat type analysis
*/

-- Create log_files table
CREATE TABLE IF NOT EXISTS log_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  size bigint NOT NULL DEFAULT 0,
  type text DEFAULT 'unknown',
  uploaded_at timestamptz DEFAULT now(),
  line_count integer DEFAULT 0,
  status text DEFAULT 'uploaded',
  CHECK (status IN ('uploaded', 'parsing', 'parsed', 'error'))
);

-- Create log_entries table
CREATE TABLE IF NOT EXISTS log_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  log_file_id uuid NOT NULL REFERENCES log_files(id) ON DELETE CASCADE,
  line_number integer NOT NULL,
  timestamp timestamptz,
  level text,
  source text,
  message text NOT NULL,
  parsed_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create security_alerts table
CREATE TABLE IF NOT EXISTS security_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  log_entry_id uuid REFERENCES log_entries(id) ON DELETE CASCADE,
  alert_type text NOT NULL,
  severity text NOT NULL DEFAULT 'medium',
  description text NOT NULL,
  created_at timestamptz DEFAULT now(),
  CHECK (severity IN ('low', 'medium', 'high', 'critical'))
);

-- Create analysis_sessions table
CREATE TABLE IF NOT EXISTS analysis_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_accessed timestamptz DEFAULT now()
);

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_log_entries_file_id ON log_entries(log_file_id);
CREATE INDEX IF NOT EXISTS idx_log_entries_timestamp ON log_entries(timestamp);
CREATE INDEX IF NOT EXISTS idx_log_entries_level ON log_entries(level);
CREATE INDEX IF NOT EXISTS idx_log_entries_source ON log_entries(source);
CREATE INDEX IF NOT EXISTS idx_security_alerts_severity ON security_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_security_alerts_type ON security_alerts(alert_type);

-- Enable Row Level Security
ALTER TABLE log_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_sessions ENABLE ROW LEVEL SECURITY;

-- Create public access policies for offline/portable use
CREATE POLICY "Allow public access to log_files"
  ON log_files
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public access to log_entries"
  ON log_entries
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public access to security_alerts"
  ON security_alerts
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public access to analysis_sessions"
  ON analysis_sessions
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);