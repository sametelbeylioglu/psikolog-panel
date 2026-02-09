"use client";
import { useState, useEffect } from "react";
import { CalendarCheck, Search, Filter, MoreHorizontal, Eye, Check, X, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { getAppointments, saveAppointments, updateAppointment, addNotification, generateId, type Appointment } from "@/lib/content-manager";

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Beklemede", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "Onaylandı", color: "bg-green-100 text-green-800" },
  completed: { label: "Tamamlandı", color: "bg-blue-100 text-blue-800" },
  cancelled: { label: "İptal", color: "bg-red-100 text-red-800" },
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => { setAppointments(getAppointments()); }, []);

  const refresh = () => setAppointments(getAppointments());

  const handleStatusChange = (id: string, status: Appointment["status"]) => {
    updateAppointment(id, { status });
    addNotification({
      id: generateId(), type: "appointment",
      title: status === "confirmed" ? "Randevu Onaylandı" : status === "cancelled" ? "Randevu İptal Edildi" : "Randevu Güncellendi",
      message: `Randevu durumu "${statusConfig[status].label}" olarak güncellendi.`,
      read: false, createdAt: new Date().toISOString(),
    });
    refresh();
  };

  const handleDelete = (id: string) => {
    if (!confirm("Bu randevuyu silmek istediğinize emin misiniz?")) return;
    const updated = getAppointments().filter(a => a.id !== id);
    saveAppointments(updated);
    refresh();
  };

  const filtered = appointments.filter(a => {
    const matchSearch = a.clientName.toLowerCase().includes(search.toLowerCase()) || a.clientEmail.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Randevular</h1>
          <p className="text-muted-foreground">Tüm randevuları yönetin.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Toplam", value: appointments.length, color: "text-foreground" },
          { label: "Beklemede", value: appointments.filter(a => a.status === "pending").length, color: "text-yellow-600" },
          { label: "Onaylandı", value: appointments.filter(a => a.status === "confirmed").length, color: "text-green-600" },
          { label: "Tamamlandı", value: appointments.filter(a => a.status === "completed").length, color: "text-blue-600" },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="İsim veya email ile ara..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-2 flex-wrap">
              {["all", "pending", "confirmed", "completed", "cancelled"].map(s => (
                <Button key={s} variant={filterStatus === s ? "default" : "outline"} size="sm" onClick={() => setFilterStatus(s)}>
                  {s === "all" ? "Tümü" : statusConfig[s]?.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Randevu bulunamadı.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Danışan</TableHead>
                    <TableHead>Paket</TableHead>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Saat</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(a => (
                    <TableRow key={a.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{a.clientName}</p>
                          <p className="text-xs text-muted-foreground">{a.clientEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{a.packageName}</TableCell>
                      <TableCell className="text-sm">{a.date}</TableCell>
                      <TableCell className="text-sm">{a.time}</TableCell>
                      <TableCell><Badge className={statusConfig[a.status]?.color || ""}>{statusConfig[a.status]?.label || a.status}</Badge></TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setSelectedAppointment(a); setDetailOpen(true); }}><Eye className="h-4 w-4 mr-2" />Detay</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {a.status === "pending" && <DropdownMenuItem onClick={() => handleStatusChange(a.id, "confirmed")}><Check className="h-4 w-4 mr-2" />Onayla</DropdownMenuItem>}
                            {(a.status === "confirmed") && <DropdownMenuItem onClick={() => handleStatusChange(a.id, "completed")}><Check className="h-4 w-4 mr-2" />Tamamla</DropdownMenuItem>}
                            {a.status !== "cancelled" && <DropdownMenuItem onClick={() => handleStatusChange(a.id, "cancelled")} className="text-destructive"><X className="h-4 w-4 mr-2" />İptal Et</DropdownMenuItem>}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDelete(a.id)} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" />Sil</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Randevu Detayı</DialogTitle></DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-muted-foreground text-xs">Danışan</Label><p className="font-medium">{selectedAppointment.clientName}</p></div>
                <div><Label className="text-muted-foreground text-xs">Email</Label><p className="text-sm">{selectedAppointment.clientEmail}</p></div>
                <div><Label className="text-muted-foreground text-xs">Telefon</Label><p className="text-sm">{selectedAppointment.clientPhone}</p></div>
                <div><Label className="text-muted-foreground text-xs">Paket</Label><p className="text-sm">{selectedAppointment.packageName}</p></div>
                <div><Label className="text-muted-foreground text-xs">Tarih</Label><p className="text-sm">{selectedAppointment.date}</p></div>
                <div><Label className="text-muted-foreground text-xs">Saat</Label><p className="text-sm">{selectedAppointment.time}</p></div>
                <div><Label className="text-muted-foreground text-xs">Durum</Label><Badge className={statusConfig[selectedAppointment.status]?.color || ""}>{statusConfig[selectedAppointment.status]?.label}</Badge></div>
                <div><Label className="text-muted-foreground text-xs">Oluşturulma</Label><p className="text-sm">{new Date(selectedAppointment.createdAt).toLocaleString("tr-TR")}</p></div>
              </div>
              {selectedAppointment.notes && <div><Label className="text-muted-foreground text-xs">Notlar</Label><p className="text-sm bg-muted p-2 rounded">{selectedAppointment.notes}</p></div>}
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setDetailOpen(false)}>Kapat</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
