"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Brain, Eye, EyeOff, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, initializeAuth, isTwoFactorEnabled, verifyTwoFactor, isAuthenticated } from "@/lib/content-manager";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const codeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const check = async () => {
      await initializeAuth();
      if (await isAuthenticated()) router.push("/admin");
    };
    check();
  }, [router]);

  // 2FA ekranı açıldığında input'a focus
  useEffect(() => {
    if (showTwoFactor && codeInputRef.current) {
      codeInputRef.current.focus();
    }
  }, [showTwoFactor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // 2FA doğrulama adımı
    if (showTwoFactor) {
      if (twoFactorCode.length !== 6) {
        setError("6 haneli doğrulama kodunu girin.");
        setLoading(false);
        return;
      }
      const valid = await verifyTwoFactor(twoFactorCode);
      if (valid) {
        // 2FA başarılı - login'i tamamla
        localStorage.setItem("isAuthenticated", "true");
        router.push("/admin");
      } else {
        setError("Geçersiz doğrulama kodu. Authenticator uygulamanızdaki güncel kodu girin.");
        setTwoFactorCode("");
        setLoading(false);
      }
      return;
    }

    // Email/şifre doğrulama adımı
    if (!email || !password) { setError("Lütfen tüm alanları doldurun."); setLoading(false); return; }

    const success = await login(email, password);
    if (success) {
      // 2FA aktif mi kontrol et
      if (await isTwoFactorEnabled()) {
        // 2FA aktif - oturumu henüz açma, kod iste
        localStorage.removeItem("isAuthenticated");
        setShowTwoFactor(true);
        setLoading(false);
        return;
      }
      // 2FA yok - direkt giriş
      router.push("/admin");
    } else {
      setError("Geçersiz email veya şifre.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Link href="/" className="flex items-center gap-2"><Brain className="h-8 w-8 text-primary" /><span className="text-2xl font-bold">PsikoPanel</span></Link>
          </div>
          {!showTwoFactor ? (
            <>
              <CardTitle className="text-2xl">Giriş Yap</CardTitle>
              <CardDescription>Admin paneline erişmek için giriş yapın</CardDescription>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-2"><div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"><Shield className="h-6 w-6 text-primary" /></div></div>
              <CardTitle className="text-2xl">İki Faktörlü Doğrulama</CardTitle>
              <CardDescription>Authenticator uygulamanızdaki 6 haneli kodu girin</CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!showTwoFactor ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="admin@psikolog.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Şifre</Label>
                  <div className="relative">
                    <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    ref={codeInputRef}
                    id="twoFactor"
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    value={twoFactorCode}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setTwoFactorCode(val);
                      setError('');
                    }}
                    className="text-center text-3xl tracking-[0.5em] font-mono h-16"
                    autoComplete="one-time-code"
                    inputMode="numeric"
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Google Authenticator, Microsoft Authenticator veya Authy uygulamanızı açın ve kodu girin.
                </p>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Doğrulanıyor...</>
              ) : showTwoFactor ? (
                <><Shield className="h-4 w-4 mr-2" />Doğrula</>
              ) : (
                "Giriş Yap"
              )}
            </Button>

            {showTwoFactor && (
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => { setShowTwoFactor(false); setTwoFactorCode(""); setError(""); }}
              >
                Geri Dön
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
