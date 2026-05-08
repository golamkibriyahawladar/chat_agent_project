export type UserRole = 'super_admin' | 'client';

export interface Company {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: UserRole;
  company_id?: string;
  created_at: string;
}

export interface Agent {
  id: string;
  company_id: string;
  name: string;
  platform: 'whatsapp' | 'instagram' | 'messenger';
  phone_number?: string;
  is_ai_enabled: boolean;
  webhook_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  agent_id: string;
  company_id: string;
  contact_name: string;
  contact_phone?: string;
  contact_avatar?: string;
  platform: 'whatsapp' | 'instagram' | 'messenger';
  last_message?: string;
  last_message_at: string;
  unread_count: number;
  is_ai_mode: boolean;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  company_id: string;
  sender_type: 'contact' | 'agent' | 'ai';
  content: string;
  media_url?: string;
  is_read: boolean;
  created_at: string;
}
