
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useUser } from "@/firebase";

export default function EntryGate() {
  const [step, setStep] = useState<'ready' | 'key'>('ready');
  const [key, setKey] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const router = useRouter();
  const { user, loading } = useUser();

  const ACCESS_KEY = "0924-6719-4345-6581";

  useEffect(() => {
    if (loading) return;
    const hasAccess = sessionStorage.getItem("fireproof_access_granted");
    if (hasAccess === "true") {
      if (user) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [router, user, loading]);

  const handleProceed = () => {
    setStep('key');
  };

  const verifyKey = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);

    setTimeout(() => {
      if (key === ACCESS_KEY) {
        sessionStorage.setItem("fireproof_access_granted", "true");
        toast({
          title: "Access Granted",
          description: "Welcome to NICO DIGITAL Infrastructure.",
        });
        router.push("/login");
      } else {
        toast({
          title: "Invalid Key",
          description: "Verification failed. Access denied.",
          variant: "destructive",
        });
      }
      setIsVerifying(false);
    }, 1200);
  };

  if (step === 'ready') {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center bg-white text-accent p-8 text-center overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.15),transparent)] pointer-events-none" />
        
        <div className="relative z-10 space-y-10 animate-in fade-in zoom-in duration-700 w-full max-w-lg">
          <div className="space-y-2">
            <h1 className="text-8xl md:text-9xl font-headline font-black tracking-tighter text-black leading-none">
              ND
            </h1>
            <div className="h-1.5 w-24 bg-primary mx-auto rounded-full" />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-headline font-black tracking-tight uppercase">
              NICO <span className="text-primary">DIGITAL</span>
            </h2>
            <p className="text-sm md:text-base text-muted-foreground font-black uppercase tracking-[0.3em]">
              CREATE · CONNECT · GROW
            </p>
          </div>

          <div className="pt-8">
            <Button 
              size="lg" 
              className="rounded-full px-12 py-7 text-lg font-black bg-black text-white hover:bg-black/90 transition-all transform hover:scale-105 shadow-2xl active:scale-95 mx-auto"
              onClick={handleProceed}
            >
              ARE YOU READY? <ArrowRight className="ml-3 h-6 w-6 text-primary" />
            </Button>
          </div>
          
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.5em] font-black pt-12">
            SOVEREIGN EXECUTION HUB
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-svh flex flex-col items-center justify-center bg-white text-accent p-8 relative overflow-hidden">
      <div className="w-full max-w-sm space-y-10 animate-in slide-in-from-bottom-10 duration-700 relative z-10">
        <div className="text-center space-y-6">
          <div className="p-5 bg-primary/10 rounded-3xl w-fit mx-auto border-2 border-primary/20 shadow-md">
            <Lock className="h-10 w-10 text-black" />
          </div>
          <h2 className="text-3xl font-headline font-black tracking-tight text-black">Master Access</h2>
          <p className="text-muted-foreground text-sm font-bold px-4">Identify yourself with the Host's 16-digit verification code.</p>
        </div>

        <form onSubmit={verifyKey} className="space-y-6 px-4">
          <Input 
            type="text" 
            placeholder="0000-0000-0000-0000"
            className="bg-secondary/30 border-2 border-accent/5 h-16 text-center text-2xl font-mono tracking-[0.1em] rounded-2xl focus:border-primary text-black placeholder:text-muted-foreground/30"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            required
            autoFocus
          />
          <Button 
            type="submit" 
            className="w-full h-16 rounded-2xl bg-black hover:bg-black/90 text-white font-black text-lg shadow-xl transition-all active:scale-95"
            disabled={isVerifying}
          >
            {isVerifying ? <Loader2 className="animate-spin h-6 w-6" /> : "AUTHENTICATE"}
          </Button>
        </form>

        <p className="text-center text-[10px] text-muted-foreground font-black uppercase tracking-[0.4em]">
          NICO DIGITAL ROOT SECURITY
        </p>
      </div>
    </div>
  );
}
