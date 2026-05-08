"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Conversation } from "@/types";

export function useConversations(companyId?: string) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!companyId) return;

    const fetchConversations = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("company_id", companyId)
        .order("last_message_at", { ascending: false });

      if (error) {
        setError(error);
      } else {
        setConversations(data || []);
      }
      setLoading(false);
    };

    fetchConversations();

    // Subscribe to changes
    const channel = supabase
      .channel(`conversations-${companyId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
          filter: `company_id=eq.${companyId}`,
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [companyId, supabase]);

  return { conversations, loading, error };
}
