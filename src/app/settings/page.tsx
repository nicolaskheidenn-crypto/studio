
"use client";

import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Flame, Droplets, Leaf, CloudRain, Monitor, User, Shield, Lock, Camera, Save, Eye, EyeOff, CheckCircle2, Copy } from "lucide-react";
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
    applyTheme();
  }, [user, applyTheme]);

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
    });
  };

  const copyUid = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid);
      toast({ title: "UID Copied", description: "Strategic ID saved to clipboard." });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary/5">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl">
        <h1 className="text-5xl md:text-7xl font-headline font-bold mb-12 text-accent tracking-tighter">Configuration</h1>
        
        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="bg-white p-1 rounded-full w-fit shadow-lg border border-accent/5">
            <TabsTrigger value="profile" className="rounded-full px-8 h-12 text-sm md:text-lg font-bold">Profile Hub</TabsTrigger>
            <TabsTrigger value="appearance" className="rounded-full px-8 h-12 text-sm md:text-lg font-bold">Atmosphere</TabsTrigger>
            <TabsTrigger value="privacy" className="rounded-full px-8 h-12 text-sm md:text-lg font-bold">Legal Proof</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-8 animate-in fade-in slide-in-from-bottom-3">
            <Card className="rounded-[2.5rem] border-white border-4 shadow-xl overflow-hidden bg-white">
               <div className="h-48 bg-gradient-to-br from-accent via-accent/90 to-primary relative group">
                  <Button variant="outline" size="sm" className="absolute bottom-4 right-6 rounded-full bg-white/30 border-white/50 text-white backdrop-blur-xl h-10 px-4 font-bold hover:bg-white hover:text-accent">
                    <Camera className="h-4 w-4 mr-2" /> Cover
                  </Button>
               </div>
               <CardContent className="p-8 md:p-12 -mt-16 relative z-10">
                  <div className="flex flex-col md:flex-row gap-6 items-end mb-12">
                     <div className="w-32 h-32 rounded-[2rem] border-4 border-white bg-accent shadow-xl flex items-center justify-center text-white text-4xl font-black uppercase relative overflow-hidden group">
                        {user?.displayName?.[0] || "S"}
                        <Button size="icon" className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-none h-full w-full">
                          <Camera className="h-6 w-6 text-white" />
                        </Button>
                     </div>
                     <div className="flex-1 pb-2">
                        <h2 className="text-3xl font-black text-accent tracking-tight">{user?.displayName || "Succemazing"}</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-xs text-muted-foreground bg-secondary/20 px-2 py-1 rounded">UID: {user?.uid}</code>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyUid}><Copy className="h-3 w-3" /></Button>
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="font-bold ml-2">Username</Label>
                        <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="@username" className="h-12 rounded-xl bg-secondary/10 border-none px-4 font-bold" />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold ml-2">Full Nickname</Label>
                        <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Full Name" className="h-12 rounded-xl bg-secondary/10 border-none px-4 font-bold" />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold ml-2 flex justify-between">Bio <Badge className="bg-primary text-accent h-5">{bio.length}/60</Badge></Label>
                        <Textarea 
                          value={bio} 
                          onChange={e => validateBio(e.target.value)} 
                          placeholder="Your bio (15-60 letters only)..." 
                          className="rounded-2xl bg-secondary/10 border-none min-h-[120px] p-4 font-medium"
                        />
                      </div>
                      <Button onClick={handleUpdateProfile} disabled={isLoading} className="w-full h-14 rounded-full bg-accent text-white font-black text-xl shadow-lg hover:scale-[1.01] transition-transform">
                        Save Identity
                      </Button>
                    </div>

                    <div className="space-y-8">
                       <div className="p-8 bg-secondary/5 rounded-[2rem] border-2 border-dashed border-accent/5">
                          <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-accent"><Shield className="h-6 w-6 text-primary" /> Security Hub</h3>
                          <div className="space-y-6">
                             <div className="space-y-2">
                                <Label className="font-bold ml-1">New Password</Label>
                                <div className="relative">
                                   <Input 
                                      type={showPass ? "text" : "password"} 
                                      value={newPass} 
                                      onChange={e => setNewPass(e.target.value)}
                                      className="h-12 rounded-xl bg-white border-2 border-accent/5 px-4 pr-12"
                                      placeholder="Strong Password"
                                   />
                                   <button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent transition-colors">
                                      {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                   </button>
                                </div>
                             </div>
                             <Button variant="outline" onClick={() => {
                               if (newPass) {
                                 updatePassword(auth.currentUser!, newPass)
                                  .then(() => toast({ title: "Security Updated" }))
                                  .catch(e => toast({ title: "Failed", description: e.message, variant: "destructive" }));
                               }
                             }} className="w-full h-12 rounded-full border-2 border-accent text-accent font-black hover:bg-accent hover:text-white transition-all">
                                Update Security
                             </Button>
                          </div>
                       </div>
                       
                       <div className="bg-accent text-white p-8 rounded-[2rem] shadow-lg">
                          <h3 className="text-xl font-black mb-4 flex items-center gap-2"><CheckCircle2 className="h-6 w-6 text-primary" /> Account Tier</h3>
                          <p className="text-base font-medium text-white/70">Operating as an <span className="text-primary font-black uppercase">Elite Strategist</span> under Nico Digital.</p>
                       </div>
                    </div>
                  </div>
               </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="animate-in fade-in slide-in-from-bottom-3">
            <Card className="rounded-[2.5rem] border-white border-4 shadow-xl p-8 md:p-12 bg-white">
              <CardHeader className="text-center mb-8">
                <CardTitle className="text-4xl font-headline font-bold text-accent tracking-tighter">Atmosphere Engine</CardTitle>
                <CardDescription className="text-lg font-medium text-muted-foreground">Select a background environment for your strategy sessions.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={cn(
                        "group relative overflow-hidden flex flex-col p-6 rounded-3xl border-2 transition-all duration-300",
                        theme === t.id 
                          ? "border-primary bg-primary/5 shadow-md scale-[1.02]" 
                          : "border-secondary/20 hover:border-accent/30 bg-card"
                      )}
                    >
                      <div className={cn("w-12 h-12 rounded-xl text-white flex items-center justify-center mb-4 shadow-md", t.color)}>
                        <t.icon className="h-6 w-6" />
                      </div>
                      <p className="font-black text-xl text-accent leading-none">{t.label}</p>
                      {theme === t.id && (
                        <div className="absolute top-4 right-4 h-3 w-3 rounded-full bg-primary shadow-sm" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex justify-center">
                  <Button onClick={handleSaveTheme} className="h-16 rounded-full px-16 bg-accent text-white font-black text-2xl shadow-xl hover:scale-105 transition-transform group">
                    <Save className="h-6 w-6 mr-3 group-hover:rotate-12 transition-transform" /> SAVE CHANGES
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="animate-in fade-in slide-in-from-bottom-3">
             <Card className="rounded-[2.5rem] p-8 md:p-16 shadow-xl border-white border-4 bg-white">
                <h2 className="text-4xl md:text-5xl font-headline font-bold mb-10 text-center text-accent tracking-tighter">Legal Sovereignty & Proof</h2>
                <div className="space-y-12 max-w-3xl mx-auto text-lg leading-relaxed text-muted-foreground">
                   <section className="space-y-4">
                      <h4 className="text-accent text-2xl font-black flex items-center gap-3">
                        <span className="w-10 h-10 bg-primary text-accent rounded-xl flex items-center justify-center text-base">I</span>
                        Nico Digital Infrastructure
                      </h4>
                      <p>FireProof is a specialized strategic asset management tool under the <strong>Nico Digital</strong> main root business brand. All intellectual property, user interaction logs, and strategic task data are hosted on sovereign infrastructure. We do not operate like ordinary, centralized businesses; our focus is on high-tier individual growth and data privacy.</p>
                   </section>
                   <section className="space-y-4">
                      <h4 className="text-accent text-2xl font-black flex items-center gap-3">
                        <span className="w-10 h-10 bg-primary text-accent rounded-xl flex items-center justify-center text-base">II</span>
                        Data Privacy Protocols
                      </h4>
                      <p>We do not harvest, monetize, or sell your data. Your vision (GoalCaps), your routine (TaskDo), and your conversations (MeText) are strictly private. Firestore rules are configured with high-tier security logic to prevent cross-UID data leakage. Your account is your sovereign territory within our digital empire.</p>
                   </section>
                   <section className="space-y-4">
                      <h4 className="text-accent text-2xl font-black flex items-center gap-3">
                        <span className="w-10 h-10 bg-primary text-accent rounded-xl flex items-center justify-center text-base">III</span>
                        MeText Behavior Policy
                      </h4>
                      <p>Communication within the MeText hub is strictly for strategic growth. Harassment, data scraping, or malicious bot activity will result in permanent UID blacklisting without prior warning. By using this hub, you agree to respect the sovereignty of other Succemazings.</p>
                   </section>
                   <section className="space-y-4">
                      <h4 className="text-accent text-2xl font-black flex items-center gap-3">
                        <span className="w-10 h-10 bg-primary text-accent rounded-xl flex items-center justify-center text-base">IV</span>
                        Business Authenticity
                      </h4>
                      <p>Nico Digital provides this proof as verification of our legitimate high-focus execution model. We are not just an app; we are a strategic partner in your journey toward consistency and excellence.</p>
                   </section>
                </div>
             </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
