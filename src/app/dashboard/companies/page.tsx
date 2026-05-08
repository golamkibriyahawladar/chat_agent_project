"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Building2, ExternalLink, MoreVertical, Trash2, Edit, Rocket, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { Company } from "@/types";
import { useChatStore } from "@/store/useChatStore";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Bot, 
  Globe, 
  MessageCircle, 
  Settings2, 
  AlertCircle,
  Link as LinkIcon,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: "", slug: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Detail View State
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [isAddAgentModalOpen, setIsAddAgentModalOpen] = useState(false);
  const [newAgent, setNewAgent] = useState({ name: "", platform: "whatsapp", webhook_url: "" });
  const [isSubmittingAgent, setIsSubmittingAgent] = useState(false);
  
  const { userRole, userId } = useChatStore();
  const router = useRouter();
  const supabase = createClient();

  // Security check: Only super_admin can access this page
  useEffect(() => {
    if (userRole && userRole !== "super_admin") {
      router.push("/dashboard");
    }
  }, [userRole, router]);

  const fetchCompanies = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setCompanies(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCompanies();
  }, [supabase]);

  const fetchAgents = async (companyId: string) => {
    setAgentsLoading(true);
    const { data, error } = await supabase
      .from("agents")
      .select("*")
      .eq("company_id", companyId);
    
    if (!error && data) {
      setAgents(data);
    }
    setAgentsLoading(false);
  };

  useEffect(() => {
    if (selectedCompany) {
      fetchAgents(selectedCompany.id);
    }
  }, [selectedCompany]);

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgent.name || !selectedCompany) return;

    setIsSubmittingAgent(true);
    const { error } = await supabase
      .from("agents")
      .insert([{
        ...newAgent,
        company_id: selectedCompany.id,
        is_ai_enabled: true
      }]);

    if (!error) {
      setIsAddAgentModalOpen(false);
      setNewAgent({ name: "", platform: "whatsapp", webhook_url: "" });
      fetchAgents(selectedCompany.id);
    } else {
      alert("Failed to create agent: " + error.message);
    }
    setIsSubmittingAgent(false);
  };

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.name || !newCompany.slug) return;
    if (!userId) {
      alert("User authentication error. Please try logging in again.");
      return;
    }

    setIsSubmitting(true);
    const { data, error } = await supabase
      .from("companies")
      .insert([
        { 
          name: newCompany.name, 
          slug: newCompany.slug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          owner_id: userId
        }
      ])
      .select();

    if (!error) {
      setIsAddModalOpen(false);
      setNewCompany({ name: "", slug: "" });
      fetchCompanies();
    } else {
      console.error("Supabase Error Details - Code:", error?.code, "Message:", error?.message, "Hint:", error?.hint, "Full:", error);
      alert(`Error Details: ${error?.message || 'Unknown'}\nCode: ${error?.code || 'None'}`);
    }
    setIsSubmitting(false);
  };

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (userRole !== "super_admin") return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      {selectedCompany ? (
        // COMPANY DETAIL VIEW
        <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4 group">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-xl h-[44px] w-[44px] hover:bg-zinc-100 text-zinc-500 transition-all cursor-pointer group-hover:scale-110"
                onClick={() => setSelectedCompany(null)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-zinc-900 flex items-center gap-3 leading-none group-hover:text-primary transition-colors">
                  {selectedCompany.name}
                  <Badge variant="outline" className="rounded-full font-bold text-[10px] bg-zinc-50 text-zinc-400 border-zinc-100 px-2 py-0 border-0">
                    /{selectedCompany.slug}
                  </Badge>
                </h1>
                <p className="text-zinc-500 mt-2 font-medium">
                  Managing agents for this company.
                </p>
              </div>
            </div>

            <Dialog open={isAddAgentModalOpen} onOpenChange={setIsAddAgentModalOpen}>
              <DialogTrigger render={
                <Button className="rounded-xl bg-primary hover:opacity-90 text-white shadow-lg shadow-primary/20 border-0 px-6 h-[48px] text-sm font-bold transition-all cursor-pointer hover:translate-y-[-2px]">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Agent
                </Button>
              } />
              <DialogContent className="sm:max-w-[425px] rounded-2xl border border-zinc-200 shadow-2xl bg-white font-sans">
                <form onSubmit={handleCreateAgent}>
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-zinc-900 leading-none">New AI Agent</DialogTitle>
                    <DialogDescription className="text-zinc-500 font-medium mt-1">
                      Assign a new agent for this company workspace.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-6 py-6 font-sans">
                    <div className="space-y-2">
                      <Label htmlFor="agent-name" className="text-xs font-black uppercase tracking-widest text-zinc-400">Agent Name</Label>
                      <Input 
                        id="agent-name" 
                        placeholder="e.g. Acme Sales Bot" 
                        className="rounded-xl bg-zinc-50 border-zinc-200 h-[44px] text-zinc-900 placeholder:text-zinc-400 font-medium"
                        value={newAgent.name}
                        onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="agent-platform" className="text-xs font-black uppercase tracking-widest text-zinc-400">Platform</Label>
                      <select 
                        id="agent-platform"
                        className="w-full rounded-xl bg-zinc-50 border-zinc-200 h-[44px] px-3 text-sm text-zinc-900 font-bold focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                        value={newAgent.platform}
                        onChange={(e) => setNewAgent({ ...newAgent, platform: e.target.value })}
                      >
                        <option value="whatsapp">WhatsApp</option>
                        <option value="instagram">Instagram</option>
                        <option value="messenger">Messenger</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="agent-webhook" className="text-xs font-black uppercase tracking-widest text-zinc-400">Webhook URL (Optional)</Label>
                      <Input 
                        id="agent-webhook" 
                        placeholder="https://n8n.your-server.com/..." 
                        className="rounded-xl bg-zinc-50 border-zinc-200 h-[44px] text-zinc-900 placeholder:text-zinc-400 font-medium"
                        value={newAgent.webhook_url}
                        onChange={(e) => setNewAgent({ ...newAgent, webhook_url: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      className="w-full h-[48px] text-base font-bold bg-primary hover:opacity-90 text-white rounded-xl shadow-lg shadow-primary/20 border-0 transition-all font-sans cursor-pointer"
                      disabled={isSubmittingAgent}
                    >
                      {isSubmittingAgent ? "Deploying..." : "Create Workspace Agent"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {agentsLoading ? (
              [1, 2, 3].map(i => <div key={i} className="h-64 bg-zinc-100 animate-pulse rounded-2xl" />)
            ) : agents.length === 0 ? (
              <div className="col-span-full p-12 text-center text-zinc-400 font-bold uppercase tracking-widest text-[10px]">No agents linked to this company yet.</div>
            ) : (
              agents.map((agent) => (
                <Card key={agent.id} className="border border-zinc-200 shadow-sm rounded-2xl overflow-hidden group hover:border-zinc-300 transition-all duration-300 bg-white cursor-default">
                  <CardHeader className="relative bg-zinc-50/50 border-b border-zinc-100 pb-4">
                    <div className="flex justify-between items-start">
                      <div className={cn(
                        "h-12 w-12 rounded-xl flex items-center justify-center bg-white border border-zinc-100 text-primary shadow-sm transition-transform group-hover:scale-110",
                      )}>
                        {agent.platform === 'whatsapp' ? <Globe className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
                      </div>
                      <Badge className={cn(
                        "rounded-full text-[9px] font-black uppercase px-2 py-0 border-0 transition-opacity group-hover:opacity-100", 
                        agent.is_ai_enabled ? "bg-emerald-50 text-emerald-600" : "bg-zinc-100 text-zinc-400"
                      )} variant="outline">
                        {agent.is_ai_enabled ? 'Active' : 'Offline'}
                      </Badge>
                    </div>
                    <CardTitle className="mt-4 text-lg font-bold text-zinc-900 leading-none group-hover:text-primary transition-colors">{agent.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1.5 mt-2 capitalize text-zinc-500 text-xs font-medium">
                      <LinkIcon className="h-3 w-3" />
                      {agent.platform} Connection
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6 font-sans pb-4">
                    <div className="space-y-3 group/webhook">
                      <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-zinc-400">
                        <span className="group-hover/webhook:text-zinc-900 transition-colors">Webhook Data</span>
                        {agent.webhook_url ? (
                          <Badge variant="outline" className="text-emerald-600 border-0 p-0 hover:bg-transparent font-black transition-transform group-hover/webhook:scale-105">
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Linked
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-amber-600 border-0 p-0 hover:bg-transparent font-black transition-transform group-hover/webhook:scale-105">
                            <AlertCircle className="h-3.5 w-3.5 mr-1" /> Unlinked
                          </Badge>
                        )}
                      </div>
                      <div className="text-[11px] font-medium bg-zinc-50 p-3 rounded-xl truncate text-zinc-600 border border-zinc-100 group-hover:bg-zinc-100 transition-colors">
                        {agent.webhook_url || 'No destination configured'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      ) : (
        // COMPANY LIST VIEW
        <div className="space-y-8">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5 group">
               <div className="h-14 w-14 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center shadow-sm text-primary transition-transform group-hover:scale-110">
                  <Building2 className="h-7 w-7" />
               </div>
               <div>
                  <h1 className="text-3xl font-black tracking-tight text-zinc-900 leading-none group-hover:text-primary transition-colors">
                    Partners
                  </h1>
                  <p className="text-zinc-500 mt-2 font-medium">
                    Manage client workspaces and dedicated instances.
                  </p>
               </div>
            </div>
            
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger render={
                <Button className="rounded-xl bg-primary hover:opacity-90 text-white shadow-lg shadow-primary/20 border-0 transition-all font-bold h-[48px] px-6 cursor-pointer hover:translate-y-[-2px]">
                  <Plus className="mr-2 h-4 w-4" />
                  New Company
                </Button>
              } />
              <DialogContent className="sm:max-w-[425px] rounded-2xl border border-zinc-200 shadow-2xl bg-white font-sans">
                <form onSubmit={handleAddCompany}>
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-zinc-900 leading-none">Onboard Company</DialogTitle>
                    <DialogDescription className="text-zinc-500 font-medium mt-1">
                      Initialize a primary workspace for a new partner client.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-6 py-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-zinc-400">Company Name</Label>
                      <Input 
                        id="name" 
                        placeholder="e.g. Acme Corp" 
                        className="rounded-xl bg-zinc-50 border-zinc-200 h-[44px] text-zinc-900 placeholder:text-zinc-400 font-bold"
                        value={newCompany.name}
                        onChange={(e) => {
                          const name = e.target.value;
                          const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                          setNewCompany({ ...newCompany, name, slug });
                        }}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slug" className="text-xs font-black uppercase tracking-widest text-zinc-400">Identifier Slug</Label>
                      <Input 
                        id="slug" 
                        placeholder="e.g. acme-corp" 
                        className="rounded-xl bg-zinc-50 border-zinc-200 h-[44px] text-zinc-900 placeholder:text-zinc-400 font-bold"
                        value={newCompany.slug}
                        onChange={(e) => setNewCompany({ ...newCompany, slug: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      className="w-full h-[48px] text-base font-bold bg-primary hover:opacity-90 text-white rounded-xl shadow-lg shadow-primary/20 border-0 transition-all font-sans cursor-pointer"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Initializing..." : "Create Tenant Workspace"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="border border-zinc-200 shadow-sm rounded-2xl overflow-hidden bg-white">
            <CardHeader className="border-b border-zinc-100 px-8 py-6 bg-zinc-50 shadow-inner">
              <div className="flex items-center justify-between gap-4 font-sans">
                <CardTitle className="text-zinc-900 font-bold">Client Directory</CardTitle>
                <div className="relative max-w-sm flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input 
                    placeholder="Search companies..." 
                    className="pl-9 rounded-xl bg-white border-zinc-200 h-[44px] text-zinc-900 placeholder:text-zinc-400 font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-12 text-center text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Loading workspaces...</div>
              ) : filteredCompanies.length === 0 ? (
                <div className="p-12 text-center text-zinc-400 font-bold uppercase tracking-widest text-[10px]">No workspaces found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-100 bg-zinc-50/50 whitespace-nowrap">
                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Workspace</th>
                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Handle</th>
                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Subscription</th>
                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {filteredCompanies.map((company) => (
                        <tr 
                          key={company.id} 
                          className="group hover:bg-zinc-50/50 transition-colors cursor-pointer whitespace-nowrap"
                          onClick={() => setSelectedCompany(company)}
                        >
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-zinc-50 flex items-center justify-center group-hover:bg-primary/5 group-hover:text-primary transition-all group-hover:scale-105 border border-zinc-100 text-zinc-400 shadow-sm">
                                <Building2 className="h-5 w-5" />
                              </div>
                              <span className="font-bold text-zinc-900 text-sm group-hover:text-primary transition-colors">{company.name}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <Badge variant="secondary" className="rounded-full font-bold text-[10px] bg-zinc-100 text-zinc-600 border-zinc-200 border-0 px-2.5 transition-opacity group-hover:opacity-100">
                              /{company.slug}
                            </Badge>
                          </td>
                          <td className="px-8 py-5 text-xs text-zinc-500 font-bold uppercase tracking-tighter group-hover:text-zinc-900 transition-colors">
                            {new Date(company.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </td>
                          <td className="px-8 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="rounded-lg h-[40px] w-[40px] hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-all cursor-pointer hover:translate-y-[-1px]">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="rounded-lg h-[40px] w-[40px] hover:bg-red-50 text-zinc-300 hover:text-red-500 transition-all cursor-pointer hover:translate-y-[-1px] group/del">
                                <Trash2 className="h-4 w-4 group-hover/del:text-red-500" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="rounded-lg h-[40px] w-[40px] hover:bg-primary/5 text-zinc-300 hover:text-primary transition-all cursor-pointer hover:translate-y-[-1px]"
                                onClick={() => setSelectedCompany(company)}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
