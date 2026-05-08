-- Run this in Supabase SQL Editor to create missing tables

-- 1. Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  contact_name TEXT NOT NULL,
  contact_phone TEXT,
  contact_avatar TEXT,
  platform TEXT DEFAULT 'whatsapp',
  last_message TEXT,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  unread_count INT DEFAULT 0,
  is_ai_mode BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('contact', 'agent', 'ai')),
  content TEXT NOT NULL,
  media_url TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for conversations
CREATE POLICY "Users can view conversations for their companies" ON public.conversations FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = conversations.company_id AND (companies.owner_id = auth.uid() OR public.is_superadmin())
  )
);

CREATE POLICY "Users can insert conversations for their companies" ON public.conversations FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = conversations.company_id AND (companies.owner_id = auth.uid() OR public.is_superadmin())
  )
);

CREATE POLICY "Users can update conversations" ON public.conversations FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = conversations.company_id AND (companies.owner_id = auth.uid() OR public.is_superadmin())
  )
);

CREATE POLICY "Users can delete conversations" ON public.conversations FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = conversations.company_id AND (companies.owner_id = auth.uid() OR public.is_superadmin())
  )
);

-- 5. Create RLS Policies for messages
CREATE POLICY "Users can view messages for their companies" ON public.messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = messages.company_id AND (companies.owner_id = auth.uid() OR public.is_superadmin())
  )
);

CREATE POLICY "Users can insert messages for their companies" ON public.messages FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = messages.company_id AND (companies.owner_id = auth.uid() OR public.is_superadmin())
  )
);

CREATE POLICY "Users can update messages" ON public.messages FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = messages.company_id AND (companies.owner_id = auth.uid() OR public.is_superadmin())
  )
);

CREATE POLICY "Users can delete messages" ON public.messages FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = messages.company_id AND (companies.owner_id = auth.uid() OR public.is_superadmin())
  )
);
