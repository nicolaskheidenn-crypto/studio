'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Coffee, Loader2, Lock, ArrowLeft, Send, CheckCircle2, ShieldCheck, Key } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { sendPasswordResetEmail, confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { useAuth } from '@/firebase';

function ResetKeyContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isResetSuccessful, setIsResetSuccessful] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);

  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const oobCode = searchParams.get('oobCode');

  useEffect(() => {
    if (oobCode) {
      setIsVerifyingCode(true);
      verifyPasswordResetCode(auth, oobCode)
        .then((emailAddress) => {
          setVerifiedEmail(emailAddress);
          setIsVerifyingCode(false);
        })
        .catch((error) => {
          toast({
            title: 'Invalid Protocol',
            description: 'The verification token is expired or invalid.',
            variant: 'destructive',
          });
          setIsVerifyingCode(false);
          router.push('/reset-key');
        });
    }
  }, [oobCode, auth, router, toast]);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: 'Email Required', variant: 'destructive' });
      return;
    }
    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setIsSent(true);
      toast({ title: 'Authorization Dispatched', description: 'Check your inbox for the link.' });
    } catch (error: any) {
      toast({ title: 'Request Failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !oobCode) return;
    setIsLoading(true);

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setIsResetSuccessful(true);
      toast({ title: 'Protocol Re-established', description: 'Your security key has been updated.' });
    } catch (error: any) {
      toast({ title: 'Reset Failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifyingCode) {
    return (
      <div className="flex flex-col items-center gap-6">
        <Loader2 className="h-16 w-16 animate-spin text-[#FFD700]" />
        <p className="text-[#fdfaf6] font-black uppercase tracking-[0.4em]">Verifying Authorization...</p>
      </div>
    );
  }

  if (isResetSuccessful) {
    return (
      <div className="space-y-12 text-center animate-in zoom-in duration-700">
        <div className="p-10 bg-primary/10 rounded-[4rem] w-fit mx-auto border-4 border-[#FFD700]">
          <CheckCircle2 className="h-24 w-24 text-[#FFD700]" />
        </div>
        <div className="space-y-6">
          <h1 className="text-5xl font-headline font-black text-[#1f1610] uppercase italic">Key Restored</h1>
          <p className="text-xl font-bold text-[#1f1610]/70 uppercase tracking-widest">Access granted. Return to root.</p>
        </div>
        <Button className="rounded-full h-20 px-12 bg-[#1f1610] text-[#FFD700] font-black text-xl uppercase shadow-2xl" asChild>
          <Link href="/login">Return to Root</Link>
        </Button>
      </div>
    );
  }

  if (oobCode && verifiedEmail) {
    return (
      <div className="space-y-10">
        <div className="space-y-4">
          <h1 className="text-5xl font-headline font-black text-[#1f1610] tracking-tight uppercase italic">New Passkey</h1>
          <p className="text-sm text-[#FFD700] font-black uppercase tracking-[0.4em]">Updating Account: {verifiedEmail}</p>
        </div>
        <form onSubmit={handleConfirmReset} className="space-y-10">
          <div className="space-y-4">
            <Label className="text-[#1f1610] font-black text-xs">NEW SECURITY KEY</Label>
            <Input
              type="password"
              required
              placeholder="••••••••"
              className="rounded-3xl h-20 bg-[#1f1610]/5 border-[#1f1610]/20 text-[#1f1610] text-3xl font-black px-10"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full rounded-full h-24 bg-[#FFD700] text-[#1f1610] font-black text-2xl shadow-2xl uppercase tracking-tighter" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-10 w-10 animate-spin" /> : 'RESTORE ACCESS'}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-14">
      {!isSent ? (
        <>
          <div className="space-y-4">
            <h1 className="text-5xl font-headline font-black text-[#1f1610] tracking-tight uppercase italic">Identity Verification</h1>
            <p className="text-sm text-[#FFD700] font-black uppercase tracking-[0.6em]">Protocol Recovery Required</p>
          </div>
          <form onSubmit={handleResetRequest} className="space-y-10">
            <div className="space-y-4">
              <Label className="text-[#1f1610] font-black text-xs">STRATEGIC EMAIL</Label>
              <Input
                type="email"
                placeholder="name@example.com"
                required
                className="rounded-3xl h-20 bg-[#1f1610]/5 border-[#1f1610]/20 text-[#1f1610] text-2xl font-black px-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full rounded-full h-24 bg-[#FFD700] text-[#1f1610] font-black text-2xl shadow-2xl uppercase tracking-tighter" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-10 w-10 animate-spin" /> : 'DISPATCH AUTHORIZATION'}
            </Button>
          </form>
        </>
      ) : (
        <div className="space-y-12 text-center animate-in zoom-in duration-700">
          <div className="p-10 bg-primary/10 rounded-[4rem] w-fit mx-auto border-4 border-[#FFD700]">
            <Send className="h-24 w-24 text-[#FFD700]" />
          </div>
          <div className="space-y-6">
            <h1 className="text-5xl font-headline font-black text-[#1f1610] uppercase italic">Link Sent</h1>
            <p className="text-xl font-bold text-[#1f1610]/70 uppercase tracking-widest leading-relaxed">Check your strategic inbox for the authorization link.</p>
          </div>
          <Button variant="outline" className="rounded-full h-20 px-12 border-4 border-[#1f1610] text-[#1f1610] font-black text-xl uppercase tracking-tighter" asChild>
            <Link href="/login">Back to Login</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

export default function ResetKeyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#1f1610] relative overflow-hidden font-body">
      <div className="absolute top-[-10%] left-[-10%] opacity-5 pointer-events-none -rotate-12 scale-150">
        <Coffee className="w-96 h-96 text-primary" />
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 rounded-[4rem] shadow-2xl overflow-hidden border-8 border-primary/20 relative z-10 bg-[#1f1610]">
        <div className="p-12 md:p-20 space-y-12 bg-[#1f1610] flex flex-col justify-center border-r-4 border-primary/10">
          <div className="space-y-12 relative z-10">
            <Link href="/login" className="flex items-center gap-3 text-[#FFD700] hover:text-[#fdfaf6] transition-colors font-black uppercase tracking-widest text-xs">
              <ArrowLeft className="h-5 w-5" /> Back to Login
            </Link>
            <div className="space-y-6">
              <div className="flex flex-col">
                <h1 className="text-9xl font-headline font-black tracking-tighter text-[#fdfaf6] leading-none">ND</h1>
                <div className="h-3 w-32 bg-[#FFD700] rounded-full" />
              </div>
              <h2 className="text-5xl font-headline font-black uppercase text-[#fdfaf6] leading-tight">KEY <span className="text-[#FFD700] italic">RECOVERY</span></h2>
            </div>
            <p className="text-[#fdfaf6] text-xl leading-relaxed font-black uppercase tracking-[0.2em] max-w-sm">
              Sovereign infrastructure for security restoration.
            </p>
          </div>
        </div>

        <div className="p-12 md:p-20 bg-mocha-cream flex flex-col justify-center">
          <Suspense fallback={<Loader2 className="h-10 w-10 animate-spin text-[#FFD700] mx-auto" />}>
            <ResetKeyContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
