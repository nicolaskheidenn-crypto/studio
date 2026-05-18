
"use client";

import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, Mail, Lock, Search, Send, Smile, Image as ImageIcon, Video, Bell, MessageCircle, ShieldCheck, ShoppingBag, ExternalLink, UserPlus, CheckCircle2 } from "lucide-react";
import { useUser } from "@/firebase";
import { useState, useEffect, useMemo } from "react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useSearchParams, useRouter } from "next/navigation";
import { useAdminStore, useUserStore } from "@/lib/store";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDistanceToNow } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const HOST_EMAIL = "nicolaskheidenn@gmail.com";
const HOST_UID = "R9TfGgUleVN6kDnXySqVUhzoHmn2";

// Mock users for search simulation
const MOCK_STRATEGISTS = [
  { uid: HOST_UID, nickname: "Host Nico", bio: "The root of Nico Digital." },
  { uid: "succ-001", nickname: "Elite Strategist", bio: "Focusing on high-yield assets." },
  { uid: "succ-002", nickname: "Digital Sovereign", bio: "Consistency is my master key." },
  { uid: "succ-003", nickname: "Growth Master", bio: "Scaling beyond limits." }
];

export default function DashboardPage() {
  const { user, loading } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab");
  
  const isHost = user?.email === HOST_EMAIL;
  const { shooppyProducts, notifications, markNotifRead, addNotification } = useAdminStore();
  const { friends, addFriend, chatMessages, addChatMessage } = useUserStore();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<any>(null);

  const filteredStrategists = useMemo(() => {
    if (!searchQuery) return [];
    return MOCK_STRATEGISTS.filter(s => 
      s.nickname.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.uid.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleSendFriendRequest = (target: any) => {
    if (friends.includes(target.uid)) {
      toast({ title: "Already Friends", description: `You are already connected with ${target.nickname}.` });
      return;
    }
    // Simulate sending request
    addNotification({
      title: "Friend Request Sent",
      message: `Request dispatched to ${target.nickname}.`,
      type: 'friend_request'
    });
    // For demo purposes, we auto-add
    addFriend(target.uid);
    toast({ title: "Connection Established", description: `You are now friends with ${target.nickname}.` });
    setSelectedProfile(null);
  };

  const handleSendMessage = () => {
    if (!msg || !activeChatId || !user) return;
    addChatMessage({
      senderId: user.uid,
      receiverId: activeChatId,
      text: msg
    });
    setMsg("");
    toast({ title: "MeText Sent" });
  };

  const currentChatMessages = useMemo(() => {
    if (!activeChatId || !user) return [];
    return chatMessages.filter(m => 
      (m.senderId === user.uid && m.receiverId === activeChatId) ||
      (m.senderId === activeChatId && m.receiverId === user.uid)
    );
  }, [chatMessages, activeChatId, user]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-headline font-bold text-2xl animate-pulse text-accent">STABILIZING CORE...</div>;

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
             <Popover>
               <PopoverTrigger asChild>
                 <Button variant="outline" className="rounded-full h-14 px-8 border-accent/10 bg-white shadow-xl hover:border-primary transition-all relative">
                    <Bell className="h-6 w-6 mr-3 text-accent" /> 
                    {unreadCount > 0 && (
                      <Badge className="bg-primary text-accent text-xs font-black rounded-full h-6 w-6 p-0 flex items-center justify-center absolute -top-1 -right-1 border-2 border-white">
                        {unreadCount}
                      </Badge>
                    )}
                    <span className="font-bold">Alerts</span>
                 </Button>
               </PopoverTrigger>
               <PopoverContent className="w-80 p-0 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white">
                 <div className="bg-accent p-6 text-white font-bold flex justify-between items-center">
                    <span>System Alerts</span>
                    <Badge className="bg-primary text-accent">{unreadCount} New</Badge>
                 </div>
                 <div className="max-h-96 overflow-y-auto bg-white">
                    {notifications.length === 0 ? (
                      <div className="p-10 text-center text-muted-foreground italic">No alerts found.</div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          className={`p-6 border-b hover:bg-secondary/5 cursor-pointer transition-colors ${!n.isRead ? 'bg-primary/5' : ''}`}
                          onClick={() => markNotifRead(n.id)}
                        >
                          <h4 className="font-black text-accent mb-1">{n.title}</h4>
                          <p className="text-sm text-muted-foreground leading-snug mb-2">{n.message}</p>
                          <span className="text-[10px] uppercase font-black text-primary">{formatDistanceToNow(new Date(n.createdAt))} ago</span>
                        </div>
                      ))
                    )}
                 </div>
               </PopoverContent>
             </Popover>
             {isHost && (
              <Button className="bg-amber-600 hover:bg-amber-500 rounded-full h-14 px-10 font-black text-lg shadow-2xl" asChild>
                <a href="/admin"><Crown className="h-6 w-6 mr-3" /> Host Portal</a>
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue={tabParam || "overview"} className="space-y-10">
           <TabsList className="bg-white p-2 rounded-full w-fit shadow-xl border border-accent/5 overflow-x-auto">
              <TabsTrigger value="overview" className="rounded-full px-8 h-12 text-base font-black data-[state=active]:bg-accent data-[state=active]:text-white">Strategic Center</TabsTrigger>
              <TabsTrigger value="social" className="rounded-full px-8 h-12 text-base font-black data-[state=active]:bg-accent data-[state=active]:text-white">MeText Hub</TabsTrigger>
              <TabsTrigger value="shooppy" className="rounded-full px-8 h-12 text-base font-black data-[state=active]:bg-accent data-[state=active]:text-white">Shooppy</TabsTrigger>
           </TabsList>

           <TabsContent value="overview" className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-5">
              <Card className="lg:col-span-2 rounded-[3rem] border-white border-4 shadow-2xl overflow-hidden bg-white">
                <CardHeader className="bg-accent text-white p-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <CardTitle className="text-4xl font-headline font-bold tracking-tight">Upcoming eBooks</CardTitle>
                      <CardDescription className="text-white/60 text-lg mt-2 font-medium">Strategic assets curated by Nico Digital infrastructure.</CardDescription>
                    </div>
                    <Button variant="secondary" className="rounded-full font-black h-14 px-8 text-lg">
                      <Mail className="h-5 w-5 mr-3" /> Notify Me
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-10">
                   <div className="flex flex-col items-center justify-center py-20 text-center space-y-8 border-4 border-dashed rounded-[2.5rem] bg-secondary/10">
                      <Lock className="h-20 w-20 text-muted-foreground opacity-20" />
                      <h4 className="text-3xl font-black">Strategic Assets Pending</h4>
                      <p className="text-xl text-muted-foreground max-w-md">The Host is preparing the next major drop. Authenticate your notifications above to be the first to know.</p>
                   </div>
                </CardContent>
              </Card>

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
           </TabsContent>

           <TabsContent value="social" className="grid grid-cols-1 lg:grid-cols-4 gap-10 h-[750px] animate-in fade-in slide-in-from-right-10">
              <div className="lg:col-span-1 space-y-8 flex flex-col">
                 <div className="space-y-4">
                    <div className="relative">
                       <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
                       <Input 
                         placeholder="Find Succemazing..." 
                         className="pl-14 h-16 rounded-[1.5rem] bg-white border-2 border-accent/5 shadow-xl text-lg font-bold"
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                       />
                    </div>
                    {filteredStrategists.length > 0 && (
                      <Card className="rounded-2xl border-white border-4 shadow-xl overflow-hidden bg-white animate-in slide-in-from-top-2">
                        {filteredStrategists.map(s => (
                          <button 
                            key={s.uid}
                            onClick={() => setSelectedProfile(s)}
                            className="w-full p-4 flex items-center gap-3 hover:bg-primary/10 transition-colors text-left border-b"
                          >
                            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-white font-black">{s.nickname[0]}</div>
                            <div>
                               <p className="font-bold text-sm">{s.nickname}</p>
                               <p className="text-[10px] text-muted-foreground uppercase">{s.uid}</p>
                            </div>
                          </button>
                        ))}
                      </Card>
                    )}
                 </div>
                 <Card className="flex-1 rounded-[2.5rem] overflow-hidden shadow-2xl border-white border-4 bg-white flex flex-col">
                    <CardHeader className="bg-accent text-white p-6 border-b">
                      <h4 className="text-lg font-black flex items-center gap-3"><MessageCircle className="h-6 w-6 text-primary" /> Active Succemazing</h4>
                    </CardHeader>
                    <CardContent className="p-0 overflow-y-auto flex-1">
                       {MOCK_STRATEGISTS.filter(s => friends.includes(s.uid)).map(friend => (
                          <button 
                             key={friend.uid}
                             onClick={() => setActiveChatId(friend.uid)}
                             className={`w-full p-8 flex items-center gap-5 hover:bg-primary/10 transition-all text-left border-b border-accent/5 ${activeChatId === friend.uid ? "bg-primary/20 border-r-8 border-r-primary" : ""}`}
                          >
                             <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center text-white text-2xl font-black shadow-lg">
                                {friend.nickname[0]}
                             </div>
                             <div>
                                <p className="font-black text-xl text-accent leading-tight">{friend.nickname}</p>
                                <p className="text-xs font-black text-primary flex items-center gap-2 uppercase tracking-widest mt-1">
                                   <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Online
                                </p>
                             </div>
                          </button>
                       ))}
                    </CardContent>
                 </Card>
              </div>

              <div className="lg:col-span-3">
                 {activeChatId ? (
                    <Card className="h-full rounded-[3rem] shadow-2xl border-white border-8 flex flex-col overflow-hidden bg-white">
                       <div className="p-8 bg-accent text-white flex items-center justify-between">
                          <div className="flex items-center gap-6">
                             <div className="w-16 h-16 rounded-2xl bg-primary text-accent flex items-center justify-center font-black text-3xl shadow-xl">
                                {MOCK_STRATEGISTS.find(s => s.uid === activeChatId)?.nickname[0]}
                             </div>
                             <div>
                                <h4 className="text-2xl font-black tracking-tighter">
                                   {MOCK_STRATEGISTS.find(s => s.uid === activeChatId)?.nickname}
                                </h4>
                                <p className="text-white/40 font-black text-xs uppercase tracking-[0.2em] mt-1">Sovereign MeText Active</p>
                             </div>
                          </div>
                       </div>
                       <div className="flex-1 p-10 overflow-y-auto space-y-8 bg-secondary/5">
                          {currentChatMessages.map((m) => (
                            <div key={m.id} className={`flex ${m.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}>
                               <div className={cn(
                                 "p-6 rounded-[1.5rem] max-w-[75%] text-lg font-bold shadow-xl leading-relaxed",
                                 m.senderId === user?.uid 
                                  ? "bg-accent text-white rounded-br-none" 
                                  : "bg-white border-2 border-accent/5 text-accent rounded-tl-none"
                               )}>
                                 {m.text}
                                 <p className="text-[10px] opacity-40 mt-2 uppercase font-black">
                                   {formatDistanceToNow(new Date(m.timestamp))} ago
                                 </p>
                               </div>
                            </div>
                          ))}
                          {currentChatMessages.length === 0 && (
                             <div className="flex justify-start">
                               <div className="bg-white border-2 border-accent/5 p-6 rounded-[1.5rem] rounded-tl-none max-w-[75%] text-lg font-bold shadow-xl text-accent leading-relaxed">
                                 Ready to initialize a high-focus strategy session? All MeText interactions are secured by Nico Digital protocols.
                               </div>
                             </div>
                          )}
                       </div>
                       <div className="p-8 bg-white border-t-2 flex items-center gap-6">
                          <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full text-muted-foreground"><ImageIcon className="h-7 w-7" /></Button>
                          <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full text-muted-foreground"><Video className="h-7 w-7" /></Button>
                          <div className="flex-1 relative">
                             <Input 
                                placeholder="Type a MeText..." 
                                className="h-16 rounded-full bg-secondary/10 border-none px-10 text-lg font-bold pr-16"
                                value={msg}
                                onChange={(e) => setMsg(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                             />
                             <button className="absolute right-6 top-1/2 -translate-y-1/2 text-accent"><Smile className="h-7 w-7" /></button>
                          </div>
                          <Button 
                            className="h-16 w-16 rounded-full bg-accent text-white shadow-2xl hover:scale-105 transition-transform" 
                            onClick={handleSendMessage}
                            disabled={!msg}
                          >
                             <Send className="h-7 w-7" />
                          </Button>
                       </div>
                    </Card>
                 ) : (
                    <div className="h-full rounded-[3rem] border-8 border-dashed border-accent/5 flex flex-col items-center justify-center text-center p-20 bg-white/50">
                       <div className="w-32 h-32 bg-accent/5 rounded-full flex items-center justify-center mb-10 border-4 border-dashed border-accent/10">
                          <MessageCircle className="h-16 w-16 text-accent/10" />
                       </div>
                       <h3 className="text-4xl font-headline font-black text-accent/20 tracking-tighter uppercase">MeText Hub</h3>
                       <p className="text-xl text-muted-foreground mt-6 max-w-md font-bold leading-relaxed">Select a Succemazing to begin a fail-proof conversation.</p>
                    </div>
                 )}
              </div>
           </TabsContent>

           <TabsContent value="shooppy" className="animate-in fade-in slide-in-from-bottom-5">
              <div className="space-y-12">
                 <Card className="rounded-[3rem] border-white border-4 shadow-2xl bg-white overflow-hidden">
                    <div className="bg-amber-600 p-12 text-white flex flex-col md:flex-row justify-between items-center gap-8">
                       <div className="space-y-4 text-center md:text-left">
                          <h2 className="text-5xl font-headline font-black tracking-tighter">Shooppy Hub</h2>
                          <p className="text-xl font-bold opacity-80 max-w-lg">Access elite strategic assets, bundles, and templates to amplify your execution.</p>
                       </div>
                       <Button size="lg" className="h-20 px-12 rounded-full bg-white text-amber-600 font-black text-2xl shadow-2xl hover:bg-white/90" asChild>
                          <a href="https://your-main-shop-link.com" target="_blank" rel="noopener noreferrer">
                             MAIN SHOP <ExternalLink className="ml-3 h-8 w-8" />
                          </a>
                       </Button>
                    </div>
                    <CardContent className="p-12">
                       {shooppyProducts.length === 0 ? (
                         <div className="text-center py-20 border-4 border-dashed rounded-[3rem] bg-secondary/5">
                            <ShoppingBag className="h-20 w-20 mx-auto text-muted-foreground opacity-20 mb-6" />
                            <p className="text-2xl text-muted-foreground font-black italic">No strategic products deployed yet.</p>
                         </div>
                       ) : (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {shooppyProducts.map(p => (
                              <Card key={p.id} className="rounded-[2.5rem] border-accent/5 shadow-xl hover:shadow-2xl transition-all group overflow-hidden bg-white">
                                 <div className="h-64 bg-secondary/10 relative">
                                    {p.imageUrl && <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />}
                                    <Badge className="absolute top-4 left-4 bg-primary text-accent h-10 px-6 font-black rounded-full text-sm">{p.type}</Badge>
                                 </div>
                                 <div className="p-8 space-y-4">
                                    <div className="flex justify-between items-start">
                                       <h4 className="text-2xl font-black text-accent">{p.title}</h4>
                                       <span className="font-black text-primary text-xl">{p.price}</span>
                                    </div>
                                    <p className="text-muted-foreground font-medium leading-relaxed line-clamp-3">{p.description}</p>
                                    <Button className="w-full h-16 rounded-full bg-accent text-white font-black text-xl shadow-lg hover:bg-accent/90" asChild>
                                       <a href={p.shopLink} target="_blank" rel="noopener noreferrer">Acquire Asset</a>
                                    </Button>
                                 </div>
                              </Card>
                            ))}
                         </div>
                       )}
                    </CardContent>
                 </Card>
              </div>
           </TabsContent>
        </Tabs>

        {/* Profile Dialog */}
        <Dialog open={!!selectedProfile} onOpenChange={() => setSelectedProfile(null)}>
           <DialogContent className="rounded-[3rem] border-4 border-white shadow-2xl p-10 max-w-md">
              <DialogHeader className="items-center text-center space-y-4">
                 <div className="w-24 h-24 rounded-3xl bg-accent flex items-center justify-center text-white text-4xl font-black shadow-xl">
                    {selectedProfile?.nickname[0]}
                 </div>
                 <DialogTitle className="text-3xl font-black">{selectedProfile?.nickname}</DialogTitle>
                 <DialogDescription className="text-primary font-black uppercase tracking-widest text-xs">
                    Succemazing Sovereign
                 </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 mt-6">
                 <div className="p-6 bg-secondary/10 rounded-2xl">
                    <Label className="font-black text-xs uppercase opacity-40">Biography</Label>
                    <p className="font-bold text-accent mt-2">{selectedProfile?.bio || "No bio set."}</p>
                 </div>
                 <div className="flex items-center justify-between p-4 border-t border-accent/5">
                    <span className="text-[10px] font-black text-muted-foreground uppercase">UID: {selectedProfile?.uid}</span>
                    <Button 
                       className="rounded-full bg-accent text-white font-black px-6"
                       onClick={() => handleSendFriendRequest(selectedProfile)}
                       disabled={friends.includes(selectedProfile?.uid)}
                    >
                       {friends.includes(selectedProfile?.uid) ? (
                         <><CheckCircle2 className="mr-2 h-4 w-4" /> Connected</>
                       ) : (
                         <><UserPlus className="mr-2 h-4 w-4" /> Add Friend</>
                       )}
                    </Button>
                 </div>
              </div>
           </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
