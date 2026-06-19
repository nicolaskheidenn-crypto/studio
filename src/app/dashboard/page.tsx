"use client";

import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs as ShadcnTabs, TabsList as ShadcnList, TabsTrigger as ShadcnTrigger, TabsContent as ShadcnContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Trophy, Flame, Zap, Award, Plus, Newspaper, Star, Heart, MessageSquare, Send, LayoutDashboard, ShoppingBag, BookOpen, CircleHelp, Download, Coins, X, ExternalLink, RefreshCcw, User, Youtube, Video, Tag, Coffee, ShieldCheck, Shield, RefreshCw
} from 'lucide-react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { useState, useEffect, useRef, useMemo } from 'react';
import { toast } from '@/hooks/use-toast';
import { useUserStore, UserProfile } from '@/lib/store';
import { cn } from '@/lib/utils';
import { collection, addDoc, serverTimestamp, query, orderBy, doc, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

const DEFAULT_PROFILE: UserProfile = {
  nickname: 'Strategist',
  bio: '',
  avatarUrl: '',
  coverPhotoUrl: '',
  points: 0,
  xp: 0,
  level: 1,
  streak: 0,
  currentTaskDay: 1,
  lastLogin: null,
  createdAt: new Date().toISOString(),
  completedTaskIds: [],
  capsules: [],
  unlockedBadgeIds: [],
  purchasedProductIds: [],
  claimedRewardWeeks: [],
  stats: {
    quizzesPassed: 0,
    promptsShared: 0,
    triksShared: 0,
    visitedFeatures: [],
    totalDaysInApp: 0
  }
};

const RESOURCE_CATEGORIES = [
  "Marketing",
  "Sales",
  "Website",
  "Copywriting",
  "Strategy",
  "Social Media",
  "Automation",
  "General"
];

function getYoutubeId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default function DashboardPage() {
  const { user } = useUser();
  const uid = user?.uid;
  const db = useFirestore();

  const profiles = useUserStore(s => s.profiles);
  const profile = useMemo(() => {
    const raw = uid ? profiles[uid] || DEFAULT_PROFILE : DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...raw };
  }, [profiles, uid]);
  
  const { 
    points = 0, level = 1, streak = 0, nickname = 'Strategist', lastLogin = null, purchasedProductIds = [], avatarUrl = ''
  } = profile;

  const {
    claimDaily, addPoints, trackVisit, incrementPrompt, incrementTrick, buyProduct
  } = useUserStore();
  
  const activityQuery = useMemo(() => query(collection(db, 'activityWall'), orderBy('timestamp', 'desc')), [db]);
  const newsQuery = useMemo(() => query(collection(db, 'newsPosts'), orderBy('timestamp', 'desc')), [db]);
  const resourcesQuery = useMemo(() => query(collection(db, 'resources'), orderBy('timestamp', 'desc')), [db]);
  const productsQuery = useMemo(() => query(collection(db, 'shooppyProducts'), orderBy('sortOrder', 'asc')), [db]);
  const faqsQuery = useMemo(() => collection(db, 'faqs'), [db]);

  const { data: sharedActivity = [], loading: activityLoading } = useCollection(activityQuery);
  const { data: newsPosts = [] } = useCollection(newsQuery);
  const { data: sharedResources = [] } = useCollection(resourcesQuery);
  const { data: shooppyProducts = [] } = useCollection(productsQuery);
  const { data: faqs = [] } = useCollection(faqsQuery);
  
  const [showDaily, setShowDaily] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [activeTab, setActiveTab] = useState('hub');
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const [postText, setPostText] = useState("");
  const [postImages, setPostImages] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [isAcquiring, setIsAcquiring] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [isSharingResource, setIsSharingResource] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedPostForInsights, setSelectedPostForInsights] = useState<any>(null);
  const [insightInput, setInsightInput] = useState("");

  const currentLivePost = useMemo(() => {
    if (!selectedPostForInsights) return null;
    return sharedActivity.find((p: any) => p.id === selectedPostForInsights.id);
  }, [sharedActivity, selectedPostForInsights]);

  const [resTitle, setResTitle] = useState("");
  const [resType, setResType] = useState<'AI_Prompt' | 'T&Triks'>('AI_Prompt');
  const [resCategory, setResCategory] = useState("General");
  const [resContent, setResContent] = useState("");
  const [resourceFilter, setResourceFilter] = useState("All");

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated || !uid) return;
    trackVisit(uid, activeTab);
  }, [activeTab, isHydrated, uid, trackVisit]);

  useEffect(() => {
    if (!isHydrated || !uid) return;
    const checkDaily = () => {
      if (!lastLogin) return true;
      const lastDate = new Date(lastLogin).toDateString();
      const nowDate = new Date().toDateString();
      return lastDate !== nowDate;
    };
    if (checkDaily()) setShowDaily(true);
    else setShowDaily(false);
  }, [lastLogin, isHydrated, uid]);

  const handleClaimDaily = () => {
    if (!uid) return;
    claimDaily(uid);
    setShowDaily(false);
    toast({ title: "Daily Sync Complete", description: "Strategic rewards added with growth multiplier." });
  };

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      toast({ title: "Grid Synchronized", description: "Latest sovereign dispatches loaded." });
    }, 800);
  };

  const handleAcquireAsset = async (product: any) => {
    if (!uid || isAcquiring) return;
    if (points < product.price) {
      toast({ title: "Insufficient Points", description: "Deploy more routines to earn points.", variant: "destructive" });
      return;
    }
    if (level < (product.requiredLevel || 1)) {
      toast({ title: "Mastery Level Low", description: `Level ${product.requiredLevel} required for this protocol.`, variant: "destructive" });
      return;
    }

    setIsAcquiring(true);
    try {
      buyProduct(uid, product.id, product.price);
      toast({ title: "Sovereign Acquisition", description: "Protocol unlocked in your Root Archive." });
    } catch (e) {
      toast({ title: "Acquisition Breach", description: "Grid transaction failed. Retry.", variant: "destructive" });
    } finally {
      setIsAcquiring(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    const limitedFiles = files.slice(0, 6);
    limitedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostImages(prev => [...prev, reader.result as string].slice(0, 6));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDispatchWin = async () => {
    if (!postText.trim() || !uid || isPosting) return;
    setIsPosting(true);

    const data = {
      userId: uid,
      nickname: nickname,
      avatarUrl: avatarUrl,
      description: postText,
      images: postImages,
      isPrivate: false,
      timestamp: serverTimestamp(),
      hearts: 0,
      comments: []
    };
    
    const watchdog = setTimeout(() => {
      if (isPosting) {
        setIsPosting(false);
        toast({ title: "Dispatch Delay", description: "Network response slow. Check Win Archive shortly.", variant: "destructive" });
      }
    }, 10000);

    try {
      await addDoc(collection(db, 'activityWall'), data);
      addPoints(uid, 20);
      setPostText("");
      setPostImages([]);
      toast({ title: "Sovereign Win Dispatched", description: "Gains boosted by growth multiplier." });
    } catch (error: any) {
      const permissionError = new FirestorePermissionError({
        path: 'activityWall',
        operation: 'create',
        requestResourceData: data,
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
    } finally {
      clearTimeout(watchdog);
      setIsPosting(false);
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!insightInput?.trim() || !uid || isCommenting) return;
    setIsCommenting(true);
    
    const postRef = doc(db, 'activityWall', postId);
    const commentData = {
      id: Math.random().toString(36).substr(2, 9),
      userId: uid,
      nickname: nickname,
      avatarUrl: avatarUrl,
      text: insightInput,
      timestamp: new Date().toISOString()
    };

    try {
      await updateDoc(postRef, {
        comments: arrayUnion(commentData)
      });
      setInsightInput("");
      toast({ title: "Insight Recorded" });
    } catch (async) {
      const permissionError = new FirestorePermissionError({
        path: postRef.path,
        operation: 'update',
        requestResourceData: { comments: commentData },
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
    } finally {
      setIsCommenting(false);
    }
  };

  const handleHeartPost = (postId: string) => {
    const postRef = doc(db, 'activityWall', postId);
    updateDoc(postRef, { hearts: increment(1) })
      .catch(async () => {
        const permissionError = new FirestorePermissionError({
          path: postRef.path,
          operation: 'update',
          requestResourceData: { hearts: 'increment' },
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const handleAddResource = async () => {
    if (!resTitle || !resContent || !uid || isSharingResource) {
       if (!resTitle || !resContent) toast({ title: "Incomplete Protocol", description: "Title and content are required.", variant: "destructive" });
       return;
    }
    
    setIsSharingResource(true);
    const data = {
      title: resTitle,
      description: "",
      type: resType,
      category: resCategory,
      content: resContent,
      userId: uid,
      nickname: nickname,
      avatarUrl: avatarUrl,
      timestamp: serverTimestamp()
    };

    try {
      await addDoc(collection(db, 'resources'), data);
      if (resType === 'AI_Prompt') incrementPrompt(uid);
      else if (resType === 'T&Triks') incrementTrick(uid);
      setResTitle(""); setResContent(""); setResCategory("General");
      toast({ title: "Strategic Resource Shared", description: "Global knowledge synchronization complete." });
    } catch (async) {
      const permissionError = new FirestorePermissionError({
        path: 'resources',
        operation: 'create',
        requestResourceData: data,
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
    } finally {
      setIsSharingResource(false);
    }
  };

  const filteredResources = useMemo(() => {
    let base = sharedResources.filter(r => r.type === resType);
    if (resourceFilter !== "All") {
      base = base.filter(r => r.category === resourceFilter);
    }
    return base;
  }, [sharedResources, resType, resourceFilter]);

  const availableInHub = shooppyProducts.filter(p => p.placement === 'Hub' && !purchasedProductIds.includes(p.id));
  const ownedAssets = shooppyProducts.filter(p => purchasedProductIds.includes(p.id));
  const marketplaceAssets = shooppyProducts.filter(p => p.placement === 'Marketplace');
  const webinResources = sharedResources.filter(r => r.type === 'WeBin');

  if (!isHydrated) return null;

  const growthMultiplier = (1 + level / 10).toFixed(1);

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <Navigation />
      
      {/* ATMOSPHERIC BACKGROUND DESIGNS - GPU OPTIMIZED */}
      <div className="absolute top-[10%] right-[5%] opacity-[0.03] pointer-events-none rotate-12 scale-[1] animate-pulse duration-[8000ms] will-change-transform">
        <Coffee className="w-[200px] h-[200px] text-primary" />
      </div>
      <div className="absolute bottom-[20%] left-[-2%] opacity-[0.03] pointer-events-none -rotate-12 scale-[1] animate-pulse duration-[10000ms] will-change-transform">
        <Zap className="w-[220px] h-[220px] text-primary" />
      </div>
      <div className="absolute top-[40%] right-[-5%] opacity-[0.02] pointer-events-none scale-[1] will-change-transform">
        <ShieldCheck className="w-[250px] h-[250px] text-primary" />
      </div>
      <div className="absolute bottom-[5%] right-[15%] opacity-[0.02] pointer-events-none rotate-45 scale-[1.2] will-change-transform">
        <Award className="w-[180px] h-[180px] text-primary" />
      </div>
      <div className="absolute top-[-5%] left-[5%] opacity-[0.02] pointer-events-none rotate-[-45deg] scale-[1.1] will-change-transform">
        <Shield className="w-[180px] h-[180px] text-primary" />
      </div>

      <div className="bg-card/80 border-b-4 border-primary/20 backdrop-blur-md sticky top-16 z-40">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div className="flex flex-col">
              <div className="flex items-center justify-center gap-3 text-primary">
                <Zap className="h-7 w-7 fill-primary" />
                <span className="font-black text-3xl tracking-tighter text-foreground leading-none">{points}</span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary text-center">Points Vault</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center justify-center gap-3 text-orange-500">
                <Flame className="h-7 w-7 fill-orange-500" />
                <span className="font-black text-3xl tracking-tighter text-foreground leading-none">{streak}</span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary text-center">Current Streak</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
               <p className="font-black text-sm uppercase text-foreground">{nickname}</p>
               <p className="text-[10px] font-black uppercase text-primary">Master Strategist</p>
            </div>
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full rotate-[-90deg]">
                <circle cx="32" cy="32" r="28" fill="transparent" stroke="currentColor" strokeWidth="6" className="text-primary/10" />
                <circle cx="32" cy="32" r="28" fill="transparent" stroke="currentColor" strokeWidth="6" strokeDasharray="176" strokeDashoffset={176 - (176 * profile.xp) / 100} className="text-primary" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-sm font-black text-foreground">Lv.{level}</div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl relative z-10">
        <ShadcnTabs value={activeTab} onValueChange={setActiveTab} className="space-y-10">
          <div className="flex items-center justify-between">
            <ShadcnList className="bg-card p-2 rounded-full w-fit shadow-2xl border-4 border-primary/10 overflow-x-auto scrollbar-hide">
              <ShadcnTrigger value="hub" className="rounded-full px-10 h-12 text-[11px] font-black uppercase tracking-widest gap-2"><LayoutDashboard className="h-4 w-4" /> HUB</ShadcnTrigger>
              <ShadcnTrigger value="shooppy" className="rounded-full px-10 h-12 text-[11px] font-black uppercase tracking-widest gap-2"><ShoppingBag className="h-4 w-4" /> SHOOPPY</ShadcnTrigger>
              <ShadcnTrigger value="wedio" className="rounded-full px-10 h-12 text-[11px] font-black uppercase tracking-widest gap-2"><Video className="h-4 w-4" /> WEDIO</ShadcnTrigger>
              <ShadcnTrigger value="resources" className="rounded-full px-10 h-12 text-[11px] font-black uppercase tracking-widest gap-2"><BookOpen className="h-4 w-4" /> LIBRARY</ShadcnTrigger>
              <ShadcnTrigger value="faq" className="rounded-full px-10 h-12 text-[11px] font-black uppercase tracking-widest gap-2"><CircleHelp className="h-4 w-4" /> FAQ</ShadcnTrigger>
            </ShadcnList>

            <Button 
              variant="ghost" 
              className="rounded-full h-12 px-6 font-black uppercase text-[10px] tracking-widest gap-3 text-primary border-4 border-primary/20 hover:bg-primary/5 active:scale-90"
              onClick={handleManualSync}
              disabled={isSyncing}
            >
              <RefreshCcw className={cn("h-4 w-4", isSyncing && "animate-spin")} />
              SYNC GRID
            </Button>
          </div>

          <ShadcnContent value="hub" className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-10">
              <Card className="rounded-[4rem] border-[8px] border-primary/5 shadow-2xl p-12 bg-card/40 space-y-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                  <Zap className="h-32 w-32 text-primary" />
                </div>
                <div className="flex gap-8 items-start">
                  <div className="w-24 h-24 rounded-[2rem] bg-primary flex items-center justify-center font-black text-background text-3xl shadow-[0_20px_40px_rgba(255,215,0,0.3)] shrink-0 overflow-hidden border-4 border-primary/20">
                    {avatarUrl ? (
                      <img src={avatarUrl} className="w-full h-full object-cover" alt="Avatar" />
                    ) : (
                      nickname.slice(0,2).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 space-y-6">
                    <Textarea 
                      placeholder="Document your Sovereign Win..." 
                      value={postText}
                      onChange={(e) => setPostText(e.target.value)}
                      className="w-full bg-background/50 border-4 border-primary/10 rounded-[3rem] p-10 text-xl font-bold min-h-[200px] text-foreground placeholder:text-foreground/20 focus:border-primary transition-all shadow-inner leading-relaxed"
                      disabled={isPosting}
                    />
                  </div>
                </div>

                {postImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-6 pl-32">
                    {postImages.map((img, i) => (
                      <div key={i} className="relative aspect-square rounded-[2rem] overflow-hidden group border-4 border-primary/20 shadow-xl">
                        <img src={img} className="w-full h-full object-cover" />
                        <button disabled={isPosting} onClick={() => setPostImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-4 right-4 bg-black/80 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-5 w-5" /></button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center pl-32 mt-4">
                   <Button 
                    variant="ghost" 
                    className="text-primary hover:text-primary/70 rounded-full font-black text-[12px] uppercase tracking-[0.2em] gap-4" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isPosting}
                   >
                    <Plus className="h-8 w-8" /> GALLERY (1-6)
                   </Button>
                   <input type="file" min={1} max={6} ref={fileInputRef} hidden multiple accept="image/*" onChange={handleFileChange} />
                   <Button 
                    onClick={handleDispatchWin} 
                    disabled={isPosting || !postText.trim()}
                    className="bg-primary text-background rounded-full px-20 h-20 font-black uppercase text-lg shadow-[0_30px_60px_rgba(255,215,0,0.3)] hover:scale-105 active:scale-95 transition-all disabled:opacity-20 tracking-tighter"
                   >
                    {isPosting ? <Loader2 className="h-6 w-6 animate-spin mr-3" /> : null}
                    {isPosting ? 'Dispatching...' : 'Dispatch Win'}
                   </Button>
                </div>
              </Card>

              <div className="space-y-12">
                {isSyncing || activityLoading ? (
                  <div className="p-20 text-center space-y-6 animate-pulse">
                    <RefreshCw className="h-16 w-16 text-primary mx-auto animate-spin" />
                    <p className="text-xl font-black text-primary/40 uppercase tracking-[0.4em]">Synchronizing Sovereignty...</p>
                  </div>
                ) : null}

                {newsPosts.map((news: any) => (
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
                       <p className="text-xl font-bold text-foreground leading-relaxed whitespace-pre-wrap">{news.content}</p>
                    </CardContent>
                  </Card>
                ))}

                {sharedActivity.map((post: any) => (
                  <Card key={post.id} className="rounded-[4.5rem] border-[10px] border-primary/5 bg-card shadow-2xl overflow-hidden group hover:border-primary/10 transition-all duration-700">
                    <CardHeader className="p-12 pb-6">
                       <div className="flex items-center gap-8">
                         <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary text-xl border-4 border-primary/10 shadow-inner overflow-hidden">
                            {post.avatarUrl ? (
                              <img src={post.avatarUrl} className="w-full h-full object-cover" alt="Avatar" />
                            ) : (
                              post.nickname?.slice(0,2).toUpperCase()
                            )}
                         </div>
                         <div className="flex-1">
                            <p className="font-black text-2xl uppercase text-foreground italic">{post.nickname}</p>
                            <p className="text-[10px] font-black uppercase text-primary/40 tracking-[0.2em] mt-1">
                              {post.timestamp?.toDate ? post.timestamp.toDate().toLocaleString() : 'Live Sync active'}
                            </p>
                         </div>
                       </div>
                    </CardHeader>
                    <CardContent className="p-12 pt-0 space-y-10">
                       <p className="text-3xl font-black text-foreground leading-tight tracking-tight uppercase italic whitespace-pre-wrap">{post.description}</p>
                       
                       {post.images?.length > 0 && (
                         <div className={cn("grid gap-6", post.images.length === 1 ? "grid-cols-1" : post.images.length === 2 ? "grid-cols-2" : "grid-cols-3")}>
                           {post.images.map((img: string, i: number) => (
                             <img 
                               key={i} 
                               src={img} 
                               className="w-full h-[450px] object-cover rounded-[3.5rem] shadow-2xl border-4 border-primary/20 hover:scale-[1.02] transition-transform duration-700" 
                               alt="Activity" 
                             />
                           ))}
                         </div>
                       )}
                       
                       <div className="flex items-center gap-10 pt-10 border-t-4 border-primary/5">
                          <Button 
                            variant="ghost" 
                            className="text-[11px] font-black uppercase tracking-[0.3em] text-primary hover:text-primary transition-all p-0 h-10"
                            onClick={() => handleHeartPost(post.id)}
                          >
                            <Heart className="h-5 w-5 mr-3 fill-primary" /> 
                            {post.hearts || 0} SUCCEMAZING
                          </Button>
                          <Button 
                            variant="ghost" 
                            className="text-[11px] font-black uppercase tracking-[0.3em] text-primary/30 hover:text-primary transition-all p-0 h-10"
                            onClick={() => setSelectedPostForInsights(post)}
                          >
                            <MessageSquare className="h-5 w-5 mr-3" /> 
                            {post.comments?.length || 0} INSIGHTS
                          </Button>
                       </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-10">
              <Card className="rounded-[3.5rem] border-4 border-primary/20 bg-card/40 p-12 text-center space-y-10 shadow-2xl relative overflow-hidden">
                 <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
                    <Trophy className="w-64 h-64 absolute -top-10 -right-10 text-primary rotate-12" />
                 </div>
                 <div className="w-28 h-28 bg-primary text-background rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl relative z-10">
                   <Trophy className="h-14 w-14" />
                 </div>
                 <div className="space-y-3 relative z-10">
                   <h3 className="text-4xl font-black uppercase tracking-tighter text-foreground italic">Sovereign Proof</h3>
                   <p className="text-[10px] font-black uppercase text-primary/40 tracking-[0.4em]">Protocol Consistency Level</p>
                 </div>
                 <div className="p-10 bg-primary/5 rounded-[3rem] border-2 border-primary/10 relative z-10">
                   <p className="text-5xl font-black text-primary italic tracking-tighter">x{growthMultiplier}</p>
                   <p className="text-[10px] font-black uppercase text-primary mt-4 tracking-widest">Growth Multiplier</p>
                 </div>
              </Card>

              <Card className="rounded-[3.5rem] border-4 border-primary/20 bg-card/40 p-10 shadow-2xl space-y-8 relative overflow-hidden">
                 <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
                    <Zap className="w-64 h-64 absolute -bottom-10 -left-10 text-primary -rotate-45" />
                 </div>
                 <h3 className="text-2xl font-black uppercase text-foreground italic flex items-center gap-4 relative z-10"><Zap className="h-6 w-6 text-primary" /> Acquire Protocols</h3>
                 <div className="space-y-6 relative z-10">
                    {availableInHub.length === 0 ? (
                      <p className="text-[10px] font-black uppercase text-foreground/30 text-center tracking-widest">No protocols currently deployable.</p>
                    ) : (
                      availableInHub.map((p: any) => (
                        <div key={p.id} className="p-6 bg-background/50 rounded-3xl border-2 border-primary/10 flex items-center justify-between group">
                          <div>
                            <p className="font-black text-sm text-foreground uppercase italic">{p.title}</p>
                            <div className="flex items-center gap-3">
                              <p className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1"><Coins className="h-3 w-3" /> {p.price}</p>
                              {p.requiredLevel > 1 && <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest">LV {p.requiredLevel}</p>}
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-full hover:bg-primary/10 text-primary"
                            onClick={() => handleAcquireAsset(p)}
                            disabled={isAcquiring}
                          >
                            {isAcquiring ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-5 w-5" />}
                          </Button>
                        </div>
                      ))
                    )}
                 </div>
              </Card>

              <Card className="rounded-[3.5rem] border-4 border-primary/20 bg-card/40 p-10 shadow-2xl space-y-8 relative overflow-hidden">
                 <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
                    <Star className="w-64 h-64 absolute top-1/2 -right-20 text-primary" />
                 </div>
                 <h3 className="text-2xl font-black uppercase text-foreground italic flex items-center gap-4 relative z-10"><Star className="h-6 w-6 text-primary" /> Root Archive</h3>
                 <div className="space-y-6 relative z-10">
                    {ownedAssets.length === 0 ? (
                      <p className="text-[10px] font-black uppercase text-foreground/30 text-center tracking-widest">Archive empty. Acquire protocols to expand.</p>
                    ) : (
                      ownedAssets.map((p: any) => (
                        <div key={p.id} className="p-6 bg-background/50 rounded-3xl border-2 border-primary/10 flex items-center justify-between group">
                          <div>
                            <p className="font-black text-sm text-foreground uppercase italic">{p.title}</p>
                            <p className="text-[9px] font-bold text-primary uppercase tracking-widest">{p.type}</p>
                          </div>
                          <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 text-primary" asChild>
                            <a href={p.fileUrl} target="_blank" download={`${p.title.replace(/\s+/g, '_')}_Protocol`}><Download className="h-5 w-5" /></a>
                          </Button>
                        </div>
                      ))
                    )}
                 </div>
              </Card>
            </div>
          </ShadcnContent>
          
          <ShadcnContent value="shooppy" className="space-y-16">
             <div className="text-center space-y-3">
                <h3 className="text-6xl font-black text-foreground uppercase tracking-tighter italic">Shooppy Marketplace</h3>
                <p className="text-[11px] font-black uppercase text-primary tracking-[0.6em]">Official External Digital Storefront</p>
             </div>
             
             {marketplaceAssets.length === 0 ? (
               <div className="py-20 text-center bg-card/40 rounded-[4rem] border-4 border-dashed border-primary/20 relative overflow-hidden">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] scale-[1.5] pointer-events-none">
                    <ShoppingBag className="w-80 h-80 text-primary" />
                 </div>
                 <ShoppingBag className="h-20 w-20 mx-auto text-primary/20 mb-6" />
                 <p className="text-2xl font-black text-foreground/40 uppercase tracking-tighter italic">No storefront assets deployed yet.</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {marketplaceAssets.map((p: any) => {
                    return (
                      <Card key={p.id} className="rounded-[4rem] border-4 border-primary/10 bg-card shadow-2xl overflow-hidden group hover:border-primary transition-all">
                        <div className="h-80 relative overflow-hidden bg-background/50">
                           {p.imageUrl && <img src={p.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={p.title} />}
                           <Badge className="absolute top-8 left-8 bg-primary text-background font-black uppercase text-[11px] tracking-widest rounded-full h-10 px-6 shadow-xl border-4 border-primary/20">{p.type}</Badge>
                        </div>
                        <div className="p-12 space-y-8">
                           <h4 className="text-4xl font-black text-foreground uppercase tracking-tight italic">{p.title}</h4>
                           <p className="text-base font-bold text-foreground/70 leading-relaxed line-clamp-3">{p.description}</p>
                           <Button onClick={() => window.open(p.fileUrl, '_blank')} className="w-full h-18 rounded-[2rem] bg-primary text-background font-black uppercase text-sm shadow-2xl hover:bg-white hover:text-primary transition-all gap-4">
                              <ExternalLink className="h-5 w-5" /> Visit Official Shop
                           </Button>
                        </div>
                      </Card>
                    );
                  })}
               </div>
             )}
          </ShadcnContent>

          <ShadcnContent value="wedio" className="space-y-16">
             <div className="text-center space-y-3">
                <h3 className="text-6xl font-black text-foreground uppercase tracking-tighter italic">Wedio Portals</h3>
                <p className="text-[11px] font-black uppercase text-primary tracking-[0.6em]">Authorized Training & Strategy Masterclasses</p>
             </div>
             
             {webinResources.length === 0 ? (
               <div className="py-20 text-center bg-card/40 rounded-[4rem] border-4 border-dashed border-primary/20 relative overflow-hidden">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] scale-[1.5] pointer-events-none">
                    <Video className="w-80 h-80 text-primary" />
                 </div>
                 <Video className="h-20 w-20 mx-auto text-primary/20 mb-6" />
                 <p className="text-2xl font-black text-foreground/40 uppercase tracking-tighter italic">No masterclass portals active.</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {webinResources.map((w: any) => {
                    const videoId = getYoutubeId(w.content);
                    const thumbUrl = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
                    return (
                      <Card key={w.id} className="rounded-[4rem] border-4 border-primary/10 bg-card shadow-2xl overflow-hidden group hover:border-primary transition-all">
                        <a href={w.content} target="_blank" rel="noopener noreferrer" className="block relative group">
                          <div className="h-64 relative overflow-hidden bg-black flex items-center justify-center">
                             {thumbUrl ? (
                               <img src={thumbUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-60 group-hover:opacity-100" alt={w.title} />
                             ) : (
                               <Video className="h-16 w-16 text-primary/20" />
                             )}
                             <div className="absolute inset-0 flex items-center justify-center">
                               <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(220,38,38,0.6)] group-hover:scale-125 transition-transform duration-500 border-4 border-white/20">
                                  <Youtube className="h-10 w-10 fill-white text-white" />
                               </div>
                             </div>
                          </div>
                        </a>
                        <div className="p-10 space-y-6">
                           <h4 className="text-3xl font-black text-foreground uppercase tracking-tight italic leading-tight line-clamp-2">{w.title}</h4>
                           <div className="flex items-center gap-3">
                              <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase px-4 py-1 rounded-full">@{w.nickname}</Badge>
                              <span className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">Portal ID: {w.id.slice(0,6)}</span>
                           </div>
                        </div>
                      </Card>
                    );
                  })}
               </div>
             )}
          </ShadcnContent>

          <ShadcnContent value="resources" className="space-y-12">
             <div className="flex items-center justify-between">
                <div className="space-y-2">
                   <h3 className="text-7xl font-headline font-black text-foreground uppercase italic tracking-tighter">LIBRARY LABS</h3>
                   <p className="text-lg font-bold text-foreground/60">Inject strategic knowledge into the collective sovereign vault.</p>
                </div>
                
                <ShadcnTabs defaultValue="AI_Prompt" className="w-fit" onValueChange={(v) => setResType(v as any)}>
                   <ShadcnList className="bg-card p-1.5 rounded-full border-4 border-primary/10 flex gap-2">
                      <ShadcnTrigger value="AI_Prompt" className="rounded-full px-8 h-10 text-[10px] font-black uppercase tracking-widest">AI PROMPTS</ShadcnTrigger>
                      <ShadcnTrigger value="T&Triks" className="rounded-full px-8 h-10 text-[10px] font-black uppercase tracking-widest">T&TRIKS</ShadcnTrigger>
                   </ShadcnList>
                </ShadcnTabs>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                <Card className="rounded-[3rem] border-8 border-primary/10 bg-card p-8 shadow-2xl space-y-6 relative overflow-hidden">
                   <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
                      <BookOpen className="w-64 h-64 absolute -top-10 -right-10 text-primary" />
                   </div>
                   <div className="space-y-6 relative z-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label className="text-primary font-black uppercase tracking-widest text-[9px]">RESOURCE TITLE</Label>
                            <Input 
                               placeholder="Resource Title" 
                               value={resTitle} 
                               onChange={e => setResTitle(e.target.value)} 
                               className="h-14 rounded-2xl bg-background/50 border-4 border-primary/10 text-lg font-black px-6 focus:border-primary shadow-inner" 
                               disabled={isSharingResource}
                            />
                         </div>
                         <div className="space-y-2">
                            <Label className="text-primary font-black uppercase tracking-widest text-[9px]">CATEGORY (SEO)</Label>
                            <select 
                               className="w-full h-14 bg-background/50 border-4 border-primary/10 rounded-2xl px-6 font-black uppercase text-foreground text-xs focus:border-primary" 
                               value={resCategory} 
                               onChange={e => setResCategory(e.target.value)}
                               disabled={isSharingResource}
                            >
                               {RESOURCE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
                            </select>
                         </div>
                      </div>
                      
                      <div className="space-y-2">
                         <Label className="text-primary font-black uppercase tracking-widest text-[9px]">LABORATORY</Label>
                         <select 
                            className="w-full h-14 bg-background/50 border-4 border-primary/10 rounded-2xl px-6 font-black uppercase text-foreground text-xs focus:border-primary" 
                            value={resType} 
                            onChange={e => setResType(e.target.value as any)}
                            disabled={isSharingResource}
                         >
                            <option value="AI_Prompt">AI PROMPT LAB</option>
                            <option value="T&Triks">T&TRIKS ARCHIVE</option>
                         </select>
                      </div>

                      <div className="space-y-2">
                         <Label className="text-primary font-black uppercase tracking-widest text-[9px]">STRATEGIC CONTENT</Label>
                         <Textarea 
                            placeholder='Share your prompts or execution tips...' 
                            value={resContent} 
                            onChange={e => setResContent(e.target.value)} 
                            className="min-h-[180px] bg-background/50 border-4 border-primary/10 rounded-[2rem] p-8 text-base font-bold shadow-inner leading-relaxed" 
                            disabled={isSharingResource}
                         />
                      </div>

                      <Button 
                        onClick={handleAddResource} 
                        className="w-full h-18 rounded-full bg-primary text-background font-black uppercase text-xl shadow-[0_20px_40px_rgba(255,215,0,0.3)] hover:scale-105 active:scale-95 transition-all tracking-tighter"
                        disabled={isSharingResource}
                      >
                        {isSharingResource ? <Loader2 className="h-6 w-6 animate-spin mr-3" /> : null}
                        {isSharingResource ? 'Sharing...' : 'SHARE KNOWLEDGE'}
                      </Button>
                   </div>
                </Card>

                <div className="space-y-8">
                   <div className="flex flex-col gap-6 px-4">
                      <div className="flex items-center gap-4">
                         <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                         <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40">Collective Vault: {resType.replace('_', ' ')}</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                         <Button 
                           variant="ghost" 
                           onClick={() => setResourceFilter("All")}
                           className={cn(
                             "h-10 px-6 rounded-full font-black uppercase text-[10px] tracking-widest border-2 transition-all",
                             resourceFilter === "All" ? "bg-primary text-background border-primary" : "border-primary/10 text-primary/40 hover:border-primary/40"
                           )}
                         >
                           ALL PROTOCOLS
                         </Button>
                         {RESOURCE_CATEGORIES.map(cat => (
                           <Button 
                             key={cat}
                             variant="ghost" 
                             onClick={() => setResourceFilter(cat)}
                             className={cn(
                               "h-10 px-6 rounded-full font-black uppercase text-[10px] tracking-widest border-2 transition-all",
                               resourceFilter === cat ? "bg-primary text-background border-primary" : "border-primary/10 text-primary/40 hover:border-primary/40"
                             )}
                           >
                             {cat.toUpperCase()}
                           </Button>
                         ))}
                      </div>
                   </div>

                   <ScrollArea className="h-[750px] pr-6">
                      <div className="space-y-8">
                         {filteredResources.length === 0 ? (
                           <div className="p-20 border-4 border-dashed border-primary/10 rounded-[4rem] text-center bg-card/40 space-y-6 relative overflow-hidden">
                              <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                                <BookOpen className="w-64 h-64 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" />
                              </div>
                              <BookOpen className="h-16 w-16 mx-auto text-primary/10 relative z-10" />
                              <p className="text-xl font-black uppercase tracking-widest text-primary/20 italic relative z-10">Archive Empty.<br/>Awaiting Injection.</p>
                           </div>
                         ) : (
                           filteredResources.map((r: any) => (
                             <Card key={r.id} className="rounded-[3.5rem] border-4 border-primary/10 bg-card shadow-2xl p-10 space-y-6 group hover:border-primary/30 transition-all">
                                <div className="flex justify-between items-start">
                                   <div className="space-y-3">
                                      <div className="flex items-center gap-3">
                                         <Badge className="bg-primary text-background border-none text-[8px] font-black uppercase px-4 py-1 rounded-full flex items-center gap-2">
                                           <Tag className="h-2.5 w-2.5" />
                                           {r.category || 'GENERAL'}
                                         </Badge>
                                         <span className="text-[9px] text-foreground/20 font-black uppercase tracking-widest">Shared: {r.timestamp?.toDate ? r.timestamp.toDate().toLocaleDateString() : 'Live Sync'}</span>
                                      </div>
                                      <h4 className="text-3xl font-black text-foreground uppercase italic tracking-tight">{r.title}</h4>
                                      <div className="flex items-center gap-3">
                                         <Badge className="bg-primary/10 text-primary border-none text-[9px] font-black uppercase px-4 py-1 rounded-full flex items-center gap-2 overflow-hidden">
                                           {r.avatarUrl ? (
                                              <img src={r.avatarUrl} className="w-4 h-4 rounded-full object-cover" alt="" />
                                           ) : (
                                              <User className="h-3 w-3" />
                                           )}
                                           @{r.nickname || 'Strategist'}
                                         </Badge>
                                      </div>
                                   </div>
                                   <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center border-2 border-primary/10">
                                      <Zap className="h-5 w-5 text-primary/40" />
                                   </div>
                                </div>

                                <div className="p-8 bg-background/40 rounded-[2.5rem] border-2 border-primary/5 text-lg font-bold text-foreground/80 italic leading-relaxed shadow-inner whitespace-pre-wrap">
                                   {r.content}
                                </div>

                                {r.type === 'AI_Prompt' && (
                                  <Button 
                                    variant="ghost" 
                                    className="w-full h-14 rounded-full border-2 border-primary/10 text-primary font-black uppercase text-[10px] tracking-widest hover:bg-primary hover:text-background transition-all"
                                    onClick={() => { navigator.clipboard.writeText(r.content); toast({ title: "Prompt Copied" }); }}
                                  >
                                    Copy Lab Data
                                  </Button>
                                )}
                             </Card>
                           ))
                         )}
                      </div>
                   </ScrollArea>
                </div>
             </div>
          </ShadcnContent>

          <ShadcnContent value="faq" className="max-w-6xl mx-auto space-y-12">
             <div className="text-center space-y-3">
                <h3 className="text-7xl font-headline font-black text-foreground uppercase tracking-tighter italic">PROTOCOL INQUIRY</h3>
                <p className="text-[11px] font-black uppercase text-primary tracking-[0.5em]">FREQUENTLY ASKED STRATEGIC QUESTIONS</p>
             </div>
             <Card className="rounded-[4rem] border-4 border-primary/10 bg-card/40 p-12 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
                   <CircleHelp className="w-96 h-96 absolute -bottom-20 -right-20 text-primary" />
                </div>
                <Accordion type="single" collapsible className="w-full space-y-6 relative z-10">
                  {faqs.map((f: any) => (
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
          </ShadcnContent>
        </ShadcnTabs>
      </main>

      <Dialog open={showDaily} onOpenChange={setShowDaily}>
        <DialogContent className="rounded-[3rem] border-8 border-primary/20 bg-card p-12 max-w-md text-center shadow-[0_50px_100px_rgba(0,0,0,0.6)]">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black text-foreground uppercase tracking-tighter italic text-center">Daily Sync</DialogTitle>
          </DialogHeader>
          <div className="space-y-8 mt-6">
            <div className="w-28 h-28 bg-primary text-background rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl animate-bounce">
              <Award className="h-14 w-14" />
            </div>
            <div className="space-y-4">
              <p className="text-[10px] text-primary font-black uppercase tracking-[0.5em]">Sovereign Protocol Initiated</p>
            </div>
            <div className="p-8 bg-background/50 rounded-[2rem] border-4 border-primary/10 flex justify-around shadow-inner">
               <div className="flex flex-col items-center">
                 <p className="text-3xl font-black text-foreground">100</p>
                 <p className="text-[9px] font-black uppercase text-primary/40 leading-none">Points</p>
               </div>
               <div className="w-px h-10 bg-primary/20" />
               <div className="flex flex-col items-center">
                 <p className="text-3xl font-black text-foreground">50</p>
                 <p className="text-[9px] font-black uppercase text-primary/40 leading-none">XP</p>
               </div>
            </div>
            <Button onClick={handleClaimDaily} className="w-full h-18 rounded-full bg-primary text-background font-black text-xl shadow-2xl hover:scale-105 hover:bg-white hover:text-primary transition-all uppercase tracking-tighter">CLAIM REWARD</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showRewardModal} onOpenChange={setShowRewardModal}>
        <DialogContent className="rounded-[3rem] border-8 border-primary/20 bg-card p-12 max-w-xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-4xl font-black text-foreground uppercase tracking-tighter text-center italic">Mastery Rewards</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-10">
            {[
              { lv: 5, reward: "Bronze Strategy Bundle" },
              { lv: 10, reward: "Elite Ebook Archive Access" },
              { lv: 25, reward: "Host Priority Chat Channel" },
              { lv: 50, reward: "NICO DIGITAL Sovereign Status" },
            ].map((r) => (
              <div key={r.lv} className={cn("p-8 rounded-[2.5rem] border-4 flex items-center justify-between transition-all", level >= r.lv ? "bg-primary/10 border-primary" : "bg-white/5 border-white/10 opacity-40")}>
                <div><p className="text-[10px] font-black text-primary uppercase mb-1 tracking-widest">Level {r.lv}</p><p className="text-xl font-black text-foreground uppercase italic">{r.reward}</p></div>
                <Award className={cn("h-10 w-10", level >= r.lv ? "text-primary" : "text-foreground/20")} />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedPostForInsights} onOpenChange={() => setSelectedPostForInsights(null)}>
        <DialogContent className="rounded-[4rem] border-[10px] border-primary/20 bg-card p-10 max-w-2xl shadow-2xl flex flex-col h-[80vh]">
          <DialogHeader className="mb-6">
             <DialogTitle className="text-4xl font-black text-foreground uppercase italic tracking-tighter text-center">Insights Portal</DialogTitle>
             <p className="text-[10px] text-center font-black uppercase text-primary/40 tracking-[0.4em] mt-2">Public Strategic Discussion</p>
          </DialogHeader>
          
          <div className="flex-1 flex flex-col space-y-8 min-h-0">
             <div className="flex gap-4">
                <Input 
                   placeholder="RECORD INSIGHT..." 
                   className="h-16 rounded-[2rem] bg-background/50 border-4 border-primary/10 text-base font-black px-8 focus:border-primary shadow-inner uppercase tracking-widest"
                   value={insightInput}
                   onChange={(e) => setInsightInput(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleAddComment(selectedPostForInsights.id)}
                   disabled={isCommenting}
                />
                <Button 
                   onClick={() => handleAddComment(selectedPostForInsights.id)} 
                   className="h-16 w-16 rounded-full bg-primary text-background shadow-xl hover:scale-110 transition-transform shrink-0"
                   disabled={isCommenting}
                >
                   {isCommenting ? <Loader2 className="h-6 w-6 animate-spin" /> : <Send className="h-6 w-6" />}
                </Button>
             </div>
             
             <ScrollArea className="flex-1 pr-4">
                <div className="space-y-6">
                   {!currentLivePost || currentLivePost.comments?.length === 0 ? (
                     <div className="py-20 text-center space-y-4 opacity-20">
                        <MessageSquare className="h-12 w-12 mx-auto" />
                        <p className="text-xs font-black uppercase tracking-widest">No insights recorded yet.</p>
                     </div>
                   ) : (
                     [...(currentLivePost.comments || [])].reverse().map((comment: any) => (
                       <div key={comment.id} className="p-8 bg-background/40 rounded-[2.5rem] border-2 border-primary/10 flex justify-between items-start group shadow-sm animate-in fade-in slide-in-from-bottom-4">
                          <div className="flex items-center gap-4 mr-6">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border-2 border-primary/10">
                               {comment.avatarUrl ? (
                                 <img src={comment.avatarUrl} className="w-full h-full object-cover" alt="" />
                               ) : (
                                 <User className="h-5 w-5 text-primary" />
                               )}
                            </div>
                          </div>
                          <div className="flex-1">
                             <div className="flex items-center gap-4 mb-2">
                                <p className="font-black text-xs uppercase text-primary bg-primary/10 px-4 py-1 rounded-full">@{comment.nickname || 'Strategist'}</p>
                                <span className="text-[9px] text-foreground/20 font-black uppercase tracking-widest">{comment.timestamp ? new Date(comment.timestamp).toLocaleTimeString() : 'Recent'}</span>
                             </div>
                             <p className="text-lg font-bold text-foreground/80 leading-relaxed italic">{comment.text}</p>
                          </div>
                       </div>
                     ))
                   )}
                </div>
             </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}