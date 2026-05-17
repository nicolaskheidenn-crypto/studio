
"use client";

import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Crown, Download, Mail, Lock, UserPlus, Search, Send, Smile, Image as ImageIcon, Video, Bell, MessageCircle } from "lucide-react";
import { useUser } from "@/firebase";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useSearchParams, useRouter } from "next/navigation";

const HOST_EMAIL = "nicolaskheidenn@gmail.com";

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
      description: "We'll email you when the next eBook drops!",
    });
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-headline font-bold text-4xl animate-pulse text-accent">STABILIZING CORE...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-secondary/5">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-16 gap-8">
          <div className="space-y-2">
            <h1 className="text-6xl font-headline font-bold text-accent tracking-tighter">Welcome, <span className="text-primary italic">Succemazing</span></h1>
            <p className="text-2xl text-muted-foreground font-medium">The strategic center of fireproof.ndigtl.app</p>
          </div>
          <div className="flex gap-4">
             <Button variant="outline" className="rounded-full h-14 px-8 border-accent/20 bg-white shadow-sm hover:bg-white/50">
                <Bell className="h-6 w-6 mr-3 text-accent" /> <Badge className="bg-primary text-accent ml-2 text-sm font-bold">2</Badge>
             </Button>
             {isHost && (
              <Button className="bg-amber-600 hover:bg-amber-500 rounded-full h-14 px-10 font-black text-lg shadow-xl" asChild>
                <a href="/admin"><Crown className="h-6 w-6 mr-3" /> Host Portal</a>
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue={tabParam || "overview"} className="space-y-12">
           <TabsList className="bg-white p-2 rounded-full w-fit shadow-xl border border-accent/5">
              <TabsTrigger value="overview" className="rounded-full px-12 h-12 text-lg font-bold data-[state=active]:bg-accent data-[state=active]:text-white">Strategy Core</TabsTrigger>
              <TabsTrigger value="social" className="rounded-full px-12 h-12 text-lg font-bold data-[state=active]:bg-accent data-[state=active]:text-white">MeText Hub</TabsTrigger>
           </TabsList>

           <TabsContent value="overview" className="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-in fade-in zoom-in-95 duration-500">
              <Card className="lg:col-span-2 rounded-[3.5rem] border-accent/5 shadow-2xl overflow-hidden bg-white">
                <CardHeader className="bg-accent text-white p-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-4xl font-headline font-bold tracking-tight">Upcoming eBooks</CardTitle>
                      <CardDescription className="text-white/60 text-xl mt-2">New strategic assets dropping every 14 days.</CardDescription>
                    </div>
                    <Button variant="secondary" className="rounded-full font-black h-14 px-8" onClick={handleNotifyMe}>
                      <Mail className="h-5 w-5 mr-3" /> Notify Me
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-10 space-y-8">
                  <div className="flex items-center justify-between p-8 bg-secondary/10 rounded-[2.5rem] border-2 border-transparent hover:border-primary/50 transition-all group cursor-pointer">
                    <div className="flex items-center gap-8">
                      <div className="w-20 h-20 bg-primary text-accent rounded-3xl flex items-center justify-center shadow-2xl group-hover:rotate-6 transition-transform">
                        <BookOpen className="h-10 w-10" />
                      </div>
                      <div>
                        <h4 className="text-3xl font-black text-accent">Mocha Strategy Vol. 1</h4>
                        <p className="text-xl text-muted-foreground mt-1">Strategic focus for early earners • FREE</p>
                      </div>
                    </div>
                    <Button className="rounded-full h-16 px-10 font-black text-xl bg-accent shadow-xl hover:scale-105">
                      <Download className="h-6 w-6 mr-3" /> Get Asset
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-8 bg-secondary/5 rounded-[2.5rem] opacity-50 grayscale border-4 border-dashed border-accent/5">
                    <div className="flex items-center gap-8">
                      <div className="w-20 h-20 bg-muted text-muted-foreground rounded-3xl flex items-center justify-center">
                        <Lock className="h-10 w-10" />
                      </div>
                      <div>
                        <h4 className="text-3xl font-black">Digital Velocity</h4>
                        <p className="text-xl text-muted-foreground">Unlocks in 4 days</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="h-12 px-8 rounded-full border-accent text-accent text-xl font-bold">Locked</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[3.5rem] border-4 border-primary/20 bg-primary/5 shadow-2xl p-6">
                <CardHeader className="text-center pb-8">
                  <div className="w-20 h-20 bg-primary text-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                    <Crown className="h-10 w-10" />
                  </div>
                  <CardTitle className="text-4xl font-headline font-bold">Growth Bundles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                   <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-primary/10 hover:scale-[1.02] transition-transform">
                      <h4 className="text-2xl font-black mb-2 text-accent">Accelerator Pack</h4>
                      <p className="text-lg text-muted-foreground mb-8">Complete strategic overhaul with live audit.</p>
                      <div className="flex items-center justify-between">
                         <span className="text-4xl font-black text-accent">$49.99</span>
                         <Button className="rounded-full bg-accent h-12 px-8 font-bold">Secure Access</Button>
                      </div>
                   </div>
                   <p className="text-center text-sm font-bold text-accent/40 uppercase tracking-widest">Premium Assets Reserved for Members</p>
                </CardContent>
              </Card>
           </TabsContent>

           <TabsContent value="social" className="grid grid-cols-1 lg:grid-cols-4 gap-12 h-[800px] animate-in fade-in slide-in-from-right-10 duration-500">
              <div className="lg:col-span-1 space-y-8 flex flex-col">
                 <div className="relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                      placeholder="Find strategist..." 
                      className="pl-14 h-16 rounded-[2rem] bg-white border-accent/5 shadow-xl text-lg font-medium"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                 </div>
                 <Card className="flex-1 rounded-[3.5rem] overflow-hidden shadow-2xl border-accent/5 bg-white">
                    <CardHeader className="bg-accent text-white p-8 border-b">
                      <h4 className="text-xl font-bold flex items-center gap-3"><MessageCircle className="h-6 w-6 text-primary" /> Active Strategists</h4>
                    </CardHeader>
                    <CardContent className="p-0 overflow-y-auto max-h-[550px]">
                       {['Alexander Strategy', 'Mocha Master', 'Digital Elite'].map((name, i) => (
                         <button 
                            key={i} 
                            onClick={() => setChatUser(name)}
                            className={`w-full p-8 flex items-center gap-5 hover:bg-primary/5 transition-all text-left border-b border-accent/5 ${chatUser === name ? "bg-primary/10 border-r-8 border-r-primary" : ""}`}
                         >
                            <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center text-white text-2xl font-black shadow-lg">{name[0]}</div>
                            <div>
                               <p className="font-black text-xl text-accent leading-tight">{name}</p>
                               <p className="text-sm font-bold text-primary flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Active now</p>
                            </div>
                         </button>
                       ))}
                    </CardContent>
                 </Card>
              </div>

              <div className="lg:col-span-3">
                 {chatUser ? (
                    <Card className="h-full rounded-[4rem] shadow-2xl border-white border-8 flex flex-col overflow-hidden bg-white">
                       <div className="p-8 bg-accent text-white flex items-center justify-between">
                          <div className="flex items-center gap-5">
                             <div className="w-16 h-16 rounded-2xl bg-primary text-accent flex items-center justify-center font-black text-3xl shadow-lg">{chatUser[0]}</div>
                             <div>
                                <h4 className="text-3xl font-black tracking-tight">{chatUser}</h4>
                                <p className="text-white/60 font-bold text-sm">STRATEGIC CHANNEL SECURED</p>
                             </div>
                          </div>
                          <div className="flex gap-4">
                             <Button variant="ghost" size="icon" className="h-14 w-14 rounded-full text-white hover:bg-white/10"><Search className="h-6 w-6" /></Button>
                             <Button variant="ghost" size="icon" className="h-14 w-14 rounded-full text-white hover:bg-white/10"><UserPlus className="h-6 w-6" /></Button>
                          </div>
                       </div>
                       <div className="flex-1 p-10 overflow-y-auto space-y-8 bg-secondary/5">
                          <div className="flex justify-end"><div className="bg-accent text-white p-6 rounded-[2rem] rounded-tr-none max-w-[70%] text-lg font-medium shadow-xl">Hello strategist, are you ready for the mocha project?</div></div>
                          <div className="flex justify-start"><div className="bg-white border-2 border-accent/5 p-6 rounded-[2rem] rounded-tl-none max-w-[70%] text-lg font-medium shadow-lg text-accent">Absolutely. The fail-proof strategy is primed.</div></div>
                          <div className="flex justify-end"><div className="bg-accent text-white p-6 rounded-[2rem] rounded-tr-none max-w-[70%] text-lg font-medium shadow-xl">Check this out. 🔥</div></div>
                       </div>
                       <div className="p-8 bg-white border-t-2 border-accent/5 flex items-center gap-5">
                          <Button variant="ghost" size="icon" className="h-14 w-14 rounded-full text-muted-foreground hover:text-accent hover:bg-secondary/50 transition-colors"><ImageIcon className="h-8 w-8" /></Button>
                          <Button variant="ghost" size="icon" className="h-14 w-14 rounded-full text-muted-foreground hover:text-accent hover:bg-secondary/50 transition-colors"><Video className="h-8 w-8" /></Button>
                          <div className="flex-1 relative">
                             <Input 
                                placeholder="Broadcast a message..." 
                                className="h-16 rounded-full bg-secondary/10 border-none px-8 pr-16 text-lg font-medium shadow-inner"
                                value={msg}
                                onChange={(e) => setMsg(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (setMsg(""), toast({ title: "MeText Dispatched" }))}
                             />
                             <button className="absolute right-6 top-1/2 -translate-y-1/2 text-accent hover:scale-110 transition-transform"><Smile className="h-8 w-8" /></button>
                          </div>
                          <Button className="h-16 w-16 rounded-full bg-accent text-white shadow-2xl hover:scale-105 active:scale-95 transition-all" onClick={() => { setMsg(""); toast({ title: "MeText Dispatched" }); }}>
                             <Send className="h-8 w-8" />
                          </Button>
                       </div>
                    </Card>
                 ) : (
                    <div className="h-full rounded-[4rem] border-8 border-dashed border-accent/5 flex flex-col items-center justify-center text-center p-16 bg-white/50 backdrop-blur-md">
                       <div className="w-40 h-40 bg-accent/5 rounded-full flex items-center justify-center mb-10 animate-bounce duration-1000">
                          <MessageCircle className="h-20 w-20 text-accent/10" />
                       </div>
                       <h3 className="text-5xl font-headline font-bold text-accent/30 tracking-tighter uppercase">MeText Secured</h3>
                       <p className="text-2xl text-muted-foreground mt-6 max-w-lg font-medium">Select a strategic partner to begin a fail-proof conversation. Encryption is active.</p>
                    </div>
                 )}
              </div>
           </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
