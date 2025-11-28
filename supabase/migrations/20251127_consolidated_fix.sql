-- 1. Schema Updates
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email text;

-- 2. Trigger for New User Creation (Fixes RLS Policy Error)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, phone, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'User'),
    new.raw_user_meta_data->>'phone',
    new.email
  );
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Secure Expert Check (Fixes Infinite Recursion)
CREATE OR REPLACE FUNCTION is_expert()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
    AND is_expert = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Update RLS Policies (Fixes Access & AI Chat)

-- Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Experts can view all profiles" ON profiles;
CREATE POLICY "Experts can view all profiles" ON profiles FOR SELECT TO authenticated USING (is_expert());

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Issues
DROP POLICY IF EXISTS "Users can view own issues" ON issues;
CREATE POLICY "Users can view own issues" ON issues FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Experts can view all issues" ON issues;
CREATE POLICY "Experts can view all issues" ON issues FOR SELECT TO authenticated USING (is_expert());

DROP POLICY IF EXISTS "Users can create issues" ON issues;
CREATE POLICY "Users can create issues" ON issues FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Experts can update all issues" ON issues;
CREATE POLICY "Experts can update all issues" ON issues FOR UPDATE TO authenticated USING (is_expert());

-- Messages
DROP POLICY IF EXISTS "Users can view messages for own issues" ON messages;
CREATE POLICY "Users can view messages for own issues" ON messages FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM issues WHERE issues.id = messages.issue_id AND issues.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Experts can view all messages" ON messages;
CREATE POLICY "Experts can view all messages" ON messages FOR SELECT TO authenticated USING (is_expert());

DROP POLICY IF EXISTS "Users can insert messages" ON messages;
DROP POLICY IF EXISTS "Experts can insert messages" ON messages;
DROP POLICY IF EXISTS "Allow AI Bot Replies" ON messages;

CREATE POLICY "Allow Message Insertion" ON messages FOR INSERT TO authenticated WITH CHECK (
  -- User can reply to own issue (including as 'expert' for AI bot)
  EXISTS (SELECT 1 FROM issues WHERE issues.id = messages.issue_id AND issues.user_id = auth.uid())
  OR
  -- Real expert can reply
  (is_expert() AND sender = 'expert')
);

-- Payments
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
CREATE POLICY "Users can view own payments" ON payments FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Experts can view all payments" ON payments;
CREATE POLICY "Experts can view all payments" ON payments FOR SELECT TO authenticated USING (is_expert());

DROP POLICY IF EXISTS "Users can create payments" ON payments;
CREATE POLICY "Users can create payments" ON payments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Feedback
DROP POLICY IF EXISTS "Experts can view all feedback" ON feedback;
CREATE POLICY "Experts can view all feedback" ON feedback FOR SELECT TO authenticated USING (is_expert());

DROP POLICY IF EXISTS "Users can add feedback" ON feedback;
CREATE POLICY "Users can add feedback" ON feedback FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
