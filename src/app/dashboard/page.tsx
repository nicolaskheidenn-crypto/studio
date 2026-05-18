'use client';

import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  Crown,
  Lock,
  Search,
  Send,
  Smile,
  Bell,
  MessageCircle,
  ShieldCheck,
  ShoppingBag,
  ExternalLink,
  UserPlus,
  CheckCircle2,
} from 'lucide-react';
import { useUser } from '@/firebase';
import { useState, useEffect, useMemo } from 'react';
import { toast } from '@/hooks/use-toast';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAdminStore, useUserStore } from '@/lib/store';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const HOST_UID = 'R9TfGgUleVN6kDnXySqVUhzoHmn2';

const MOCK_STRATEGISTS = [
  { uid: HOST_UID, nickname: 'Host Nico', bio: 'The root of Nico Digital.' },
  { uid: 'succ-001', nickname: 'Elite Strategist', bio: 'Focusing on high-yield assets.' },
  { uid: 'succ-002', nickname: 'Digital Sovereign', bio: 'Consistency is my master key.' },
  { uid: 'succ-003', nickname: 'Growth Master', bio: 'Scaling beyond limits.' },
];

export default function DashboardPage() {
  const { user, loading } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get('tab');

  const isHost = user?.uid === HOST_UID;
  const { shooppyProducts, notifications, markNotifRead, addNotification } = useAdminStore();
  const { friends, addFriend, chatMessages, addChatMessage } = useUserStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<any>(null);

  const filteredStrategists = useMemo(() => {
    if (!searchQuery) return [];
    return MOCK_STRATEGISTS.filter(
      (s) =>
        s.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.uid.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  useEffect(() => {
    if (!loading && !user) {
      const hasAccess = sessionStorage.getItem('fireproof_access_granted');
      if (hasAccess !== 'true') {
        router.push('/');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  const handleSendFriendRequest = (target: any) => {
    if (friends.includes(target.uid)) {
      toast({ title: 'Already Connected', description: `You are already friends with ${target.nickname}.` });
      return;
    }
    addNotification({
      title: 'Friend Request Sent',
      message: `Request dispatched to ${target.nickname}.`,
      type: 'friend_request',
    });
    addFriend(target.uid);
    toast({ title: 'Connection Established', description: `You are now friends with ${target.nickname}.` });
    setSelectedProfile(null);
  };

  const handleSendMessage = () => {
    if (!msg || !activeChatId || !user) return;
    addChatMessage({
      senderId: user.uid,
      receiverId: activeChatId,
      text: msg,
    });
    setMsg('');
    toast({ title: 'MeText Sent' });
  };

  const currentChatMessages = useMemo(() => {
    if (!activeChatId || !user) return [];
    return chatMessages.filter(
      (m) =>
        (m.senderId === user.uid && m.receiverId === activeChatId) ||
        (m.senderId === activeChatId && m.receiverId === user.uid)
    );
  }, [chatMessages, activeChatId, user]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="text-8xl font-headline font-black text-primary animate-pulse">ND</div>
          <p className="font-bold text-xs uppercase tracking-[0.4em] opacity-30 text-primary">Synchronizing Root</p>
        </div>
      </div>
    );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-headline font-black text-white tracking-tight uppercase">
              Welcome, <span className="text-primary italic">Succemazing</span>
            </h1>
            <p className="text-[10px] text-primary font-black uppercase tracking-[0.3em] opacity-60">
              Nico Digital Root Hub
            </p>
          </div>
          <div className="flex gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="rounded-full h-12 px-6 border-primary/20 bg-secondary/20 shadow-xl relative hover:border-primary transition-all">
                  <Bell className="h-4 w-4 mr-2 text-primary" />
                  {unreadCount > 0 && (
                    <Badge className="bg-primary text-background text-[10px] font-black rounded-full h-5 w-5 p-0 flex items-center justify-center absolute -top-1 -right-1 border-2 border-background">
                      {unreadCount}
                    </Badge>
                  )}
                  <span className="font-bold text-xs">Alerts</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 rounded-2xl overflow-hidden shadow-2xl border-2 border-primary/10 bg-secondary/40 backdrop-blur-xl">
                <div className="bg-primary p-4 text-background font-black flex justify-between items-center">
                  <span className="text-xs uppercase tracking-wider">System Alerts</span>
                  <Badge className="bg-background text-primary text-[10px]">{unreadCount} New</Badge>
                </div>
                <div className="max-h-80 overflow-y-auto bg-background/80">
                  {notifications.length === 0 ? (
                    <div className="p-10 text-center text-muted-foreground italic text-xs">No alerts found.</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={cn(
                          'p-4 border-b border-white/5 hover:bg-primary/5 cursor-pointer transition-colors',
                          !n.isRead ? 'bg-primary/10' : ''
                        )}
                        onClick={() => markNotifRead(n.id)}
                      >
                        <h4 className="font-black text-white text-xs mb-1 uppercase tracking-tight">{n.title}</h4>
                        <p className="text-[10px] text-foreground/70 leading-relaxed mb-2">{n.message}</p>
                        <span className="text-[8px] uppercase font-black text-primary">
                          {formatDistanceToNow(new Date(n.createdAt))} ago
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
            {isHost && (
              <Button className="bg-primary text-background hover:bg-white rounded-full h-12 px-8 font-black text-xs shadow-xl transition-all" asChild>
                <a href="/admin">
                  <Crown className="h-4 w-4 mr-2" /> Host Terminal
                </a>
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue={tabParam || 'overview'} className="space-y-8">
          <TabsList className="bg-secondary/40 p-1.5 rounded-full w-fit shadow-xl border border-white/5 backdrop-blur-md">
            <TabsTrigger value="overview" className="rounded-full px-8 h-10 text-xs font-black data-[state=active]:bg-primary data-[state=active]:text-background uppercase tracking-widest transition-all">
              Hub
            </TabsTrigger>
            <TabsTrigger value="social" className="rounded-full px-8 h-10 text-xs font-black data-[state=active]:bg-primary data-[state=active]:text-background uppercase tracking-widest transition-all">
              MeText
            </TabsTrigger>
            <TabsTrigger value="shooppy" className="rounded-full px-8 h-10 text-xs font-black data-[state=active]:bg-primary data-[state=active]:text-background uppercase tracking-widest transition-all">
              Shooppy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-5">
            <Card className="lg:col-span-2 rounded-[2.5rem] border-white/5 shadow-2xl overflow-hidden bg-secondary/20 backdrop-blur-sm">
              <CardHeader className="bg-secondary/40 p-8 border-b border-white/5">
                <div className="space-y-2">
                  <CardTitle className="text-3xl font-headline font-black text-primary tracking-tighter uppercase">Root Assets</CardTitle>
                  <CardDescription className="text-foreground/50 text-xs font-bold uppercase tracking-widest">
                    Infrastructure status and execution logs.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-12">
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-6 border-2 border-dashed border-primary/10 rounded-3xl bg-background/20">
                  <Lock className="h-14 w-14 text-primary opacity-20" />
                  <div className="space-y-2">
                    <h4 className="text-2xl font-black text-white">Execution Logs Pending</h4>
                    <p className="text-xs text-foreground/50 max-w-sm mx-auto font-medium">
                      The Host is synchronizing the next major routine deployment. Stay authenticated for live updates.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] border-2 border-primary/20 bg-primary/5 shadow-2xl p-8 flex flex-col justify-center text-center space-y-6">
              <div className="w-16 h-16 bg-primary text-background rounded-2xl flex items-center justify-center mx-auto shadow-2xl border-2 border-white rotate-6 transition-transform hover:rotate-0">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <div className="space-y-4">
                <h4 className="text-2xl font-headline font-black uppercase tracking-tighter">Legal Proof</h4>
                <div className="bg-background/40 p-6 rounded-2xl shadow-inner border border-white/5">
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-3">Identity Sovereign</p>
                  <Badge className="bg-primary text-background font-black mb-3 uppercase text-[9px] px-3">Verified Status</Badge>
                  <p className="text-[11px] text-foreground/70 font-bold leading-relaxed">
                    Secured by Nico Digital protocols. Your execution data is isolated, encrypted, and strictly personal.
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[650px] animate-in fade-in slide-in-from-right-10">
            <div className="lg:col-span-1 space-y-4 flex flex-col">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/50" />
                <Input
                  placeholder="Find Succemazing..."
                  className="pl-11 h-12 rounded-2xl bg-secondary/40 border-primary/10 shadow-xl text-xs font-bold text-white focus:border-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {filteredStrategists.length > 0 && (
                <Card className="rounded-2xl border-primary/10 shadow-2xl overflow-hidden bg-secondary/60 backdrop-blur-xl">
                  {filteredStrategists.map((s) => (
                    <button
                      key={s.uid}
                      onClick={() => setSelectedProfile(s)}
                      className="w-full p-4 flex items-center gap-4 hover:bg-primary/10 transition-all text-left border-b border-white/5 last:border-0"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary text-background flex items-center justify-center font-black text-sm shadow-lg">
                        {s.nickname[0]}
                      </div>
                      <div>
                        <p className="font-black text-xs text-white">{s.nickname}</p>
                        <p className="text-[9px] text-primary/60 uppercase font-bold tracking-widest">{s.uid}</p>
                      </div>
                    </button>
                  ))}
                </Card>
              )}
              <Card className="flex-1 rounded-[2rem] overflow-hidden shadow-2xl border-white/5 bg-secondary/20 flex flex-col backdrop-blur-sm">
                <CardHeader className="bg-secondary/40 p-5 border-b border-white/5">
                  <h4 className="text-[10px] font-black flex items-center gap-2 uppercase tracking-widest text-primary">
                    <MessageCircle className="h-4 w-4" /> Active Connections
                  </h4>
                </CardHeader>
                <CardContent className="p-0 overflow-y-auto flex-1 scrollbar-hide">
                  {MOCK_STRATEGISTS.filter((s) => friends.includes(s.uid)).map((friend) => (
                    <button
                      key={friend.uid}
                      onClick={() => setActiveChatId(friend.uid)}
                      className={cn(
                        'w-full p-5 flex items-center gap-4 hover:bg-primary/5 transition-all text-left border-b border-white/5',
                        activeChatId === friend.uid ? 'bg-primary/10 border-r-4 border-r-primary' : ''
                      )}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-primary text-background flex items-center justify-center text-xl font-black shadow-2xl">
                        {friend.nickname[0]}
                      </div>
                      <div>
                        <p className="font-black text-sm text-white">{friend.nickname}</p>
                        <p className="text-[9px] font-black text-primary flex items-center gap-1.5 uppercase tracking-tighter">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Online
                        </p>
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-3">
              {activeChatId ? (
                <Card className="h-full rounded-[2.5rem] shadow-2xl border-white/5 flex flex-col overflow-hidden bg-secondary/10 backdrop-blur-sm">
                  <div className="p-6 bg-secondary/40 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-primary text-background flex items-center justify-center font-black text-2xl shadow-2xl">
                        {MOCK_STRATEGISTS.find((s) => s.uid === activeChatId)?.nickname[0]}
                      </div>
                      <div>
                        <h4 className="text-xl font-black tracking-tight text-white uppercase">
                          {MOCK_STRATEGISTS.find((s) => s.uid === activeChatId)?.nickname}
                        </h4>
                        <p className="text-primary/60 font-black text-[9px] uppercase tracking-[0.4em]">MeText Secured Connection</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 p-8 overflow-y-auto space-y-6 bg-background/20 scrollbar-hide">
                    {currentChatMessages.map((m) => (
                      <div key={m.id} className={`flex ${m.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={cn(
                            'p-5 rounded-3xl max-w-[80%] text-sm font-bold shadow-2xl border transition-transform hover:scale-[1.01]',
                            m.senderId === user?.uid
                              ? 'bg-primary text-background border-primary rounded-br-none'
                              : 'bg-secondary/40 border-white/5 text-white rounded-tl-none'
                          )}
                        >
                          {m.text}
                          <p className="text-[8px] opacity-40 mt-2 uppercase font-black tracking-widest">
                            {formatDistanceToNow(new Date(m.timestamp))} ago
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-6 bg-secondary/40 border-t border-white/5 flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full text-primary hover:bg-primary/10">
                      <Smile className="h-6 w-6" />
                    </Button>
                    <div className="flex-1">
                      <Input
                        placeholder="Type a MeText..."
                        className="h-14 rounded-2xl bg-background/40 border-primary/10 px-6 text-sm font-bold text-white focus:border-primary"
                        value={msg}
                        onChange={(e) => setMsg(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      />
                    </div>
                    <Button
                      className="h-14 w-14 rounded-2xl bg-primary text-background shadow-2xl hover:bg-white transition-all active:scale-95"
                      onClick={handleSendMessage}
                      disabled={!msg}
                    >
                      <Send className="h-6 w-6" />
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="h-full rounded-[3rem] border-4 border-dashed border-primary/5 flex flex-col items-center justify-center text-center p-12 bg-secondary/5">
                  <MessageCircle className="h-20 w-20 text-primary/10 mb-6" />
                  <h3 className="text-4xl font-headline font-black text-white/10 tracking-tighter uppercase">MeText Hub</h3>
                  <p className="text-sm text-foreground/40 mt-4 max-w-sm font-bold leading-relaxed">
                    Select a verified Succemazing to initialize a secured Nico Digital strategy session.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="shooppy" className="animate-in fade-in slide-in-from-bottom-5">
            <Card className="rounded-[3rem] border-white/5 shadow-2xl bg-secondary/10 overflow-hidden backdrop-blur-sm">
              <div className="bg-primary p-12 text-background flex flex-col md:flex-row justify-between items-center gap-10">
                <div className="space-y-3 text-center md:text-left">
                  <h2 className="text-5xl font-headline font-black tracking-tighter uppercase">Shooppy</h2>
                  <p className="text-base font-black opacity-80 max-w-md leading-relaxed">
                    Access elite strategic assets to amplify your business execution. Bundles, Templates, and eBooks.
                  </p>
                </div>
                <Button size="lg" className="h-16 px-10 rounded-full bg-background text-primary font-black text-xl shadow-2xl hover:bg-secondary transition-all" asChild>
                  <a href="https://nico-digital.myshopify.com" target="_blank" rel="noopener noreferrer">
                    MAIN SHOP <ExternalLink className="ml-3 h-6 w-6" />
                  </a>
                </Button>
              </div>
              <CardContent className="p-10">
                {shooppyProducts.length === 0 ? (
                  <div className="text-center py-20 border-2 border-dashed border-primary/10 rounded-[2.5rem] bg-background/20">
                    <ShoppingBag className="h-16 w-16 mx-auto text-primary opacity-10 mb-4" />
                    <p className="text-lg text-primary/40 font-black italic uppercase tracking-widest">Assets Pending Deployment</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {shooppyProducts.map((p) => (
                      <Card key={p.id} className="rounded-3xl border-white/5 shadow-xl hover:shadow-2xl transition-all group overflow-hidden bg-secondary/30 flex flex-col backdrop-blur-sm border-2 hover:border-primary/20">
                        <div className="h-56 bg-background relative overflow-hidden">
                          {p.imageUrl && (
                            <img
                              src={p.imageUrl}
                              alt={p.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                          )}
                          <Badge className="absolute top-4 left-4 bg-background text-primary h-8 px-4 font-black rounded-full text-[10px] uppercase shadow-2xl border border-primary/20">
                            {p.type}
                          </Badge>
                        </div>
                        <div className="p-8 space-y-4 flex-1 flex flex-col">
                          <div className="flex justify-between items-start">
                            <h4 className="text-2xl font-black text-white uppercase tracking-tight">{p.title}</h4>
                            <span className="font-black text-primary text-xl tracking-tighter">{p.price}</span>
                          </div>
                          <p className="text-xs text-foreground/60 font-medium leading-relaxed line-clamp-3 flex-1">
                            {p.description}
                          </p>
                          <Button className="w-full h-14 rounded-2xl bg-primary text-background font-black text-sm shadow-xl hover:bg-white transition-all active:scale-95" asChild>
                            <a href={p.shopLink} target="_blank" rel="noopener noreferrer">
                              Acquire Asset
                            </a>
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
          <DialogContent className="rounded-[3rem] border-2 border-primary/20 shadow-2xl p-8 max-w-sm bg-background/95 backdrop-blur-xl">
            <DialogHeader className="items-center text-center space-y-4">
              <div className="w-24 h-24 rounded-3xl bg-primary text-background flex items-center justify-center text-4xl font-black shadow-2xl border-4 border-background rotate-3 transition-transform hover:rotate-0">
                {selectedProfile?.nickname[0]}
              </div>
              <div className="space-y-1">
                <DialogTitle className="text-3xl font-black text-white uppercase tracking-tighter">
                  {selectedProfile?.nickname}
                </DialogTitle>
                <DialogDescription className="text-primary font-black uppercase tracking-[0.4em] text-[10px]">
                  Sovereign Strategist
                </DialogDescription>
              </div>
            </DialogHeader>
            <div className="space-y-6 mt-6">
              <div className="p-6 bg-secondary/40 rounded-2xl border border-white/5 shadow-inner">
                <Label className="font-black text-[9px] uppercase tracking-widest text-primary/60 mb-2 block">Strategic Bio</Label>
                <p className="font-bold text-white text-sm leading-relaxed">{selectedProfile?.bio || 'No bio set.'}</p>
              </div>
              <div className="flex flex-col gap-4 p-4 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-primary/40 uppercase tracking-widest">
                    ID: {selectedProfile?.uid}
                  </span>
                </div>
                <Button
                  size="lg"
                  className="w-full rounded-2xl bg-primary text-background font-black h-14 text-sm shadow-2xl hover:bg-white transition-all active:scale-95"
                  onClick={() => handleSendFriendRequest(selectedProfile)}
                  disabled={friends.includes(selectedProfile?.uid)}
                >
                  {friends.includes(selectedProfile?.uid) ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Connected
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" /> Connect Strategist
                    </>
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
