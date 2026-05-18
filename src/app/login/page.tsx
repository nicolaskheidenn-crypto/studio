
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Coffee, Chrome, Facebook, Instagram, Loader2, ArrowRight, Eye, EyeOff, Lock } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { useFirebaseApp } from "@/firebase";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
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

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Access Granted",
        description: "Welcome back to the strategist hub.",
      });
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: "Invalid credentials. Ensure your strategy is correct.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({ title: "Email Required", description: "Enter your email to reset password.", variant: "destructive" });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast({ title: "Email Sent", description: "Check your inbox for reset instructions." });
    } catch (e: any) {
      toast({ title: "Reset Failed", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-accent/5 relative overflow-hidden">
      <div className="absolute top-[-5%] right-[-5%] opacity-10 pointer-events-none scale-150">
        <Coffee className="w-80 h-80 rotate-45 text-accent" />
      </div>
      <div className="absolute bottom-[-5%] left-[-5%] opacity-10 pointer-events-none scale-150">
        <Coffee className="w-80 h-80 -rotate-12 text-accent" />
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-card rounded-[4rem] shadow-2xl overflow-hidden border-4 border-white relative z-10">
        <div className="p-16 space-y-10 bg-accent text-white relative overflow-hidden flex flex-col justify-center">
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-primary/20 rounded-full blur-[100px]" />
          <div className="relative z-10 space-y-10">
             <div className="p-6 bg-white/10 rounded-[2.5rem] w-fit border border-white/20">
                <Lock className="h-12 w-12 text-primary" />
             </div>
            <h2 className="text-5xl font-headline font-bold leading-tight">
              Return to <span className="text-primary italic">Consistency</span>.
            </h2>
            <p className="text-white/70 text-xl leading-relaxed font-medium">
              Nico Digital Infrastructure ensures your high-focus sessions are uninterrupted.
            </p>
            <div className="p-8 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-xl">
              <p className="text-lg font-bold italic text-primary">"Discipline is the bridge between goals and accomplishment."</p>
            </div>
          </div>
        </div>

        <div className="p-10 md:p-16 space-y-10 bg-white">
          <div className="space-y-3">
            <h1 className="text-4xl font-headline font-bold text-accent tracking-tight">Sign In</h1>
            <p className="text-lg text-muted-foreground font-medium">Verify strategist identity.</p>
          </div>

          <div className="flex justify-center gap-4">
            <Button variant="outline" className="rounded-2xl border-2 border-accent/10 h-14 w-14 p-0 bg-white hover:border-primary transition-colors">
              <Chrome className="h-7 w-7 text-red-500" />
            </Button>
            <Button variant="outline" className="rounded-2xl border-2 border-accent/10 h-14 w-14 p-0 bg-white hover:border-primary transition-colors">
              <Facebook className="h-7 w-7 text-blue-600" />
            </Button>
            <Button variant="outline" className="rounded-2xl border-2 border-accent/10 h-14 w-14 p-0 bg-white hover:border-primary transition-colors">
              <Instagram className="h-7 w-7 text-pink-600" />
            </Button>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-3">
              <Label className="text-base font-bold ml-2">Email Address</Label>
              <Input 
                type="email" 
                placeholder="name@example.com" 
                required 
                className="rounded-2xl border-2 border-accent/10 h-14 bg-secondary/5 text-lg px-6 focus:border-primary focus:ring-0"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between ml-2">
                <Label className="text-base font-bold">Security Key</Label>
                <button type="button" onClick={handleForgotPassword} className="text-xs text-accent hover:text-primary font-black uppercase tracking-widest">Forgot?</button>
              </div>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  className="rounded-2xl border-2 border-accent/10 h-14 bg-secondary/5 text-lg px-6 pr-14 focus:border-primary focus:ring-0"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
                <button 
                  type="button"
                  onMouseDown={() => setShowPassword(true)}
                  onMouseUp={() => setShowPassword(false)}
                  onMouseLeave={() => setShowPassword(false)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent"
                >
                  {showPassword ? <Eye className="h-6 w-6" /> : <EyeOff className="h-6 w-6" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full rounded-[2rem] h-16 bg-accent hover:bg-accent/90 text-white font-black text-2xl shadow-xl transition-all active:scale-95" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : "Access Hub"}
            </Button>
          </form>

          <p className="text-center text-lg text-muted-foreground font-medium">
            New strategist?{" "}
            <Link href="/signup" className="text-accent font-black hover:text-primary transition-colors border-b-2 border-primary">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
