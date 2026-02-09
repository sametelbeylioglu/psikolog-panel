"use client";
import { useState, useEffect } from "react";
import { FileText, Plus, Edit, Trash2, Eye, EyeOff, Upload, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getBlogPosts, saveBlogPosts, generateId, type BlogPost } from "@/lib/content-manager";

const emptyPost: Omit<BlogPost, "id" | "createdAt"> = { title: "", content: "", excerpt: "", author: "Psk. Uzman", published: true };

export default function BlogCMSPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [form, setForm] = useState(emptyPost);
  const [image, setImage] = useState<string | undefined>(undefined);

  useEffect(() => { setPosts(getBlogPosts()); }, []);
  const refresh = () => setPosts(getBlogPosts());

  const openNew = () => { setEditing(null); setForm(emptyPost); setImage(undefined); setDialogOpen(true); };
  const openEdit = (p: BlogPost) => { setEditing(p); setForm({ title: p.title, content: p.content, excerpt: p.excerpt, author: p.author, published: p.published }); setImage(p.image); setDialogOpen(true); };

  const handleSave = () => {
    if (!form.title || !form.content) { alert("Başlık ve içerik gerekli."); return; }
    const all = getBlogPosts();
    if (editing) {
      const i = all.findIndex(p => p.id === editing.id);
      if (i !== -1) all[i] = { ...editing, ...form, image };
    } else {
      all.push({ id: generateId(), ...form, image, createdAt: new Date().toISOString() });
    }
    saveBlogPosts(all);
    setDialogOpen(false);
    refresh();
  };

  const handleDelete = (id: string) => { if (!confirm("Bu yazıyı silmek istediğinize emin misiniz?")) return; saveBlogPosts(getBlogPosts().filter(p => p.id !== id)); refresh(); };
  const togglePublish = (id: string) => { const all = getBlogPosts(); const i = all.findIndex(p => p.id === id); if (i !== -1) { all[i].published = !all[i].published; saveBlogPosts(all); refresh(); } };

  const handleImageUpload = () => {
    const input = document.createElement("input"); input.type = "file"; input.accept = "image/*";
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) { const r = new FileReader(); r.onload = (ev) => setImage(ev.target?.result as string); r.readAsDataURL(file); }
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Blog Yönetimi</h1>
          <p className="text-muted-foreground">Blog yazılarınızı yönetin.</p>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" />Yeni Yazı</Button>
      </div>

      {posts.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground">Henüz blog yazısı yok.</p>
            <Button onClick={openNew} className="mt-4">İlk Yazıyı Ekle</Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Başlık</TableHead>
                  <TableHead>Yazar</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map(p => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{p.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{p.excerpt}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{p.author}</TableCell>
                    <TableCell className="text-sm">{new Date(p.createdAt).toLocaleDateString("tr-TR")}</TableCell>
                    <TableCell><Badge variant={p.published ? "default" : "secondary"}>{p.published ? "Yayında" : "Taslak"}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => togglePublish(p.id)} title={p.published ? "Taslağa Al" : "Yayınla"}>
                          {p.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Yazıyı Düzenle" : "Yeni Blog Yazısı"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Başlık *</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Yazı başlığı" /></div>
            <div className="space-y-2"><Label>Özet</Label><Input value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} placeholder="Kısa özet" /></div>
            <div className="space-y-2"><Label>İçerik *</Label>
              <textarea className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Yazı içeriği..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Yazar</Label><Input value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} /></div>
              <div className="space-y-2"><Label>Durum</Label>
                <div className="flex gap-2 mt-1">
                  <Button type="button" variant={form.published ? "default" : "outline"} size="sm" onClick={() => setForm({ ...form, published: true })}>Yayınla</Button>
                  <Button type="button" variant={!form.published ? "default" : "outline"} size="sm" onClick={() => setForm({ ...form, published: false })}>Taslak</Button>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Kapak Görseli</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleImageUpload} className="gap-2"><Upload className="h-4 w-4" />Yükle</Button>
                {image && <Button variant="outline" size="sm" onClick={() => setImage(undefined)} className="gap-2 text-destructive"><X className="h-4 w-4" />Kaldır</Button>}
              </div>
              {image && <img src={image} alt="Kapak" className="mt-2 max-h-32 rounded-lg object-cover" />}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>İptal</Button>
            <Button onClick={handleSave}>{editing ? "Güncelle" : "Yayınla"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
