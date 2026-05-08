-- 1. Create a function to automatically sync n8n 'message_history' to our 'conversations' and 'messages' tables
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
    -- session_id format: companyId_agentId_contactPhone
    v_parts := string_to_array(NEW.session_id, '_');
    
    -- We need at least 3 parts to extract company, agent, and user info
    IF array_length(v_parts, 1) >= 3 THEN
        
        v_company_id := v_parts[1]::UUID;
        v_agent_id := v_parts[2]::UUID;
        
        -- Exact contact_phone extraction
        v_contact_phone := substr(NEW.session_id, length(v_parts[1]) + length(v_parts[2]) + 3);
        
        -- Determine sender type from LangChain/n8n JSON format
        IF NEW.message->>'type' = 'human' THEN
            v_sender_type := 'contact';
        ELSIF NEW.message->>'type' = 'ai' THEN
            v_sender_type := 'ai';
        ELSE
            v_sender_type := 'contact'; -- Fallback
        END IF;

        v_content := NEW.message->>'content';
        
        -- Sometimes n8n prepends "user message: " to human messages. Let's clean it up.
        v_content := regexp_replace(v_content, '^user message\:\s*', '', 'i');

        -- 1. Find or create the conversation in our dashboard tables
        SELECT id INTO v_conversation_id 
        FROM public.conversations 
        WHERE agent_id = v_agent_id AND contact_phone = v_contact_phone
        LIMIT 1;

        IF v_conversation_id IS NULL THEN
            -- Insert new conversation
            INSERT INTO public.conversations (
                agent_id, 
                company_id, 
                contact_name, 
                contact_phone, 
                platform,
                last_message,
                last_message_at,
                is_ai_mode,
                unread_count -- Providing a safe default value if not set
            ) VALUES (
                v_agent_id,
                v_company_id,
                v_contact_phone, -- Use phone as name initially
                v_contact_phone,
                'whatsapp', -- default platform, can be updated later
                v_content,
                NOW(),
                true,
                1
            ) RETURNING id INTO v_conversation_id;
        ELSE
            -- Update existing conversation's last message
            UPDATE public.conversations 
            SET 
                last_message = v_content,
                last_message_at = NOW(),
                unread_count = COALESCE(unread_count, 0) + 1
            WHERE id = v_conversation_id;
        END IF;

        -- 2. Insert into the dashboard's messages table 
        IF NOT EXISTS (
            SELECT 1 FROM public.messages 
            WHERE conversation_id = v_conversation_id 
              AND content = v_content 
              AND created_at > NOW() - INTERVAL '5 seconds'
        ) THEN
            INSERT INTO public.messages (
                conversation_id,
                company_id,
                sender_type,
                content,
                created_at,
                is_read -- Providing a safe default value if not set
            ) VALUES (
                v_conversation_id,
                v_company_id,
                v_sender_type,
                v_content,
                NOW(),
                false
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the Database Trigger
DROP TRIGGER IF EXISTS on_message_history_insert ON public.message_history;

CREATE TRIGGER on_message_history_insert
AFTER INSERT ON public.message_history
FOR EACH ROW
EXECUTE PROCEDURE public.sync_n8n_message_history();
