-- 1. Enable RLS on message_history if not already enabled
ALTER TABLE public.message_history ENABLE ROW LEVEL SECURITY;

-- 2. Allow authenticated users to view all message history for now
-- (In production, you'd filter this by their company_id if we have it in this table, but since this table matches session_id, we'll open it for now)
DROP POLICY IF EXISTS "Authenticated users can select message_history" ON public.message_history;
CREATE POLICY "Authenticated users can select message_history" 
  ON public.message_history 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- 3. Allow authenticated users to insert to message_history
DROP POLICY IF EXISTS "Authenticated users can insert to message_history" ON public.message_history;
CREATE POLICY "Authenticated users can insert to message_history" 
  ON public.message_history 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- 4. Enable it for anon if you're using anon for public widgets, but for the dashboard 'authenticated' is key
DROP POLICY IF EXISTS "Anon can insert message_history" ON public.message_history;
CREATE POLICY "Anon can insert message_history" 
  ON public.message_history 
  FOR INSERT 
  TO anon 
  WITH CHECK (true);
