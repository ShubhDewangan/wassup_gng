/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { toast } from "sonner";
import { apiFetch } from "@/src/lib/fetcher";

// shadcn UI Components
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5">
      <path fill="#4285F4" d="M23.52 12.27c0-.82-.07-1.6-.2-2.36H12v4.47h6.47a5.53 5.53 0 01-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.74z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-3c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.27v3.11A11.99 11.99 0 0012 24z" />
      <path fill="#FBBC05" d="M5.27 14.3a7.2 7.2 0 010-4.6V6.59H1.27a12 12 0 000 10.82l4-3.11z" />
      <path fill="#EA4335" d="M12 4.75c1.76 0 3.35.6 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A11.99 11.99 0 001.27 6.59l4 3.11C6.22 6.86 8.87 4.75 12 4.75z" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        await apiFetch("/api/auth/google-auth", {
          method: "POST",
          body: JSON.stringify({ accessToken: tokenResponse.access_token }),
        });
        toast.success("Logged in successfully with Google!");
        router.push("/chat");
      } catch (error: any) {
        toast.error(error.message || "Google login failed");
      }
    },
    onError: () => {
      toast.error("Google authentication failed");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      toast.success("Logged in successfully!");
      router.push("/chat");
    } catch (error: any) {
      toast.error(error.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0A0A0F] flex items-center justify-center px-6">
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-orange-500 via-red-500 to-transparent opacity-25 blur-[110px]" />

      <Card className="relative z-10 w-full max-w-sm rounded-3xl border-[#26262E] bg-[#16161C]/90 backdrop-blur-xl p-2 shadow-2xl shadow-black/50 text-[#F5F1EA]">
        <CardHeader className="space-y-1.5 pb-4">
          <CardTitle className="text-2xl font-extrabold tracking-tight text-[#F5F1EA]">
            Welcome back
          </CardTitle>
          <CardDescription className="text-sm text-[#8A8A93]">
            Log in to keep the conversation going.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Button
            onClick={() => googleLogin()}
            type="button"
            variant="outline"
            className="w-full gap-3 rounded-full border-[#26262E] bg-[#0F0F14] hover:bg-[#1D1D24] text-[#F5F1EA] py-5 font-medium"
          >
            <GoogleIcon />
            Continue with Google
          </Button>

          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#26262E]" />
            <span className="text-xs text-[#8A8A93]">or</span>
            <div className="h-px flex-1 bg-[#26262E]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs text-[#8A8A93]">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A8A93]" />
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-full border-[#26262E] bg-[#0F0F14] pl-11 text-sm text-[#F5F1EA] placeholder:text-[#8A8A93] focus-visible:ring-orange-500 py-5"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs text-[#8A8A93]">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A8A93]" />
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-full border-[#26262E] bg-[#0F0F14] pl-11 text-sm text-[#F5F1EA] placeholder:text-[#8A8A93] focus-visible:ring-orange-500 py-5"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-gradient-to-r from-orange-500 to-red-500 py-5 font-semibold text-white shadow-lg shadow-orange-900/30 transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Log in
                  <ArrowRight className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center pt-2">
          <p className="text-center text-sm text-[#8A8A93]">
            New here?{" "}
            <Link href="/register" className="font-medium text-orange-400 hover:text-orange-300">
              Create an account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}