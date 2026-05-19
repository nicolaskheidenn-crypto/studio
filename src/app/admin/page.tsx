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
import { useState, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { Key, ShieldAlert, Plus, Trash2, Award, BookOpen, CheckSquare, Newspaper, ShoppingBag, Users, MessageSquare, Lightbulb, Video, HelpCircle } from "lucide-react";

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

  // Quiz State
  const [quizTitle, setQuizTitle] = useState("");

  if (user?.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fdfaf6] p-6 text-center">
        <ShieldAlert className="h-24 w-24 mb-6 text-primary" />
        <h1 className="text-4xl font-headline font-black uppercase text-foreground">Host Terminal Locked</h1>
        <Button className="mt-8 rounded-full h-16 px-12 bg-foreground text-white font-black" asChild><a href="/">Return to Gate</a></Button>
      </div>
    );
  }

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
    toast({ title: "Product Deployed" });
  };

  const handleBroadcast = () => {
    addNewsPost({ title: newsTitle, content: newsContent, imageUrl: newsImg });
    setNewsTitle(""); setNewsContent(""); setNewsImg("");
    toast({ title: "Broadcast Dispatched" });
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfaf6] p-4">
        <Card className="w-full max-w-md p-10 bg-white rounded-[3.5rem] shadow-2xl border-4 border-foreground/5">
          <CardHeader className="text-center space-y-6">
            <Key className="h-12 w-12 text-primary mx-auto" />
            <CardTitle className="text-4xl font-headline font-black uppercase">Verify Host</CardTitle>
          </CardHeader>
          <CardContent className="mt-6">
            <form onSubmit={handleAuthorize} className="space-y-8">
              <Input type="password" placeholder="Protocol Key" className="h-20 text-center text-3xl font-mono rounded-3xl" value={adminKey} onChange={(e) => setAdminKey(e.target.value)} />
              <Button type="submit" className="w-full h-20 rounded-[2rem] font-black text-2xl bg-foreground text-white shadow-xl">AUTHENTICATE</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfaf6]">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-6xl">
        <h1 className="text-6xl font-headline font-black text-foreground uppercase tracking-tighter mb-12">Host Command</h1>

        <Tabs defaultValue="moderation" className="space-y-10">
          <TabsList className="bg-white p-2 rounded-full w-fit shadow-xl border border-foreground/5 overflow-x-auto scrollbar-hide">
            <TabsTrigger value="moderation" className="rounded-full px-8 h-12 text-[10px] font-black uppercase tracking-widest">Moderation</TabsTrigger>
            <TabsTrigger value="content" className="rounded-full px-8 h-12 text-[10px] font-black uppercase tracking-widest">Assets</TabsTrigger>
            <TabsTrigger value="broadcast" className="rounded-full px-8 h-12 text-[10px] font-black uppercase tracking-widest">Broadcast</TabsTrigger>
            <TabsTrigger value="users" className="rounded-full px-8 h-12 text-[10px] font-black uppercase tracking-widest">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="moderation" className="space-y-8">
            <Card className="rounded-[3rem] border-foreground/5 bg-white p-12 shadow-xl">
               <CardTitle className="text-3xl font-black uppercase mb-8 flex items-center gap-4"><MessageSquare className="h-8 w-8 text-primary" /> Active Moderation</CardTitle>
               <div className="space-y-6">
                 {activityWall.length === 0 ? <p className="text-foreground/40 italic font-medium">No community posts active.</p> : activityWall.map(p => (
                   <div key={p.id} className="p-6 bg-secondary/20 rounded-3xl border border-foreground/5 flex justify-between items-center">
                     <div>
                       <p className="font-black text-foreground uppercase text-xs">@{p.nickname}</p>
                       <p className="text-xs font-medium text-foreground/60">{p.description}</p>
                     </div>
                     <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => deletePost(p.id)}><Trash2 className="h-5 w-5" /></Button>
                   </div>
                 ))}
               </div>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* Shooppy Manager */}
               <Card className="rounded-[3rem] border-foreground/5 bg-white p-12 shadow-xl space-y-8">
                  <CardTitle className="text-2xl font-black uppercase flex items-center gap-4"><ShoppingBag className="h-6 w-6 text-primary" /> Shooppy Catalog</CardTitle>
                  <div className="space-y-4">
                     <Input placeholder="Asset Name" value={prodTitle} onChange={e => setProdTitle(e.target.value)} />
                     <Textarea placeholder="Asset Description" value={prodDesc} onChange={e => setProdDesc(e.target.value)} />
                     <select className="w-full h-12 bg-secondary/20 border-none rounded-xl px-4 font-black uppercase text-xs" value={prodType} onChange={e => setProdType(e.target.value as any)}>
                        <option value="eBook">E-Book</option>
                        <option value="Template">Template</option>
                        <option value="Bundle">Bundle</option>
                     </select>
                     <div>
                       <Label>Cover Photo</Label>
                       <Input type="file" onChange={e => handleFileUpload(e, setProdImg)} className="mt-2" />
                     </div>
                     <div>
                       <Label>Digital File (PDF/ZIP)</Label>
                       <Input type="file" onChange={e => handleFileUpload(e, setProdFile)} className="mt-2" />
                     </div>
                     <Button onClick={handleSaveProduct} className="w-full h-16 rounded-full bg-foreground text-white font-black uppercase text-xs">Deploy Asset</Button>
                  </div>
               </Card>

               {/* Task Injector */}
               <Card className="rounded-[3rem] border-foreground/5 bg-white p-12 shadow-xl space-y-8">
                  <CardTitle className="text-2xl font-black uppercase flex items-center gap-4"><CheckSquare className="h-6 w-6 text-primary" /> TaskDo Injector</CardTitle>
                  <div className="space-y-4">
                     <div className="flex gap-4 items-center">
                        <Label>Target Day:</Label>
                        <Input type="number" min={1} max={7} value={taskDay} onChange={e => setTaskDay(Number(e.target.value))} className="w-20" />
                     </div>
                     <div className="space-y-2">
                        <Input placeholder="Task 1 Title" value={task1T} onChange={e => setTask1T(e.target.value)} />
                        <Input placeholder="Task 1 Description" value={task1D} onChange={e => setTask1D(e.target.value)} />
                     </div>
                     <div className="space-y-2">
                        <Input placeholder="Task 2 Title" value={task2T} onChange={e => setTask2T(e.target.value)} />
                        <Input placeholder="Task 2 Description" value={task2D} onChange={e => setTask2D(e.target.value)} />
                     </div>
                     <div className="space-y-2">
                        <Input placeholder="Task 3 Title" value={task3T} onChange={e => setTask3T(e.target.value)} />
                        <Input placeholder="Task 3 Description" value={task3D} onChange={e => setTask3D(e.target.value)} />
                     </div>
                     <Button onClick={handleSaveTasks} className="w-full h-16 rounded-full bg-primary text-foreground font-black uppercase text-xs">Inject Routine</Button>
                  </div>
               </Card>
            </div>
          </TabsContent>

          <TabsContent value="broadcast" className="space-y-8">
             <Card className="rounded-[3.5rem] border-foreground/5 bg-white p-12 shadow-xl space-y-8">
                <CardTitle className="text-3xl font-black uppercase flex items-center gap-4"><Newspaper className="h-8 w-8 text-primary" /> Broadcast Center</CardTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div className="space-y-6">
                      <Input placeholder="Broadcast Title" value={newsTitle} onChange={e => setNewsTitle(e.target.value)} />
                      <Textarea placeholder="Broadcast Content" value={newsContent} onChange={e => setNewsContent(e.target.value)} className="min-h-[200px]" />
                      <div>
                        <Label>Attachment Photo</Label>
                        <Input type="file" onChange={e => handleFileUpload(e, setNewsImg)} className="mt-2" />
                      </div>
                      <Button onClick={handleBroadcast} className="w-full h-20 rounded-full bg-foreground text-white font-black text-2xl uppercase">Dispatch Broadcast</Button>
                   </div>
                   <div className="p-8 bg-secondary/20 rounded-[3rem] border-4 border-dashed border-foreground/5 space-y-6">
                      <h4 className="font-black text-foreground/40 uppercase text-xs text-center">Active Broadcasts</h4>
                      {newsPosts.map(p => (
                        <div key={p.id} className="p-4 bg-white rounded-2xl flex justify-between items-center shadow-sm">
                           <p className="font-black text-[10px] uppercase truncate flex-1 mr-4">{p.title}</p>
                           <Button variant="ghost" size="icon" className="text-red-500" onClick={() => deleteNewsPost(p.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      ))}
                   </div>
                </div>
             </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-8">
             <Card className="rounded-[3.5rem] border-foreground/5 bg-white p-12 shadow-xl">
                <CardTitle className="text-3xl font-black uppercase mb-8 flex items-center gap-4"><Users className="h-8 w-8 text-primary" /> Strategist Monitor</CardTitle>
                <div className="p-8 bg-secondary/10 rounded-[3rem] space-y-10">
                   <div className="flex justify-between items-center border-b border-foreground/10 pb-8">
                      <div>
                         <p className="font-black text-foreground text-2xl uppercase tracking-tighter">Identity: Succemazing (Demo)</p>
                         <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Global Protocol Monitoring Active</p>
                      </div>
                      <div className="flex gap-4">
                         <Button onClick={() => { updateSpecificUser({ streak: 0 }); toast({ title: "Protocol Reset" }); }} variant="destructive" className="rounded-full h-12 px-8 font-black uppercase text-xs">Reset Streak</Button>
                         <Button onClick={resetUserStats} variant="outline" className="rounded-full h-12 px-8 font-black uppercase text-xs border-2 border-foreground">Zero Stats</Button>
                      </div>
                   </div>
                </div>
             </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
