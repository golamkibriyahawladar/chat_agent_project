-- 1. Create a function that runs with elevated privileges (SECURITY DEFINER)
-- This completely avoids the infinite loop (recursion) when checking user roles.
CREATE OR REPLACE FUNCTION public.is_superadmin() RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$;

-- 2. Drop all policies that check the superadmin role recursively
DROP POLICY IF EXISTS "Superadmins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Superadmins can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own companies" ON public.companies;
DROP POLICY IF EXISTS "Users can insert own companies" ON public.companies;
DROP POLICY IF EXISTS "Users can update own companies" ON public.companies;
DROP POLICY IF EXISTS "Users can delete own companies" ON public.companies;
DROP POLICY IF EXISTS "Users can view agents for their companies" ON public.agents;
DROP POLICY IF EXISTS "Users can insert agents for their companies" ON public.agents;
DROP POLICY IF EXISTS "Users can update agents for their companies" ON public.agents;
DROP POLICY IF EXISTS "Users can delete agents for their companies" ON public.agents;

-- 3. Recreate the Profile Policies safely
CREATE POLICY "Superadmins can read all profiles" ON public.profiles FOR SELECT USING ( public.is_superadmin() );
CREATE POLICY "Superadmins can update profiles" ON public.profiles FOR UPDATE USING ( public.is_superadmin() );

-- 4. Recreate the Companies Policies
CREATE POLICY "Users can view own companies" ON public.companies FOR SELECT USING (
  owner_id = auth.uid() OR public.is_superadmin()
);
CREATE POLICY "Users can insert own companies" ON public.companies FOR INSERT WITH CHECK (
  owner_id = auth.uid() OR public.is_superadmin()
);
CREATE POLICY "Users can update own companies" ON public.companies FOR UPDATE USING (
  owner_id = auth.uid() OR public.is_superadmin()
);
CREATE POLICY "Users can delete own companies" ON public.companies FOR DELETE USING (
  owner_id = auth.uid() OR public.is_superadmin()
);

-- 5. Recreate the Agents Policies
CREATE POLICY "Users can view agents for their companies" ON public.agents FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = agents.company_id AND (companies.owner_id = auth.uid() OR public.is_superadmin())
  )
);
CREATE POLICY "Users can insert agents for their companies" ON public.agents FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = agents.company_id AND (companies.owner_id = auth.uid() OR public.is_superadmin())
  )
);
CREATE POLICY "Users can update agents for their companies" ON public.agents FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = agents.company_id AND (companies.owner_id = auth.uid() OR public.is_superadmin())
  )
);
CREATE POLICY "Users can delete agents for their companies" ON public.agents FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = agents.company_id AND (companies.owner_id = auth.uid() OR public.is_superadmin())
  )
);
