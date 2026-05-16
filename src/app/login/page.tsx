
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Coffee, Github, Chrome, Facebook, Instagram, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Coming Soon",
        description: "Authentication is being integrated. Please check back later!",
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-accent/5">
      <div className="absolute top-8 left-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary transition-colors">
            <Coffee className="h-5 w-5 text-accent" />
          </div>
          <span className="font-headline font-bold text-xl">FireProof</span>
        </Link>
      </div>

      <Card className="w-full max-w-md rounded-3xl border-accent/10 shadow-2xl overflow-hidden">
        <CardHeader className="space-y-1 text-center bg-primary/5 pb-8">
          <CardTitle className="text-3xl font-headline font-bold">Welcome Back</CardTitle>
          <CardDescription>Enter your credentials to access your strategist hub</CardDescription>
        </CardHeader>
        <CardContent className="pt-8 space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="name@example.com" required className="rounded-xl border-accent/20" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-xs text-accent hover:text-primary underline">Forgot password?</Link>
              </div>
              <Input id="password" type="password" required className="rounded-xl border-accent/20" />
            </div>
            <Button type="submit" className="w-full rounded-xl py-6 bg-accent hover:bg-accent/90 text-white font-bold" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-accent/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="rounded-xl border-accent/20 h-12">
              <Chrome className="mr-2 h-4 w-4" /> Google
            </Button>
            <Button variant="outline" className="rounded-xl border-accent/20 h-12">
              <Facebook className="mr-2 h-4 w-4 text-blue-600" /> Facebook
            </Button>
            <Button variant="outline" className="rounded-xl border-accent/20 h-12">
              <Instagram className="mr-2 h-4 w-4 text-pink-600" /> Instagram
            </Button>
            <Button variant="outline" className="rounded-xl border-accent/20 h-12">
              <Mail className="mr-2 h-4 w-4" /> Email
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 bg-accent/5 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/signup" className="text-accent font-bold hover:text-primary transition-colors">Sign Up</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
