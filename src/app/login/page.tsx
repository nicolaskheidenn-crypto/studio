'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Coffee, Loader2, Eye, EyeOff, Lock, ArrowRight, Phone, Github, Chrome } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithPhoneNumber, 
  RecaptchaVerifier,
  ConfirmationResult
} from 'firebase/auth';
import { useAuth, useFirestore } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    const hasAccess = sessionStorage.getItem('fireproof_access_granted');
    if (hasAccess !== 'true') {
      router.push('/');
    }
  }, [router]);

  const initProfile = async (uid: string, displayName: string | null) => {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', uid), {
        nickname: displayName || 'New Strategist',
        bio: 'New Master Strategist',
        points: 0,
        level: 1,
        xp: 0,
        createdAt: new Date().toISOString()
      });
    }
  };

  const handleEmailLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: 'Access Granted', description: 'Welcome back to NICO DIGITAL.' });
      router.push('/dashboard');
    } catch (error: any) {
      toast({ title: 'Login Failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await initProfile(result.user.uid, result.user.displayName);
      toast({ title: 'Google Authorized', description: `Welcome, ${result.user.displayName}` });
      router.push('/dashboard');
    } catch (error: any) {
      toast({ title: 'Authorization Failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible'
      });
    }
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    setIsLoading(true);
    setupRecaptcha();
    const appVerifier = (window as any).recaptchaVerifier;
    try {
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      toast({ title: 'Code Dispatched', description: 'Check your mobile device.' });
    } catch (error: any) {
      toast({ title: 'Dispatch Failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || !confirmationResult) return;
    setIsLoading(true);
    try {
      const result = await confirmationResult.confirm(verificationCode);
      await initProfile(result.user.uid, 'Strategist');
      toast({ title: 'Phone Verified', description: 'Access Granted.' });
      router.push('/dashboard');
    } catch (error: any) {
      toast({ title: 'Verification Failed', description: 'Invalid security code.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#1f1610] relative overflow-hidden font-body">
      <div id="recaptcha-container"></div>
      <div className="absolute top-[-10%] right-[-10%] opacity-5 pointer-events-none rotate-45 scale-150">
        <Coffee className="w-96 h-96 text-primary" />
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 rounded-[4rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden border-8 border-primary/20 relative z-10 bg-[#1f1610]">
        <div className="p-12 md:p-20 space-y-12 bg-[#1f1610] flex flex-col justify-center relative overflow-hidden border-r-4 border-primary/10">
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <Lock className="h-64 w-64 rotate-12 text-primary" />
          </div>
          
          <div className="space-y-12 relative z-10">
            <div className="p-8 bg-[#FFD700] rounded-[3rem] w-fit shadow-[0_25px_50px_rgba(255,215,0,0.3)] border-4 border-[#1f1610]">
              <Lock className="h-16 w-16 text-[#1f1610]" />
            </div>
            <div className="space-y-6">
              <h2 className="text-5xl md:text-6xl font-headline font-black leading-none tracking-tighter uppercase text-[#fdfaf6]">
                STRATEGY <span className="text-[#FFD700] italic">HUB</span>
              </h2>
              <div className="h-3 w-40 bg-[#FFD700] rounded-full" />
            </div>
            <p className="text-[#fdfaf6] text-xl leading-relaxed font-black uppercase tracking-[0.2em] max-w-sm">
              Sovereign infrastructure for high-impact execution.
            </p>
          </div>
        </div>

        <div className="p-12 md:p-16 space-y-10 bg-mocha-cream overflow-y-auto">
          <div className="space-y-4">
            <h1 className="text-5xl font-headline font-black text-[#1f1610] tracking-tight uppercase italic">Access Root</h1>
            <p className="text-sm text-[#FFD700] font-black uppercase tracking-[0.6em]">Protocol Authorization Required</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className={cn("rounded-2xl h-14 font-black uppercase text-[10px] tracking-widest transition-all", method === 'email' ? "bg-[#1f1610] text-[#FFD700] border-[#1f1610]" : "border-[#1f1610]/10 text-[#1f1610]")}
              onClick={() => setMethod('email')}
            >
              Email Access
            </Button>
            <Button 
              variant="outline" 
              className={cn("rounded-2xl h-14 font-black uppercase text-[10px] tracking-widest transition-all", method === 'phone' ? "bg-[#1f1610] text-[#FFD700] border-[#1f1610]" : "border-[#1f1610]/10 text-[#1f1610]")}
              onClick={() => setMethod('phone')}
            >
              Phone Access
            </Button>
          </div>

          <div className="space-y-6">
            {method === 'email' ? (
              <form onSubmit={handleEmailLogin} className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-[#1f1610] font-black text-[10px]">STRATEGIC EMAIL</Label>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    required
                    className="rounded-2xl h-16 bg-[#1f1610]/5 border-[#1f1610]/20 text-[#1f1610] text-xl font-black px-6"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-[#1f1610] font-black text-[10px]">SECURITY KEY</Label>
                    <Link href="/reset-key" className="text-[9px] text-[#FFD700] font-black uppercase underline">Forgot Key?</Link>
                  </div>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      required
                      className="rounded-2xl h-16 bg-[#1f1610]/5 border-[#1f1610]/20 text-[#1f1610] text-xl font-black px-6 pr-14"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-[#1f1610]/40">
                      {showPassword ? <Eye className="h-6 w-6" /> : <EyeOff className="h-6 w-6" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full rounded-full h-20 bg-[#FFD700] text-[#1f1610] font-black text-2xl shadow-xl uppercase tracking-tighter" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : 'AUTHORIZE SESSION'}
                </Button>
              </form>
            ) : (
              <div className="space-y-6">
                {!confirmationResult ? (
                  <form onSubmit={handleSendCode} className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-[#1f1610] font-black text-[10px]">PHONE NUMBER (E.164)</Label>
                      <Input
                        type="tel"
                        placeholder="+1 555 000 0000"
                        required
                        className="rounded-2xl h-16 bg-[#1f1610]/5 border-[#1f1610]/20 text-[#1f1610] text-xl font-black px-6"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>
                    <Button type="submit" className="w-full rounded-full h-20 bg-[#1f1610] text-[#FFD700] font-black text-xl shadow-xl uppercase" disabled={isLoading}>
                      {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : 'SEND VERIFICATION'}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyCode} className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-[#1f1610] font-black text-[10px]">VERIFICATION CODE</Label>
                      <Input
                        type="text"
                        placeholder="6-Digit Code"
                        required
                        className="rounded-2xl h-16 bg-[#1f1610]/5 border-[#1f1610]/20 text-[#1f1610] text-3xl text-center font-black px-6"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                      />
                    </div>
                    <Button type="submit" className="w-full rounded-full h-20 bg-[#FFD700] text-[#1f1610] font-black text-xl shadow-xl uppercase" disabled={isLoading}>
                      {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : 'VERIFY & ACCESS'}
                    </Button>
                    <button onClick={() => setConfirmationResult(null)} className="w-full text-[10px] font-black text-[#1f1610]/40 uppercase tracking-widest">Change Number</button>
                  </form>
                )}
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#1f1610]/10"></span></div>
              <div className="relative flex justify-center text-[10px] uppercase font-black"><span className="bg-mocha-cream px-4 text-[#1f1610]/40 tracking-widest">Or Continue With</span></div>
            </div>

            <Button 
              variant="outline" 
              className="w-full h-18 rounded-2xl border-4 border-[#1f1610]/10 bg-white font-black text-[#1f1610] uppercase gap-4 hover:bg-primary transition-all"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <Chrome className="h-6 w-6" /> Google SSO
            </Button>
          </div>

          <div className="text-center pt-4 border-t-2 border-[#1f1610]/5">
            <p className="text-[11px] text-[#1f1610]/40 font-black uppercase tracking-[0.2em]">
              New strategist? <Link href="/signup" className="text-[#FFD700] font-black hover:underline">Create Empire</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
