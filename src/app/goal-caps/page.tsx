
"use client";

import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Hourglass, Lock, Unlock, Send, Calendar } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export default function GoalCapsPage() {
  const [message, setMessage] = useState("");
  const [unlockDate, setUnlockDate] = useState("");
  const [capsules, setCapsules] = useState<any[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message || !unlockDate) return;
    
    const newCap = {
      id: Math.random().toString(),
      message,
      unlockDate,
      createdAt: new Date().toLocaleDateString(),
      isLocked: new Date(unlockDate) > new Date()
    };

    setCapsules([newCap, ...capsules]);
    setMessage("");
    setUnlockDate("");
    
    toast({
      title: "Capsule Sealed",
      description: "Your message is locked until " + new Date(unlockDate).toLocaleDateString(),
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-headline font-bold">Goal<span className="text-primary">Caps</span></h1>
            <p className="text-muted-foreground text-lg">Send a message to your future self. Unlock it only when the time is right.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle>Create Time Capsule</CardTitle>
                <CardDescription>What will Succemazing achieve by this date?</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label>Unlock Date (Month/Day/Year)</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="date" 
                        className="pl-10 h-12 rounded-xl" 
                        value={unlockDate}
                        onChange={(e) => setUnlockDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Message to the Future</Label>
                    <Textarea 
                      placeholder="Today I start my journey... In the future I am..." 
                      className="min-h-[200px] rounded-2xl"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full rounded-full h-14 bg-primary hover:bg-primary/90 text-accent font-bold">
                    <Send className="h-4 w-4 mr-2" /> Seal for Future Succemazing
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Hourglass className="h-5 w-5 text-primary" />
                Active Capsules
              </h3>
              {capsules.length === 0 ? (
                <p className="text-muted-foreground italic">No capsules sealed yet. Start your journey above.</p>
              ) : (
                capsules.map((cap) => (
                  <Card key={cap.id} className={cn("border-dashed border-2", cap.isLocked ? "bg-secondary/20" : "bg-primary/5")}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className={cn("p-3 rounded-full border", cap.isLocked ? "bg-background" : "bg-primary")}>
                            {cap.isLocked ? <Lock className="h-5 w-5 text-muted-foreground" /> : <Unlock className="h-5 w-5 text-white" />}
                          </div>
                          <div>
                            <p className="font-bold">Unlocks: {new Date(cap.unlockDate).toLocaleDateString()}</p>
                            <p className="text-xs text-muted-foreground">Sealed on {cap.createdAt}</p>
                          </div>
                        </div>
                        <Badge variant={cap.isLocked ? "secondary" : "default"}>
                          {cap.isLocked ? "Locked" : "Ready"}
                        </Badge>
                      </div>
                      <div className="p-4 bg-background/50 rounded-xl">
                        {cap.isLocked ? (
                          <p className="text-sm italic text-muted-foreground blur-[2px] select-none">This content is locked for privacy.</p>
                        ) : (
                          <p className="whitespace-pre-wrap">{cap.message}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
