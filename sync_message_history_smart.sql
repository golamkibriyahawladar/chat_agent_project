-- SMARTER SYNC TRIGGER: Trusting the database, not the n8n payload
CREATE OR REPLACE FUNCTION public.sync_n8n_message_history()
RETURNS TRIGGER AS $$
DECLARE
    v_company_id UUID;
    v_agent_id UUID;
    v_contact_phone TEXT;
    v_conversation_id UUID;
    v_sender_type TEXT;
    v_content TEXT;
    v_parts TEXT[];
BEGIN
    -- session_id format: companyId_agentId_contactPhone (or just any_id_agentId_phone)
    v_parts := string_to_array(NEW.session_id, '_');
    
    IF array_length(v_parts, 1) >= 3 THEN
        
        -- We extract the agent_id (2nd part)
        v_agent_id := v_parts[2]::UUID;
        
        -- CRITICAL FIX: Look up the real company_id from our agents table
        -- Do not trust n8n's first part of session_id
        SELECT company_id INTO v_company_id FROM public.agents WHERE id = v_agent_id LIMIT 1;
        
        -- If agent not found, we can't link it to a dashboard company
        IF v_company_id IS NULL THEN
            RETURN NEW;
        END IF;

        -- Extract contact_phone (everything after the 2nd underscore)
        v_contact_phone := substr(NEW.session_id, length(v_parts[1]) + length(v_parts[2]) + 3);
        
        -- Determine sender type
        IF NEW.message->>'type' = 'human' THEN
            v_sender_type := 'contact';
        ELSIF NEW.message->>'type' = 'ai' THEN
            v_sender_type := 'ai';
        ELSE
            v_sender_type := 'contact';
        END IF;

        v_content := NEW.message->>'content';
        v_content := regexp_replace(v_content, '^user message\:\s*', '', 'i');

        -- 1. Find or create the conversation
        SELECT id INTO v_conversation_id 
        FROM public.conversations 
        WHERE agent_id = v_agent_id AND contact_phone = v_contact_phone
        LIMIT 1;

        IF v_conversation_id IS NULL THEN
            INSERT INTO public.conversations (
                agent_id, company_id, contact_name, contact_phone, platform,
                last_message, last_message_at, is_ai_mode, unread_count
            ) VALUES (
                v_agent_id, v_company_id, v_contact_phone, v_contact_phone,
                'whatsapp', v_content, NOW(), true, 1
            ) RETURNING id INTO v_conversation_id;
        ELSE
            UPDATE public.conversations 
            SET last_message = v_content, last_message_at = NOW(), company_id = v_company_id,
                unread_count = COALESCE(unread_count, 0) + 1
            WHERE id = v_conversation_id;
        END IF;

        -- 2. Insert message
        IF NOT EXISTS (
            SELECT 1 FROM public.messages 
            WHERE conversation_id = v_conversation_id AND content = v_content AND created_at > NOW() - INTERVAL '5 seconds'
        ) THEN
            INSERT INTO public.messages (
                conversation_id, company_id, sender_type, content, created_at, is_read
            ) VALUES (
                v_conversation_id, v_company_id, v_sender_type, v_content, NOW(), false
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
