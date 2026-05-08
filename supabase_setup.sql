-- 1. Drop existing objects up to this point if you are "resetting from scratch"
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

DROP TABLE IF EXISTS public.agents CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

DROP TYPE IF EXISTS public.user_role;

-- 2. Create Types
CREATE TYPE public.user_role AS ENUM ('super_admin', 'client', 'agent');

-- 3. Create Profiles Table (Linked to auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role public.user_role NOT NULL DEFAULT 'client',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create Companies Table
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  slug TEXT,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL DEFAULT auth.uid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Create Agents Table
CREATE TABLE public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  platform TEXT,
  webhook_url TEXT,
  status TEXT DEFAULT 'active',
  is_ai_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies
-- Profiles: Users can read their own profile. Superadmins can read all.
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Superadmins can read all profiles" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
);
CREATE POLICY "Superadmins can update profiles" ON public.profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
);

-- Companies: Clients can read/manage their own companies. Superadmins can read/manage all.
CREATE POLICY "Users can view own companies" ON public.companies FOR SELECT USING (
  owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
);
CREATE POLICY "Users can insert own companies" ON public.companies FOR INSERT WITH CHECK (
  owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
);
CREATE POLICY "Users can update own companies" ON public.companies FOR UPDATE USING (
  owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
);
CREATE POLICY "Users can delete own companies" ON public.companies FOR DELETE USING (
  owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
);

-- Agents: Can be managed if the user owns the company or is superadmin.
CREATE POLICY "Users can view agents for their companies" ON public.agents FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = agents.company_id AND (companies.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin'))
  )
);
CREATE POLICY "Users can insert agents for their companies" ON public.agents FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = agents.company_id AND (companies.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin'))
  )
);
CREATE POLICY "Users can update agents for their companies" ON public.agents FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = agents.company_id AND (companies.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin'))
  )
);
CREATE POLICY "Users can delete agents for their companies" ON public.agents FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = agents.company_id AND (companies.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin'))
  )
);

-- 8. Functions & Triggers for automatic profile creation
-- If email is 'mariyahawladar123@gmail.com', assign 'superadmin' role automatically.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    new.id,
    new.email,
    CASE 
      WHEN new.email = 'mariyahawladar123@gmail.com' THEN 'super_admin'::public.user_role
      ELSE 'client'::public.user_role
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Optional: To manually push the superadmin profile, you should first run this script.
-- Then go to your Auth UI and sign up as mariyahawladar123@gmail.com.
