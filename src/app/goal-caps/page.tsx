
"use client";

import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Hourglass, Lock, Unlock, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export default function GoalCapsPage() {
  const [message, setMessage] = useState("");
  const [capsules, setCapsules] = useState([
    { id: '1', date: '2025-05-20', unlockDate: '2030-05-20', locked: true },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message) return;
    
    toast({
      title: "Capsule Sealed",
      description: "Your message has been locked for 5 years.",
    });
    setMessage("");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-headline font-bold">Goal<span className="text-primary">Caps</span></h1>
            <p className="text-muted-foreground text-lg">Communicate with your future self. What will you achieve in 5 years?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Create Time Capsule</CardTitle>
                <CardDescription>Seal your message until {new Date().getFullYear() + 5}.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label>Message to the Future</Label>
                    <Textarea 
                      placeholder="Today I start my journey to digital mastery..." 
                      className="min-h-[200px]"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full rounded-full bg-primary hover:bg-primary/90">
                    <Send className="h-4 w-4 mr-2" /> Seal Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Hourglass className="h-5 w-5 text-primary" />
                Your Active Capsules
              </h3>
              {capsules.map((cap) => (
                <Card key={cap.id} className="bg-secondary/20 border-dashed">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-background rounded-full border">
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-bold">Sealed on {cap.date}</p>
                        <p className="text-sm text-muted-foreground">Unlocks on {cap.unlockDate}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Locked</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
