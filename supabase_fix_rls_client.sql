-- Update Companies Policy: Users can view a company if they own it, if they are assigned to it in their profile, or if they are superadmin.
DROP POLICY IF EXISTS "Users can view own companies" ON public.companies;
CREATE POLICY "Users can view own companies" ON public.companies FOR SELECT USING (
  owner_id = auth.uid() 
  OR id = (SELECT company_id FROM public.profiles WHERE profiles.id = auth.uid()) 
  OR public.is_superadmin()
);

-- Update Companies Policy: Clients assigned to a company can also UPDATE their company (e.g. toggle Company AI mode)
DROP POLICY IF EXISTS "Users can update own companies" ON public.companies;
CREATE POLICY "Users can update own companies" ON public.companies FOR UPDATE USING (
  owner_id = auth.uid() 
  OR id = (SELECT company_id FROM public.profiles WHERE profiles.id = auth.uid())
  OR public.is_superadmin()
);

-- Update Agents Policy: Users can view/manage agents if the agent's company is the user's assigned company.
DROP POLICY IF EXISTS "Users can view agents for their companies" ON public.agents;
CREATE POLICY "Users can view agents for their companies" ON public.agents FOR SELECT USING (
  company_id = (SELECT company_id FROM public.profiles WHERE profiles.id = auth.uid()) 
  OR EXISTS (SELECT 1 FROM public.companies WHERE companies.id = agents.company_id AND companies.owner_id = auth.uid()) 
  OR public.is_superadmin()
);

-- Allow clients to update agents for their company
DROP POLICY IF EXISTS "Users can update agents for their companies" ON public.agents;
CREATE POLICY "Users can update agents for their companies" ON public.agents FOR UPDATE USING (
  company_id = (SELECT company_id FROM public.profiles WHERE profiles.id = auth.uid()) 
  OR EXISTS (SELECT 1 FROM public.companies WHERE companies.id = agents.company_id AND companies.owner_id = auth.uid()) 
  OR public.is_superadmin()
);

-- CRITICAL FIX: Add missing is_ai_enabled column to companies table which the frontend expects!
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS is_ai_enabled BOOLEAN DEFAULT true;
