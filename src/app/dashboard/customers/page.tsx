"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Users, 
  Search, 
  MessageSquare, 
  Calendar,
  MoreVertical,
  ExternalLink,
  User,
  Power,
  BarChart3,
  ArrowUpRight
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/useChatStore";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { companyId, userRole } = useChatStore();
  const supabase = createClient();

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      let query = supabase.from("conversations").select("*");
      
      // Filter by company if not super_admin
      if (userRole !== "super_admin" && companyId) {
        query = query.eq("company_id", companyId);
      }

      const { data, error } = await query.order("last_message_at", { ascending: false });

      if (!error && data) {
        // Group by contact_name/phone to get unique "customers"
        const uniqueCustomers = data.reduce((acc: any[], current: any) => {
          const exists = acc.find(c => c.contact_name === current.contact_name);
          if (!exists) acc.push(current);
          return acc;
        }, []);
        setCustomers(uniqueCustomers);
      }
      setLoading(false);
    };

    fetchCustomers();
  }, [companyId, userRole, supabase]);

  const filteredCustomers = customers.filter(c => 
    c.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.contact_phone && c.contact_phone.includes(searchQuery))
  );

  const toggleCustomerAi = async (id: string, currentState: boolean) => {
    const { error } = await supabase
      .from("conversations")
      .update({ is_ai_mode: !currentState })
      .eq("id", id);
    
    if (error) {
      console.error("Error toggling AI mode:", error);
      alert("Failed to toggle AI mode");
    } else {
      setCustomers(prev => prev.map(c => c.id === id ? { ...c, is_ai_mode: !currentState } : c));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-5 group">
           <div className="h-14 w-14 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center shadow-sm text-primary transition-transform group-hover:scale-110">
              <Users className="h-7 w-7" />
           </div>
           <div>
              <h1 className="text-3xl font-black tracking-tight text-zinc-900 leading-none group-hover:text-primary transition-colors">
                Customer Base
              </h1>
              <p className="text-zinc-500 mt-2 font-medium">
                View and manage people who have interacted with your AI agents.
              </p>
           </div>
        </div>
      </div>

      <Card className="border border-zinc-200 shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardHeader className="border-b border-zinc-100 px-8 py-6 bg-zinc-50 shadow-inner">
          <div className="flex items-center justify-between gap-4 font-sans">
            <CardTitle className="text-zinc-900 font-bold">Directory</CardTitle>
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input 
                placeholder="Search customers..." 
                className="pl-9 rounded-xl bg-white border-zinc-200 h-[44px] text-zinc-900 placeholder:text-zinc-400 font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 font-sans">
          {loading ? (
            <div className="p-12 text-center text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Loading customers...</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-12 text-center text-zinc-400 font-bold uppercase tracking-widest text-[10px]">No customers found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50/50 whitespace-nowrap">
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">User</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Source</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">AI Response</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Latest Activity</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="group hover:bg-zinc-50/50 transition-colors whitespace-nowrap cursor-default">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-zinc-100 shadow-sm transition-transform group-hover:scale-110">
                            <AvatarImage src={customer.contact_avatar} />
                            <AvatarFallback className="bg-zinc-100 text-zinc-400 font-bold text-xs uppercase">
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-bold text-zinc-900 text-sm group-hover:text-primary transition-colors">{customer.contact_name}</span>
                            <span className="text-[11px] text-zinc-500 font-medium">{customer.contact_phone || 'No direct phone'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 transition-colors">
                        <Badge variant="outline" className="rounded-full text-[9px] font-black uppercase px-2 py-0 border-zinc-200 bg-zinc-50 text-zinc-500 group-hover:opacity-100 transition-opacity">
                          {customer.platform}
                        </Badge>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={customer.is_ai_mode ?? true} 
                            onCheckedChange={() => toggleCustomerAi(customer.id, customer.is_ai_mode ?? true)}
                            className="scale-75 data-[state=checked]:bg-primary cursor-pointer transition-transform hover:scale-90"
                          />
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-widest transition-colors",
                            (customer.is_ai_mode ?? true) ? "text-primary" : "text-zinc-300"
                          )}>
                            {(customer.is_ai_mode ?? true) ? "Active" : "Off"}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5 min-w-[200px]">
                        <div className="flex flex-col gap-0.5 max-w-xs">
                          <p className="text-sm text-zinc-700 truncate font-medium group-hover:text-zinc-900 transition-colors">
                            "{customer.last_message || 'Session established'}"
                          </p>
                          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest group-hover:text-primary transition-colors">
                            {new Date(customer.last_message_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <Button variant="ghost" size="icon" className="rounded-lg h-[40px] w-[40px] hover:bg-zinc-100 text-zinc-300 hover:text-zinc-900 transition-all cursor-pointer hover:translate-y-[-1px]">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Visual Indicator of Premium Active DB */}
      <div className="flex items-center justify-center pt-8 opacity-50 group">
         <div className="flex items-center gap-2 px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-full transition-all group-hover:border-primary/20 group-hover:bg-primary/5">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 group-hover:text-primary transition-colors">Secure Encrypted Database</span>
         </div>
      </div>
    </div>
  );
}
