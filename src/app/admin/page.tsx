"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { CalendarCheck, Users, TrendingUp, Clock, ArrowUpRight, DollarSign, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAppointments, getClients, getPackages, getNotifications, type Appointment, type Client } from "@/lib/content-manager";

export default function DashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setAppointments(getAppointments());
    setClients(getClients());
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const totalAppointments = appointments.length;
  const pendingAppointments = appointments.filter(a => a.status === "pending").length;
  const completedAppointments = appointments.filter(a => a.status === "completed").length;
  const confirmedAppointments = appointments.filter(a => a.status === "confirmed").length;
  const activeClients = clients.filter(c => c.status === "active").length;
  const packages = getPackages();
  const monthlyRevenue = appointments
    .filter(a => a.status === "completed" || a.status === "confirmed")
    .reduce((sum, a) => {
      const pkg = packages.find(p => p.id === a.packageId);
      return sum + (pkg ? pkg.price : 0);
    }, 0);

  const upcomingAppointments = appointments
    .filter(a => a.status === "confirmed" || a.status === "pending")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const statusLabel: Record<string, { label: string; color: string }> = {
    pending: { label: "Beklemede", color: "bg-yellow-100 text-yellow-800" },
    confirmed: { label: "Onaylandı", color: "bg-green-100 text-green-800" },
    completed: { label: "Tamamlandı", color: "bg-blue-100 text-blue-800" },
    cancelled: { label: "İptal", color: "bg-red-100 text-red-800" },
  };

  const stats = [
    { title: "Toplam Randevu", value: totalAppointments, icon: CalendarCheck, desc: `${confirmedAppointments} onaylı`, color: "text-blue-600" },
    { title: "Bekleyen Randevu", value: pendingAppointments, icon: Clock, desc: "Onay bekliyor", color: "text-yellow-600" },
    { title: "Aktif Danışan", value: activeClients, icon: Users, desc: `${clients.length} toplam`, color: "text-green-600" },
    { title: "Aylık Gelir", value: `${monthlyRevenue.toLocaleString("tr-TR")} ₺`, icon: DollarSign, desc: "Tahmini", color: "text-purple-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Kontrol Paneli</h1>
        <p className="text-muted-foreground">Hoş geldiniz! İşte genel bakış.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.title}</CardTitle>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Yaklaşan Randevular</CardTitle>
            <Link href="/admin/appointments"><Button variant="ghost" size="sm" className="gap-1">Tümü <ArrowUpRight className="h-3 w-3" /></Button></Link>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Yaklaşan randevu yok.</p>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.map(a => (
                  <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-sm">{a.clientName}</p>
                      <p className="text-xs text-muted-foreground">{a.packageName}</p>
                      <p className="text-xs text-muted-foreground">{a.date} - {a.time}</p>
                    </div>
                    <Badge className={statusLabel[a.status]?.color || ""}>{statusLabel[a.status]?.label || a.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Clients */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Son Danışanlar</CardTitle>
            <Link href="/admin/clients"><Button variant="ghost" size="sm" className="gap-1">Tümü <ArrowUpRight className="h-3 w-3" /></Button></Link>
          </CardHeader>
          <CardContent>
            {clients.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Henüz danışan yok.</p>
            ) : (
              <div className="space-y-3">
                {clients.slice(0, 5).map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-sm">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium">{c.totalSessions} seans</p>
                      <Badge variant={c.status === "active" ? "default" : "secondary"} className="text-xs">{c.status === "active" ? "Aktif" : "Pasif"}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart Placeholder */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Aylık Gelir Özeti</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-2 h-48 px-4">
            {["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"].map((m, i) => {
              const height = Math.max(15, Math.random() * 100);
              const isCurrentMonth = i === new Date().getMonth();
              return (
                <div key={m} className="flex flex-col items-center flex-1 gap-1">
                  <div className={`w-full rounded-t-sm transition-all ${isCurrentMonth ? "bg-primary" : "bg-primary/20"}`} style={{ height: `${height}%` }} />
                  <span className={`text-xs ${isCurrentMonth ? "font-bold text-primary" : "text-muted-foreground"}`}>{m}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
