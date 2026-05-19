'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    const hasAccess = sessionStorage.getItem('fireproof_access_granted');
    if (hasAccess === 'true') {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
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
        sessionStorage.setItem('fireproof_access_granted', 'true');
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fdfaf6] text-foreground p-6 text-center overflow-hidden relative">
        {/* Decorative Mocha Vibes */}
        <div className="absolute top-[10%] left-[10%] opacity-10 -rotate-12 pointer-events-none">
          <Coffee className="w-48 h-48 md:w-64 md:h-64 text-foreground" />
        </div>
        <div className="absolute bottom-[10%] right-[10%] opacity-10 rotate-12 pointer-events-none">
          <Coffee className="w-48 h-48 md:w-64 md:h-64 text-foreground" />
        </div>

        <div className="relative z-10 space-y-10 animate-in fade-in zoom-in duration-700 w-full max-w-lg">
          <div className="space-y-4">
            <h1 className="text-8xl md:text-9xl font-headline font-black tracking-tighter text-foreground leading-none">
              ND
            </h1>
            <div className="h-2 w-24 bg-primary mx-auto rounded-full" />
          </div>

          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-headline font-black tracking-tight uppercase">
              NICO <span className="text-primary italic">DIGITAL</span>
            </h2>
            <p className="text-xs text-foreground font-black uppercase tracking-[0.5em] opacity-80">
              CREATE · CONNECT · GROW
            </p>
          </div>

          <div className="pt-8">
            <Button
              size="lg"
              className="rounded-full px-16 h-20 md:h-24 text-2xl font-black bg-foreground text-white hover:bg-primary transition-all transform hover:scale-105 shadow-[0_20px_40px_rgba(0,0,0,0.4)] active:scale-95 mx-auto uppercase group"
              onClick={handleProceed}
            >
              ARE YOU READY? <ArrowRight className="ml-4 h-8 w-8 text-white group-hover:translate-x-2 transition-transform" />
            </Button>
          </div>

          <p className="text-[10px] text-foreground/40 uppercase tracking-[0.6em] font-black pt-16">
            SOVEREIGN EXECUTION HUB
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fdfaf6] text-foreground p-6 relative overflow-hidden">
      <div className="absolute top-[-5%] right-[-5%] opacity-10 pointer-events-none scale-150">
        <Coffee className="w-64 h-64 rotate-45 text-foreground" />
      </div>

      <div className="w-full max-w-md space-y-8 animate-in slide-in-from-bottom-10 duration-700 relative z-10">
        <div className="text-center space-y-4">
          <div className="p-6 bg-primary/20 rounded-2xl w-fit mx-auto border-4 border-foreground/10 shadow-sm">
            <Lock className="h-10 w-10 text-foreground" />
          </div>
          <h2 className="text-3xl font-headline font-black tracking-tight text-foreground uppercase">Master Access</h2>
          <p className="text-foreground/60 text-sm font-bold px-6 leading-relaxed uppercase tracking-widest">
            ENTER HOST VERIFICATION CODE
          </p>
        </div>

        <form onSubmit={verifyKey} className="space-y-6">
          <div className="space-y-2">
            <Label>16-Digit Protocol Key</Label>
            <Input
              type="text"
              placeholder="0000-0000-0000-0000"
              className="bg-white border-4 border-foreground/10 h-20 text-center text-2xl font-mono tracking-[0.15em] rounded-2xl focus:border-primary text-foreground shadow-inner"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              required
              autoFocus
            />
          </div>
          <Button
            type="submit"
            className="w-full h-20 rounded-2xl bg-foreground text-white hover:bg-primary font-black text-xl shadow-xl transition-all active:scale-95"
            disabled={isVerifying}
          >
            {isVerifying ? <Loader2 className="animate-spin h-7 w-7" /> : 'AUTHENTICATE HUB'}
          </Button>
        </form>

        <p className="text-center text-[8px] text-foreground/40 font-black uppercase tracking-[0.5em]">
          NICO DIGITAL ROOT SECURITY
        </p>
      </div>
    </div>
  );
}
