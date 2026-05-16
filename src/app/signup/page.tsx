
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Coffee, Chrome, Facebook, Instagram, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
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
      
      router.push("/");
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-accent/5">
      <div className="absolute top-8 left-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary transition-colors">
            <Coffee className="h-5 w-5 text-accent" />
          </div>
          <span className="font-headline font-bold text-xl text-accent">FireProof</span>
        </Link>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-card rounded-[2.5rem] shadow-2xl overflow-hidden border border-accent/10">
        <div className="p-12 space-y-8 bg-accent text-white hidden lg:block relative overflow-hidden">
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
          <div className="relative z-10 space-y-6">
            <h2 className="text-4xl font-headline font-bold leading-tight">Join the next generation of <span className="text-primary italic">earners</span>.</h2>
            <p className="text-white/70 text-lg">Every great strategy starts with a single daily task. We'll help you brew the perfect routine.</p>
            
            <ul className="space-y-4 pt-8">
              {[
                "Automated daily strategic checklists",
                "Bi-weekly exclusive eBook drops",
                "GoalCaps time-locking for vision",
                "Mocha-themed high-focus environment"
              ].map((text, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                  <span className="font-medium">{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="p-12 space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-headline font-bold">Create Account</h1>
            <p className="text-muted-foreground">Join FireProof and start earning more.</p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first-name">First Name</Label>
                <Input 
                  id="first-name" 
                  placeholder="John" 
                  required 
                  className="rounded-xl border-accent/20"
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
                  className="rounded-xl border-accent/20"
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
                className="rounded-xl border-accent/20"
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
                className="rounded-xl border-accent/20"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full rounded-xl py-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : "Get Started Now"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-accent/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or sign up with</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Button variant="outline" className="rounded-xl border-accent/20 h-12 p-0">
              <Chrome className="h-5 w-5" />
            </Button>
            <Button variant="outline" className="rounded-xl border-accent/20 h-12 p-0">
              <Facebook className="h-5 w-5 text-blue-600" />
            </Button>
            <Button variant="outline" className="rounded-xl border-accent/20 h-12 p-0">
              <Instagram className="h-5 w-5 text-pink-600" />
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-accent font-bold hover:text-primary transition-colors">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
