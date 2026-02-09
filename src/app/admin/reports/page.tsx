"use client";
import { useState, useEffect } from "react";
import { Download, Users, CalendarCheck, DollarSign, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAppointments, getClients, getPackages, downloadCSV, type Appointment, type Client, type TherapyPackage } from "@/lib/content-manager";

export default function ReportsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [packages, setPackages] = useState<TherapyPackage[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { const load = async () => { setAppointments(await getAppointments()); setClients(await getClients()); setPackages(await getPackages()); setMounted(true); }; load(); }, []);
  if (!mounted) return null;

  const totalRevenue = appointments.filter(a=>a.status==="completed"||a.status==="confirmed").reduce((s,a)=>{const p=packages.find(pk=>pk.id===a.packageId);return s+(p?p.price:0);},0);
  const packageStats = packages.map(p=>{const count=appointments.filter(a=>a.packageId===p.id).length;return{...p,appointmentCount:count,revenue:count*p.price};}).sort((a,b)=>b.appointmentCount-a.appointmentCount);
  const topClients = clients.map(c=>({...c,appointmentCount:appointments.filter(a=>a.clientEmail===c.email).length})).sort((a,b)=>b.totalSessions-a.totalSessions).slice(0,10);
  const monthlyData = Array.from({length:12},(_,i)=>{const monthApps=appointments.filter(a=>{const d=new Date(a.date);return d.getMonth()===i&&d.getFullYear()===new Date().getFullYear();});return{month:["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"][i],count:monthApps.length,revenue:monthApps.reduce((s,a)=>{const p=packages.find(pk=>pk.id===a.packageId);return s+(p?p.price:0);},0)};});
  const maxRevenue = Math.max(...monthlyData.map(m=>m.revenue),1);

  const exportAppointments = () => { downloadCSV(appointments.map(a=>({"Danışan":a.clientName,"Email":a.clientEmail,"Telefon":a.clientPhone,"Paket":a.packageName,"Tarih":a.date,"Saat":a.time,"Durum":a.status,"Oluşturulma":a.createdAt})),"randevular.csv"); };
  const exportClients = () => { downloadCSV(clients.map(c=>({"Ad Soyad":c.name,"Email":c.email,"Telefon":c.phone,"İlk Ziyaret":c.firstVisit,"Son Ziyaret":c.lastVisit,"Toplam Seans":String(c.totalSessions),"Durum":c.status})),"danisanlar.csv"); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold tracking-tight">Raporlar</h1><p className="text-muted-foreground">İş analitiği ve raporlar.</p></div><div className="flex gap-2"><Button variant="outline" onClick={exportAppointments} className="gap-2"><Download className="h-4 w-4"/>Randevular CSV</Button><Button variant="outline" onClick={exportClients} className="gap-2"><Download className="h-4 w-4"/>Danışanlar CSV</Button></div></div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Toplam Gelir</CardTitle><DollarSign className="h-4 w-4 text-green-600"/></CardHeader><CardContent><div className="text-2xl font-bold">{totalRevenue.toLocaleString("tr-TR")} ₺</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Toplam Randevu</CardTitle><CalendarCheck className="h-4 w-4 text-blue-600"/></CardHeader><CardContent><div className="text-2xl font-bold">{appointments.length}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Toplam Danışan</CardTitle><Users className="h-4 w-4 text-purple-600"/></CardHeader><CardContent><div className="text-2xl font-bold">{clients.length}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Ort. Seans/Danışan</CardTitle><TrendingUp className="h-4 w-4 text-orange-600"/></CardHeader><CardContent><div className="text-2xl font-bold">{clients.length?(clients.reduce((s,c)=>s+c.totalSessions,0)/clients.length).toFixed(1):"0"}</div></CardContent></Card>
      </div>
      <Tabs defaultValue="revenue"><TabsList><TabsTrigger value="revenue">Aylık Gelir</TabsTrigger><TabsTrigger value="packages">Paket Dağılımı</TabsTrigger><TabsTrigger value="clients">Top Danışanlar</TabsTrigger></TabsList>
        <TabsContent value="revenue"><Card><CardHeader><CardTitle>Aylık Gelir Grafiği ({new Date().getFullYear()})</CardTitle></CardHeader><CardContent><div className="flex items-end justify-between gap-2 h-64 px-4">{monthlyData.map((m,i)=>(<div key={m.month} className="flex flex-col items-center flex-1 gap-1"><span className="text-xs text-muted-foreground">{m.revenue>0?`${(m.revenue/1000).toFixed(0)}K`:""}</span><div className={`w-full rounded-t-sm transition-all ${i===new Date().getMonth()?"bg-primary":"bg-primary/30"}`} style={{height:`${Math.max(4,(m.revenue/maxRevenue)*100)}%`}}/><span className={`text-xs ${i===new Date().getMonth()?"font-bold text-primary":"text-muted-foreground"}`}>{m.month}</span></div>))}</div></CardContent></Card></TabsContent>
        <TabsContent value="packages"><Card><CardHeader><CardTitle>Paket Bazlı Dağılım</CardTitle></CardHeader><CardContent>{packageStats.length===0?<p className="text-muted-foreground text-center py-4">Veri yok.</p>:(<Table><TableHeader><TableRow><TableHead>Paket</TableHead><TableHead>Fiyat</TableHead><TableHead>Randevu Sayısı</TableHead><TableHead>Toplam Gelir</TableHead></TableRow></TableHeader><TableBody>{packageStats.map(p=>(<TableRow key={p.id}><TableCell className="font-medium">{p.name}</TableCell><TableCell>{p.price.toLocaleString("tr-TR")} ₺</TableCell><TableCell>{p.appointmentCount}</TableCell><TableCell className="font-medium">{p.revenue.toLocaleString("tr-TR")} ₺</TableCell></TableRow>))}</TableBody></Table>)}</CardContent></Card></TabsContent>
        <TabsContent value="clients"><Card><CardHeader><CardTitle>Top 10 Danışan</CardTitle></CardHeader><CardContent>{topClients.length===0?<p className="text-muted-foreground text-center py-4">Veri yok.</p>:(<Table><TableHeader><TableRow><TableHead>#</TableHead><TableHead>Danışan</TableHead><TableHead>Email</TableHead><TableHead>Toplam Seans</TableHead><TableHead>Randevu</TableHead></TableRow></TableHeader><TableBody>{topClients.map((c,i)=>(<TableRow key={c.id}><TableCell className="font-medium">{i+1}</TableCell><TableCell className="font-medium">{c.name}</TableCell><TableCell className="text-sm">{c.email}</TableCell><TableCell>{c.totalSessions}</TableCell><TableCell>{c.appointmentCount}</TableCell></TableRow>))}</TableBody></Table>)}</CardContent></Card></TabsContent>
      </Tabs>
    </div>
  );
}
