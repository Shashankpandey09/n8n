import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const Auth = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignIn) {
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const user = users.find((u: any) => u.email === email && u.password === password);
      
      if (user) {
        localStorage.setItem("currentUser", JSON.stringify(user));
        toast.success("Signed in successfully");
        navigate("/dashboard");
      } else {
        toast.error("Invalid credentials");
      }
    } else {
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const userExists = users.find((u: any) => u.email === email);
      
      if (userExists) {
        toast.error("User already exists");
      } else {
        const newUser = { id: Date.now(), email, password };
        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("currentUser", JSON.stringify(newUser));
        toast.success("Account created successfully");
        navigate("/dashboard");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            {isSignIn ? "Sign In" : "Create Account"}
          </CardTitle>
          <CardDescription>
            {isSignIn ? "Enter your credentials to continue" : "Enter your details to get started"}
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              {isSignIn ? "Sign In" : "Sign Up"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <button
              onClick={() => setIsSignIn(!isSignIn)}
              className="text-accent hover:underline"
            >
              {isSignIn ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
