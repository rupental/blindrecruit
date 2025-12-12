/*
  # BlindRecruit Database Schema

  1. New Tables
    - `email_submissions`
      - `id` (uuid, primary key)
      - `email` (text, unique, not null)
      - `privacy_accepted` (boolean, not null)
      - `data_processing_accepted` (boolean, not null)
      - `newsletter_opt_in` (boolean, default false)
      - `created_at` (timestamptz, default now())
      
    - `anonymization_logs`
      - `id` (uuid, primary key)
      - `session_id` (uuid, not null)
      - `file_type` (text)
      - `file_size_kb` (integer)
      - `processing_time_ms` (integer)
      - `success` (boolean, not null)
      - `error_type` (text, nullable)
      - `created_at` (timestamptz, default now())
      
    - `contact_messages`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `email` (text, not null)
      - `message` (text, not null)
      - `status` (text, default 'new')
      - `created_at` (timestamptz, default now())
  
  2. Security
    - Enable RLS on all tables
    - Add policies for public insert only on email_submissions
    - Add policies for public insert only on anonymization_logs
    - Add policies for public insert only on contact_messages
    
  3. Indexes
    - Index on email_submissions.created_at for performance
    - Index on anonymization_logs.created_at for analytics
    - Index on contact_messages.created_at for management
*/

-- Create email_submissions table
CREATE TABLE IF NOT EXISTS email_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  privacy_accepted boolean NOT NULL,
  data_processing_accepted boolean NOT NULL,
  newsletter_opt_in boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create anonymization_logs table (for statistics only, no PII)
CREATE TABLE IF NOT EXISTS anonymization_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  file_type text,
  file_size_kb integer,
  processing_time_ms integer,
  success boolean NOT NULL,
  error_type text,
  created_at timestamptz DEFAULT now()
);

-- Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE email_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE anonymization_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for email_submissions (public insert only, no select for privacy)
CREATE POLICY "Allow public insert on email_submissions"
  ON email_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create policies for anonymization_logs (public insert only for logging)
CREATE POLICY "Allow public insert on anonymization_logs"
  ON anonymization_logs
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create policies for contact_messages (public insert only)
CREATE POLICY "Allow public insert on contact_messages"
  ON contact_messages
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_submissions_created 
  ON email_submissions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_anonymization_logs_created 
  ON anonymization_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_messages_created 
  ON contact_messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_messages_status 
  ON contact_messages(status);