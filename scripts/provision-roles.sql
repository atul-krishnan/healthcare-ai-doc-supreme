-- ============================================================
-- YourDoc: Role Provisioning Script
-- Run this in Supabase SQL Editor to promote users to doctor/admin roles
-- ============================================================

-- INSTRUCTIONS:
-- 1. Replace the email addresses below with actual doctor/admin emails
-- 2. Users must have already signed up (they need an existing profile row)
-- 3. Run this script in the Supabase SQL Editor (Dashboard → SQL Editor)
-- 4. Verify with the SELECT query at the bottom

-- ─── Promote Doctors ─────────────────────────────────────────
-- Add each doctor's email address to promote them from 'patient' to 'doctor'

UPDATE profiles
SET role = 'doctor', updated_at = NOW()
WHERE id IN (
  SELECT id FROM auth.users
  WHERE email IN (
    -- 👇 Replace these with real doctor email addresses
    'doctor1@example.com',
    'doctor2@example.com'
  )
)
AND role != 'doctor';

-- ─── Promote Admins ──────────────────────────────────────────
-- Add each admin's email address to promote them to 'admin'

UPDATE profiles
SET role = 'admin', updated_at = NOW()
WHERE id IN (
  SELECT id FROM auth.users
  WHERE email IN (
    -- 👇 Replace these with real admin email addresses
    'admin@example.com'
  )
)
AND role != 'admin';

-- ─── Verification Query ─────────────────────────────────────
-- Run this to verify roles were set correctly

SELECT
  p.id,
  u.email,
  p.role,
  p.updated_at
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.role IN ('doctor', 'admin')
ORDER BY p.role, u.email;
