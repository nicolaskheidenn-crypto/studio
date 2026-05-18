
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, ArrowRight, Loader2, Coffee } from "lucide-react";
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
      <div className="min-h-svh flex flex-col items-center justify-center bg-[#fdfaf6] text-accent p-6 text-center overflow-hidden relative">
        {/* Large Decorative Background Icons */}
        <div className="absolute top-[10%] left-[10%] opacity-[0.03] -rotate-12 pointer-events-none">
          <Coffee className="w-[300px] h-[300px] text-[#8b5e3c]" />
        </div>
        <div className="absolute bottom-[10%] right-[10%] opacity-[0.03] rotate-12 pointer-events-none">
          <Coffee className="w-[300px] h-[300px] text-[#8b5e3c]" />
        </div>
        <div className="absolute top-[40%] right-[-5%] opacity-[0.02] -rotate-45 pointer-events-none">
          <Coffee className="w-[200px] h-[200px] text-[#8b5e3c]" />
        </div>

        <div className="relative z-10 space-y-12 animate-in fade-in zoom-in duration-700 w-full max-w-md">
          {/* Logo Section */}
          <div className="space-y-2">
            <h1 className="text-8xl md:text-9xl font-headline font-black tracking-tighter text-black leading-none">
              ND
            </h1>
            <div className="h-1.5 w-16 bg-primary mx-auto rounded-full" />
          </div>
          
          {/* Brand Name */}
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-headline font-black tracking-tight uppercase">
              NICO <span className="text-primary">DIGITAL</span>
            </h2>
            <p className="text-[10px] md:text-xs text-muted-foreground font-black uppercase tracking-[0.5em] opacity-60">
              CREATE · CONNECT · GROW
            </p>
          </div>

          {/* Action Button */}
          <div className="pt-8">
            <Button 
              size="lg" 
              className="rounded-full px-12 h-16 md:h-20 text-lg font-black bg-black text-white hover:bg-black/90 transition-all transform hover:scale-105 shadow-[0_20px_40px_rgba(0,0,0,0.2)] active:scale-95 mx-auto uppercase group"
              onClick={handleProceed}
            >
              ARE YOU READY? <ArrowRight className="ml-4 h-5 w-5 text-primary group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
          
          {/* Footer Label */}
          <p className="text-[8px] md:text-[10px] text-muted-foreground uppercase tracking-[0.6em] font-black pt-16 opacity-40">
            SOVEREIGN EXECUTION HUB
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-svh flex flex-col items-center justify-center bg-[#fdfaf6] text-accent p-6 relative overflow-hidden">
      <div className="absolute top-[-5%] right-[-5%] opacity-[0.05] pointer-events-none scale-150">
        <Coffee className="w-64 h-64 rotate-45 text-[#8b5e3c]" />
      </div>
      
      <div className="w-full max-w-sm space-y-8 animate-in slide-in-from-bottom-10 duration-700 relative z-10">
        <div className="text-center space-y-4">
          <div className="p-5 bg-primary/10 rounded-2xl w-fit mx-auto border-2 border-primary/20 shadow-sm">
            <Lock className="h-8 w-8 text-black" />
          </div>
          <h2 className="text-2xl font-headline font-black tracking-tight text-black uppercase">Master Access</h2>
          <p className="text-muted-foreground text-[10px] font-bold px-6 leading-relaxed">Identify yourself with the Host's 16-digit verification code to unlock Nico Digital resources.</p>
        </div>

        <form onSubmit={verifyKey} className="space-y-5 px-4">
          <Input 
            type="text" 
            placeholder="0000-0000-0000-0000"
            className="bg-white border-2 border-accent/5 h-14 text-center text-xl font-mono tracking-[0.15em] rounded-2xl focus:border-primary text-black shadow-inner"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            required
            autoFocus
          />
          <Button 
            type="submit" 
            className="w-full h-14 rounded-2xl bg-black hover:bg-black/90 text-white font-black text-base shadow-xl transition-all active:scale-95"
            disabled={isVerifying}
          >
            {isVerifying ? <Loader2 className="animate-spin h-6 w-6" /> : "AUTHENTICATE HUB"}
          </Button>
        </form>

        <p className="text-center text-[7px] text-muted-foreground font-black uppercase tracking-[0.5em] opacity-40">
          NICO DIGITAL ROOT SECURITY
        </p>
      </div>
    </div>
  );
}
