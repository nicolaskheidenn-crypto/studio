
"use client";

import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminStore, useUserStore } from "@/lib/store";
import { useUser } from "@/firebase";
import { useState, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, ShieldAlert, Key, ShoppingBag, ShieldCheck, Save, Newspaper, Upload, FileUp, Users, MessageSquare, Lightbulb, Video, HelpCircle, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ADMIN_EMAIL = "nicolaskheidenn@gmail.com";
const ADMIN_SECRET_KEY = "2878-2171-2489-2341";

export default function AdminPage() {
  const { user } = useUser();
  const [adminKey, setAdminKey] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  const { 
    dailyTasks, addTasks, deleteTask, 
    shooppyProducts, addProduct, deleteProduct, 
    newsPosts, addNewsPost, deleteNewsPost,
    sovereigntyTitle, sovereigntySections, updateSovereignty,
    faqs, addFAQ, deleteFAQ,
    badges, addBadge, deleteBadge,
    resources, addResource, deleteResource,
    activityWall, deletePost
  } = useAdminStore();

  const { points, xp, level, streak, updateStats, resetStats } = useUserStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<'news' | 'product' | 'badge' | 'resource' | null>(null);

  // FAQ State
  const [faqQ, setFaqQ] = useState("");
  const [faqA, setFaqA] = useState("");

  // Resource State
  const [resTitle, setResTitle] = useState("");
  const [resDesc, setResDesc] = useState("");
  const [resType, setResType] = useState<'AI_Prompt' | 'Tips_Tricks' | 'WeBin'>('AI_Prompt');
  const [resContent, setResContent] = useState("");

  if (user?.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-white p-6">
        <ShieldAlert className="h-24 w-24 mb-6 text-primary" />
        <h1 className="text-4xl font-headline font-bold">Unauthorized Access</h1>
        <Button className="mt-12 rounded-full h-16 px-12 text-xl font-bold bg-primary text-background" asChild><a href="/">Return to Hub</a></Button>
      </div>
    );
  }

  const handleAuthorize = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminKey === ADMIN_SECRET_KEY) {
      setIsAuthorized(true);
      toast({ title: "Identity Verified" });
    } else {
      toast({ title: "Invalid Key", variant: "destructive" });
    }
  };

  const handleAddResource = () => {
    if (!resTitle) return;
    addResource({ title: resTitle, description: resDesc, type: resType, content: resContent });
    setResTitle(""); setResDesc(""); setResContent("");
    toast({ title: "Resource Deployed" });
  };

  const handleResetUser = () => {
    resetStats();
    toast({ title: "User Protocol Reset", description: "All stats zeroed for testing/discipline." });
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md p-10 bg-card rounded-[3.5rem] shadow-2xl border-4 border-primary/20">
          <CardHeader className="text-center space-y-6">
            <Key className="h-12 w-12 text-primary mx-auto" />
            <CardTitle className="text-4xl font-headline font-bold">Host Verification</CardTitle>
          </CardHeader>
          <CardContent className="mt-6">
            <form onSubmit={handleAuthorize} className="space-y-8">
              <Input type="password" placeholder="Key" className="h-20 text-center text-3xl font-mono rounded-3xl" value={adminKey} onChange={(e) => setAdminKey(e.target.value)} />
              <Button type="submit" className="w-full h-20 rounded-[2rem] font-black text-2xl bg-primary text-background">Verify Identity</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-6xl">
        <h1 className="text-6xl font-headline font-black text-white uppercase tracking-tighter mb-12">Host Command</h1>

        <Tabs defaultValue="moderation" className="space-y-10">
          <TabsList className="bg-secondary/40 p-2 rounded-full w-fit shadow-xl border border-primary/10 overflow-x-auto">
            <TabsTrigger value="moderation" className="rounded-full px-8 h-12 text-[10px] font-black uppercase tracking-widest">Moderation</TabsTrigger>
            <TabsTrigger value="resources" className="rounded-full px-8 h-12 text-[10px] font-black uppercase tracking-widest">Resource Lab</TabsTrigger>
            <TabsTrigger value="faq" className="rounded-full px-8 h-12 text-[10px] font-black uppercase tracking-widest">Knowledge Hub</TabsTrigger>
            <TabsTrigger value="user_stats" className="rounded-full px-8 h-12 text-[10px] font-black uppercase tracking-widest">User Monitor</TabsTrigger>
          </TabsList>

          <TabsContent value="moderation" className="space-y-8">
            <Card className="rounded-[3rem] border-primary/10 bg-secondary/20 p-10">
               <CardTitle className="text-3xl font-black uppercase mb-8 flex items-center gap-4"><MessageSquare className="h-8 w-8 text-primary" /> Content Moderation</CardTitle>
               <div className="space-y-6">
                 {activityWall.length === 0 ? <p className="text-muted-foreground italic">No active community posts.</p> : activityWall.map(p => (
                   <div key={p.id} className="p-6 bg-background/40 rounded-3xl border border-white/5 flex justify-between items-center">
                     <div>
                       <p className="font-black text-white uppercase text-xs">@{p.nickname}</p>
                       <p className="text-xs text-primary/60">{p.description}</p>
                     </div>
                     <Button variant="ghost" size="icon" className="text-red-500" onClick={() => deletePost(p.id)}><Trash2 className="h-5 w-5" /></Button>
                   </div>
                 ))}
               </div>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-8">
            <Card className="rounded-[3rem] border-primary/10 bg-secondary/20 p-10">
              <CardTitle className="text-3xl font-black uppercase mb-8 flex items-center gap-4"><Lightbulb className="h-8 w-8 text-primary" /> Resource Lab</CardTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-6">
                   <Input placeholder="Title" value={resTitle} onChange={e => setResTitle(e.target.value)} className="h-14 font-black" />
                   <select className="w-full h-14 bg-secondary/40 border-2 border-primary/20 rounded-2xl px-6 font-black text-primary uppercase" value={resType} onChange={e => setResType(e.target.value as any)}>
                      <option value="AI_Prompt">AI Prompt</option>
                      <option value="Tips_Tricks">Tips & Tricks</option>
                      <option value="WeBin">WeBin (Webinar)</option>
                   </select>
                   <Textarea placeholder="Content Link or Text" value={resContent} onChange={e => setResContent(e.target.value)} className="min-h-[140px]" />
                   <Button onClick={handleAddResource} className="w-full h-20 rounded-full bg-primary text-background font-black text-2xl">Deploy Resource</Button>
                 </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="faq" className="space-y-8">
            <Card className="rounded-[3rem] border-primary/10 bg-secondary/20 p-10">
              <CardTitle className="text-3xl font-black uppercase mb-8 flex items-center gap-4"><HelpCircle className="h-8 w-8 text-primary" /> Knowledge Base</CardTitle>
              <div className="space-y-6">
                 <Input placeholder="Question" value={faqQ} onChange={e => setFaqQ(e.target.value)} className="h-14" />
                 <Textarea placeholder="Answer" value={faqA} onChange={e => setFaqA(e.target.value)} className="min-h-[100px]" />
                 <Button onClick={() => { addFAQ({ question: faqQ, answer: faqA }); setFaqQ(""); setFaqA(""); toast({ title: "FAQ Added" }); }} className="w-full h-16 rounded-full bg-primary text-background font-black uppercase">Add Entry</Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="user_stats" className="space-y-8">
             <Card className="rounded-[3rem] border-primary/10 bg-secondary/20 p-10">
               <CardTitle className="text-3xl font-black uppercase mb-8 flex items-center gap-4"><Users className="h-8 w-8 text-primary" /> Protocol Monitoring</CardTitle>
               <div className="space-y-8">
                  <div className="p-8 bg-background/40 rounded-[2rem] border border-white/5 flex justify-between items-center">
                    <div>
                      <p className="font-black text-white text-xl uppercase tracking-tighter">Current Strategist Stats</p>
                      <p className="text-xs text-primary/60 uppercase tracking-widest font-black">Points: {points} | Level: {level} | XP: {xp} | Streak: {streak}</p>
                    </div>
                    <Button onClick={handleResetUser} variant="destructive" className="rounded-full h-12 px-8 font-black uppercase text-xs">Reset Protocols</Button>
                  </div>
               </div>
             </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
