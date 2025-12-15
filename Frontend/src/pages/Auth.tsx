import React, { useState } from "react";
import { replace, useNavigate } from "react-router-dom";
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
        navigate("/dashboard", { replace: true });
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
    // Updated BG to Landing Page Deep Blue #020817
    <div className="min-h-screen bg-[#020817] text-[#e6eef6] flex items-center justify-center px-4 py-10 relative overflow-hidden font-sans">
      
      {/* Landing Page Style Background Effects */}
      <div className="pointer-events-none absolute inset-0">
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29371a_1px,transparent_1px),linear-gradient(to_bottom,#1f29371a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        {/* Glow Effects */}
        <div className="absolute -top-40 -left-32 h-64 w-64 rounded-full bg-[#3b82f6]/20 blur-3xl opacity-50" />
        <div className="absolute -bottom-40 -right-10 h-72 w-72 rounded-full bg-[#0ea5e9]/20 blur-3xl opacity-50" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-4xl z-10"
      >
        {/* Updated Card Style to match NodeInspector (#0b1017 bg, #1e293b border) */}
        <Card className="bg-[#0b1017]/90 backdrop-blur-sm border border-[#1e293b] rounded-2xl shadow-[0_0_0_1px_rgba(30,41,59,0.5),0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1.1fr]">
        
            {/* Left Side Visual */}
            <div className="hidden md:flex flex-col justify-between bg-[#020617] border-r border-[#1e293b] px-8 py-8 relative">
              {/* Inner Grid for visual interest */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-50 pointer-events-none" />

              <div className="relative z-10 flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-[#1e293b] border border-[#334155] flex items-center justify-center shadow-inner">
                    <span className="h-3 w-3 rounded-full bg-[#3b82f6] shadow-[0_0_10px_#3b82f6]" />
                  </div>
                  <span className="text-sm font-semibold tracking-tight text-[#e5e7eb]">
                    Flowboard
                  </span>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#64748b] bg-[#1e293b]/50 px-2 py-1 rounded">
                  Auth
                </span>
              </div>

              <div className="relative z-10 space-y-3 text-[#94a3b8]">
                <h2 className="text-2xl font-bold leading-tight text-white tracking-tight">
                  {isSignIn ? "Welcome back" : "Create your workspace"}
                </h2>
                <p className="text-sm leading-relaxed max-w-xs text-[#94a3b8]">
                  {isSignIn
                    ? "Log in to keep building and running your workflows in the same clean midnight canvas."
                    : "Spin up an account and start wiring your APIs together in minutes."}
                </p>
              </div>

              <div className="relative z-10 mt-8 rounded-xl border border-[#1e293b] bg-[#020817]/80 px-5 py-4 shadow-lg">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-semibold text-[#64748b] mb-3">
                  <span>System Status</span>
                  <span className="text-[#10b981] flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]"></span>
                    </span>
                    Operational
                  </span>
                </div>
                <svg
                  viewBox="0 0 260 60"
                  className="w-full h-16 text-[#3b82f6] drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                >
                  <defs>
                    <linearGradient
                      id="flowLine"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                    >
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="50%" stopColor="#3b82f6" />
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
                  />
                  {[10, 95, 180, 250].map((x, idx) => (
                    <g key={x}>
                      <circle
                        cx={x}
                        cy={idx === 1 ? 20 : idx === 2 ? 40 : 30}
                        r={4}
                        fill="#020617"
                        stroke={idx === 0 ? "#10b981" : "#3b82f6"}
                        strokeWidth="1.5"
                      />
                    </g>
                  ))}
                </svg>
              </div>
            </div>

            {/* Right Side Form */}
            <CardContent className="px-6 py-8 md:px-10 md:py-12 bg-[#0b1017]">
              <CardHeader className="p-0 mb-8">
                <CardTitle className="text-xl font-semibold text-white">
                  {isSignIn ? "Sign in" : "Create account"}
                </CardTitle>
                <CardDescription className="mt-2 text-sm text-[#94a3b8]">
                  {isSignIn
                    ? "Enter your credentials to access the dashboard."
                    : "Set up a login to save your workflows."}
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="email"
                    className="text-[11px] uppercase tracking-wider font-semibold text-[#64748b]"
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
                    className="h-11 bg-[#0f172a] border-[#1e293b] text-sm text-slate-200 placeholder:text-slate-600 focus-visible:ring-blue-500/50 focus-visible:border-blue-500 transition-all rounded-lg"
                  />
                </div>

                <div className="space-y-1.5 relative">
                  <Label
                    htmlFor="password"
                    className="text-[11px] uppercase tracking-wider font-semibold text-[#64748b]"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      aria-label="Password"
                      className="h-11 bg-[#0f172a] border-[#1e293b] text-sm text-slate-200 placeholder:text-slate-600 focus-visible:ring-blue-500/50 focus-visible:border-blue-500 transition-all rounded-lg pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {!isSignIn && (
                   <div className="text-[11px] text-[#64748b] px-1">
                    Password must be at least 8 characters long.
                  </div>
                )}

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className={cn(
                      "w-full h-11 rounded-lg text-sm font-semibold shadow-[0_0_15px_-3px_rgba(59,130,246,0.4)] transition-all",
                      loading
                        ? "opacity-70 cursor-not-allowed bg-blue-600"
                        : "bg-blue-600 hover:bg-blue-500 text-white hover:shadow-[0_0_20px_-3px_rgba(59,130,246,0.6)]"
                    )}
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {isSignIn ? "Authenticating..." : "Creating Account..."}
                      </span>
                    ) : (
                      <span>{isSignIn ? "Sign In" : "Create Account"}</span>
                    )}
                  </Button>
                </div>

                <div className="flex items-center justify-between mt-6 text-xs text-[#94a3b8]">
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="hover:text-white transition-colors"
                  >
                    {isSignIn
                      ? "Don't have an account? Sign up"
                      : "Already have an account? Log in"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      toast("Password reset / magic link coming soon")
                    }
                    className="hover:text-white transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              </form>
            </CardContent>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}