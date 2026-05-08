-- 1. Create a policy so the system can insert profiles
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Backfill existing users into profiles (in case the trigger was missed or failed before)
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 
  CASE 
    WHEN email = 'mariyahawladar123@gmail.com' THEN 'super_admin'::public.user_role 
    ELSE 'client'::public.user_role 
  END
FROM auth.users
ON CONFLICT (id) DO UPDATE 
SET 
  email = EXCLUDED.email,
  role = CASE WHEN EXCLUDED.email = 'mariyahawladar123@gmail.com' THEN 'super_admin'::public.user_role ELSE public.profiles.role END;
