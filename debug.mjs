import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env vars
dotenv.config({ path: join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
  console.log("=== CHECKING MESSAGE HISTORY ===");
  const { data: history, error: errorHistory } = await supabase
    .from('message_history')
    .select('*')
    .order('id', { ascending: false })
    .limit(5);
  
  if (errorHistory) console.error("Error fetching message_history:", errorHistory.message);
  else console.log(history);

  console.log("\n=== CHECKING CONVERSATIONS ===");
  const { data: convs, error: errorConvs } = await supabase
    .from('conversations')
    .select('*')
    .limit(5);

  if (errorConvs) console.error("Error fetching conversations:", errorConvs.message);
  else console.log(convs);

  console.log("\n=== CHECKING MESSAGES ===");
  const { data: msgs, error: errorMsgs } = await supabase
    .from('messages')
    .select('*')
    .limit(5);

  if (errorMsgs) console.error("Error fetching messages:", errorMsgs.message);
  else console.log(msgs);

  console.log("\n=== COMPARING IDS ===");
  const { data: agents, error: errorAgents } = await supabase
    .from('agents')
    .select('id, name, company_id');
  
  console.log("Agents in DB:", agents);
}

debug();
