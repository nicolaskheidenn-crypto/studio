
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Coffee, Chrome, Facebook, Instagram, Mail, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useFirebaseApp } from "@/firebase";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Welcome Back",
        description: "You have successfully signed in to your strategist hub.",
      });
      router.push("/home");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-accent/5">
      <div className="absolute top-8 left-8">
        <Link href="/home" className="flex items-center gap-2 group">
          <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary transition-colors">
            <Coffee className="h-5 w-5 text-accent" />
          </div>
          <span className="font-headline font-bold text-xl text-accent">FireProof</span>
        </Link>
      </div>

      <Card className="w-full max-w-md rounded-[2.5rem] border-accent/10 shadow-2xl overflow-hidden">
        <CardHeader className="space-y-1 text-center bg-primary/5 pb-8">
          <CardTitle className="text-3xl font-headline font-bold">Sign In</CardTitle>
          <CardDescription>Enter your credentials to access your strategist hub</CardDescription>
        </CardHeader>
        <CardContent className="pt-8 space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <Button variant="outline" className="rounded-xl border-accent/20 h-14 bg-white/50 hover:bg-white text-accent font-bold">
              <Chrome className="mr-3 h-5 w-5 text-red-500" /> Google
            </Button>
            <Button variant="outline" className="rounded-xl border-accent/20 h-14 bg-white/50 hover:bg-white text-accent font-bold">
              <Facebook className="mr-3 h-5 w-5 text-blue-600" /> Facebook
            </Button>
            <Button variant="outline" className="rounded-xl border-accent/20 h-14 bg-white/50 hover:bg-white text-accent font-bold">
              <Instagram className="mr-3 h-5 w-5 text-pink-600" /> Instagram
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-accent/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or with email</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                required 
                className="rounded-xl border-accent/20 h-12"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-xs text-accent hover:text-primary underline">Forgot password?</Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                required 
                className="rounded-xl border-accent/20 h-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full rounded-xl py-7 bg-accent hover:bg-accent/90 text-white font-bold text-lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Authenticating...
                </>
              ) : "Sign In"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 bg-accent/5 p-8 text-center border-t border-accent/5">
          <p className="text-sm text-muted-foreground">
            New here?{" "}
            <Link href="/signup" className="text-accent font-bold hover:text-primary transition-colors">Create Account</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
