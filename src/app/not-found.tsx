"use client";

import Link from "next/link";
import { Bot, ArrowLeft, Ghost } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function NotFound() {
  useEffect(() => {
    const playBotSound = () => {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const playNote = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0.1, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };

      playNote(880, 0, 0.1);    // Beep
      playNote(1320, 0.1, 0.2); // Boop
    };

    playBotSound();
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center overflow-hidden font-sans">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-[100%] blur-[100px] -z-10" />
      
      <div className="relative z-10 space-y-8 animate-in fade-in zoom-in duration-700">
        <div className="relative inline-block">
          {/* Cute Floating Bot */}
          <div className="bg-white border border-zinc-100 p-8 rounded-3xl shadow-2xl animate-bounce duration-[2000ms]">
            <Bot className="h-20 w-20 text-primary" />
            <div className="absolute -top-4 -right-4 bg-zinc-900 text-white p-2.5 rounded-2xl shadow-xl animate-pulse ring-4 ring-white">
              <Ghost className="h-6 w-6" />
            </div>
          </div>
          
          {/* Shadow */}
          <div className="h-2 w-20 bg-zinc-100 rounded-full blur-md mx-auto mt-8 animate-pulse" />
        </div>

        <div className="space-y-4 max-w-sm">
          <h1 className="text-8xl font-black tracking-tighter text-zinc-900 leading-none">
            404
          </h1>
          <h2 className="text-3xl font-bold text-zinc-900">
            Path not found, human!
          </h2>
          <p className="text-zinc-500 font-medium text-lg leading-relaxed">
            The AI agents are scratching their metal heads. The transmission path you're looking for doesn't exist.
          </p>
        </div>

        <div className="pt-4">
          <Link href="/dashboard">
            <Button className="rounded-xl h-14 px-10 bg-primary text-white hover:opacity-90 hover:scale-105 transition-all shadow-lg shadow-primary/20 font-bold group border-0 text-lg">
              <ArrowLeft className="mr-3 h-6 w-6 group-hover:-translate-x-1 transition-transform" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="mt-16 text-[10px] uppercase tracking-[0.4em] font-black text-zinc-300 animate-pulse">
        System Status: Disoriented
      </div>
    </div>
  );
}
