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
      <div className="min-h-screen flex flex-col items-center justify-center bg-accent text-white p-4 text-center overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.15),transparent)] pointer-events-none" />
        
        {/* Background Icons */}
        <div className="absolute top-10 left-10 opacity-10 pointer-events-none animate-pulse">
          <Coffee className="w-32 h-32" />
        </div>
        <div className="absolute bottom-10 right-10 opacity-10 pointer-events-none animate-pulse delay-700">
          <Coffee className="w-48 h-48 rotate-45" />
        </div>

        <div className="relative z-10 space-y-12 animate-in fade-in zoom-in duration-1000">
          <div className="p-6 bg-primary/20 rounded-[3rem] w-fit mx-auto border border-primary/30 shadow-2xl">
            <Coffee className="h-20 w-20 text-primary" />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-7xl md:text-9xl font-headline font-bold tracking-tighter leading-none">
              Are you <span className="text-primary italic">READY?</span>
            </h1>
            <p className="text-2xl text-white/70 font-medium max-w-xl mx-auto">
              The fail-proof strategy hub for high earners. Access is restricted to the elite.
            </p>
          </div>

          <Button 
            size="lg" 
            className="rounded-full px-16 py-10 text-3xl font-bold bg-primary hover:bg-primary/90 text-accent transition-all transform hover:scale-110 shadow-[0_0_50px_rgba(255,215,0,0.3)]"
            onClick={handleProceed}
            onContextMenu={(e) => {
              e.preventDefault();
              handleProceed();
            }}
          >
            PROCEED <ArrowRight className="ml-4 h-8 w-8" />
          </Button>
          
          <p className="text-sm text-white/30 uppercase tracking-[0.4em] font-bold">
            Right-click or tap to enter the hub
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-accent text-white p-4 relative overflow-hidden">
       {/* Background Decoration */}
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,215,0,0.1),transparent)] pointer-events-none" />
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
          <Coffee className="w-[800px] h-[800px]" />
       </div>

      <div className="w-full max-w-md space-y-10 animate-in slide-in-from-bottom-20 duration-700 relative z-10">
        <div className="text-center space-y-4">
          <div className="p-4 bg-primary/10 rounded-3xl w-fit mx-auto border border-primary/20">
            <Lock className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-4xl font-headline font-bold">Secure Access</h2>
          <p className="text-white/60 text-lg">Enter the unique 16-digit key provided by your host.</p>
        </div>

        <form onSubmit={verifyKey} className="space-y-6">
          <div className="space-y-2">
            <Input 
              type="text" 
              placeholder="0000-0000-0000-0000"
              className="bg-white/5 border-white/20 h-20 text-center text-3xl font-mono tracking-widest rounded-[2rem] focus:ring-primary focus:border-primary text-primary placeholder:text-white/10"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              required
            />
          </div>
          <Button 
            type="submit" 
            className="w-full h-16 rounded-[1.5rem] bg-primary hover:bg-primary/90 text-accent font-bold text-xl shadow-xl transition-all"
            disabled={isVerifying}
          >
            {isVerifying ? <Loader2 className="animate-spin h-8 w-8" /> : "Verify Access"}
          </Button>
        </form>

        <p className="text-center text-sm text-white/40 font-medium">
          Only authorized members can enter fireproof.ndigtl.app
        </p>
      </div>
    </div>
  );
}
