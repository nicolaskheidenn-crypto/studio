
"use client";

import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Flame, Droplets, Leaf, CloudRain, Monitor, User, Shield, Lock, Camera, Save, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useAppStore, type Theme } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { getAuth, updateProfile, updatePassword } from "firebase/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const THEMES: { id: Theme; label: string; icon: any; color: string }[] = [
  { id: 'default', label: 'Classic Mocha', icon: Monitor, color: 'bg-zinc-500' },
  { id: 'fire', label: 'Volcanic Fire', icon: Flame, color: 'bg-orange-500' },
  { id: 'water', label: 'Oceanic Blue', icon: Droplets, color: 'bg-blue-500' },
  { id: 'nature', label: 'Calm Nature', icon: Leaf, color: 'bg-emerald-500' },
  { id: 'raining', label: 'Stormy Night', icon: CloudRain, color: 'bg-slate-600' },
];

export default function SettingsPage() {
  const { theme, setTheme, applyTheme } = useAppStore();
  const { user } = useUser();
  const auth = getAuth();
  
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [newPass, setNewPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.displayName) setDisplayName(user.displayName);
  }, [user]);

  const validateBio = (text: string) => {
    const lettersOnly = text.replace(/[^a-zA-Z\s]/g, "");
    setBio(lettersOnly);
  };

  const handleUpdateProfile = async () => {
    if (!auth.currentUser) return;
    if (bio.length > 0 && (bio.length < 15 || bio.length > 60)) {
      toast({ title: "Bio Error", description: "Bio must be between 15 and 60 letters.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      await updateProfile(auth.currentUser, { displayName });
      toast({ title: "Profile Synchronized", description: "Your core identity has been updated." });
    } catch (e: any) {
      toast({ title: "Update Failed", description: e.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTheme = () => {
    applyTheme();
    toast({ 
      title: "Environment Locked", 
      description: "Atmosphere has been applied globally.",
      variant: "default"
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary/5">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-16 max-w-6xl">
        <h1 className="text-7xl font-headline font-bold mb-16 text-accent tracking-tighter">Configuration</h1>
        
        <Tabs defaultValue="profile" className="space-y-12">
          <TabsList className="bg-white p-2 rounded-full w-fit shadow-xl border border-accent/5">
            <TabsTrigger value="profile" className="rounded-full px-12 h-14 text-xl font-bold data-[state=active]:bg-accent data-[state=active]:text-white">Profile Hub</TabsTrigger>
            <TabsTrigger value="appearance" className="rounded-full px-12 h-14 text-xl font-bold data-[state=active]:bg-accent data-[state=active]:text-white">Atmosphere</TabsTrigger>
            <TabsTrigger value="privacy" className="rounded-full px-12 h-14 text-xl font-bold data-[state=active]:bg-accent data-[state=active]:text-white">Legal Proof</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-10 animate-in fade-in slide-in-from-bottom-5">
            <Card className="rounded-[4rem] border-white border-8 shadow-[0_40px_80px_rgba(0,0,0,0.1)] overflow-hidden bg-white">
               <div className="h-64 bg-gradient-to-br from-accent via-accent/90 to-primary relative group">
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Button variant="outline" size="sm" className="absolute bottom-6 right-10 rounded-full bg-white/30 border-white/50 text-white backdrop-blur-xl h-12 px-6 font-bold hover:bg-white hover:text-accent">
                    <Camera className="h-5 w-5 mr-3" /> Update Cover
                  </Button>
               </div>
               <CardContent className="p-16 -mt-20 relative z-10">
                  <div className="flex flex-col md:flex-row gap-10 items-end mb-16">
                     <div className="w-44 h-44 rounded-[3rem] border-8 border-white bg-accent shadow-2xl flex items-center justify-center text-white text-6xl font-black uppercase relative overflow-hidden group">
                        {user?.displayName?.[0] || "S"}
                        <Button size="icon" className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-none h-full w-full">
                          <Camera className="h-10 w-10 text-white" />
                        </Button>
                     </div>
                     <div className="flex-1 pb-4">
                        <h2 className="text-5xl font-black text-accent tracking-tight leading-none">{user?.displayName || "Succemazing"}</h2>
                        <p className="text-xl text-muted-foreground font-mono mt-2">{user?.email}</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    <div className="space-y-8">
                      <div className="space-y-3">
                        <Label className="text-xl font-black text-accent ml-2">Username</Label>
                        <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="@username" className="h-16 rounded-3xl bg-secondary/10 border-none px-8 text-xl font-bold" />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-xl font-black text-accent ml-2">Full Nickname</Label>
                        <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Full Name" className="h-16 rounded-3xl bg-secondary/10 border-none px-8 text-xl font-bold" />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-xl font-black text-accent ml-2 flex justify-between">Bio <Badge className="bg-primary text-accent font-black">{bio.length}/60</Badge></Label>
                        <Textarea 
                          value={bio} 
                          onChange={e => validateBio(e.target.value)} 
                          placeholder="Your strategic bio (15-60 letters only)..." 
                          className="rounded-[2.5rem] bg-secondary/10 border-none min-h-[160px] p-8 text-xl font-medium leading-relaxed"
                        />
                      </div>
                      <Button onClick={handleUpdateProfile} disabled={isLoading} className="w-full h-20 rounded-full bg-accent text-white font-black text-2xl shadow-2xl hover:scale-[1.02] transition-transform">
                        Save Core Identity
                      </Button>
                    </div>

                    <div className="space-y-10">
                       <div className="p-10 bg-secondary/5 rounded-[3.5rem] border-4 border-dashed border-accent/5">
                          <h3 className="text-2xl font-black mb-8 flex items-center gap-3 text-accent"><Shield className="h-8 w-8 text-primary" /> Security Shield</h3>
                          <div className="space-y-8">
                             <div className="space-y-3">
                                <Label className="font-bold ml-2">Update Access Password</Label>
                                <div className="relative">
                                   <Input 
                                      type={showPass ? "text" : "password"} 
                                      value={newPass} 
                                      onChange={e => setNewPass(e.target.value)}
                                      className="h-16 rounded-3xl bg-white border-2 border-accent/5 px-8 pr-16 text-xl"
                                      placeholder="New Strong Password"
                                   />
                                   <button onClick={() => setShowPass(!showPass)} className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent transition-colors">
                                      {showPass ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                                   </button>
                                </div>
                             </div>
                             <Button variant="outline" onClick={() => {
                               if (newPass) {
                                 updatePassword(auth.currentUser!, newPass)
                                  .then(() => toast({ title: "Security Updated" }))
                                  .catch(e => toast({ title: "Failed", description: e.message, variant: "destructive" }));
                               }
                             }} className="w-full h-16 rounded-full border-4 border-accent text-accent font-black text-xl hover:bg-accent hover:text-white transition-all shadow-lg">
                                Synchronize Security
                             </Button>
                          </div>
                       </div>
                       
                       <div className="bg-accent text-white p-10 rounded-[3.5rem] shadow-2xl">
                          <h3 className="text-2xl font-black mb-6 flex items-center gap-3"><CheckCircle2 className="h-8 w-8 text-primary" /> Account Tier</h3>
                          <p className="text-xl font-medium text-white/70 leading-relaxed">You are currently operating as a <span className="text-primary font-black uppercase">Elite Strategist</span>. All content paths are open.</p>
                       </div>
                    </div>
                  </div>
               </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-10 animate-in fade-in slide-in-from-bottom-5">
            <Card className="rounded-[4rem] border-white border-8 shadow-2xl p-16 bg-white">
              <CardHeader className="text-center mb-12">
                <CardTitle className="text-5xl font-headline font-bold text-accent tracking-tighter">Atmosphere Engine</CardTitle>
                <CardDescription className="text-2xl font-medium text-muted-foreground mt-4">Fuel your high-focus execution environment.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={cn(
                        "group relative overflow-hidden flex flex-col p-10 rounded-[3rem] border-8 transition-all duration-500",
                        theme === t.id 
                          ? "border-primary bg-primary/5 shadow-2xl scale-[1.05]" 
                          : "border-secondary/20 hover:border-accent/30 bg-card hover:bg-secondary/5"
                      )}
                    >
                      <div className={cn("w-20 h-20 rounded-3xl text-white flex items-center justify-center mb-8 shadow-2xl group-hover:scale-110 transition-transform", t.color)}>
                        <t.icon className="h-10 w-10" />
                      </div>
                      <p className="font-black text-3xl mb-2 text-accent leading-none">{t.label}</p>
                      <p className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground">Focus Environment</p>
                      {theme === t.id && (
                        <div className="absolute top-6 right-6 h-4 w-4 rounded-full bg-primary shadow-[0_0_15px_rgba(255,215,0,1)]" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex justify-center">
                  <Button onClick={handleSaveTheme} className="h-24 rounded-full px-24 bg-accent text-white font-black text-4xl shadow-[0_30px_60px_rgba(0,0,0,0.3)] hover:scale-110 transition-transform active:scale-95 group">
                    <Save className="h-10 w-10 mr-5 group-hover:rotate-12 transition-transform" /> LOCK ENVIRONMENT
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="animate-in fade-in slide-in-from-bottom-5">
             <Card className="rounded-[4rem] p-20 shadow-2xl border-white border-8 bg-white">
                <h2 className="text-6xl font-headline font-bold mb-16 text-center text-accent tracking-tighter">Global Security & Policy</h2>
                <div className="space-y-20 max-w-4xl mx-auto text-xl leading-relaxed text-muted-foreground">
                   <section className="space-y-6">
                      <h4 className="text-accent text-3xl font-black flex items-center gap-4">
                        <span className="w-12 h-12 bg-primary text-accent rounded-2xl flex items-center justify-center text-xl">I</span>
                        Data Sovereignty Path
                      </h4>
                      <p>At FireProof, your strategic assets and intellectual property are treated with ultimate tier isolation. Every goal capsule, daily task execution log, and MeText communication is encrypted using high-grade protocols. Your data is your empire; we only provide the vault.</p>
                   </section>
                   <section className="space-y-6">
                      <h4 className="text-accent text-3xl font-black flex items-center gap-4">
                        <span className="w-12 h-12 bg-primary text-accent rounded-2xl flex items-center justify-center text-xl">II</span>
                        Anti-Intrusion Governance
                      </h4>
                      <p>We do not harvest, monetize, or share user behavioral data with third-party networks. Our model is powered by your ambition, not your exposure. Internal audits are conducted bi-weekly to ensure zero-leak integrity across all Firestore paths. Your privacy is non-negotiable.</p>
                   </section>
                   <section className="space-y-6">
                      <h4 className="text-accent text-3xl font-black flex items-center gap-4">
                        <span className="w-12 h-12 bg-primary text-accent rounded-2xl flex items-center justify-center text-xl">III</span>
                        MeText Interaction Standards
                      </h4>
                      <p>The messaging and social hub must be used exclusively for professional growth and strategic networking. Any data scraping or malicious automation will result in immediate UID termination. We reserve the right to prune connections to maintain system velocity.</p>
                   </section>
                </div>
             </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
