
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
const DEFAULT_FRIEND_UID = "R9TfGgUleVN6kDnXySqVUhzoHmn2";

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
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-accent tracking-tighter">Welcome, <span className="text-primary italic">Succemazing</span></h1>
            <p className="text-lg text-muted-foreground font-medium">Nico Digital Strategic Hub</p>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="rounded-full h-12 px-6 border-accent/10 bg-white shadow-sm">
                <Bell className="h-5 w-5 mr-2 text-accent" /> <Badge className="bg-primary text-accent ml-1 text-xs font-bold">2</Badge>
             </Button>
             {isHost && (
              <Button className="bg-amber-600 hover:bg-amber-500 rounded-full h-12 px-8 font-black text-base shadow-lg" asChild>
                <a href="/admin"><Crown className="h-5 w-5 mr-2" /> Host Portal</a>
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue={tabParam || "overview"} className="space-y-8">
           <TabsList className="bg-white p-1 rounded-full w-fit shadow-md border border-accent/5">
              <TabsTrigger value="overview" className="rounded-full px-8 h-10 text-base font-bold data-[state=active]:bg-accent data-[state=active]:text-white">Strategic Center</TabsTrigger>
              <TabsTrigger value="social" className="rounded-full px-8 h-10 text-base font-bold data-[state=active]:bg-accent data-[state=active]:text-white">MeText Hub</TabsTrigger>
           </TabsList>

           <TabsContent value="overview" className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in zoom-in-95 duration-500">
              <Card className="lg:col-span-2 rounded-[2rem] border-accent/5 shadow-xl overflow-hidden bg-white">
                <CardHeader className="bg-accent text-white p-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-3xl font-headline font-bold tracking-tight">Upcoming eBooks</CardTitle>
                      <CardDescription className="text-white/60 text-base mt-1">Strategic assets dropping exclusively for members.</CardDescription>
                    </div>
                    <Button variant="secondary" className="rounded-full font-black h-12 px-6" onClick={handleNotifyMe}>
                      <Mail className="h-4 w-4 mr-2" /> Notify Me
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                   {!user ? (
                     <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 border-4 border-dashed rounded-[2rem] bg-secondary/10">
                        <Lock className="h-16 w-16 text-muted-foreground opacity-20" />
                        <h4 className="text-2xl font-bold">Members Only Access</h4>
                        <p className="text-muted-foreground max-w-sm">Sign in to Nico Digital to unlock these high-tier assets.</p>
                        <Button className="rounded-full px-10 h-12 bg-accent" asChild><a href="/login">Sign In</a></Button>
                     </div>
                   ) : (
                     <div className="space-y-4">
                        <div className="flex items-center justify-between p-6 bg-secondary/10 rounded-[1.5rem] border-2 border-transparent hover:border-primary/50 transition-all group">
                           <div className="flex items-center gap-6">
                              <div className="w-16 h-16 bg-primary text-accent rounded-2xl flex items-center justify-center shadow-md">
                                 <BookOpen className="h-8 w-8" />
                              </div>
                              <div>
                                 <h4 className="text-xl font-black text-accent">Digital Growth Path</h4>
                                 <p className="text-sm text-muted-foreground">Premium Asset • Active Hub Member</p>
                              </div>
                           </div>
                           <Button className="rounded-full h-12 px-8 font-black bg-accent">
                              <Download className="h-4 w-4 mr-2" /> Access
                           </Button>
                        </div>
                        <div className="p-6 bg-secondary/5 rounded-[1.5rem] opacity-50 grayscale border-2 border-dashed border-accent/5 flex items-center justify-between">
                           <div className="flex items-center gap-6">
                              <div className="w-16 h-16 bg-muted text-muted-foreground rounded-2xl flex items-center justify-center">
                                 <Lock className="h-8 w-8" />
                              </div>
                              <div>
                                 <h4 className="text-xl font-black">Strategic Velocity</h4>
                                 <p className="text-sm text-muted-foreground">Unlocks soon</p>
                              </div>
                           </div>
                           <Badge variant="outline" className="h-8 px-4 rounded-full">Locked</Badge>
                        </div>
                     </div>
                   )}
                </CardContent>
              </Card>

              <Card className="rounded-[2rem] border-2 border-primary/20 bg-primary/5 shadow-xl p-4 flex flex-col justify-center text-center">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 bg-primary text-accent rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <ShieldCheck className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-2xl font-headline font-bold">Network Hub</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                   <div className="bg-white p-6 rounded-[1.5rem] shadow-md border border-primary/10">
                      <h4 className="text-lg font-black mb-1 text-accent">Strategic Asset Access</h4>
                      <p className="text-xs text-muted-foreground mb-4">Secured by Nico Digital Infrastructure.</p>
                      <Button className="w-full rounded-full bg-accent h-10 font-bold">Status: Active</Button>
                   </div>
                   <p className="text-xs font-bold text-accent/40 uppercase tracking-widest">Nico Digital Root</p>
                </CardContent>
              </Card>
           </TabsContent>

           <TabsContent value="social" className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[600px] animate-in fade-in slide-in-from-right-10">
              <div className="lg:col-span-1 space-y-6 flex flex-col">
                 <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                      placeholder="Find Succemazing..." 
                      className="pl-12 h-12 rounded-2xl bg-white border-accent/5 shadow-sm text-base"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                 </div>
                 <Card className="flex-1 rounded-[2rem] overflow-hidden shadow-lg border-accent/5 bg-white">
                    <CardHeader className="bg-accent text-white p-4 border-b">
                      <h4 className="text-sm font-bold flex items-center gap-2"><MessageCircle className="h-4 w-4 text-primary" /> Active Succemazing</h4>
                    </CardHeader>
                    <CardContent className="p-0 overflow-y-auto max-h-[400px]">
                       {['Host Nico', 'Alpha Strategist', 'Delta Focus'].map((name, i) => (
                         <button 
                            key={i} 
                            onClick={() => setChatUser(name)}
                            className={`w-full p-6 flex items-center gap-4 hover:bg-primary/5 transition-all text-left border-b border-accent/5 ${chatUser === name ? "bg-primary/10 border-r-4 border-r-primary" : ""}`}
                         >
                            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center text-white text-lg font-black shadow-md">{name[0]}</div>
                            <div>
                               <p className="font-black text-base text-accent leading-tight">{name}</p>
                               <p className="text-xs font-bold text-primary flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Active</p>
                            </div>
                         </button>
                       ))}
                    </CardContent>
                 </Card>
              </div>

              <div className="lg:col-span-3">
                 {chatUser ? (
                    <Card className="h-full rounded-[2.5rem] shadow-xl border-white border-4 flex flex-col overflow-hidden bg-white">
                       <div className="p-6 bg-accent text-white flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-xl bg-primary text-accent flex items-center justify-center font-black text-xl shadow-md">{chatUser[0]}</div>
                             <div>
                                <h4 className="text-xl font-black tracking-tight">{chatUser}</h4>
                                <p className="text-white/60 font-bold text-[10px] uppercase">Channel Secured</p>
                             </div>
                          </div>
                          <div className="flex gap-2">
                             <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-white hover:bg-white/10"><UserPlus className="h-5 w-5" /></Button>
                          </div>
                       </div>
                       <div className="flex-1 p-8 overflow-y-auto space-y-6 bg-secondary/5">
                          <div className="flex justify-start"><div className="bg-white border p-4 rounded-2xl rounded-tl-none max-w-[70%] text-sm font-medium shadow-sm text-accent">Hello Succemazing, ready to execute?</div></div>
                       </div>
                       <div className="p-6 bg-white border-t flex items-center gap-4">
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-muted-foreground"><ImageIcon className="h-6 w-6" /></Button>
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-muted-foreground"><Video className="h-6 w-6" /></Button>
                          <div className="flex-1 relative">
                             <Input 
                                placeholder="Broadcast a MeText..." 
                                className="h-12 rounded-full bg-secondary/10 border-none px-6 pr-12 text-base font-medium"
                                value={msg}
                                onChange={(e) => setMsg(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (setMsg(""), toast({ title: "MeText Dispatched" }))}
                             />
                             <button className="absolute right-4 top-1/2 -translate-y-1/2 text-accent"><Smile className="h-6 w-6" /></button>
                          </div>
                          <Button className="h-12 w-12 rounded-full bg-accent text-white shadow-md" onClick={() => { setMsg(""); toast({ title: "MeText Dispatched" }); }}>
                             <Send className="h-5 w-5" />
                          </Button>
                       </div>
                    </Card>
                 ) : (
                    <div className="h-full rounded-[2.5rem] border-4 border-dashed border-accent/5 flex flex-col items-center justify-center text-center p-12 bg-white/50">
                       <div className="w-24 h-24 bg-accent/5 rounded-full flex items-center justify-center mb-6">
                          <MessageCircle className="h-12 w-12 text-accent/10" />
                       </div>
                       <h3 className="text-3xl font-headline font-bold text-accent/30 tracking-tighter uppercase">MeText Secured</h3>
                       <p className="text-base text-muted-foreground mt-4 max-w-sm font-medium">Select a Succemazing to begin a fail-proof conversation. Nico Digital encryption active.</p>
                    </div>
                 )}
              </div>
           </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
