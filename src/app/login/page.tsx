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
    if (!email || !password) return;
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: 'Access Granted',
        description: 'Welcome back to the strategist hub.',
      });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: 'Invalid credentials. Ensure your strategy is correct.',
        variant: 'destructive',
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
        variant: 'destructive',
      });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: 'Email Sent',
        description: 'Check your inbox for reset instructions.',
      });
    } catch (e: any) {
      toast({ title: 'Reset Failed', description: e.message, variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
      {/* Decorative Branding */}
      <div className="absolute top-[-5%] right-[-5%] opacity-10 pointer-events-none">
        <Coffee className="w-64 h-64 text-primary rotate-45" />
      </div>
      <div className="absolute bottom-[-5%] left-[-5%] opacity-10 pointer-events-none">
        <Coffee className="w-64 h-64 text-primary -rotate-12" />
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 bg-secondary/20 rounded-[3rem] shadow-2xl overflow-hidden border border-white/5 relative z-10 backdrop-blur-sm">
        <div className="p-12 md:p-16 space-y-8 bg-secondary/40 text-foreground flex flex-col justify-center border-r border-white/5">
          <div className="space-y-6">
            <div className="p-5 bg-primary/10 rounded-2xl w-fit border border-primary/20">
              <Lock className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-4xl md:text-5xl font-headline font-bold leading-tight">
              Return to <span className="text-primary italic">Consistency</span>.
            </h2>
            <p className="text-foreground/70 text-lg leading-relaxed font-medium">
              Nico Digital Infrastructure ensures your high-focus sessions are uninterrupted and productive.
            </p>
          </div>
        </div>

        <div className="p-10 md:p-14 space-y-8 bg-background/60">
          <div className="space-y-2">
            <h1 className="text-3xl font-headline font-bold text-white tracking-tight uppercase">Sign In</h1>
            <p className="text-sm text-primary font-black uppercase tracking-widest opacity-60">Strategist Identity</p>
          </div>

          <div className="flex justify-start gap-4">
            <Button variant="outline" className="rounded-xl border-primary/20 h-12 w-12 p-0 bg-secondary/50 hover:bg-primary/20 transition-colors">
              <Chrome className="h-6 w-6 text-red-500" />
            </Button>
            <Button variant="outline" className="rounded-xl border-primary/20 h-12 w-12 p-0 bg-secondary/50 hover:bg-primary/20 transition-colors">
              <Facebook className="h-6 w-6 text-blue-600" />
            </Button>
            <Button variant="outline" className="rounded-xl border-primary/20 h-12 w-12 p-0 bg-secondary/50 hover:bg-primary/20 transition-colors">
              <Instagram className="h-6 w-6 text-pink-600" />
            </Button>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Strategic Email</Label>
              <Input
                type="email"
                placeholder="name@example.com"
                required
                className="rounded-xl h-14 bg-secondary/40 border-primary/10 px-5 text-base focus:border-primary transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <Label className="text-xs font-bold uppercase tracking-widest opacity-60">Security Key</Label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[10px] text-primary hover:text-white font-black uppercase tracking-tighter underline"
                >
                  Forgot Key?
                </button>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="rounded-xl h-14 bg-secondary/40 border-primary/10 px-5 pr-12 text-base focus:border-primary transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
                <button
                  type="button"
                  onMouseDown={() => setShowPassword(true)}
                  onMouseUp={() => setShowPassword(false)}
                  onMouseLeave={() => setShowPassword(false)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/60 hover:text-primary transition-colors"
                >
                  {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full rounded-2xl h-16 bg-primary text-background hover:bg-white font-black text-lg shadow-xl transition-all active:scale-95"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'ACCESS HUB'}
            </Button>
          </form>

          <p className="text-center text-sm text-foreground/60 font-medium">
            New strategist?{' '}
            <Link href="/signup" className="text-primary font-black hover:text-white transition-colors underline">
              Create Empire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
