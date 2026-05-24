
"use client";

import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserStore, QuizQuestion } from "@/lib/store";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { useState, useMemo } from "react";
import { toast } from "@/hooks/use-toast";
import { 
  Key, ShieldAlert, Trash2, Award, BookOpen, CheckSquare, 
  Newspaper, ShoppingBag, MessageSquare, Lightbulb, 
  Video, HelpCircle, Upload, Plus, Coins, ListChecks 
} from "lucide-react";
import { collection, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';

const ADMIN_EMAIL = "nicolaskheidenn@gmail.com";
const ADMIN_SECRET_KEY = "2878-2171-2489-2341";

export default function AdminPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [adminKey, setAdminKey] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  // Shared Collections
  const productsQuery = useMemo(() => collection(db, 'shooppyProducts'), [db]);
  const newsQuery = useMemo(() => query(collection(db, 'newsPosts'), orderBy('timestamp', 'desc')), [db]);
  const faqsQuery = useMemo(() => collection(db, 'faqs'), [db]);
  const activityQuery = useMemo(() => query(collection(db, 'activityWall'), orderBy('timestamp', 'desc')), [db]);
  const resourcesQuery = useMemo(() => query(collection(db, 'resources'), orderBy('timestamp', 'desc')), [db]);
  const tasksQuery = useMemo(() => query(collection(db, 'tasks'), orderBy('day', 'asc')), [db]);
  const quizzesQuery = useMemo(() => query(collection(db, 'quizzes'), orderBy('createdAt', 'desc')), [db]);

  const { data: shooppyProducts } = useCollection(productsQuery);
  const { data: newsPosts } = useCollection(newsQuery);
  const { data: faqs } = useCollection(faqsQuery);
  const { data: activityWall } = useCollection(activityQuery);
  const { data: sharedResources } = useCollection(resourcesQuery);
  const { data: globalTasks } = useCollection(tasksQuery);
  const { data: globalQuizzes } = useCollection(quizzesQuery);

  // Asset State
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodTitle, setProdTitle] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodImg, setProdImg] = useState("");
  const [prodFile, setProdFile] = useState("");
  const [prodType, setProdType] = useState<'Bundle' | 'Template' | 'eBook'>('eBook');
  const [prodPlacement, setProdPlacement] = useState<'Hub' | 'Marketplace'>('Marketplace');
  const [prodLevel, setProdLevel] = useState(1);
  const [prodPrice, setProdPrice] = useState(0);

  // Broadcast State
  const [newsTitle, setNewsTitle] = useState("");
  const [newsContent, setNewsContent] = useState("");
  const [newsImg, setNewsImg] = useState("");

  // FAQ State
  const [faqQ, setFaqQ] = useState("");
  const [faqA, setFaqA] = useState("");

  // Quiz State
  const [quizTitle, setQuizTitle] = useState("");
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [qType, setQType] = useState<'multiple' | 'boolean' | 'id'>('multiple');
  const [qText, setQText] = useState("");
  const [qAnswer, setQAnswer] = useState("");
  const [qOptions, setQOptions] = useState("");

  // Task State
  const [taskDay, setTaskDay] = useState(1);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");

  const handleAuthorize = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminKey === ADMIN_SECRET_KEY) {
      setIsAuthorized(true);
      toast({ title: "Identity Verified" });
    } else {
      toast({ title: "Invalid Protocol Key", variant: "destructive" });
    }
  };

  const handleSaveProduct = async () => {
    const data = {
      title: prodTitle,
      description: prodDesc,
      imageUrl: prodImg,
      fileUrl: prodFile,
      type: prodType,
      placement: prodPlacement,
      requiredLevel: prodLevel,
      price: prodPrice
    };

    if (editingProductId) {
      const ref = doc(db, 'shooppyProducts', editingProductId);
      await updateDoc(ref, data);
      setEditingProductId(null);
      toast({ title: "Strategic Asset Updated" });
    } else {
      await addDoc(collection(db, 'shooppyProducts'), data);
      toast({ title: "Strategic Asset Deployed" });
    }
    
    setProdTitle(""); setProdDesc(""); setProdImg(""); setProdFile(""); setProdLevel(1); setProdPrice(0); setProdPlacement('Marketplace');
  };

  const handleDispatchBroadcast = async () => {
    await addDoc(collection(db, 'newsPosts'), {
      title: newsTitle,
      content: newsContent,
      imageUrl: newsImg,
      timestamp: serverTimestamp()
    });
    setNewsTitle(""); setNewsContent(""); setNewsImg("");
    toast({ title: "Broadcast Dispatched" });
  };

  const handleAddQuestion = () => {
    const newQ: QuizQuestion = {
      id: Math.random().toString(36).substr(2, 9),
      type: qType,
      question: qText,
      answer: qAnswer,
      options: qType === 'multiple' ? qOptions.split(',').map(o => o.trim()) : undefined
    };
    setQuizQuestions([...quizQuestions, newQ]);
    setQText(""); setQAnswer(""); setQOptions("");
  };

  const handleSaveQuiz = async () => {
    if (!quizTitle || quizQuestions.length === 0) return;
    await addDoc(collection(db, 'quizzes'), {
      title: quizTitle,
      questionCount: quizQuestions.length,
      questions: quizQuestions,
      createdAt: serverTimestamp()
    });
    setQuizTitle(""); setQuizQuestions([]);
    toast({ title: "Quiz Protocol Deployed" });
  };

  const handleSaveTask = async () => {
    if (!taskTitle || !taskDesc) return;
    await addDoc(collection(db, 'tasks'), {
      day: taskDay,
      title: taskTitle,
      description: taskDesc
    });
    setTaskTitle(""); setTaskDesc("");
    toast({ title: "Daily Protocol Updated" });
  };

  const handleDeleteDoc = async (coll: string, id: string) => {
    await deleteDoc(doc(db, coll, id));
    toast({ title: "Data Purged" });
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
        <Card className="w-full max-w-xl p-16 bg-mocha-cream rounded-[4rem] shadow-2xl border-8 border-[#FFD700]/20">
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
      <main className="flex-1 container mx-auto px-4 py-16 max-w-6xl text-white">
        <h1 className="text-8xl font-headline font-black text-[#fdfaf6] uppercase tracking-tighter mb-16 italic">Host Command</h1>

        <Tabs defaultValue="assets" className="space-y-12">
          <TabsList className="bg-mocha-cream p-2 rounded-full w-fit shadow-2xl border-4 border-[#FFD700]/20 overflow-x-auto scrollbar-hide">
            <TabsTrigger value="assets" className="rounded-full px-10 h-14 text-[10px] font-black uppercase tracking-widest text-[#1f1610]">Assets</TabsTrigger>
            <TabsTrigger value="quizzo" className="rounded-full px-10 h-14 text-[10px] font-black uppercase tracking-widest text-[#1f1610]">Quizzo</TabsTrigger>
            <TabsTrigger value="tasks" className="rounded-full px-10 h-14 text-[10px] font-black uppercase tracking-widest text-[#1f1610]">Tasks</TabsTrigger>
            <TabsTrigger value="broadcast" className="rounded-full px-10 h-14 text-[10px] font-black uppercase tracking-widest text-[#1f1610]">Broadcast</TabsTrigger>
            <TabsTrigger value="moderation" className="rounded-full px-10 h-14 text-[10px] font-black uppercase tracking-widest text-[#1f1610]">Moderation</TabsTrigger>
            <TabsTrigger value="system" className="rounded-full px-10 h-14 text-[10px] font-black uppercase tracking-widest text-[#1f1610]">System</TabsTrigger>
          </TabsList>

          <TabsContent value="assets" className="space-y-12">
            <Card className="rounded-[5rem] border-8 border-[#FFD700]/10 bg-mocha-cream p-16 shadow-2xl space-y-12">
                <CardTitle className="text-4xl font-black uppercase flex items-center gap-6 italic text-[#1f1610]"><ShoppingBag className="h-12 w-12 text-[#FFD700]" /> Asset Injector</CardTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                   <div className="space-y-8">
                      <div className="space-y-3">
                        <Label className="text-[#1f1610]">Asset Name</Label>
                        <Input placeholder="Strategy E-book" value={prodTitle} onChange={e => setProdTitle(e.target.value)} className="h-18 font-black text-xl rounded-2xl bg-white text-[#1f1610]" />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[#1f1610]">Description</Label>
                        <Textarea placeholder="Asset value..." value={prodDesc} onChange={e => setProdDesc(e.target.value)} className="min-h-[160px] rounded-[2.5rem] p-8 bg-white text-[#1f1610]" />
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label className="text-[#1f1610]">Category</Label>
                          <select className="w-full h-18 bg-white border-4 border-[#1f1610]/10 rounded-2xl px-8 font-black uppercase text-sm text-[#1f1610]" value={prodType} onChange={e => setProdType(e.target.value as any)}>
                              <option value="eBook">E-Book</option>
                              <option value="Template">Template</option>
                              <option value="Bundle">Bundle</option>
                          </select>
                        </div>
                        <div className="space-y-3">
                          <Label className="text-[#1f1610]">Placement</Label>
                          <select className="w-full h-18 bg-white border-4 border-[#1f1610]/10 rounded-2xl px-8 font-black uppercase text-sm text-[#1f1610]" value={prodPlacement} onChange={e => setProdPlacement(e.target.value as any)}>
                              <option value="Hub">Root Hub</option>
                              <option value="Marketplace">Shooppy</option>
                          </select>
                        </div>
                      </div>
                   </div>
                   <div className="space-y-8">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label className="text-[#1f1610]">Level req.</Label>
                          <Input type="number" min={1} value={prodLevel} onChange={e => setProdLevel(Number(e.target.value))} className="h-18 font-black text-3xl text-center bg-white text-[#1f1610]" />
                        </div>
                        <div className="space-y-3">
                          <Label className="text-[#1f1610]">Price</Label>
                          <div className="relative">
                            <Coins className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-[#FFD700]" />
                            <Input type="number" min={0} value={prodPrice} onChange={e => setProdPrice(Number(e.target.value))} className="h-18 pl-12 font-black text-3xl text-center bg-white text-[#1f1610]" />
                          </div>
                        </div>
                      </div>
                      <Button onClick={handleSaveProduct} className="w-full h-24 rounded-full bg-[#1f1610] text-[#FFD700] font-black text-2xl uppercase shadow-2xl">Deploy Asset</Button>
                   </div>
                </div>
            </Card>
          </TabsContent>

          <TabsContent value="quizzo" className="space-y-12">
             <Card className="rounded-[5rem] border-8 border-[#FFD700]/10 bg-mocha-cream p-16 shadow-2xl space-y-10">
                <CardTitle className="text-4xl font-black uppercase flex items-center gap-6 italic text-[#1f1610]"><BookOpen className="h-12 w-12 text-[#FFD700]" /> Quizzo Protocol Architect</CardTitle>
                <div className="space-y-8">
                   <div className="space-y-3">
                      <Label className="text-[#1f1610]">Quiz Title</Label>
                      <Input placeholder="Mastery Test Phase 1" value={quizTitle} onChange={e => setQuizTitle(e.target.value)} className="h-18 font-black text-xl rounded-2xl bg-white text-[#1f1610]" />
                   </div>
                   
                   <div className="p-10 bg-[#1f1610]/5 rounded-[3rem] border-4 border-[#1f1610]/10 space-y-6">
                      <h4 className="font-black text-[#1f1610] uppercase">Question Constructor</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         <select className="h-18 bg-white border-4 border-[#1f1610]/10 rounded-2xl px-6 font-black uppercase text-[#1f1610]" value={qType} onChange={e => setQType(e.target.value as any)}>
                            <option value="multiple">Multiple Choice</option>
                            <option value="boolean">True/False</option>
                            <option value="id">ID Verification</option>
                         </select>
                         <Input placeholder="The question text..." value={qText} onChange={e => setQText(e.target.value)} className="h-18 md:col-span-2 bg-white text-[#1f1610] font-bold" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <Input placeholder="Correct Answer" value={qAnswer} onChange={e => setQAnswer(e.target.value)} className="h-18 bg-white text-[#1f1610]" />
                         {qType === 'multiple' && <Input placeholder="Options (comma separated)" value={qOptions} onChange={e => setQOptions(e.target.value)} className="h-18 bg-white text-[#1f1610]" />}
                      </div>
                      <Button onClick={handleAddQuestion} variant="outline" className="w-full h-18 rounded-2xl border-4 border-[#1f1610] text-[#1f1610] font-black uppercase">Inject Question ({quizQuestions.length})</Button>
                   </div>

                   <Button onClick={handleSaveQuiz} className="w-full h-24 rounded-full bg-[#1f1610] text-[#FFD700] font-black text-3xl uppercase shadow-2xl">Deploy Quiz Protocol</Button>
                </div>
             </Card>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {globalQuizzes.map((q: any) => (
                   <Card key={q.id} className="p-8 rounded-[3rem] border-4 border-[#FFD700]/10 bg-mocha-cream flex justify-between items-center">
                      <div>
                         <h4 className="font-black text-[#1f1610] uppercase italic line-clamp-1">{q.title}</h4>
                         <p className="text-[10px] font-black text-[#1f1610]/40 uppercase tracking-widest">{q.questionCount} Questions</p>
                      </div>
                      <Button variant="ghost" size="icon" className="text-red-500 rounded-full" onClick={() => handleDeleteDoc('quizzes', q.id)}><Trash2 className="h-6 w-6" /></Button>
                   </Card>
                ))}
             </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-12">
             <Card className="rounded-[5rem] border-8 border-[#FFD700]/10 bg-mocha-cream p-16 shadow-2xl space-y-10">
                <CardTitle className="text-4xl font-black uppercase flex items-center gap-6 italic text-[#1f1610]"><ListChecks className="h-12 w-12 text-[#FFD700]" /> Routine Protocol Updates</CardTitle>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
                   <div className="space-y-3">
                      <Label className="text-[#1f1610]">Target Day (1-30)</Label>
                      <Input type="number" min={1} max={30} value={taskDay} onChange={e => setTaskDay(Number(e.target.value))} className="h-18 font-black text-center text-3xl bg-white text-[#1f1610]" />
                   </div>
                   <div className="md:col-span-2 space-y-3">
                      <Label className="text-[#1f1610]">Task Headline</Label>
                      <Input placeholder="Define the strategy..." value={taskTitle} onChange={e => setTaskTitle(e.target.value)} className="h-18 bg-white text-[#1f1610] font-black text-xl" />
                   </div>
                   <div className="md:col-span-3 space-y-3">
                      <Label className="text-[#1f1610]">Execution Description</Label>
                      <Textarea placeholder="Step-by-step instructions..." value={taskDesc} onChange={e => setTaskDesc(e.target.value)} className="min-h-[120px] bg-white text-[#1f1610] rounded-[2rem] p-8" />
                   </div>
                   <Button onClick={handleSaveTask} className="md:col-span-3 w-full h-24 rounded-full bg-[#1f1610] text-[#FFD700] font-black text-3xl uppercase shadow-2xl">Inject Daily Task</Button>
                </div>
             </Card>

             <div className="space-y-6">
                {globalTasks.map((t: any) => (
                   <div key={t.id} className="p-8 bg-mocha-cream rounded-[3rem] border-4 border-[#FFD700]/10 flex items-center justify-between group">
                      <div className="flex items-center gap-8">
                         <div className="w-16 h-16 bg-[#1f1610] text-[#FFD700] rounded-2xl flex items-center justify-center font-black text-2xl italic">D{t.day}</div>
                         <div>
                            <h4 className="font-black text-[#1f1610] uppercase text-xl italic">{t.title}</h4>
                            <p className="text-xs font-bold text-[#1f1610]/40 line-clamp-1">{t.description}</p>
                         </div>
                      </div>
                      <Button variant="ghost" size="icon" className="text-red-500 rounded-full" onClick={() => handleDeleteDoc('tasks', t.id)}><Trash2 className="h-6 w-6" /></Button>
                   </div>
                ))}
             </div>
          </TabsContent>

          <TabsContent value="broadcast" className="space-y-12">
             <Card className="rounded-[5rem] border-8 border-[#FFD700]/10 bg-mocha-cream p-16 shadow-2xl space-y-12">
                <CardTitle className="text-4xl font-black uppercase flex items-center gap-6 italic text-[#1f1610]"><Newspaper className="h-12 w-12 text-[#FFD700]" /> Broadcast Center</CardTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                   <div className="space-y-8">
                      <div className="space-y-3">
                        <Label className="text-[#1f1610]">Headline</Label>
                        <Input placeholder="Broadcast Title" value={newsTitle} onChange={e => setNewsTitle(e.target.value)} className="h-18 font-black text-xl rounded-2xl bg-white text-[#1f1610]" />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[#1f1610]">Narrative</Label>
                        <Textarea placeholder="Announcement details..." value={newsContent} onChange={e => setNewsContent(e.target.value)} className="min-h-[200px] rounded-[3rem] p-10 bg-white text-[#1f1610]" />
                      </div>
                      <Button onClick={handleDispatchBroadcast} className="w-full h-24 rounded-full bg-[#1f1610] text-[#FFD700] font-black text-3xl uppercase shadow-2xl">Dispatch</Button>
                   </div>
                   <div className="space-y-6">
                      {newsPosts.map((p: any) => (
                        <div key={p.id} className="p-6 bg-white rounded-3xl flex justify-between items-center shadow-lg border-2 border-[#1f1610]/10">
                           <p className="font-black text-xs uppercase truncate flex-1 mr-6 italic text-[#1f1610]">{p.title}</p>
                           <Button variant="ghost" size="icon" className="text-red-500 rounded-full" onClick={() => handleDeleteDoc('newsPosts', p.id)}><Trash2 className="h-5 w-5" /></Button>
                        </div>
                      ))}
                   </div>
                </div>
             </Card>
          </TabsContent>

          <TabsContent value="moderation" className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <Card className="rounded-[4rem] border-4 border-[#FFD700]/20 bg-mocha-cream p-12 shadow-2xl">
                 <CardTitle className="text-3xl font-black uppercase mb-10 text-[#1f1610]">Strategist Wins</CardTitle>
                 <div className="space-y-6 max-h-[600px] overflow-y-auto pr-4 scrollbar-hide">
                   {activityWall.map((p: any) => (
                     <div key={p.id} className="p-8 bg-white/50 rounded-[3rem] border-2 border-[#1f1610]/10 flex justify-between items-center">
                       <div>
                         <p className="font-black text-[#1f1610] uppercase text-sm">@{p.nickname}</p>
                         <p className="text-xs font-bold text-[#1f1610]/40 mt-1 line-clamp-1">{p.description}</p>
                       </div>
                       <Button variant="ghost" size="icon" className="text-red-500 rounded-full" onClick={() => handleDeleteDoc('activityWall', p.id)}><Trash2 className="h-6 w-6" /></Button>
                     </div>
                   ))}
                 </div>
              </Card>

              <Card className="rounded-[4rem] border-4 border-[#FFD700]/20 bg-mocha-cream p-12 shadow-2xl">
                 <CardTitle className="text-3xl font-black uppercase mb-10 text-[#1f1610]">Resources</CardTitle>
                 <div className="space-y-6 max-h-[600px] overflow-y-auto pr-4 scrollbar-hide">
                   {sharedResources.map((r: any) => (
                     <div key={r.id} className="p-8 bg-white/50 rounded-[3rem] border-2 border-[#1f1610]/10 flex justify-between items-center">
                       <div>
                         <p className="font-black text-[#1f1610] uppercase text-sm">{r.title}</p>
                         <p className="text-[10px] font-bold text-[#1f1610]/40 mt-1 uppercase">By @{r.nickname}</p>
                       </div>
                       <Button variant="ghost" size="icon" className="text-red-500 rounded-full" onClick={() => handleDeleteDoc('resources', r.id)}><Trash2 className="h-6 w-6" /></Button>
                     </div>
                   ))}
                 </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-12">
             <Card className="rounded-[4rem] border-8 border-[#FFD700]/10 bg-mocha-cream p-12 shadow-2xl space-y-10">
                <CardTitle className="text-3xl font-black uppercase flex items-center gap-5 italic text-[#1f1610]"><HelpCircle className="h-10 w-10 text-[#FFD700]" /> FAQ Engine</CardTitle>
                <div className="space-y-6">
                   <Input placeholder="Inquiry Question" value={faqQ} onChange={e => setFaqQ(e.target.value)} className="h-16 rounded-2xl bg-white text-[#1f1610]" />
                   <Textarea placeholder="Protocol Response" value={faqA} onChange={e => setFaqA(e.target.value)} className="min-h-[120px] rounded-3xl bg-white text-[#1f1610]" />
                   <Button onClick={() => addDoc(collection(db, 'faqs'), { question: faqQ, answer: faqA }).then(() => { setFaqQ(""); setFaqA(""); toast({ title: "FAQ Injected" }); })} className="w-full h-18 rounded-2xl bg-[#1f1610] text-[#FFD700] font-black uppercase text-sm">Inject FAQ</Button>
                </div>
                <div className="space-y-4">
                  {faqs.map((f: any) => (
                     <div key={f.id} className="p-6 bg-white/50 rounded-2xl flex justify-between items-center border-2 border-[#1f1610]/10">
                        <p className="font-black text-xs uppercase italic text-[#1f1610]">{f.question}</p>
                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteDoc('faqs', f.id)}><Trash2 className="h-5 w-5" /></Button>
                     </div>
                  ))}
                </div>
             </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
