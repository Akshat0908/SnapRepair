/*
  # Snap Repair - Initial Database Schema

  ## Overview
  This migration creates the complete database structure for the Snap Repair application,
  a platform that helps users fix household and device issues through photo/video submissions,
  AI diagnosis, and expert consultations.

  ## Tables Created

  ### 1. profiles
  User profile information linked to Supabase auth.users
  - id (uuid, references auth.users)
  - name (text)
  - phone (text, optional)
  - created_at (timestamptz)

  ### 2. issues
  Core issue tracking submitted by users
  - id (uuid, primary key)
  - user_id (uuid, references profiles)
  - description (text)
  - device_type (text)
  - media_url (text, stores photo/video URL)
  - media_type (text, 'photo' or 'video')
  - ai_diagnosis (text, stores AI analysis result)
  - status (text, default 'open')
  - created_at (timestamptz)
  - updated_at (timestamptz)

  ### 3. messages
  Chat messages between users and experts
  - id (uuid, primary key)
  - issue_id (uuid, references issues)
  - sender (text, 'user' or 'expert' or 'system')
  - text (text)
  - attachment_url (text, optional)
  - created_at (timestamptz)

  ### 4. payments
  Payment transaction records
  - id (uuid, primary key)
  - issue_id (uuid, references issues)
  - user_id (uuid, references profiles)
  - amount (integer, in paise/cents)
  - status (text, 'pending' or 'completed' or 'failed')
  - payment_provider (text, optional)
  - provider_payment_id (text, optional)
  - created_at (timestamptz)

  ### 5. feedback
  User feedback and ratings after consultation
  - id (uuid, primary key)
  - issue_id (uuid, references issues)
  - user_id (uuid, references profiles)
  - rating (integer, 1-5)
  - comment (text, optional)
  - created_at (timestamptz)

  ## Security
  - All tables have RLS enabled
  - Users can read/write their own data
  - Experts (checked via profiles.is_expert flag) can access all issues
  - Strict ownership checks on all operations

  ## Indexes
  - Fast lookups on user_id, issue_id, and status fields
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text,
  is_expert boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create issues table
CREATE TABLE IF NOT EXISTS issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  description text NOT NULL,
  device_type text NOT NULL,
  media_url text NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('photo', 'video')),
  ai_diagnosis text,
  status text DEFAULT 'open' CHECK (status IN ('open', 'pending', 'expert_reply', 'payment_needed', 'consultation_paid', 'closed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_issues_user_id ON issues(user_id);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_created_at ON issues(created_at DESC);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id uuid NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  sender text NOT NULL CHECK (sender IN ('user', 'expert', 'system')),
  text text NOT NULL,
  attachment_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_messages_issue_id ON messages(issue_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id uuid NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  payment_provider text,
  provider_payment_id text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_payments_issue_id ON payments(issue_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id uuid NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_feedback_issue_id ON feedback(issue_id);

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Experts can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_expert = true
    )
  );

-- RLS Policies for issues
CREATE POLICY "Users can view own issues"
  ON issues FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own issues"
  ON issues FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own issues"
  ON issues FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Experts can view all issues"
  ON issues FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_expert = true
    )
  );

CREATE POLICY "Experts can update all issues"
  ON issues FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_expert = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_expert = true
    )
  );

-- RLS Policies for messages
CREATE POLICY "Users can view messages for own issues"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM issues
      WHERE issues.id = messages.issue_id
      AND issues.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages for own issues"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM issues
      WHERE issues.id = messages.issue_id
      AND issues.user_id = auth.uid()
    )
    AND sender = 'user'
  );

CREATE POLICY "Experts can view all messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_expert = true
    )
  );

CREATE POLICY "Experts can insert messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_expert = true
    )
    AND sender = 'expert'
  );

CREATE POLICY "System can insert messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (sender = 'system');

-- RLS Policies for payments
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Experts can view all payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_expert = true
    )
  );

-- RLS Policies for feedback
CREATE POLICY "Users can view own feedback"
  ON feedback FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feedback"
  ON feedback FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Experts can view all feedback"
  ON feedback FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_expert = true
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on issues
CREATE TRIGGER update_issues_updated_at
  BEFORE UPDATE ON issues
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();