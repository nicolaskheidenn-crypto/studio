'use client';

import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Trophy, Flame, Zap, Award, Search, Plus, ExternalLink,
  MessageCircle, Newspaper, Lightbulb, Star, Video, Heart, ShieldCheck, Mail, UserPlus, Send
} from 'lucide-react';
import { useUser } from '@/firebase';
import { useState, useEffect, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import { useAdminStore, useUserStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function DashboardPage() {
  const { user } = useUser();
  const { 
    points, xp, level, streak, nickname, avatarUrl,
    claimDaily, lastLogin, addXP, addPoints 
  } = useUserStore();
  
  const { 
    shooppyProducts, newsPosts, faqs, resources, activityWall, 
    addActivityWall, addResource 
  } = useAdminStore();
  
  const [showDaily, setShowDaily] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [activeTab, setActiveTab] = useState('hub');

  // Activity State
  const [postText, setPostText] = useState("");
  const [postImages, setPostImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resource State
  const [resTitle, setResTitle] = useState("");
  const [resDesc, setResDesc] = useState("");
  const [resType, setResType] = useState<'AI_Prompt' | 'T&Triks'>('AI_Prompt');
  const [resContent, setResContent] = useState("");

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
    setPostText("");
    setPostImages([]);
    toast({ title: "Sovereign Win Dispatched" });
  };

  const handleAddResource = () => {
    if (!resTitle || !resContent) return;
    addResource({
      title: resTitle,
      description: resDesc,
      type: resType,
      content: resContent,
      userId: user?.uid || 'anon',
      nickname: nickname
    });
    setResTitle(""); setResDesc(""); setResContent("");
    toast({ title: "Strategic Resource Shared" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfaf6]">
      <Navigation />
      
      {/* Dynamic Stats Bar */}
      <div className="bg-white/80 border-b border-foreground/5 backdrop-blur-md sticky top-16 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary animate-pulse" />
                <span className="font-black text-lg text-foreground">{points}</span>
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest text-foreground/40">Total Points</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                <span className="font-black text-lg text-foreground">{streak}</span>
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest text-foreground/40">Current Streak</span>
            </div>
          </div>
          
          <button 
            onClick={() => setShowRewardModal(true)}
            className="flex items-center gap-4 group transition-transform hover:scale-105"
          >
            <div className="text-right hidden sm:block">
               <p className="font-black text-xs uppercase text-foreground">{nickname}</p>
               <p className="text-[8px] font-black uppercase text-primary">Master Strategist</p>
            </div>
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-full h-full rotate-[-90deg]">
                <circle cx="24" cy="24" r="22" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-foreground/5" />
                <circle cx="24" cy="24" r="22" fill="transparent" stroke="currentColor" strokeWidth="4" strokeDasharray="138" strokeDashoffset={138 - (138 * xp) / 100} className="text-primary" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-foreground">Lv.{level}</div>
            </div>
          </button>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="bg-white/50 p-1.5 rounded-full w-fit shadow-md border border-foreground/5 overflow-x-auto scrollbar-hide">
            <TabsTrigger value="hub" className="rounded-full px-8 h-10 text-[10px] font-black uppercase tracking-widest">Hub</TabsTrigger>
            <TabsTrigger value="shooppy" className="rounded-full px-8 h-10 text-[10px] font-black uppercase tracking-widest">Shooppy</TabsTrigger>
            <TabsTrigger value="resources" className="rounded-full px-8 h-10 text-[10px] font-black uppercase tracking-widest">Library</TabsTrigger>
            <TabsTrigger value="faq" className="rounded-full px-8 h-10 text-[10px] font-black uppercase tracking-widest">FAQ</TabsTrigger>
            <TabsTrigger value="metext" className="rounded-full px-8 h-10 text-[10px] font-black uppercase tracking-widest">MeText</TabsTrigger>
          </TabsList>

          <TabsContent value="hub" className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="lg:col-span-2 space-y-8">
              {/* Win Dispatcher */}
              <Card className="rounded-[2.5rem] border-foreground/5 shadow-xl p-8 bg-white space-y-6">
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center font-black text-foreground shadow-inner">
                    {nickname.slice(0,2).toUpperCase()}
                  </div>
                  <Textarea 
                    placeholder="Document your Sovereign Win..." 
                    value={postText}
                    onChange={(e) => setPostText(e.target.value)}
                    className="flex-1 bg-secondary/20 border-none rounded-3xl p-6 text-base font-medium min-h-[120px]"
                  />
                </div>
                {postImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 pl-16">
                    {postImages.map((img, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                        <img src={img} className="w-full h-full object-cover" />
                        <button onClick={() => setPostImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100"><Plus className="h-3 w-3 rotate-45" /></button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-between items-center pl-16">
                   <Button variant="ghost" className="text-foreground/60 hover:text-primary rounded-full font-black text-[10px] uppercase tracking-widest" onClick={() => fileInputRef.current?.click()}>
                    <Plus className="h-5 w-5 mr-2" /> Gallery (1-6)
                   </Button>
                   <input type="file" ref={fileInputRef} hidden multiple accept="image/*" onChange={handleFileChange} />
                   <Button onClick={handleDispatchWin} className="bg-foreground text-white rounded-full px-12 h-12 font-black uppercase text-xs shadow-xl active:scale-95 transition-all">Dispatch Win</Button>
                </div>
              </Card>

              {/* Sovereign Feed */}
              <div className="space-y-8">
                {newsPosts.map((news) => (
                  <Card key={news.id} className="rounded-[3rem] border-primary/20 bg-primary/5 overflow-hidden shadow-lg border-2">
                    <CardHeader className="p-8 pb-4">
                       <div className="flex items-center gap-3">
                         <Newspaper className="h-6 w-6 text-primary" />
                         <span className="text-[10px] font-black uppercase text-primary tracking-widest">Host Broadcast</span>
                       </div>
                       <CardTitle className="text-3xl font-black text-foreground uppercase tracking-tighter mt-2">{news.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pt-0 space-y-6">
                       {news.imageUrl && <img src={news.imageUrl} className="w-full h-96 object-cover rounded-[2.5rem] shadow-2xl" />}
                       <p className="text-lg font-medium text-foreground/80 leading-relaxed">{news.content}</p>
                    </CardContent>
                  </Card>
                ))}

                {activityWall.map((post) => (
                  <Card key={post.id} className="rounded-[3rem] border-foreground/5 bg-white shadow-xl overflow-hidden">
                    <CardHeader className="p-8 pb-4">
                       <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center font-black text-foreground text-xs">{post.nickname.slice(0,2).toUpperCase()}</div>
                         <div>
                            <p className="font-black text-sm uppercase text-foreground">{post.nickname}</p>
                            <p className="text-[8px] font-black uppercase text-foreground/40">{new Date(post.timestamp).toLocaleString()}</p>
                         </div>
                       </div>
                    </CardHeader>
                    <CardContent className="p-8 pt-0 space-y-6">
                       <p className="text-base font-medium text-foreground/80 leading-relaxed">{post.description}</p>
                       {post.images.length > 0 && (
                         <div className={cn("grid gap-4", post.images.length === 1 ? "grid-cols-1" : "grid-cols-2")}>
                           {post.images.map((img, i) => <img key={i} src={img} className="w-full h-80 object-cover rounded-[2rem] shadow-md" />)}
                         </div>
                       )}
                       <div className="flex gap-4 pt-6 border-t border-foreground/5">
                          <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-foreground/40"><Heart className="h-4 w-4 mr-2" /> Respect</Button>
                          <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-foreground/40"><MessageCircle className="h-4 w-4 mr-2" /> Insight</Button>
                       </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <Card className="rounded-[3rem] border-4 border-primary/20 bg-white p-10 text-center space-y-8 shadow-2xl">
                 <div className="w-24 h-24 bg-primary text-foreground rounded-[2rem] flex items-center justify-center mx-auto shadow-xl">
                   <Trophy className="h-12 w-12" />
                 </div>
                 <div className="space-y-2">
                   <h3 className="text-3xl font-black uppercase tracking-tighter text-foreground">Sovereign Proof</h3>
                   <p className="text-[10px] font-black uppercase text-foreground/40 tracking-widest">Strategy consistency level</p>
                 </div>
                 <div className="p-8 bg-secondary/30 rounded-3xl border border-foreground/5">
                   <p className="text-4xl font-black text-foreground italic">x{(1 + level/10).toFixed(1)}</p>
                   <p className="text-[8px] font-black uppercase text-primary mt-2">Protocol Multiplier</p>
                 </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="shooppy" className="animate-in fade-in slide-in-from-bottom-4">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {shooppyProducts.length === 0 ? (
                  <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border-4 border-dashed border-foreground/5">
                     <Star className="h-16 w-16 mx-auto text-foreground/10 mb-6" />
                     <p className="text-xl font-black text-foreground/40 uppercase tracking-widest">No strategic assets deployed.</p>
                  </div>
                ) : shooppyProducts.map((p) => (
                  <Card key={p.id} className="rounded-[3rem] border-foreground/5 bg-white shadow-xl overflow-hidden group hover:border-primary transition-all">
                    <div className="h-72 relative overflow-hidden bg-secondary">
                       {p.imageUrl && <img src={p.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />}
                       <Badge className="absolute top-6 left-6 bg-white text-foreground font-black uppercase text-[10px] tracking-widest rounded-full h-8 px-4 shadow-lg border-2 border-primary/20">{p.type}</Badge>
                       {p.requiredLevel && level < p.requiredLevel && (
                         <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white backdrop-blur-md">
                            <Award className="h-12 w-12 text-primary mb-3" />
                            <p className="font-black text-xs uppercase tracking-widest">Level {p.requiredLevel} Required</p>
                         </div>
                       )}
                    </div>
                    <div className="p-10 space-y-6">
                       <h4 className="text-3xl font-black text-foreground uppercase tracking-tight">{p.title}</h4>
                       <p className="text-sm font-medium text-foreground/60 leading-relaxed line-clamp-3">{p.description}</p>
                       <Button disabled={p.requiredLevel ? level < p.requiredLevel : false} className="w-full h-14 rounded-2xl bg-foreground text-white font-black uppercase text-xs shadow-xl active:scale-95 transition-all">Acquire Strategic Asset</Button>
                    </div>
                  </Card>
                ))}
             </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
             <Card className="rounded-[3rem] border-foreground/5 bg-white p-10 space-y-10 shadow-xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                   <div className="space-y-8">
                      <h3 className="text-5xl font-black text-foreground uppercase tracking-tighter italic">Library Labs</h3>
                      <p className="text-lg font-medium text-foreground/60">Contribute strategic prompts or tips to the collective sovereign library.</p>
                      <div className="space-y-4">
                         <Input placeholder="Resource Title" value={resTitle} onChange={e => setResTitle(e.target.value)} className="h-14 font-black" />
                         <select className="w-full h-14 bg-secondary/20 border-none rounded-2xl px-6 font-black uppercase text-foreground/60" value={resType} onChange={e => setResType(e.target.value as any)}>
                            <option value="AI_Prompt">AI Prompt Lab</option>
                            <option value="T&Triks">T&Triks Archive</option>
                         </select>
                         <Textarea placeholder="Content (URL or Text)" value={resContent} onChange={e => setResContent(e.target.value)} className="min-h-[120px] bg-secondary/20 border-none rounded-[2rem] p-6" />
                         <Button onClick={handleAddResource} className="w-full h-16 rounded-full bg-primary text-foreground font-black uppercase text-sm shadow-xl">Share Knowledge</Button>
                      </div>
                   </div>
                   
                   <div className="space-y-6">
                      <Tabs defaultValue="ai" className="w-full">
                         <TabsList className="bg-secondary/40 p-1 rounded-full w-full mb-8">
                            <TabsTrigger value="ai" className="rounded-full flex-1 text-[10px] font-black uppercase">AI Prompts</TabsTrigger>
                            <TabsTrigger value="triks" className="rounded-full flex-1 text-[10px] font-black uppercase">T&Triks</TabsTrigger>
                            <TabsTrigger value="webin" className="rounded-full flex-1 text-[10px] font-black uppercase">WeBin</TabsTrigger>
                         </TabsList>
                         
                         <TabsContent value="ai" className="space-y-4">
                            {resources.filter(r => r.type === 'AI_Prompt').map(r => (
                              <div key={r.id} className="p-6 bg-secondary/20 rounded-3xl border border-foreground/5">
                                 <h4 className="font-black text-foreground uppercase text-sm">{r.title}</h4>
                                 <p className="text-[10px] text-foreground/40 font-black uppercase mb-3">By @{r.nickname}</p>
                                 <Button variant="outline" className="h-8 rounded-full text-[8px] uppercase font-black px-4">Copy Prompt</Button>
                              </div>
                            ))}
                         </TabsContent>
                         
                         <TabsContent value="triks" className="space-y-4">
                            {resources.filter(r => r.type === 'T&Triks').map(r => (
                              <div key={r.id} className="p-6 bg-secondary/20 rounded-3xl border border-foreground/5">
                                 <h4 className="font-black text-foreground uppercase text-sm">{r.title}</h4>
                                 <p className="text-[10px] text-foreground/40 font-black uppercase mb-3">By @{r.nickname}</p>
                                 <p className="text-xs font-medium text-foreground/70">{r.description}</p>
                              </div>
                            ))}
                         </TabsContent>

                         <TabsContent value="webin" className="space-y-4">
                            {resources.filter(r => r.type === 'WeBin').map(r => (
                              <div key={r.id} className="p-6 bg-primary/10 rounded-3xl border border-primary/20 flex justify-between items-center">
                                 <div>
                                   <h4 className="font-black text-foreground uppercase text-sm">{r.title}</h4>
                                   <p className="text-xs text-foreground/60">{r.description}</p>
                                 </div>
                                 <Button className="rounded-full h-10 px-6 font-black uppercase text-[10px]" asChild><a href={r.content} target="_blank">Watch Now</a></Button>
                              </div>
                            ))}
                         </TabsContent>
                      </Tabs>
                   </div>
                </div>
             </Card>
          </TabsContent>

          <TabsContent value="faq" className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4">
             <Card className="rounded-[4rem] border-foreground/5 bg-white p-12 space-y-12 shadow-2xl">
                <div className="text-center space-y-2">
                   <h3 className="text-5xl font-black text-foreground uppercase tracking-tighter italic">Strategic FAQ</h3>
                   <p className="text-[10px] font-black uppercase text-primary tracking-widest">Execution Protocol Inquiries</p>
                </div>
                <Accordion type="single" collapsible className="w-full space-y-4">
                  {faqs.map((f) => (
                    <AccordionItem key={f.id} value={f.id} className="border-none bg-secondary/30 rounded-[2.5rem] px-10 overflow-hidden transition-all data-[state=open]:shadow-lg">
                      <AccordionTrigger className="text-sm font-black text-foreground uppercase tracking-widest hover:no-underline py-8">
                        {f.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-foreground/70 leading-relaxed font-medium pb-10 pt-2 border-t border-foreground/5">
                        {f.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
             </Card>
          </TabsContent>

          <TabsContent value="metext" className="animate-in fade-in slide-in-from-bottom-4">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[700px]">
                <Card className="rounded-[3rem] border-foreground/5 bg-white overflow-hidden flex flex-col shadow-xl">
                   <div className="p-8 border-b border-foreground/5 space-y-4">
                      <h3 className="text-2xl font-black uppercase tracking-tighter text-foreground">Strategists</h3>
                      <div className="relative">
                         <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30" />
                         <Input placeholder="Find Succemazing..." className="pl-12 h-12 rounded-2xl bg-secondary/40 border-none" />
                      </div>
                   </div>
                   <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                      <div className="p-6 bg-primary/5 rounded-3xl border border-primary/20 flex items-center justify-between group cursor-pointer">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-black">HD</div>
                            <div>
                               <p className="font-black text-xs uppercase">The Host</p>
                               <p className="text-[8px] text-primary uppercase font-black">Online</p>
                            </div>
                         </div>
                         <Button variant="ghost" size="icon" className="text-primary"><Mail className="h-4 w-4" /></Button>
                      </div>
                   </div>
                </Card>

                <Card className="lg:col-span-2 rounded-[3rem] border-foreground/5 bg-white overflow-hidden flex flex-col shadow-xl relative">
                   <div className="p-8 border-b border-foreground/5 flex items-center justify-between bg-white sticky top-0 z-10">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center font-black text-foreground">HD</div>
                         <div>
                            <p className="font-black text-sm uppercase text-foreground">The Host</p>
                            <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Sovereign Communication Hub</p>
                         </div>
                      </div>
                   </div>
                   <div className="flex-1 overflow-y-auto p-10 space-y-8 bg-secondary/10 scrollbar-hide">
                      <div className="flex gap-4">
                         <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center font-black text-[10px]">HD</div>
                         <div className="max-w-[70%] p-6 bg-white rounded-r-[2rem] rounded-bl-[2rem] shadow-md border border-foreground/5">
                            <p className="text-sm font-medium text-foreground/80 leading-relaxed">Welcome to MeText, Strategist. Every great empire is built on clear communication. Use this space to align your vision.</p>
                         </div>
                      </div>
                   </div>
                   <div className="p-8 bg-white border-t border-foreground/5 flex gap-4">
                      <Input placeholder="Synchronize message..." className="flex-1 h-16 rounded-3xl bg-secondary/40 border-none px-8" />
                      <Button className="h-16 w-16 rounded-3xl bg-primary text-foreground shadow-xl active:scale-90 transition-all"><Send className="h-6 w-6" /></Button>
                   </div>
                </Card>
             </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Daily Modal */}
      <Dialog open={showDaily} onOpenChange={setShowDaily}>
        <DialogContent className="rounded-[4rem] border-8 border-primary/20 bg-white/95 backdrop-blur-xl p-16 max-w-sm text-center shadow-2xl">
          <div className="space-y-10">
            <div className="w-32 h-32 bg-primary text-foreground rounded-[3rem] flex items-center justify-center mx-auto shadow-[0_20px_40px_rgba(255,215,0,0.4)] animate-bounce">
              <Award className="h-16 w-16" />
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-foreground uppercase tracking-tighter italic">Daily Protocol</h2>
              <p className="text-[10px] text-primary font-black uppercase tracking-[0.4em]">Sovereign Sync Initialized</p>
            </div>
            <div className="p-8 bg-secondary/50 rounded-[2.5rem] border border-foreground/5 flex justify-around">
               <div><p className="text-3xl font-black text-foreground">100</p><p className="text-[8px] font-black uppercase text-foreground/40">Points</p></div>
               <div className="w-px h-10 bg-foreground/10" />
               <div><p className="text-3xl font-black text-foreground">50</p><p className="text-[8px] font-black uppercase text-foreground/40">XP</p></div>
            </div>
            <Button onClick={handleClaimDaily} className="w-full h-20 rounded-full bg-foreground text-white font-black text-2xl shadow-2xl hover:scale-105 transition-all">CLAIM REWARD</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rewards Modal */}
      <Dialog open={showRewardModal} onOpenChange={setShowRewardModal}>
        <DialogContent className="rounded-[4rem] border-8 border-primary/20 bg-white/95 backdrop-blur-xl p-16 max-w-md shadow-2xl">
          <DialogHeader><DialogTitle className="text-4xl font-black text-foreground uppercase tracking-tighter text-center italic">Mastery Rewards</DialogTitle></DialogHeader>
          <div className="space-y-6 mt-10">
            {[
              { lv: 5, reward: "Bronze Strategy Bundle" },
              { lv: 10, reward: "Access 'Elite' Ebook Archive" },
              { lv: 25, reward: "Host Priority Chat Access" },
              { lv: 50, reward: "VIP Sovereignty Status" },
            ].map((r) => (
              <div key={r.lv} className={cn("p-8 rounded-[2.5rem] border-2 flex items-center justify-between", level >= r.lv ? "bg-primary/10 border-primary" : "bg-foreground/5 border-foreground/10 opacity-40")}>
                <div><p className="text-[10px] font-black text-primary uppercase mb-1">Level {r.lv}</p><p className="text-lg font-black text-foreground uppercase">{r.reward}</p></div>
                <ShieldCheck className={cn("h-8 w-8", level >= r.lv ? "text-primary" : "text-foreground/20")} />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
