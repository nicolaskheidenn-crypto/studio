"use client";

import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminStore } from "@/lib/store";
import { useUser } from "@/firebase";
import { useState, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, ShieldAlert, Key, ShoppingBag, Image as ImageIcon, ShieldCheck, Save, Newspaper, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminPage() {
  const { user } = useUser();
  const [adminKey, setAdminKey] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { 
    dailyTasks, addTasks, deleteTask, 
    shooppyProducts, addProduct, deleteProduct, 
    newsPosts, addNewsPost, deleteNewsPost,
    sovereigntyTitle, sovereigntySections, updateSovereignty
  } = useAdminStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<'news' | 'product' | null>(null);

  // TaskDo state
  const [taskDay, setTaskDay] = useState(1);
  const [tasks, setTasks] = useState([
    { title: "", description: "" },
    { title: "", description: "" },
    { title: "", description: "" }
  ]);

  // Shooppy state
  const [pTitle, setPTitle] = useState("");
  const [pDesc, setPDesc] = useState("");
  const [pImg, setPImg] = useState("");
  const [pLink, setPLink] = useState("");
  const [pType, setPType] = useState<'Bundle' | 'Template' | 'eBook'>('eBook');
  const [pPrice, setPPrice] = useState("");

  // Newsfeed state
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postImg, setPostImg] = useState("");

  // Sovereignty state
  const [sovTitle, setSovTitle] = useState(sovereigntyTitle);
  const [sovSections, setSovSections] = useState(sovereigntySections);

  const ADMIN_EMAIL = "nicolaskheidenn@gmail.com";
  const ADMIN_SECRET_KEY = "2878-2171-2489-2341";

  if (user?.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-white p-6">
        <ShieldAlert className="h-24 w-24 mb-6 text-primary" />
        <h1 className="text-4xl font-headline font-bold">Unauthorized Access</h1>
        <p className="mt-4 text-primary/60 text-center max-w-md uppercase tracking-widest text-xs font-black">This high-security terminal is reserved for the Host.</p>
        <Button className="mt-12 rounded-full h-16 px-12 text-xl font-bold bg-primary text-background shadow-2xl" asChild><a href="/">Return to Hub</a></Button>
      </div>
    );
  }

  const handleAuthorize = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminKey === ADMIN_SECRET_KEY) {
      setIsAuthorized(true);
      toast({ title: "Identity Verified", description: "Welcome back, Host." });
    } else {
      toast({ title: "Invalid Key", variant: "destructive", description: "Authorization failed." });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (uploadTarget === 'news') setPostImg(base64);
        if (uploadTarget === 'product') setPImg(base64);
        toast({ title: "Digital Asset Injected" });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveTasks = () => {
    if (tasks.some(t => !t.title)) {
      toast({ title: "Incomplete Routine", variant: "destructive", description: "Each day must have 3 tasks." });
      return;
    }
    addTasks(taskDay, tasks);
    toast({ title: "TaskDo Injected", description: `Day ${taskDay} routine updated.` });
  };

  const handleAddProduct = () => {
    if (!pTitle || !pLink) return;
    addProduct({ title: pTitle, description: pDesc, imageUrl: pImg, shopLink: pLink, type: pType, price: pPrice });
    toast({ title: "Shooppy Asset Added" });
    setPTitle(""); setPDesc(""); setPImg(""); setPLink(""); setPPrice("");
  };

  const handleAddPost = () => {
    if (!postTitle || !postContent) return;
    addNewsPost({ title: postTitle, content: postContent, imageUrl: postImg });
    toast({ title: "Broadcast Dispatched" });
    setPostTitle(""); setPostContent(""); setPostImg("");
  };

  const handleSaveSovereignty = () => {
    updateSovereignty(sovTitle, sovSections);
    toast({ title: "Sovereignty Updated" });
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md p-10 bg-card rounded-[3.5rem] shadow-2xl border-4 border-primary/20">
          <CardHeader className="text-center space-y-6">
            <div className="p-6 bg-primary/10 rounded-[2rem] w-fit mx-auto">
              <Key className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-4xl font-headline font-bold">Host Verification</CardTitle>
          </CardHeader>
          <CardContent className="mt-6">
            <form onSubmit={handleAuthorize} className="space-y-8">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-primary/60 ml-2">Secure Code</Label>
                <Input 
                  type="password" 
                  placeholder="0000-0000-0000-0000" 
                  className="h-20 text-center text-3xl font-mono tracking-widest rounded-3xl border-2 border-primary/20"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full h-20 rounded-[2rem] font-black text-2xl bg-primary text-background shadow-xl">
                Verify Identity
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-6xl">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-6xl font-headline font-black text-white uppercase tracking-tighter">Host Terminal</h1>
          <Badge className="bg-primary text-background h-10 px-6 rounded-full text-lg font-bold">Sovereign Active</Badge>
        </div>

        <Tabs defaultValue="tasks" className="space-y-10">
          <TabsList className="bg-secondary/40 p-2 rounded-full w-fit shadow-xl border border-primary/10 overflow-x-auto">
            <TabsTrigger value="tasks" className="rounded-full px-8 h-12 text-[10px] font-black uppercase tracking-widest">Inject TaskDo</TabsTrigger>
            <TabsTrigger value="newsfeed" className="rounded-full px-8 h-12 text-[10px] font-black uppercase tracking-widest">Broadcast News</TabsTrigger>
            <TabsTrigger value="shooppy" className="rounded-full px-8 h-12 text-[10px] font-black uppercase tracking-widest">Shooppy Manager</TabsTrigger>
            <TabsTrigger value="sovereignty" className="rounded-full px-8 h-12 text-[10px] font-black uppercase tracking-widest">Legal Editor</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-8 animate-in fade-in slide-in-from-bottom-5">
            <Card className="rounded-[3rem] border-primary/10 shadow-2xl overflow-hidden bg-secondary/20">
              <CardHeader className="bg-primary p-10 text-background">
                <CardTitle className="text-3xl font-black uppercase">Inject TaskDo</CardTitle>
                <CardDescription className="text-background/70 font-bold uppercase tracking-widest text-[10px]">Define the 3 daily tasks for your strategists.</CardDescription>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                <div className="space-y-4 max-w-xs">
                  <Label className="font-black text-primary uppercase text-xs tracking-widest">Execution Day</Label>
                  <Input type="number" value={taskDay} onChange={e => setTaskDay(parseInt(e.target.value))} className="h-16 rounded-2xl text-2xl font-black" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[0, 1, 2].map(idx => (
                    <div key={idx} className="p-8 bg-background/40 rounded-[2.5rem] border-2 border-primary/10 space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary text-background rounded-full flex items-center justify-center font-black">T{idx + 1}</div>
                        <h4 className="font-black text-white uppercase tracking-tight">Task {idx + 1}</h4>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="font-black text-primary/60 uppercase text-[9px] tracking-widest">Objective</Label>
                          <Input value={tasks[idx].title} onChange={e => {
                            const n = [...tasks]; n[idx].title = e.target.value; setTasks(n);
                          }} className="h-12" />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-black text-primary/60 uppercase text-[9px] tracking-widest">Description</Label>
                          <Textarea value={tasks[idx].description} onChange={e => {
                            const n = [...tasks]; n[idx].description = e.target.value; setTasks(n);
                          }} className="min-h-[100px]" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button onClick={handleSaveTasks} className="w-full h-20 rounded-full bg-primary text-background font-black text-2xl shadow-xl hover:scale-[1.01] transition-transform">
                  <Plus className="mr-3" /> Save Day {taskDay} Routine
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {dailyTasks.map(t => (
                <div key={t.id} className="p-6 border-2 border-primary/10 rounded-[2rem] bg-secondary/10 flex items-center justify-between">
                  <div>
                    <Badge className="bg-primary/20 text-primary text-[9px] font-black mb-2">DAY {t.day}</Badge>
                    <h4 className="font-bold text-white uppercase tracking-tight">{t.title}</h4>
                    <p className="text-[10px] text-primary/60 line-clamp-1">{t.description}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full text-red-500" onClick={() => deleteTask(t.id)}>
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="newsfeed" className="space-y-8 animate-in fade-in slide-in-from-bottom-5">
            <Card className="rounded-[3rem] border-primary/10 shadow-2xl overflow-hidden bg-secondary/20">
              <CardHeader className="bg-primary p-10 text-background">
                <CardTitle className="text-3xl font-black uppercase flex items-center gap-4"><Newspaper className="h-8 w-8" /> Broadcast News</CardTitle>
                <CardDescription className="text-background/70 font-bold uppercase tracking-widest text-[10px]">Update the Sovereign Newsfeed for all strategists.</CardDescription>
              </CardHeader>
              <CardContent className="p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="font-black text-primary/60 uppercase text-[9px] tracking-widest ml-1">Title</Label>
                      <Input value={postTitle} onChange={e => setPostTitle(e.target.value)} placeholder="System Update" className="h-14 font-black" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-black text-primary/60 uppercase text-[9px] tracking-widest ml-1">Asset Cover</Label>
                      <div className="flex gap-4">
                        <Button 
                          onClick={() => { setUploadTarget('news'); fileInputRef.current?.click(); }}
                          className="h-14 bg-secondary/40 border-2 border-primary/20 text-primary font-black px-6"
                        >
                          <Upload className="h-4 w-4 mr-2" /> Select File
                        </Button>
                        {postImg && <div className="h-14 w-14 rounded-xl border-2 border-primary overflow-hidden"><img src={postImg} className="w-full h-full object-cover" /></div>}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-black text-primary/60 uppercase text-[9px] tracking-widest ml-1">Message Body</Label>
                    <Textarea value={postContent} onChange={e => setPostContent(e.target.value)} placeholder="Write the announcement..." className="min-h-[160px] font-medium" />
                  </div>
                </div>
                <Button onClick={handleAddPost} className="w-full h-20 rounded-full bg-primary text-background font-black text-2xl shadow-xl">
                  Dispatch Broadcast
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {newsPosts.map(p => (
                <div key={p.id} className="p-6 bg-secondary/10 rounded-3xl border-2 border-primary/10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {p.imageUrl && <img src={p.imageUrl} className="w-16 h-16 rounded-xl object-cover border border-primary/20" />}
                    <div>
                      <h4 className="font-black text-white uppercase tracking-tight">{p.title}</h4>
                      <p className="text-[10px] text-primary/60 line-clamp-1">{p.content}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-red-500" onClick={() => deleteNewsPost(p.id)}><Trash2 className="h-5 w-5" /></Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="shooppy" className="space-y-8 animate-in fade-in slide-in-from-bottom-5">
            <Card className="rounded-[3rem] border-primary/10 shadow-2xl overflow-hidden bg-secondary/20">
              <CardHeader className="bg-primary p-10 text-background">
                <CardTitle className="text-3xl font-black uppercase flex items-center gap-4"><ShoppingBag className="h-8 w-8" /> Shooppy Manager</CardTitle>
                <CardDescription className="text-background/70 font-bold uppercase tracking-widest text-[10px]">Manage Bundles, Templates, and eBooks.</CardDescription>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="font-black text-primary/60 uppercase text-[9px] tracking-widest ml-1">Asset Title</Label>
                      <Input value={pTitle} onChange={e => setPTitle(e.target.value)} placeholder="Master Bundle v2" className="h-14 font-black" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-black text-primary/60 uppercase text-[9px] tracking-widest ml-1">Category</Label>
                      <select className="w-full h-14 bg-secondary/40 border-2 border-primary/20 rounded-2xl px-6 font-black text-primary uppercase" value={pType} onChange={e => setPType(e.target.value as any)}>
                        <option value="eBook">eBook</option>
                        <option value="Bundle">Bundle</option>
                        <option value="Template">Template</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-black text-primary/60 uppercase text-[9px] tracking-widest ml-1">Price/Label</Label>
                      <Input value={pPrice} onChange={e => setPPrice(e.target.value)} placeholder="$99 or FREE" className="h-14 font-black" />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="font-black text-primary/60 uppercase text-[9px] tracking-widest ml-1">Asset Image</Label>
                      <div className="flex gap-4">
                        <Button 
                          onClick={() => { setUploadTarget('product'); fileInputRef.current?.click(); }}
                          className="h-14 bg-secondary/40 border-2 border-primary/20 text-primary font-black px-6"
                        >
                          <Upload className="h-4 w-4 mr-2" /> Select File
                        </Button>
                        {pImg && <div className="h-14 w-14 rounded-xl border-2 border-primary overflow-hidden"><img src={pImg} className="w-full h-full object-cover" /></div>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-black text-primary/60 uppercase text-[9px] tracking-widest ml-1">Checkout Link</Label>
                      <Input value={pLink} onChange={e => setPLink(e.target.value)} placeholder="https://..." className="h-14 font-black" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-black text-primary/60 uppercase text-[9px] tracking-widest ml-1">Short Bio</Label>
                      <Input value={pDesc} onChange={e => setPDesc(e.target.value)} placeholder="Unlocking the core..." className="h-14 font-black" />
                    </div>
                  </div>
                </div>
                <Button onClick={handleAddProduct} className="w-full h-20 rounded-full bg-primary text-background font-black text-2xl shadow-xl">
                  Deploy to Shooppy Hub
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {shooppyProducts.map(p => (
                <Card key={p.id} className="rounded-[2.5rem] overflow-hidden bg-secondary/10 border-2 border-primary/10 group">
                  <div className="h-48 bg-background relative overflow-hidden">
                    {p.imageUrl && <img src={p.imageUrl} className="w-full h-full object-cover" />}
                    <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 rounded-full" onClick={() => deleteProduct(p.id)}>
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="p-6 space-y-4">
                    <Badge className="bg-primary text-background font-black text-[9px] uppercase">{p.type}</Badge>
                    <h4 className="font-black text-white uppercase tracking-tight">{p.title}</h4>
                    <p className="text-[10px] text-primary/60 font-black tracking-tight">{p.price || "FREE"}</p>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sovereignty" className="space-y-8 animate-in fade-in slide-in-from-bottom-5">
            <Card className="rounded-[3rem] border-primary/10 shadow-2xl overflow-hidden bg-secondary/20">
              <CardHeader className="bg-primary p-10 text-background">
                <CardTitle className="text-3xl font-black uppercase flex items-center gap-4"><ShieldCheck className="h-8 w-8" /> Sovereignty Editor</CardTitle>
                <CardDescription className="text-background/70 font-bold uppercase tracking-widest text-[10px]">Update your business sovereignty clauses and brand root.</CardDescription>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                <div className="space-y-4">
                  <Label className="font-black text-primary/60 uppercase text-[9px] tracking-widest ml-1">Main Heading</Label>
                  <Input value={sovTitle} onChange={e => setSovTitle(e.target.value)} className="h-16 font-black text-2xl" />
                </div>
                
                <div className="space-y-8">
                  {sovSections.map((s, idx) => (
                    <div key={idx} className="p-10 bg-background/40 rounded-[2.5rem] border-2 border-primary/10 space-y-6">
                      <div className="flex items-center justify-between">
                        <Badge className="bg-primary text-background font-black text-[9px] uppercase px-4">Clause {idx + 1}</Badge>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="font-black text-primary/60 uppercase text-[9px] tracking-widest ml-1">Subject</Label>
                          <Input value={s.title} onChange={e => {
                            const n = [...sovSections]; n[idx].title = e.target.value; setSovSections(n);
                          }} className="h-12 font-black" />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-black text-primary/60 uppercase text-[9px] tracking-widest ml-1">Content</Label>
                          <Textarea value={s.content} onChange={e => {
                            const n = [...sovSections]; n[idx].content = e.target.value; setSovSections(n);
                          }} className="min-h-[120px]" />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full h-14 rounded-2xl border-dashed border-2 border-primary/20 text-primary font-black uppercase tracking-widest text-xs" onClick={() => setSovSections([...sovSections, { id: Math.random().toString(), title: "", content: "" }])}>
                    <Plus className="mr-2 h-4 w-4" /> Add Sovereignty Clause
                  </Button>
                </div>

                <Button onClick={handleSaveSovereignty} className="w-full h-20 rounded-full bg-primary text-background font-black text-2xl shadow-xl">
                  <Save className="mr-3" /> Update Sovereignty Hub
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
