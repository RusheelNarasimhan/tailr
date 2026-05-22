-- Run if users exist in auth but have no profiles row (or signup insert fails)

-- Allow users to create their own profile row once
DROP POLICY IF EXISTS "profiles: insert own" ON public.profiles;

CREATE POLICY "profiles: insert own"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Backfill profiles for existing auth users missing a row
INSERT INTO public.profiles (id, email)
SELECT u.id, u.email
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
