"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Agent } from "@/types";

export function useAgents(companyId?: string) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!companyId) return;

    const fetchAgents = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("agents")
        .select("*")
        .eq("company_id", companyId);

      if (error) {
        setError(error);
      } else {
        setAgents(data || []);
      }
      setLoading(false);
    };

    fetchAgents();

    // Subscribe to changes
    const channel = supabase
      .channel(`agents-${companyId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "agents",
          filter: `company_id=eq.${companyId}`,
        },
        () => {
          fetchAgents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [companyId, supabase]);

  return { agents, loading, error };
}
