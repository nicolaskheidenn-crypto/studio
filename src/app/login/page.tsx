'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Coffee, Chrome, Facebook, Instagram, Loader2, Eye, EyeOff, Lock } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { useFirebaseApp } from '@/firebase';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const app = useFirebaseApp();
  const auth = getAuth(app);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const hasAccess = sessionStorage.getItem('fireproof_access_granted');
    if (hasAccess !== 'true') {
      router.push('/');
    }
  }, [router]);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      toast({ title: 'Input Required', description: 'Please enter both credentials.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: 'Access Granted', description: 'Welcome back to NICO DIGITAL.' });
      router.push('/dashboard');
    } catch (error: any) {
      toast({ title: 'Login Failed', description: error.message || 'Invalid credentials.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({ title: 'Email Required', description: 'Enter your email to reset password.', variant: 'destructive' });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast({ title: 'Email Sent', description: 'Check your inbox for reset instructions.' });
    } catch (e: any) {
      toast({ title: 'Reset Failed', description: e.message, variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#fdfaf6] relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] opacity-10 pointer-events-none rotate-45 scale-150">
        <Coffee className="w-96 h-96 text-foreground" />
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border-4 border-foreground/5 relative z-10">
        <div className="p-12 md:p-16 space-y-8 bg-foreground text-white flex flex-col justify-center">
          <div className="space-y-6">
            <div className="p-5 bg-primary rounded-3xl w-fit shadow-xl">
              <Lock className="h-10 w-10 text-foreground" />
            </div>
            <h2 className="text-4xl md:text-5xl font-headline font-black leading-tight tracking-tighter uppercase">
              STRATEGIST <span className="text-primary italic">HUB</span>.
            </h2>
            <p className="text-white/60 text-lg leading-relaxed font-bold uppercase tracking-widest">
              Nico Digital Infrastructure ensures high-focus session stability.
            </p>
          </div>
        </div>

        <div className="p-10 md:p-14 space-y-10">
          <div className="space-y-2">
            <h1 className="text-3xl font-headline font-black text-foreground tracking-tight uppercase italic">Sign In</h1>
            <p className="text-[10px] text-primary font-black uppercase tracking-[0.5em]">Protocol Authorization</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label>Strategic Email</Label>
              <Input
                type="email"
                placeholder="name@example.com"
                required
                className="rounded-2xl h-16 bg-secondary/20 border-foreground/10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Security Key</Label>
                <button type="button" onClick={handleForgotPassword} className="text-[10px] text-primary font-black uppercase underline">Forgot Key?</button>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="rounded-2xl h-16 bg-secondary/20 border-foreground/10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-primary"
                >
                  {showPassword ? <Eye className="h-6 w-6" /> : <EyeOff className="h-6 w-6" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full rounded-2xl h-20 bg-foreground text-white hover:bg-primary hover:text-foreground font-black text-xl shadow-xl transition-all"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : 'ACCESS HUB'}
            </Button>
          </form>

          <p className="text-center text-sm text-foreground/40 font-black uppercase tracking-widest">
            New strategist?{' '}
            <Link href="/signup" className="text-primary font-black hover:underline">Create Empire</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
