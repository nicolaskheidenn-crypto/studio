"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Coffee, Chrome, Facebook, Instagram, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useFirebaseApp } from "@/firebase";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const app = useFirebaseApp();
  const auth = getAuth(app);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const hasAccess = sessionStorage.getItem("fireproof_access_granted");
    if (hasAccess !== "true") {
      router.push("/");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Welcome Back",
        description: "You have successfully signed in to your strategist hub.",
      });
      router.push("/dashboard");
    } catch (error: any) {
      let errorMessage = "Invalid email or password.";
      if (error.code === 'auth/invalid-credential') {
        errorMessage = "Invalid credentials. If you haven't created an account yet, please Sign Up first.";
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = "No account found with this email. Please Sign Up.";
      }
      
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-accent/5 relative overflow-hidden">
      {/* Decorative Coffee Elements */}
      <div className="absolute top-[-5%] right-[-5%] opacity-10 pointer-events-none scale-150">
        <Coffee className="w-80 h-80 rotate-45 text-accent" />
      </div>
      <div className="absolute bottom-[-5%] left-[-5%] opacity-10 pointer-events-none scale-150">
        <Coffee className="w-80 h-80 -rotate-12 text-accent" />
      </div>
      <div className="absolute top-1/2 left-1/4 opacity-5 pointer-events-none">
        <Coffee className="w-40 h-40 -rotate-45 text-accent" />
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-card rounded-[3rem] shadow-2xl overflow-hidden border border-accent/10 relative z-10">
        {/* Brand Side */}
        <div className="p-12 space-y-8 bg-accent text-white relative overflow-hidden flex flex-col justify-center">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="relative z-10 space-y-8 text-center lg:text-left">
            <h2 className="text-5xl font-headline font-bold leading-tight">
              Welcome Back to <span className="text-primary italic">Success</span>.
            </h2>
            <p className="text-white/70 text-lg leading-relaxed">
              Your empire doesn't build itself. Log in to continue your daily tasks and access your exclusive strategies.
            </p>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
              <p className="text-sm font-medium italic">"The secret of your success is found in your daily routine."</p>
            </div>
          </div>
        </div>

        {/* Form Side */}
        <div className="p-10 md:p-14 space-y-10 bg-white">
          <div className="space-y-2">
            <h1 className="text-4xl font-headline font-bold text-accent">Sign In</h1>
            <p className="text-muted-foreground text-lg">Enter your strategist credentials.</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Button variant="outline" className="rounded-xl border-accent/10 h-14 p-0 bg-white hover:bg-accent/5 transition-all shadow-sm">
              <Chrome className="h-6 w-6 text-red-500" />
            </Button>
            <Button variant="outline" className="rounded-xl border-accent/10 h-14 p-0 bg-white hover:bg-accent/5 transition-all shadow-sm">
              <Facebook className="h-6 w-6 text-blue-600" />
            </Button>
            <Button variant="outline" className="rounded-xl border-accent/10 h-14 p-0 bg-white hover:bg-accent/5 transition-all shadow-sm">
              <Instagram className="h-6 w-6 text-pink-600" />
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-accent/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-muted-foreground font-bold tracking-widest">Or with email</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                required 
                className="rounded-xl border-accent/10 h-14 bg-secondary/10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-sm text-accent hover:text-primary font-bold">Forgot password?</Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                required 
                className="rounded-xl border-accent/10 h-14 bg-secondary/10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full rounded-2xl py-8 bg-accent hover:bg-accent/90 text-white font-bold text-xl shadow-xl shadow-accent/20 transition-transform active:scale-[0.98]" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign In <ArrowRight className="h-5 w-5" />
                </span>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            New here?{" "}
            <Link href="/signup" className="text-accent font-bold hover:text-primary transition-colors">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
