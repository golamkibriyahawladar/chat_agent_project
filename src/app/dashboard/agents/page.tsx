"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Plus, 
  Bot, 
  Globe, 
  MessageCircle, 
  Settings2, 
  MoreVertical,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  Power,
  Trash2,
  Save,
  ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/useChatStore";

export default function AgentsPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [webhookInputs, setWebhookInputs] = useState<Record<string, string>>({});
  const { companyId, userRole } = useChatStore();
  const supabase = createClient();

  const fetchData = async (showLoading = true) => {
    if (!companyId && userRole !== 'super_admin') return;
    if (showLoading) setLoading(true);
    
    // Fetch agents
    let agentsQuery = supabase.from("agents").select("*");
    if (userRole !== 'super_admin') {
      agentsQuery = agentsQuery.eq("company_id", companyId);
    }
    const { data: agentsData } = await agentsQuery;
    if (agentsData) {
      setAgents(agentsData);
      const initialWebhooks: Record<string, string> = {};
      agentsData.forEach((a: any) => {
        initialWebhooks[a.id] = a.webhook_url || "";
      });
      setWebhookInputs(initialWebhooks);
    }

    // Fetch company global state
    if (companyId) {
      const { data: compData } = await supabase
        .from("companies")
        .select("id, is_ai_enabled, name")
        .eq("id", companyId)
        .single();
      if (compData) setCompany(compData);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData(true);
  }, [companyId, userRole, supabase]);

  const toggleAgentAi = async (id: string, currentState: boolean) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, is_ai_enabled: !currentState } : a));
    
    const { error } = await supabase
      .from("agents")
      .update({ is_ai_enabled: !currentState })
      .eq("id", id);
    
    if (!error) fetchData(false);
  };

  const toggleCompanyAi = async () => {
    if (!company) return;
    setCompany((prev: any) => prev ? { ...prev, is_ai_enabled: !prev.is_ai_enabled } : prev);

    const { error } = await supabase
      .from("companies")
      .update({ is_ai_enabled: !company.is_ai_enabled })
      .eq("id", company.id);
    
    if (!error) fetchData(false);
  };

  const saveWebhook = async (id: string) => {
    const url = webhookInputs[id];
    const { error } = await supabase
      .from("agents")
      .update({ webhook_url: url })
      .eq("id", id);
    
    if (!error) {
      fetchData(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-5">
           <div className="h-14 w-14 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center shadow-sm text-primary transition-transform hover:scale-110">
              <Bot className="h-7 w-7" />
           </div>
           <div>
              <h1 className="text-3xl font-black tracking-tight text-zinc-900 leading-none">
                AI Agents
              </h1>
              <p className="text-zinc-500 mt-2 font-medium">
                {company ? `Managing agents for ${company.name}` : 'Platform-wide agent control.'}
              </p>
           </div>
        </div>
        
        <div className="flex items-center gap-3">
          {company && (
            <div className="flex items-center gap-3 px-4 py-2.5 bg-white rounded-xl border border-zinc-200 shadow-sm group">
              <Power className={cn("h-4 w-4 transition-transform group-hover:scale-125", company.is_ai_enabled ? "text-emerald-500" : "text-zinc-300")} />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900">Company AI Gateway</span>
              <Switch checked={company.is_ai_enabled} onCheckedChange={toggleCompanyAi} className="scale-75 data-[state=checked]:bg-primary cursor-pointer" />
            </div>
          )}
        </div>
      </div>

      {!company?.is_ai_enabled && company && (
        <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-3 text-amber-700 animate-pulse">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm font-bold">Global Company AI is currently DISABLED. No agents will respond until enabled above.</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-64 bg-zinc-100 animate-pulse rounded-2xl" />)
        ) : agents.length === 0 ? (
          <div className="col-span-full p-12 text-center text-zinc-400 font-bold uppercase tracking-widest text-[10px]">No agents deployed yet.</div>
        ) : (
          agents.map((agent) => (
            <Card key={agent.id} className={cn(
              "border border-zinc-200 shadow-sm rounded-2xl overflow-hidden group hover:border-zinc-300 transition-all duration-300 bg-white",
              (!agent.is_ai_enabled || !company?.is_ai_enabled) && "opacity-80 grayscale-[0.2]"
            )}>
              <CardHeader className="relative bg-zinc-50/50 border-b border-zinc-100 pb-4">
                <div className="flex justify-between items-start">
                  <div className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center bg-white border border-zinc-100 text-primary shadow-sm transition-transform group-hover:scale-110",
                  )}>
                    {agent.platform === 'whatsapp' ? <Globe className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={cn(
                      "rounded-full text-[9px] font-black uppercase px-2 py-0 border-0 transition-opacity group-hover:opacity-100", 
                      agent.is_ai_enabled && (company?.is_ai_enabled ?? true) ? "bg-emerald-50 text-emerald-600" : "bg-zinc-100 text-zinc-400"
                    )} variant="outline">
                      {agent.is_ai_enabled && (company?.is_ai_enabled ?? true) ? 'Active' : 'Offline'}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-zinc-400 hover:bg-zinc-100 cursor-pointer">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="mt-4 text-lg font-bold text-zinc-900 leading-none group-hover:text-primary transition-colors">{agent.name}</CardTitle>
                <CardDescription className="flex items-center gap-1.5 mt-2 capitalize text-zinc-500 text-xs font-medium">
                  <LinkIcon className="h-3 w-3" />
                  {agent.platform} Connection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6 pb-2">
                <div className="flex items-center justify-between p-3.5 bg-zinc-50/80 rounded-xl border border-zinc-100 hover:border-zinc-200 transition-colors group/status">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover/status:text-primary transition-colors">Agent Logic</span>
                    <span className="text-sm font-bold text-zinc-900">{agent.is_ai_enabled ? 'Autonomous AI' : 'Manual Mode'}</span>
                  </div>
                  <Switch 
                    checked={agent.is_ai_enabled} 
                    onCheckedChange={() => toggleAgentAi(agent.id, agent.is_ai_enabled)} 
                    disabled={!company?.is_ai_enabled && company}
                    className="scale-75 data-[state=checked]:bg-primary cursor-pointer"
                  />
                </div>

                {userRole === 'super_admin' && (
                  <div className="space-y-3 pt-4 border-t border-zinc-100 group/webhook">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-zinc-500 uppercase tracking-widest leading-none group-hover/webhook:text-zinc-900 transition-colors">Outbound Connector</span>
                      {agent.webhook_url ? (
                        <Badge variant="outline" className="text-emerald-600 border-zinc-200 bg-emerald-50 font-black px-2 text-[8px] py-0 border-0 uppercase transition-transform group-hover/webhook:scale-105">
                          <CheckCircle2 className="h-2.5 w-2.5 mr-1" /> Linked
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-600 border-zinc-200 bg-amber-50 font-black px-2 text-[8px] py-0 border-0 uppercase transition-transform group-hover/webhook:scale-105">
                          <AlertCircle className="h-2.5 w-2.5 mr-1" /> Ready
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Webhook URL..." 
                        value={webhookInputs[agent.id] ?? ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWebhookInputs(prev => ({ ...prev, [agent.id]: e.target.value }))}
                        className="h-[40px] text-[11px] font-medium bg-zinc-50 border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-primary"
                      />
                      <Button 
                        size="sm" 
                        onClick={() => saveWebhook(agent.id)}
                        className="h-[40px] w-[40px] p-0 rounded-lg bg-primary hover:opacity-90 shadow-sm cursor-pointer transition-transform hover:scale-105"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-4 pb-6 flex gap-2">
                <Button variant="ghost" className="flex-1 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-xs font-bold h-10 text-zinc-600 cursor-pointer transition-all hover:translate-y-[-1px]">
                  <Settings2 className="mr-2 h-4 w-4 text-zinc-400" />
                  Settings
                </Button>
                <Button variant="ghost" className="flex-1 rounded-xl text-zinc-400 hover:bg-red-50 hover:text-red-500 text-xs font-bold h-10 transition-all hover:translate-y-[-1px] group/del">
                  <Trash2 className="mr-2 h-4 w-4 group-hover/del:text-red-500 transition-colors" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
