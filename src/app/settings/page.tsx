
"use client";

import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Shield, Lock, Award, Trophy, Coffee, FileText, Eye, EyeOff, Loader2 } from "lucide-react";
import { useUserStore, useAdminStore, UserProfile } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase";
import { useState, useMemo, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { getAuth, updateProfile, updatePassword } from "firebase/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const DEFAULT_PROFILE: UserProfile = {
  nickname: 'Succemazing',
  bio: '',
  avatarUrl: '',
  coverPhotoUrl: '',
  points: 0,
  xp: 0,
  level: 1,
  streak: 0,
  currentTaskDay: 1,
  lastLogin: null,
  completedTaskIds: [],
  capsules: [],
};

export default function SettingsPage() {
  const { user } = useUser();
  const uid = user?.uid;
  const auth = getAuth();
  
  const profiles = useUserStore(s => s.profiles);
  const profile = useMemo(() => (uid ? profiles[uid] || DEFAULT_PROFILE : DEFAULT_PROFILE), [profiles, uid]);
  const { updateProfile: updateStoreProfile } = useUserStore();

  const { badges } = useAdminStore();

  const [displayName, setDisplayName] = useState(profile.nickname);
  const [bio, setBio] = useState(profile.bio);
  const [avatar, setAvatar] = useState(profile.avatarUrl);
  const [cover, setCover] = useState(profile.coverPhotoUrl);
  
  const [newPass, setNewPass] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);

  useEffect(() => {
    if (uid && profiles[uid]) {
      setDisplayName(profiles[uid].nickname);
      setBio(profiles[uid].bio);
      setAvatar(profiles[uid].avatarUrl);
      setCover(profiles[uid].coverPhotoUrl);
    }
  }, [uid, profiles]);

  const handleUpdateProfile = async () => {
    if (!uid) return;
    try {
      if (auth.currentUser) await updateProfile(auth.currentUser, { displayName });
      updateStoreProfile(uid, { nickname: displayName, bio, avatarUrl: avatar, coverPhotoUrl: cover });
      toast({ title: "Sovereign Profile Updated" });
    } catch (e) {
      toast({ title: "Update Failed", variant: "destructive" });
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPass) {
      toast({ title: "Protocol Error", description: "New key required.", variant: "destructive" });
      return;
    }
    if (!auth.currentUser) return;

    setIsUpdatingPass(true);
    try {
      await updatePassword(auth.currentUser, newPass);
      setNewPass("");
      setShowNewPass(false);
      toast({ title: "Root Security Updated", description: "Access key changed successfully." });
    } catch (error: any) {
      toast({ 
        title: "Security Alert", 
        description: error.message.includes("recent-login") 
          ? "Critical security protocol: Please log in again to verify your identity before changing your key." 
          : error.message, 
        variant: "destructive" 
      });
    } finally {
      setIsUpdatingPass(false);
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <Navigation />
      
      <div className="absolute top-[10%] right-[5%] opacity-10 -rotate-12 pointer-events-none">
        <Coffee className="w-64 h-64 text-primary" />
      </div>
      <div className="absolute bottom-[10%] left-[5%] opacity-5 rotate-12 pointer-events-none">
        <Coffee className="w-80 h-80 text-primary" />
      </div>

      <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl relative z-10">
        <h1 className="text-6xl font-headline font-black mb-12 text-foreground uppercase tracking-tighter italic">Settings</h1>
        
        <Tabs defaultValue="profile" className="space-y-10">
          <TabsList className="bg-card/40 p-1.5 rounded-full w-fit shadow-md border-2 border-primary/10">
            <TabsTrigger value="profile" className="rounded-full px-12 h-12 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-background">Identity</TabsTrigger>
            <TabsTrigger value="achievements" className="rounded-full px-12 h-12 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-background">Vault</TabsTrigger>
            <TabsTrigger value="privacy" className="rounded-full px-12 h-12 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-background">Privacy</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
            <Card className="rounded-[3.5rem] border-4 border-primary/10 bg-mocha-cream p-12 shadow-xl">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <Label className="text-[#1f1610]">Nickname</Label>
                      <Input value={displayName} onChange={e => setDisplayName(e.target.value)} className="h-16 font-black text-xl bg-white text-[#1f1610]" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#1f1610]">Strategic Bio</Label>
                      <Textarea value={bio} onChange={e => setBio(e.target.value)} className="min-h-[140px] font-medium bg-white text-[#1f1610]" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div><Label className="text-[#1f1610]">Avatar</Label><Input type="file" onChange={e => handleFile(e, setAvatar)} className="mt-2 h-12 bg-white text-[#1f1610]" /></div>
                       <div><Label className="text-[#1f1610]">Cover</Label><Input type="file" onChange={e => handleFile(e, setCover)} className="mt-2 h-12 bg-white text-[#1f1610]" /></div>
                    </div>
                    <Button onClick={handleUpdateProfile} className="w-full h-20 rounded-full bg-[#1f1610] text-[#FFD700] font-black text-2xl uppercase shadow-xl active:scale-95 transition-all">Update Protocol</Button>
                  </div>
                  <div className="p-10 bg-[#1f1610]/5 rounded-[3rem] border-2 border-[#1f1610]/10 space-y-8">
                    <h3 className="text-2xl font-black uppercase tracking-tighter text-[#1f1610] flex items-center gap-3"><Lock className="h-6 w-6 text-primary" /> Root Security</h3>
                    <div className="space-y-2">
                      <Label className="text-[#1f1610]/60">New Security Key</Label>
                      <div className="relative">
                        <Input 
                          type={showNewPass ? 'text' : 'password'} 
                          placeholder="••••••••" 
                          value={newPass} 
                          onChange={e => setNewPass(e.target.value)} 
                          className="h-16 bg-white text-[#1f1610] pr-14" 
                        />
                        <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-6 top-1/2 -translate-y-1/2 text-[#1f1610]/40">
                          {showNewPass ? <Eye className="h-6 w-6" /> : <EyeOff className="h-6 w-6" />}
                        </button>
                      </div>
                    </div>
                    <Button 
                      onClick={handleUpdatePassword}
                      disabled={isUpdatingPass}
                      className="w-full h-16 rounded-2xl bg-[#1f1610] border-2 border-[#FFD700] text-[#FFD700] font-black uppercase text-xs hover:bg-[#FFD700] hover:text-[#1f1610] transition-all shadow-xl"
                    >
                      {isUpdatingPass ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Update Access Key'}
                    </Button>
                  </div>
               </div>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="animate-in fade-in slide-in-from-bottom-4">
            <Card className="rounded-[3.5rem] border-4 border-primary/10 bg-mocha-cream p-16 shadow-xl">
               <div className="text-center mb-16 space-y-4">
                  <Trophy className="h-16 w-16 mx-auto text-primary" />
                  <h2 className="text-5xl font-black text-[#1f1610] uppercase tracking-tighter italic">Achievement Vault</h2>
                  <p className="text-[10px] text-primary font-black uppercase tracking-widest">Strategy milestones unlocked</p>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {badges.length === 0 ? (
                    <p className="col-span-full text-center text-[#1f1610]/30 font-black uppercase italic py-20">No badges deployed by the Host.</p>
                  ) : badges.map((b) => (
                    <div key={b.id} className="p-10 bg-white rounded-[3rem] border-4 border-transparent flex items-center gap-8 group hover:border-primary transition-all shadow-sm">
                       <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center shadow-xl group-hover:rotate-12 transition-transform", 
                         b.difficulty === 'Bronze' ? 'bg-[#cd7f32]' : 
                         b.difficulty === 'Silver' ? 'bg-[#c0c0c0]' : 
                         b.difficulty === 'Gold' ? 'bg-primary' : 'bg-purple-900')}>
                          <Award className="h-10 w-10 text-white" />
                       </div>
                       <div>
                         <Badge className="mb-2 bg-primary text-background text-[8px] uppercase border-none">{b.difficulty}</Badge>
                         <h4 className="text-2xl font-black text-[#1f1610] uppercase tracking-tight italic">{b.title}</h4>
                         <p className="text-[10px] font-bold text-[#1f1610]/40 uppercase tracking-widest">{b.description}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="animate-in fade-in slide-in-from-bottom-4">
            <Card className="rounded-[3.5rem] border-4 border-primary/10 bg-mocha-cream p-12 shadow-xl">
              <CardHeader className="text-center pb-8">
                <FileText className="h-12 w-12 mx-auto text-primary mb-4" />
                <CardTitle className="text-4xl font-black text-[#1f1610] uppercase italic">Privacy Policy</CardTitle>
                <p className="text-[10px] font-black text-primary uppercase tracking-widest">Last Updated: May 19, 2026</p>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-6">
                  <div className="prose prose-sm prose-stone max-w-none text-[#1f1610] space-y-8">
                    <p className="text-lg leading-relaxed">At <strong>Nico Digital</strong>, we are committed to protecting your privacy and building trust through transparency. This Privacy Policy explains how we collect, use, disclose, store, and protect your personal information when you interact with our website, membership platform, and services.</p>
                    <p className="text-lg leading-relaxed"><strong>Nico Digital</strong> (referred to as “we,” “us,” or “our”) is a digital business established in 2026, specializing in eBooks, templates, bundles, and membership programs. Our flagship offering includes the “Fail-Proof” 30-Day Implementation Sprint — a guided membership experience with daily tasks, progress tracking, Time Capsule, gamification elements, and community features.</p>

                    <div className="space-y-4">
                      <h3 className="text-2xl font-black uppercase italic">1. Information We Collect</h3>
                      <p>We collect information to provide, improve, and personalize our services while ensuring a safe and effective learning environment.</p>
                      <h4 className="font-black">Information You Provide Directly:</h4>
                      <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Account Information</strong>: Full name, email, username, nickname, password, profile picture, and cover image.</li>
                        <li><strong>Profile Details</strong>: UID, date of birth, and location.</li>
                        <li><strong>Content You Create</strong>: Daily task responses, Time Capsule entries, journal reflections, and Messenger data.</li>
                        <li><strong>Payment Information</strong>: Billing details processed securely by third-party providers (Stripe, PayPal).</li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-2xl font-black uppercase italic">2. How We Collect Your Information</h3>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Through registration, login, and profile setup.</li>
                        <li>When you complete daily tasks or engage with the Time Capsule.</li>
                        <li>Automatically via server logs and cookies.</li>
                        <li>During purchases of our digital products.</li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-2xl font-black uppercase italic">3. How We Use Your Information</h3>
                      <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Managing Services</strong>: Delivering daily tasks and managing the 30-Day Sprint.</li>
                        <li><strong>Gamification</strong>: Customizing themes, streaks, badges, and levels.</li>
                        <li><strong>Communication</strong>: Milestone updates and administrative notices.</li>
                        <li><strong>Security</strong>: Detecting unauthorized access and protecting platform integrity.</li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-2xl font-black uppercase italic">4. Sharing and Disclosure</h3>
                      <p>We do not sell your personal data. We may share information with trusted service providers who help operate the platform under strict confidentiality agreements.</p>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-2xl font-black uppercase italic">5. Data Storage and Security</h3>
                      <p>We implement reasonable administrative, technical, and physical safeguards. However, no system is completely secure. <strong>Retention Period</strong>: Active membership data is retained while your account is open.</p>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-2xl font-black uppercase italic">6. Your Rights</h3>
                      <p>You have the right to access, correct, delete, or port your personal data. To exercise these rights, contact us at our official support email.</p>
                    </div>

                    <div className="space-y-4 pt-8 border-t-2 border-[#1f1610]/10">
                      <h3 className="text-2xl font-black uppercase italic">Acknowledgment</h3>
                      <p className="italic">By using Nico Digital’s services, you confirm that you have read and understood this Privacy Policy, including how your information is protected in the context of the Fail-Proof 30-Day Implementation Sprint.</p>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
