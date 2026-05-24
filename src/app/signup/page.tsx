
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Coffee, CheckCircle2, Loader2, Eye, EyeOff, ShieldCheck, Zap, Award } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { 
  createUserWithEmailAndPassword, 
  updateProfile as updateAuthProfile
} from 'firebase/auth';
import { useAuth, useFirestore } from '@/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const hasAccess = sessionStorage.getItem('fireproof_access_granted');
    if (hasAccess !== 'true') {
      router.push('/');
    }
  }, [router]);

  const initProfile = async (uid: string, displayName: string | null) => {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        nickname: displayName || 'New Strategist',
        bio: 'New Master Strategist',
        points: 0,
        level: 1,
        xp: 0,
        streak: 0,
        currentTaskDay: 1,
        createdAt: new Date().toISOString()
      }, { merge: true });
    }
  };

  const handleSignUp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password || !firstName) return;
    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const displayName = `${firstName} ${lastName}`.trim();
      
      await updateAuthProfile(userCredential.user, {
        displayName: displayName,
      });

      await initProfile(userCredential.user.uid, displayName);

      toast({ title: 'Empire Founded', description: 'Your strategist account is active.' });
      router.push('/dashboard');
    } catch (error: any) {
      toast({ title: 'Registration Failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#1f1610] relative overflow-hidden font-body">
      <div className="absolute top-[-5%] left-[-5%] opacity-10 pointer-events-none">
        <Coffee className="w-80 h-80 text-primary -rotate-12" />
      </div>
      <div className="absolute bottom-[-5%] right-[-5%] opacity-10 pointer-events-none">
        <Coffee className="w-80 h-80 text-primary rotate-45" />
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 rounded-[3rem] shadow-2xl overflow-hidden border-8 border-primary/20 relative z-10 backdrop-blur-sm bg-[#1f1610]">
        <div className="p-12 md:p-16 space-y-10 bg-[#1f1610] flex flex-col justify-center border-r-4 border-primary/10">
          <div className="space-y-8 relative z-10">
            <div className="flex flex-col mb-8">
              <h1 className="text-9xl font-headline font-black tracking-tighter text-[#fdfaf6] leading-none">ND</h1>
              <div className="h-4 w-40 bg-[#FFD700] rounded-full shadow-[0_0_20px_rgba(255,215,0,0.3)]" />
            </div>
            <h2 className="text-5xl md:text-6xl font-headline font-black leading-tight tracking-tighter uppercase text-[#fdfaf6]">
              Found your <span className="text-primary italic">Sovereign</span> Empire.
            </h2>
            <p className="text-[#fdfaf6] text-xl font-black uppercase tracking-widest leading-relaxed">
              Precision execution infrastructure for high-impact growth.
            </p>

            <ul className="space-y-6 pt-4">
              {[
                'Strategic routine checklists',
                'Advanced FireQuizzo testing',
                'GoalCaps vision vault',
                'Global Resource Syncing',
              ].map((text, i) => (
                <li key={i} className="flex items-center gap-4">
                  <div className="bg-primary p-1.5 rounded-full shadow-lg">
                    <CheckCircle2 className="h-5 w-5 text-[#1f1610]" />
                  </div>
                  <span className="font-black text-lg uppercase tracking-tight text-[#fdfaf6]">{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="p-10 md:p-14 space-y-12 bg-mocha-cream overflow-y-auto">
          <div className="space-y-2 text-center">
            <h1 className="text-4xl md:text-5xl font-headline font-black text-[#1f1610] tracking-tight uppercase italic">Create Account</h1>
            <p className="text-sm text-primary font-black uppercase tracking-[0.4em] opacity-80">Initialize Strategic Protocol</p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-[#1f1610]">First Name</Label>
                <Input
                  placeholder="John"
                  required
                  className="rounded-xl h-14 bg-[#1f1610]/5 border-[#1f1610]/20 text-[#1f1610] text-base font-black px-5"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-[#1f1610]">Last Name</Label>
                <Input
                  placeholder="Doe"
                  required
                  className="rounded-xl h-14 bg-[#1f1610]/5 border-[#1f1610]/20 text-[#1f1610] text-base font-black px-5"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-[#1f1610]">Strategic Email</Label>
              <Input
                type="email"
                placeholder="name@example.com"
                required
                className="rounded-xl h-14 bg-[#1f1610]/5 border-[#1f1610]/20 text-[#1f1610] text-base font-black px-5"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-[#1f1610]">Security Key</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="rounded-xl h-14 bg-[#1f1610]/5 border-[#1f1610]/20 text-[#1f1610] text-base font-black px-5 pr-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1f1610]/40">
                  {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full rounded-2xl h-20 bg-[#FFD700] text-[#1f1610] font-black text-2xl shadow-xl uppercase tracking-widest active:scale-95 transition-all"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-10 w-10 animate-spin" /> : 'BUILD EMPIRE'}
            </Button>
          </form>

          <div className="pt-10 space-y-10 border-t-2 border-[#1f1610]/5">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <p className="text-[8px] font-black uppercase tracking-widest text-[#1f1610]/40">Secure Vault</p>
              </div>
              <div className="space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <p className="text-[8px] font-black uppercase tracking-widest text-[#1f1610]/40">Fast Growth</p>
              </div>
              <div className="space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <p className="text-[8px] font-black uppercase tracking-widest text-[#1f1610]/40">Master Status</p>
              </div>
            </div>

            <p className="text-center text-[10px] text-[#1f1610]/60 font-black uppercase tracking-[0.2em]">
              Already a strategist? <Link href="/login" className="text-primary font-black hover:underline underline-offset-4 decoration-2">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
