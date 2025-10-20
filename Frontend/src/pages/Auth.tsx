import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";

const Auth = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `http://localhost:3000/api/v1/user/${isSignIn ? "signin" : "signup"}`,
        {
          username: email,
          password,
        }
      );

      if (res.status === 200 && res.data?.user && res.data?.token) {
        localStorage.setItem("currentUser", JSON.stringify(res.data.user));
        localStorage.setItem("token", res.data.token);
        toast.success(`${isSignIn ? "Signed in" : "Signed up"} successfully`);
        navigate("/dashboard");
      } else {
        // backend might return a 200 with ok:false — handle gracefully
        toast.error(res.data?.message || "Invalid credentials");
      }
    } catch (err: any) {
      console.error("Auth error ->", err);
      const message =
        err?.response?.data?.message || "Unable to reach the server";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            {isSignIn ? "Sign In" : "Create Account"}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {isSignIn
              ? "Enter your credentials to continue"
              : "Enter your details to get started"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-label="Email"
                className="w-full"
              />
            </div>

            <div className="space-y-2 relative">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  aria-label="Password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded px-2 py-1 text-sm text-muted-foreground hover:bg-muted/30"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Primary submit button */}
            <div>
              <Button
                type="submit"
                disabled={loading}
                className={`w-full inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500
                  ${loading ? "opacity-70 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}
                aria-label={isSignIn ? "Sign in" : "Sign up"}
              >
                {loading ? (isSignIn ? "Signing in..." : "Signing up...") : isSignIn ? "Sign In" : "Sign Up"}
              </Button>
            </div>
          </form>

          <div className="mt-4 flex items-center justify-between text-sm">
            <button
              onClick={() => setIsSignIn(!isSignIn)}
              className="text-accent hover:underline"
              aria-pressed={!isSignIn}
            >
              {isSignIn ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>

            {/* small secondary action (non-critical) */}
            <button
              type="button"
              onClick={() => toast("Passwordless reset coming soon")}
              className="text-muted-foreground hover:underline"
            >
              Forgot?
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
