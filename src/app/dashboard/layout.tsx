"use client";

import { useChatStore } from "@/store/useChatStore";
import { 
  LayoutDashboard, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Menu, 
  Users, 
  Bot, 
  X,
  Plus,
  Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAuthStoreSync } from "@/hooks/useAuthStoreSync";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useAuthStoreSync();
  const router = useRouter();
  const supabase = createClient();
  const { userRole, userName, isMobileChatOpen, setMobileChatOpen, setActiveChat } = useChatStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleLogout = async () => {
    // Clear Supabase session
    await supabase.auth.signOut();
    
    // Clear mock session cookies
    document.cookie = "mock_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    document.cookie = "mock_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    
    router.push("/login");
    router.refresh();
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  ];

  if (userRole === "super_admin") {
    menuItems.push({ icon: Building2, label: "Companies", href: "/dashboard/companies" });
    menuItems.push({ icon: Users, label: "Users", href: "/dashboard/users" });
    menuItems.push({ icon: Bot, label: "AI Agents", href: "/dashboard/agents" });
    menuItems.push({ icon: Settings, label: "Global Settings", href: "/admin" });
  } else {
    // Client specific menu items
    menuItems.push({ icon: MessageSquare, label: "Conversations", href: "/dashboard/chat" });
    menuItems.push({ icon: Bot, label: "AI Agents", href: "/dashboard/agents" });
    menuItems.push({ icon: Users, label: "Customers", href: "/dashboard/customers" });
  }

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-white border-r border-zinc-200">
      <div className="flex items-center gap-3 p-6 mb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
          <MessageSquare className="h-6 w-6" />
        </div>
        <span className="text-xl font-bold tracking-tight text-zinc-900">
          AiChat.
        </span>
      </div>

      <ScrollArea className="flex-1 px-4 py-4">
        <div className="space-y-4">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  setSheetOpen(false);
                  if (item.href === "/dashboard/chat") {
                    setActiveChat(null);
                    setMobileChatOpen(false);
                  }
                }}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group relative",
                  "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                )}
              >
                <item.icon className="h-5 w-5 opacity-70 group-hover:opacity-100 transition-transform duration-200" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </ScrollArea>

      <div className="p-4 mt-auto border-t border-zinc-100">
          <div className="flex items-center gap-3 p-2 mb-4 bg-zinc-50 rounded-xl border border-zinc-100">
          <Avatar className="h-9 w-9">
            <AvatarImage src="" />
            <AvatarFallback className="bg-zinc-200 text-zinc-700 text-xs font-bold">
              {userRole === 'super_admin' ? 'SA' : 'CL'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden text-zinc-900">
            <span className="text-sm font-bold truncate leading-none mb-1">
              {userName || (userRole === 'super_admin' ? 'Super Admin' : 'Testing Client')}
            </span>
            <span className="text-[10px] text-zinc-500 truncate capitalize font-medium">
              {userRole?.replace('_', ' ') || 'Client'}
            </span>
          </div>
        </div>
        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className="w-full justify-start text-zinc-600 hover:text-red-600 hover:bg-red-50 rounded-xl px-3 h-10"
        >
          <LogOut className="h-4 w-4 mr-3" />
          <span className="text-sm font-medium">Log Out</span>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-zinc-50 relative overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-72 flex-col relative z-20 shadow-2xl shadow-black/5">
        <Sidebar />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-zinc-200 text-zinc-900">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            <span className="font-bold">AiChat.</span>
          </div>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" />}>
              <Menu className="h-6 w-6" />
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 border-none">
              <Sidebar />
            </SheetContent>
          </Sheet>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-3 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
