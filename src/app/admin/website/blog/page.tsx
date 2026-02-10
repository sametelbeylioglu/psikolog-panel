"use client";
import { useState, useEffect } from "react";
import { FileText, Plus, Edit, Trash2, Eye, EyeOff, Upload, X, ExternalLink, Copy, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RichTextEditor from "@/components/rich-text-editor";
import { getBlogPosts, saveBlogPosts, generateId, type BlogPost } from "@/lib/content-manager";

const emptyPost: Omit<BlogPost, "id" | "createdAt"> = { title: "", content: "", excerpt: "", author: "Psk. Uzman", published: true };

export default function BlogCMSPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [form, setForm] = useState(emptyPost);
  const [image, setImage] = useState<string | undefined>(undefined);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => { getBlogPosts().then(setPosts); }, []);
  const refresh = async () => setPosts(await getBlogPosts());

  const openNew = () => {
    setEditing(null);
    setForm(emptyPost);
    setImage(undefined);
    setDialogOpen(true);
  };

  const openEdit = (p: BlogPost) => {
    setEditing(p);
    setForm({ title: p.title, content: p.content, excerpt: p.excerpt, author: p.author, published: p.published });
    setImage(p.image);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.content) { alert("Başlık ve içerik gerekli."); return; }
    const all = await getBlogPosts();
    if (editing) {
      const i = all.findIndex(p => p.id === editing.id);
      if (i !== -1) all[i] = { ...editing, ...form, image };
    } else {
      all.push({ id: generateId(), ...form, image, createdAt: new Date().toISOString() });
    }
    await saveBlogPosts(all);
    setDialogOpen(false);
    await refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu yazıyı silmek istediğinize emin misiniz?")) return;
    await saveBlogPosts((await getBlogPosts()).filter(p => p.id !== id));
    await refresh();
  };

  const togglePublish = async (id: string) => {
    const all = await getBlogPosts();
    const i = all.findIndex(p => p.id === id);
    if (i !== -1) { all[i].published = !all[i].published; await saveBlogPosts(all); await refresh(); }
  };

  const handleImageUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Boyutlandır - max 800px genişlik
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let w = img.width, h = img.height;
          if (w > 800) { const ratio = 800 / w; w = 800; h = Math.round(h * ratio); }
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, w, h);
          setImage(canvas.toDataURL("image/jpeg", 0.85));
        };
        img.src = URL.createObjectURL(file);
      }
    };
    input.click();
  };

  const copyLink = (id: string) => {
    const url = `${window.location.origin}/blog?id=${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const wordCount = form.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Blog Yönetimi</h1>
          <p className="text-muted-foreground">Blog yazılarınızı oluşturun, düzenleyin ve yönetin.</p>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" />Yeni Yazı</Button>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4 pb-3 text-center"><div className="text-2xl font-bold">{posts.length}</div><div className="text-xs text-muted-foreground">Toplam Yazı</div></CardContent></Card>
        <Card><CardContent className="pt-4 pb-3 text-center"><div className="text-2xl font-bold text-green-600">{posts.filter(p => p.published).length}</div><div className="text-xs text-muted-foreground">Yayında</div></CardContent></Card>
        <Card><CardContent className="pt-4 pb-3 text-center"><div className="text-2xl font-bold text-yellow-600">{posts.filter(p => !p.published).length}</div><div className="text-xs text-muted-foreground">Taslak</div></CardContent></Card>
        <Card><CardContent className="pt-4 pb-3 text-center"><div className="text-2xl font-bold text-blue-600">{new Set(posts.map(p => p.author)).size}</div><div className="text-xs text-muted-foreground">Yazar</div></CardContent></Card>
      </div>

      {/* Yazı Listesi */}
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
                  <TableHead>Yazı</TableHead>
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
                      <div className="flex items-center gap-3">
                        {p.image && <img src={p.image} alt="" className="w-12 h-8 rounded object-cover flex-shrink-0" />}
                        <div>
                          <p className="font-medium">{p.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{p.excerpt || p.content.replace(/<[^>]*>/g, '').substring(0, 80)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{p.author}</TableCell>
                    <TableCell className="text-sm">{new Date(p.createdAt).toLocaleDateString("tr-TR")}</TableCell>
                    <TableCell><Badge variant={p.published ? "default" : "secondary"}>{p.published ? "Yayında" : "Taslak"}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyLink(p.id)} title="Link Kopyala">
                          {copiedId === p.id ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                        </Button>
                        <a href={`/blog?id=${p.id}`} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Önizle"><ExternalLink className="h-4 w-4" /></Button>
                        </a>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => togglePublish(p.id)} title={p.published ? "Taslağa Al" : "Yayınla"}>
                          {p.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)} title="Düzenle"><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(p.id)} title="Sil"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Yazı Oluştur/Düzenle Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{editing ? "Yazıyı Düzenle" : "Yeni Blog Yazısı"}</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="editor">
            <TabsList>
              <TabsTrigger value="editor">Düzenleyici</TabsTrigger>
              <TabsTrigger value="preview">Önizleme</TabsTrigger>
              <TabsTrigger value="settings">Ayarlar</TabsTrigger>
            </TabsList>

            {/* Düzenleyici */}
            <TabsContent value="editor" className="space-y-4">
              <div className="space-y-2">
                <Label className="text-base font-semibold">Başlık *</Label>
                <Input
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Yazı başlığını girin..."
                  className="text-lg h-12"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">İçerik *</Label>
                  <span className="text-xs text-muted-foreground">{wordCount} kelime · ~{readingTime} dk okuma</span>
                </div>
                <RichTextEditor
                  value={form.content}
                  onChange={html => setForm({ ...form, content: html })}
                  placeholder="Yazınızı buraya yazın..."
                />
              </div>
            </TabsContent>

            {/* Önizleme */}
            <TabsContent value="preview">
              <div className="border rounded-lg p-6 min-h-[400px] max-h-[600px] overflow-y-auto">
                {form.title ? (
                  <>
                    {image && <img src={image} alt={form.title} className="w-full max-h-64 object-cover rounded-lg mb-6" />}
                    <h1 className="text-3xl font-bold mb-3">{form.title}</h1>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mb-6">
                      <span>{form.author}</span>
                      <span>·</span>
                      <span>~{readingTime} dk okuma</span>
                    </div>
                    <div
                      className="prose prose-sm max-w-none dark:prose-invert
                        prose-headings:font-bold
                        prose-p:leading-relaxed prose-p:mb-3
                        prose-a:text-primary prose-a:underline
                        prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic
                        prose-img:rounded-lg prose-img:max-w-full
                        prose-ul:list-disc prose-ul:pl-5
                        prose-ol:list-decimal prose-ol:pl-5"
                      dangerouslySetInnerHTML={{ __html: form.content }}
                    />
                  </>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">Önizleme için bir başlık ve içerik girin.</div>
                )}
              </div>
            </TabsContent>

            {/* Ayarlar */}
            <TabsContent value="settings" className="space-y-4">
              <div className="space-y-2">
                <Label>Özet</Label>
                <Input value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} placeholder="Blog listesinde gösterilecek kısa özet..." />
                <p className="text-xs text-muted-foreground">Boş bırakırsanız içerikten otomatik oluşturulur.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Yazar</Label>
                  <Input value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Yayın Durumu</Label>
                  <div className="flex gap-2 mt-1">
                    <Button type="button" variant={form.published ? "default" : "outline"} size="sm" onClick={() => setForm({ ...form, published: true })}>
                      <Eye className="h-4 w-4 mr-1" />Yayınla
                    </Button>
                    <Button type="button" variant={!form.published ? "default" : "outline"} size="sm" onClick={() => setForm({ ...form, published: false })}>
                      <EyeOff className="h-4 w-4 mr-1" />Taslak
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Kapak Görseli</Label>
                <p className="text-xs text-muted-foreground">Blog kartında ve yazı başında gösterilir. Max 800px genişliğe sığdırılır.</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleImageUpload} className="gap-2"><Upload className="h-4 w-4" />Yükle</Button>
                  {image && <Button variant="outline" size="sm" onClick={() => setImage(undefined)} className="gap-2 text-destructive"><X className="h-4 w-4" />Kaldır</Button>}
                </div>
                {image && <img src={image} alt="Kapak" className="mt-2 max-h-40 rounded-lg object-cover border" />}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>İptal</Button>
            <Button onClick={handleSave} className="gap-2">
              {editing ? "Güncelle" : (form.published ? "Yayınla" : "Taslak Kaydet")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
