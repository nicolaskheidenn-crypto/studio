
"use client";

import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Crown, Download, Mail, Lock, UserPlus, Search, Send, Smile, Image as ImageIcon, Video, UserCheck, Bell, MessageCircle } from "lucide-react";
import { useUser } from "@/firebase";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const HOST_EMAIL = "nicolaskheidenn@gmail.com";

export default function DashboardPage() {
  const { user, loading } = useUser();
  const isHost = user?.email === HOST_EMAIL;
  
  const [searchQuery, setSearchQuery] = useState("");
  const [chatUser, setChatUser] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const handleNotifyMe = () => {
    toast({
      title: "Notification Set",
      description: "We'll email you when the next eBook drops!",
    });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-headline font-bold text-4xl animate-pulse text-accent">STABILIZING...</div>;

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <Card className="max-w-xl w-full p-12 text-center rounded-[3rem] border-dashed border-2 bg-accent/5">
             <Lock className="h-20 w-20 mx-auto text-accent/20 mb-6" />
             <h2 className="text-4xl font-headline font-bold mb-4">Elite Access Restricted</h2>
             <p className="text-xl text-muted-foreground mb-12">Login to unlock your strategic dashboard, social hub, and eBooks.</p>
             <Button className="h-16 px-12 rounded-full text-xl font-bold bg-accent shadow-xl" asChild>
                <a href="/login">Join FireProof</a>
             </Button>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
          <div className="space-y-1">
            <h1 className="text-5xl font-headline font-bold text-accent">Welcome, Succemazing</h1>
            <p className="text-xl text-muted-foreground">The strategic center of fireproof.ndigtl.app</p>
          </div>
          <div className="flex gap-4">
             <Button variant="outline" className="rounded-full h-12 border-accent text-accent">
                <Bell className="h-5 w-5 mr-2" /> <Badge className="bg-primary text-accent ml-2">2</Badge>
             </Button>
             {isHost && (
              <Button className="bg-amber-600 hover:bg-amber-500 rounded-full h-12 font-bold shadow-lg shadow-amber-600/20" asChild>
                <a href="/admin"><Crown className="h-5 w-5 mr-2" /> Host Portal</a>
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
           <TabsList className="bg-secondary/40 p-1.5 rounded-full w-fit">
              <TabsTrigger value="overview" className="rounded-full px-8 h-10 font-bold">Strategy Core</TabsTrigger>
              <TabsTrigger value="social" className="rounded-full px-8 h-10 font-bold">Social & Messenger</TabsTrigger>
           </TabsList>

           <TabsContent value="overview" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 rounded-[2.5rem] border-accent/10 shadow-2xl overflow-hidden bg-white">
                <CardHeader className="bg-accent text-white p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-3xl font-headline">Upcoming eBooks</CardTitle>
                      <CardDescription className="text-white/60 text-lg">New strategic assets dropping every 14 days.</CardDescription>
                    </div>
                    <Button variant="secondary" className="rounded-full font-bold h-12" onClick={handleNotifyMe}>
                      <Mail className="h-4 w-4 mr-2" /> Notify Me
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center justify-between p-6 bg-secondary/20 rounded-[2rem] border-2 border-transparent hover:border-primary/50 transition-all group">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-primary text-accent rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <BookOpen className="h-8 w-8" />
                      </div>
                      <div>
                        <h4 className="text-2xl font-bold">Mocha Strategy Vol. 1</h4>
                        <p className="text-muted-foreground">Strategic focus for early earners • FREE</p>
                      </div>
                    </div>
                    <Button className="rounded-full h-14 px-8 font-bold bg-accent">
                      <Download className="h-5 w-5 mr-2" /> Download
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-6 bg-secondary/10 rounded-[2rem] opacity-50 grayscale border-2 border-dashed border-accent/10">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-muted text-muted-foreground rounded-2xl flex items-center justify-center">
                        <Lock className="h-8 w-8" />
                      </div>
                      <div>
                        <h4 className="text-2xl font-bold">Digital Velocity</h4>
                        <p className="text-muted-foreground">Unlocks in 4 days</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="h-10 px-6 rounded-full border-accent text-accent text-lg">Locked</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[2.5rem] border-primary/50 bg-primary/5 shadow-2xl p-4">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-primary text-accent rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Crown className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-3xl font-headline">Growth Bundles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                   <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-primary/20">
                      <h4 className="text-xl font-bold mb-2">Accelerator Pack</h4>
                      <p className="text-muted-foreground mb-6">Complete strategic overhaul with live audit.</p>
                      <div className="flex items-center justify-between">
                         <span className="text-3xl font-black text-accent">$49.99</span>
                         <Button className="rounded-full bg-accent px-6">Access</Button>
                      </div>
                   </div>
                </CardContent>
              </Card>
           </TabsContent>

           <TabsContent value="social" className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[700px]">
              <div className="lg:col-span-1 space-y-6 flex flex-col">
                 <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                      placeholder="Find strategist (UID/Name)" 
                      className="pl-12 h-14 rounded-2xl bg-white border-accent/10 shadow-sm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                 </div>
                 <Card className="flex-1 rounded-[2.5rem] overflow-hidden shadow-xl border-accent/10">
                    <CardHeader className="bg-accent/5 p-6 border-b"><h4 className="font-bold flex items-center gap-2"><MessageCircle className="h-5 w-5" /> Recent Strategists</h4></CardHeader>
                    <CardContent className="p-0 overflow-y-auto max-h-[500px]">
                       {['Alexander Strategy', 'Mocha Master', 'Digital Elite'].map((name, i) => (
                         <button 
                            key={i} 
                            onClick={() => setChatUser(name)}
                            className={`w-full p-6 flex items-center gap-4 hover:bg-secondary/20 transition-all text-left border-b border-accent/5 ${chatUser === name ? "bg-primary/10 border-r-4 border-r-primary" : ""}`}
                         >
                            <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-white font-bold">{name[0]}</div>
                            <div>
                               <p className="font-bold text-accent">{name}</p>
                               <p className="text-xs text-muted-foreground">Active now</p>
                            </div>
                         </button>
                       ))}
                    </CardContent>
                 </Card>
              </div>

              <div className="lg:col-span-3">
                 {chatUser ? (
                    <Card className="h-full rounded-[3rem] shadow-2xl border-accent/10 flex flex-col overflow-hidden bg-white">
                       <div className="p-6 bg-accent text-white flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-full bg-primary text-accent flex items-center justify-center font-bold text-xl">{chatUser[0]}</div>
                             <h4 className="text-2xl font-bold">{chatUser}</h4>
                          </div>
                          <div className="flex gap-4">
                             <Button variant="ghost" size="icon" className="text-white hover:bg-white/10"><Search className="h-5 w-5" /></Button>
                             <Button variant="ghost" size="icon" className="text-white hover:bg-white/10"><UserPlus className="h-5 w-5" /></Button>
                          </div>
                       </div>
                       <div className="flex-1 p-8 overflow-y-auto space-y-6 bg-secondary/5">
                          <div className="flex justify-end"><div className="bg-accent text-white p-5 rounded-[1.5rem] rounded-tr-none max-w-[70%] font-medium">Hello strategist, are you ready for the mocha project?</div></div>
                          <div className="flex justify-start"><div className="bg-white border p-5 rounded-[1.5rem] rounded-tl-none max-w-[70%] shadow-sm">Absolutely. The fail-proof strategy is primed.</div></div>
                          <div className="flex justify-end"><div className="bg-accent text-white p-5 rounded-[1.5rem] rounded-tr-none max-w-[70%]">Check this out. {{media}}</div></div>
                       </div>
                       <div className="p-6 bg-white border-t flex items-center gap-4">
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-accent"><ImageIcon className="h-6 w-6" /></Button>
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-accent"><Video className="h-6 w-6" /></Button>
                          <div className="flex-1 relative">
                             <Input 
                                placeholder="Write a message..." 
                                className="h-14 rounded-full bg-secondary/20 border-none px-6 pr-14"
                                value={msg}
                                onChange={(e) => setMsg(e.target.value)}
                             />
                             <button className="absolute right-4 top-1/2 -translate-y-1/2 text-accent hover:scale-110 transition-transform"><Smile className="h-6 w-6" /></button>
                          </div>
                          <Button className="h-14 w-14 rounded-full bg-accent text-white shadow-xl hover:bg-accent/90" onClick={() => { setMsg(""); toast({ title: "Message Dispatched" }); }}>
                             <Send className="h-6 w-6" />
                          </Button>
                       </div>
                    </Card>
                 ) : (
                    <div className="h-full rounded-[3rem] border-4 border-dashed border-accent/10 flex flex-col items-center justify-center text-center p-12 bg-white/50 backdrop-blur-sm">
                       <MessageCircle className="h-32 w-32 text-accent/10 mb-8" />
                       <h3 className="text-4xl font-headline font-bold text-accent/30">Messenger Secured</h3>
                       <p className="text-xl text-muted-foreground mt-4 max-w-md">Select a strategic partner from the list to begin a fail-proof conversation.</p>
                    </div>
                 )}
              </div>
           </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
