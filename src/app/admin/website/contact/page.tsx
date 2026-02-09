"use client";
import { useState, useEffect } from "react";
import { Save, MapPin, Phone, Mail, Clock, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getContactInfo, saveContactInfo, type ContactInfo } from "@/lib/content-manager";

export default function ContactCMSPage() {
  const [contact, setContact] = useState<ContactInfo>({address:"",phone:"",email:"",workingHours:"",socialMedia:{}});
  const [mounted, setMounted] = useState(false);

  useEffect(() => { getContactInfo().then(d=>{setContact(d);setMounted(true);}); }, []);
  if (!mounted) return null;

  const handleSave = async () => { if(!contact.phone||!contact.email){alert("Telefon ve email gerekli.");return;} await saveContactInfo(contact); alert("İletişim bilgileri güncellendi!"); };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">İletişim Düzenleme</h1><p className="text-muted-foreground">Ana sayfadaki iletişim bilgilerini düzenleyin.</p></div>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5"/>Temel Bilgiler</CardTitle></CardHeader><CardContent className="space-y-4">
          <div className="space-y-2"><Label><Phone className="inline h-4 w-4 mr-1"/>Telefon *</Label><Input value={contact.phone} onChange={e=>setContact({...contact,phone:e.target.value})} placeholder="0212 555 44 33"/></div>
          <div className="space-y-2"><Label><Mail className="inline h-4 w-4 mr-1"/>Email *</Label><Input value={contact.email} onChange={e=>setContact({...contact,email:e.target.value})} placeholder="info@psikolog.com"/></div>
          <div className="space-y-2"><Label><MapPin className="inline h-4 w-4 mr-1"/>Adres</Label><Input value={contact.address} onChange={e=>setContact({...contact,address:e.target.value})} placeholder="Adres bilgisi"/></div>
          <div className="space-y-2"><Label><Clock className="inline h-4 w-4 mr-1"/>Çalışma Saatleri</Label><textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" value={contact.workingHours} onChange={e=>setContact({...contact,workingHours:e.target.value})} placeholder="Pazartesi - Cuma: 09:00 - 18:00"/></div>
          <div className="space-y-2"><Label>Harita Embed Kodu (iframe)</Label><textarea className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" value={contact.mapEmbed||""} onChange={e=>setContact({...contact,mapEmbed:e.target.value})} placeholder="Google Maps iframe embed kodu"/></div>
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5"/>Sosyal Medya</CardTitle><CardDescription>Sosyal medya hesap linkleriniz.</CardDescription></CardHeader><CardContent className="space-y-4">
          <div className="space-y-2"><Label>Instagram</Label><Input value={contact.socialMedia.instagram||""} onChange={e=>setContact({...contact,socialMedia:{...contact.socialMedia,instagram:e.target.value}})} placeholder="https://instagram.com/hesap"/></div>
          <div className="space-y-2"><Label>Facebook</Label><Input value={contact.socialMedia.facebook||""} onChange={e=>setContact({...contact,socialMedia:{...contact.socialMedia,facebook:e.target.value}})} placeholder="https://facebook.com/sayfa"/></div>
          <div className="space-y-2"><Label>Twitter / X</Label><Input value={contact.socialMedia.twitter||""} onChange={e=>setContact({...contact,socialMedia:{...contact.socialMedia,twitter:e.target.value}})} placeholder="https://twitter.com/hesap"/></div>
          <div className="space-y-2"><Label>LinkedIn</Label><Input value={contact.socialMedia.linkedin||""} onChange={e=>setContact({...contact,socialMedia:{...contact.socialMedia,linkedin:e.target.value}})} placeholder="https://linkedin.com/in/profil"/></div>
        </CardContent></Card>
      </div>
      <Button onClick={handleSave} className="gap-2"><Save className="h-4 w-4"/>Tüm Değişiklikleri Kaydet</Button>
    </div>
  );
}
