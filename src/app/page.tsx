
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
        
        <div className="relative z-10 space-y-8 animate-in fade-in zoom-in duration-700 w-full max-w-lg">
          <div className="p-4 bg-primary/20 rounded-[2rem] w-fit mx-auto border-2 border-primary/30 shadow-lg">
            <Coffee className="h-10 w-10 md:h-12 md:w-12 text-primary" />
          </div>
          
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-headline font-black tracking-tighter leading-tight uppercase">
              Are you <span className="text-primary italic">READY?</span>
            </h1>
            <p className="text-base md:text-lg text-white/70 font-bold max-w-xs mx-auto leading-relaxed">
              Entry is restricted to the strategic elite. Authenticate to proceed.
            </p>
          </div>

          <Button 
            size="lg" 
            className="rounded-full px-10 py-6 text-lg md:text-xl font-black bg-primary hover:bg-primary/90 text-accent transition-all transform hover:scale-105 shadow-xl active:scale-95 mx-auto"
            onClick={handleProceed}
          >
            PROCEED <ArrowRight className="ml-3 h-6 w-6" />
          </Button>
          
          <p className="text-[10px] text-white/30 uppercase tracking-[0.4em] font-black">
            NICO DIGITAL SOVEREIGN HUB
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-svh flex flex-col items-center justify-center bg-accent text-white p-6 relative overflow-hidden">
      <div className="w-full max-w-sm space-y-8 animate-in slide-in-from-bottom-10 duration-700 relative z-10">
        <div className="text-center space-y-5">
          <div className="p-4 bg-primary/10 rounded-[1.5rem] w-fit mx-auto border-2 border-primary/20 shadow-md">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl font-headline font-bold tracking-tight">Access Control</h2>
          <p className="text-white/60 text-sm font-medium px-4">Input your unique 16-digit verification code provided by the Host.</p>
        </div>

        <form onSubmit={verifyKey} className="space-y-5 px-4">
          <Input 
            type="text" 
            placeholder="0000-0000-0000-0000"
            className="bg-white/5 border-2 border-white/20 h-16 text-center text-xl md:text-2xl font-mono tracking-[0.1em] rounded-2xl focus:border-primary text-primary placeholder:text-white/5"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            required
          />
          <Button 
            type="submit" 
            className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-accent font-black text-lg shadow-xl transition-all active:scale-95"
            disabled={isVerifying}
          >
            {isVerifying ? <Loader2 className="animate-spin h-6 w-6" /> : "VERIFY ACCESS"}
          </Button>
        </form>

        <p className="text-center text-[10px] text-white/20 font-black uppercase tracking-[0.3em]">
          SECURITY PROTOCOL ACTIVE
        </p>
      </div>
    </div>
  );
}
