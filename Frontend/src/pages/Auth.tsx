import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function Auth() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const toggleMode = () => {
    setIsSignIn((s) => !s);
    setEmail("");
    setPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Please fill all fields");

    setLoading(true);
    try {
      const url = `http://localhost:3000/api/v1/user/${
        isSignIn ? "signin" : "signup"
      }`;
      const { data, status } = await axios.post(url, {
        username: email,
        password,
      });

      if (status === 200 && data?.user && data?.token) {
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        toast.success(`${isSignIn ? "Signed in" : "Signed up"} successfully`);
        navigate("/dashboard");
      } else {
        toast.error(data?.message || "Invalid credentials");
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Unable to reach the server";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050b11] text-[#e6eef6] flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-32 h-64 w-64 rounded-full bg-[#1d4ed8]/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-10 h-72 w-72 rounded-full bg-[#0ea5e9]/10 blur-3xl" />
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_#111827_0,_#020617_55%,_#020617_100%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-4xl"
      >
        <Card className="bg-[#050b11]/90 border border-[#1f2933] rounded-2xl shadow-[0_0_0_1px_rgba(15,23,42,0.8),0_28px_80px_rgba(0,0,0,0.75)] overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1.1fr]">
        
            <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-[#020617] via-[#020617] to-[#020617] border-r border-[#1f2933] px-8 py-8 relative">
         
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-[#1e293b] flex items-center justify-center">
                    <span className="h-3 w-3 rounded-full bg-[#22c55e]" />
                  </div>
                  <span className="text-sm font-medium tracking-tight text-[#e5e7eb]">
                    Flowboard
                  </span>
                </div>
                <span className="text-[11px] uppercase tracking-[0.18em] text-[#6b7280]">
                  Auth
                </span>
              </div>


              <div className="space-y-3">
                <h2 className="text-2xl font-semibold leading-tight">
                  {isSignIn ? "Welcome back" : "Create your workspace"}
                </h2>
                <p className="text-xs text-[#9ca3af] max-w-xs">
                  {isSignIn
                    ? "Log in to keep building and running your workflows in the same clean midnight canvas."
                    : "Spin up an account and start wiring your APIs together in minutes."}
                </p>
              </div>

    
              <div className="mt-8 rounded-xl border border-[#1f2933] bg-[#020617] px-5 py-4">
                <div className="flex items-center justify-between text-[11px] text-[#9ca3af] mb-3">
                  <span>Today&apos;s flow</span>
                  <span className="text-[#60a5fa]">Status · Ready</span>
                </div>
                <svg
                  viewBox="0 0 260 60"
                  className="w-full h-16 text-[#1d4ed8]"
                >
                  <defs>
                    <linearGradient
                      id="flowLine"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                    >
                      <stop offset="0%" stopColor="#22c55e" />
                      <stop offset="50%" stopColor="#38bdf8" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M10 30 C60 5, 120 55, 180 25 S250 40, 250 30"
                    fill="none"
                    stroke="url(#flowLine)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.9"
                  />
                  {[10, 95, 180, 250].map((x, idx) => (
                    <g key={x}>
                      <circle
                        cx={x}
                        cy={idx === 1 ? 20 : idx === 2 ? 40 : 30}
                        r={5}
                        fill="#020617"
                        stroke="#1d4ed8"
                        strokeWidth="1.5"
                      />
                      <circle
                        cx={x}
                        cy={idx === 1 ? 20 : idx === 2 ? 40 : 30}
                        r={2}
                        fill="#e5e7eb"
                      />
                    </g>
                  ))}
                </svg>
              </div>
            </div>

        
            <CardContent className="px-6 py-7 md:px-8 md:py-9 bg-[#020617]/90">
              <CardHeader className="p-0 mb-5">
                <CardTitle className="text-xl font-semibold text-[#e5e7eb]">
                  {isSignIn ? "Sign in" : "Create account"}
                </CardTitle>
                <CardDescription className="mt-1 text-xs text-[#9ca3af]">
                  {isSignIn
                    ? "Use your credentials to access the dashboard."
                    : "Set up a login so you can return to your flows later."}
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label
                    htmlFor="email"
                    className="text-[11px] uppercase tracking-[0.13em] text-[#9ca3af]"
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    aria-label="Email"
                    className="mt-1 w-full h-10 text-white bg-[#020617] border border-[#1f2933] rounded-md px-3 text-sm placeholder:text-[#4b5563] focus-visible:ring-1 focus-visible:ring-[#38bdf8] focus-visible:border-[#38bdf8]"
                  />
                </div>

                <div className="relative">
                  <Label
                    htmlFor="password"
                    className="text-[11px] uppercase tracking-[0.13em] text-[#9ca3af]"
                  >
                    Password
                  </Label>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    aria-label="Password"
                    className="mt-1 w-full h-10 text-white bg-[#020617] border border-[#1f2933] rounded-md pr-11 px-3 text-sm placeholder:text-[#4b5563] focus-visible:ring-1 focus-visible:ring-[#38bdf8] focus-visible:border-[#38bdf8]"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-2 top-[26px] inline-flex items-center justify-center rounded-md px-2 py-1 text-xs text-[#9ca3af] hover:bg-[#020617] hover:text-[#e5e7eb]"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <div className="text-[11px] text-[#6b7280]">
                  Tip: use at least 8 characters and mix letters, numbers, and
                  symbols.
                </div>

                <div className="flex flex-col gap-3 mt-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className={cn(
                      "w-full h-10 rounded-md text-sm font-medium shadow-sm transition",
                      loading
                        ? "opacity-70 cursor-not-allowed bg-[#1d4ed8]"
                        : "bg-[#2563eb] hover:bg-[#1d4ed8] text-white"
                    )}
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {isSignIn ? "Signing in…" : "Signing up…"}
                      </span>
                    ) : (
                      <span>{isSignIn ? "Sign in" : "Create account"}</span>
                    )}
                  </Button>

                  <div className="flex items-center justify-between text-xs text-[#9ca3af]">
                    <button
                      type="button"
                      onClick={toggleMode}
                      className="hover:text-[#e5e7eb] hover:underline underline-offset-4"
                      aria-pressed={!isSignIn}
                    >
                      {isSignIn
                        ? "Don't have an account? Create one"
                        : "Already have an account? Sign in"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        toast("Password reset / magic link coming soon")
                      }
                      className="hover:text-[#e5e7eb] hover:underline underline-offset-4"
                    >
                      Forgot?
                    </button>
                  </div>
                </div>
              </form>
            </CardContent>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
