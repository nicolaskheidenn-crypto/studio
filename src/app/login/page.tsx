'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Coffee, Loader2, Eye, EyeOff, ShieldCheck, Zap, Lock } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '@/firebase';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    const hasAccess = sessionStorage.getItem('fireproof_access_granted');
    if (hasAccess !== 'true') {
      router.push('/');
    }
  }, [router]);

  const handleEmailLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password || isLoading) return;
    setIsLoading(true);

    // LOADING LOOP PROTECTION: 15s Timeout
    const watchdog = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        toast({ title: "Authorization Delay", description: "Command response slow. Please check connection and retry.", variant: "destructive" });
      }
    }, 15000);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      clearTimeout(watchdog);
      toast({ title: 'Access Granted', description: 'Welcome back.' });
      router.push('/dashboard');
    } catch (error: any) {
      clearTimeout(watchdog);
      let errorMsg = error.message;
      if (error.code === 'auth/network-request-failed') errorMsg = "Grid Sync Failure: Unstable network detected.";
      toast({ title: 'Login Failed', description: errorMsg, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#1f1610] relative overflow-hidden font-body text-[#fdfaf6]">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 rounded-[4rem] shadow-2xl overflow-hidden border-8 border-primary/20 relative z-10 bg-[#1f1610]">
        <div className="p-12 md:p-20 bg-[#1f1610] flex flex-col justify-center border-r-4 border-primary/10">
          <div className="space-y-12 relative z-10">
            <div className="space-y-6">
              <div className="flex flex-col">
                <h1 className="text-9xl font-headline font-black tracking-tighter text-[#fdfaf6] leading-none">ND</h1>
                <div className="h-4 w-40 bg-[#FFD700] rounded-full shadow-[0_0_20px_rgba(255,215,0,0.4)]" />
              </div>
              <h2 className="text-5xl md:text-6xl font-headline font-black uppercase text-[#fdfaf6]">
                STRATEGY <span className="text-[#FFD700] italic">HUB</span>
              </h2>
            </div>
            <p className="text-[#fdfaf6] text-xl leading-relaxed font-black uppercase tracking-[0.2em] max-w-sm">
              Sovereign infrastructure for high-impact execution.
            </p>
          </div>
        </div>

        <div className="p-12 md:p-16 space-y-12 bg-mocha-cream overflow-y-auto">
          <div className="space-y-4 text-center">
            <h1 className="text-5xl font-headline font-black text-[#1f1610] tracking-tight uppercase italic">Access Root</h1>
            <p className="text-sm text-[#FFD700] font-black uppercase tracking-[0.6em]">Protocol Authorization Required</p>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-8">
            <div className="space-y-3">
              <Label className="text-[#1f1610] font-black text-[10px]">STRATEGIC EMAIL</Label>
              <Input 
                type="email" 
                placeholder="name@example.com" 
                required 
                className="rounded-2xl h-16 bg-[#1f1610]/5 text-[#1f1610] text-xl font-black px-6" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-[#1f1610] font-black text-[10px]">SECURITY KEY</Label>
                <Link href="/reset-key" className="text-[10px] text-[#FFD700] font-black uppercase underline decoration-2">Forgot Key?</Link>
              </div>
              <div className="relative">
                <Input 
                  type={showPassword ? 'text' : 'password'} 
                  required 
                  className="rounded-2xl h-16 bg-[#1f1610]/5 text-[#1f1610] text-xl font-black px-6 pr-14" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-[#1f1610]/40">
                  {showPassword ? <Eye className="h-6 w-6" /> : <EyeOff className="h-6 w-6" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full rounded-full h-24 bg-[#FFD700] text-[#1f1610] font-black text-2xl shadow-xl uppercase tracking-tighter active:scale-95 transition-all" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-10 w-10 animate-spin" /> : 'AUTHORIZE SESSION'}
            </Button>
          </form>

          <div className="pt-10 space-y-10 border-t-2 border-[#1f1610]/5">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-[#1f1610]/5 rounded-2xl flex items-center justify-center mx-auto">
                  <ShieldCheck className="h-6 w-6 text-[#1f1610]/40" />
                </div>
                <p className="text-[8px] font-black uppercase tracking-widest text-[#1f1610]/30">Encrypted</p>
              </div>
              <div className="space-y-3">
                <div className="w-12 h-12 bg-[#1f1610]/5 rounded-2xl flex items-center justify-center mx-auto">
                  <Zap className="h-6 w-6 text-[#1f1610]/40" />
                </div>
                <p className="text-[8px] font-black uppercase tracking-widest text-[#1f1610]/30">Live Sync</p>
              </div>
              <div className="space-y-3">
                <div className="w-12 h-12 bg-[#1f1610]/5 rounded-2xl flex items-center justify-center mx-auto">
                  <Lock className="h-6 w-6 text-[#1f1610]/40" />
                </div>
                <p className="text-[8px] font-black uppercase tracking-widest text-[#1f1610]/30">Root Only</p>
              </div>
            </div>

            <p className="text-center text-[11px] text-[#1f1610]/40 font-black uppercase tracking-[0.2em]">
              New strategist? <Link href="/signup" className="text-[#FFD700] font-black hover:underline underline-offset-4 decoration-2">Create Account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}