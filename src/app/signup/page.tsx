
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-accent/5 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-5%] opacity-10 pointer-events-none scale-150">
        <Coffee className="w-96 h-96 text-accent" />
      </div>
      <div className="absolute bottom-[-10%] right-[-5%] opacity-10 pointer-events-none scale-150">
        <Coffee className="w-96 h-96 rotate-12 text-accent" />
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 bg-card rounded-[4rem] shadow-2xl overflow-hidden border border-white relative z-10">
        <div className="p-16 space-y-12 bg-accent text-white relative overflow-hidden flex flex-col justify-center">
          <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
          <div className="relative z-10 space-y-12">
            <h2 className="text-7xl font-headline font-bold leading-tight tracking-tighter">
              Join the <span className="text-primary italic">Success</span> elite.
            </h2>
            <p className="text-white/70 text-2xl font-medium leading-relaxed">
              Every great strategy starts with a single daily task. Brew your perfect routine.
            </p>
            
            <ul className="space-y-8 pt-6">
              {[
                "Strategic routine checklists",
                "Bi-weekly eBook assets",
                "GoalCaps vision vault",
                "MeText Secure Networking"
              ].map((text, i) => (
                <li key={i} className="flex items-center gap-6">
                  <div className="bg-primary p-1.5 rounded-full shadow-lg">
                    <CheckCircle2 className="h-8 w-8 text-accent" />
                  </div>
                  <span className="font-bold text-2xl tracking-tight">{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="p-12 md:p-20 space-y-12 bg-white">
          <div className="space-y-4">
            <h1 className="text-5xl font-headline font-bold text-accent tracking-tight">New Empire</h1>
            <p className="text-2xl text-muted-foreground font-medium">Initialize strategist account.</p>
          </div>

          <div className="flex justify-center gap-6">
            <Button variant="outline" className="rounded-2xl border-accent/10 h-16 w-16 p-0 bg-white shadow-md hover:bg-accent/5">
              <Chrome className="h-8 w-8 text-red-500" />
            </Button>
            <Button variant="outline" className="rounded-2xl border-accent/10 h-16 w-16 p-0 bg-white shadow-md hover:bg-accent/5">
              <Facebook className="h-8 w-8 text-blue-600" />
            </Button>
            <Button variant="outline" className="rounded-2xl border-accent/10 h-16 w-16 p-0 bg-white shadow-md hover:bg-accent/5">
              <Instagram className="h-8 w-8 text-pink-600" />
            </Button>
          </div>

          <form onSubmit={handleSignUp} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-lg font-bold ml-2">First Name</Label>
                <Input placeholder="John" required className="rounded-3xl h-14 bg-secondary/20 border-none px-6 text-xl" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="space-y-3">
                <Label className="text-lg font-bold ml-2">Last Name</Label>
                <Input placeholder="Doe" required className="rounded-3xl h-14 bg-secondary/20 border-none px-6 text-xl" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-lg font-bold ml-2">Strategic Email</Label>
              <Input type="email" placeholder="name@example.com" required className="rounded-3xl h-14 bg-secondary/20 border-none px-6 text-xl" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-3">
              <Label className="text-lg font-bold ml-2">Security Key</Label>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  className="rounded-3xl h-14 bg-secondary/20 border-none px-6 pr-16 text-xl" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSignUp()}
                />
                <button 
                  type="button"
                  onMouseDown={() => setShowPassword(true)}
                  onMouseUp={() => setShowPassword(false)}
                  onMouseLeave={() => setShowPassword(false)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <Eye className="h-6 w-6" /> : <EyeOff className="h-6 w-6" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full rounded-[2.5rem] py-10 bg-primary hover:bg-primary/90 text-accent font-black text-3xl shadow-2xl hover:scale-[1.02] transition-transform active:scale-95" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-10 w-10 animate-spin" /> : "Build My Empire"}
            </Button>
          </form>

          <p className="text-center text-xl text-muted-foreground font-medium">
            Already a strategist?{" "}
            <Link href="/login" className="text-accent font-black hover:text-primary transition-colors border-b-4 border-primary">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
