"use client";
import { useState, useEffect } from "react";
import { Package, Plus, Edit, Trash2, Star, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { getPackages, savePackages, generateId, type TherapyPackage } from "@/lib/content-manager";

const emptyPkg: Omit<TherapyPackage,"id"> = { name:"",description:"",price:0,duration:"50 dakika",sessions:1,features:[""],popular:false };

export default function PackagesPage() {
  const [packages, setPackages] = useState<TherapyPackage[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TherapyPackage|null>(null);
  const [form, setForm] = useState(emptyPkg);

  useEffect(() => { getPackages().then(setPackages); }, []);
  const refresh = async () => setPackages(await getPackages());
  const openNew = () => { setEditing(null); setForm(emptyPkg); setDialogOpen(true); };
  const openEdit = (p: TherapyPackage) => { setEditing(p); setForm({name:p.name,description:p.description,price:p.price,duration:p.duration,sessions:p.sessions,features:[...p.features],popular:p.popular||false}); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.name||!form.description||form.price<=0) { alert("Lütfen gerekli alanları doldurun."); return; }
    const clean = form.features.filter(f=>f.trim()!=="");
    if (clean.length===0) { alert("En az bir özellik ekleyin."); return; }
    const all = await getPackages();
    if (editing) { const i=all.findIndex(p=>p.id===editing.id); if(i!==-1) all[i]={...editing,...form,features:clean}; }
    else { all.push({id:generateId(),...form,features:clean}); }
    await savePackages(all); setDialogOpen(false); await refresh();
  };

  const handleDelete = async (id: string) => { if (!confirm("Bu paketi silmek istediğinize emin misiniz?")) return; await savePackages((await getPackages()).filter(p=>p.id!==id)); await refresh(); };
  const addFeature = () => setForm({...form,features:[...form.features,""]});
  const removeFeature = (i:number) => setForm({...form,features:form.features.filter((_,idx)=>idx!==i)});
  const updateFeature = (i:number,v:string) => { const f=[...form.features]; f[i]=v; setForm({...form,features:f}); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold tracking-tight">Paketler</h1><p className="text-muted-foreground">Terapi paketlerini yönetin.</p></div><Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" />Yeni Paket</Button></div>
      {packages.length===0?(<Card className="py-12"><CardContent className="text-center"><Package className="h-12 w-12 mx-auto mb-3 opacity-50 text-muted-foreground" /><p className="text-muted-foreground">Henüz paket eklenmemiş.</p><Button onClick={openNew} className="mt-4">İlk Paketi Ekle</Button></CardContent></Card>):(
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{packages.map(p=>(<Card key={p.id} className={`flex flex-col h-full relative ${p.popular?"border-primary shadow-lg":""}`}>{p.popular&&<Badge className="absolute -top-3 left-1/2 -translate-x-1/2"><Star className="h-3 w-3 mr-1"/>En Popüler</Badge>}<CardHeader className="flex-shrink-0"><div className="flex items-start justify-between"><div><CardTitle className="text-xl">{p.name}</CardTitle><p className="text-sm text-muted-foreground mt-1">{p.description}</p></div><div className="flex gap-1"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={()=>openEdit(p)}><Edit className="h-3.5 w-3.5"/></Button><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={()=>handleDelete(p.id)}><Trash2 className="h-3.5 w-3.5"/></Button></div></div></CardHeader><CardContent className="flex flex-col flex-grow"><div className="flex-grow"><div className="mb-3"><span className="text-3xl font-bold">{p.price.toLocaleString("tr-TR")} ₺</span><span className="text-muted-foreground text-sm ml-1">/ {p.sessions} seans</span></div><p className="text-sm text-muted-foreground mb-3">Seans süresi: {p.duration}</p><ul className="space-y-1.5">{p.features.map((f,i)=>(<li key={i} className="flex items-start gap-2 text-sm"><span className="text-primary mt-0.5">•</span>{f}</li>))}</ul></div></CardContent></Card>))}</div>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{editing?"Paketi Düzenle":"Yeni Paket"}</DialogTitle></DialogHeader><div className="space-y-4"><div className="space-y-2"><Label>Paket Adı *</Label><Input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Örn: Başlangıç Paketi"/></div><div className="space-y-2"><Label>Açıklama *</Label><Input value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Kısa açıklama"/></div><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Fiyat (₺) *</Label><Input type="number" value={form.price} onChange={e=>setForm({...form,price:parseInt(e.target.value)||0})}/></div><div className="space-y-2"><Label>Seans Sayısı *</Label><Input type="number" value={form.sessions} onChange={e=>setForm({...form,sessions:parseInt(e.target.value)||1})}/></div></div><div className="space-y-2"><Label>Seans Süresi</Label><Input value={form.duration} onChange={e=>setForm({...form,duration:e.target.value})} placeholder="50 dakika"/></div><div className="space-y-2"><div className="flex items-center justify-between"><Label>Özellikler</Label><Button type="button" variant="outline" size="sm" onClick={addFeature}><Plus className="h-3 w-3 mr-1"/>Ekle</Button></div>{form.features.map((f,i)=>(<div key={i} className="flex gap-2"><Input value={f} onChange={e=>updateFeature(i,e.target.value)} placeholder={`Özellik ${i+1}`}/>{form.features.length>1&&<Button type="button" variant="ghost" size="icon" onClick={()=>removeFeature(i)} className="flex-shrink-0"><X className="h-4 w-4"/></Button>}</div>))}</div><div className="flex items-center gap-2"><Button type="button" variant={form.popular?"default":"outline"} size="sm" onClick={()=>setForm({...form,popular:!form.popular})}><Star className={`h-3 w-3 mr-1 ${form.popular?"fill-current":""}`}/>{form.popular?"Popüler (Aktif)":"Popüler Yap"}</Button></div></div><DialogFooter><Button variant="outline" onClick={()=>setDialogOpen(false)}>İptal</Button><Button onClick={handleSave}>{editing?"Güncelle":"Ekle"}</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}
