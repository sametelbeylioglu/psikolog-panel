"use client";
import { useState, useEffect } from "react";
import { Save, Plus, Trash2, Upload, X, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getHeroContent, saveHeroContent, getFeatures, saveFeatures, getStats, saveStats, getSectionVisibility, saveSectionVisibility, generateId, type HeroContent, type Feature, type Stat, type SectionVisibility } from "@/lib/content-manager";

export default function HomepageCMSPage() {
  const [hero, setHero] = useState<HeroContent>({title:"",subtitle:"",description:"",buttonText:"",buttonLink:""});
  const [features, setFeatures] = useState<Feature[]>([]); const [stats, setStats] = useState<Stat[]>([]); const [mounted, setMounted] = useState(false);
  const [visibility, setVisibility] = useState<SectionVisibility>({ hero:true, stats:true, features:true, about:true, packages:true, contact:true, navbar:true });

  useEffect(() => { const load = async () => { setHero(await getHeroContent()); setFeatures(await getFeatures()); setStats(await getStats()); setVisibility(await getSectionVisibility()); setMounted(true); }; load(); }, []);
  if (!mounted) return null;

  const handleHeroSave = async () => { await saveHeroContent(hero); alert("Hero bölümü güncellendi!"); };
  const handleHeroImage = () => { const input=document.createElement("input");input.type="file";input.accept="image/*";input.onchange=(e:Event)=>{const file=(e.target as HTMLInputElement).files?.[0];if(file){const r=new FileReader();r.onload=ev=>setHero({...hero,image:ev.target?.result as string});r.readAsDataURL(file);}};input.click(); };
  const removeHeroImage = () => { if(confirm("Görseli kaldırmak istediğinize emin misiniz?")) setHero({...hero,image:undefined}); };
  const addFeature = () => setFeatures([...features,{id:generateId(),icon:"Brain",title:"",description:""}]);
  const updateFeature = (id:string,updates:Partial<Feature>) => setFeatures(features.map(f=>f.id===id?{...f,...updates}:f));
  const removeFeature = (id:string) => { if(confirm("Bu özelliği silmek istediğinize emin misiniz?")) setFeatures(features.filter(f=>f.id!==id)); };
  const saveAllFeatures = async () => { await saveFeatures(features); alert("Özellikler güncellendi!"); };
  const addStat = () => setStats([...stats,{id:generateId(),value:"",label:""}]);
  const updateStat = (id:string,updates:Partial<Stat>) => setStats(stats.map(s=>s.id===id?{...s,...updates}:s));
  const removeStat = (id:string) => { if(confirm("Bu istatistiği silmek istediğinize emin misiniz?")) setStats(stats.filter(s=>s.id!==id)); };
  const saveAllStats = async () => { await saveStats(stats); alert("İstatistikler güncellendi!"); };
  const iconOptions=["Brain","Heart","Users","Shield","Star","CheckCircle"];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">Ana Sayfa Düzenleme</h1><p className="text-muted-foreground">Public ana sayfanızın içeriğini düzenleyin.</p></div>
      <Tabs defaultValue="visibility"><TabsList><TabsTrigger value="visibility">Bölüm Görünürlüğü</TabsTrigger><TabsTrigger value="hero">Hero Bölümü</TabsTrigger><TabsTrigger value="features">Hizmetler</TabsTrigger><TabsTrigger value="stats">İstatistikler</TabsTrigger></TabsList>
        <TabsContent value="hero"><Card><CardHeader><CardTitle>Hero Bölümü</CardTitle><CardDescription>Ana sayfanın üst kısmında görünen bölüm.</CardDescription></CardHeader><CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4"><div className="space-y-2"><Label>Alt Başlık (Badge)</Label><Input value={hero.subtitle} onChange={e=>setHero({...hero,subtitle:e.target.value})} placeholder="Uzman Psikolog"/></div><div className="space-y-2"><Label>Buton Linki</Label><Input value={hero.buttonLink} onChange={e=>setHero({...hero,buttonLink:e.target.value})} placeholder="/randevu"/></div></div>
          <div className="space-y-2"><Label>Ana Başlık</Label><Input value={hero.title} onChange={e=>setHero({...hero,title:e.target.value})} placeholder="Profesyonel Psikolojik Danışmanlık"/></div>
          <div className="space-y-2"><Label>Açıklama</Label><textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" value={hero.description} onChange={e=>setHero({...hero,description:e.target.value})}/></div>
          <div className="space-y-2"><Label>Buton Metni</Label><Input value={hero.buttonText} onChange={e=>setHero({...hero,buttonText:e.target.value})} placeholder="Randevu Al"/></div>
          <div className="space-y-2"><Label>Hero Görseli</Label><div className="flex gap-2"><Button variant="outline" onClick={handleHeroImage} className="gap-2"><Upload className="h-4 w-4"/>Görsel Yükle</Button>{hero.image&&<Button variant="outline" onClick={removeHeroImage} className="gap-2 text-destructive"><X className="h-4 w-4"/>Görseli Kaldır</Button>}</div>{hero.image&&<img src={hero.image} alt="Hero" className="mt-2 max-h-40 rounded-lg object-cover"/>}</div>
          <Button onClick={handleHeroSave} className="gap-2"><Save className="h-4 w-4"/>Kaydet</Button>
        </CardContent></Card></TabsContent>
        <TabsContent value="features"><Card><CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>Hizmetler</CardTitle><CardDescription>Ana sayfada gösterilen hizmet kartları.</CardDescription></div><Button onClick={addFeature} className="gap-2"><Plus className="h-4 w-4"/>Ekle</Button></CardHeader><CardContent className="space-y-4">
          {features.map((f,i)=>(<div key={f.id} className="border rounded-lg p-4 space-y-3"><div className="flex items-center justify-between"><span className="text-sm font-medium text-muted-foreground">Hizmet {i+1}</span><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={()=>removeFeature(f.id)}><Trash2 className="h-4 w-4"/></Button></div><div className="grid md:grid-cols-3 gap-3"><div className="space-y-1"><Label className="text-xs">İkon</Label><select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={f.icon} onChange={e=>updateFeature(f.id,{icon:e.target.value})}>{iconOptions.map(ic=><option key={ic} value={ic}>{ic}</option>)}</select></div><div className="space-y-1 md:col-span-2"><Label className="text-xs">Başlık</Label><Input value={f.title} onChange={e=>updateFeature(f.id,{title:e.target.value})} placeholder="Hizmet adı"/></div></div><div className="space-y-1"><Label className="text-xs">Açıklama</Label><Input value={f.description} onChange={e=>updateFeature(f.id,{description:e.target.value})} placeholder="Kısa açıklama"/></div></div>))}
          <Button onClick={saveAllFeatures} className="gap-2"><Save className="h-4 w-4"/>Tümünü Kaydet</Button>
        </CardContent></Card></TabsContent>
        <TabsContent value="stats"><Card><CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>İstatistikler</CardTitle><CardDescription>Ana sayfadaki istatistik sayaçları.</CardDescription></div><Button onClick={addStat} className="gap-2"><Plus className="h-4 w-4"/>Ekle</Button></CardHeader><CardContent className="space-y-4">
          {stats.map(s=>(<div key={s.id} className="flex items-end gap-3 border rounded-lg p-4"><div className="flex-1 space-y-1"><Label className="text-xs">Değer</Label><Input value={s.value} onChange={e=>updateStat(s.id,{value:e.target.value})} placeholder="1000+"/></div><div className="flex-1 space-y-1"><Label className="text-xs">Etiket</Label><Input value={s.label} onChange={e=>updateStat(s.id,{label:e.target.value})} placeholder="Mutlu Danışan"/></div><Button variant="ghost" size="icon" className="h-10 text-destructive flex-shrink-0" onClick={()=>removeStat(s.id)}><Trash2 className="h-4 w-4"/></Button></div>))}
          <Button onClick={saveAllStats} className="gap-2"><Save className="h-4 w-4"/>Tümünü Kaydet</Button>
        </CardContent></Card></TabsContent>

        <TabsContent value="visibility"><Card><CardHeader><CardTitle>Bölüm Görünürlüğü</CardTitle><CardDescription>Ana sayfadaki bölümleri gösterin veya gizleyin. Kapalı olan bölümler ziyaretçilere görünmez.</CardDescription></CardHeader><CardContent className="space-y-4">
          {([
            { key: 'navbar' as const, label: 'Navigasyon Menüsü', desc: 'Üst menü çubuğu (logo, linkler, randevu butonu)' },
            { key: 'hero' as const, label: 'Hero Bölümü', desc: 'Ana başlık, açıklama ve aksiyon butonları' },
            { key: 'stats' as const, label: 'İstatistikler', desc: 'Sayaç/istatistik bölümü' },
            { key: 'features' as const, label: 'Hizmetler', desc: 'Hizmet kartları bölümü' },
            { key: 'about' as const, label: 'Hakkımda', desc: 'Hakkımda / tanıtım bölümü' },
            { key: 'packages' as const, label: 'Terapi Paketleri', desc: 'Fiyatlandırma ve paket kartları' },
            { key: 'contact' as const, label: 'İletişim', desc: 'Telefon, email ve adres bilgileri' },
          ]).map(item => (
            <div key={item.key} className="flex items-center justify-between border rounded-lg p-4">
              <div>
                <div className="font-medium">{item.label}</div>
                <div className="text-sm text-muted-foreground">{item.desc}</div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={visibility[item.key]}
                onClick={() => setVisibility(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${visibility[item.key] ? 'bg-primary' : 'bg-muted-foreground/30'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${visibility[item.key] ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
              </button>
            </div>
          ))}
          <Button onClick={async () => { await saveSectionVisibility(visibility); alert("Bölüm görünürlüğü kaydedildi!"); }} className="gap-2"><Save className="h-4 w-4"/>Kaydet</Button>
        </CardContent></Card></TabsContent>
      </Tabs>
    </div>
  );
}
