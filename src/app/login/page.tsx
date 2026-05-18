
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
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#fdfaf6] relative overflow-hidden">
      {/* Calm Mocha Background */}
      <div className="absolute top-[-10%] right-[-10%] opacity-10 pointer-events-none scale-150">
        <Coffee className="w-80 h-80 rotate-45 text-[#8b5e3c]" />
      </div>
      <div className="absolute bottom-[-10%] left-[-10%] opacity-10 pointer-events-none scale-150">
        <Coffee className="w-80 h-80 -rotate-12 text-[#8b5e3c]" />
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[3rem] shadow-2xl overflow-hidden border-4 border-white relative z-10">
        <div className="p-10 md:p-14 space-y-8 bg-accent text-white relative overflow-hidden flex flex-col justify-center">
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-primary/20 rounded-full blur-[80px]" />
          <div className="relative z-10 space-y-8">
             <div className="p-5 bg-white/10 rounded-[2rem] w-fit border border-white/20">
                <Lock className="h-10 w-10 text-primary" />
             </div>
            <h2 className="text-4xl md:text-5xl font-headline font-bold leading-tight">
              Return to <span className="text-primary italic">Consistency</span>.
            </h2>
            <p className="text-white/70 text-lg leading-relaxed font-medium">
              Nico Digital Infrastructure ensures your high-focus sessions are uninterrupted and productive.
            </p>
            <div className="p-6 bg-white/5 rounded-[1.5rem] border border-white/10 backdrop-blur-sm">
              <p className="text-base font-bold italic text-primary">"Discipline is the bridge between goals and accomplishment."</p>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12 space-y-8 bg-white">
          <div className="space-y-2">
            <h1 className="text-3xl font-headline font-bold text-accent tracking-tight uppercase">Sign In</h1>
            <p className="text-base text-muted-foreground font-medium">Verify strategist identity.</p>
          </div>

          <div className="flex justify-start gap-3">
            <Button variant="outline" className="rounded-xl border-2 border-accent/10 h-12 w-12 p-0 bg-white hover:border-primary transition-colors">
              <Chrome className="h-6 w-6 text-red-500" />
            </Button>
            <Button variant="outline" className="rounded-xl border-2 border-accent/10 h-12 w-12 p-0 bg-white hover:border-primary transition-colors">
              <Facebook className="h-6 w-6 text-blue-600" />
            </Button>
            <Button variant="outline" className="rounded-xl border-2 border-accent/10 h-12 w-12 p-0 bg-white hover:border-primary transition-colors">
              <Instagram className="h-6 w-6 text-pink-600" />
            </Button>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm font-bold ml-1 uppercase opacity-60">Email Address</Label>
              <Input 
                type="email" 
                placeholder="name@example.com" 
                required 
                className="rounded-xl border-2 border-accent/5 h-12 bg-secondary/10 text-base px-5 focus:border-primary focus:ring-0"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <Label className="text-sm font-bold uppercase opacity-60">Security Key</Label>
                <button type="button" onClick={handleForgotPassword} className="text-[10px] text-accent hover:text-primary font-black uppercase tracking-widest">Forgot?</button>
              </div>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  className="rounded-xl border-2 border-accent/5 h-12 bg-secondary/10 text-base px-5 pr-12 focus:border-primary focus:ring-0"
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
                  {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full rounded-[1.5rem] h-14 bg-accent hover:bg-accent/90 text-white font-black text-lg shadow-xl transition-all active:scale-95" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Access Hub"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground font-medium">
            New strategist?{" "}
            <Link href="/signup" className="text-accent font-black hover:text-primary transition-colors border-b-2 border-primary">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
