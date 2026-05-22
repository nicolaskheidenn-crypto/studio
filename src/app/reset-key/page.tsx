'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Coffee, Loader2, Lock, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useAuth } from '@/firebase';

export default function ResetKeyPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
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

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ 
        title: 'Email Required', 
        description: 'Enter your strategic email to proceed.', 
        variant: 'destructive' 
      });
      return;
    }
    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setIsSent(true);
      toast({ title: 'Authorization Dispatched', description: 'Verification link sent to your inbox.' });
    } catch (error: any) {
      toast({ 
        title: 'Request Failed', 
        description: error.message || 'Could not verify email.', 
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
      <div className="absolute top-[-10%] left-[-10%] opacity-5 pointer-events-none -rotate-12 scale-150">
        <Coffee className="w-96 h-96 text-primary" />
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 rounded-[4rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden border-8 border-primary/20 relative z-10 bg-[#1f1610]">
        {/* Left Column: Security Branding */}
        <div className="p-12 md:p-20 space-y-12 bg-[#1f1610] flex flex-col justify-center relative overflow-hidden border-r-4 border-primary/10">
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <Lock className="h-64 w-64 rotate-12 text-primary" />
          </div>
          
          <div className="space-y-12 relative z-10">
            <Link href="/login" className="flex items-center gap-3 text-[#FFD700] hover:text-[#fdfaf6] transition-colors font-black uppercase tracking-widest text-xs">
              <ArrowLeft className="h-5 w-5" /> Back to Login
            </Link>
            <div className="p-8 bg-[#FFD700] rounded-[3rem] w-fit shadow-[0_25px_50px_rgba(255,215,0,0.3)] border-4 border-[#1f1610]">
              <Lock className="h-16 w-16 text-[#1f1610]" />
            </div>
            <div className="space-y-6">
              <h2 className="text-5xl md:text-6xl font-headline font-black leading-none tracking-tighter uppercase text-[#fdfaf6]">
                KEY <span className="text-[#FFD700] italic">RECOVERY</span>
              </h2>
              <div className="h-3 w-40 bg-[#FFD700] rounded-full" />
            </div>
            <p className="text-[#fdfaf6] text-xl leading-relaxed font-black uppercase tracking-[0.2em] max-w-sm">
              Verify your identity to re-establish sovereign access.
            </p>
          </div>
        </div>

        {/* Right Column: Verification Form */}
        <div className="p-12 md:p-20 space-y-14 bg-mocha-cream flex flex-col justify-center">
          {!isSent ? (
            <>
              <div className="space-y-4">
                <h1 className="text-5xl font-headline font-black text-[#1f1610] tracking-tight uppercase italic">Initiate Reset</h1>
                <p className="text-sm text-[#FFD700] font-black uppercase tracking-[0.6em]">Dispatch Verification Link</p>
              </div>

              <form onSubmit={handleResetRequest} className="space-y-10">
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

                <Button
                  type="submit"
                  className="w-full rounded-full h-24 bg-[#FFD700] text-[#1f1610] hover:bg-[#1f1610] hover:text-[#FFD700] font-black text-3xl shadow-[0_30px_60px_rgba(255,215,0,0.3)] border-4 border-[#1f1610]/10 transition-all transform active:scale-95 group uppercase tracking-tighter"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-12 w-12 animate-spin text-[#1f1610]" />
                  ) : (
                    <span className="flex items-center gap-6">
                      VERIFY IDENTITY <Send className="h-10 w-10 group-hover:translate-x-3 transition-transform" />
                    </span>
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div className="space-y-12 text-center animate-in zoom-in duration-700">
              <div className="p-10 bg-primary/10 rounded-[4rem] w-fit mx-auto border-4 border-[#FFD700]">
                <CheckCircle2 className="h-24 w-24 text-[#FFD700]" />
              </div>
              <div className="space-y-6">
                <h1 className="text-5xl font-headline font-black text-[#1f1610] uppercase italic">Link Dispatched</h1>
                <p className="text-xl font-bold text-[#1f1610]/70 leading-relaxed uppercase tracking-widest px-4">
                  Check your inbox for the authorization link to change your security key.
                </p>
              </div>
              <Button
                variant="outline"
                className="rounded-full h-20 px-12 border-4 border-[#1f1610] text-[#1f1610] font-black text-xl uppercase tracking-tighter hover:bg-[#1f1610] hover:text-[#FFD700] transition-all"
                asChild
              >
                <Link href="/login">Return to Root</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
