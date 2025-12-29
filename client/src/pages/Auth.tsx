import { useState } from "react";
import { useLocation } from "wouter";
import { useLogin, useRegister } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { Mic2, ArrowRight, Loader2 } from "lucide-react";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// Client-side validation schema (can be extended if needed)
const authSchema = insertUserSchema.extend({
  confirmPassword: z.string().optional(),
}).refine(data => {
  if (data.confirmPassword) {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: "Passwords must match",
  path: ["confirmPassword"],
});

export default function AuthPage({ mode = "login" }: { mode?: "login" | "register" }) {
  const [isLogin, setIsLogin] = useState(mode === "login");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const login = useLogin();
  const register = useRegister();
  
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!isLogin && formData.password !== formData.confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }

    try {
      if (isLogin) {
        await login.mutateAsync(formData);
      } else {
        await register.mutateAsync({ 
          username: formData.username, 
          password: formData.password 
        });
      }
    } catch (error: any) {
      toast({ 
        title: "Authentication Failed", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  };

  const isLoading = login.isPending || register.isPending;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card/50 backdrop-blur-xl border-border/50 shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Mic2 className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-display font-bold">
              {isLogin ? "Welcome Back" : "Join Vox.Chat"}
            </CardTitle>
            <CardDescription>
              {isLogin 
                ? "Enter your credentials to access your account" 
                : "Create an account to start talking anonymously"}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="bg-secondary/50 border-input focus:border-primary transition-colors"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="bg-secondary/50 border-input focus:border-primary transition-colors"
                  required
                />
              </div>
              {!isLogin && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="bg-secondary/50 border-input focus:border-primary transition-colors"
                    required
                  />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button 
                type="submit" 
                className="w-full font-bold h-11 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {isLogin ? "Sign In" : "Create Account"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="link"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFormData({ username: "", password: "", confirmPassword: "" });
                  setLocation(isLogin ? "/register" : "/login");
                }}
              >
                {isLogin 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
