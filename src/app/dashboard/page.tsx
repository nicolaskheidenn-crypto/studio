
'use client';

import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Trophy, Flame, Zap, Award, Search, Plus, ExternalLink,
  MessageCircle, Newspaper, Lightbulb, Star, Video, Heart, ShieldCheck, Mail, UserPlus, Send, LayoutDashboard, ShoppingBag, BookOpen, HelpCircle, MessageSquare, Lock, Trash2, UserMinus, Check, X
} from 'lucide-react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { useState, useEffect, useRef, useMemo } from 'react';
import { toast } from '@/hooks/use-toast';
import { useAdminStore, useUserStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { collection, query, where, limit } from 'firebase/firestore';

export default function DashboardPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { 
    points, xp, level, streak, nickname,
    claimDaily, lastLogin, addPoints,
    friends, sentRequests, notifications,
    sendFriendRequest, acceptFriendRequest, declineFriendRequest, unfriend, clearNotification
  } = useUserStore();
  
  const { 
    shooppyProducts, newsPosts, faqs, resources, activityWall, 
    addActivityWall, addResource, heartPost, addComment, deleteComment 
  } = useAdminStore();
  
  const [showDaily, setShowDaily] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [activeTab, setActiveTab] = useState('hub');

  // Activity State
  const [postText, setPostText] = useState("");
  const [postImages, setPostImages] = useState<string[]>([]);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resource State
  const [resTitle, setResTitle] = useState("");
  const [resType, setResType] = useState<'AI_Prompt' | 'T&Triks'>('AI_Prompt');
  const [resContent, setResContent] = useState("");

  // MeText State
  const [chatInput, setChatInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChatTarget, setActiveChatTarget] = useState<string>('The Host');
  const [messages, setMessages] = useState<Record<string, any[]>>({
    'The Host': [
      { id: '1', sender: 'The Host', text: 'Welcome to MeText, Strategist. Empire alignment begins with synchronized communication.', timestamp: new Date().toISOString() }
    ]
  });

  // Dynamic Real User Registry - Pulling only real strategists from Firestore
  const usersQuery = useMemo(() => query(collection(db, 'users'), limit(50)), [db]);
  const { data: realUsers } = useCollection<{ id: string, nickname: string, bio: string }>(usersQuery);

  useEffect(() => {
    const checkDaily = () => {
      if (!lastLogin) return true;
      const last = new Date(lastLogin).getTime();
      const now = new Date().getTime();
      return (now - last) > 86400000;
    };
    if (checkDaily()) setShowDaily(true);
  }, [lastLogin]);

  const handleClaimDaily = () => {
    claimDaily();
    setShowDaily(false);
    toast({ title: "Daily Sync Complete", description: "+100 Points, +50 XP Added." });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + postImages.length > 6) {
      toast({ title: "Limit Reached", description: "Max 6 photos allowed.", variant: "destructive" });
      return;
    }
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setPostImages(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const handleDispatchWin = () => {
    if (!postText) return;
    addActivityWall({
      userId: user?.uid || 'anon',
      nickname: nickname,
      description: postText,
      images: postImages,
      isPrivate: false
    });
    addPoints(20);
    setPostText("");
    setPostImages([]);
    toast({ title: "Sovereign Win Dispatched", description: "+20 Points earned." });
    setActiveTab('hub'); 
  };

  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId];
    if (!text?.trim()) return;
    addComment(postId, {
      userId: user?.uid || 'anon',
      nickname: nickname,
      text: text
    });
    setCommentInputs(prev => ({ ...prev, [postId]: "" }));
    toast({ title: "Insight Recorded" });
  };

  const handleAddResource = () => {
    if (!resTitle || !resContent) return;
    addResource({
      title: resTitle,
      description: "",
      type: resType,
      content: resContent,
      userId: user?.uid || 'anon',
      nickname: nickname
    });
    addPoints(10);
    setResTitle(""); setResContent("");
    toast({ title: "Strategic Resource Shared", description: "+10 Points earned." });
  };

  const handleSendMessage = () => {
    if (!chatInput.trim() || !friends.includes(activeChatTarget)) return;
    const newMessage = {
      id: Math.random().toString(),
      sender: nickname,
      text: chatInput,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => ({
      ...prev,
      [activeChatTarget]: [...(prev[activeChatTarget] || []), newMessage]
    }));
    setChatInput("");
    
    // Automatic Response Simulation for The Host
    if (activeChatTarget === 'The Host') {
      setTimeout(() => {
        const response = {
          id: Math.random().toString(),
          sender: 'The Host',
          text: 'Synchronizing... Message received. Keep executing.',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => ({
          ...prev,
          'The Host': [...(prev['The Host'] || []), response]
        }));
      }, 1500);
    }
  };

  const filteredStrategists = useMemo(() => {
    const list = realUsers || [];
    // We filter out the current user and filter by search query
    return list.filter(s => 
      s.nickname !== nickname && 
      (searchQuery === "" || s.nickname.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [realUsers, searchQuery, nickname]);

  const isFriend = (target: string) => friends.includes(target);
  const hasSentRequest = (target: string) => sentRequests.includes(target);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      {/* Gamification Stats Bar */}
      <div className="bg-card/80 border-b-4 border-primary/20 backdrop-blur-md sticky top-16 z-40">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div className="flex flex-col">
              <div className="flex items-center gap-3 text-primary">
                <Zap className="h-7 w-7 fill-primary" />
                <span className="font-black text-3xl tracking-tighter text-foreground">{points}</span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Points Vault</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-3 text-orange-500">
                <Flame className="h-7 w-7 fill-orange-500" />
                <span className="font-black text-3xl tracking-tighter text-foreground">{streak}</span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Current Streak</span>
            </div>
            {notifications.length > 0 && (
              <Button onClick={() => setActiveTab('hub')} variant="ghost" className="relative group p-2">
                <Mail className="h-8 w-8 text-primary animate-pulse" />
                <Badge className="absolute -top-1 -right-1 bg-red-600 border-2 border-background animate-bounce">{notifications.length}</Badge>
              </Button>
            )}
          </div>
          
          <button 
            onClick={() => setShowRewardModal(true)}
            className="flex items-center gap-6 group hover:scale-105 transition-all"
          >
            <div className="text-right hidden sm:block">
               <p className="font-black text-sm uppercase text-foreground">{nickname}</p>
               <p className="text-[10px] font-black uppercase text-primary">Master Strategist</p>
            </div>
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full rotate-[-90deg]">
                <circle cx="32" cy="32" r="28" fill="transparent" stroke="currentColor" strokeWidth="6" className="text-primary/10" />
                <circle cx="32" cy="32" r="28" fill="transparent" stroke="currentColor" strokeWidth="6" strokeDasharray="176" strokeDashoffset={176 - (176 * xp) / 100} className="text-primary" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-sm font-black text-foreground">Lv.{level}</div>
            </div>
          </button>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-10">
          <TabsList className="bg-card p-2 rounded-full w-fit shadow-2xl border-4 border-primary/10 overflow-x-auto scrollbar-hide">
            <TabsTrigger value="hub" className="rounded-full px-10 h-12 text-[11px] font-black uppercase tracking-widest gap-2"><LayoutDashboard className="h-4 w-4" /> Hub</TabsTrigger>
            <TabsTrigger value="shooppy" className="rounded-full px-10 h-12 text-[11px] font-black uppercase tracking-widest gap-2"><ShoppingBag className="h-4 w-4" /> Shooppy</TabsTrigger>
            <TabsTrigger value="resources" className="rounded-full px-10 h-12 text-[11px] font-black uppercase tracking-widest gap-2"><BookOpen className="h-4 w-4" /> Library</TabsTrigger>
            <TabsTrigger value="faq" className="rounded-full px-10 h-12 text-[11px] font-black uppercase tracking-widest gap-2"><HelpCircle className="h-4 w-4" /> FAQ</TabsTrigger>
            <TabsTrigger value="metext" className="rounded-full px-10 h-12 text-[11px] font-black uppercase tracking-widest gap-2"><MessageSquare className="h-4 w-4" /> MeText</TabsTrigger>
          </TabsList>

          {/* Hub Tab Content */}
          <TabsContent value="hub" className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-10">
              {/* Sovereign Notifications (Friend Requests) */}
              {notifications.length > 0 && (
                <Card className="rounded-[3rem] border-4 border-primary bg-primary/5 p-10 animate-in slide-in-from-top-4">
                  <h3 className="text-2xl font-black uppercase italic text-primary mb-6 flex items-center gap-3">
                    <ShieldCheck className="h-8 w-8" /> Incoming Protocol Requests
                  </h3>
                  <div className="space-y-4">
                    {notifications.map(n => (
                      <div key={n.id} className="p-6 bg-background/60 rounded-3xl border-2 border-primary/20 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center font-black text-background text-sm">
                            {n.from.slice(0,2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-black text-foreground">@{n.from}</p>
                            <p className="text-[10px] text-primary/60 font-black uppercase">{n.message}</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Button onClick={() => acceptFriendRequest(n.id, n.from)} size="icon" className="rounded-full bg-primary text-background"><Check className="h-5 w-5" /></Button>
                          <Button onClick={() => declineFriendRequest(n.id)} size="icon" variant="ghost" className="rounded-full text-red-500"><X className="h-5 w-5" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Win Dispatcher */}
              <Card className="rounded-[3.5rem] border-4 border-primary/10 shadow-2xl p-10 bg-card/40">
                <div className="flex gap-6">
                  <div className="w-16 h-16 rounded-3xl bg-primary flex items-center justify-center font-black text-background text-xl shadow-xl">
                    {nickname.slice(0,2).toUpperCase()}
                  </div>
                  <Textarea 
                    placeholder="Document your Sovereign Win..." 
                    value={postText}
                    onChange={(e) => setPostText(e.target.value)}
                    className="flex-1 bg-background/50 border-2 border-primary/10 rounded-[2.5rem] p-8 text-lg font-bold min-h-[160px] text-foreground placeholder:text-foreground/30"
                  />
                </div>
                {postImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 pl-20 mt-6">
                    {postImages.map((img, i) => (
                      <div key={i} className="relative aspect-square rounded-3xl overflow-hidden group border-2 border-primary/20">
                        <img src={img} className="w-full h-full object-cover" />
                        <button onClick={() => setPostImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Plus className="h-4 w-4 rotate-45" /></button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-between items-center pl-20 mt-8">
                   <Button variant="ghost" className="text-primary hover:text-primary/70 rounded-full font-black text-[11px] uppercase tracking-widest" onClick={() => fileInputRef.current?.click()}>
                    <Plus className="h-6 w-6 mr-3" /> Gallery (1-6)
                   </Button>
                   <input type="file" min={1} max={6} ref={fileInputRef} hidden multiple accept="image/*" onChange={handleFileChange} />
                   <Button onClick={handleDispatchWin} className="bg-primary text-background rounded-full px-14 h-16 font-black uppercase text-sm shadow-2xl hover:bg-white hover:text-primary transition-all">Dispatch Win</Button>
                </div>
              </Card>

              {/* Newsfeed Content */}
              <div className="space-y-12">
                {newsPosts.map((news) => (
                  <Card key={news.id} className="rounded-[4rem] border-4 border-primary/20 bg-primary/5 overflow-hidden shadow-2xl">
                    <CardHeader className="p-10 pb-6">
                       <div className="flex items-center gap-4">
                         <Newspaper className="h-8 w-8 text-primary" />
                         <span className="text-[11px] font-black uppercase text-primary tracking-[0.3em]">Host Broadcast</span>
                       </div>
                       <CardTitle className="text-4xl font-black text-foreground uppercase tracking-tighter mt-4 italic">{news.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-10 pt-0 space-y-8">
                       {news.imageUrl && <img src={news.imageUrl} className="w-full h-[500px] object-cover rounded-[3.5rem] shadow-2xl border-4 border-primary/20" alt={news.title} />}
                       <p className="text-xl font-bold text-foreground leading-relaxed">{news.content}</p>
                    </CardContent>
                  </Card>
                ))}

                {activityWall.map((post) => (
                  <Card key={post.id} className="rounded-[4rem] border-4 border-primary/10 bg-card shadow-2xl overflow-hidden">
                    <CardHeader className="p-10 pb-6">
                       <div className="flex items-center gap-5">
                         <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center font-black text-primary text-sm border-2 border-primary/20">{post.nickname.slice(0,2).toUpperCase()}</div>
                         <div className="flex-1">
                            <p className="font-black text-xl uppercase text-foreground">{post.nickname}</p>
                            <p className="text-[10px] font-black uppercase text-primary/60 tracking-widest">{new Date(post.timestamp).toLocaleString()}</p>
                         </div>
                       </div>
                    </CardHeader>
                    <CardContent className="p-10 pt-0 space-y-8">
                       <p className="text-2xl font-black text-foreground leading-tight tracking-tight uppercase italic">{post.description}</p>
                       {post.images.length > 0 && (
                         <div className={cn("grid gap-4", post.images.length === 1 ? "grid-cols-1" : post.images.length === 2 ? "grid-cols-2" : "grid-cols-3")}>
                           {post.images.map((img, i) => <img key={i} src={img} className="w-full h-96 object-cover rounded-[3rem] shadow-lg border-2 border-primary/10" alt="Activity" />)}
                         </div>
                       )}
                       
                       <div className="flex gap-8 pt-8 border-t-2 border-primary/10">
                          <Button 
                            variant="ghost" 
                            className="text-[11px] font-black uppercase tracking-widest text-primary hover:text-primary transition-all"
                            onClick={() => heartPost(post.id)}
                          >
                            <Heart className="h-6 w-6 mr-3 fill-primary" /> 
                            {post.hearts || 0} Heart
                          </Button>
                          <Button variant="ghost" className="text-[11px] font-black uppercase tracking-widest text-primary/40 hover:text-primary">
                            <MessageCircle className="h-6 w-6 mr-3" /> 
                            {post.comments?.length || 0} Insight
                          </Button>
                       </div>

                       {/* Comment Section */}
                       <div className="space-y-6 pt-6 bg-background/20 rounded-[2.5rem] p-6">
                          <div className="flex gap-4">
                             <Input 
                               placeholder="Add a strategic insight..." 
                               className="h-14 rounded-2xl bg-background/50 border-primary/10 text-sm font-black"
                               value={commentInputs[post.id] || ""}
                               onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                               onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                             />
                             <Button onClick={() => handleAddComment(post.id)} className="h-14 w-14 rounded-2xl bg-primary text-background"><Send className="h-6 w-6" /></Button>
                          </div>
                          
                          <div className="space-y-4">
                             {post.comments?.map((comment) => (
                               <div key={comment.id} className="p-6 bg-background/40 rounded-3xl border-2 border-primary/5 flex justify-between items-start group">
                                  <div className="flex-1">
                                     <div className="flex items-center gap-3 mb-1">
                                        <p className="font-black text-xs uppercase text-primary">@{comment.nickname}</p>
                                        <span className="text-[10px] text-white/20 font-black">{new Date(comment.timestamp).toLocaleTimeString()}</span>
                                     </div>
                                     <p className="text-base font-bold text-foreground/80">{comment.text}</p>
                                  </div>
                                  {(user?.uid === post.userId || user?.email === 'nicolaskheidenn@gmail.com') && (
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="text-red-500/40 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => deleteComment(post.id, comment.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                               </div>
                             ))}
                          </div>
                       </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-10">
              <Card className="rounded-[3.5rem] border-4 border-primary/20 bg-card/40 p-12 text-center space-y-10 shadow-2xl">
                 <div className="w-28 h-28 bg-primary text-background rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl">
                   <Trophy className="h-14 w-14" />
                 </div>
                 <div className="space-y-3">
                   <h3 className="text-4xl font-black uppercase tracking-tighter text-foreground italic">Sovereign Proof</h3>
                   <p className="text-[10px] font-black uppercase text-primary/40 tracking-[0.4em]">Protocol Consistency Level</p>
                 </div>
                 <div className="p-10 bg-primary/5 rounded-[3rem] border-2 border-primary/10">
                   <p className="text-5xl font-black text-primary italic tracking-tighter">x{(1 + level/10).toFixed(1)}</p>
                   <p className="text-[10px] font-black uppercase text-primary mt-4 tracking-widest">Growth Multiplier</p>
                 </div>
              </Card>
            </div>
          </TabsContent>

          {/* MeText Tab - Real User Integration & High-Impact UI */}
          <TabsContent value="metext" className="h-[750px]">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
                {/* Left Strategists Sidebar */}
                <div className="bg-[#120d0b] border-4 border-primary/20 rounded-[3rem] overflow-hidden flex flex-col shadow-2xl">
                   <div className="p-10 space-y-8">
                      <h3 className="text-4xl font-headline font-black text-white italic uppercase tracking-tighter">STRATEGISTS</h3>
                      <div className="relative">
                         <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                         <Input 
                            placeholder="Search Identity..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-16 h-16 rounded-full bg-[#1f1610] border-2 border-primary/40 font-black text-white placeholder:text-white/20 focus:border-primary" 
                         />
                      </div>
                   </div>
                   <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
                      {filteredStrategists.length === 0 ? (
                        <div className="text-center py-10 opacity-20 font-black uppercase italic text-xs tracking-widest">No Real Identities Found</div>
                      ) : (
                        filteredStrategists.map((strat) => (
                          <div 
                            key={strat.id} 
                            className={cn(
                              "p-8 rounded-[2.5rem] border-2 flex items-center justify-between group cursor-pointer transition-all",
                              activeChatTarget === strat.nickname ? "bg-primary/20 border-primary shadow-[0_0_20px_rgba(255,215,0,0.1)]" : "bg-[#1f1610] border-primary/10 hover:border-primary/40"
                            )}
                            onClick={() => isFriend(strat.nickname) && setActiveChatTarget(strat.nickname)}
                          >
                             <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center font-black text-[#120d0b] text-xl shadow-lg">
                                  {strat.nickname.slice(0,2).toUpperCase()}
                                </div>
                                <div>
                                   <p className="font-black text-lg uppercase text-white leading-none">{strat.nickname}</p>
                                   <p className="text-[10px] text-primary uppercase font-black tracking-widest mt-1">Strategist</p>
                                </div>
                             </div>
                             <div className="flex gap-2">
                               {isFriend(strat.nickname) ? (
                                 <>
                                   <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10 rounded-full"><MessageSquare className="h-6 w-6" /></Button>
                                   <Button variant="ghost" size="icon" title="Sever Link" className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-red-500/10" onClick={(e) => { e.stopPropagation(); unfriend(strat.nickname); toast({ title: "Protocol Severed" }); }}><UserMinus className="h-6 w-6" /></Button>
                                 </>
                               ) : hasSentRequest(strat.nickname) ? (
                                 <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] uppercase font-black px-4 rounded-full">Pending</Badge>
                               ) : (
                                 <Button variant="ghost" size="icon" title="Add Strategist" className="text-primary hover:bg-primary/20 rounded-full" onClick={(e) => { e.stopPropagation(); sendFriendRequest(strat.nickname); toast({ title: "Protocol Request Dispatched" }); }}><UserPlus className="h-6 w-6" /></Button>
                               )}
                             </div>
                          </div>
                        ))
                      )}
                   </div>
                </div>

                {/* Right Chat Hub */}
                <div className="lg:col-span-2 bg-[#120d0b] border-4 border-primary/20 rounded-[3rem] overflow-hidden flex flex-col shadow-2xl">
                   {/* Header */}
                   <div className="p-10 border-b-2 border-primary/10 flex items-center gap-6 bg-[#1f1610]/30">
                      <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center font-black text-[#120d0b] text-3xl shadow-[0_0_30px_rgba(255,215,0,0.2)]">
                        {activeChatTarget.slice(0,2).toUpperCase()}
                      </div>
                      <div>
                         <h3 className="text-3xl font-headline font-black text-white italic uppercase tracking-tighter leading-none">{activeChatTarget}</h3>
                         <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mt-2">SOVEREIGN COMMUNICATION HUB</p>
                      </div>
                   </div>

                   {/* Messages Pane */}
                   <div className="flex-1 overflow-y-auto p-12 space-y-12 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.03),transparent)] scrollbar-hide">
                      {isFriend(activeChatTarget) ? (
                        (messages[activeChatTarget] || []).map((msg) => (
                          <div key={msg.id} className={cn("flex items-start gap-6", msg.sender === nickname ? "flex-row-reverse" : "flex-row")}>
                             <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center font-black text-[#120d0b] text-sm shadow-md">
                                {msg.sender === nickname ? nickname.slice(0,2).toUpperCase() : activeChatTarget.slice(0,2).toUpperCase()}
                             </div>
                             <div className={cn("max-w-[70%] p-10 border-2", 
                                msg.sender === nickname 
                                  ? "bg-primary/10 border-primary rounded-[3rem] rounded-tr-none" 
                                  : "bg-[#1f1610] border-primary/20 rounded-[3rem] rounded-tl-none")}>
                                <p className="text-xl font-bold text-white leading-relaxed">{msg.text}</p>
                                <p className="text-[10px] font-black text-primary mt-4 uppercase tracking-widest">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                             </div>
                          </div>
                        ))
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-10 opacity-40">
                           <Lock className="h-40 w-40 text-primary animate-pulse" />
                           <div className="space-y-4">
                              <h3 className="text-4xl font-headline font-black text-white uppercase italic tracking-tighter">Sync Required</h3>
                              <p className="text-sm font-black text-primary uppercase tracking-[0.5em] max-w-sm">
                                Establishing secure friendship protocol with @{activeChatTarget} is mandatory for messaging.
                              </p>
                           </div>
                           <Button onClick={() => sendFriendRequest(activeChatTarget)} disabled={hasSentRequest(activeChatTarget)} className="rounded-full h-18 px-14 bg-primary text-[#120d0b] font-black uppercase text-sm hover:scale-105 transition-transform">
                             {hasSentRequest(activeChatTarget) ? 'Protocol Requested' : 'Dispatch Friend Request'}
                           </Button>
                        </div>
                      )}
                   </div>

                   {/* Input Bar */}
                   {isFriend(activeChatTarget) && (
                     <div className="p-10 border-t-2 border-primary/10 bg-[#1f1610]/20 flex gap-6 items-center">
                        <Input 
                          placeholder="Sync message..." 
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                          className="flex-1 h-20 rounded-full bg-[#120d0b] border-2 border-primary/40 px-10 text-xl font-black text-white placeholder:text-white/20 focus:border-primary" 
                        />
                        <Button 
                          onClick={handleSendMessage} 
                          className="h-20 w-20 rounded-full bg-primary text-[#120d0b] shadow-2xl hover:bg-white transition-all active:scale-90"
                        >
                          <Send className="h-8 w-8" />
                        </Button>
                     </div>
                   )}
                </div>
             </div>
          </TabsContent>
          
          {/* Other Tabs Content Remains Intact... */}
          <TabsContent value="shooppy" className="space-y-16">
             <div className="text-center space-y-3">
                <h3 className="text-6xl font-black text-foreground uppercase tracking-tighter italic">Strategic Marketplace</h3>
                <p className="text-[11px] font-black uppercase text-primary tracking-[0.6em]">Master Level Digital Assets</p>
             </div>
             
             {shooppyProducts.length === 0 ? (
               <div className="py-20 text-center bg-card/40 rounded-[4rem] border-4 border-dashed border-primary/20">
                 <ShoppingBag className="h-20 w-20 mx-auto text-primary/20 mb-6" />
                 <p className="text-2xl font-black text-foreground/40 uppercase tracking-tighter italic">No digital assets deployed in the vault yet.</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {shooppyProducts.map((p) => (
                    <Card key={p.id} className="rounded-[4rem] border-4 border-primary/10 bg-card shadow-2xl overflow-hidden group hover:border-primary transition-all">
                      <div className="h-80 relative overflow-hidden bg-background/50">
                         {p.imageUrl && <img src={p.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={p.title} />}
                         <Badge className="absolute top-8 left-8 bg-primary text-background font-black uppercase text-[11px] tracking-widest rounded-full h-10 px-6 shadow-xl border-4 border-primary/20">{p.type}</Badge>
                         {p.requiredLevel && level < p.requiredLevel && (
                           <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white backdrop-blur-md">
                              <Lock className="h-16 w-16 text-primary mb-4" />
                              <p className="font-black text-sm uppercase tracking-[0.3em]">Unlock at Level {p.requiredLevel}</p>
                           </div>
                         )}
                      </div>
                      <div className="p-12 space-y-8">
                         <h4 className="text-4xl font-black text-foreground uppercase tracking-tight italic">{p.title}</h4>
                         <p className="text-base font-bold text-foreground/70 leading-relaxed line-clamp-3">{p.description}</p>
                         <Button disabled={p.requiredLevel ? level < p.requiredLevel : false} className="w-full h-18 rounded-[2rem] bg-primary text-background font-black uppercase text-sm shadow-2xl hover:bg-white hover:text-primary transition-all">Acquire Strategic Asset</Button>
                      </div>
                    </Card>
                  ))}
               </div>
             )}
          </TabsContent>

          <TabsContent value="resources" className="space-y-12">
             <Card className="rounded-[4rem] border-4 border-primary/10 bg-card/40 p-12 shadow-2xl space-y-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                   <div className="space-y-10">
                      <h3 className="text-6xl font-black text-foreground uppercase tracking-tighter italic">Library Labs</h3>
                      <p className="text-xl font-bold text-foreground/70">Inject strategic knowledge into the collective sovereign vault.</p>
                      <div className="space-y-6">
                         <div className="space-y-3">
                            <Label>Resource Title</Label>
                            <Input placeholder="Resource Title" value={resTitle} onChange={e => setResTitle(e.target.value)} className="h-16 rounded-2xl font-black text-xl" />
                         </div>
                         <div className="space-y-3">
                            <Label>Laboratory</Label>
                            <select className="w-full h-16 bg-background/50 border-2 border-primary/10 rounded-2xl px-8 font-black uppercase text-primary text-sm" value={resType} onChange={e => setResType(e.target.value as any)}>
                                <option value="AI_Prompt">AI Prompt Lab</option>
                                <option value="T&Triks">T&Triks Archive</option>
                            </select>
                         </div>
                         <div className="space-y-3">
                            <Label>Strategic Content</Label>
                            <Textarea placeholder="Share your prompts or execution tips..." value={resContent} onChange={e => setResContent(e.target.value)} className="min-h-[140px] bg-background/50 border-2 border-primary/10 rounded-[2.5rem] p-8 text-lg font-bold" />
                         </div>
                         <Button onClick={handleAddResource} className="w-full h-20 rounded-full bg-primary text-background font-black uppercase text-lg shadow-2xl">Share Knowledge</Button>
                      </div>
                   </div>
                   
                   <div className="space-y-10">
                      <Tabs defaultValue="ai" className="w-full">
                         <TabsList className="bg-primary/5 p-2 rounded-full w-full mb-10 border-2 border-primary/10">
                            <TabsTrigger value="ai" className="rounded-full flex-1 text-[11px] font-black uppercase h-12">AI Prompts</TabsTrigger>
                            <TabsTrigger value="triks" className="rounded-full flex-1 text-[11px] font-black uppercase h-12">T&Triks</TabsTrigger>
                            <TabsTrigger value="webin" className="rounded-full flex-1 text-[11px] font-black uppercase h-12">WeBin</TabsTrigger>
                         </TabsList>
                         
                         <TabsContent value="ai" className="space-y-6 max-h-[600px] overflow-y-auto pr-4 scrollbar-hide">
                            {resources.filter(r => r.type === 'AI_Prompt').map(r => (
                              <div key={r.id} className="p-8 bg-primary/5 rounded-[3rem] border-4 border-primary/10 space-y-4">
                                 <h4 className="font-black text-foreground uppercase text-lg italic">{r.title}</h4>
                                 <p className="text-[11px] text-primary font-black uppercase tracking-widest">By @{r.nickname}</p>
                                 <div className="p-4 bg-background/50 rounded-2xl border-2 border-primary/10 text-sm font-bold text-foreground/80 italic leading-relaxed">
                                    {r.content}
                                 </div>
                                 <Button variant="outline" className="h-10 rounded-full text-[10px] uppercase font-black px-8 border-primary/20 text-primary hover:bg-primary hover:text-background" onClick={() => { navigator.clipboard.writeText(r.content); toast({ title: "Prompt Copied" }); }}>Copy Lab Data</Button>
                              </div>
                            ))}
                         </TabsContent>
                         
                         <TabsContent value="triks" className="space-y-6 max-h-[600px] overflow-y-auto pr-4 scrollbar-hide">
                            {resources.filter(r => r.type === 'T&Triks').map(r => (
                              <div key={r.id} className="p-8 bg-primary/5 rounded-[3rem] border-4 border-primary/10 space-y-4">
                                 <h4 className="font-black text-foreground uppercase text-lg italic">{r.title}</h4>
                                 <p className="text-[11px] text-primary font-black uppercase tracking-widest">By @{r.nickname}</p>
                                 <p className="text-base font-bold text-foreground/70 leading-relaxed">{r.content}</p>
                              </div>
                            ))}
                         </TabsContent>

                         <TabsContent value="webin" className="space-y-6">
                            {resources.filter(r => r.type === 'WeBin').map(r => (
                              <div key={r.id} className="p-10 bg-primary/10 rounded-[3rem] border-4 border-primary/20 flex justify-between items-center group">
                                 <div className="space-y-2">
                                   <h4 className="font-black text-foreground uppercase text-xl italic">{r.title}</h4>
                                   <p className="text-sm font-bold text-foreground/60">Sovereign Knowledge Session</p>
                                 </div>
                                 <Button className="rounded-full h-14 px-10 font-black uppercase text-xs shadow-xl active:scale-95" asChild><a href={r.content} target="_blank">Watch Now</a></Button>
                              </div>
                            ))}
                         </TabsContent>
                      </Tabs>
                   </div>
                </div>
             </Card>
          </TabsContent>

          <TabsContent value="faq" className="max-w-4xl mx-auto space-y-12">
             <div className="text-center space-y-3">
                <h3 className="text-6xl font-black text-foreground uppercase tracking-tighter italic">Protocol Inquiry</h3>
                <p className="text-[11px] font-black uppercase text-primary tracking-[0.5em]">Frequently Asked Strategic Questions</p>
             </div>
             <Card className="rounded-[4rem] border-4 border-primary/10 bg-card/40 p-12 shadow-2xl">
                <Accordion type="single" collapsible className="w-full space-y-6">
                  {faqs.map((f) => (
                    <AccordionItem key={f.id} value={f.id} className="border-none bg-background/50 rounded-[3rem] px-12 transition-all data-[state=open]:shadow-2xl overflow-hidden">
                      <AccordionTrigger className="text-lg font-black text-foreground uppercase tracking-widest hover:no-underline py-10 [&>svg]:h-6 [&>svg]:w-6 [&>svg]:text-primary">
                        {f.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-lg text-foreground/80 leading-relaxed font-bold pb-12 pt-4 border-t-2 border-primary/10">
                        {f.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
             </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Daily Sync Modal */}
      <Dialog open={showDaily} onOpenChange={setShowDaily}>
        <DialogContent className="rounded-[5rem] border-[12px] border-primary/20 bg-card p-20 max-w-lg text-center shadow-[0_50px_100px_rgba(0,0,0,0.6)]">
          <DialogHeader>
            <DialogTitle className="text-5xl font-black text-foreground uppercase tracking-tighter italic text-center">Daily Sync</DialogTitle>
          </DialogHeader>
          <div className="space-y-12 mt-8">
            <div className="w-40 h-40 bg-primary text-background rounded-[4rem] flex items-center justify-center mx-auto shadow-2xl animate-bounce">
              <Award className="h-20 w-20" />
            </div>
            <div className="space-y-4">
              <p className="text-[11px] text-primary font-black uppercase tracking-[0.5em]">Sovereign Protocol Initiated</p>
            </div>
            <div className="p-10 bg-background/50 rounded-[3.5rem] border-4 border-primary/10 flex justify-around shadow-inner">
               <div><p className="text-4xl font-black text-foreground">100</p><p className="text-[10px] font-black uppercase text-primary/40">Points</p></div>
               <div className="w-px h-12 bg-primary/20" />
               <div><p className="text-4xl font-black text-foreground">50</p><p className="text-[10px] font-black uppercase text-primary/40">XP</p></div>
            </div>
            <Button onClick={handleClaimDaily} className="w-full h-24 rounded-full bg-primary text-background font-black text-3xl shadow-2xl hover:scale-105 hover:bg-white hover:text-primary transition-all uppercase tracking-tighter">CLAIM REWARD</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Level Rewards Modal */}
      <Dialog open={showRewardModal} onOpenChange={setShowRewardModal}>
        <DialogContent className="rounded-[5rem] border-[12px] border-primary/20 bg-card p-20 max-w-xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-5xl font-black text-foreground uppercase tracking-tighter text-center italic">Mastery Rewards</DialogTitle>
          </DialogHeader>
          <div className="space-y-8 mt-12">
            {[
              { lv: 5, reward: "Bronze Strategy Bundle" },
              { lv: 10, reward: "Elite Ebook Archive Access" },
              { lv: 25, reward: "Host Priority Chat Channel" },
              { lv: 50, reward: "NICO DIGITAL Sovereign Status" },
            ].map((r) => (
              <div key={r.lv} className={cn("p-10 rounded-[3.5rem] border-4 flex items-center justify-between transition-all", level >= r.lv ? "bg-primary/10 border-primary" : "bg-white/5 border-white/10 opacity-40")}>
                <div><p className="text-[11px] font-black text-primary uppercase mb-2 tracking-widest">Level {r.lv}</p><p className="text-2xl font-black text-foreground uppercase italic">{r.reward}</p></div>
                <ShieldCheck className={cn("h-12 w-12", level >= r.lv ? "text-primary" : "text-foreground/20")} />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
