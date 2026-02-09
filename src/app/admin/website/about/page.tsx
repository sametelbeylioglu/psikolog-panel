"use client";
import { useState, useEffect } from "react";
import { Save, Plus, Trash2, Upload, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAboutContent, saveAboutContent, type AboutContent } from "@/lib/content-manager";

export default function AboutCMSPage() {
  const [about, setAbout] = useState<AboutContent>({ title: "", description: "", qualifications: [], experience: "", approach: "" });
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setAbout(getAboutContent()); setMounted(true); }, []);

  if (!mounted) return null;

  const handleImage = () => {
    const input = document.createElement("input"); input.type = "file"; input.accept = "image/*";
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) { const r = new FileReader(); r.onload = (ev) => setAbout({ ...about, image: ev.target?.result as string }); r.readAsDataURL(file); }
    };
    input.click();
  };

  const removeImage = () => { if (confirm("Görseli kaldırmak istediğinize emin misiniz?")) setAbout({ ...about, image: undefined }); };

  const addQualification = () => setAbout({ ...about, qualifications: [...about.qualifications, ""] });
  const updateQualification = (i: number, v: string) => { const q = [...about.qualifications]; q[i] = v; setAbout({ ...about, qualifications: q }); };
  const removeQualification = (i: number) => setAbout({ ...about, qualifications: about.qualifications.filter((_, idx) => idx !== i) });

  const handleSave = () => {
    const clean = { ...about, qualifications: about.qualifications.filter(q => q.trim() !== "") };
    saveAboutContent(clean);
    alert("Hakkımda sayfası güncellendi!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Hakkımda Düzenleme</h1>
        <p className="text-muted-foreground">Ana sayfadaki hakkımda bölümünü düzenleyin.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Hakkımda İçeriği</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>Başlık</Label><Input value={about.title} onChange={e => setAbout({ ...about, title: e.target.value })} placeholder="Hakkımda" /></div>
          <div className="space-y-2"><Label>Açıklama</Label>
            <textarea className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" value={about.description} onChange={e => setAbout({ ...about, description: e.target.value })} />
          </div>
          <div className="space-y-2"><Label>Deneyim</Label><Input value={about.experience} onChange={e => setAbout({ ...about, experience: e.target.value })} placeholder="15+ yıl klinik deneyim" /></div>
          <div className="space-y-2"><Label>Yaklaşım</Label>
            <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" value={about.approach} onChange={e => setAbout({ ...about, approach: e.target.value })} />
          </div>

          {/* Qualifications */}
          <div className="space-y-2">
            <div className="flex items-center justify-between"><Label>Yeterlilikler / Sertifikalar</Label><Button variant="outline" size="sm" onClick={addQualification}><Plus className="h-3 w-3 mr-1" />Ekle</Button></div>
            {about.qualifications.map((q, i) => (
              <div key={i} className="flex gap-2">
                <Input value={q} onChange={e => updateQualification(i, e.target.value)} placeholder={`Yeterlilik ${i + 1}`} />
                <Button variant="ghost" size="icon" onClick={() => removeQualification(i)} className="flex-shrink-0"><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>

          {/* Image */}
          <div className="space-y-2">
            <Label>Profil Görseli</Label>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleImage} className="gap-2"><Upload className="h-4 w-4" />Görsel Yükle</Button>
              {about.image && <Button variant="outline" onClick={removeImage} className="gap-2 text-destructive"><X className="h-4 w-4" />Kaldır</Button>}
            </div>
            {about.image && <img src={about.image} alt="Profil" className="mt-2 max-h-40 rounded-lg object-cover" />}
          </div>

          <Button onClick={handleSave} className="gap-2"><Save className="h-4 w-4" />Kaydet</Button>
        </CardContent>
      </Card>
    </div>
  );
}
