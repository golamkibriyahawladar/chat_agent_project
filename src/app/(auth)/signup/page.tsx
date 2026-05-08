"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'client' as const, // Default role for new signups
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 font-sans relative overflow-hidden">
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20 text-white group hover:scale-110 transition-transform">
            <MessageSquare className="h-7 w-7" />
          </div>
          <h2 className="mt-6 text-3xl font-black tracking-tight text-zinc-900 leading-none">
            Create an account
          </h2>
          <p className="mt-4 text-sm text-zinc-500 font-medium">
            Get started with your AI Chat platform today
          </p>
        </div>

        <Card className="border border-zinc-200 shadow-xl rounded-2xl bg-white overflow-hidden">
          <form onSubmit={handleSignup}>
            <CardHeader className="bg-zinc-50/50 border-b border-zinc-100">
              <CardTitle className="text-zinc-900 text-xl font-bold">Sign Up</CardTitle>
              <CardDescription className="text-zinc-500 font-medium">
                Join our community and scale your customer support
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-600 font-bold">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-zinc-700 font-bold text-xs uppercase tracking-wider">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="h-11 bg-zinc-50 border-zinc-200 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-primary transition-all font-sans"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-700 font-bold text-xs uppercase tracking-wider">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 bg-zinc-50 border-zinc-200 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-primary transition-all font-sans"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" title="password_label" className="text-zinc-700 font-bold text-xs uppercase tracking-wider">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 bg-zinc-50 border-zinc-200 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-primary transition-all font-sans"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pb-8">
              <Button type="submit" className="w-full h-11 text-base font-bold bg-primary hover:opacity-90 text-white rounded-xl shadow-sm border-0 transition-all font-sans" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </Button>
              <div className="text-center text-sm">
                <span className="text-zinc-500 font-medium">Already have an account? </span>
                <Button variant="link" className="p-0 h-auto font-bold text-primary hover:underline transition-all" onClick={() => router.push("/login")}>
                  Log in
                </Button>
              </div>
            </CardFooter>
          </form>
        </Card>

        <div className="text-center">
            <p className="text-[10px] text-zinc-400 uppercase tracking-[0.3em] font-black">Secure Onboarding Portal</p>
        </div>
      </div>
    </div>
  );
}
