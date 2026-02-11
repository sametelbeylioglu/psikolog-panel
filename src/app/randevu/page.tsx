"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle, Calendar, Clock, User, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import WhatsAppButton from "@/components/whatsapp-button";
import { getPackages, saveAppointment, addNotification, sendEmailNotification, getLogo, getLogoImage, generateId, getTakenAndReservedForDate, addSlotReservation, removeSlotReservation, type TherapyPackage } from "@/lib/content-manager";

export default function RandevuPage() {
  const [step, setStep] = useState(1);
  const [packages, setPackages] = useState<TherapyPackage[]>([]);
  const [logo, setLogo] = useState("");
  const [logoImg, setLogoImg] = useState("");
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<TherapyPackage | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", date: "", time: "", notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [slotStatus, setSlotStatus] = useState<{ taken: string[]; reserved: string[] }>({ taken: [], reserved: [] });

  useEffect(() => { const load = async () => { setPackages(await getPackages()); setLogo(await getLogo()); setLogoImg(await getLogoImage()); setLogoLoaded(true); }; load(); }, []);

  useEffect(() => {
    if (!formData.date) { setSlotStatus({ taken: [], reserved: [] }); return; }
    getTakenAndReservedForDate(formData.date).then(setSlotStatus);
    const interval = setInterval(() => { getTakenAndReservedForDate(formData.date).then(setSlotStatus); }, 10000);
    return () => clearInterval(interval);
  }, [formData.date]);

  const availableTimes = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

  const handleTimeSelect = async (t: string) => {
    const { taken, reserved } = slotStatus;
    if (taken.includes(t)) return;
    if (reserved.includes(t) && formData.time !== t) return;
    const prevTime = formData.time;
    if (prevTime) await removeSlotReservation(formData.date, prevTime);
    if (t === formData.time) { setFormData(f => ({ ...f, time: "" })); return; }
    await addSlotReservation(formData.date, t);
    setFormData(f => ({ ...f, time: t }));
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Ad soyad gerekli";
    if (!formData.email.trim()) newErrors.email = "Email gerekli";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Geçerli bir email girin";
    if (!formData.phone.trim()) newErrors.phone = "Telefon gerekli";
    if (!formData.date) newErrors.date = "Tarih seçin";
    if (!formData.time) newErrors.time = "Saat seçin";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!selectedPackage) return;
    await removeSlotReservation(formData.date, formData.time);
    const id = generateId();
    await saveAppointment({
      id, clientName: formData.name, clientEmail: formData.email, clientPhone: formData.phone,
      packageId: selectedPackage.id, packageName: selectedPackage.name,
      date: formData.date, time: formData.time, status: "pending", notes: formData.notes,
      createdAt: new Date().toISOString(),
    });
    await addNotification({
      id: generateId(), type: "appointment", title: "Yeni Randevu Talebi",
      message: `${formData.name} - ${selectedPackage.name} için yeni randevu talebi.`,
      read: false, createdAt: new Date().toISOString(),
    });
    // Email bildirimi gonder (ayarlanmissa)
    await sendEmailNotification({
      clientName: formData.name, clientEmail: formData.email, clientPhone: formData.phone,
      packageName: selectedPackage.name, date: formData.date, time: formData.time, notes: formData.notes,
    });
    setSubmitted(true);
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-muted/50">
      <nav className="border-b bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">{logoLoaded && logoImg ? <img src={logoImg} alt={logo || "Logo"} className="h-8 object-contain" /> : null}{logoLoaded && logo ? <span className="text-xl font-bold">{logo}</span> : null}</Link>
          <Link href="/"><Button variant="ghost" className="gap-2"><ArrowLeft className="h-4 w-4" />Ana Sayfa</Button></Link>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center mb-8 gap-2">
          {[{ n: 1, t: "Paket Seçimi" }, { n: 2, t: "Bilgileriniz" }, { n: 3, t: "Onay" }].map((s, i) => (
            <div key={s.n} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= s.n ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{step > s.n ? <CheckCircle className="h-4 w-4" /> : s.n}</div>
              <span className={`text-sm hidden sm:inline ${step >= s.n ? "text-foreground font-medium" : "text-muted-foreground"}`}>{s.t}</span>
              {i < 2 && <div className={`w-8 sm:w-16 h-0.5 ${step > s.n ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>
        {submitted ? (
          <Card className="text-center py-12"><CardContent>
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Randevunuz Alındı!</h2>
            <p className="text-muted-foreground mb-6">Randevu talebiniz başarıyla oluşturuldu. En kısa sürede sizinle iletişime geçeceğiz.</p>
            <div className="bg-muted rounded-lg p-4 max-w-sm mx-auto text-left space-y-2 text-sm">
              <p><strong>Paket:</strong> {selectedPackage?.name}</p>
              <p><strong>Tarih:</strong> {formData.date}</p>
              <p><strong>Saat:</strong> {formData.time}</p>
              <p><strong>İsim:</strong> {formData.name}</p>
            </div>
            <Link href="/" className="mt-6 inline-block"><Button>Ana Sayfaya Dön</Button></Link>
          </CardContent></Card>
        ) : (<>
          {step === 1 && (<div>
            <h2 className="text-2xl font-bold text-center mb-6">Terapi Paketi Seçin</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map(p => (
                <Card key={p.id} className={`cursor-pointer transition-all hover:shadow-lg flex flex-col h-full ${selectedPackage?.id === p.id ? "border-primary ring-2 ring-primary/20" : ""} ${p.popular ? "relative border-primary/50" : ""}`} onClick={() => setSelectedPackage(p)}>
                  {p.popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">En Popüler</Badge>}
                  <CardHeader className="flex-shrink-0"><CardTitle className="text-lg">{p.name}</CardTitle><p className="text-sm text-muted-foreground">{p.description}</p></CardHeader>
                  <CardContent className="flex flex-col flex-grow"><div className="flex-grow"><div className="mb-3"><span className="text-2xl font-bold">{p.price.toLocaleString("tr-TR")} ₺</span><span className="text-muted-foreground text-sm ml-1">/ {p.sessions} seans</span></div><p className="text-sm text-muted-foreground mb-3">Seans: {p.duration}</p><ul className="space-y-1.5">{p.features.map((f, i) => <li key={i} className="flex items-start gap-2 text-sm"><CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />{f}</li>)}</ul></div></CardContent>
                </Card>
              ))}
            </div>
            <div className="flex justify-end mt-6"><Button onClick={() => { if (selectedPackage) setStep(2); }} disabled={!selectedPackage} className="gap-2">Devam Et <ArrowRight className="h-4 w-4" /></Button></div>
          </div>)}
          {step === 2 && (<Card><CardHeader><CardTitle>Kişisel Bilgileriniz</CardTitle></CardHeader><CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="name"><User className="inline h-4 w-4 mr-1" />Ad Soyad</Label><Input id="name" placeholder="Adınız Soyadınız" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />{errors.name && <p className="text-xs text-destructive">{errors.name}</p>}</div>
              <div className="space-y-2"><Label htmlFor="email"><Mail className="inline h-4 w-4 mr-1" />Email</Label><Input id="email" type="email" placeholder="email@ornek.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />{errors.email && <p className="text-xs text-destructive">{errors.email}</p>}</div>
              <div className="space-y-2"><Label htmlFor="phone"><Phone className="inline h-4 w-4 mr-1" />Telefon</Label><Input id="phone" placeholder="0532 000 00 00" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />{errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}</div>
              <div className="space-y-2"><Label htmlFor="date"><Calendar className="inline h-4 w-4 mr-1" />Tarih</Label><Input id="date" type="date" min={today} value={formData.date} onChange={e => { const newDate = e.target.value; if (formData.time) removeSlotReservation(formData.date, formData.time); setFormData(f => ({ ...f, date: newDate, time: "" })); }} />{errors.date && <p className="text-xs text-destructive">{errors.date}</p>}</div>
            </div>
            <div className="space-y-2"><Label><Clock className="inline h-4 w-4 mr-1" />Saat Seçin</Label><div className="grid grid-cols-4 sm:grid-cols-8 gap-2">{availableTimes.map(t => { const isTaken = slotStatus.taken.includes(t); const isReserved = slotStatus.reserved.includes(t); const isMine = formData.time === t; const disabled = isTaken || (isReserved && !isMine); const label = isTaken ? "Dolu" : isMine ? "Rezerve" : isReserved ? "Rezerve" : t; return (<Button key={t} type="button" variant={isMine ? "default" : "outline"} size="sm" disabled={disabled} onClick={() => handleTimeSelect(t)} title={isTaken ? "Bu saat dolu" : isReserved && !isMine ? "Bu saat rezerve" : undefined}>{label}</Button>); })}</div><p className="text-xs text-muted-foreground">Dolu: alınmış, Rezerve: seçtiğiniz veya başkası tarafından kısa süreli tutulmuş.</p>{errors.time && <p className="text-xs text-destructive">{errors.time}</p>}</div>
            <div className="space-y-2"><Label htmlFor="notes">Notlar (Opsiyonel)</Label><Input id="notes" placeholder="Eklemek istediğiniz notlar..." value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} /></div>
            <div className="flex justify-between pt-4"><Button variant="outline" onClick={() => { if (formData.date && formData.time) removeSlotReservation(formData.date, formData.time); setStep(1); }} className="gap-2"><ArrowLeft className="h-4 w-4" />Geri</Button><Button onClick={() => { if (validateStep2()) setStep(3); }} className="gap-2">Devam Et <ArrowRight className="h-4 w-4" /></Button></div>
          </CardContent></Card>)}
          {step === 3 && (<Card><CardHeader><CardTitle>Randevu Özeti</CardTitle></CardHeader><CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-muted rounded-lg p-4 space-y-2"><h3 className="font-semibold text-sm text-muted-foreground">Seçilen Paket</h3><p className="font-medium">{selectedPackage?.name}</p><p className="text-sm text-muted-foreground">{selectedPackage?.sessions} seans - {selectedPackage?.duration}</p><p className="text-lg font-bold text-primary">{selectedPackage?.price.toLocaleString("tr-TR")} ₺</p></div>
                <div className="bg-muted rounded-lg p-4 space-y-2"><h3 className="font-semibold text-sm text-muted-foreground">Randevu Bilgileri</h3><p className="text-sm"><Calendar className="inline h-4 w-4 mr-1" />{formData.date}</p><p className="text-sm"><Clock className="inline h-4 w-4 mr-1" />{formData.time}</p></div>
              </div>
              <div className="bg-muted rounded-lg p-4 space-y-2"><h3 className="font-semibold text-sm text-muted-foreground">Kişisel Bilgiler</h3><p className="text-sm"><User className="inline h-4 w-4 mr-1" />{formData.name}</p><p className="text-sm"><Mail className="inline h-4 w-4 mr-1" />{formData.email}</p><p className="text-sm"><Phone className="inline h-4 w-4 mr-1" />{formData.phone}</p>{formData.notes && <p className="text-sm text-muted-foreground">Not: {formData.notes}</p>}</div>
            </div>
            <div className="flex justify-between pt-6"><Button variant="outline" onClick={() => setStep(2)} className="gap-2"><ArrowLeft className="h-4 w-4" />Geri</Button><Button onClick={handleSubmit} className="gap-2"><CheckCircle className="h-4 w-4" />Randevuyu Onayla</Button></div>
          </CardContent></Card>)}
        </>)}
      </div>
      <WhatsAppButton />
    </div>
  );
}
