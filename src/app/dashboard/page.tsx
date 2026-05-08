"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  MessageSquare, 
  Users, 
  Bot, 
  TrendingUp, 
  Zap,
  ArrowUpRight,
  Plus,
  Building2,
  Activity,
  CreditCard,
  Server,
  LifeBuoy,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/useChatStore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardPage() {
  const { userName, userRole } = useChatStore();
  const router = useRouter();

  if (userRole === 'super_admin') {
    const superStats = [
      {
        title: "Total Companies",
        value: "142",
        change: "+12",
        icon: Building2,
        color: "bg-primary",
      },
      {
        title: "Platform MRR",
        value: "$24.5k",
        change: "+18%",
        icon: CreditCard,
        color: "bg-primary",
      },
      {
        title: "Global Active Agents",
        value: "3,842",
        change: "+412",
        icon: Bot,
        color: "bg-primary",
      },
      {
        title: "API Status",
        value: "99.9%",
        change: "Stable",
        icon: Activity,
        color: "bg-emerald-500",
      },
    ];

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
              Platform Command Center
            </h1>
            <p className="text-zinc-500 mt-1">
              Global overview and health metrics for the entire AI Chat SaaS network.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-xl border-zinc-200 text-zinc-600 bg-white hover:bg-zinc-50 transition-all font-medium cursor-pointer">
              <Server className="mr-2 h-4 w-4" />
              System Status
            </Button>
            <Button className="rounded-xl bg-primary hover:opacity-90 text-white shadow-sm border-0 transition-all font-bold cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              Onboard Company
            </Button>
          </div>
        </div>

        {/* Super Admin Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 lg:gap-6">
          {superStats.map((stat) => (
            <Card key={stat.title} className="border border-zinc-200 shadow-sm rounded-2xl overflow-hidden group hover:border-zinc-300 transition-all duration-300 bg-white cursor-default">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-wider group-hover:text-zinc-900 transition-colors">
                  {stat.title}
                </CardTitle>
                <div className={cn("p-2 rounded-xl text-white shadow-sm transition-transform duration-300 group-hover:scale-110", stat.color)}>
                  <stat.icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-zinc-900">{stat.value}</div>
                <div className="flex items-center gap-1 mt-2">
                  <Badge variant="secondary" className="bg-zinc-50 text-[10px] py-0 px-2 rounded-full border border-zinc-200">
                    <TrendingUp className="mr-1 h-3 w-3 text-emerald-600" />
                    <span className="text-emerald-600 font-bold">{stat.change}</span>
                  </Badge>
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold ml-1">vs last month</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-7">
          {/* Recent Company Signups */}
          <Card className="lg:col-span-1 xl:col-span-4 border border-zinc-200 shadow-sm rounded-2xl overflow-hidden bg-white">
            <CardHeader className="border-b border-zinc-100 bg-white/50">
              <CardTitle className="flex items-center justify-between text-zinc-900 text-lg">
                <span>Recent Company Activity</span>
                <Badge variant="outline" className="rounded-full bg-emerald-50 text-emerald-600 border-emerald-100 font-bold">Live Updates</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {[
                  { name: "Acme Corp", plan: "Enterprise", status: "Onboarded", time: "2h ago", color: "bg-primary" },
                  { name: "GlobalTech", plan: "Pro", status: "Agent Deployed", time: "5h ago", color: "bg-indigo-500" },
                  { name: "Startup Inc", plan: "Starter", status: "Signed Up", time: "1d ago", color: "bg-zinc-400" },
                  { name: "MegaStore", plan: "Enterprise", status: "Limit Reached", time: "1d ago", color: "bg-red-500" }
                ].map((company, i) => (
                  <Link href={`/dashboard/companies?id=${i}`} key={i} className="flex items-center gap-3 sm:gap-4 group cursor-pointer p-2 -mx-2 rounded-xl hover:bg-zinc-50 transition-colors">
                    <div className={cn("h-10 w-10 shrink-0 rounded-xl flex items-center justify-center font-bold text-white shadow-sm transition-transform group-hover:scale-105", company.color)}>
                      {company.name.charAt(0)}
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold leading-none truncate text-zinc-900 group-hover:text-primary transition-colors">{company.name}</p>
                        <Badge variant="secondary" className="text-[9px] rounded-full h-4 px-1.5 shrink-0 hidden sm:inline-flex bg-zinc-100 text-zinc-600 border border-zinc-200 font-bold">{company.plan}</Badge>
                      </div>
                      <p className="text-xs text-zinc-500 truncate font-medium">{company.status}</p>
                    </div>
                    <div className="text-right flex flex-col items-end shrink-0">
                      <p className="text-[10px] text-zinc-400 mb-1 font-bold">{company.time}</p>
                      <ArrowUpRight className="h-4 w-4 text-zinc-300 group-hover:text-zinc-900 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </Link>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-6 text-zinc-500 font-bold text-xs hover:bg-zinc-100 rounded-xl py-6 transition-colors cursor-pointer">
                View All Companies Directory
              </Button>
            </CardContent>
          </Card>

          {/* Platform Resource Usage */}
          <div className="lg:col-span-1 xl:col-span-3 space-y-6">
            <Card className="border border-zinc-200 shadow-sm rounded-2xl overflow-hidden bg-white">
              <CardHeader className="border-b border-zinc-100 bg-white/50">
                <CardTitle className="text-zinc-900 text-lg">Global Resource Usage</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-8">
                  <div className="group">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-sm font-bold text-zinc-500 group-hover:text-zinc-900 transition-colors cursor-default">OpenAI API Quota</span>
                      <span className="text-xs font-bold text-zinc-900 group-hover:text-primary transition-colors cursor-default">$8,450 / $10,000</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-[84.5%] rounded-full group-hover:opacity-80 transition-opacity"></div>
                    </div>
                  </div>
                  
                  <div className="group">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-sm font-bold text-zinc-500 group-hover:text-zinc-900 transition-colors cursor-default">Database Storage</span>
                      <span className="text-xs font-bold text-zinc-900 group-hover:text-emerald-500 transition-colors cursor-default">42GB / 100GB</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-[42%] rounded-full group-hover:opacity-80 transition-opacity"></div>
                    </div>
                  </div>

                  <div className="group">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-sm font-bold text-zinc-500 group-hover:text-zinc-900 transition-colors cursor-default">Active Webhooks (n8n)</span>
                      <span className="text-xs font-bold text-zinc-900 group-hover:text-amber-500 transition-colors cursor-default">1,204 / min</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 w-[65%] rounded-full group-hover:opacity-80 transition-opacity"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-8 p-6 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-start gap-4 group">
              <div className="p-3 bg-white rounded-xl shrink-0 border border-zinc-200 shadow-sm transition-transform group-hover:scale-110">
                <Activity className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <h4 className="text-xs font-black text-zinc-900 uppercase tracking-widest group-hover:text-emerald-600 transition-colors">System Healthy</h4>
                <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed font-medium">
                  All internal sub-systems, webhooks, and providers are responding normally.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Conversations",
      value: "1,284",
      change: "+12.5%",
      icon: MessageSquare,
      color: "bg-primary",
    },
    {
      title: "Active Agents",
      value: "12",
      change: "+2",
      icon: Bot,
      color: "bg-indigo-500",
    },
    {
      title: "Total Customers",
      value: "842",
      change: "+5.2%",
      icon: Users,
      color: "bg-zinc-900",
    },
    {
      title: "AI Response Rate",
      value: "94.2%",
      change: "+1.5%",
      icon: Zap,
      color: "bg-emerald-500",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            Welcome back, {userName?.split(' ')[0] || 'Admin'} 👋
          </h1>
          <p className="text-zinc-500 mt-1 font-medium">
            Here's what's happening with your AI agents today.
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="outline" className="rounded-xl border-zinc-200 text-zinc-600 bg-white hover:bg-zinc-50 transition-all font-bold cursor-pointer h-10 px-4">
            Download Report
          </Button>
          <Button onClick={() => router.push('/dashboard/agents')} className="rounded-xl bg-primary hover:opacity-90 text-white shadow-sm border-0 transition-all font-bold cursor-pointer h-10 px-4">
            <Plus className="mr-2 h-4 w-4" />
            New Agent
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 lg:gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="border border-zinc-100 shadow-sm rounded-2xl overflow-hidden group hover:border-zinc-200 transition-all duration-300 bg-white cursor-default">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-zinc-500 group-hover:text-zinc-900 transition-colors uppercase tracking-wider">
                {stat.title}
              </CardTitle>
              <div className={cn("p-2 rounded-xl text-white shadow-sm transition-transform duration-300 group-hover:scale-110", stat.color)}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-900">{stat.value}</div>
              <div className="flex items-center gap-1 mt-1">
                <Badge variant="secondary" className="bg-zinc-50 text-[10px] py-0 px-2 rounded-full border border-zinc-100">
                  <TrendingUp className="mr-1 h-3 w-3 text-emerald-600" />
                  <span className="text-emerald-600 font-bold">{stat.change}</span>
                </Badge>
                <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold ml-1">vs last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-7">
        {/* Recent Activity */}
        <Card className="lg:col-span-1 xl:col-span-4 border border-zinc-100 shadow-sm rounded-2xl overflow-hidden bg-white">
          <CardHeader className="border-b border-zinc-50 bg-white/50">
            <CardTitle className="text-zinc-900 text-lg">Recent Conversations</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} onClick={() => router.push('/dashboard/chat')} className="flex items-center gap-3 sm:gap-4 group cursor-pointer p-2 -mx-2 rounded-xl hover:bg-zinc-50 transition-colors">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-zinc-50 flex items-center justify-center font-bold text-zinc-600 border border-zinc-100 group-hover:bg-primary/5 group-hover:text-primary transition-all group-hover:scale-110">
                    {String.fromCharCode(65 + i)}
                  </div>
                  <div className="flex-1 space-y-0.5 min-w-0">
                    <p className="text-sm font-bold leading-none truncate text-zinc-900 group-hover:text-primary transition-colors">Customer User {i}</p>
                    <p className="text-xs text-zinc-500 truncate font-medium">"How can I set up the webhook for automation?"</p>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end">
                    <Badge variant="outline" className="text-[9px] sm:text-[10px] rounded-full border-zinc-100 bg-zinc-50 text-zinc-500 font-bold shrink-0 hidden sm:inline-flex px-2 py-0 uppercase">
                      WhatsApp
                    </Badge>
                    <p className="text-[10px] text-zinc-400 mt-1 font-bold">{i * 5}m ago</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-zinc-200 group-hover:text-zinc-900 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0" />
                </div>
              ))}
            </div>
            <Button onClick={() => router.push('/dashboard/chat')} variant="ghost" className="w-full mt-6 text-zinc-500 text-xs font-bold hover:bg-zinc-50 rounded-xl py-6 transition-colors cursor-pointer group">
              View All Conversations
              <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardContent>
        </Card>

        {/* System Health / Agents status */}
        <div className="lg:col-span-1 xl:col-span-3 space-y-6">
          <Card className="border border-zinc-100 shadow-sm rounded-2xl overflow-hidden bg-white">
            <CardHeader className="border-b border-zinc-50 bg-white/50">
              <CardTitle className="text-zinc-900 text-lg">Active Agents Status</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {['Support Bot', 'Sales Agent', 'Feedback Bot'].map((agent, i) => (
                  <div key={agent} className="flex items-center justify-between group cursor-default">
                    <div className="flex items-center gap-3">
                      <div className={cn("h-2.5 w-2.5 rounded-full shadow-sm animate-pulse transition-transform group-hover:scale-125", i === 1 ? "bg-red-500" : "bg-emerald-500")}></div>
                      <span className="text-sm font-bold text-zinc-700 group-hover:text-zinc-900 transition-colors">{agent}</span>
                    </div>
                    <Badge className={cn("rounded-full uppercase text-[9px] px-2 font-black tracking-wider border transition-all group-hover:px-3", i === 1 ? "bg-red-50/50 text-red-500 border-red-100" : "bg-emerald-50/50 text-emerald-600 border-emerald-100")} variant="outline">
                      {i === 1 ? 'Error' : 'Active'}
                    </Badge>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 p-4 rounded-xl bg-zinc-50 border border-zinc-100 group">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3 text-center group-hover:text-primary transition-colors">AI Credits Usage</h4>
                <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-primary w-[82%] rounded-full shadow-sm group-hover:opacity-80 transition-opacity"></div>
                </div>
                <div className="flex justify-between text-[10px] font-bold text-zinc-500">
                  <span className="group-hover:text-primary transition-colors">8.2k used</span>
                  <span>10k limit</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Premium Help Card for Clients - KEEP THIS ONE AS REQUESTED */}
          <div className="p-8 rounded-2xl bg-primary text-white shadow-xl shadow-primary/20 space-y-5 relative overflow-hidden group cursor-pointer">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-150 group-hover:-rotate-12 transition-all duration-700">
                <LifeBuoy className="h-32 w-32" />
            </div>
            <div className="relative z-10">
              <Badge className="bg-white/20 text-white border-white/20 mb-4 font-black tracking-widest text-[9px] uppercase tracking-widest">Premium Support</Badge>
              <h3 className="text-xl font-bold leading-none">Need Assistance?</h3>
              <p className="text-sm text-white/80 mt-2 leading-relaxed font-medium">
                Our support team is available 24/7 to help you configure your agents and workflows.
              </p>
            </div>
            <Button className="w-full bg-white text-primary hover:bg-zinc-100 rounded-xl font-black h-11 shadow-lg transition-all relative z-10 border-0 cursor-pointer">
                Contact Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
