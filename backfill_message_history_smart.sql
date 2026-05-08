-- SMARTER SYNC BACKFILL: Re-assessing existing message_history
DO $$ 
DECLARE
    r RECORD;
    v_company_id UUID;
    v_agent_id UUID;
    v_contact_phone TEXT;
    v_conversation_id UUID;
    v_sender_type TEXT;
    v_content TEXT;
    v_parts TEXT[];
BEGIN
    FOR r IN SELECT * FROM public.message_history ORDER BY id ASC
    LOOP
        v_parts := string_to_array(r.session_id, '_');
        
        IF array_length(v_parts, 1) >= 3 THEN
            BEGIN
                v_agent_id := v_parts[2]::UUID;
                
                -- Correctly find the ACTUAL company ID for this agent
                SELECT company_id INTO v_company_id FROM public.agents WHERE id = v_agent_id LIMIT 1;
                
                IF v_company_id IS NOT NULL THEN
                    v_contact_phone := substr(r.session_id, length(v_parts[1]) + length(v_parts[2]) + 3);
                    
                    IF r.message->>'type' = 'human' THEN v_sender_type := 'contact';
                    ELSIF r.message->>'type' = 'ai' THEN v_sender_type := 'ai';
                    ELSE v_sender_type := 'contact';
                    END IF;

                    v_content := r.message->>'content';
                    v_content := regexp_replace(v_content, '^user message\:\s*', '', 'i');

                    -- 1. Find or create the conversation (with CORRECT company_id)
                    SELECT id INTO v_conversation_id FROM public.conversations 
                    WHERE agent_id = v_agent_id AND contact_phone = v_contact_phone LIMIT 1;

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
                        SET company_id = v_company_id, last_message = v_content, last_message_at = NOW()
                        WHERE id = v_conversation_id;
                    END IF;

                    -- 2. Insert into messages (Check for duplicates)
                    IF NOT EXISTS (
                        SELECT 1 FROM public.messages 
                        WHERE conversation_id = v_conversation_id AND content = v_content
                    ) THEN
                        INSERT INTO public.messages (
                            conversation_id, company_id, sender_type, content, created_at, is_read
                        ) VALUES (
                            v_conversation_id, v_company_id, v_sender_type, v_content, NOW(), false
                        );
                    END IF;
                END IF;

            EXCEPTION WHEN OTHERS THEN
                -- Skip invalid rows
            END;
        END IF;
    END LOOP;
END $$;
