
'use client';

import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Trophy, Star, ShieldCheck, ShoppingBag, MessageCircle, Newspaper,
  Flame, Zap, Award, Search, Send, Plus, Download, ExternalLink,
  ChevronRight, Lightbulb, BookOpen, Video, Trash2, Heart
} from 'lucide-react';
import { useUser } from '@/firebase';
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { useAdminStore, useUserStore } from '@/lib/store';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useUser();
  const { points, xp, level, streak, checkDailyLogin, claimDaily, addXP, addPoints } = useUserStore();
  const { shooppyProducts, newsPosts, faqs, resources, activityWall, addResource } = useAdminStore();
  
  const [showDaily, setShowDaily] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  
  // Activity Wall State
  const [postText, setPostText] = useState("");
  const [postImages, setPostImages] = useState<string[]>([]);

  useEffect(() => {
    if (checkDailyLogin()) {
      setShowDaily(true);
    }
  }, []);

  const handleClaimDaily = () => {
    claimDaily();
    setShowDaily(false);
    toast({ title: "Daily Reward Claimed!", description: "+100 Points, +50 XP, Streak Updated!" });
  };

  const handleUploadWin = () => {
    if (!postText) return;
    // Mock addition
    toast({ title: "Sovereign Win Uploaded!" });
    setPostText("");
    setPostImages([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      {/* Top Stats Bar */}
      <div className="bg-secondary/20 border-b border-primary/10 backdrop-blur-md sticky top-16 z-40">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary animate-pulse" />
              <span className="font-black text-xs uppercase tracking-widest text-white">Points: {points}</span>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="font-black text-xs uppercase tracking-widest text-white">Streak: {streak}</span>
            </div>
          </div>
          
          <button 
            onClick={() => setShowRewardModal(true)}
            className="flex items-center gap-3 group transition-transform hover:scale-105"
          >
            <span className="font-black text-[10px] uppercase tracking-[0.2em] text-primary/60">Lv. {level}</span>
            <div className="relative w-10 h-10 flex items-center justify-center">
              <svg className="w-full h-full rotate-[-90deg]">
                <circle cx="20" cy="20" r="18" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-white/5" />
                <circle cx="20" cy="20" r="18" fill="transparent" stroke="currentColor" strokeWidth="4" strokeDasharray="113" strokeDashoffset={113 - (113 * xp) / 100} className="text-primary" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white">{level}</div>
            </div>
          </button>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <Tabs defaultValue="hub" className="space-y-8">
          <TabsList className="bg-secondary/40 p-1.5 rounded-full w-fit shadow-xl border border-white/5 backdrop-blur-md overflow-x-auto">
            <TabsTrigger value="hub" className="rounded-full px-8 h-10 text-[10px] font-black uppercase tracking-widest">Hub</TabsTrigger>
            <TabsTrigger value="shooppy" className="rounded-full px-8 h-10 text-[10px] font-black uppercase tracking-widest">Shooppy</TabsTrigger>
            <TabsTrigger value="resources" className="rounded-full px-8 h-10 text-[10px] font-black uppercase tracking-widest">Resources</TabsTrigger>
            <TabsTrigger value="faq" className="rounded-full px-8 h-10 text-[10px] font-black uppercase tracking-widest">FAQ</TabsTrigger>
            <TabsTrigger value="metext" className="rounded-full px-8 h-10 text-[10px] font-black uppercase tracking-widest">MeText</TabsTrigger>
          </TabsList>

          <TabsContent value="hub" className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-5">
            <div className="lg:col-span-2 space-y-8">
              {/* Activity Wall Post Box */}
              <Card className="rounded-[2.5rem] border-white/5 bg-secondary/20 p-8 space-y-4">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center font-black text-background">ND</div>
                  <Textarea 
                    placeholder="Share your Sovereign Win..." 
                    value={postText}
                    onChange={(e) => setPostText(e.target.value)}
                    className="flex-1 bg-background/40 border-primary/20 rounded-2xl p-4 min-h-[100px]"
                  />
                </div>
                <div className="flex justify-between items-center pl-16">
                   <Button variant="ghost" className="text-primary hover:bg-primary/10 rounded-full">
                    <Plus className="h-5 w-5 mr-2" /> 1-6 Photos
                   </Button>
                   <Button onClick={handleUploadWin} className="bg-primary text-background rounded-full px-10 font-black uppercase text-xs">Dispatch Win</Button>
                </div>
              </Card>

              {/* Feed Integration */}
              {newsPosts.map((post) => (
                <Card key={post.id} className="rounded-[2.5rem] border-white/5 bg-secondary/20 overflow-hidden">
                  <CardHeader className="p-8 pb-4">
                    <div className="flex items-center gap-3">
                       <Newspaper className="h-6 w-6 text-primary" />
                       <CardTitle className="text-2xl font-black uppercase tracking-tight text-white">{post.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 space-y-4">
                    {post.imageUrl && <img src={post.imageUrl} className="w-full h-80 object-cover rounded-3xl" />}
                    <p className="text-sm font-medium text-foreground/70 leading-relaxed">{post.content}</p>
                    <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                       <Button variant="ghost" className="text-xs font-black text-primary/60"><Heart className="h-4 w-4 mr-2" /> Respect</Button>
                       <Button variant="ghost" className="text-xs font-black text-primary/60"><MessageCircle className="h-4 w-4 mr-2" /> Insight</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="space-y-8">
              <Card className="rounded-[2.5rem] border-2 border-primary/20 bg-primary/5 p-8 text-center space-y-6">
                <Trophy className="h-16 w-16 mx-auto text-primary" />
                <h3 className="text-2xl font-black uppercase tracking-tighter">Consistency Status</h3>
                <div className="p-4 bg-background/40 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Current Multiplier</p>
                  <p className="text-4xl font-black text-white">x{(1 + level/10).toFixed(1)}</p>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="shooppy" className="animate-in fade-in slide-in-from-bottom-5">
            <Card className="rounded-[3rem] border-white/5 shadow-2xl bg-secondary/10 overflow-hidden backdrop-blur-sm">
              <div className="bg-primary p-12 text-background flex flex-col md:flex-row justify-between items-center gap-10">
                <div className="space-y-3">
                  <h2 className="text-5xl font-headline font-black tracking-tighter uppercase italic">Shooppy Hub</h2>
                  <p className="text-base font-black opacity-80 max-w-md">Elite strategic assets level-gated for master earners.</p>
                </div>
                <Button size="lg" className="h-16 px-10 rounded-full bg-background text-primary font-black text-xl shadow-2xl" asChild>
                  <a href="https://nico-digital.myshopify.com" target="_blank">MAIN SHOP <ExternalLink className="ml-3 h-6 w-6" /></a>
                </Button>
              </div>
              <CardContent className="p-10 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {shooppyProducts.map((p) => (
                    <Card key={p.id} className="rounded-3xl border-white/5 bg-secondary/30 overflow-hidden flex flex-col group border-2 hover:border-primary transition-all">
                       <div className="h-56 bg-background relative overflow-hidden">
                          {p.imageUrl && <img src={p.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />}
                          <Badge className="absolute top-4 left-4 bg-background text-primary h-8 px-4 font-black rounded-full text-[10px] uppercase">{p.type}</Badge>
                          {p.requiredLevel && level < p.requiredLevel && (
                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white backdrop-blur-sm">
                              <Award className="h-10 w-10 mb-2 text-primary" />
                              <p className="font-black text-xs uppercase tracking-widest">Level {p.requiredLevel} Required</p>
                            </div>
                          )}
                       </div>
                       <div className="p-8 space-y-4 flex-1 flex flex-col">
                          <h4 className="text-2xl font-black text-white uppercase tracking-tight">{p.title}</h4>
                          <p className="text-xs text-foreground/60 leading-relaxed flex-1">{p.description}</p>
                          <Button disabled={p.requiredLevel ? level < p.requiredLevel : false} className="w-full h-12 rounded-xl bg-primary text-background font-black uppercase text-xs">Acquire Asset</Button>
                       </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="animate-in fade-in slide-in-from-bottom-5">
            <Card className="rounded-[3rem] border-white/5 bg-secondary/20 p-10">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-4xl font-black text-white uppercase tracking-tighter italic">Resource Library</h3>
                <div className="flex gap-2">
                   <Button variant="outline" className="rounded-full h-10 px-6 border-primary/20 text-primary uppercase text-[10px] font-black hover:bg-primary hover:text-background transition-all">AI Prompts</Button>
                   <Button variant="outline" className="rounded-full h-10 px-6 border-primary/20 text-primary uppercase text-[10px] font-black hover:bg-primary hover:text-background transition-all">Tips & Tricks</Button>
                   <Button variant="outline" className="rounded-full h-10 px-6 border-primary/20 text-primary uppercase text-[10px] font-black hover:bg-primary hover:text-background transition-all">WeBin Archive</Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {resources.map((r) => (
                  <Card key={r.id} className="p-8 bg-background/40 border-white/5 rounded-3xl space-y-4">
                    <div className="flex items-center gap-3">
                      {r.type === 'AI_Prompt' && <Lightbulb className="h-6 w-6 text-yellow-500" />}
                      {r.type === 'Tips_Tricks' && <Star className="h-6 w-6 text-primary" />}
                      {r.type === 'WeBin' && <Video className="h-6 w-6 text-red-500" />}
                      <h4 className="text-xl font-black text-white uppercase tracking-tight">{r.title}</h4>
                    </div>
                    <p className="text-xs text-foreground/60 leading-relaxed">{r.description}</p>
                    <Button variant="secondary" className="w-full h-12 rounded-xl font-black uppercase text-[10px]">Access Resource</Button>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="faq" className="animate-in fade-in slide-in-from-bottom-5 max-w-3xl mx-auto">
             <Card className="rounded-[3rem] border-white/5 bg-secondary/20 p-12 space-y-10">
                <div className="text-center space-y-2">
                  <h3 className="text-4xl font-black text-white uppercase tracking-tighter">Strategic FAQ</h3>
                  <p className="text-[10px] text-primary/60 font-black uppercase tracking-widest">Master common protocols</p>
                </div>
                <Accordion type="single" collapsible className="w-full space-y-4">
                  {faqs.map((f) => (
                    <AccordionItem key={f.id} value={f.id} className="border-b-0 bg-background/40 rounded-3xl px-8 overflow-hidden border border-white/5">
                      <AccordionTrigger className="text-sm font-black text-white uppercase tracking-wider hover:no-underline py-6">
                        {f.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-xs text-foreground/70 leading-relaxed font-medium pb-8 pt-2">
                        {f.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
             </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Daily Reward Modal */}
      <Dialog open={showDaily} onOpenChange={setShowDaily}>
        <DialogContent className="rounded-[3rem] border-4 border-primary/20 bg-background/95 backdrop-blur-xl p-12 max-w-sm text-center">
          <div className="space-y-8">
            <div className="w-24 h-24 bg-primary text-background rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl animate-bounce">
              <Award className="h-12 w-12" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Daily Sync</h2>
              <p className="text-xs text-primary font-black uppercase tracking-[0.3em]">Execution Streak Active</p>
            </div>
            <div className="p-6 bg-primary/10 rounded-3xl border border-primary/20">
               <p className="text-[10px] font-black text-primary/60 uppercase mb-4">You've Earned</p>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <p className="text-2xl font-black text-white">100</p>
                   <p className="text-[8px] font-black uppercase text-primary/40">Points</p>
                 </div>
                 <div>
                   <p className="text-2xl font-black text-white">50</p>
                   <p className="text-[8px] font-black uppercase text-primary/40">XP</p>
                 </div>
               </div>
            </div>
            <Button 
              onClick={handleClaimDaily} 
              className="w-full h-16 rounded-full bg-primary text-background font-black text-xl shadow-2xl hover:scale-105 transition-transform"
            >
              CLAIM REWARD
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Level Rewards Modal */}
      <Dialog open={showRewardModal} onOpenChange={setShowRewardModal}>
        <DialogContent className="rounded-[3rem] border-4 border-primary/20 bg-background/95 backdrop-blur-xl p-12 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black text-white uppercase tracking-tighter text-center italic">Mastery Path</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-8">
            {[
              { lv: 5, reward: "Unlock Bronze Templates" },
              { lv: 10, reward: "Access 'Elite Strategy' eBook" },
              { lv: 25, reward: "Sovereign Wall Customization" },
              { lv: 50, reward: "Main Shop VIP Discount" },
            ].map((r) => (
              <div key={r.lv} className={cn("p-6 rounded-3xl border flex items-center justify-between", level >= r.lv ? "bg-primary/10 border-primary" : "bg-white/5 border-white/10 opacity-50")}>
                <div>
                  <p className="text-[10px] font-black text-primary uppercase mb-1">Level {r.lv}</p>
                  <p className="text-sm font-black text-white uppercase">{r.reward}</p>
                </div>
                {level >= r.lv ? <ShieldCheck className="text-primary" /> : <ShieldCheck className="text-white/20" />}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
