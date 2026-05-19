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
          <Coffee className="w-48 h-48 md:w-64 md:h-64 text-primary" />
        </div>
        <div className="absolute bottom-[10%] right-[10%] opacity-10 rotate-12 pointer-events-none">
          <Coffee className="w-48 h-48 md:w-64 md:h-64 text-primary" />
        </div>

        <div className="relative z-10 space-y-12 animate-in fade-in zoom-in duration-700 w-full max-w-lg">
          <div className="space-y-4">
            <h1 className="text-8xl md:text-9xl font-headline font-black tracking-tighter text-foreground leading-none">
              ND
            </h1>
            <div className="h-2.5 w-32 bg-primary mx-auto rounded-full shadow-[0_0_20px_rgba(255,215,0,0.5)]" />
          </div>

          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-headline font-black tracking-tight uppercase">
              NICO <span className="text-primary italic">DIGITAL</span>
            </h2>
            <p className="text-xs text-primary font-black uppercase tracking-[0.5em] opacity-80">
              CREATE · CONNECT · GROW
            </p>
          </div>

          <div className="pt-8">
            <Button
              size="lg"
              className="rounded-full px-16 h-20 md:h-24 text-2xl font-black bg-foreground text-white hover:bg-primary hover:text-background transition-all transform hover:scale-105 shadow-[0_30px_60px_rgba(0,0,0,0.5)] active:scale-95 mx-auto uppercase group"
              onClick={handleProceed}
            >
              ARE YOU READY? <ArrowRight className="ml-4 h-8 w-8 text-white group-hover:translate-x-2 transition-transform" />
            </Button>
          </div>

          <p className="text-[10px] text-primary/40 uppercase tracking-[0.6em] font-black pt-16">
            SOVEREIGN EXECUTION HUB
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-6 relative overflow-hidden">
      <div className="absolute top-[-5%] right-[-5%] opacity-10 pointer-events-none scale-150">
        <Coffee className="w-64 h-64 rotate-45 text-primary" />
      </div>

      <div className="w-full max-w-md space-y-8 animate-in slide-in-from-bottom-10 duration-700 relative z-10">
        <div className="text-center space-y-4">
          <div className="p-6 bg-primary/20 rounded-3xl w-fit mx-auto border-4 border-primary/20 shadow-xl">
            <Lock className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-4xl font-headline font-black tracking-tight text-foreground uppercase italic">Master Access</h2>
          <p className="text-primary/60 text-xs font-bold px-6 leading-relaxed uppercase tracking-widest">
            ENTER HOST VERIFICATION CODE
          </p>
        </div>

        <form onSubmit={verifyKey} className="space-y-8 bg-card/40 p-10 rounded-[3rem] border-4 border-primary/10 shadow-2xl backdrop-blur-md">
          <div className="space-y-3">
            <Label>16-Digit Protocol Key</Label>
            <Input
              type="text"
              placeholder="0000-0000-0000-0000"
              className="bg-background/50 border-4 border-primary/20 h-20 text-center text-2xl font-mono tracking-[0.15em] rounded-2xl focus:border-primary text-foreground shadow-inner"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              required
              autoFocus
            />
          </div>
          <Button
            type="submit"
            className="w-full h-20 rounded-2xl bg-primary text-background hover:bg-white hover:text-primary font-black text-xl shadow-xl transition-all active:scale-95"
            disabled={isVerifying}
          >
            {isVerifying ? <Loader2 className="animate-spin h-7 w-7" /> : 'AUTHENTICATE HUB'}
          </Button>
        </form>

        <p className="text-center text-[9px] text-primary/30 font-black uppercase tracking-[0.5em]">
          NICO DIGITAL ROOT SECURITY
        </p>
      </div>
    </div>
  );
}