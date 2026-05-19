"use client";

import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminStore, useUserStore } from "@/lib/store";
import { useUser } from "@/firebase";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Key, ShieldAlert, Trash2, Award, BookOpen, CheckSquare, Newspaper, ShoppingBag, Users, MessageSquare, Lightbulb, Video, HelpCircle, Upload } from "lucide-react";

const ADMIN_EMAIL = "nicolaskheidenn@gmail.com";
const ADMIN_SECRET_KEY = "2878-2171-2489-2341";

export default function AdminPage() {
  const { user } = useUser();
  const [adminKey, setAdminKey] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  const { 
    dailyTasks, addTasks,
    quizzes, addQuiz, deleteQuiz,
    shooppyProducts, addProduct, deleteProduct, 
    newsPosts, addNewsPost, deleteNewsPost,
    faqs, addFAQ, deleteFAQ,
    badges, addBadge, deleteBadge,
    activityWall, deletePost,
    resources, deleteResource, addResource
  } = useAdminStore();

  const { resetUserStats, updateSpecificUser } = useUserStore();

  // Task State
  const [taskDay, setTaskDay] = useState(1);
  const [task1T, setTask1T] = useState("");
  const [task1D, setTask1D] = useState("");
  const [task2T, setTask2T] = useState("");
  const [task2D, setTask2D] = useState("");
  const [task3T, setTask3T] = useState("");
  const [task3D, setTask3D] = useState("");

  // Shooppy State
  const [prodTitle, setProdTitle] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodImg, setProdImg] = useState("");
  const [prodFile, setProdFile] = useState("");
  const [prodType, setProdType] = useState<'Bundle' | 'Template' | 'eBook'>('eBook');
  const [prodLevel, setProdLevel] = useState(1);

  // News State
  const [newsTitle, setNewsTitle] = useState("");
  const [newsContent, setNewsContent] = useState("");
  const [newsImg, setNewsImg] = useState("");

  // FAQ State
  const [faqQ, setFaqQ] = useState("");
  const [faqA, setFaqA] = useState("");

  // Badge State
  const [badgeTitle, setBadgeTitle] = useState("");
  const [badgeDesc, setBadgeDesc] = useState("");
  const [badgeDiff, setBadgeDiff] = useState<'Bronze' | 'Silver' | 'Gold' | 'Sovereign'>('Bronze');

  // WeBin State
  const [webinTitle, setWebinTitle] = useState("");
  const [webinLink, setWebinLink] = useState("");

  const handleAuthorize = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminKey === ADMIN_SECRET_KEY) {
      setIsAuthorized(true);
      toast({ title: "Identity Verified" });
    } else {
      toast({ title: "Invalid Protocol Key", variant: "destructive" });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveTasks = () => {
    addTasks(taskDay, [
      { title: task1T, description: task1D },
      { title: task2T, description: task2D },
      { title: task3T, description: task3D }
    ]);
    toast({ title: "Tasks Injected" });
  };

  const handleSaveProduct = () => {
    addProduct({
      title: prodTitle,
      description: prodDesc,
      imageUrl: prodImg,
      fileUrl: prodFile,
      type: prodType,
      requiredLevel: prodLevel
    });
    setProdTitle(""); setProdDesc(""); setProdImg(""); setProdFile("");
    toast({ title: "Strategic Asset Deployed" });
  };

  if (user?.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#1f1610] p-6 text-center">
        <ShieldAlert className="h-32 w-32 mb-8 text-[#FFD700]" />
        <h1 className="text-6xl font-headline font-black uppercase text-[#fdfaf6] italic">Host Terminal Locked</h1>
        <Button className="mt-12 rounded-full h-20 px-16 bg-[#FFD700] text-[#1f1610] font-black text-2xl uppercase shadow-2xl" asChild><a href="/">Return to Gate</a></Button>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1f1610] p-6">
        <Card className="w-full max-w-xl p-16 bg-[#fdfaf6] rounded-[4rem] shadow-2xl border-8 border-[#FFD700]/20">
          <CardHeader className="text-center space-y-8">
            <Key className="h-16 w-16 text-[#FFD700] mx-auto" />
            <CardTitle className="text-5xl font-headline font-black uppercase italic tracking-tighter text-[#1f1610]">Verify Host</CardTitle>
          </CardHeader>
          <CardContent className="mt-10">
            <form onSubmit={handleAuthorize} className="space-y-10">
              <Input type="password" placeholder="Protocol Key" className="h-24 text-center text-5xl font-mono rounded-[2.5rem] border-4 border-[#1f1610]/10 bg-white text-[#1f1610]" value={adminKey} onChange={(e) => setAdminKey(e.target.value)} />
              <Button type="submit" className="w-full h-24 rounded-full font-black text-3xl bg-[#1f1610] text-[#FFD700] shadow-2xl uppercase tracking-tighter">AUTHENTICATE</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#1f1610]">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-16 max-w-6xl">
        <h1 className="text-8xl font-headline font-black text-[#fdfaf6] uppercase tracking-tighter mb-16 italic">Host Command</h1>

        <Tabs defaultValue="moderation" className="space-y-12">
          <TabsList className="bg-[#fdfaf6] p-2 rounded-full w-fit shadow-2xl border-4 border-[#FFD700]/20 overflow-x-auto scrollbar-hide">
            <TabsTrigger value="moderation" className="rounded-full px-12 h-14 text-[11px] font-black uppercase tracking-widest text-[#1f1610]">Moderation</TabsTrigger>
            <TabsTrigger value="assets" className="rounded-full px-12 h-14 text-[11px] font-black uppercase tracking-widest text-[#1f1610]">Digital Assets</TabsTrigger>
            <TabsTrigger value="routines" className="rounded-full px-12 h-14 text-[11px] font-black uppercase tracking-widest text-[#1f1610]">Routines</TabsTrigger>
            <TabsTrigger value="broadcast" className="rounded-full px-12 h-14 text-[11px] font-black uppercase tracking-widest text-[#1f1610]">Broadcast</TabsTrigger>
            <TabsTrigger value="system" className="rounded-full px-12 h-14 text-[11px] font-black uppercase tracking-widest text-[#1f1610]">System</TabsTrigger>
          </TabsList>

          <TabsContent value="moderation" className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <Card className="rounded-[4rem] border-4 border-[#FFD700]/20 bg-[#fdfaf6] p-12 shadow-2xl">
                 <CardTitle className="text-3xl font-black uppercase mb-10 flex items-center gap-4 text-[#1f1610]"><MessageSquare className="h-10 w-10 text-[#FFD700]" /> Strategist Wins</CardTitle>
                 <div className="space-y-6 max-h-[600px] overflow-y-auto pr-6 scrollbar-hide">
                   {activityWall.map(p => (
                     <div key={p.id} className="p-8 bg-white/50 rounded-[3rem] border-2 border-[#1f1610]/10 flex justify-between items-center group">
                       <div>
                         <p className="font-black text-[#1f1610] uppercase text-sm">@{p.nickname}</p>
                         <p className="text-xs font-bold text-[#1f1610]/40 mt-1 line-clamp-1">{p.description}</p>
                       </div>
                       <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 rounded-full" onClick={() => deletePost(p.id)}><Trash2 className="h-6 w-6" /></Button>
                     </div>
                   ))}
                 </div>
              </Card>

              <Card className="rounded-[4rem] border-4 border-[#FFD700]/20 bg-[#fdfaf6] p-12 shadow-2xl">
                 <CardTitle className="text-3xl font-black uppercase mb-10 flex items-center gap-4 text-[#1f1610]"><Lightbulb className="h-10 w-10 text-[#FFD700]" /> Resource moderation</CardTitle>
                 <div className="space-y-6 max-h-[600px] overflow-y-auto pr-6 scrollbar-hide">
                   {resources.map(r => (
                     <div key={r.id} className="p-8 bg-white/50 rounded-[3rem] border-2 border-[#1f1610]/10 flex justify-between items-center group">
                       <div>
                         <p className="font-black text-[10px] uppercase text-[#FFD700] mb-1 tracking-widest">{r.type}</p>
                         <p className="font-black text-[#1f1610] uppercase text-sm">{r.title}</p>
                         <p className="text-[10px] font-bold text-[#1f1610]/40 mt-1 uppercase">By @{r.nickname}</p>
                       </div>
                       <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 rounded-full" onClick={() => deleteResource(r.id)}><Trash2 className="h-6 w-6" /></Button>
                     </div>
                   ))}
                 </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="assets" className="space-y-12">
            <Card className="rounded-[5rem] border-8 border-[#FFD700]/10 bg-[#fdfaf6] p-16 shadow-2xl space-y-12">
                <CardTitle className="text-4xl font-black uppercase flex items-center gap-6 italic text-[#1f1610]"><ShoppingBag className="h-12 w-12 text-[#FFD700]" /> Digital Asset Injector</CardTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                   <div className="space-y-8">
                      <div className="space-y-3">
                        <Label className="text-[#1f1610]">Asset Name</Label>
                        <Input placeholder="Master Strategy E-book" value={prodTitle} onChange={e => setProdTitle(e.target.value)} className="h-18 font-black text-xl rounded-2xl bg-white text-[#1f1610] border-[#1f1610]/20" />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[#1f1610]">Description</Label>
                        <Textarea placeholder="Define the value of this asset..." value={prodDesc} onChange={e => setProdDesc(e.target.value)} className="min-h-[160px] rounded-[2.5rem] p-8 bg-white text-[#1f1610] border-[#1f1610]/20" />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[#1f1610]">Category</Label>
                        <select className="w-full h-18 bg-white border-4 border-[#1f1610]/10 rounded-2xl px-8 font-black uppercase text-sm text-[#1f1610]" value={prodType} onChange={e => setProdType(e.target.value as any)}>
                            <option value="eBook">Sovereign E-Book</option>
                            <option value="Template">Execution Template</option>
                            <option value="Bundle">Strategy Bundle</option>
                        </select>
                      </div>
                   </div>
                   <div className="space-y-8">
                      <div className="p-10 bg-white/50 rounded-[3rem] border-4 border-dashed border-[#FFD700]/20 text-center space-y-6">
                        <Upload className="h-12 w-12 mx-auto text-[#FFD700]" />
                        <div className="space-y-4">
                           <div className="space-y-2">
                             <Label className="text-[#1f1610]">Cover Photo (Gallery)</Label>
                             <Input type="file" onChange={e => handleFileUpload(e, setProdImg)} className="h-14 bg-white text-[#1f1610]" />
                           </div>
                           <div className="space-y-2">
                             <Label className="text-[#1f1610]">Digital Asset File</Label>
                             <Input type="file" onChange={e => handleFileUpload(e, setProdFile)} className="h-14 bg-white text-[#1f1610]" />
                           </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[#1f1610]">Mastery Level Requirement</Label>
                        <Input type="number" min={1} value={prodLevel} onChange={e => setProdLevel(Number(e.target.value))} className="h-18 font-black text-3xl text-center bg-white text-[#1f1610] border-[#1f1610]/20" />
                      </div>
                      <Button onClick={handleSaveProduct} className="w-full h-24 rounded-full bg-[#1f1610] text-[#FFD700] font-black text-2xl uppercase shadow-2xl hover:bg-[#FFD700] hover:text-[#1f1610] transition-all">Deploy Asset</Button>
                   </div>
                </div>
            </Card>
          </TabsContent>

          <TabsContent value="routines" className="space-y-12">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <Card className="rounded-[4rem] border-8 border-[#FFD700]/10 bg-[#fdfaf6] p-12 shadow-2xl space-y-10">
                   <CardTitle className="text-3xl font-black uppercase flex items-center gap-5 italic text-[#1f1610]"><CheckSquare className="h-10 w-10 text-[#FFD700]" /> TaskDo Injector</CardTitle>
                   <div className="space-y-6">
                      <div className="flex items-center gap-6 justify-between bg-white/50 p-8 rounded-[2rem] border-2 border-[#1f1610]/10">
                        <Label className="text-xl text-[#1f1610]">Target Day:</Label>
                        <Input type="number" min={1} max={7} value={taskDay} onChange={e => setTaskDay(Number(e.target.value))} className="w-24 h-16 text-center text-3xl font-black bg-white text-[#1f1610]" />
                      </div>
                      <div className="space-y-4">
                        <Input placeholder="Task 1 Title" value={task1T} onChange={e => setTask1T(e.target.value)} className="h-16 rounded-2xl bg-white text-[#1f1610]" />
                        <Input placeholder="Task 1 Description" value={task1D} onChange={e => setTask1D(e.target.value)} className="h-16 rounded-2xl bg-white text-[#1f1610]" />
                      </div>
                      <div className="space-y-4">
                        <Input placeholder="Task 2 Title" value={task2T} onChange={e => setTask2T(e.target.value)} className="h-16 rounded-2xl bg-white text-[#1f1610]" />
                        <Input placeholder="Task 2 Description" value={task2D} onChange={e => setTask2D(e.target.value)} className="h-16 rounded-2xl bg-white text-[#1f1610]" />
                      </div>
                      <div className="space-y-4">
                        <Input placeholder="Task 3 Title" value={task3T} onChange={e => setTask3T(e.target.value)} className="h-16 rounded-2xl bg-white text-[#1f1610]" />
                        <Input placeholder="Task 3 Description" value={task3D} onChange={e => setTask3D(e.target.value)} className="h-16 rounded-2xl bg-white text-[#1f1610]" />
                      </div>
                      <Button onClick={handleSaveTasks} className="w-full h-24 rounded-full bg-[#FFD700] text-[#1f1610] font-black text-2xl uppercase shadow-2xl">Inject Routine</Button>
                   </div>
                </Card>

                <Card className="rounded-[4rem] border-8 border-[#FFD700]/10 bg-[#fdfaf6] p-12 shadow-2xl space-y-10">
                   <CardTitle className="text-3xl font-black uppercase flex items-center gap-5 italic text-[#1f1610]"><BookOpen className="h-10 w-10 text-[#FFD700]" /> Quizzo Editor</CardTitle>
                   <div className="space-y-6">
                      <Input placeholder="Quiz Title" value={quizTitle} onChange={e => setQuizTitle(e.target.value)} className="h-16 rounded-2xl font-black bg-white text-[#1f1610]" />
                      <div className="p-8 bg-white/50 rounded-[2.5rem] space-y-6 border-2 border-[#1f1610]/10">
                        <Label className="text-[#1f1610]">Question</Label>
                        <Textarea placeholder="Ask a strategic question..." value={quizQ} onChange={e => setQuizQ(e.target.value)} className="min-h-[120px] rounded-3xl bg-white text-[#1f1610]" />
                        <Label className="text-[#1f1610]">Answer</Label>
                        <Input placeholder="Correct Key" value={quizA} onChange={e => setQuizA(e.target.value)} className="h-16 rounded-2xl bg-white text-[#1f1610]" />
                      </div>
                      <Button onClick={() => { addQuiz({ title: quizTitle, questionCount: 1, questions: [{ id: '1', type: 'id', question: quizQ, answer: quizA }] }); toast({ title: "Quiz Deployed" }); }} className="w-full h-24 rounded-full bg-[#1f1610] text-[#FFD700] font-black text-2xl uppercase shadow-2xl">Deploy Quiz</Button>
                   </div>
                </Card>
             </div>
          </TabsContent>

          <TabsContent value="broadcast" className="space-y-12">
             <Card className="rounded-[5rem] border-8 border-[#FFD700]/10 bg-[#fdfaf6] p-16 shadow-2xl space-y-12">
                <CardTitle className="text-4xl font-black uppercase flex items-center gap-6 italic text-[#1f1610]"><Newspaper className="h-12 w-12 text-[#FFD700]" /> Global Broadcast Center</CardTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                   <div className="space-y-8">
                      <div className="space-y-3">
                        <Label className="text-[#1f1610]">Headline</Label>
                        <Input placeholder="Broadcast Title" value={newsTitle} onChange={e => setNewsTitle(e.target.value)} className="h-18 font-black text-xl rounded-2xl bg-white text-[#1f1610]" />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[#1f1610]">Broadcast Narrative</Label>
                        <Textarea placeholder="Detailed announcement..." value={newsContent} onChange={e => setNewsContent(e.target.value)} className="min-h-[200px] rounded-[3rem] p-10 bg-white text-[#1f1610]" />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[#1f1610]">Visual Attachment (Gallery)</Label>
                        <Input type="file" onChange={e => handleFileUpload(e, setNewsImg)} className="h-16 bg-white text-[#1f1610]" />
                      </div>
                      <Button onClick={() => { addNewsPost({ title: newsTitle, content: newsContent, imageUrl: newsImg }); setNewsTitle(""); setNewsContent(""); setNewsImg(""); toast({ title: "Broadcast Dispatched" }); }} className="w-full h-24 rounded-full bg-[#1f1610] text-[#FFD700] font-black text-3xl uppercase shadow-2xl hover:bg-[#FFD700] hover:text-[#1f1610] transition-all">Dispatch Broadcast</Button>
                   </div>
                   <div className="p-12 bg-white/50 rounded-[4rem] border-8 border-dashed border-[#FFD700]/5 space-y-8">
                      <h4 className="font-black text-[#1f1610]/30 uppercase text-xs text-center tracking-[0.4em]">Active Protocols</h4>
                      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-4 scrollbar-hide">
                        {newsPosts.map(p => (
                          <div key={p.id} className="p-6 bg-white rounded-3xl flex justify-between items-center shadow-lg border-2 border-[#1f1610]/10">
                             <p className="font-black text-xs uppercase truncate flex-1 mr-6 italic text-[#1f1610]">{p.title}</p>
                             <Button variant="ghost" size="icon" className="text-red-500 rounded-full" onClick={() => deleteNewsPost(p.id)}><Trash2 className="h-5 w-5" /></Button>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>
             </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-12">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <Card className="rounded-[4rem] border-8 border-[#FFD700]/10 bg-[#fdfaf6] p-12 shadow-2xl space-y-10 md:col-span-2">
                   <CardTitle className="text-3xl font-black uppercase flex items-center gap-5 italic text-[#1f1610]"><Users className="h-10 w-10 text-[#FFD700]" /> Strategist monitor</CardTitle>
                   <div className="p-10 bg-white/50 rounded-[3rem] flex justify-between items-center border-4 border-[#1f1610]/10">
                      <div className="space-y-2">
                         <p className="font-black text-[#1f1610] text-3xl uppercase italic tracking-tighter">Protocol Reset Controls</p>
                         <p className="text-[11px] font-bold text-[#1f1610]/40 uppercase tracking-[0.3em]">Global Identity Synchronization Active</p>
                      </div>
                      <div className="flex gap-6">
                         <Button onClick={() => { updateSpecificUser({ streak: 0 }); toast({ title: "Streak Zeroed" }); }} variant="destructive" className="rounded-full h-16 px-12 font-black uppercase text-sm shadow-xl">Reset Streak</Button>
                         <Button onClick={resetUserStats} variant="outline" className="rounded-full h-16 px-12 font-black uppercase text-sm border-4 border-[#1f1610] bg-white text-[#1f1610] hover:bg-[#1f1610] hover:text-[#FFD700] transition-all shadow-xl">Purge User Stats</Button>
                      </div>
                   </div>
                </Card>

                <Card className="rounded-[4rem] border-4 border-[#FFD700]/10 bg-[#fdfaf6] p-12 shadow-2xl space-y-10">
                   <CardTitle className="text-3xl font-black uppercase flex items-center gap-5 italic text-[#1f1610]"><HelpCircle className="h-10 w-10 text-[#FFD700]" /> FAQ engine</CardTitle>
                   <div className="space-y-6">
                      <Input placeholder="Inquiry Question" value={faqQ} onChange={e => setFaqQ(e.target.value)} className="h-16 rounded-2xl bg-white text-[#1f1610]" />
                      <Textarea placeholder="Protocol Response" value={faqA} onChange={e => setFaqA(e.target.value)} className="min-h-[120px] rounded-3xl bg-white text-[#1f1610]" />
                      <Button onClick={() => { addFAQ({ question: faqQ, answer: faqA }); setFaqQ(""); setFaqA(""); toast({ title: "FAQ Added" }); }} className="w-full h-18 rounded-2xl bg-[#1f1610] text-[#FFD700] font-black uppercase text-sm">Inject FAQ</Button>
                   </div>
                </Card>

                <Card className="rounded-[4rem] border-4 border-[#FFD700]/10 bg-[#fdfaf6] p-12 shadow-2xl space-y-10">
                   <CardTitle className="text-3xl font-black uppercase flex items-center gap-5 italic text-[#1f1610]"><Award className="h-10 w-10 text-[#FFD700]" /> Achievement Vault</CardTitle>
                   <div className="space-y-6">
                      <Input placeholder="Trophy Title" value={badgeTitle} onChange={e => setBadgeTitle(e.target.value)} className="h-16 rounded-2xl bg-white text-[#1f1610]" />
                      <Textarea placeholder="Mission Description" value={badgeDesc} onChange={e => setBadgeDesc(e.target.value)} className="min-h-[120px] rounded-3xl bg-white text-[#1f1610]" />
                      <select className="w-full h-16 bg-white border-4 border-[#1f1610]/10 rounded-2xl px-8 font-black uppercase text-sm text-[#1f1610]" value={badgeDiff} onChange={e => setBadgeDiff(e.target.value as any)}>
                         <option value="Bronze">Bronze Strategy</option>
                         <option value="Silver">Silver Strategy</option>
                         <option value="Gold">Gold Strategy</option>
                         <option value="Sovereign">Sovereign Mastery</option>
                      </select>
                      <Button onClick={() => { addBadge({ title: badgeTitle, description: badgeDesc, difficulty: badgeDiff }); setBadgeTitle(""); setBadgeDesc(""); toast({ title: "Badge Added" }); }} className="w-full h-18 rounded-2xl bg-[#1f1610] text-[#FFD700] font-black uppercase text-sm">Deploy Trophy</Button>
                   </div>
                </Card>

                <Card className="rounded-[4rem] border-8 border-[#FFD700]/10 bg-[#fdfaf6] p-12 shadow-2xl space-y-10 md:col-span-2">
                   <CardTitle className="text-3xl font-black uppercase flex items-center gap-5 italic text-[#1f1610]"><Video className="h-10 w-10 text-[#FFD700]" /> WeBin Archiver</CardTitle>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                         <Input placeholder="Webinar Title" value={webinTitle} onChange={e => setWebinTitle(e.target.value)} className="h-16 rounded-2xl bg-white text-[#1f1610]" />
                         <Input placeholder="Protocol Watch Link (URL)" value={webinLink} onChange={e => setWebinLink(e.target.value)} className="h-16 rounded-2xl bg-white text-[#1f1610]" />
                         <Button onClick={() => { addResource({ type: 'WeBin', title: webinTitle, description: "", content: webinLink, userId: user.uid, nickname: 'The Host' }); setWebinTitle(""); setWebinLink(""); toast({ title: "WeBin Added" }); }} className="w-full h-20 rounded-full bg-[#FFD700] text-[#1f1610] font-black uppercase text-lg">Add to WeBin</Button>
                      </div>
                      <div className="space-y-4">
                        {resources.filter(r => r.type === 'WeBin').map(r => (
                          <div key={r.id} className="p-6 bg-white/50 rounded-[2rem] flex justify-between items-center border-2 border-[#1f1610]/10">
                             <p className="text-sm font-black uppercase truncate flex-1 mr-6 italic text-[#1f1610]">{r.title}</p>
                             <Button variant="ghost" size="icon" className="text-red-500 rounded-full" onClick={() => deleteResource(r.id)}><Trash2 className="h-5 w-5" /></Button>
                          </div>
                        ))}
                      </div>
                   </div>
                </Card>
             </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
