-- 1. Add missing columns to profiles table to support linking users to companies
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;

-- 2. Update the trigger to extract company_id and role from user auth metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, company_id, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(
      (new.raw_user_meta_data->>'role')::public.user_role,
      CASE 
        WHEN new.email = 'mariyahawladar123@gmail.com' THEN 'super_admin'::public.user_role
        ELSE 'client'::public.user_role
      END
    ),
    NULLIF(new.raw_user_meta_data->>'company_id', '')::UUID,
    new.raw_user_meta_data->>'full_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
