"use client";

import "./chat.css";
import { useChatStore } from "@/store/useChatStore";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Send, 
  Smile, 
  Paperclip,
  User,
  Bot,
  Zap,
  Info,
  ChevronLeft,
  MessageSquare,
  Clock,
  Sparkles,
  Circle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function ChatPage() {
  const { 
    activeChatId, 
    setActiveChat, 
    isMobileChatOpen,
    setMobileChatOpen,
    companyId,
    userRole
  } = useChatStore();
  
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messagesPage, setMessagesPage] = useState(0);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [activeConversation, setActiveConversation] = useState<any>(null);
  const activeConversationRef = useRef<any>(null);
  const isInitialLoadRef = useRef(true);
  const scrollPositionRef = useRef<{scrollHeight: number, scrollTop: number} | null>(null);

  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [timerInput, setTimerInput] = useState<string>("");
  const [activeTimers, setActiveTimers] = useState<Record<string, { endTime: number; timeout: any }>>({});
  const [remainingTimes, setRemainingTimes] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  
  const supabase = createClient();

  // Sync ref
  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

  // Restore active timers from localStorage on mount
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('chat_timers') || '{}');
      const now = Date.now();
      let changed = false;

      Object.entries(saved).forEach(([id, endTime]) => {
        const end = Number(endTime);
        const remaining = end - now;
        
        if (remaining > 0) {
          const timeout = setTimeout(async () => {
             await supabase.from("conversations").update({ is_ai_mode: true }).eq("id", id);
             setActiveTimers(prev => { const n={...prev}; delete n[id]; return n; });
             try {
               const s = JSON.parse(localStorage.getItem('chat_timers') || '{}');
               delete s[id];
               localStorage.setItem('chat_timers', JSON.stringify(s));
             } catch(e) {}
             fetchConversations();
          }, remaining);
          
          setActiveTimers(prev => ({...prev, [id]: { endTime: end, timeout }}));
        } else {
          // expired while offline
          delete saved[id];
          changed = true;
          supabase.from("conversations").update({ is_ai_mode: true }).eq("id", id).then(() => fetchConversations());
        }
      });
      
      if (changed) {
        localStorage.setItem('chat_timers', JSON.stringify(saved));
      }
    } catch(e) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Route Protection for Super Admin
  useEffect(() => {
    if (userRole === 'super_admin') {
      router.push('/dashboard/access-denied');
    }
  }, [userRole, router]);

  // Scroll to bottom when messages change or keep place for load previous
  useEffect(() => {
    if (messageContainerRef.current) {
      if (isInitialLoadRef.current) {
        messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
      } else if (scrollPositionRef.current) {
        const { scrollHeight: prevHeight, scrollTop: prevTop } = scrollPositionRef.current;
        const newHeight = messageContainerRef.current.scrollHeight;
        messageContainerRef.current.scrollTop = newHeight - prevHeight + prevTop;
        scrollPositionRef.current = null;
      }
      isInitialLoadRef.current = true;
    }
  }, [messages]);

  // Fetch Agents for filtering
  const fetchAgents = async () => {
    if (!companyId) return;
    
    let query = supabase.from("agents").select("*");
    query = query.eq("company_id", companyId);
    
    const { data, error } = await query;
    if (!error && data) setAgents(data);
  };

  // Fetch Conversations
  const fetchConversations = async (agentId?: string | null) => {
    if (!companyId) return;
    
    let query = supabase.from("conversations").select(`
      *,
      agents (*)
    `);

    query = query.eq("company_id", companyId);

    if (agentId) {
      query = query.eq("agent_id", agentId);
    }

    const { data, error } = await query.order("last_message_at", { ascending: false });
    if (!error && data) setConversations(data);
    setLoading(false);
  };

  // Fetch Messages for active chat with simple pagination
  const fetchMessages = async (chatId: string, pageNum = 0) => {
    let activeConv = conversations.find(c => c.id === chatId);
    if (!activeConv) {
      const { data } = await supabase.from("conversations").select("*").eq("id", chatId).single();
      if (data) activeConv = data;
      else return;
    }
    
    setActiveConversation(activeConv);
    const sessionId = `${activeConv.company_id}_${activeConv.agent_id}_${activeConv.contact_phone}`;
    
    if (pageNum > 0) {
      setIsLoadingMore(true);
      if (messageContainerRef.current) {
        scrollPositionRef.current = {
          scrollHeight: messageContainerRef.current.scrollHeight,
          scrollTop: messageContainerRef.current.scrollTop
        };
      }
    } else {
      isInitialLoadRef.current = true;
    }

    const { data, error } = await supabase
      .from("message_history")
      .select("*")
      .eq("session_id", sessionId)
      .order("id", { ascending: false }) // GET NEWEST FIRST SO WE CAN LIMIT
      .range(pageNum * 20, (pageNum * 20) + 19);

    if (!error && data) {
      const reversed = data.reverse();
      if (pageNum === 0) {
        setMessages(reversed);
      } else {
        setMessages(prev => {
          const existingIds = new Set(prev.map((m: any) => m.id));
          const newUnique = reversed.filter((m: any) => !existingIds.has(m.id));
          return [...newUnique, ...prev];
        });
        isInitialLoadRef.current = false;
      }
      setHasMoreMessages(data.length === 20);
      setMessagesPage(pageNum);
    }
    
    if (pageNum > 0) setIsLoadingMore(false);
  };

  // Core timer application logic
  const applyTimer = async (id: string, minutes: number) => {
    const endTime = Date.now() + (minutes * 60000);
    
    try {
      const saved = JSON.parse(localStorage.getItem('chat_timers') || '{}');
      saved[id] = endTime;
      localStorage.setItem('chat_timers', JSON.stringify(saved));
    } catch(e) {}

    if (activeTimers[id]) {
      clearTimeout(activeTimers[id].timeout);
    }

    const timeout = setTimeout(async () => {
      await supabase
        .from("conversations")
        .update({ is_ai_mode: true })
        .eq("id", id);
      
      setActiveTimers(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      
      try {
        const saved = JSON.parse(localStorage.getItem('chat_timers') || '{}');
        delete saved[id];
        localStorage.setItem('chat_timers', JSON.stringify(saved));
      } catch(e) {}

      fetchConversations(selectedAgentId);
    }, minutes * 60000);

    setActiveTimers(prev => ({
      ...prev,
      [id]: { endTime, timeout }
    }));
  };

    // Toggle AI Mode – also update local activeConversation for chat widget
    const toggleUserAi = async (isAiMode: boolean, specificChatId?: string) => {
      const id = specificChatId || activeChatId;
      if (!id) return;

      // Optimistically update UI immediately before DB call
      if (activeConversation && activeConversation.id === id) {
        setActiveConversation(prev => ({ ...prev, is_ai_mode: isAiMode } as any));
      }

      // Automatic timer trigger when toggling to Manual Mode (isAiMode === false) via Switch
      const mins = parseInt(timerInput);
      if (!isAiMode && id === activeChatId && !isNaN(mins) && mins > 0) {
        const { error } = await supabase.from("conversations").update({ is_ai_mode: false }).eq("id", id);
        if (!error) {
          await applyTimer(id, mins);
          setTimerInput("");
          fetchConversations(selectedAgentId);
        } else {
          // Revert optimistic update on error
          setActiveConversation(prev => ({ ...prev, is_ai_mode: !isAiMode } as any));
        }
        return;
      }

      const { error } = await supabase
        .from("conversations")
        .update({ is_ai_mode: isAiMode })
        .eq("id", id);

      if (!error) {
        // If manually toggled back to AI, clear any active timers
        if (isAiMode && activeTimers[id]) {
          clearTimeout(activeTimers[id].timeout);
          setActiveTimers(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
          });
        }
        fetchConversations(selectedAgentId);
      } else {
        // Revert optimistic update on error
        if (activeConversation && activeConversation.id === id) {
          setActiveConversation(prev => ({ ...prev, is_ai_mode: !isAiMode } as any));
        }
      }
    };

  // Explicit Toggle Human Mode with Timer button
  const toggleHumanWithTimer = async () => {
    if (!activeChatId || !timerInput) return;
    const minutes = parseInt(timerInput);
    if (isNaN(minutes) || minutes <= 0) return;

    const { error } = await supabase
      .from("conversations")
      .update({ is_ai_mode: false })
      .eq("id", activeChatId);

    if (!error) {
      await applyTimer(activeChatId, minutes);
      setTimerInput("");
      fetchConversations(selectedAgentId);
    }
  };

  // Handle Send Message
  const handleSend = async () => {
    if (!input.trim() || !activeConversation) return;

    // Insert into message_history for n8n memory payload and trigger
    const n8nMessage = {
      session_id: `${activeConversation.company_id}_${activeConversation.agent_id}_${activeConversation.contact_phone}`,
      message: {
        type: "ai",
        content: input,
        replied_by: "human_agent",
        tool_calls: [],
        additional_kwargs: {},
        response_metadata: {},
        invalid_tool_calls: []
      }
    };

    const historyRes = await supabase.from("message_history").insert([n8nMessage]).select().single();

    if (historyRes.error) {
      const errStr = JSON.stringify(historyRes.error, null, 2);
      console.error("Message Send Error (history table):", errStr, historyRes.error);
      alert("Failed to send message: " + errStr);
    } else {
      setInput("");
      // Optimistic append, realtime might catch it but this feels instantaneous
      setMessages(prev => {
        if (prev.some(m => m.id === historyRes.data.id)) return prev;
        isInitialLoadRef.current = true;
        return [...prev, historyRes.data];
      });

      // Trigger webhook if agent has one configured
      try {
        const { data: agentData } = await supabase
          .from("agents")
          .select("webhook_url")
          .eq("id", activeConversation.agent_id)
          .single();

        if (agentData?.webhook_url) {
          await fetch(agentData.webhook_url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: `${activeConversation.company_id}_${activeConversation.agent_id}_${activeConversation.contact_phone}`,
              chatInput: input,
              contact_phone: activeConversation.contact_phone,
              contact_name: activeConversation.contact_name,
              replied_by: "human_agent"
            })
          });
        }
      } catch (e) {
        console.error("Webhook trigger failed:", e);
      }
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchAgents();
      fetchConversations(selectedAgentId);
    }
  }, [companyId, selectedAgentId]);

  useEffect(() => {
    if (activeChatId) {
      setMessagesPage(0);
      setHasMoreMessages(false);
      setMessages([]);
      isInitialLoadRef.current = true;
      fetchMessages(activeChatId, 0);
      setInput(""); // Clear draft when switching specifically to new chat
    } else {
      setActiveConversation(null);
      setMessages([]);
      setInput("");
      setMessagesPage(0);
      setHasMoreMessages(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChatId]);

  // Timer Update Loop
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const newRemaining: Record<string, string> = {};
      
      Object.keys(activeTimers).forEach(id => {
        const { endTime } = activeTimers[id];
        const conv = conversations.find(c => c.id === id);
        if (!conv) return;
        
        if (endTime) {
          const diff = endTime - now;
          if (diff > 0) {
            const m = Math.floor(diff / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            newRemaining[id] = `${m}:${s < 10 ? '0' : ''}${s}`;
          }
        }
      });
      setRemainingTimes(newRemaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimers, conversations]);

  // Realtime Subscriptions
  useEffect(() => {
    if (!companyId) return;

    const channel = supabase
      .channel('chat-updates')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'conversations',
          filter: `company_id=eq.${companyId}`
        },
        (payload: any) => {
          fetchConversations(selectedAgentId);
          if (activeConversationRef.current && payload.new && payload.new.id === activeConversationRef.current.id) {
             setActiveConversation((prev: any) => ({ ...prev, ...payload.new }));
          }
        }
      )
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'message_history'
        },
        (payload: any) => {
          const expectedSessionId = activeConversationRef.current 
            ? `${activeConversationRef.current.company_id}_${activeConversationRef.current.agent_id}_${activeConversationRef.current.contact_phone}` 
            : null;

          if (expectedSessionId && payload.new.session_id === expectedSessionId) {
             setMessages(prev => {
               if (prev.some(m => m.id === payload.new.id)) return prev;
               isInitialLoadRef.current = true;
               return [...prev, payload.new];
             });
          }
          fetchConversations(selectedAgentId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, activeChatId, selectedAgentId, companyId, userRole]);

  // Filter conversations by search
  const filteredConversations = conversations.filter(conv => 
    !searchQuery || conv.contact_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (userRole === 'super_admin') return null;

  return (
    <div className="chat-page-wrapper">
      {/* Conversation Sidebar */}
      <aside className={cn(
        "chat-sidebar",
        isMobileChatOpen && activeChatId ? "chat-sidebar--hidden-mobile" : ""
      )}>
        {/* Sidebar Header */}
        <div className="chat-sidebar__header">
          <div className="chat-sidebar__title-row">
            <div>
              <h2 className="chat-sidebar__title">Conversations</h2>
              <p className="chat-sidebar__subtitle">{conversations.length} total chats</p>
            </div>
            <Button variant="ghost" size="icon" className="chat-sidebar__filter-btn">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Agent Filter Pills */}
          <div className="chat-sidebar__pills">
            <button
              className={cn("chat-pill", selectedAgentId === null && "chat-pill--active")}
              onClick={() => setSelectedAgentId(null)}
            >
              All
            </button>
            {agents.map((agent) => (
              <button
                key={agent.id}
                className={cn("chat-pill", selectedAgentId === agent.id && "chat-pill--active")}
                onClick={() => setSelectedAgentId(agent.id)}
              >
                {agent.name}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="chat-sidebar__search">
            <Search className="chat-sidebar__search-icon" />
            <Input 
              placeholder="Search conversations..." 
              className="chat-sidebar__search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {/* Conversation List */}
        <ScrollArea className="chat-sidebar__list">
          <div className="chat-sidebar__list-inner">
            {loading ? (
              <div className="chat-sidebar__empty">
                <div className="chat-sidebar__loading-dots">
                  <span /><span /><span />
                </div>
                <p>Loading conversations...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="chat-sidebar__empty">
                <MessageSquare className="h-8 w-8 text-zinc-300" />
                <p>No conversations found</p>
              </div>
            ) : filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => { setActiveChat(conv.id); setMobileChatOpen(true); }}
                className={cn(
                  "chat-conv-item",
                  activeChatId === conv.id && "chat-conv-item--active"
                )}
              >
                <div className="chat-conv-item__avatar-wrap">
                  <Avatar className={cn(
                    "chat-conv-item__avatar",
                    activeChatId === conv.id ? "border-white/30" : "border-zinc-200"
                  )}>
                    {(conv.contact_avatar || conv.contact_avatar_url || conv.avatar || conv.avatar_url) && (
                      <AvatarImage src={conv.contact_avatar || conv.contact_avatar_url || conv.avatar || conv.avatar_url} />
                    )}
                    <AvatarFallback className={cn(
                      "text-xs font-bold",
                      activeChatId === conv.id 
                        ? "bg-white/20 text-white" 
                        : "bg-gradient-to-br from-primary/10 to-primary/5 text-primary"
                    )}>
                      {conv.contact_name?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>
                  {conv.is_ai_mode && (
                    <span className="chat-conv-item__ai-badge">
                      <Zap className="h-2 w-2 text-white fill-current" />
                    </span>
                  )}
                </div>

                <div className="chat-conv-item__content">
                  <div className="chat-conv-item__top">
                    <span className="chat-conv-item__name">{conv.contact_name}</span>
                    <span className={cn(
                      "chat-conv-item__time",
                      activeChatId === conv.id ? "text-white/60" : "text-zinc-400"
                    )}>
                      {new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className={cn(
                    "chat-conv-item__preview",
                    activeChatId === conv.id ? "text-white/70" : "text-zinc-500"
                  )}>
                    {conv.last_message || 'New conversation'}
                  </p>
                </div>

                {/* AI Toggle */}
                <div className="chat-conv-item__toggle" onClick={(e) => e.stopPropagation()}>
                  <Switch 
                    checked={conv.is_ai_mode} 
                    onCheckedChange={(val) => toggleUserAi(val, conv.id)}
                    className="scale-[0.6] cursor-pointer data-[state=checked]:bg-white data-[state=unchecked]:bg-zinc-300"
                  />
                  {remainingTimes[conv.id] && (
                    <span className={cn(
                      "chat-conv-item__timer",
                      activeChatId === conv.id ? "bg-white/20 text-white" : "bg-amber-100 text-amber-700"
                    )}>
                      {remainingTimes[conv.id]}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </aside>

      {/* Main Chat Area */}
      <main className={cn(
        "chat-main",
        isMobileChatOpen && activeChatId ? "chat-main--visible-mobile" : "chat-main--hidden-mobile"
      )}>
        {activeChatId && activeConversation ? (
          <>
            {/* Chat Header */}
            <header className="chat-header">
              <div className="chat-header__left">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="chat-header__back-btn"
                  onClick={() => setMobileChatOpen(false)}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <div className="chat-header__avatar-wrap">
                  <Avatar className="chat-header__avatar">
                    {(activeConversation.contact_avatar || activeConversation.contact_avatar_url || activeConversation.avatar || activeConversation.avatar_url) && (
                      <AvatarImage src={activeConversation.contact_avatar || activeConversation.contact_avatar_url || activeConversation.avatar || activeConversation.avatar_url} />
                    )}
                    <AvatarFallback className="bg-gradient-to-br from-primary/15 to-primary/5 text-primary text-sm font-bold">
                      {activeConversation.contact_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="chat-header__status-dot" />
                </div>
                <div className="chat-header__info">
                  <h3 className="chat-header__name">{activeConversation.contact_name}</h3>
                  <div className="chat-header__status">
                    <Circle className="h-2 w-2 fill-emerald-500 text-emerald-500" />
                    <span>Active now</span>
                  </div>
                </div>
              </div>

              <div className="chat-header__controls">
                {/* Timer Control */}
                <div className="chat-header__timer-control">
                  <Clock className="h-3 w-3 text-zinc-400 shrink-0" />
                  <Input 
                    type="number" 
                    min="1"
                    placeholder="Min" 
                    className="chat-header__timer-input"
                    value={timerInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || parseInt(val) > 0) setTimerInput(val);
                    }}
                  />
                  <Button 
                    size="icon" 
                    className="chat-header__timer-btn"
                    onClick={toggleHumanWithTimer}
                  >
                    <Zap className="h-3 w-3 text-white fill-current" />
                  </Button>
                </div>

                {/* AI Mode Toggle */}
                <div className={cn(
                  "chat-header__ai-toggle",
                  activeConversation.is_ai_mode 
                    ? "chat-header__ai-toggle--active" 
                    : "chat-header__ai-toggle--inactive"
                )}>
                  {activeConversation.is_ai_mode ? (
                    <div className="chat-header__ai-label chat-header__ai-label--active">
                      <Sparkles className="h-3 w-3" />
                      <span>AI</span>
                    </div>
                  ) : (
                    <div className="chat-header__ai-label chat-header__ai-label--inactive">
                      <User className="h-3 w-3" />
                      <span>Manual</span>
                    </div>
                  )}
                  <Switch 
                    checked={activeConversation.is_ai_mode} 
                    onCheckedChange={(val) => toggleUserAi(val, activeChatId!)}
                    className="scale-[0.7] cursor-pointer data-[state=checked]:bg-primary"
                  />
                </div>

                {remainingTimes[activeChatId!] && (
                  <Badge className="chat-header__timer-badge">
                    <Clock className="h-3 w-3 mr-1" />
                    {remainingTimes[activeChatId!]}
                  </Badge>
                )}
              </div>
            </header>

            {/* Messages Area */}
            <div 
              ref={messageContainerRef}
              className="chat-messages"
            >
              <div className="chat-messages__inner">
                {hasMoreMessages && (
                  <div className="flex justify-center my-4 w-full">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-full bg-white text-zinc-500 hover:text-primary hover:bg-zinc-50 border-zinc-200 shadow-sm text-xs font-bold transition-all px-4"
                      onClick={() => fetchMessages(activeChatId!, messagesPage + 1)}
                      disabled={isLoadingMore}
                    >
                      {isLoadingMore ? "Loading..." : "Load previous messages"}
                    </Button>
                  </div>
                )}
                {messages.length === 0 && (
                  <div className="chat-messages__empty">
                    <Sparkles className="h-5 w-5 text-primary/40" />
                    <p>Start of conversation</p>
                  </div>
                )}
                {messages.map((row) => {
                  let msgObj = row.message;
                  if (typeof msgObj === 'string') {
                    try { msgObj = JSON.parse(msgObj); } catch(e) {}
                  }
                  
                  const isHuman = msgObj?.type === 'human';
                  // For human messages: prefer customer_message field, fallback to content
                  let content = isHuman
                    ? (msgObj?.customer_message || msgObj?.content || "")
                    : (msgObj?.content || "");
                  
                  if (typeof content === 'string' && content.includes('customer_message:')) {
                    const match = content.match(/customer_message:\s*(.*?)(?:\n|$)/i);
                    if (match && match[1]) {
                      content = match[1].trim();
                    }
                  }
                  
                  return (
                    <div key={row.id} className={cn("chat-bubble-row", isHuman ? "chat-bubble-row--left" : "chat-bubble-row--right")}>
                      <div className={cn("chat-bubble-wrap", isHuman ? "items-start" : "items-end")}>
                        <div className={cn(
                          "chat-bubble",
                          isHuman ? "chat-bubble--incoming" : "chat-bubble--outgoing"
                        )}>
                          {content}
                        </div>
                        <div className={cn("chat-bubble__meta", isHuman ? "chat-bubble__meta--left" : "chat-bubble__meta--right")}>
                          {!isHuman && (
                            <span className={cn(
                              "chat-bubble__badge",
                              msgObj?.replied_by === 'human_agent' ? "chat-bubble__badge--human" : "chat-bubble__badge--ai"
                            )}>
                              {msgObj?.replied_by === 'human_agent' ? 'Agent' : 'AI'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={scrollRef} className="h-1" />
              </div>
            </div>

            {/* Message Input Footer */}
            <footer className="chat-footer">
              <div className="chat-footer__inner">
                {activeConversation.is_ai_mode && (
                  <div className="chat-footer__ai-notice">
                    <div className="chat-footer__ai-notice-icon">
                      <Sparkles className="h-3.5 w-3.5" />
                    </div>
                    <span>AI is handling this conversation. Switch to manual mode to reply.</span>
                  </div>
                )}
                <div className={cn("chat-footer__input-row", activeConversation.is_ai_mode && "chat-footer__input-row--disabled")}>
                  <div className="chat-footer__actions">
                    <Button variant="ghost" size="icon" className="chat-footer__action-btn">
                      <Paperclip className="h-4.5 w-4.5"/>
                    </Button>
                    <Button variant="ghost" size="icon" className="chat-footer__action-btn">
                      <Smile className="h-4.5 w-4.5"/>
                    </Button>
                  </div>
                  <div className="chat-footer__input-wrap">
                    <Input 
                      placeholder="Write a message..." 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !activeConversation.is_ai_mode && handleSend()}
                      disabled={activeConversation.is_ai_mode}
                      className="chat-footer__input"
                    />
                  </div>
                  <Button 
                    onClick={handleSend}
                    disabled={activeConversation.is_ai_mode || !input.trim()}
                    className="chat-footer__send-btn"
                    size="icon"
                  >
                    <Send className="h-4.5 w-4.5" />
                  </Button>
                </div>
              </div>
            </footer>
          </>
        ) : (
          /* Empty State */
          <div className="chat-empty-state">
            <div className="chat-empty-state__visual">
              <div className="chat-empty-state__circle chat-empty-state__circle--outer" />
              <div className="chat-empty-state__circle chat-empty-state__circle--inner" />
              <div className="chat-empty-state__icon">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h3 className="chat-empty-state__title">Select a Conversation</h3>
            <p className="chat-empty-state__desc">
              Choose a conversation from the sidebar to start messaging
            </p>
            <div className="chat-empty-state__tag">
              <Sparkles className="h-3 w-3" />
              <span>Secure AI Gateway</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
