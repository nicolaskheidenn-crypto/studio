
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Coffee, Chrome, Facebook, Instagram, CheckCircle2, Loader2, Eye, EyeOff } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);
  
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
        title: "Empire Founded",
        description: "Your strategist account is active.",
      });
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#fdfaf6] relative overflow-hidden">
      {/* Calm Mocha Background */}
      <div className="absolute top-[-10%] left-[-5%] opacity-10 pointer-events-none scale-150">
        <Coffee className="w-80 h-80 text-[#8b5e3c]" />
      </div>
      <div className="absolute bottom-[-10%] right-[-5%] opacity-10 pointer-events-none scale-150">
        <Coffee className="w-80 h-80 rotate-12 text-[#8b5e3c]" />
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-white relative z-10">
        <div className="p-12 md:p-16 space-y-10 bg-accent text-white relative overflow-hidden flex flex-col justify-center">
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary/20 rounded-full blur-[100px]" />
          <div className="relative z-10 space-y-10">
            <h2 className="text-5xl md:text-6xl font-headline font-bold leading-tight tracking-tighter">
              Join the <span className="text-primary italic">Success</span> elite.
            </h2>
            <p className="text-white/70 text-xl font-medium leading-relaxed">
              Every great strategy starts with a single daily task. Nico Digital provides the root for your growth.
            </p>
            
            <ul className="space-y-6 pt-4">
              {[
                "Strategic routine checklists",
                "Advanced FireQuizzo testing",
                "GoalCaps vision vault",
                "MeText Secure Networking"
              ].map((text, i) => (
                <li key={i} className="flex items-center gap-4">
                  <div className="bg-primary p-1 rounded-full shadow-lg">
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                  </div>
                  <span className="font-bold text-lg tracking-tight">{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="p-10 md:p-14 space-y-10 bg-white">
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-headline font-bold text-accent tracking-tight uppercase">New Empire</h1>
            <p className="text-lg text-muted-foreground font-medium">Initialize strategist account.</p>
          </div>

          <div className="flex justify-start gap-4">
            <Button variant="outline" className="rounded-xl border-accent/10 h-12 w-12 p-0 bg-white shadow-sm hover:bg-accent/5">
              <Chrome className="h-6 w-6 text-red-500" />
            </Button>
            <Button variant="outline" className="rounded-xl border-accent/10 h-12 w-12 p-0 bg-white shadow-sm hover:bg-accent/5">
              <Facebook className="h-6 w-6 text-blue-600" />
            </Button>
            <Button variant="outline" className="rounded-xl border-accent/10 h-12 w-12 p-0 bg-white shadow-sm hover:bg-accent/5">
              <Instagram className="h-6 w-6 text-pink-600" />
            </Button>
          </div>

          <form onSubmit={handleSignUp} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-bold ml-1 opacity-60">First Name</Label>
                <Input placeholder="John" required className="rounded-xl h-12 bg-secondary/10 border-none px-5 text-base" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold ml-1 opacity-60">Last Name</Label>
                <Input placeholder="Doe" required className="rounded-xl h-12 bg-secondary/10 border-none px-5 text-base" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold ml-1 opacity-60">Strategic Email</Label>
              <Input type="email" placeholder="name@example.com" required className="rounded-xl h-12 bg-secondary/10 border-none px-5 text-base" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold ml-1 opacity-60">Security Key</Label>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  className="rounded-xl h-12 bg-secondary/10 border-none px-5 pr-12 text-base" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSignUp()}
                />
                <button 
                  type="button"
                  onMouseDown={() => setShowPassword(true)}
                  onMouseUp={() => setShowPassword(false)}
                  onMouseLeave={() => setShowPassword(false)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full rounded-[1.5rem] py-8 bg-primary hover:bg-primary/90 text-accent font-black text-xl shadow-xl transition-all active:scale-95" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-7 w-7 animate-spin" /> : "Build My Empire"}
            </Button>
          </form>

          <p className="text-center text-base text-muted-foreground font-medium">
            Already a strategist?{" "}
            <Link href="/login" className="text-accent font-black hover:text-primary transition-colors border-b-2 border-primary">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
