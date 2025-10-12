import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import axios from "axios";

const Auth = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    console.log('sub')
      //sending to the backend
      const res=await axios.post(`http://localhost:3000/api/v1/user/${isSignIn?'signin':'signup'}`,{
        username:email,
        password
      })
      
      if (res.status==200) {
        localStorage.setItem("currentUser", JSON.stringify(res.data.user));
        localStorage.setItem('token',res.data.token)
        toast.success(`${isSignIn?'Signed in':'SignedUp'} successfully`);
        navigate("/dashboard");
      } else {
        toast.error("Invalid credentials");
        console.log(res.data)
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
            <button onClick={handleSubmit}>
              {isSignIn ? "Sign In" : "Sign Up"}
          </button>
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
