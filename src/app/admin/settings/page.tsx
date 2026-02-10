"use client";
import { useState, useEffect } from "react";
import { Lock, Shield, Eye, EyeOff, Copy, Check, Mail, Bell, Smartphone, AlertTriangle, Upload, X, Image, Globe, FileImage } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  changePassword, isTwoFactorEnabled, enableTwoFactor, confirmTwoFactor, disableTwoFactor,
  getTwoFactorSecret, verifyTwoFactor, saveLogo, getLogo,
  getLogoImage, saveLogoImage, getFavicon, saveFavicon, getSiteTitle, saveSiteTitle,
  getEmailSettings, saveEmailSettings, type EmailNotificationSettings,
} from "@/lib/content-manager";

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  // Password
  const [oldPassword, setOldPassword] = useState(""); const [newPassword, setNewPassword] = useState(""); const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false); const [showNew, setShowNew] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  // 2FA
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [twoFAStep, setTwoFAStep] = useState<"idle" | "setup" | "verify">("idle");
  const [totpSecret, setTotpSecret] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [secretCopied, setSecretCopied] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [disableCode, setDisableCode] = useState("");
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  // General
  const [logo, setLogo] = useState("");
  const [logoImage, setLogoImage] = useState("");
  const [favicon, setFavicon] = useState("");
  const [siteTitle, setSiteTitle] = useState("");
  // Email
  const [emailSettings, setEmailSettings] = useState<EmailNotificationSettings>({ enabled: false, notificationEmail: '', webhookUrl: '' });

  useEffect(() => {
    const load = async () => {
      setTwoFAEnabled(await isTwoFactorEnabled());
      setTotpSecret(await getTwoFactorSecret());
      setLogo(await getLogo());
      setLogoImage(await getLogoImage());
      setFavicon(await getFavicon());
      setSiteTitle(await getSiteTitle());
      setEmailSettings(await getEmailSettings());
      setMounted(true);
    };
    load();
  }, []);

  if (!mounted) return null;

  // ===== PASSWORD =====
  const handlePasswordChange = async () => {
    setPasswordMsg(null);
    if (!oldPassword || !newPassword || !confirmPassword) { setPasswordMsg({ type: "error", text: "Tüm alanları doldurun." }); return; }
    if (newPassword.length < 8) { setPasswordMsg({ type: "error", text: "Yeni şifre en az 8 karakter olmalı." }); return; }
    if (newPassword !== confirmPassword) { setPasswordMsg({ type: "error", text: "Yeni şifreler eşleşmiyor." }); return; }
    if (await changePassword(oldPassword, newPassword)) {
      setPasswordMsg({ type: "success", text: "Şifre başarıyla değiştirildi!" });
      setOldPassword(""); setNewPassword(""); setConfirmPassword("");
    } else {
      setPasswordMsg({ type: "error", text: "Mevcut şifre yanlış." });
    }
  };

  // ===== 2FA SETUP =====
  const handleStartSetup = async () => {
    const secret = await enableTwoFactor();
    setTotpSecret(secret);
    // QR kodu dinamik olarak üret
    const { generateQRCode } = await import("@/lib/totp");
    const qr = await generateQRCode(secret, "admin");
    setQrDataUrl(qr);
    setTwoFAStep("setup");
    setVerifyCode("");
    setVerifyError("");
  };

  const handleVerifyAndEnable = async () => {
    setVerifyError("");
    if (verifyCode.length !== 6) { setVerifyError("6 haneli kodu girin."); return; }
    const valid = await verifyTwoFactor(verifyCode);
    if (valid) {
      await confirmTwoFactor();
      setTwoFAEnabled(true);
      setTwoFAStep("idle");
      setVerifyCode("");
    } else {
      setVerifyError("Geçersiz kod. Authenticator uygulamanızdaki güncel kodu girin.");
    }
  };

  const handleDisable2FA = async () => {
    if (!showDisableConfirm) { setShowDisableConfirm(true); return; }
    if (disableCode.length !== 6) { setVerifyError("6 haneli kodu girin."); return; }
    const valid = await verifyTwoFactor(disableCode);
    if (valid) {
      await disableTwoFactor();
      setTwoFAEnabled(false);
      setTotpSecret(null);
      setQrDataUrl(null);
      setShowDisableConfirm(false);
      setDisableCode("");
      setVerifyError("");
    } else {
      setVerifyError("Geçersiz kod.");
    }
  };

  const handleCancelSetup = async () => {
    await disableTwoFactor();
    setTwoFAStep("idle");
    setTotpSecret(null);
    setQrDataUrl(null);
    setVerifyCode("");
    setVerifyError("");
  };

  const copySecret = () => {
    if (totpSecret) {
      navigator.clipboard.writeText(totpSecret);
      setSecretCopied(true);
      setTimeout(() => setSecretCopied(false), 2000);
    }
  };

  // ===== GENERAL =====
  const handleLogoSave = async () => { if (!logo.trim()) { alert("Logo boş olamaz."); return; } await saveLogo(logo); alert("Logo güncellendi!"); };
  const handleEmailSave = async () => { await saveEmailSettings(emailSettings); alert("Email bildirim ayarları kaydedildi!"); };

  const uploadImage = (callback: (data: string) => void, maxW: number, maxH: number) => {
    const input = document.createElement("input"); input.type = "file"; input.accept = "image/*";
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]; if (!file) return;
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width, h = img.height;
        if (w > maxW || h > maxH) { const ratio = Math.min(maxW / w, maxH / h); w = Math.round(w * ratio); h = Math.round(h * ratio); }
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d"); ctx?.drawImage(img, 0, 0, w, h);
        callback(canvas.toDataURL("image/png", 0.9));
      };
      img.src = URL.createObjectURL(file);
    };
    input.click();
  };

  const handleLogoImageUpload = () => uploadImage(async (data) => { setLogoImage(data); await saveLogoImage(data); alert("Logo görseli kaydedildi!"); }, 200, 80);
  const handleLogoImageRemove = async () => { setLogoImage(""); await saveLogoImage(""); alert("Logo görseli kaldırıldı."); };
  const handleFaviconUpload = () => uploadImage(async (data) => { setFavicon(data); await saveFavicon(data); alert("Favicon kaydedildi!"); }, 64, 64);
  const handleFaviconRemove = async () => { setFavicon(""); await saveFavicon(""); alert("Favicon kaldırıldı."); };
  const handleSiteTitleSave = async () => { await saveSiteTitle(siteTitle); alert("Sekme başlığı kaydedildi!"); };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">Ayarlar</h1><p className="text-muted-foreground">Hesap ve güvenlik ayarlarınızı yönetin.</p></div>
      <Tabs defaultValue="security">
        <TabsList><TabsTrigger value="security">Güvenlik</TabsTrigger><TabsTrigger value="notifications">Bildirimler</TabsTrigger><TabsTrigger value="general">Genel</TabsTrigger></TabsList>

        {/* ===== GÜVENLIK ===== */}
        <TabsContent value="security" className="space-y-6">
          {/* Şifre */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" />Şifre Değiştir</CardTitle><CardDescription>Hesap şifrenizi güncelleyin.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Mevcut Şifre</Label><div className="relative"><Input type={showOld ? "text" : "password"} value={oldPassword} onChange={e => setOldPassword(e.target.value)} /><button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showOld ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
              <div className="grid md:grid-cols-2 gap-4"><div className="space-y-2"><Label>Yeni Şifre</Label><div className="relative"><Input type={showNew ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} /><button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div><div className="space-y-2"><Label>Yeni Şifre (Tekrar)</Label><Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} /></div></div>
              {passwordMsg && <p className={`text-sm ${passwordMsg.type === "success" ? "text-green-600" : "text-destructive"}`}>{passwordMsg.text}</p>}
              <Button onClick={handlePasswordChange}>Şifreyi Değiştir</Button>
            </CardContent>
          </Card>

          {/* 2FA - Authenticator App */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />İki Faktörlü Doğrulama (2FA)</CardTitle>
                  <CardDescription className="mt-1">Google Authenticator, Microsoft Authenticator veya Authy ile hesabınızı koruyun.</CardDescription>
                </div>
                <Badge variant={twoFAEnabled ? "default" : "secondary"} className="flex items-center gap-1">
                  <Smartphone className="h-3 w-3" />{twoFAEnabled ? "Aktif" : "Pasif"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* IDLE - Henüz etkin değil */}
              {twoFAStep === "idle" && !twoFAEnabled && (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                    <Smartphone className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Authenticator Uygulaması ile 2FA</p>
                      <p className="text-xs text-muted-foreground mt-1">Giriş yaparken telefonunuzdaki authenticator uygulamasından üretilen 6 haneli kodu girmeniz gerekecektir. Bu, hesabınıza ekstra güvenlik katmanı ekler.</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="outline" className="text-xs">Google Authenticator</Badge>
                        <Badge variant="outline" className="text-xs">Microsoft Authenticator</Badge>
                        <Badge variant="outline" className="text-xs">Authy</Badge>
                        <Badge variant="outline" className="text-xs">1Password</Badge>
                      </div>
                    </div>
                  </div>
                  <Button onClick={handleStartSetup} className="gap-2"><Shield className="h-4 w-4" />2FA Etkinleştir</Button>
                </div>
              )}

              {/* SETUP - QR Kod gösterimi */}
              {twoFAStep === "setup" && totpSecret && (
                <div className="space-y-6">
                  {/* Adım 1: QR Kod */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</div>
                      <h4 className="font-semibold text-sm">QR Kodu Tarayın</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">Authenticator uygulamanızı açın ve aşağıdaki QR kodu tarayın:</p>
                    <div className="flex justify-center">
                      <div className="bg-white p-4 rounded-xl shadow-sm border">
                        {qrDataUrl ? (
                          <img src={qrDataUrl} alt="2FA QR Code" width={200} height={200} className="rounded" />
                        ) : (
                          <div className="w-[200px] h-[200px] flex items-center justify-center text-muted-foreground animate-pulse">QR yükleniyor...</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Manuel giriş */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-bold">?</div>
                      <h4 className="font-semibold text-sm">QR Kod tarayamıyor musunuz?</h4>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">Bu anahtarı authenticator uygulamanıza manuel olarak girin:</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-lg px-3 py-2 font-mono text-sm tracking-wider select-all break-all">
                        {showSecret ? totpSecret : '••••••••••••••••••••••••••••••••'}
                      </div>
                      <Button variant="outline" size="icon" className="flex-shrink-0" onClick={() => setShowSecret(!showSecret)} title={showSecret ? "Gizle" : "Göster"}>
                        {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button variant="outline" size="icon" className="flex-shrink-0" onClick={copySecret} title="Kopyala">
                        {secretCopied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <div className="flex items-start gap-2 mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-yellow-700 dark:text-yellow-400">Bu anahtarı güvenli bir yere kaydedin! Telefonunuzu kaybederseniz bu anahtar ile 2FA&apos;yı kurtarabilirsiniz.</p>
                    </div>
                  </div>

                  {/* Adım 2: Doğrulama */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</div>
                      <h4 className="font-semibold text-sm">Doğrulama Kodunu Girin</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">Authenticator uygulamanızda görünen 6 haneli kodu girin:</p>
                    <div className="max-w-xs">
                      <Input
                        value={verifyCode}
                        onChange={e => { setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setVerifyError(''); }}
                        placeholder="000000"
                        maxLength={6}
                        className="text-center text-2xl tracking-[0.5em] font-mono h-14"
                        autoComplete="one-time-code"
                        inputMode="numeric"
                      />
                    </div>
                    {verifyError && <p className="text-sm text-destructive mt-2">{verifyError}</p>}
                    <div className="flex gap-2 mt-4">
                      <Button onClick={handleVerifyAndEnable} disabled={verifyCode.length !== 6} className="gap-2"><Check className="h-4 w-4" />Doğrula ve Etkinleştir</Button>
                      <Button variant="outline" onClick={handleCancelSetup}>İptal</Button>
                    </div>
                  </div>
                </div>
              )}

              {/* ENABLED - 2FA aktif */}
              {twoFAStep === "idle" && twoFAEnabled && (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-green-700 dark:text-green-400">2FA Aktif</p>
                      <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">Hesabınız authenticator uygulaması ile korunuyor. Giriş yaparken 6 haneli doğrulama kodu gerekecektir.</p>
                    </div>
                  </div>
                  {!showDisableConfirm ? (
                    <Button variant="destructive" onClick={() => setShowDisableConfirm(true)} className="gap-2"><Shield className="h-4 w-4" />2FA Devre Dışı Bırak</Button>
                  ) : (
                    <div className="space-y-3 p-4 border border-destructive/30 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-destructive">2FA&apos;yı devre dışı bırakmak için authenticator kodunuzu girin:</p>
                      </div>
                      <Input
                        value={disableCode}
                        onChange={e => { setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setVerifyError(''); }}
                        placeholder="000000"
                        maxLength={6}
                        className="max-w-xs text-center text-xl tracking-[0.5em] font-mono"
                        inputMode="numeric"
                      />
                      {verifyError && <p className="text-sm text-destructive">{verifyError}</p>}
                      <div className="flex gap-2">
                        <Button variant="destructive" onClick={handleDisable2FA} disabled={disableCode.length !== 6}>Devre Dışı Bırak</Button>
                        <Button variant="outline" onClick={() => { setShowDisableConfirm(false); setDisableCode(''); setVerifyError(''); }}>İptal</Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== BİLDİRİMLER ===== */}
        <TabsContent value="notifications" className="space-y-6">
          <Card><CardHeader><div className="flex items-center justify-between"><div><CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" />Email Bildirimleri</CardTitle><CardDescription>Yeni randevu geldiğinde email ile bildirim alın.</CardDescription></div><Badge variant={emailSettings.enabled ? "default" : "secondary"}>{emailSettings.enabled ? "Aktif" : "Pasif"}</Badge></div></CardHeader><CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Button variant={emailSettings.enabled ? "default" : "outline"} size="sm" onClick={() => setEmailSettings({ ...emailSettings, enabled: !emailSettings.enabled })}><Bell className="h-4 w-4 mr-2" />{emailSettings.enabled ? "Aktif" : "Pasif"}</Button>
            </div>
            {emailSettings.enabled && (<>
              <div className="space-y-2"><Label>Bildirim Email Adresi</Label><Input type="email" value={emailSettings.notificationEmail} onChange={e => setEmailSettings({ ...emailSettings, notificationEmail: e.target.value })} placeholder="admin@psikolog.com" /><p className="text-xs text-muted-foreground">Yeni randevu bildirimlerinin gönderileceği email adresi.</p></div>
              <div className="space-y-2"><Label>Webhook URL</Label><Input value={emailSettings.webhookUrl} onChange={e => setEmailSettings({ ...emailSettings, webhookUrl: e.target.value })} placeholder="https://hook.us1.make.com/..." /><p className="text-xs text-muted-foreground">Email göndermek için webhook URL&apos;i. <strong>Make.com</strong>, <strong>Zapier</strong> veya <strong>n8n</strong> gibi bir otomasyon aracı kullanabilirsiniz.</p></div>
              <div className="bg-muted rounded-lg p-4 space-y-2">
                <h4 className="text-sm font-semibold">Nasıl Kurulur?</h4>
                <ol className="text-xs text-muted-foreground space-y-1 list-decimal pl-4">
                  <li><strong>make.com</strong> adresinde ücretsiz hesap açın</li>
                  <li>Yeni bir senaryo oluşturun: <strong>Webhook</strong> → <strong>Email</strong></li>
                  <li>Webhook modülünden aldığınız URL&apos;i yukarıya yapıştırın</li>
                  <li>Email modülünde alıcı olarak kendi email adresinizi girin</li>
                  <li>Senaryoyu aktif edin - artık her randevuda email alacaksınız!</li>
                </ol>
              </div>
            </>)}
            <Button onClick={handleEmailSave}>Kaydet</Button>
          </CardContent></Card>
        </TabsContent>

        {/* ===== GENEL ===== */}
        <TabsContent value="general" className="space-y-6">
          {/* Logo Görseli */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Image className="h-5 w-5" />Site Logo Görseli</CardTitle><CardDescription>Navbar ve footer&apos;da görünecek logo görseli. Önerilen boyut: max 200x80 piksel. Yüklediğiniz görsel otomatik boyutlandırılır.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {logoImage ? (
                <div className="space-y-3">
                  <div className="border rounded-lg p-4 bg-muted/30 inline-block">
                    <img src={logoImage} alt="Logo" className="max-h-16 object-contain" />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleLogoImageUpload} className="gap-2"><Upload className="h-4 w-4" />Değiştir</Button>
                    <Button variant="outline" size="sm" onClick={handleLogoImageRemove} className="gap-2 text-destructive"><X className="h-4 w-4" />Kaldır</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
                    <Image className="h-10 w-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Logo görseli yüklenmemiş</p>
                    <p className="text-xs mt-1">Yüklenmezse logo metni kullanılır</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleLogoImageUpload} className="gap-2"><Upload className="h-4 w-4" />Görsel Yükle</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Logo Metni */}
          <Card>
            <CardHeader><CardTitle>Logo Metni</CardTitle><CardDescription>Logo görseli yoksa veya görselin yanında görünecek site adı.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Logo Metni</Label><Input value={logo} onChange={e => setLogo(e.target.value)} placeholder="PsikoPanel" /></div>
              <Button onClick={handleLogoSave}>Kaydet</Button>
            </CardContent>
          </Card>

          {/* Favicon */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><FileImage className="h-5 w-5" />Favicon</CardTitle><CardDescription>Tarayıcı sekmesinde görünen küçük ikon. Önerilen boyut: 64x64 piksel. Kare bir görsel yükleyin.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {favicon ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="border rounded-lg p-3 bg-muted/30 inline-block">
                      <img src={favicon} alt="Favicon" className="w-8 h-8 object-contain" />
                    </div>
                    <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                      <img src={favicon} alt="" className="w-4 h-4" />
                      <span className="text-xs text-muted-foreground truncate max-w-[180px]">{siteTitle || "PsikoPanel"}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">← Sekme önizleme</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleFaviconUpload} className="gap-2"><Upload className="h-4 w-4" />Değiştir</Button>
                    <Button variant="outline" size="sm" onClick={handleFaviconRemove} className="gap-2 text-destructive"><X className="h-4 w-4" />Kaldır</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="border-2 border-dashed rounded-lg p-6 text-center text-muted-foreground">
                    <FileImage className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Favicon yüklenmemiş</p>
                    <p className="text-xs mt-1">Varsayılan tarayıcı ikonu kullanılır</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleFaviconUpload} className="gap-2"><Upload className="h-4 w-4" />Favicon Yükle</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sekme Başlığı */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" />Tarayıcı Sekme Başlığı</CardTitle><CardDescription>Google sekmesinde favicon&apos;ın yanında görünen yazı. Arama motorlarında da başlık olarak gösterilir.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Sekme Başlığı</Label>
                <Input value={siteTitle} onChange={e => setSiteTitle(e.target.value)} placeholder="PsikoPanel - Profesyonel Psikolojik Danışmanlık" />
                <p className="text-xs text-muted-foreground">Örnek: &quot;Psk. Ayşe Yılmaz - Klinik Psikolog&quot; veya &quot;İstanbul Psikolojik Danışmanlık Merkezi&quot;</p>
              </div>
              {siteTitle && (
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Google sekmesi önizleme:</p>
                  <div className="flex items-center gap-2 bg-background rounded px-3 py-1.5 border max-w-sm">
                    {favicon ? <img src={favicon} alt="" className="w-4 h-4 flex-shrink-0" /> : <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                    <span className="text-sm truncate">{siteTitle}</span>
                  </div>
                </div>
              )}
              <Button onClick={handleSiteTitleSave}>Kaydet</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
