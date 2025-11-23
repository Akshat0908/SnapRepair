/*
  # Fix RLS Recursion in Profiles Table

  ## Problem
  The policy "Experts can view all profiles" creates infinite recursion because it queries
  the profiles table while checking permissions on the profiles table.

  ## Solution
  Remove the recursive policy. Experts don't need to view all profiles - they only need
  to see their own profile and access issues/messages which are handled by those tables' policies.

  ## Changes
  - Drop the recursive "Experts can view all profiles" policy
*/

-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Experts can view all profiles" ON profiles;
