'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Coffee, Chrome, Facebook, Instagram, CheckCircle2, Loader2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useFirebaseApp } from '@/firebase';

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
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

  const handleSignUp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password || !firstName) return;
    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: `${firstName} ${lastName}`.trim(),
      });

      toast({
        title: 'Empire Founded',
        description: 'Your strategist account is active.',
      });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Registration Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
      <div className="absolute top-[-5%] left-[-5%] opacity-10 pointer-events-none">
        <Coffee className="w-80 h-80 text-primary -rotate-12" />
      </div>
      <div className="absolute bottom-[-5%] right-[-5%] opacity-10 pointer-events-none">
        <Coffee className="w-80 h-80 text-primary rotate-45" />
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-secondary/20 rounded-[3rem] shadow-2xl overflow-hidden border border-white/5 relative z-10 backdrop-blur-sm">
        <div className="p-12 md:p-16 space-y-10 bg-secondary/40 text-foreground flex flex-col justify-center border-r border-white/5">
          <div className="space-y-8">
            <h2 className="text-5xl md:text-6xl font-headline font-bold leading-tight tracking-tighter">
              Build your <span className="text-primary italic">Sovereign</span> Empire.
            </h2>
            <p className="text-foreground/70 text-xl font-medium leading-relaxed">
              Every great strategy starts with a single daily task. Nico Digital provides the root for your growth.
            </p>

            <ul className="space-y-6 pt-4">
              {[
                'Strategic routine checklists',
                'Advanced FireQuizzo testing',
                'GoalCaps vision vault',
                'MeText Secure Networking',
              ].map((text, i) => (
                <li key={i} className="flex items-center gap-4">
                  <div className="bg-primary p-1.5 rounded-full shadow-lg">
                    <CheckCircle2 className="h-5 w-5 text-background" />
                  </div>
                  <span className="font-bold text-lg tracking-tight">{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="p-10 md:p-14 space-y-10 bg-background/60">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-headline font-bold text-white tracking-tight uppercase">New Empire</h1>
            <p className="text-sm text-primary font-black uppercase tracking-widest opacity-60">Initialize Strategist Account</p>
          </div>

          <div className="flex justify-start gap-4">
            <Button variant="outline" className="rounded-xl border-primary/20 h-12 w-12 p-0 bg-secondary/50 hover:bg-primary/20">
              <Chrome className="h-6 w-6 text-red-500" />
            </Button>
            <Button variant="outline" className="rounded-xl border-primary/20 h-12 w-12 p-0 bg-secondary/50 hover:bg-primary/20">
              <Facebook className="h-6 w-6 text-blue-600" />
            </Button>
            <Button variant="outline" className="rounded-xl border-primary/20 h-12 w-12 p-0 bg-secondary/50 hover:bg-primary/20">
              <Instagram className="h-6 w-6 text-pink-600" />
            </Button>
          </div>

          <form onSubmit={handleSignUp} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">First Name</Label>
                <Input
                  placeholder="John"
                  required
                  className="rounded-xl h-14 bg-secondary/40 border-primary/10 px-5 text-base"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Last Name</Label>
                <Input
                  placeholder="Doe"
                  required
                  className="rounded-xl h-14 bg-secondary/40 border-primary/10 px-5 text-base"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Strategic Email</Label>
              <Input
                type="email"
                placeholder="name@example.com"
                required
                className="rounded-xl h-14 bg-secondary/40 border-primary/10 px-5 text-base"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Security Key</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="rounded-xl h-14 bg-secondary/40 border-primary/10 px-5 pr-12 text-base"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSignUp()}
                />
                <button
                  type="button"
                  onMouseDown={() => setShowPassword(true)}
                  onMouseUp={() => setShowPassword(false)}
                  onMouseLeave={() => setShowPassword(false)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/60"
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
              {isLoading ? <Loader2 className="h-7 w-7 animate-spin" /> : 'BUILD EMPIRE'}
            </Button>
          </form>

          <p className="text-center text-sm text-foreground/60 font-medium">
            Already a strategist?{' '}
            <Link href="/login" className="text-primary font-black hover:text-white transition-colors underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
