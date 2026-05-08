import { Button } from "@/components/ui/button";
import { MessageSquare, Rocket, Zap, Shield, ChevronRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white font-sans selection:bg-primary/10 relative overflow-hidden">
      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 border-b border-zinc-100 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary flex items-center justify-center rounded-xl shadow-lg shadow-primary/20 text-white">
              <MessageSquare className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-900 leading-none">AiChat.</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-zinc-500">
            <Link href="#features" className="hover:text-zinc-900 transition-colors">Features</Link>
            <Link href="#pricing" className="hover:text-zinc-900 transition-colors">Pricing</Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="rounded-xl text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 font-bold">Log In</Button>
              </Link>
            </div>
            <Link href="/signup" className="hidden sm:block">
              <Button className="rounded-xl bg-primary shadow-lg shadow-primary/20 text-white border-0 hover:opacity-90 px-4 sm:px-6 font-bold transition-all text-sm sm:text-base">
                Get Started
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger render={
                  <Button variant="ghost" size="icon" className="rounded-xl">
                    <Menu className="h-6 w-6" />
                  </Button>
                } />
                <SheetContent side="right" className="w-full sm:w-[400px] p-0 border-l border-zinc-100 bg-white">
                  <div className="flex flex-col h-full">
                    <div className="p-8 pb-4">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="h-10 w-10 bg-primary flex items-center justify-center rounded-xl shadow-lg shadow-primary/20 text-white text-white">
                          <MessageSquare className="h-6 w-6" />
                        </div>
                        <span className="text-xl font-bold text-zinc-900">AiChat.</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-6 p-8 pt-0">
                       <SheetTitle className="sr-only font-bold">Navigation Menu</SheetTitle>
                       <Link href="#features" className="text-2xl font-bold text-zinc-900 hover:text-primary">Features</Link>
                       <Link href="#pricing" className="text-2xl font-bold text-zinc-900 hover:text-primary">Pricing</Link>
                       <div className="h-px bg-zinc-100 my-2" />
                       <Link href="/login" className="text-xl font-bold text-zinc-500">Log In</Link>
                       <Link href="/signup">
                         <Button className="w-full h-14 rounded-xl bg-primary shadow-lg shadow-primary/20 text-white text-lg font-bold border-0">
                           Get Started Free
                         </Button>
                       </Link>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-32 sm:pt-40 pb-20 relative overflow-hidden">
        {/* Soft Background Detail */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-[100%] blur-[120px] -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary font-bold text-[10px] sm:text-[11px] mb-8 border border-primary/10 uppercase tracking-widest">
            <Zap className="h-3 w-3 fill-current" />
            <span>Next generation customer support</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-zinc-900 max-w-4xl mx-auto mb-8 leading-[1.1]">
            Automate your service with <span className="text-primary">AI Agents</span>
          </h1>
          <p className="text-lg sm:text-xl text-zinc-500 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
            Build, train, and deploy intelligent AI agents that handle customer conversations 24/7. Seamlessly scale your support operations with ease.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto rounded-xl h-14 px-10 text-lg font-black bg-primary shadow-xl shadow-primary/20 border-0 hover:opacity-90 transition-all text-white">
                Start Free Trial
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-10 rounded-xl border border-zinc-200 text-zinc-600 text-lg font-bold hover:bg-zinc-50 transition-all">
              Watch Demo
            </Button>
          </div>

          {/* Simple Features Section */}
          <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 pt-24 sm:pt-32 w-full text-left">
            {[
              { icon: Zap, title: "Ultra Fast AI", desc: "Responses generated in milliseconds, providing a human-like experience for your customers instantaneously." },
              { icon: Shield, title: "Secure Data", desc: "Enterprise-grade security ensuring your company and customer data is always isolated and protected." },
              { icon: Rocket, title: "Scale Effortlessly", desc: "Extend your agents with custom automation and workflows to handle thousands of users daily." }
            ].map((feature, i) => (
              <div key={i} className="p-8 bg-zinc-50 border border-zinc-100 rounded-3xl space-y-4 hover:border-zinc-200 transition-all duration-300 group">
                <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm border border-zinc-100 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900">{feature.title}</h3>
                <p className="text-sm sm:text-base text-zinc-500 font-medium leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-12 border-t border-zinc-50 text-center text-zinc-400 text-xs sm:text-sm font-medium">
        <p>© 2026 AiChat Platform. Modern automation for progressive businesses.</p>
      </footer>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
