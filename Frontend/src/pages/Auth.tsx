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
import { cn } from "@/lib/utils"; // optional classname helper in many shadcn setups
import { Eye, EyeOff, Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { motion } from "framer-motion";

// Updated: wider layout, stable inputs (no layout shift), black & white theme with teal accent
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
    // Page background is black, card is white for high contrast. Accent color: teal
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32 }}
        className="w-full max-w-3xl"
      >
        <Card className="overflow-hidden rounded-2xl shadow-2xl bg-white text-black">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left: Illustration / brand - dark panel to contrast with white card */}
            <div className="hidden md:flex flex-col items-center justify-center gap-4 bg-black/85 backdrop-blur-md border border-white/10 text-white p-10 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-extrabold">
                {isSignIn ? "Welcome back" : "Welcome"}
              </h2>
              <p className="text-sm opacity-90 max-w-[260px] text-center">
                {isSignIn
                  ? "Sign in to continue to your dashboard"
                  : "Create an account to get started"}
              </p>

              <div className="w-36 h-36 rounded-lg bg-white/5 flex items-center justify-center">
                {/* subtle brand mark in teal */}
                <svg
                  width="56"
                  height="56"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M3 12h18"
                    stroke="#14B8A6"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 3v18"
                    stroke="#14B8A6"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* Right: Form */}
            <CardContent className="p-8 md:p-10">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-2xl font-bold">
                  {isSignIn ? "Sign in" : "Create account"}
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {isSignIn
                    ? "Enter your credentials to continue"
                    : "Choose a secure password"}
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="">
                  <Label htmlFor="email">Email</Label>
                  {/* Stable input: same border/height on focus to avoid layout shift */}
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    aria-label="Email"
                    className="mt-1  w-full box-border h-11 border border-neutral-200 rounded-md px-3 py-2 placeholder:opacity-60 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                <div className="relative ">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    aria-label="Password"
                    className="mt-1 w-full box-border  h-11 border border-neutral-200 rounded-md pr-12 px-3 py-2 placeholder:opacity-60 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-2 top-1/2  inline-flex items-center justify-center rounded px-2 py-1 text-sm text-neutral-600 hover:bg-neutral-100"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* lightweight password hint / strength indicator */}

                <div className="text-xs text-neutral-600">
                  Tip: Use at least 8 characters — mix letters and numbers.
                </div>

                <div className="flex flex-col gap-3">
                  {/* Primary button uses teal accent */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className={cn(
                      "w-full h-11 flex items-center justify-center rounded-md font-semibold",
                      loading
                        ? "opacity-70 cursor-not-allowed"
                        : "bg-teal-500 hover:bg-teal-600 text-white"
                    )}
                  >
                    {loading ? (
                      <div className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>
                          {isSignIn ? "Signing in..." : "Signing up..."}
                        </span>
                      </div>
                    ) : (
                      <span>{isSignIn ? "Sign In" : "Create Account"}</span>
                    )}
                  </Button>

                  <div className="flex items-center justify-between text-sm">
                    <button
                      type="button"
                      onClick={toggleMode}
                      className="text-sm text-neutral-800 hover:underline"
                      aria-pressed={!isSignIn}
                    >
                      {isSignIn
                        ? "Don't have an account? Create one"
                        : "Already have an account? Sign in"}
                    </button>

                    <button
                      type="button"
                      onClick={() => toast("Passwordless reset coming soon")}
                      className="text-sm text-neutral-600 hover:underline"
                    >
                      Forgot?
                    </button>
                  </div>
                </div>

                {/* small footer with subtle seperator */}
                {/* <div className="mt-4 border-t pt-4 text-center text-sm text-neutral-600">
                  <span>Or continue with</span>
                  <div className="mt-3 flex items-center justify-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast("Sign in with Google — stub")}
                      className="h-9"
                    >
                      Google
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast("Sign in with GitHub — stub")}
                      className="h-9"
                    >
                      GitHub
                    </Button>
                  </div>
                </div> */}
              </form>
            </CardContent>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
