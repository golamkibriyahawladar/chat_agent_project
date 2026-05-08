"use client";

import Link from "next/link";
import { Lock, Bot, ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function AccessDenied() {
  useEffect(() => {
    const playBotSound = () => {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const playNote = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0.05, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };

      // Alert triple beep!
      playNote(440, 0, 0.05);
      playNote(440, 0.1, 0.05);
      playNote(440, 0.2, 0.05);
    };

    playBotSound();
  }, []);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700 font-sans">
      <div className="relative mb-12">
        {/* Animated Background Rings */}
        <div className="absolute inset-0 bg-primary/5 rounded-full blur-[80px] animate-pulse scale-125" />
        
        {/* Robot Guard Animation */}
        <div className="relative bg-white p-12 rounded-3xl shadow-xl border border-zinc-100 animate-bounce duration-[3000ms]">
          <div className="relative">
            <Bot className="h-24 w-24 text-primary" />
            <div className="absolute top-0 right-0">
               <div className="bg-red-500 p-2 rounded-full shadow-lg ring-4 ring-white animate-pulse">
                <Lock className="h-6 w-6 text-white" />
               </div>
            </div>
          </div>
          
          {/* Scanning Eye Effect */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-12 h-1 bg-red-400/30 rounded-full blur-sm animate-[ping_2s_infinite]" />
        </div>
      </div>

      <div className="space-y-6 max-w-lg relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-full border border-red-100 mb-4 animate-bounce delay-500 font-black text-[10px] uppercase tracking-widest">
          <ShieldAlert className="h-4 w-4" />
          <span>Access Restricted</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900">
          Beep Boop!<br />Not for You-p!
        </h1>
        
        <p className="text-zinc-500 text-lg font-bold leading-relaxed">
          The transmission frequency for this page is restricted for your role. 
          The guard robots are very strict about who gets to see the secret chats!
        </p>

        <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full h-14 px-8 border-zinc-200 text-zinc-600 font-bold hover:bg-zinc-50 transition-all rounded-xl">
              Go to Overview
            </Button>
          </Link>
          <Link href="/dashboard/agents" className="w-full sm:w-auto">
            <Button className="w-full h-14 px-8 bg-primary text-white font-black shadow-lg shadow-primary/20 hover:opacity-90 transition-all group border-0 rounded-xl">
              <ArrowLeft className="mr-3 h-5 w-5 group-hover:-translate-x-1 transition-all" />
              Head Back
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-16 flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] font-sans">
        <div className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
        Security Protocol: Active
      </div>
    </div>
  );
}
