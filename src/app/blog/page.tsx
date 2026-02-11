"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Brain, ArrowLeft, Calendar, User, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import WhatsAppButton from "@/components/whatsapp-button";
import { getBlogPosts, getLogo, getLogoImage, type BlogPost } from "@/lib/content-manager";
import { Suspense } from "react";

function BlogContent() {
  const searchParams = useSearchParams();
  const postId = searchParams.get("id");
  const [post, setPost] = useState<BlogPost | null>(null);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [logo, setLogo] = useState("PsikoPanel");
  const [logoImg, setLogoImg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const posts = (await getBlogPosts()).filter(p => p.published);
      setAllPosts(posts);
      setLogo(await getLogo());
      setLogoImg(await getLogoImage());

      if (postId) {
        const found = posts.find(p => p.id === postId);
        setPost(found || null);
      }
      setLoading(false);
    };
    load();
  }, [postId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-muted-foreground">Yükleniyor...</div></div>;

  // ===== BLOG LİSTESİ (id yok) =====
  if (!postId) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              {logoImg ? <img src={logoImg} alt={logo || "Logo"} className="h-8 object-contain" /> : <Brain className="h-6 w-6 text-primary" />}
              {logo ? <span className="text-xl font-bold">{logo}</span> : null}
            </Link>
            <Link href="/"><Button variant="ghost" className="gap-2"><ArrowLeft className="h-4 w-4" />Ana Sayfa</Button></Link>
          </div>
        </nav>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-4">Blog</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">Psikoloji dünyasından güncel yazılar, araştırmalar ve faydalı bilgiler.</p>
          </div>

          {allPosts.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">Henüz blog yazısı yok.</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allPosts.map(p => (
                <Link key={p.id} href={`/blog?id=${p.id}`}>
                  <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer overflow-hidden">
                    {p.image && <img src={p.image} alt={p.title} className="w-full h-48 object-cover" />}
                    <CardHeader>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(p.createdAt).toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" })}</span>
                      </div>
                      <CardTitle className="text-lg leading-tight line-clamp-2">{p.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{p.excerpt || p.content.replace(/<[^>]*>/g, '').substring(0, 150) + "..."}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground flex items-center gap-1"><User className="h-3 w-3" />{p.author}</span>
                        <span className="text-xs text-primary font-medium flex items-center gap-1">Devamını Oku <ArrowRight className="h-3 w-3" /></span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        <footer className="py-8 border-t">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()}{logo ? ` ${logo}. ` : " "}Tüm hakları saklıdır.</p>
          </div>
        </footer>
        <WhatsAppButton />
      </div>
    );
  }

  // ===== YAZI BULUNAMADI =====
  if (!post) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <nav className="border-b bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              {logoImg ? <img src={logoImg} alt={logo || "Logo"} className="h-8 object-contain" /> : <Brain className="h-6 w-6 text-primary" />}
              {logo ? <span className="text-xl font-bold">{logo}</span> : null}
            </Link>
            <Link href="/blog"><Button variant="ghost" className="gap-2"><ArrowLeft className="h-4 w-4" />Blog</Button></Link>
          </div>
        </nav>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Yazı Bulunamadı</h1>
            <p className="text-muted-foreground mb-4">Aradığınız blog yazısı mevcut değil veya kaldırılmış olabilir.</p>
            <Link href="/blog"><Button className="gap-2"><ArrowLeft className="h-4 w-4" />Tüm Yazılar</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  // ===== TEK YAZI DETAY =====
  const readingTime = Math.max(1, Math.ceil(post.content.replace(/<[^>]*>/g, '').split(/\s+/).length / 200));
  const otherPosts = allPosts.filter(p => p.id !== post.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            {logoImg ? <img src={logoImg} alt={logo || "Logo"} className="h-8 object-contain" /> : <Brain className="h-6 w-6 text-primary" />}
            {logo ? <span className="text-xl font-bold">{logo}</span> : null}
          </Link>
          <Link href="/blog"><Button variant="ghost" className="gap-2"><ArrowLeft className="h-4 w-4" />Tüm Yazılar</Button></Link>
        </div>
      </nav>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 leading-tight">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><User className="h-4 w-4" />{post.author}</span>
            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{new Date(post.createdAt).toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" })}</span>
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{readingTime} dk okuma</span>
          </div>
        </header>

        {/* Kapak Görseli */}
        {post.image && (
          <div className="mb-8 rounded-xl overflow-hidden shadow-lg">
            <img src={post.image} alt={post.title} className="w-full max-h-[500px] object-cover" />
          </div>
        )}

        {/* İçerik */}
        <div
          className="prose prose-lg max-w-none dark:prose-invert
            prose-headings:font-bold prose-headings:tracking-tight
            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:leading-relaxed prose-p:mb-4 prose-p:text-foreground/90
            prose-a:text-primary prose-a:underline
            prose-strong:text-foreground prose-strong:font-semibold
            prose-ul:my-4 prose-ol:my-4 prose-li:my-1
            prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground
            prose-img:rounded-lg prose-img:shadow-md prose-img:my-6"
          dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
        />

        {/* Yazar Kartı */}
        <div className="mt-12 p-6 bg-muted/50 rounded-xl flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-semibold">{post.author}</p>
            <p className="text-sm text-muted-foreground mt-1">Bu yazı {new Date(post.createdAt).toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" })} tarihinde yayınlanmıştır.</p>
          </div>
        </div>
      </article>

      {/* Diğer Yazılar */}
      {otherPosts.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t">
          <h2 className="text-2xl font-bold mb-6">Diğer Yazılar</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {otherPosts.map(p => (
              <Link key={p.id} href={`/blog?id=${p.id}`}>
                <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer overflow-hidden">
                  {p.image && <img src={p.image} alt={p.title} className="w-full h-40 object-cover" />}
                  <CardHeader>
                    <div className="text-xs text-muted-foreground mb-1">{new Date(p.createdAt).toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" })}</div>
                    <CardTitle className="text-base leading-tight line-clamp-2">{p.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">{p.excerpt || p.content.replace(/<[^>]*>/g, '').substring(0, 100)}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      <footer className="py-8 border-t">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()}{logo ? ` ${logo}. ` : " "}Tüm hakları saklıdır.</p>
        </div>
      </footer>
      <WhatsAppButton />
    </div>
  );
}

// Plain text'i HTML'e çevir (eski düz metin yazılar için uyumluluk)
function formatContent(content: string): string {
  // Zaten HTML ise dokunma
  if (content.includes('<p>') || content.includes('<h') || content.includes('<div>') || content.includes('<br') || content.includes('<strong>') || content.includes('<ul>')) {
    return content;
  }
  // Düz metni paragraflara çevir
  return content
    .split(/\n\n+/)
    .map(para => {
      const trimmed = para.trim();
      if (!trimmed) return '';
      // Numaralı listeler
      if (/^\d+\.\s/.test(trimmed)) {
        const items = trimmed.split(/\n/).map(line => `<li>${line.replace(/^\d+\.\s*/, '')}</li>`).join('');
        return `<ol>${items}</ol>`;
      }
      // Madde işaretli listeler
      if (/^[-•]\s/.test(trimmed)) {
        const items = trimmed.split(/\n/).map(line => `<li>${line.replace(/^[-•]\s*/, '')}</li>`).join('');
        return `<ul>${items}</ul>`;
      }
      return `<p>${trimmed.replace(/\n/g, '<br/>')}</p>`;
    })
    .join('');
}

export default function BlogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-muted-foreground">Yükleniyor...</div></div>}>
      <BlogContent />
    </Suspense>
  );
}
