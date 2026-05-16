
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Coffee, Lock, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function EntryGate() {
  const [step, setStep] = useState<'ready' | 'key'>('ready');
  const [key, setKey] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const router = useRouter();

  const ACCESS_KEY = "0924-6719-4345-6581";

  useEffect(() => {
    const hasAccess = sessionStorage.getItem("fireproof_access_granted");
    if (hasAccess === "true") {
      router.push("/home");
    }
  }, [router]);

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
    }, 1000);
  };

  if (step === 'ready') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-accent text-white p-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.15),transparent)] pointer-events-none" />
        
        <div className="relative z-10 space-y-8 animate-in fade-in zoom-in duration-700">
          <div className="p-4 bg-primary/20 rounded-[2rem] w-fit mx-auto border border-primary/30">
            <Coffee className="h-12 w-12 text-primary" />
          </div>
          
          <h1 className="text-6xl md:text-8xl font-headline font-bold tracking-tighter leading-none">
            Are you <span className="text-primary italic">READY?</span>
          </h1>
          
          <p className="text-xl text-white/60 font-medium max-w-md mx-auto">
            The fail-proof strategy hub for high earners. Access is restricted.
          </p>

          <Button 
            size="lg" 
            className="rounded-full px-12 py-8 text-2xl font-bold bg-primary hover:bg-primary/90 text-accent transition-all transform hover:scale-105 shadow-2xl"
            onClick={handleProceed}
            onContextMenu={(e) => {
              e.preventDefault();
              handleProceed();
            }}
          >
            PROCEED
          </Button>
          
          <p className="text-xs text-white/30 uppercase tracking-[0.3em]">
            Right-click or tap to enter
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-accent text-white p-4">
      <div className="w-full max-w-md space-y-8 animate-in slide-in-from-bottom-10 duration-500">
        <div className="text-center space-y-4">
          <div className="p-3 bg-primary/10 rounded-2xl w-fit mx-auto">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl font-headline font-bold">Secure Access</h2>
          <p className="text-white/60">Enter the unique key provided by your host.</p>
        </div>

        <form onSubmit={verifyKey} className="space-y-4">
          <div className="space-y-2">
            <Input 
              type="text" 
              placeholder="0000-0000-0000-0000"
              className="bg-white/5 border-white/10 h-14 text-center text-xl font-mono tracking-widest rounded-2xl focus:ring-primary focus:border-primary"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              required
            />
          </div>
          <Button 
            type="submit" 
            className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-accent font-bold text-lg"
            disabled={isVerifying}
          >
            {isVerifying ? <Loader2 className="animate-spin" /> : "Verify Key"}
          </Button>
        </form>

        <p className="text-center text-sm text-white/40">
          Only authorized members can enter fireproof.ndigtl.app
        </p>
      </div>
    </div>
  );
}
