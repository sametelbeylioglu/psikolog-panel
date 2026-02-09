"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Brain, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, initializeAuth, isTwoFactorEnabled, verifyTwoFactor, isAuthenticated } from "@/lib/content-manager";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState(""); const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);

  useEffect(() => { initializeAuth(); if (isAuthenticated()) router.push("/admin"); }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    if (showTwoFactor) { if (verifyTwoFactor(twoFactorCode)) { login(email, password); router.push("/admin"); } else { setError("Geçersiz 2FA kodu."); setLoading(false); } return; }
    if (!email || !password) { setError("Lütfen tüm alanları doldurun."); setLoading(false); return; }
    const success = login(email, password);
    if (success) { if (isTwoFactorEnabled()) { setShowTwoFactor(true); setLoading(false); return; } router.push("/admin"); }
    else { setError("Geçersiz email veya şifre."); setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4"><Link href="/" className="flex items-center gap-2"><Brain className="h-8 w-8 text-primary" /><span className="text-2xl font-bold">PsikoPanel</span></Link></div>
          <CardTitle className="text-2xl">Giriş Yap</CardTitle>
          <CardDescription>{showTwoFactor ? "İki faktörlü doğrulama kodunuzu girin" : "Admin paneline erişmek için giriş yapın"}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!showTwoFactor ? (<>
              <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" placeholder="admin@psikolog.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="password">Şifre</Label><div className="relative"><Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
            </>) : (
              <div className="space-y-2"><Label htmlFor="twoFactor">2FA Kodu</Label><Input id="twoFactor" type="text" placeholder="6 haneli kod" maxLength={6} value={twoFactorCode} onChange={e => setTwoFactorCode(e.target.value)} className="text-center text-2xl tracking-widest" /></div>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>{loading ? "Giriş yapılıyor..." : showTwoFactor ? "Doğrula" : "Giriş Yap"}</Button>
            {showTwoFactor && <Button type="button" variant="ghost" className="w-full" onClick={() => { setShowTwoFactor(false); setTwoFactorCode(""); setError(""); }}>Geri Dön</Button>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
