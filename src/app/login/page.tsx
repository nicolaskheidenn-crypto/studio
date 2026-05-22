'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Coffee, Loader2, Eye, EyeOff, Lock, ArrowRight } from 'lucide-react';
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

  if (!isMounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#1f1610] relative overflow-hidden font-body">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] opacity-5 pointer-events-none rotate-45 scale-150">
        <Coffee className="w-96 h-96 text-primary" />
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 rounded-[4rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden border-8 border-primary/20 relative z-10 bg-[#1f1610]">
        {/* Left Column: Strategist Hub Branding */}
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

        {/* Right Column: High-Contrast Login Form */}
        <div className="p-12 md:p-20 space-y-14 bg-mocha-cream">
          <div className="space-y-4">
            <h1 className="text-5xl font-headline font-black text-[#1f1610] tracking-tight uppercase italic">Access Root</h1>
            <p className="text-sm text-[#FFD700] font-black uppercase tracking-[0.6em]">Protocol Authorization Required</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-10">
            <div className="space-y-4">
              <Label className="text-[#1f1610] font-black text-xs">STRATEGIC EMAIL</Label>
              <Input
                type="email"
                placeholder="name@example.com"
                required
                className="rounded-3xl h-20 bg-[#1f1610]/5 border-[#1f1610]/20 text-[#1f1610] text-2xl font-black px-10 focus:border-[#FFD700]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-[#1f1610] font-black text-xs">SECURITY KEY</Label>
                <Link 
                  href="/reset-key" 
                  className="text-[10px] text-[#FFD700] font-black uppercase underline hover:text-[#1f1610] transition-colors"
                >
                  Forgot Key?
                </Link>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="rounded-3xl h-20 bg-[#1f1610]/5 border-[#1f1610]/20 text-[#1f1610] text-2xl font-black px-10 pr-20 focus:border-[#FFD700]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-8 top-1/2 -translate-y-1/2 text-[#1f1610]/40 hover:text-[#1f1610] transition-colors"
                >
                  {showPassword ? <Eye className="h-8 w-8" /> : <EyeOff className="h-8 w-8" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full rounded-full h-24 bg-[#FFD700] text-[#1f1610] hover:bg-[#1f1610] hover:text-[#FFD700] font-black text-3xl shadow-[0_30px_60px_rgba(255,215,0,0.3)] border-4 border-[#1f1610]/10 transition-all transform active:scale-95 group uppercase tracking-tighter"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-12 w-12 animate-spin text-[#1f1610]" />
              ) : (
                <span className="flex items-center gap-6">
                  AUTHORIZE SESSION <ArrowRight className="h-10 w-10 group-hover:translate-x-3 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          <div className="pt-8 border-t-4 border-[#1f1610]/5 text-center">
            <p className="text-sm text-[#1f1610]/40 font-black uppercase tracking-[0.2em]">
              New strategist?{' '}
              <Link href="/signup" className="text-[#FFD700] font-black hover:underline hover:text-[#1f1610] transition-all">
                Create Empire
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
