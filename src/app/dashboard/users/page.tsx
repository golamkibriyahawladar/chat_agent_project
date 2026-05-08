"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Users, 
  Search, 
  Mail, 
  Shield, 
  Building2, 
  Plus, 
  Edit, 
  Trash2,
  Lock,
  UserCheck,
  ShieldCheck,
  ShieldAlert,
  ArrowUpRight
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/useChatStore";
import { useRouter } from "next/navigation";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ email: "", password: "", role: "client", company_id: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { userRole } = useChatStore();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (userRole && userRole !== "super_admin") {
      router.push("/dashboard");
    }
  }, [userRole, router]);

  const fetchData = async () => {
    setLoading(true);
    const { data: profiles, error: pError } = await supabase.from("profiles").select("*");
    const { data: comps, error: cError } = await supabase.from("companies").select("id, name");

    if (!pError && profiles) setUsers(profiles);
    if (!cError && comps) setCompanies(comps);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [supabase]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.email || !newUser.password) return;

    setIsSubmitting(true);
    const { data, error } = await supabase.auth.signUp({
      email: newUser.email,
      password: newUser.password,
      options: {
        data: {
          role: newUser.role,
          company_id: newUser.company_id
        }
      }
    });

    if (!error) {
      setIsAddModalOpen(false);
      setNewUser({ email: "", password: "", role: "client", company_id: "" });
      fetchData();
      alert("User created successfully!");
    } else {
      console.error("Error creating user:", error);
      alert("Failed to create user: " + error.message);
    }
    setIsSubmitting(false);
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.full_name && u.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (userRole !== "super_admin") return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-5 group">
           <div className="h-14 w-14 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center shadow-sm text-primary transition-transform group-hover:scale-110">
              <Users className="h-7 w-7" />
           </div>
           <div>
              <h1 className="text-3xl font-black tracking-tight text-zinc-900 leading-none group-hover:text-primary transition-colors">
                Identity Center
              </h1>
              <p className="text-zinc-500 mt-2 font-medium">
                Manage internal staff and company accounts.
              </p>
           </div>
        </div>
        
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger render={
            <Button className="rounded-xl bg-primary hover:opacity-90 text-white shadow-lg shadow-primary/20 border-0 transition-all font-bold h-11 px-6 cursor-pointer hover:translate-y-[-2px]">
              <Plus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          } />
          <DialogContent className="sm:max-w-[425px] rounded-2xl border border-zinc-200 shadow-2xl bg-white font-sans">
            <form onSubmit={handleCreateUser}>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-zinc-900 leading-none">Create Account</DialogTitle>
                <DialogDescription className="text-zinc-500 font-medium mt-1">
                  Setup a new login for a company client.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-zinc-400">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email"
                    placeholder="name@company.com" 
                    className="rounded-xl bg-zinc-50 border-zinc-200 h-[44px] text-zinc-900 placeholder:text-zinc-400 font-medium"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" title="password_label" className="text-xs font-black uppercase tracking-widest text-zinc-400">Password</Label>
                  <Input 
                    id="password" 
                    type="password"
                    placeholder="Min 6 characters" 
                    className="rounded-xl bg-zinc-50 border-zinc-200 h-[44px] text-zinc-900 placeholder:text-zinc-400 font-medium"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-xs font-black uppercase tracking-widest text-zinc-400">User Role</Label>
                  <select 
                    id="role"
                    className="w-full rounded-xl bg-zinc-50 border-zinc-200 h-[44px] px-3 text-sm text-zinc-900 font-bold focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  >
                    <option value="client">Client Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                {newUser.role === 'client' && (
                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-xs font-black uppercase tracking-widest text-zinc-400">Assign Company</Label>
                    <select 
                      id="company"
                      className="w-full rounded-xl bg-zinc-50 border-zinc-200 h-[44px] px-3 text-sm text-zinc-900 font-bold focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                      value={newUser.company_id}
                      onChange={(e) => setNewUser({ ...newUser, company_id: e.target.value })}
                      required={newUser.role === 'client'}
                    >
                      <option value="">Select Company...</option>
                      {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button 
                  type="submit" 
                  className="w-full h-[48px] text-base font-bold bg-primary hover:opacity-90 text-white rounded-xl shadow-lg shadow-primary/20 border-0 transition-all cursor-pointer"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Generate Account"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border border-zinc-200 shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardHeader className="border-b border-zinc-100 px-8 py-6 bg-zinc-50 shadow-inner">
          <div className="flex items-center justify-between gap-4 font-sans">
            <CardTitle className="text-zinc-900 font-bold">Member Directory</CardTitle>
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input 
                placeholder="Search users..." 
                className="pl-9 rounded-xl bg-white border-zinc-200 h-[44px] text-zinc-900 placeholder:text-zinc-400 font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Loading directory...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-zinc-400 font-bold uppercase tracking-widest text-[10px]">No users found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50/50 whitespace-nowrap">
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Member</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Authority</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Affiliation</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredUsers.map((profile) => (
                    <tr key={profile.id} className="group hover:bg-zinc-50/50 transition-colors whitespace-nowrap cursor-default">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-zinc-100 shadow-sm transition-transform group-hover:scale-110">
                            <AvatarImage src={profile.avatar_url} />
                            <AvatarFallback className="bg-zinc-100 text-zinc-500 font-bold text-xs">
                              {profile.email[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-bold text-zinc-900 text-sm group-hover:text-primary transition-colors">{profile.full_name || 'Anonymous User'}</span>
                            <span className="text-[11px] text-zinc-500 font-medium">{profile.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <Badge variant="outline" className={cn(
                          "rounded-full text-[9px] font-black uppercase border px-2 py-0 transition-opacity group-hover:opacity-100",
                          profile.role === 'super_admin' ? "bg-red-50 text-red-600 border-red-100" : "bg-primary/5 text-primary border-primary/10"
                        )}>
                          {profile.role?.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 transition-colors">
                          {profile.role === 'super_admin' ? (
                            <ShieldCheck className="h-3.5 w-3.5 text-zinc-300 group-hover:text-red-400 transition-colors" />
                          ) : (
                            <Building2 className="h-3.5 w-3.5 text-zinc-300 group-hover:text-primary transition-colors" />
                          )}
                          {profile.company_id 
                            ? companies.find(c => c.id === profile.company_id)?.name || 'Linked' 
                            : profile.role === 'super_admin' ? 'Global Admin' : 'Unassigned'}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-[40px] w-[40px] rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer hover:translate-y-[-1px]">
                            <Edit className="h-4 w-4 text-zinc-300 hover:text-zinc-900" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-[40px] w-[40px] rounded-lg hover:bg-red-50 group/del hover:text-red-500 transition-colors cursor-pointer hover:translate-y-[-1px]">
                            <Trash2 className="h-4 w-4 text-zinc-200 group-hover/del:text-red-400" />
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
  );
}
