
"use client";

import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Hourglass, Lock, Unlock, Send, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useUserStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function GoalCapsPage() {
  const { capsules, addCapsule } = useUserStore();
  const [message, setMessage] = useState("");
  const [unlockDate, setUnlockDate] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message || !unlockDate) return;
    
    const newCap = {
      id: Math.random().toString(),
      message,
      unlockDate,
      createdAt: new Date().toLocaleDateString(),
    };

    addCapsule(newCap);
    setMessage("");
    setUnlockDate("");
    
    toast({
      title: "Capsule Sealed",
      description: "Your vision is now locked until " + new Date(unlockDate).toLocaleDateString(),
    });
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen flex flex-col bg-secondary/5">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <div className="space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-accent">Goal<span className="text-primary">Caps</span></h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Send a message to your future self. Unlock it only when the time is right. Nico Digital encryption active.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="shadow-xl rounded-[2.5rem] border-white border-4">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold">Seal a Vision</CardTitle>
                <CardDescription>Define your success parameters for the future.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="font-bold ml-1">Target Unlock Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input 
                        type="date" 
                        className="pl-12 h-14 rounded-2xl bg-secondary/10 border-none text-lg" 
                        value={unlockDate}
                        onChange={(e) => setUnlockDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold ml-1">Strategic Message</Label>
                    <Textarea 
                      placeholder="Today I start my journey... In the future I am..." 
                      className="min-h-[220px] rounded-3xl bg-secondary/10 border-none p-6 text-lg"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full rounded-full h-16 bg-accent hover:bg-accent/90 text-white font-black text-xl shadow-lg transition-transform active:scale-95">
                    <Send className="h-6 w-6 mr-3" /> Seal for Future Succemazing
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <h3 className="text-2xl font-black text-accent flex items-center gap-3">
                <Hourglass className="h-6 w-6 text-primary" />
                Active Vision Vault
              </h3>
              <div className="space-y-4">
                {capsules.length === 0 ? (
                  <div className="p-12 border-4 border-dashed rounded-[2.5rem] text-center bg-white/50">
                    <p className="text-muted-foreground italic font-medium">No capsules sealed yet. Initialize your first vision above.</p>
                  </div>
                ) : (
                  capsules.map((cap) => {
                    const isLocked = new Date(cap.unlockDate) > new Date();
                    return (
                      <Card key={cap.id} className={cn("border-2 rounded-[2rem] transition-all", isLocked ? "bg-white/40 border-accent/5" : "bg-primary/5 border-primary/20 shadow-md")}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <div className={cn("p-3 rounded-2xl border", isLocked ? "bg-white" : "bg-primary")}>
                                {isLocked ? <Lock className="h-6 w-6 text-muted-foreground" /> : <Unlock className="h-6 w-6 text-accent" />}
                              </div>
                              <div>
                                <p className="font-black text-accent">Unlocks: {new Date(cap.unlockDate).toLocaleDateString()}</p>
                                <p className="text-xs text-muted-foreground font-bold">Sealed {cap.createdAt}</p>
                              </div>
                            </div>
                            <Badge variant={isLocked ? "secondary" : "default"} className="h-6 rounded-full px-3">
                              {isLocked ? "ENCRYPTED" : "REVEALED"}
                            </Badge>
                          </div>
                          <div className="p-5 bg-white/80 rounded-2xl border border-accent/5">
                            {isLocked ? (
                              <p className="text-sm italic text-muted-foreground/30 blur-[4px] select-none font-medium leading-relaxed">
                                This vision is strictly encrypted until the specified target date has been reached for privacy and consistency.
                              </p>
                            ) : (
                              <p className="whitespace-pre-wrap font-medium text-accent leading-relaxed">{cap.message}</p>
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
