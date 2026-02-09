"use client";
import { useState, useEffect } from "react";
import { Lock, Shield, Eye, EyeOff, Copy, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { changePassword, isTwoFactorEnabled, enableTwoFactor, disableTwoFactor, getTwoFactorCode, saveLogo, getLogo } from "@/lib/content-manager";

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [oldPassword, setOldPassword] = useState(""); const [newPassword, setNewPassword] = useState(""); const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false); const [showNew, setShowNew] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{type:"success"|"error";text:string}|null>(null);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false); const [twoFACode, setTwoFACode] = useState<string|null>(null);
  const [verifyCode, setVerifyCode] = useState(""); const [twoFAStep, setTwoFAStep] = useState<"idle"|"setup"|"verify">("idle");
  const [copied, setCopied] = useState(false); const [logo, setLogo] = useState("");

  useEffect(() => { const load = async () => { setTwoFAEnabled(await isTwoFactorEnabled()); setTwoFACode(await getTwoFactorCode()); setLogo(await getLogo()); setMounted(true); }; load(); }, []);
  if (!mounted) return null;

  const handlePasswordChange = async () => {
    setPasswordMsg(null);
    if (!oldPassword||!newPassword||!confirmPassword) { setPasswordMsg({type:"error",text:"Tüm alanları doldurun."}); return; }
    if (newPassword.length<8) { setPasswordMsg({type:"error",text:"Yeni şifre en az 8 karakter olmalı."}); return; }
    if (newPassword!==confirmPassword) { setPasswordMsg({type:"error",text:"Yeni şifreler eşleşmiyor."}); return; }
    if (await changePassword(oldPassword,newPassword)) { setPasswordMsg({type:"success",text:"Şifre başarıyla değiştirildi!"}); setOldPassword(""); setNewPassword(""); setConfirmPassword(""); }
    else { setPasswordMsg({type:"error",text:"Mevcut şifre yanlış."}); }
  };

  const handleEnable2FA = async () => { const code = await enableTwoFactor(); setTwoFACode(code); setTwoFAStep("setup"); };
  const handleVerify2FA = async () => { if (verifyCode===twoFACode) { setTwoFAEnabled(true); setTwoFAStep("idle"); setVerifyCode(""); alert("2FA başarıyla etkinleştirildi!"); } else { alert("Geçersiz kod."); } };
  const handleDisable2FA = async () => { if (!confirm("2FA'yı devre dışı bırakmak istediğinize emin misiniz?")) return; await disableTwoFactor(); setTwoFAEnabled(false); setTwoFACode(null); setTwoFAStep("idle"); };
  const handleCopyCode = () => { if(twoFACode){navigator.clipboard.writeText(twoFACode);setCopied(true);setTimeout(()=>setCopied(false),2000);} };
  const handleLogoSave = async () => { if(!logo.trim()){alert("Logo boş olamaz.");return;} await saveLogo(logo); alert("Logo güncellendi!"); };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">Ayarlar</h1><p className="text-muted-foreground">Hesap ve güvenlik ayarlarınızı yönetin.</p></div>
      <Tabs defaultValue="security"><TabsList><TabsTrigger value="security">Güvenlik</TabsTrigger><TabsTrigger value="general">Genel</TabsTrigger></TabsList>
        <TabsContent value="security" className="space-y-6">
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5"/>Şifre Değiştir</CardTitle><CardDescription>Hesap şifrenizi güncelleyin.</CardDescription></CardHeader><CardContent className="space-y-4">
            <div className="space-y-2"><Label>Mevcut Şifre</Label><div className="relative"><Input type={showOld?"text":"password"} value={oldPassword} onChange={e=>setOldPassword(e.target.value)}/><button type="button" onClick={()=>setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showOld?<EyeOff className="h-4 w-4"/>:<Eye className="h-4 w-4"/>}</button></div></div>
            <div className="grid md:grid-cols-2 gap-4"><div className="space-y-2"><Label>Yeni Şifre</Label><div className="relative"><Input type={showNew?"text":"password"} value={newPassword} onChange={e=>setNewPassword(e.target.value)}/><button type="button" onClick={()=>setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showNew?<EyeOff className="h-4 w-4"/>:<Eye className="h-4 w-4"/>}</button></div></div><div className="space-y-2"><Label>Yeni Şifre (Tekrar)</Label><Input type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)}/></div></div>
            {passwordMsg&&<p className={`text-sm ${passwordMsg.type==="success"?"text-green-600":"text-destructive"}`}>{passwordMsg.text}</p>}
            <Button onClick={handlePasswordChange}>Şifreyi Değiştir</Button>
          </CardContent></Card>
          <Card><CardHeader><div className="flex items-center justify-between"><div><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5"/>İki Faktörlü Doğrulama (2FA)</CardTitle><CardDescription>Hesabınıza ekstra güvenlik katmanı ekleyin.</CardDescription></div><Badge variant={twoFAEnabled?"default":"secondary"}>{twoFAEnabled?"Aktif":"Pasif"}</Badge></div></CardHeader><CardContent>
            {twoFAStep==="idle"&&!twoFAEnabled&&<div><p className="text-sm text-muted-foreground mb-4">2FA etkinleştirildiğinde, giriş yaparken 6 haneli bir doğrulama kodu girmeniz gerekecektir.</p><Button onClick={handleEnable2FA}>2FA Etkinleştir</Button></div>}
            {twoFAStep==="setup"&&twoFACode&&<div className="space-y-4"><div className="bg-muted rounded-lg p-6 text-center"><p className="text-sm text-muted-foreground mb-2">Doğrulama Kodunuz:</p><div className="text-4xl font-mono font-bold tracking-[0.3em] mb-3">{twoFACode}</div><Button variant="outline" size="sm" onClick={handleCopyCode} className="gap-2">{copied?<><Check className="h-4 w-4"/>Kopyalandı</>:<><Copy className="h-4 w-4"/>Kopyala</>}</Button></div><p className="text-sm text-muted-foreground">Bu kodu güvenli bir yere kaydedin.</p><div className="space-y-2"><Label>Doğrulama kodunu girin</Label><Input value={verifyCode} onChange={e=>setVerifyCode(e.target.value)} placeholder="6 haneli kod" maxLength={6} className="max-w-xs text-center text-xl tracking-widest"/></div><div className="flex gap-2"><Button onClick={handleVerify2FA}>Doğrula ve Etkinleştir</Button><Button variant="outline" onClick={async()=>{await disableTwoFactor();setTwoFAStep("idle");}}>İptal</Button></div></div>}
            {twoFAStep==="idle"&&twoFAEnabled&&<div><p className="text-sm text-muted-foreground mb-4">2FA aktif.</p><Button variant="destructive" onClick={handleDisable2FA}>2FA Devre Dışı Bırak</Button></div>}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="general" className="space-y-6">
          <Card><CardHeader><CardTitle>Site Logosu / Adı</CardTitle><CardDescription>Sitede görünen logo metnini değiştirin.</CardDescription></CardHeader><CardContent className="space-y-4"><div className="space-y-2"><Label>Logo Metni</Label><Input value={logo} onChange={e=>setLogo(e.target.value)} placeholder="PsikoPanel"/></div><Button onClick={handleLogoSave}>Kaydet</Button></CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
