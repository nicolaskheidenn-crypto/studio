
"use client";

import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Hourglass, Lock, Unlock, Send, Calendar as CalendarIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useUserStore } from "@/lib/store";
import { cn } from "@/lib/utils";

/**
 * @fileOverview GoalCapsPage - A sovereign vision archiving system.
 * This component implements the "Time Capsule" feature for long-term goal tracking.
 * It handles hydration to prevent chunk loading errors in Next.js 15.
 */

export default function GoalCapsPage() {
  const { capsules, addCapsule } = useUserStore();
  const [message, setMessage] = useState("");
  const [unlockDate, setUnlockDate] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  // Robust hydration check to prevent chunk/mismatch errors
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message || !unlockDate) {
      toast({
        title: "Protocol Error",
        description: "A target date and strategic narrative are required to seal the vision.",
        variant: "destructive",
      });
      return;
    }
    
    const newCap = {
      id: Math.random().toString(36).substring(2, 11),
      message,
      unlockDate,
      createdAt: new Date().toLocaleDateString(),
    };

    addCapsule(newCap);
    setMessage("");
    setUnlockDate("");
    
    toast({
      title: "Vision Sealed",
      description: "Protocol established. Your message is now encrypted in the vault.",
    });
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40">Syncing Vision Vault...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl">
        <div className="space-y-16">
          <div className="text-center space-y-6 animate-in fade-in slide-in-from-top-4 duration-700">
            <h1 className="text-6xl md:text-8xl font-headline font-black text-foreground uppercase tracking-tighter italic">
              Goal<span className="text-primary">Caps</span>
            </h1>
            <p className="text-primary/60 text-[10px] font-black uppercase tracking-[0.6em] max-w-xl mx-auto leading-relaxed">
              Long-term strategic encryption active. Document your future state today.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Input Side */}
            <Card className="rounded-[4rem] border-8 border-primary/10 bg-mocha-cream p-12 shadow-2xl space-y-12">
              <div className="space-y-4">
                <h3 className="text-4xl font-black text-[#1f1610] uppercase tracking-tight italic">Seal Vision</h3>
                <div className="h-1.5 w-24 bg-primary rounded-full" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="space-y-4">
                  <Label className="text-[#1f1610] font-black text-xs uppercase tracking-widest">Protocol Unlock Date</Label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-primary pointer-events-none" />
                    <Input 
                      type="date" 
                      className="h-20 pl-16 rounded-[2rem] bg-white border-4 border-[#1f1610]/10 text-2xl font-black text-[#1f1610] focus:border-primary transition-colors" 
                      value={unlockDate}
                      onChange={(e) => setUnlockDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-[#1f1610] font-black text-xs uppercase tracking-widest">Strategic Narrative</Label>
                  <Textarea 
                    placeholder="In one year, I have mastered... My empire is..." 
                    className="min-h-[300px] rounded-[3rem] bg-white border-4 border-[#1f1610]/10 p-10 text-xl font-bold text-[#1f1610] placeholder:text-[#1f1610]/20 focus:border-primary transition-colors"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-24 rounded-full bg-[#1f1610] text-primary font-black text-3xl uppercase shadow-[0_30px_60px_rgba(0,0,0,0.3)] hover:scale-[1.02] active:scale-95 transition-all group"
                >
                  <Send className="h-8 w-8 mr-6 group-hover:translate-x-3 transition-transform" /> 
                  SEAL PROTOCOL
                </Button>
              </form>
            </Card>

            {/* List Side */}
            <div className="space-y-10">
              <div className="flex items-center gap-6 px-6">
                <div className="p-4 bg-primary/10 rounded-2xl">
                  <Hourglass className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-foreground uppercase tracking-tighter italic">Sovereign Vault</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">Temporal Records</p>
                </div>
              </div>

              <div className="space-y-8 max-h-[900px] overflow-y-auto pr-4 scrollbar-hide">
                {capsules.length === 0 ? (
                  <div className="p-24 border-8 border-dashed border-primary/10 rounded-[4rem] text-center bg-card/40 animate-in fade-in duration-1000">
                    <Lock className="h-16 w-16 mx-auto text-primary/10 mb-8" />
                    <p className="text-primary/20 font-black uppercase tracking-[0.4em] italic leading-relaxed">
                      Vault Encrypted.<br/>Initialize your first vision to begin.
                    </p>
                  </div>
                ) : (
                  [...capsules].reverse().map((cap) => {
                    const unlockDateObj = new Date(cap.unlockDate);
                    const isLocked = unlockDateObj > new Date();

                    return (
                      <Card 
                        key={cap.id} 
                        className={cn(
                          "rounded-[4rem] border-4 transition-all duration-500 shadow-2xl overflow-hidden animate-in slide-in-from-right-10",
                          isLocked 
                            ? "bg-card/40 border-primary/10" 
                            : "bg-mocha-cream border-primary shadow-primary/20"
                        )}
                      >
                        <CardContent className="p-12 space-y-10">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                              <div className={cn(
                                "w-20 h-20 rounded-[1.8rem] flex items-center justify-center shadow-xl transition-all",
                                isLocked ? "bg-primary/5 text-primary/30" : "bg-[#1f1610] text-primary"
                              )}>
                                {isLocked ? <Lock className="h-10 w-10" /> : <Unlock className="h-10 w-10 animate-pulse" />}
                              </div>
                              <div className="space-y-1">
                                <p className={cn(
                                  "text-2xl font-black uppercase italic tracking-tight",
                                  isLocked ? "text-foreground/40" : "text-[#1f1610]"
                                )}>
                                  {unlockDateObj.toLocaleDateString()}
                                </p>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40">Sealed: {cap.createdAt}</p>
                              </div>
                            </div>
                            <Badge className={cn(
                              "h-12 px-8 rounded-full font-black text-[10px] uppercase tracking-widest border-none shadow-lg",
                              isLocked ? "bg-primary/10 text-primary/40" : "bg-primary text-[#1f1610]"
                            )}>
                              {isLocked ? "ENCRYPTED" : "REVEALED"}
                            </Badge>
                          </div>

                          <div className={cn(
                            "p-10 rounded-[2.5rem] border-4 min-h-[160px] flex items-center transition-all",
                            isLocked 
                              ? "bg-[#1f1610]/40 border-primary/5" 
                              : "bg-white border-[#1f1610]/10 shadow-inner"
                          )}>
                            {isLocked ? (
                              <div className="space-y-6 w-full">
                                <p className="text-xl italic text-primary/10 select-none font-bold leading-relaxed line-clamp-3 blur-[8px]">
                                  This strategic narrative is currently undergoing sovereign encryption. No unauthorized access permitted until target date.
                                </p>
                                <div className="flex gap-4">
                                  <div className="h-2 w-12 bg-primary/10 rounded-full" />
                                  <div className="h-2 w-24 bg-primary/10 rounded-full" />
                                  <div className="h-2 w-8 bg-primary/10 rounded-full" />
                                </div>
                              </div>
                            ) : (
                              <p className="text-2xl font-bold text-[#1f1610] leading-relaxed whitespace-pre-wrap italic italic tracking-tight">
                                {cap.message}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
