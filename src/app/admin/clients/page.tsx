"use client";
import { useState, useEffect } from "react";
import { Users, Search, Plus, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getClients, saveClients, generateId, type Client } from "@/lib/content-manager";

const emptyClient: Omit<Client, "id"> = { name: "", email: "", phone: "", firstVisit: new Date().toISOString().split("T")[0], lastVisit: new Date().toISOString().split("T")[0], totalSessions: 0, status: "active", notes: "" };

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [form, setForm] = useState(emptyClient);

  useEffect(() => { setClients(getClients()); }, []);
  const refresh = () => setClients(getClients());

  const openNew = () => { setEditingClient(null); setForm(emptyClient); setDialogOpen(true); };
  const openEdit = (c: Client) => { setEditingClient(c); setForm({ name: c.name, email: c.email, phone: c.phone, firstVisit: c.firstVisit, lastVisit: c.lastVisit, totalSessions: c.totalSessions, status: c.status, notes: c.notes || "" }); setDialogOpen(true); };

  const handleSave = () => {
    if (!form.name || !form.email || !form.phone) { alert("Lütfen zorunlu alanları doldurun."); return; }
    const all = getClients();
    if (editingClient) {
      const i = all.findIndex(c => c.id === editingClient.id);
      if (i !== -1) all[i] = { ...editingClient, ...form };
    } else {
      all.push({ id: generateId(), ...form });
    }
    saveClients(all);
    setDialogOpen(false);
    refresh();
  };

  const handleDelete = (id: string) => {
    if (!confirm("Bu danışanı silmek istediğinize emin misiniz?")) return;
    saveClients(getClients().filter(c => c.id !== id));
    refresh();
  };

  const filtered = clients.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Danışanlar</h1>
          <p className="text-muted-foreground">Danışan listesini yönetin.</p>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" />Yeni Danışan</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Toplam</p><p className="text-2xl font-bold">{clients.length}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Aktif</p><p className="text-2xl font-bold text-green-600">{clients.filter(c => c.status === "active").length}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Pasif</p><p className="text-2xl font-bold text-muted-foreground">{clients.filter(c => c.status === "inactive").length}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Toplam Seans</p><p className="text-2xl font-bold text-blue-600">{clients.reduce((s, c) => s + c.totalSessions, 0)}</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="İsim veya email ile ara..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-2">
              {["all", "active", "inactive"].map(s => (
                <Button key={s} variant={filterStatus === s ? "default" : "outline"} size="sm" onClick={() => setFilterStatus(s)}>
                  {s === "all" ? "Tümü" : s === "active" ? "Aktif" : "Pasif"}
                </Button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Danışan bulunamadı.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ad Soyad</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>Seans</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="text-sm">{c.email}</TableCell>
                      <TableCell className="text-sm">{c.phone}</TableCell>
                      <TableCell className="text-sm">{c.totalSessions}</TableCell>
                      <TableCell><Badge variant={c.status === "active" ? "default" : "secondary"}>{c.status === "active" ? "Aktif" : "Pasif"}</Badge></TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setSelectedClient(c); setDetailOpen(true); }}><Eye className="h-4 w-4 mr-2" />Detay</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEdit(c)}><Edit className="h-4 w-4 mr-2" />Düzenle</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDelete(c.id)} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" />Sil</DropdownMenuItem>
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingClient ? "Danışan Düzenle" : "Yeni Danışan"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Ad Soyad *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="space-y-2"><Label>Email *</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div className="space-y-2"><Label>Telefon *</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="space-y-2"><Label>Toplam Seans</Label><Input type="number" value={form.totalSessions} onChange={e => setForm({ ...form, totalSessions: parseInt(e.target.value) || 0 })} /></div>
              <div className="space-y-2"><Label>İlk Ziyaret</Label><Input type="date" value={form.firstVisit} onChange={e => setForm({ ...form, firstVisit: e.target.value })} /></div>
              <div className="space-y-2"><Label>Son Ziyaret</Label><Input type="date" value={form.lastVisit} onChange={e => setForm({ ...form, lastVisit: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Durum</Label>
              <div className="flex gap-2">
                <Button type="button" variant={form.status === "active" ? "default" : "outline"} size="sm" onClick={() => setForm({ ...form, status: "active" })}>Aktif</Button>
                <Button type="button" variant={form.status === "inactive" ? "default" : "outline"} size="sm" onClick={() => setForm({ ...form, status: "inactive" })}>Pasif</Button>
              </div>
            </div>
            <div className="space-y-2"><Label>Notlar</Label><Input value={form.notes || ""} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Terapi notları..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>İptal</Button>
            <Button onClick={handleSave}>{editingClient ? "Güncelle" : "Ekle"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Danışan Detayı</DialogTitle></DialogHeader>
          {selectedClient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-muted-foreground text-xs">Ad Soyad</Label><p className="font-medium">{selectedClient.name}</p></div>
                <div><Label className="text-muted-foreground text-xs">Email</Label><p className="text-sm">{selectedClient.email}</p></div>
                <div><Label className="text-muted-foreground text-xs">Telefon</Label><p className="text-sm">{selectedClient.phone}</p></div>
                <div><Label className="text-muted-foreground text-xs">Durum</Label><Badge variant={selectedClient.status === "active" ? "default" : "secondary"}>{selectedClient.status === "active" ? "Aktif" : "Pasif"}</Badge></div>
                <div><Label className="text-muted-foreground text-xs">İlk Ziyaret</Label><p className="text-sm">{selectedClient.firstVisit}</p></div>
                <div><Label className="text-muted-foreground text-xs">Son Ziyaret</Label><p className="text-sm">{selectedClient.lastVisit}</p></div>
                <div><Label className="text-muted-foreground text-xs">Toplam Seans</Label><p className="text-sm font-medium">{selectedClient.totalSessions}</p></div>
              </div>
              {selectedClient.notes && <div><Label className="text-muted-foreground text-xs">Notlar</Label><p className="text-sm bg-muted p-2 rounded">{selectedClient.notes}</p></div>}
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setDetailOpen(false)}>Kapat</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
