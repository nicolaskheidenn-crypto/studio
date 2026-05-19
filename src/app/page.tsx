'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, ArrowRight, Loader2, Coffee } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';

export default function EntryGate() {
  const [step, setStep] = useState<'ready' | 'key'>('ready');
  const [key, setKey] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const router = useRouter();
  const { user, loading } = useUser();

  const ACCESS_KEY = '0924-6719-4345-6581';

  useEffect(() => {
    if (loading) return;
    if (typeof window !== 'undefined') {
      const hasAccess = sessionStorage.getItem('fireproof_access_granted');
      if (hasAccess === 'true') {
        if (user) {
          router.push('/dashboard');
        } else {
          router.push('/login');
        }
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
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('fireproof_access_granted', 'true');
        }
        toast({
          title: 'Access Granted',
          description: 'Welcome to NICO DIGITAL Infrastructure.',
        });
        router.push('/login');
      } else {
        toast({
          title: 'Invalid Key',
          description: 'Verification failed. Access denied.',
          variant: 'destructive',
        });
      }
      setIsVerifying(false);
    }, 1200);
  };

  if (step === 'ready') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-6 text-center overflow-hidden relative">
        {/* Decorative Coffee Elements */}
        <div className="absolute top-[10%] left-[10%] opacity-10 -rotate-12 pointer-events-none">
          <Coffee className="w-48 h-48 md:w-80 md:h-80 text-primary" />
        </div>
        <div className="absolute bottom-[10%] right-[10%] opacity-10 rotate-12 pointer-events-none">
          <Coffee className="w-48 h-48 md:w-80 md:h-80 text-primary" />
        </div>

        <div className="relative z-10 space-y-16 animate-in fade-in zoom-in duration-1000 w-full max-w-2xl">
          <div className="space-y-6">
            <h1 className="text-[12rem] md:text-[18rem] font-headline font-black tracking-tighter text-foreground leading-none select-none">
              ND
            </h1>
            <div className="h-4 w-48 bg-primary mx-auto rounded-full shadow-[0_0_40px_rgba(255,215,0,0.6)]" />
          </div>

          <div className="space-y-6">
            <h2 className="text-5xl md:text-8xl font-headline font-black tracking-tight uppercase">
              NICO <span className="text-primary italic">DIGITAL</span>
            </h2>
            <p className="text-sm md:text-base text-primary font-black uppercase tracking-[0.8em] opacity-80">
              CREATE · CONNECT · GROW
            </p>
          </div>

          <div className="pt-12">
            <Button
              size="lg"
              className="rounded-full px-20 h-24 md:h-32 text-3xl md:text-5xl font-black bg-foreground text-background hover:bg-primary hover:text-background transition-all transform hover:scale-110 shadow-[0_40px_80px_rgba(0,0,0,0.8)] active:scale-95 mx-auto uppercase group border-8 border-primary/20"
              onClick={handleProceed}
            >
              ARE YOU READY? <ArrowRight className="ml-8 h-12 w-12 text-background group-hover:translate-x-4 transition-transform" />
            </Button>
          </div>

          <p className="text-[12px] text-primary/40 uppercase tracking-[1em] font-black pt-20">
            SOVEREIGN EXECUTION HUB
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-6 relative overflow-hidden">
      {/* Background Decor matches the Hub style */}
      <div className="absolute top-[-5%] right-[-5%] opacity-10 pointer-events-none scale-150">
        <Coffee className="w-96 h-96 rotate-45 text-primary" />
      </div>
      <div className="absolute bottom-[-5%] left-[-5%] opacity-5 pointer-events-none">
        <Lock className="h-96 w-96 -rotate-12 text-primary" />
      </div>

      <div className="w-full max-w-2xl space-y-12 animate-in slide-in-from-bottom-20 duration-1000 relative z-10">
        <div className="text-center space-y-8">
          <div className="p-10 bg-primary/20 rounded-[4rem] w-fit mx-auto border-8 border-primary/20 shadow-[0_0_100px_rgba(255,215,0,0.1)]">
            <Lock className="h-20 w-20 text-primary" />
          </div>
          <div className="space-y-4">
            <h2 className="text-6xl font-headline font-black tracking-tight text-foreground uppercase italic">Master Access</h2>
            <p className="text-primary text-sm font-black px-6 leading-relaxed uppercase tracking-[0.5em]">
              ENTER HOST VERIFICATION CODE
            </p>
          </div>
        </div>

        <form onSubmit={verifyKey} className="space-y-12 bg-card/80 p-16 rounded-[4rem] border-8 border-primary/10 shadow-2xl backdrop-blur-xl">
          <div className="space-y-6">
            <Label className="text-primary text-xs font-black uppercase tracking-[0.3em] ml-2">16-Digit Protocol Key</Label>
            <Input
              type="text"
              placeholder="0000-0000-0000-0000"
              className="bg-background/40 border-8 border-primary/20 h-28 text-center text-4xl font-mono tracking-[0.2em] rounded-[2rem] focus:border-primary text-foreground shadow-inner font-black"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              required
              autoFocus
            />
          </div>
          <Button
            type="submit"
            className="w-full h-28 rounded-[2rem] bg-primary text-background hover:bg-foreground hover:text-primary transition-all active:scale-95 font-black text-3xl shadow-[0_30px_60px_rgba(255,215,0,0.3)] uppercase tracking-tighter"
            disabled={isVerifying}
          >
            {isVerifying ? <Loader2 className="animate-spin h-10 w-10" /> : 'AUTHENTICATE HUB'}
          </Button>
        </form>

        <p className="text-center text-[10px] text-primary/30 font-black uppercase tracking-[0.8em]">
          NICO DIGITAL ROOT SECURITY
        </p>
      </div>
    </div>
  );
}
