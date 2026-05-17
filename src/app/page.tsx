
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
      <div className="min-h-svh flex flex-col items-center justify-center bg-accent text-white p-6 text-center overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.05),transparent)] pointer-events-none" />
        
        <div className="absolute top-4 left-4 opacity-5 pointer-events-none">
          <Coffee className="w-12 h-12 md:w-20 md:h-20" />
        </div>
        <div className="absolute bottom-4 right-4 opacity-5 pointer-events-none">
          <Coffee className="w-16 h-16 md:w-24 md:h-24 rotate-45" />
        </div>

        <div className="relative z-10 space-y-6 md:space-y-8 animate-in fade-in zoom-in duration-700 w-full max-w-2xl">
          <div className="p-3 md:p-4 bg-primary/20 rounded-[1.5rem] md:rounded-[2rem] w-fit mx-auto border-2 border-primary/30 shadow-lg">
            <Coffee className="h-10 w-10 md:h-14 md:w-14 text-primary" />
          </div>
          
          <div className="space-y-2 md:space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-headline font-black tracking-tighter leading-tight uppercase">
              Are you <span className="text-primary italic">READY?</span>
            </h1>
            <p className="text-sm md:text-lg text-white/70 font-bold max-w-md mx-auto leading-relaxed">
              The high-earner strategy hub. Entry is restricted to the strategic elite.
            </p>
          </div>

          <Button 
            size="lg" 
            className="rounded-full px-8 md:px-12 py-5 md:py-6 text-lg md:text-xl font-black bg-primary hover:bg-primary/90 text-accent transition-all transform hover:scale-105 shadow-xl active:scale-95 mx-auto"
            onClick={handleProceed}
          >
            PROCEED <ArrowRight className="ml-2 md:ml-3 h-5 w-5 md:h-6 md:w-6" />
          </Button>
          
          <p className="text-[10px] md:text-xs text-white/30 uppercase tracking-[0.4em] font-black">
            TAP OR CLICK TO ENTER THE HUB
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-svh flex flex-col items-center justify-center bg-accent text-white p-6 relative overflow-hidden">
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,215,0,0.03),transparent)] pointer-events-none" />
       
      <div className="w-full max-w-md space-y-6 md:space-y-8 animate-in slide-in-from-bottom-10 duration-700 relative z-10">
        <div className="text-center space-y-4 md:space-y-5">
          <div className="p-3 md:p-4 bg-primary/10 rounded-[1.2rem] md:rounded-[1.5rem] w-fit mx-auto border-2 border-primary/20 shadow-md">
            <Lock className="h-8 w-8 md:h-10 md:w-10 text-primary" />
          </div>
          <h2 className="text-2xl md:text-4xl font-headline font-bold tracking-tight">Access Control</h2>
          <p className="text-white/60 text-sm md:text-base font-medium px-4">Input the unique 16-digit verification code provided by the Host.</p>
        </div>

        <form onSubmit={verifyKey} className="space-y-4 md:space-y-5 px-4">
          <div className="space-y-2">
            <Input 
              type="text" 
              placeholder="0000-0000-0000-0000"
              className="bg-white/5 border-white/20 h-14 md:h-16 text-center text-xl md:text-2xl font-mono tracking-[0.1em] rounded-[1.2rem] md:rounded-[1.5rem] focus:ring-2 focus:ring-primary/20 focus:border-primary text-primary placeholder:text-white/5"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              required
            />
          </div>
          <Button 
            type="submit" 
            className="w-full h-12 md:h-14 rounded-[1rem] md:rounded-[1.2rem] bg-primary hover:bg-primary/90 text-accent font-black text-base md:text-lg shadow-xl transition-all hover:scale-[1.02] active:scale-95"
            disabled={isVerifying}
          >
            {isVerifying ? <Loader2 className="animate-spin h-5 w-5" /> : "VERIFY ACCESS"}
          </Button>
        </form>

        <p className="text-center text-[8px] md:text-[10px] text-white/20 font-black uppercase tracking-[0.3em]">
          SECURITY PROTOCOL ACTIVE
        </p>
      </div>
    </div>
  );
}
