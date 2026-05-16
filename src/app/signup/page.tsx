
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Coffee, Chrome, Facebook, Instagram, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useFirebaseApp } from "@/firebase";

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  
  const app = useFirebaseApp();
  const auth = getAuth(app);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const hasAccess = sessionStorage.getItem("fireproof_access_granted");
    if (hasAccess !== "true") {
      router.push("/");
    }
  }, [router]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: `${firstName} ${lastName}`.trim(),
      });
      
      toast({
        title: "Welcome to FireProof",
        description: "Your account has been created successfully. You are now logged in.",
      });
      
      router.push("/home");
    } catch (error: any) {
      toast({
        title: "Sign Up Failed",
        description: error.message || "An error occurred during registration.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-accent/5 relative overflow-hidden">
      {/* Background Coffee Decoration */}
      <div className="absolute top-[-10%] left-[-5%] opacity-5 pointer-events-none">
        <Coffee className="w-96 h-96" />
      </div>
      <div className="absolute bottom-[-10%] right-[-5%] opacity-5 pointer-events-none">
        <Coffee className="w-96 h-96 rotate-12" />
      </div>

      <div className="absolute top-8 left-8 z-20">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-primary/20 rounded-lg group-hover:bg-primary transition-colors">
            <Coffee className="h-5 w-5 text-accent" />
          </div>
          <span className="font-headline font-bold text-xl text-accent">FireProof</span>
        </Link>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-card rounded-[3rem] shadow-2xl overflow-hidden border border-accent/10 relative z-10">
        {/* Left Side: Mocha Branding */}
        <div className="p-12 space-y-8 bg-accent text-white relative overflow-hidden flex flex-col justify-center">
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="relative z-10 space-y-8">
            <h2 className="text-5xl font-headline font-bold leading-tight">
              Join the next generation of <span className="text-primary italic">earners</span>.
            </h2>
            <p className="text-white/70 text-lg leading-relaxed">
              Every great strategy starts with a single daily task. We'll help you brew the perfect routine.
            </p>
            
            <ul className="space-y-6 pt-4">
              {[
                "Automated daily strategic checklists",
                "Bi-weekly exclusive eBook drops",
                "GoalCaps time-locking for vision",
                "Mocha-themed high-focus environment"
              ].map((text, i) => (
                <li key={i} className="flex items-center gap-4">
                  <div className="bg-primary/20 p-1 rounded-full">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <span className="font-medium text-lg">{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Side: Sign Up Form */}
        <div className="p-10 md:p-14 space-y-10 bg-white">
          <div className="space-y-2">
            <h1 className="text-4xl font-headline font-bold text-accent">New Account</h1>
            <p className="text-muted-foreground text-lg">Join FireProof and start earning more.</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Button variant="outline" className="rounded-xl border-accent/10 h-14 p-0 bg-white hover:bg-accent/5 transition-all shadow-sm">
              <Chrome className="h-6 w-6 text-red-500" />
            </Button>
            <Button variant="outline" className="rounded-xl border-accent/10 h-14 p-0 bg-white hover:bg-accent/5 transition-all shadow-sm">
              <Facebook className="h-6 w-6 text-blue-600" />
            </Button>
            <Button variant="outline" className="rounded-xl border-accent/10 h-14 p-0 bg-white hover:bg-accent/5 transition-all shadow-sm">
              <Instagram className="h-6 w-6 text-pink-600" />
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-accent/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-muted-foreground font-bold tracking-widest">Or with email</span>
            </div>
          </div>

          <form onSubmit={handleSignUp} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first-name">First Name</Label>
                <Input 
                  id="first-name" 
                  placeholder="John" 
                  required 
                  className="rounded-xl border-accent/10 h-12 bg-secondary/10"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">Last Name</Label>
                <Input 
                  id="last-name" 
                  placeholder="Doe" 
                  required 
                  className="rounded-xl border-accent/10 h-12 bg-secondary/10"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                required 
                className="rounded-xl border-accent/10 h-12 bg-secondary/10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                className="rounded-xl border-accent/10 h-12 bg-secondary/10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full rounded-2xl py-8 bg-primary hover:bg-primary/90 text-accent font-bold text-xl shadow-xl shadow-primary/20 transition-transform active:scale-[0.98]" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  Creating account...
                </>
              ) : "Get Started Now"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-accent font-bold hover:text-primary transition-colors">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
