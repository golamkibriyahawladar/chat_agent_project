-- 1. Improved robust trigger function
CREATE OR REPLACE FUNCTION public.sync_n8n_message_history()
RETURNS TRIGGER AS $$
DECLARE
    v_company_id UUID;
    v_agent_id UUID;
    v_contact_phone TEXT;
    v_clean_phone TEXT;
    v_conversation_id UUID;
    v_sender_type TEXT;
    v_content TEXT;
    v_parts TEXT[];
BEGIN
    -- session_id format: companyId_agentId_contactPhone
    v_parts := string_to_array(NEW.session_id, '_');
    
    IF array_length(v_parts, 1) >= 3 THEN
        v_company_id := v_parts[1]::UUID;
        v_agent_id := v_parts[2]::UUID;
        
        -- Exact contact_phone extraction from session_id
        v_contact_phone := substr(NEW.session_id, length(v_parts[1]) + length(v_parts[2]) + 3);
        -- Clean phone for fuzzy matching (only digits)
        v_clean_phone := regexp_replace(v_contact_phone, '\D', '', 'g');
        
        -- Extract sender and content
        IF NEW.message->>'type' = 'human' THEN
            v_sender_type := 'contact';
        ELSE
            v_sender_type := 'ai';
        END IF;
        v_content := NEW.message->>'content';
        v_content := regexp_replace(v_content, '^user message\:\s*', '', 'i');

        -- Find EXISTING conversation correctly
        SELECT id INTO v_conversation_id 
        FROM public.conversations 
        WHERE agent_id = v_agent_id 
          AND (
               regexp_replace(contact_phone, '\D', '', 'g') = v_clean_phone 
               OR contact_phone = v_contact_phone
          )
        LIMIT 1;

        IF v_conversation_id IS NOT NULL THEN
            -- UPDATE existing: NEVER flip is_ai_mode on update!
            UPDATE public.conversations 
            SET 
                last_message = v_content,
                last_message_at = NOW(),
                unread_count = CASE WHEN v_sender_type = 'contact' THEN COALESCE(unread_count, 0) + 1 ELSE unread_count END
            WHERE id = v_conversation_id;
        ELSE
            -- INSERT new (only if we really didn't find them)
            INSERT INTO public.conversations (
                agent_id, company_id, contact_name, contact_phone, platform,
                last_message, last_message_at, is_ai_mode, unread_count 
            ) VALUES (
                v_agent_id, v_company_id, v_contact_phone, v_contact_phone, 'whatsapp',
                v_content, NOW(), true, 1
            ) RETURNING id INTO v_conversation_id;
        END IF;

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Ensure trigger exists (redundant but safe)
DROP TRIGGER IF EXISTS on_message_history_insert ON public.message_history;
CREATE TRIGGER on_message_history_insert
AFTER INSERT ON public.message_history
FOR EACH ROW
EXECUTE PROCEDURE public.sync_n8n_message_history();
