
"use client";

import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Crown, Mail, Lock, Search, Send, Smile, Image as ImageIcon, Video, Bell, MessageCircle, ShieldCheck, ShoppingBag, ExternalLink, UserPlus, CheckCircle2, User } from "lucide-react";
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
import { cn } from "@/lib/utils";

const HOST_EMAIL = "nicolaskheidenn@gmail.com";
const HOST_UID = "R9TfGgUleVN6kDnXySqVUhzoHmn2";

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
      const hasAccess = sessionStorage.getItem("fireproof_access_granted");
      if (hasAccess !== "true") {
        router.push("/");
      } else {
        router.push("/login");
      }
    }
  }, [user, loading, router]);

  const handleSendFriendRequest = (target: any) => {
    if (friends.includes(target.uid)) {
      toast({ title: "Already Friends", description: `You are already connected with ${target.nickname}.` });
      return;
    }
    addNotification({
      title: "Friend Request Sent",
      message: `Request dispatched to ${target.nickname}.`,
      type: 'friend_request'
    });
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="text-6xl font-headline font-black animate-pulse">ND</div>
        <p className="font-bold text-xs uppercase tracking-[0.4em] opacity-30">Synchronizing Environment</p>
      </div>
    </div>
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-5xl font-headline font-black text-black tracking-tight uppercase">
              Welcome, <span className="text-primary italic">Succemazing</span>
            </h1>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em]">Nico Digital Root Hub</p>
          </div>
          <div className="flex gap-3">
             <Popover>
               <PopoverTrigger asChild>
                 <Button variant="outline" className="rounded-full h-11 px-5 border-accent/5 bg-white shadow-xl relative hover:border-primary transition-all">
                    <Bell className="h-4 w-4 mr-2 text-black" /> 
                    {unreadCount > 0 && (
                      <Badge className="bg-primary text-black text-[9px] font-black rounded-full h-4 w-4 p-0 flex items-center justify-center absolute -top-1 -right-1 border-2 border-white">
                        {unreadCount}
                      </Badge>
                    )}
                    <span className="font-bold text-xs">Alerts</span>
                 </Button>
               </PopoverTrigger>
               <PopoverContent className="w-80 p-0 rounded-[1.5rem] overflow-hidden shadow-2xl border-2 border-white">
                 <div className="bg-black p-4 text-white font-bold flex justify-between items-center">
                    <span className="text-xs">System Notifications</span>
                    <Badge className="bg-primary text-black text-[9px]">{unreadCount} New</Badge>
                 </div>
                 <div className="max-h-80 overflow-y-auto bg-white">
                    {notifications.length === 0 ? (
                      <div className="p-10 text-center text-muted-foreground italic text-xs">No alerts found.</div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          className={`p-4 border-b hover:bg-secondary/20 cursor-pointer transition-colors ${!n.isRead ? 'bg-primary/5' : ''}`}
                          onClick={() => markNotifRead(n.id)}
                        >
                          <h4 className="font-black text-black text-xs mb-1">{n.title}</h4>
                          <p className="text-[10px] text-muted-foreground leading-relaxed mb-2">{n.message}</p>
                          <span className="text-[8px] uppercase font-black text-primary">{formatDistanceToNow(new Date(n.createdAt))} ago</span>
                        </div>
                      ))
                    )}
                 </div>
               </PopoverContent>
             </Popover>
             {isHost && (
              <Button className="bg-black text-white hover:bg-black/90 rounded-full h-11 px-6 font-black text-xs shadow-xl" asChild>
                <a href="/admin"><Crown className="h-4 w-4 mr-2 text-primary" /> Host Terminal</a>
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue={tabParam || "overview"} className="space-y-8">
           <TabsList className="bg-white p-1 rounded-full w-fit shadow-xl border border-accent/5">
              <TabsTrigger value="overview" className="rounded-full px-6 h-9 text-xs font-black data-[state=active]:bg-black data-[state=active]:text-white">Strategic Hub</TabsTrigger>
              <TabsTrigger value="social" className="rounded-full px-6 h-9 text-xs font-black data-[state=active]:bg-black data-[state=active]:text-white">MeText</TabsTrigger>
              <TabsTrigger value="shooppy" className="rounded-full px-6 h-9 text-xs font-black data-[state=active]:bg-black data-[state=active]:text-white">Shooppy</TabsTrigger>
           </TabsList>

           <TabsContent value="overview" className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-5">
              <Card className="lg:col-span-2 rounded-[2rem] border-white border-4 shadow-2xl overflow-hidden bg-white">
                <CardHeader className="bg-black text-white p-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                      <CardTitle className="text-2xl font-headline font-black text-primary">Active Assets</CardTitle>
                      <CardDescription className="text-white/60 text-xs font-medium">Strategic resources from Nico Digital infrastructure.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                   <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 border-2 border-dashed rounded-[1.5rem] bg-secondary/20">
                      <Lock className="h-12 w-12 text-black/10" />
                      <h4 className="text-xl font-black">Strategic Assets Pending</h4>
                      <p className="text-xs text-muted-foreground max-w-sm">The Host is preparing the next major drop. Authenticate your notifications to be the first to know.</p>
                   </div>
                </CardContent>
              </Card>

              <Card className="rounded-[2rem] border-2 border-primary/20 bg-primary/5 shadow-2xl p-6 flex flex-col justify-center text-center">
                  <div className="w-14 h-14 bg-black text-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl border-2 border-white rotate-3">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h4 className="text-xl font-headline font-black mb-3 uppercase">Legal Proof</h4>
                  <div className="bg-white p-5 rounded-xl shadow-lg border border-primary/10">
                      <p className="text-[8px] font-black text-black/30 uppercase tracking-[0.2em] mb-2">Identity Sovereign</p>
                      <Badge className="bg-primary text-black font-black mb-2 uppercase text-[8px]">Verified</Badge>
                      <p className="text-[10px] text-muted-foreground font-bold leading-relaxed">Secured by Nico Digital protocols. Your execution data is isolated and protected.</p>
                  </div>
              </Card>
           </TabsContent>

           <TabsContent value="social" className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[600px] animate-in fade-in slide-in-from-right-10">
              <div className="lg:col-span-1 space-y-4 flex flex-col">
                 <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Find Succemazing..." 
                      className="pl-10 h-11 rounded-xl bg-white border-accent/5 shadow-xl text-xs font-bold"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                 </div>
                 {filteredStrategists.length > 0 && (
                   <Card className="rounded-xl border-white border-2 shadow-xl overflow-hidden bg-white">
                     {filteredStrategists.map(s => (
                       <button 
                         key={s.uid}
                         onClick={() => setSelectedProfile(s)}
                         className="w-full p-3 flex items-center gap-3 hover:bg-primary/10 transition-colors text-left border-b last:border-0"
                       >
                         <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-primary font-black text-xs">{s.nickname[0]}</div>
                         <div>
                            <p className="font-bold text-[10px]">{s.nickname}</p>
                            <p className="text-[7px] text-muted-foreground uppercase">{s.uid}</p>
                         </div>
                       </button>
                     ))}
                   </Card>
                 )}
                 <Card className="flex-1 rounded-[1.5rem] overflow-hidden shadow-2xl border-white border-4 bg-white flex flex-col">
                    <CardHeader className="bg-black text-white p-4">
                      <h4 className="text-[10px] font-black flex items-center gap-2 uppercase"><MessageCircle className="h-3 w-3 text-primary" /> My Connections</h4>
                    </CardHeader>
                    <CardContent className="p-0 overflow-y-auto flex-1">
                       {MOCK_STRATEGISTS.filter(s => friends.includes(s.uid)).map(friend => (
                          <button 
                             key={friend.uid}
                             onClick={() => setActiveChatId(friend.uid)}
                             className={cn(
                               "w-full p-4 flex items-center gap-3 hover:bg-primary/10 transition-all text-left border-b border-accent/5",
                               activeChatId === friend.uid ? "bg-primary/10 border-r-2 border-r-primary" : ""
                             )}
                          >
                             <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-primary text-lg font-black shadow-md">
                                {friend.nickname[0]}
                             </div>
                             <div>
                                <p className="font-black text-xs text-black">{friend.nickname}</p>
                                <p className="text-[8px] font-black text-primary flex items-center gap-1 uppercase">
                                   <span className="w-1 h-1 rounded-full bg-primary animate-pulse" /> Online
                                </p>
                             </div>
                          </button>
                       ))}
                    </CardContent>
                 </Card>
              </div>

              <div className="lg:col-span-3">
                 {activeChatId ? (
                    <Card className="h-full rounded-[2rem] shadow-2xl border-white border-4 flex flex-col overflow-hidden bg-white">
                       <div className="p-4 bg-black text-white flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-xl bg-primary text-black flex items-center justify-center font-black text-lg shadow-xl">
                                {MOCK_STRATEGISTS.find(s => s.uid === activeChatId)?.nickname[0]}
                             </div>
                             <div>
                                <h4 className="text-sm font-black tracking-tight">
                                   {MOCK_STRATEGISTS.find(s => s.uid === activeChatId)?.nickname}
                                </h4>
                                <p className="text-primary/60 font-black text-[8px] uppercase tracking-widest">MeText Secured</p>
                             </div>
                          </div>
                       </div>
                       <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-secondary/10">
                          {currentChatMessages.map((m) => (
                            <div key={m.id} className={`flex ${m.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}>
                               <div className={cn(
                                 "p-4 rounded-2xl max-w-[75%] text-xs font-bold shadow-sm",
                                 m.senderId === user?.uid 
                                  ? "bg-black text-white rounded-br-none" 
                                  : "bg-white border border-accent/5 text-black rounded-tl-none"
                               )}>
                                 {m.text}
                                 <p className="text-[7px] opacity-40 mt-1 uppercase font-black">
                                   {formatDistanceToNow(new Date(m.timestamp))} ago
                                 </p>
                               </div>
                            </div>
                          ))}
                       </div>
                       <div className="p-4 bg-white border-t flex items-center gap-3">
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full"><Smile className="h-4 w-4" /></Button>
                          <div className="flex-1">
                             <Input 
                                placeholder="Type a MeText..." 
                                className="h-10 rounded-full bg-secondary/20 border-none px-5 text-[10px] font-bold"
                                value={msg}
                                onChange={(e) => setMsg(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                             />
                          </div>
                          <Button 
                            className="h-10 w-10 rounded-full bg-black text-primary shadow-xl" 
                            onClick={handleSendMessage}
                            disabled={!msg}
                          >
                             <Send className="h-4 w-4" />
                          </Button>
                       </div>
                    </Card>
                 ) : (
                    <div className="h-full rounded-[2rem] border-2 border-dashed border-accent/5 flex flex-col items-center justify-center text-center p-8 bg-white/50">
                       <MessageCircle className="h-12 w-12 text-black/5 mb-4" />
                       <h3 className="text-2xl font-headline font-black text-black/10 tracking-tighter uppercase">MeText Hub</h3>
                       <p className="text-[10px] text-muted-foreground mt-2 max-w-xs font-bold">Select a Succemazing to initialize a secured strategy session.</p>
                    </div>
                 )}
              </div>
           </TabsContent>

           <TabsContent value="shooppy" className="animate-in fade-in slide-in-from-bottom-5">
              <Card className="rounded-[2rem] border-white border-4 shadow-2xl bg-white overflow-hidden">
                <div className="bg-black p-10 text-white flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="space-y-2 text-center md:text-left">
                      <h2 className="text-4xl font-headline font-black text-primary tracking-tighter">Shooppy</h2>
                      <p className="text-sm font-bold opacity-70 max-w-sm">Access elite strategic assets to amplify your business execution.</p>
                    </div>
                    <Button size="lg" className="h-14 px-8 rounded-full bg-primary text-black font-black text-lg shadow-2xl hover:bg-primary/90" asChild>
                      <a href="https://your-main-shop-link.com" target="_blank" rel="noopener noreferrer">
                          MAIN SHOP <ExternalLink className="ml-2 h-5 w-5" />
                      </a>
                    </Button>
                </div>
                <CardContent className="p-8">
                    {shooppyProducts.length === 0 ? (
                      <div className="text-center py-12 border-2 border-dashed rounded-[1.5rem] bg-secondary/10">
                        <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground opacity-10 mb-2" />
                        <p className="text-sm text-muted-foreground font-black italic">Assets Pending Deployment.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {shooppyProducts.map(p => (
                          <Card key={p.id} className="rounded-[1.5rem] border-accent/5 shadow-lg hover:shadow-2xl transition-all group overflow-hidden bg-white flex flex-col">
                              <div className="h-48 bg-secondary/20 relative">
                                {p.imageUrl && <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />}
                                <Badge className="absolute top-3 left-3 bg-black text-primary h-6 px-3 font-black rounded-full text-[8px]">{p.type}</Badge>
                              </div>
                              <div className="p-6 space-y-3 flex-1 flex flex-col">
                                <div className="flex justify-between items-start">
                                    <h4 className="text-lg font-black text-black">{p.title}</h4>
                                    <span className="font-black text-primary text-base">{p.price}</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground font-medium leading-relaxed line-clamp-2 flex-1">{p.description}</p>
                                <Button className="w-full h-11 rounded-full bg-black text-white font-black text-xs shadow-md hover:bg-black/80" asChild>
                                    <a href={p.shopLink} target="_blank" rel="noopener noreferrer">Acquire Asset</a>
                                </Button>
                              </div>
                          </Card>
                        ))}
                      </div>
                    )}
                </CardContent>
              </Card>
           </TabsContent>
        </Tabs>

        {/* Profile Dialog */}
        <Dialog open={!!selectedProfile} onOpenChange={() => setSelectedProfile(null)}>
           <DialogContent className="rounded-[2rem] border-2 border-white shadow-2xl p-6 max-w-xs">
              <DialogHeader className="items-center text-center space-y-3">
                 <div className="w-16 h-16 rounded-[1.2rem] bg-black flex items-center justify-center text-primary text-2xl font-black shadow-xl">
                    {selectedProfile?.nickname[0]}
                 </div>
                 <DialogTitle className="text-xl font-black">{selectedProfile?.nickname}</DialogTitle>
                 <DialogDescription className="text-primary font-black uppercase tracking-widest text-[8px]">
                    Sovereign Strategist
                 </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                 <div className="p-4 bg-secondary/30 rounded-xl">
                    <Label className="font-black text-[8px] uppercase opacity-40">Strategic Bio</Label>
                    <p className="font-bold text-black text-xs mt-1">{selectedProfile?.bio || "No bio set."}</p>
                 </div>
                 <div className="flex items-center justify-between p-3 border-t border-accent/5">
                    <span className="text-[8px] font-black text-muted-foreground uppercase">UID: {selectedProfile?.uid}</span>
                    <Button 
                       size="sm"
                       className="rounded-full bg-black text-primary font-black h-9 px-5 text-[10px]"
                       onClick={() => handleSendFriendRequest(selectedProfile)}
                       disabled={friends.includes(selectedProfile?.uid)}
                    >
                       {friends.includes(selectedProfile?.uid) ? (
                         <><CheckCircle2 className="mr-2 h-3 w-3" /> Connected</>
                       ) : (
                         <><UserPlus className="mr-2 h-3 w-3" /> Connect</>
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
