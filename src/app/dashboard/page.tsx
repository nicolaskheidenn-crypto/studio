
"use client";

import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Crown, Download, Mail, Lock, UserPlus, Search, Send, Smile, Image as ImageIcon, Video, Bell, MessageCircle, ShieldCheck } from "lucide-react";
import { useUser } from "@/firebase";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useSearchParams, useRouter } from "next/navigation";

const HOST_EMAIL = "nicolaskheidenn@gmail.com";
const HOST_UID = "R9TfGgUleVN6kDnXySqVUhzoHmn2";

export default function DashboardPage() {
  const { user, loading } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab");
  
  const isHost = user?.email === HOST_EMAIL;
  
  const [searchQuery, setSearchQuery] = useState("");
  const [chatUser, setChatUser] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const handleNotifyMe = () => {
    toast({
      title: "Notification Set",
      description: "We'll alert you when new strategic drops occur.",
    });
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-headline font-bold text-2xl animate-pulse text-accent">STABILIZING CORE...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-secondary/5">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-accent tracking-tighter uppercase">
              Welcome, <span className="text-primary italic">Succemazing</span>
            </h1>
            <p className="text-lg text-muted-foreground font-black uppercase tracking-widest">Nico Digital Sovereign Hub</p>
          </div>
          <div className="flex gap-4">
             <Button variant="outline" className="rounded-full h-14 px-8 border-accent/10 bg-white shadow-xl hover:border-primary transition-all">
                <Bell className="h-6 w-6 mr-3 text-accent" /> <Badge className="bg-primary text-accent text-xs font-black rounded-full h-6 w-6 p-0 flex items-center justify-center">2</Badge>
             </Button>
             {isHost && (
              <Button className="bg-amber-600 hover:bg-amber-500 rounded-full h-14 px-10 font-black text-lg shadow-2xl" asChild>
                <a href="/admin"><Crown className="h-6 w-6 mr-3" /> Host Portal</a>
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue={tabParam || "overview"} className="space-y-10">
           <TabsList className="bg-white p-2 rounded-full w-fit shadow-xl border border-accent/5">
              <TabsTrigger value="overview" className="rounded-full px-10 h-12 text-base font-black data-[state=active]:bg-accent data-[state=active]:text-white">Strategic Center</TabsTrigger>
              <TabsTrigger value="social" className="rounded-full px-10 h-12 text-base font-black data-[state=active]:bg-accent data-[state=active]:text-white">MeText Hub</TabsTrigger>
           </TabsList>

           <TabsContent value="overview" className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-5">
              <Card className="lg:col-span-2 rounded-[3rem] border-white border-4 shadow-2xl overflow-hidden bg-white">
                <CardHeader className="bg-accent text-white p-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <CardTitle className="text-4xl font-headline font-bold tracking-tight">Upcoming eBooks</CardTitle>
                      <CardDescription className="text-white/60 text-lg mt-2 font-medium">Strategic assets curated by Nico Digital infrastructure.</CardDescription>
                    </div>
                    <Button variant="secondary" className="rounded-full font-black h-14 px-8 text-lg" onClick={handleNotifyMe}>
                      <Mail className="h-5 w-5 mr-3" /> Notify Me
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-10 space-y-8">
                   {!user ? (
                     <div className="flex flex-col items-center justify-center py-24 text-center space-y-8 border-4 border-dashed rounded-[2.5rem] bg-secondary/10">
                        <Lock className="h-20 w-20 text-muted-foreground opacity-20" />
                        <h4 className="text-3xl font-black">Members Only</h4>
                        <p className="text-xl text-muted-foreground max-w-md">Authenticate with Nico Digital to unlock these sovereign assets.</p>
                        <Button className="rounded-full px-12 h-16 bg-accent text-white font-black text-2xl" asChild><a href="/login">Authenticate</a></Button>
                     </div>
                   ) : (
                     <div className="space-y-6">
                        <div className="flex items-center justify-between p-8 bg-secondary/5 rounded-[2rem] border-2 border-transparent hover:border-primary/50 transition-all group shadow-sm">
                           <div className="flex items-center gap-8">
                              <div className="w-20 h-20 bg-primary text-accent rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform">
                                 <BookOpen className="h-10 w-10" />
                              </div>
                              <div>
                                 <h4 className="text-2xl font-black text-accent">Master Strategy Bundle</h4>
                                 <p className="text-base text-muted-foreground font-bold">Unlocking in 48 hours • Member Verified</p>
                              </div>
                           </div>
                           <Button className="rounded-full h-14 px-10 font-black bg-accent text-white shadow-xl">
                              <Download className="h-5 w-5 mr-3" /> Reserve
                           </Button>
                        </div>
                        <div className="p-8 bg-secondary/10 rounded-[2rem] opacity-40 grayscale flex items-center justify-between border-2 border-dashed border-accent/10">
                           <div className="flex items-center gap-8">
                              <div className="w-20 h-20 bg-muted text-muted-foreground rounded-2xl flex items-center justify-center">
                                 <Lock className="h-10 w-10" />
                              </div>
                              <div>
                                 <h4 className="text-2xl font-black">Strategic Velocity v2</h4>
                                 <p className="text-base text-muted-foreground font-bold">Requires Sovereign Tier</p>
                              </div>
                           </div>
                           <Badge variant="outline" className="h-10 px-6 rounded-full font-black">LOCKED</Badge>
                        </div>
                     </div>
                   )}
                </CardContent>
              </Card>

              <div className="space-y-8">
                <Card className="rounded-[3rem] border-4 border-primary/20 bg-primary/5 shadow-2xl p-6 flex flex-col justify-center text-center">
                  <CardHeader className="pb-6">
                    <div className="w-20 h-20 bg-primary text-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border-4 border-white">
                      <ShieldCheck className="h-10 w-10" />
                    </div>
                    <CardTitle className="text-3xl font-headline font-bold">Sovereign Proof</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <div className="bg-white p-8 rounded-[2rem] shadow-xl border-2 border-primary/10">
                        <h4 className="text-xl font-black mb-2 text-accent uppercase">Asset Protection</h4>
                        <p className="text-sm text-muted-foreground mb-6 font-medium">Secured by Nico Digital Root Architecture.</p>
                        <Button className="w-full rounded-full bg-accent h-12 font-black text-white">STATUS: ACTIVE</Button>
                    </div>
                    <p className="text-xs font-black text-accent/30 uppercase tracking-[0.4em]">FireProof Sovereign</p>
                  </CardContent>
                </Card>
              </div>
           </TabsContent>

           <TabsContent value="social" className="grid grid-cols-1 lg:grid-cols-4 gap-10 h-[700px] animate-in fade-in slide-in-from-right-10">
              <div className="lg:col-span-1 space-y-8 flex flex-col">
                 <div className="relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
                    <Input 
                      placeholder="Find Succemazing..." 
                      className="pl-14 h-16 rounded-[1.5rem] bg-white border-2 border-accent/5 shadow-xl text-lg font-bold"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                 </div>
                 <Card className="flex-1 rounded-[2.5rem] overflow-hidden shadow-2xl border-white border-4 bg-white flex flex-col">
                    <CardHeader className="bg-accent text-white p-6 border-b">
                      <h4 className="text-lg font-black flex items-center gap-3"><MessageCircle className="h-6 w-6 text-primary" /> Active Hub</h4>
                    </CardHeader>
                    <CardContent className="p-0 overflow-y-auto flex-1">
                       <button 
                          onClick={() => setChatUser('Host Nico')}
                          className={`w-full p-8 flex items-center gap-5 hover:bg-primary/10 transition-all text-left border-b border-accent/5 ${chatUser === 'Host Nico' ? "bg-primary/20 border-r-8 border-r-primary" : ""}`}
                       >
                          <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center text-white text-2xl font-black shadow-lg">N</div>
                          <div>
                             <p className="font-black text-xl text-accent leading-tight">Host Nico</p>
                             <p className="text-xs font-black text-primary flex items-center gap-2 uppercase tracking-widest mt-1"><span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Official</p>
                          </div>
                       </button>
                       {['Alpha Strategist', 'Delta Focus', 'Zen Earner'].map((name, i) => (
                         <button 
                            key={i} 
                            onClick={() => setChatUser(name)}
                            className={`w-full p-8 flex items-center gap-5 hover:bg-primary/5 transition-all text-left border-b border-accent/5 ${chatUser === name ? "bg-primary/10 border-r-8 border-r-primary" : ""}`}
                         >
                            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center text-accent text-2xl font-black shadow-md">{name[0]}</div>
                            <div>
                               <p className="font-black text-xl text-accent leading-tight">{name}</p>
                               <p className="text-xs font-bold text-muted-foreground flex items-center gap-2 mt-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Active</p>
                            </div>
                         </button>
                       ))}
                    </CardContent>
                 </Card>
              </div>

              <div className="lg:col-span-3">
                 {chatUser ? (
                    <Card className="h-full rounded-[3rem] shadow-2xl border-white border-8 flex flex-col overflow-hidden bg-white">
                       <div className="p-8 bg-accent text-white flex items-center justify-between">
                          <div className="flex items-center gap-6">
                             <div className="w-16 h-16 rounded-2xl bg-primary text-accent flex items-center justify-center font-black text-3xl shadow-xl">{chatUser[0]}</div>
                             <div>
                                <h4 className="text-2xl font-black tracking-tighter">{chatUser}</h4>
                                <p className="text-white/40 font-black text-xs uppercase tracking-[0.2em] mt-1">Sovereign MeText Active</p>
                             </div>
                          </div>
                          <div className="flex gap-4">
                             <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full text-white hover:bg-white/10"><UserPlus className="h-6 w-6" /></Button>
                          </div>
                       </div>
                       <div className="flex-1 p-10 overflow-y-auto space-y-8 bg-secondary/5">
                          <div className="flex justify-start">
                            <div className="bg-white border-2 border-accent/5 p-6 rounded-[1.5rem] rounded-tl-none max-w-[75%] text-lg font-bold shadow-xl text-accent leading-relaxed">
                              Hello Succemazing. Ready to initialize your next high-focus strategy session? Nico Digital encryption is active on this channel.
                            </div>
                          </div>
                       </div>
                       <div className="p-8 bg-white border-t-2 flex items-center gap-6">
                          <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full text-muted-foreground"><ImageIcon className="h-7 w-7" /></Button>
                          <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full text-muted-foreground"><Video className="h-7 w-7" /></Button>
                          <div className="flex-1 relative">
                             <Input 
                                placeholder="Broadcast a MeText..." 
                                className="h-16 rounded-full bg-secondary/10 border-none px-10 text-lg font-bold pr-16"
                                value={msg}
                                onChange={(e) => setMsg(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (setMsg(""), toast({ title: "MeText Dispatched" }))}
                             />
                             <button className="absolute right-6 top-1/2 -translate-y-1/2 text-accent"><Smile className="h-7 w-7" /></button>
                          </div>
                          <Button className="h-16 w-16 rounded-full bg-accent text-white shadow-2xl hover:scale-105 transition-transform" onClick={() => { setMsg(""); toast({ title: "MeText Dispatched" }); }}>
                             <Send className="h-7 w-7" />
                          </Button>
                       </div>
                    </Card>
                 ) : (
                    <div className="h-full rounded-[3rem] border-8 border-dashed border-accent/5 flex flex-col items-center justify-center text-center p-20 bg-white/50">
                       <div className="w-32 h-32 bg-accent/5 rounded-full flex items-center justify-center mb-10 border-4 border-dashed border-accent/10">
                          <MessageCircle className="h-16 w-16 text-accent/10" />
                       </div>
                       <h3 className="text-4xl font-headline font-black text-accent/20 tracking-tighter uppercase">MeText Sovereign</h3>
                       <p className="text-xl text-muted-foreground mt-6 max-w-md font-bold leading-relaxed">Select a strategist to begin a fail-proof conversation. All MeText interactions are secured by Nico Digital protocols.</p>
                    </div>
                 )}
              </div>
           </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
