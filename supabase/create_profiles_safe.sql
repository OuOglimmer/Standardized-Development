-- Idempotent profiles table setup for Supabase SQL Editor.
-- This script does not drop or overwrite an existing table.

BEGIN;

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'author', 'admin')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Keep the admin check inside a SECURITY DEFINER function with a fixed search path.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
      AND is_active = TRUE
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Policies are created only when missing, so the script can be run repeatedly.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'profiles_select_self_or_admin'
  ) THEN
    CREATE POLICY profiles_select_self_or_admin
      ON public.profiles
      FOR SELECT
      TO authenticated
      USING (id = auth.uid() OR public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'profiles_insert_self_or_admin'
  ) THEN
    CREATE POLICY profiles_insert_self_or_admin
      ON public.profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (id = auth.uid() OR public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'profiles_update_self_or_admin'
  ) THEN
    CREATE POLICY profiles_update_self_or_admin
      ON public.profiles
      FOR UPDATE
      TO authenticated
      USING (id = auth.uid() OR public.is_admin())
      WITH CHECK (id = auth.uid() OR public.is_admin());
  END IF;
END
$$;

REVOKE ALL ON TABLE public.profiles FROM anon;
GRANT SELECT, INSERT, UPDATE ON TABLE public.profiles TO authenticated;

COMMIT;

-- Refresh PostgREST's schema cache after the table definition changes.
NOTIFY pgrst, 'reload schema';
