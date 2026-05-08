"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
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
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 font-sans relative overflow-hidden">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20 text-white">
            <MessageSquare className="h-7 w-7" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-zinc-900">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-zinc-500 font-medium">
            Login to your AI Chat Agent dashboard
          </p>
        </div>

        <Card className="border border-zinc-200 shadow-xl rounded-2xl bg-white overflow-hidden">
          <form onSubmit={handleLogin}>
            <CardHeader className="bg-zinc-50/50 border-b border-zinc-100">
              <CardTitle className="text-zinc-900 text-xl font-bold">Sign In</CardTitle>
              <CardDescription className="text-zinc-500 font-medium">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600 font-bold">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-700 font-bold text-xs uppercase tracking-wider">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 bg-zinc-50 border-zinc-200 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-primary transition-all"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" title="password_label" className="text-zinc-700 font-bold text-xs uppercase tracking-wider">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 bg-zinc-50 border-zinc-200 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-primary transition-all"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pb-8">
              <Button type="submit" className="w-full h-11 text-base font-bold bg-primary hover:opacity-90 text-white rounded-xl shadow-sm border-0 transition-all" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
              <div className="text-center text-sm">
                <span className="text-zinc-500 font-medium">Don't have an account? </span>
                <Button variant="link" className="p-0 h-auto font-bold text-primary hover:underline transition-all" onClick={() => router.push("/signup")}>
                  Sign up
                </Button>
              </div>
            </CardFooter>
          </form>
        </Card>

        <div className="text-center">
            <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-black">Powered by AiChat Engine</p>
        </div>
      </div>
    </div>
  );
}
