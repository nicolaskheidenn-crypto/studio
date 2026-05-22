
"use client";

import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserStore, QuizQuestion, Quiz, ShooppyProduct } from "@/lib/store";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { useState, useMemo } from "react";
import { toast } from "@/hooks/use-toast";
import { 
  Key, ShieldAlert, Trash2, Award, BookOpen, CheckSquare, 
  Newspaper, ShoppingBag, MessageSquare, Lightbulb, 
  Video, HelpCircle, Upload, Plus, MoveUp, MoveDown, CheckCircle2, Edit3, Coins 
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

  const { data: shooppyProducts } = useCollection(productsQuery);
  const { data: newsPosts } = useCollection(newsQuery);
  const { data: faqs } = useCollection(faqsQuery);
  const { data: activityWall } = useCollection(activityQuery);
  const { data: sharedResources } = useCollection(resourcesQuery);

  const { resetUserStats, updateSpecificUser } = useUserStore();

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

  const handleDeleteProduct = async (id: string) => {
    await deleteDoc(doc(db, 'shooppyProducts', id));
    toast({ title: "Asset Decommissioned" });
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

  const handleDeleteBroadcast = async (id: string) => {
    await deleteDoc(doc(db, 'newsPosts', id));
    toast({ title: "Broadcast Purged" });
  };

  const handleAddFAQ = async () => {
    await addDoc(collection(db, 'faqs'), {
      question: faqQ,
      answer: faqA
    });
    setFaqQ(""); setFaqA("");
    toast({ title: "FAQ Injected" });
  };

  const handleDeleteFAQ = async (id: string) => {
    await deleteDoc(doc(db, 'faqs', id));
    toast({ title: "FAQ Purged" });
  };

  const handleDeletePost = async (id: string) => {
    await deleteDoc(doc(db, 'activityWall', id));
    toast({ title: "Win Purged" });
  };

  const handleDeleteResource = async (id: string) => {
    await deleteDoc(doc(db, 'resources', id));
    toast({ title: "Resource Decommissioned" });
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
            <TabsTrigger value="assets" className="rounded-full px-12 h-14 text-[11px] font-black uppercase tracking-widest text-[#1f1610]">Digital Assets</TabsTrigger>
            <TabsTrigger value="moderation" className="rounded-full px-12 h-14 text-[11px] font-black uppercase tracking-widest text-[#1f1610]">Moderation</TabsTrigger>
            <TabsTrigger value="broadcast" className="rounded-full px-12 h-14 text-[11px] font-black uppercase tracking-widest text-[#1f1610]">Broadcast</TabsTrigger>
            <TabsTrigger value="system" className="rounded-full px-12 h-14 text-[11px] font-black uppercase tracking-widest text-[#1f1610]">System</TabsTrigger>
          </TabsList>

          <TabsContent value="assets" className="space-y-12">
            <Card className="rounded-[5rem] border-8 border-[#FFD700]/10 bg-mocha-cream p-16 shadow-2xl space-y-12">
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
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label className="text-[#1f1610]">Category</Label>
                          <select className="w-full h-18 bg-white border-4 border-[#1f1610]/10 rounded-2xl px-8 font-black uppercase text-sm text-[#1f1610]" value={prodType} onChange={e => setProdType(e.target.value as any)}>
                              <option value="eBook">Sovereign E-Book</option>
                              <option value="Template">Execution Template</option>
                              <option value="Bundle">Strategy Bundle</option>
                          </select>
                        </div>
                        <div className="space-y-3">
                          <Label className="text-[#1f1610]">Placement</Label>
                          <select className="w-full h-18 bg-white border-4 border-[#1f1610]/10 rounded-2xl px-8 font-black uppercase text-sm text-[#1f1610]" value={prodPlacement} onChange={e => setProdPlacement(e.target.value as any)}>
                              <option value="Hub">Root (Hub Sidebar)</option>
                              <option value="Marketplace">Shooppy (Marketplace)</option>
                          </select>
                        </div>
                      </div>
                   </div>
                   <div className="space-y-8">
                      <div className="p-10 bg-white/50 rounded-[3rem] border-4 border-dashed border-[#FFD700]/20 text-center space-y-6">
                        <Upload className="h-12 w-12 mx-auto text-[#FFD700]" />
                        <div className="space-y-4">
                           <div className="space-y-2">
                             <Label className="text-[#1f1610]">Cover Photo</Label>
                             <Input type="file" onChange={e => handleFileUpload(e, setProdImg)} className="h-14 bg-white text-[#1f1610]" />
                           </div>
                           <div className="space-y-2">
                             <Label className="text-[#1f1610]">Asset File</Label>
                             <Input type="file" onChange={e => handleFileUpload(e, setProdFile)} className="h-14 bg-white text-[#1f1610]" />
                           </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label className="text-[#1f1610]">Mastery Level</Label>
                          <Input type="number" min={1} value={prodLevel} onChange={e => setProdLevel(Number(e.target.value))} className="h-18 font-black text-3xl text-center bg-white text-[#1f1610] border-[#1f1610]/20" />
                        </div>
                        <div className="space-y-3">
                          <Label className="text-[#1f1610]">Point Price</Label>
                          <div className="relative">
                            <Coins className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-[#FFD700] pointer-events-none" />
                            <Input type="number" min={0} value={prodPrice} onChange={e => setProdPrice(Number(e.target.value))} className="h-18 pl-12 font-black text-3xl text-center bg-white text-[#1f1610] border-[#1f1610]/20" />
                          </div>
                        </div>
                      </div>
                      <Button onClick={handleSaveProduct} className="w-full h-24 rounded-full bg-[#1f1610] text-[#FFD700] font-black text-2xl uppercase shadow-2xl hover:bg-[#FFD700] hover:text-[#1f1610] transition-all">
                        {editingProductId ? 'Update Strategic Asset' : 'Deploy Asset'}
                      </Button>
                   </div>
                </div>
            </Card>

            <Card className="rounded-[4rem] border-8 border-[#FFD700]/10 bg-mocha-cream p-12 shadow-2xl mt-12">
              <CardTitle className="text-3xl font-black uppercase mb-10 flex items-center gap-5 text-[#1f1610]"><ShoppingBag className="h-10 w-10 text-[#FFD700]" /> Deployed Assets</CardTitle>
              <div className="space-y-6">
                 {shooppyProducts.map((p: any, i: number) => (
                   <div key={p.id} className="p-8 bg-white rounded-[3rem] border-4 border-[#1f1610]/5 flex items-center justify-between group">
                      <div className="flex items-center gap-6 flex-1">
                         <div className="w-16 h-16 bg-[#1f1610] text-[#FFD700] rounded-2xl flex items-center justify-center font-black text-2xl">{i + 1}</div>
                         <div>
                            <h4 className="font-black text-[#1f1610] uppercase text-xl italic">{p.title}</h4>
                            <p className="text-[10px] font-bold text-[#1f1610]/60 uppercase tracking-widest">{p.type} • {p.placement} • {p.price} Points</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-4">
                         <Button variant="ghost" size="icon" className="rounded-full hover:bg-red-50 text-red-500" onClick={() => handleDeleteProduct(p.id)}><Trash2 className="h-6 w-6" /></Button>
                      </div>
                   </div>
                 ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="moderation" className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <Card className="rounded-[4rem] border-4 border-[#FFD700]/20 bg-mocha-cream p-12 shadow-2xl">
                 <CardTitle className="text-3xl font-black uppercase mb-10 flex items-center gap-4 text-[#1f1610]"><MessageSquare className="h-10 w-10 text-[#FFD700]" /> Strategist Wins</CardTitle>
                 <div className="space-y-6 max-h-[600px] overflow-y-auto pr-6 scrollbar-hide">
                   {activityWall.map((p: any) => (
                     <div key={p.id} className="p-8 bg-white/50 rounded-[3rem] border-2 border-[#1f1610]/10 flex justify-between items-center group">
                       <div>
                         <p className="font-black text-[#1f1610] uppercase text-sm">@{p.nickname}</p>
                         <p className="text-xs font-bold text-[#1f1610]/40 mt-1 line-clamp-1">{p.description}</p>
                       </div>
                       <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 rounded-full" onClick={() => handleDeletePost(p.id)}><Trash2 className="h-6 w-6" /></Button>
                     </div>
                   ))}
                 </div>
              </Card>

              <Card className="rounded-[4rem] border-4 border-[#FFD700]/20 bg-mocha-cream p-12 shadow-2xl">
                 <CardTitle className="text-3xl font-black uppercase mb-10 flex items-center gap-4 text-[#1f1610]"><Lightbulb className="h-10 w-10 text-[#FFD700]" /> Shared Resources</CardTitle>
                 <div className="space-y-6 max-h-[600px] overflow-y-auto pr-6 scrollbar-hide">
                   {sharedResources.map((r: any) => (
                     <div key={r.id} className="p-8 bg-white/50 rounded-[3rem] border-2 border-[#1f1610]/10 flex justify-between items-center group">
                       <div>
                         <p className="font-black text-[10px] uppercase text-[#FFD700] mb-1 tracking-widest">{r.type}</p>
                         <p className="font-black text-[#1f1610] uppercase text-sm">{r.title}</p>
                         <p className="text-[10px] font-bold text-[#1f1610]/40 mt-1 uppercase">By @{r.nickname}</p>
                       </div>
                       <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 rounded-full" onClick={() => handleDeleteResource(r.id)}><Trash2 className="h-6 w-6" /></Button>
                     </div>
                   ))}
                 </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="broadcast" className="space-y-12">
             <Card className="rounded-[5rem] border-8 border-[#FFD700]/10 bg-mocha-cream p-16 shadow-2xl space-y-12">
                <CardTitle className="text-4xl font-black uppercase flex items-center gap-6 italic text-[#1f1610]"><Newspaper className="h-12 w-12 text-[#FFD700]" /> Global Broadcast Center</CardTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                   <div className="space-y-8">
                      <div className="space-y-3">
                        <Label className="text-[#1f1610]">Headline</Label>
                        <Input placeholder="Broadcast Title" value={newsTitle} onChange={e => setNewsTitle(e.target.value)} className="h-18 font-black text-xl rounded-2xl bg-white text-[#1f1610]" />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[#1f1610]">Narrative</Label>
                        <Textarea placeholder="Detailed announcement..." value={newsContent} onChange={e => setNewsContent(e.target.value)} className="min-h-[200px] rounded-[3rem] p-10 bg-white text-[#1f1610]" />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[#1f1610]">Visual Attachment</Label>
                        <Input type="file" onChange={e => handleFileUpload(e, setNewsImg)} className="h-16 bg-white text-[#1f1610]" />
                      </div>
                      <Button onClick={handleDispatchBroadcast} className="w-full h-24 rounded-full bg-[#1f1610] text-[#FFD700] font-black text-3xl uppercase shadow-2xl">Dispatch Broadcast</Button>
                   </div>
                   <div className="p-12 bg-white/50 rounded-[4rem] border-8 border-dashed border-[#FFD700]/5 space-y-8">
                      <h4 className="font-black text-[#1f1610]/30 uppercase text-xs text-center tracking-[0.4em]">Active Protocols</h4>
                      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-4 scrollbar-hide">
                        {newsPosts.map((p: any) => (
                          <div key={p.id} className="p-6 bg-white rounded-3xl flex justify-between items-center shadow-lg border-2 border-[#1f1610]/10">
                             <p className="font-black text-xs uppercase truncate flex-1 mr-6 italic text-[#1f1610]">{p.title}</p>
                             <Button variant="ghost" size="icon" className="text-red-500 rounded-full" onClick={() => handleDeleteBroadcast(p.id)}><Trash2 className="h-5 w-5" /></Button>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>
             </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-12">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <Card className="rounded-[4rem] border-8 border-[#FFD700]/10 bg-mocha-cream p-12 shadow-2xl space-y-10 md:col-span-2">
                   <CardTitle className="text-3xl font-black uppercase flex items-center gap-5 italic text-[#1f1610]"><HelpCircle className="h-10 w-10 text-[#FFD700]" /> FAQ engine</CardTitle>
                   <div className="space-y-6">
                      <Input placeholder="Inquiry Question" value={faqQ} onChange={e => setFaqQ(e.target.value)} className="h-16 rounded-2xl bg-white text-[#1f1610]" />
                      <Textarea placeholder="Protocol Response" value={faqA} onChange={e => setFaqA(e.target.value)} className="min-h-[120px] rounded-3xl bg-white text-[#1f1610]" />
                      <Button onClick={handleAddFAQ} className="w-full h-18 rounded-2xl bg-[#1f1610] text-[#FFD700] font-black uppercase text-sm">Inject FAQ</Button>
                   </div>
                   <div className="space-y-4">
                     {faqs.map((f: any) => (
                        <div key={f.id} className="p-6 bg-white/50 rounded-2xl flex justify-between items-center border-2 border-[#1f1610]/10">
                           <p className="font-black text-xs uppercase italic text-[#1f1610]">{f.question}</p>
                           <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteFAQ(f.id)}><Trash2 className="h-5 w-5" /></Button>
                        </div>
                     ))}
                   </div>
                </Card>
             </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
