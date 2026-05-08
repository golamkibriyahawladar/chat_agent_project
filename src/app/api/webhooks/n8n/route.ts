import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      agent_id, 
      contact_name, 
      contact_phone, 
      platform = 'whatsapp', 
      content,
      sender_type = 'contact'
    } = body;

    if (!agent_id || !content || !contact_name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Initialize Supabase admin/service client if possible, but here we use standard client
    // Note: For a real production app, you might want a service role key for webhooks
    // to bypass RLS since this is a server-to-server call.
    // For now, we'll assume the environment variables are set.
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // We need service role for webhooks

    if (!supabaseKey) {
      return NextResponse.json({ error: "Supabase service role key not configured" }, { status: 500 });
    }

    // Create a client with the service role key to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Get the agent and its company_id
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('company_id')
      .eq('id', agent_id)
      .single();

    if (agentError || !agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const company_id = agent.company_id;

    // 2. Find or create conversation
    // Strategy: find by agent_id and contact_phone (or name if phone missing)
    let conversation;
    
    const { data: existingConv, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('agent_id', agent_id)
      .eq(contact_phone ? 'contact_phone' : 'contact_name', contact_phone || contact_name)
      .single();

    if (existingConv) {
      conversation = existingConv;
    } else {
      // Create new conversation
      const { data: newConv, error: createError } = await supabase
        .from('conversations')
        .insert([{
          agent_id,
          company_id,
          contact_name,
          contact_phone,
          platform,
          last_message: content,
          last_message_at: new Date().toISOString(),
          is_ai_mode: true // Default to AI mode for new n8n contacts
        }])
        .select()
        .single();

      if (createError) throw createError;
      conversation = newConv;
    }

    // 3. Insert message
    const { error: msgError } = await supabase
      .from('messages')
      .insert([{
        conversation_id: conversation.id,
        company_id,
        sender_type,
        content
      }]);

    if (msgError) throw msgError;

    // 4. Update conversation's last message
    await supabase
      .from('conversations')
      .update({
        last_message: content,
        last_message_at: new Date().toISOString()
      })
      .eq('id', conversation.id);

    return NextResponse.json({ success: true, conversation_id: conversation.id });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
