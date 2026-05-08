"use client";

import { useChatStore } from "@/store/useChatStore";
import { useEffect, useState } from "react";
import { 
  Settings, 
  Shield, 
  Key, 
  Database, 
  Activity,
  Globe,
  Lock,
  Zap,
  CheckCircle2
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function AdminPage() {
  const { userRole } = useChatStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (userRole && userRole !== "super_admin") {
      router.push("/dashboard");
    }
  }, [userRole, router]);

  if (!mounted || userRole !== "super_admin") return null;

  const stats = [
    { label: "System Status", value: "Healthy", icon: Activity, color: "text-emerald-500" },
    { label: "Database", value: "Connected", icon: Database, color: "text-primary" },
    { label: "API Latency", value: "24ms", icon: Zap, color: "text-amber-500" },
    { label: "Active Sessions", value: "1,204", icon: Globe, color: "text-zinc-900" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 p-6 sm:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <div className="h-14 w-14 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center shadow-sm text-primary group hover:scale-110 transition-transform">
              <Shield className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-zinc-900 leading-none">
                Platform Admin
              </h1>
              <p className="text-zinc-500 mt-2 font-medium">
                Global system configuration and platform monitoring.
              </p>
            </div>
          </div>
          <Button className="rounded-xl bg-primary hover:opacity-90 text-white shadow-lg shadow-primary/20 border-0 h-11 px-8 font-bold transition-all">
            Save All Changes
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <Card key={i} className="border border-zinc-200 shadow-sm rounded-2xl overflow-hidden bg-white hover:border-zinc-300 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={cn("p-2.5 rounded-xl bg-zinc-50 border border-zinc-100", stat.color)}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
                    <p className="text-xl font-bold text-zinc-900 leading-none">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border border-zinc-200 shadow-sm rounded-2xl overflow-hidden bg-white">
              <CardHeader className="border-b border-zinc-50 bg-zinc-50/50 px-8 py-6">
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-zinc-400" />
                  <div>
                    <CardTitle className="text-zinc-900 font-bold">System Configuration</CardTitle>
                    <CardDescription className="text-zinc-500 font-medium mt-0.5">Manage platform behavior and defaults.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  {[
                    { label: "New User Registration", desc: "Allow new users to create accounts without invitations.", checked: true },
                    { label: "Maintenance Mode", desc: "Put the entire platform into read-only maintenance mode.", checked: false },
                    { label: "Global AI Training", desc: "Use anonymized platform data to improve general AI models.", checked: true },
                  ].map((setting, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 border border-zinc-100 hover:border-zinc-200 transition-colors">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-bold text-zinc-900">{setting.label}</Label>
                        <p className="text-xs text-zinc-500 font-medium">{setting.desc}</p>
                      </div>
                      <Switch defaultChecked={setting.checked} className="scale-75 data-[state=checked]:bg-primary" />
                    </div>
                  ))}
                </div>

                <div className="space-y-6 pt-6 border-t border-zinc-100">
                  <div className="grid gap-2">
                    <Label htmlFor="platform-name" className="text-xs font-black uppercase tracking-widest text-zinc-400">Platform Display Name</Label>
                    <Input 
                      id="platform-name" 
                      defaultValue="Antigravity SaaS" 
                      className="rounded-xl bg-white border-zinc-200 h-11 text-zinc-900 placeholder:text-zinc-400 font-bold"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="support-email" className="text-xs font-black uppercase tracking-widest text-zinc-400">Global Support Email</Label>
                    <Input 
                      id="support-email" 
                      defaultValue="support@antigravity.ai" 
                      className="rounded-xl bg-white border-zinc-200 h-11 text-zinc-900 placeholder:text-zinc-400 font-bold"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-zinc-200 shadow-sm rounded-2xl overflow-hidden bg-white">
               <CardHeader className="border-b border-zinc-50 bg-zinc-50/50 px-8 py-6">
                <div className="flex items-center gap-3">
                  <Key className="h-5 w-5 text-zinc-400" />
                  <div>
                    <CardTitle className="text-zinc-900 font-bold">API Keys & Integrations</CardTitle>
                    <CardDescription className="text-zinc-500 font-medium mt-0.5">Secret tokens for external service communication.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="space-y-6">
                  {[
                    { label: "OpenAI API Key", status: "Active" },
                    { label: "n8n Webhook Secret", status: "Active" }
                  ].map((api, idx) => (
                    <div key={idx} className="grid gap-3">
                      <Label className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center justify-between">
                        {api.label}
                        <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase font-black border-0">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> {api.status}
                        </Badge>
                      </Label>
                      <div className="flex gap-2">
                        <Input 
                          type="password" 
                          defaultValue="••••••••••••••••••••••••••••" 
                          className="flex-1 rounded-xl bg-zinc-50 border-zinc-200 h-11 text-zinc-900 font-mono"
                        />
                        <Button variant="ghost" className="rounded-xl border border-zinc-200 bg-white text-zinc-600 h-11 px-6 hover:bg-zinc-50 font-bold shadow-sm">Reveal</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            <Card className="border border-zinc-200 shadow-sm rounded-2xl overflow-hidden bg-zinc-900 text-white">
              <CardHeader className="p-8 pb-4">
                <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center mb-6 border border-white/5 shadow-sm">
                  <Lock className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold font-sans">Security Audit</CardTitle>
                <CardDescription className="text-zinc-400 font-medium">Recent administrative heartbeat.</CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-10">
                <div className="space-y-5">
                  {[
                    "Admin login from NEW IP",
                    "API Key regenerated",
                    "Maintenance mode toggled OFF",
                    "User 'admin@demo.com' deleted"
                  ].map((log, i) => (
                    <div key={i} className="flex items-center gap-4 text-sm py-1 font-medium opacity-70 group cursor-default hover:opacity-100 transition-opacity">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {log}
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-8 rounded-xl bg-white/5 text-white hover:bg-white/10 h-11 font-bold text-xs uppercase tracking-widest">
                  View Full Audit Log
                </Button>
              </CardContent>
            </Card>

            <div className="p-8 rounded-2xl bg-primary text-white shadow-xl shadow-primary/20 space-y-5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-150 transition-transform duration-700">
                  <Zap className="h-32 w-32" />
              </div>
              <h3 className="text-xl font-bold relative z-10 leading-none">Need Help?</h3>
              <p className="text-sm text-white/80 leading-relaxed font-medium relative z-10">
                Consult the admin guide for help with global config and platform scaling strategies.
              </p>
              <Button className="w-full bg-white text-primary hover:bg-zinc-100 rounded-xl font-black h-11 shadow-lg transition-all relative z-10 border-0">
                Documentation
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
