'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Coffee, Loader2, Eye, EyeOff, Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
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

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      toast({ 
        title: 'Input Required', 
        description: 'Please enter both credentials.', 
        variant: 'destructive' 
      });
      return;
    }
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: 'Access Granted', description: 'Welcome back to NICO DIGITAL.' });
      router.push('/dashboard');
    } catch (error: any) {
      toast({ 
        title: 'Login Failed', 
        description: error.message || 'Invalid credentials.', 
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({ 
        title: 'Email Required', 
        description: 'Enter your email to reset password.', 
        variant: 'destructive' 
      });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast({ title: 'Email Sent', description: 'Check your inbox for reset instructions.' });
    } catch (e: any) {
      toast({ title: 'Reset Failed', description: e.message, variant: 'destructive' });
    }
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#fdfaf6] relative overflow-hidden">
      {/* Decorative Branding Elements */}
      <div className="absolute top-[-10%] right-[-10%] opacity-10 pointer-events-none rotate-45 scale-150">
        <Coffee className="w-96 h-96 text-primary" />
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[4rem] shadow-[0_50px_100px_rgba(0,0,0,0.15)] overflow-hidden border-8 border-foreground/5 relative z-10">
        {/* Left Column: Branding */}
        <div className="p-12 md:p-16 space-y-8 bg-foreground text-white flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5">
            <Lock className="h-64 w-64 rotate-12" />
          </div>
          
          <div className="space-y-10 relative z-10">
            <div className="p-6 bg-primary rounded-[2.5rem] w-fit shadow-[0_20px_40px_rgba(255,215,0,0.3)]">
              <Lock className="h-12 w-12 text-foreground" />
            </div>
            <div className="space-y-4">
              <h2 className="text-5xl md:text-6xl font-headline font-black leading-none tracking-tighter uppercase">
                STRATEGIST <span className="text-primary italic">HUB</span>
              </h2>
              <div className="h-2 w-32 bg-primary rounded-full" />
            </div>
            <p className="text-white/60 text-lg leading-relaxed font-bold uppercase tracking-widest max-w-xs">
              Sovereign infrastructure for high-impact execution.
            </p>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="p-10 md:p-14 space-y-12 bg-white">
          <div className="space-y-2">
            <h1 className="text-4xl font-headline font-black text-foreground tracking-tight uppercase italic">Access Root</h1>
            <p className="text-[11px] text-primary font-black uppercase tracking-[0.5em]">Protocol Authorization Required</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-3">
              <Label className="text-foreground/60">STRATEGIC EMAIL</Label>
              <Input
                type="email"
                placeholder="name@example.com"
                required
                className="rounded-3xl h-18 bg-secondary/10 border-foreground/10 text-xl font-black px-8"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-foreground/60">SECURITY KEY</Label>
                <button 
                  type="button" 
                  onClick={handleForgotPassword} 
                  className="text-[10px] text-primary font-black uppercase underline hover:text-foreground transition-colors"
                >
                  Forgot Key?
                </button>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="rounded-3xl h-18 bg-secondary/10 border-foreground/10 text-xl font-black px-8 pr-16"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-primary hover:text-foreground transition-colors"
                >
                  {showPassword ? <Eye className="h-6 w-6" /> : <EyeOff className="h-6 w-6" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full rounded-full h-24 bg-foreground text-white hover:bg-primary hover:text-foreground font-black text-2xl shadow-[0_25px_50px_rgba(0,0,0,0.2)] transition-all transform active:scale-95 group"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-10 w-10 animate-spin" />
              ) : (
                <span className="flex items-center gap-4">
                  AUTHORIZE SESSION <ArrowRight className="h-8 w-8 group-hover:translate-x-2 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          <div className="pt-6 border-t border-foreground/5 text-center">
            <p className="text-sm text-foreground/40 font-black uppercase tracking-widest">
              New strategist?{' '}
              <Link href="/signup" className="text-primary font-black hover:underline hover:text-foreground transition-all">
                Create Empire
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
