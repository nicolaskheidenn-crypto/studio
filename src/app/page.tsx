
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Coffee, Lock, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useUser } from "@/firebase";

export default function EntryGate() {
  const [step, setStep] = useState<'ready' | 'key'>('ready');
  const [key, setKey] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const router = useRouter();
  const { user } = useUser();

  const ACCESS_KEY = "0924-6719-4345-6581";

  useEffect(() => {
    const hasAccess = sessionStorage.getItem("fireproof_access_granted");
    if (hasAccess === "true") {
      if (user) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [router, user]);

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
          description: "Welcome to the FireProof inner circle.",
        });
        router.push("/login");
      } else {
        toast({
          title: "Invalid Key",
          description: "The access key you entered is incorrect.",
          variant: "destructive",
        });
      }
      setIsVerifying(false);
    }, 1500);
  };

  if (step === 'ready') {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center bg-accent text-white p-4 text-center overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.15),transparent)] pointer-events-none" />
        
        <div className="absolute top-4 left-4 opacity-5 md:opacity-10 pointer-events-none animate-pulse">
          <Coffee className="w-24 h-24 md:w-48 md:h-48" />
        </div>
        <div className="absolute bottom-4 right-4 opacity-5 md:opacity-10 pointer-events-none animate-pulse delay-1000">
          <Coffee className="w-32 h-32 md:w-64 md:h-64 rotate-45" />
        </div>

        <div className="relative z-10 space-y-8 md:space-y-16 animate-in fade-in zoom-in duration-1000 w-full max-w-4xl">
          <div className="p-6 md:p-10 bg-primary/20 rounded-[2.5rem] md:rounded-[4rem] w-fit mx-auto border-4 border-primary/30 shadow-[0_0_100px_rgba(255,215,0,0.2)]">
            <Coffee className="h-16 w-16 md:h-32 md:w-32 text-primary" />
          </div>
          
          <div className="space-y-4 md:space-y-6">
            <h1 className="text-5xl sm:text-7xl md:text-[10rem] font-headline font-black tracking-tighter leading-none uppercase">
              Are you <span className="text-primary italic">READY?</span>
            </h1>
            <p className="text-lg md:text-3xl text-white/70 font-bold max-w-2xl mx-auto leading-relaxed px-4">
              The high-earner strategy hub. Entry is restricted to the strategic elite.
            </p>
          </div>

          <Button 
            size="lg" 
            className="rounded-full px-12 md:px-24 py-8 md:py-12 text-2xl md:text-5xl font-black bg-primary hover:bg-primary/90 text-accent transition-all transform hover:scale-105 shadow-[0_0_80px_rgba(255,215,0,0.4)] active:scale-95 mx-auto"
            onClick={handleProceed}
          >
            PROCEED <ArrowRight className="ml-3 md:ml-6 h-8 w-8 md:h-12 md:w-12" />
          </Button>
          
          <p className="text-xs md:text-lg text-white/30 uppercase tracking-[0.4em] md:tracking-[0.6em] font-black">
            TAP OR CLICK TO ENTER THE HUB
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-svh flex flex-col items-center justify-center bg-accent text-white p-4 relative overflow-hidden">
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,215,0,0.1),transparent)] pointer-events-none" />
       
      <div className="w-full max-w-2xl space-y-8 md:space-y-12 animate-in slide-in-from-bottom-20 duration-1000 relative z-10">
        <div className="text-center space-y-4 md:space-y-8">
          <div className="p-6 md:p-10 bg-primary/10 rounded-[2rem] md:rounded-[3rem] w-fit mx-auto border-4 border-primary/20 shadow-2xl">
            <Lock className="h-12 w-12 md:h-20 md:w-20 text-primary" />
          </div>
          <h2 className="text-4xl md:text-6xl font-headline font-bold tracking-tight">Access Control</h2>
          <p className="text-white/60 text-lg md:text-2xl font-medium px-4">Input the unique 16-digit verification code provided by the Host.</p>
        </div>

        <form onSubmit={verifyKey} className="space-y-6 md:space-y-10 px-4">
          <div className="space-y-4">
            <Input 
              type="text" 
              placeholder="0000-0000-0000-0000"
              className="bg-white/5 border-white/20 h-20 md:h-28 text-center text-3xl md:text-5xl font-mono tracking-[0.1em] md:tracking-[0.2em] rounded-[2rem] md:rounded-[3rem] focus:ring-8 focus:ring-primary/20 focus:border-primary text-primary placeholder:text-white/5"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              required
            />
          </div>
          <Button 
            type="submit" 
            className="w-full h-16 md:h-24 rounded-[1.5rem] md:rounded-[2.5rem] bg-primary hover:bg-primary/90 text-accent font-black text-xl md:text-3xl shadow-2xl transition-all hover:scale-[1.02] active:scale-95"
            disabled={isVerifying}
          >
            {isVerifying ? <Loader2 className="animate-spin h-8 w-8 md:h-12 md:w-12" /> : "VERIFY ACCESS"}
          </Button>
        </form>

        <p className="text-center text-[10px] md:text-sm text-white/20 font-black uppercase tracking-[0.3em] md:tracking-[0.5em]">
          SECURITY PROTOCOL ACTIVE
        </p>
      </div>
    </div>
  );
}
