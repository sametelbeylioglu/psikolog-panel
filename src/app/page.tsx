"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Brain, Heart, Users, Shield, ArrowRight, Phone, Mail, MapPin, Star, CheckCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import WhatsAppButton from "@/components/whatsapp-button";
import { getHeroContent, getFeatures, getStats, getAboutContent, getPackagesAsServices, getContactInfo, getLogo, getSectionVisibility, getBlogPosts, type HeroContent, type Feature, type Stat, type AboutContent, type Service, type ContactInfo, type SectionVisibility, type BlogPost } from "@/lib/content-manager";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = { Brain, Heart, Users, Shield, Star, CheckCircle };

export default function HomePage() {
  const [hero, setHero] = useState<HeroContent | null>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  const [about, setAbout] = useState<AboutContent | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [logo, setLogo] = useState("PsikoPanel");
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [vis, setVis] = useState<SectionVisibility>({ hero:true, stats:true, features:true, about:true, packages:true, contact:true, navbar:true, blog:true });

  useEffect(() => {
    const load = async () => {
      setHero(await getHeroContent());
      setFeatures(await getFeatures());
      setStats(await getStats());
      setAbout(await getAboutContent());
      setServices(await getPackagesAsServices());
      setContact(await getContactInfo());
      setLogo(await getLogo());
      setBlogPosts((await getBlogPosts()).filter(p => p.published));
      setVis(await getSectionVisibility());
    };
    load();
  }, []);

  if (!hero) return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-muted-foreground">Yükleniyor...</div></div>;

  return (
    <div className="min-h-screen bg-background">
      {vis.navbar && <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2"><Brain className="h-6 w-6 text-primary" /><span className="text-xl font-bold">{logo}</span></Link>
            <div className="hidden md:flex items-center gap-6">
              {vis.features && <a href="#hizmetler" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Hizmetler</a>}
              {vis.about && <a href="#hakkimda" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Hakkımda</a>}
              {vis.packages && <a href="#paketler" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Paketler</a>}
              {vis.blog && <a href="#blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</a>}
              {vis.contact && <a href="#iletisim" className="text-sm text-muted-foreground hover:text-foreground transition-colors">İletişim</a>}
            </div>
            <div className="flex items-center gap-3">
              <Link href="/randevu"><Button>Randevu Al</Button></Link>
            </div>
          </div>
        </div>
      </nav>}

      {vis.hero && <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4" variant="secondary">{hero.subtitle}</Badge>
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6">{hero.title}</h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-lg">{hero.description}</p>
              <div className="flex flex-wrap gap-4">
                <Link href={hero.buttonLink}><Button size="lg" className="gap-2">{hero.buttonText}<ArrowRight className="h-4 w-4" /></Button></Link>
                <a href="#hakkimda"><Button size="lg" variant="outline">Daha Fazla Bilgi</Button></a>
              </div>
            </div>
            <div className="hidden lg:flex justify-center">
              {hero.image ? <img src={hero.image} alt="Hero" className="rounded-2xl max-h-[500px] object-cover shadow-2xl" /> : <div className="w-full max-w-md aspect-square bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center"><Brain className="h-32 w-32 text-primary/40" /></div>}
            </div>
          </div>
        </div>
      </section>}

      {vis.stats && <section className="py-12 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(s => <div key={s.id} className="text-center"><div className="text-3xl lg:text-4xl font-bold text-primary">{s.value}</div><div className="text-sm text-muted-foreground mt-1">{s.label}</div></div>)}
          </div>
        </div>
      </section>}

      {vis.features && <section id="hizmetler" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12"><h2 className="text-3xl font-bold tracking-tight mb-4">Hizmetlerimiz</h2><p className="text-muted-foreground max-w-2xl mx-auto">Profesyonel psikolojik danışmanlık hizmetlerimiz ile size özel çözümler sunuyoruz.</p></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(f => { const Icon = iconMap[f.icon] || Brain; return (
              <Card key={f.id} className="text-center hover:shadow-lg transition-shadow"><CardHeader><div className="mx-auto w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2"><Icon className="h-6 w-6 text-primary" /></div><CardTitle className="text-lg">{f.title}</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">{f.description}</p></CardContent></Card>
            ); })}
          </div>
        </div>
      </section>}

      {vis.about && <section id="hakkimda" className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {about && <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>{about.image ? <img src={about.image} alt="Hakkımda" className="rounded-2xl shadow-lg w-full object-cover max-h-[500px]" /> : <div className="w-full aspect-[4/3] bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center"><Brain className="h-24 w-24 text-primary/30" /></div>}</div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-4">{about.title}</h2>
              <p className="text-muted-foreground mb-6">{about.description}</p>
              <div className="space-y-3 mb-6">{about.qualifications.map((q, i) => <div key={i} className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary flex-shrink-0" /><span className="text-sm">{q}</span></div>)}</div>
              <p className="text-sm text-muted-foreground italic">{about.approach}</p>
            </div>
          </div>}
        </div>
      </section>}

      {vis.packages && <section id="paketler" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12"><h2 className="text-3xl font-bold tracking-tight mb-4">Terapi Paketleri</h2><p className="text-muted-foreground max-w-2xl mx-auto">İhtiyaçlarınıza uygun terapi paketini seçin.</p></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(s => (
              <Card key={s.id} className={`flex flex-col h-full relative ${s.popular ? 'border-primary shadow-lg' : ''}`}>
                {s.popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">En Popüler</Badge>}
                <CardHeader className="flex-shrink-0"><CardTitle className="text-xl">{s.name}</CardTitle><p className="text-sm text-muted-foreground">{s.description}</p></CardHeader>
                <CardContent className="flex flex-col flex-grow">
                  <div className="flex-grow">
                    <div className="mb-4"><span className="text-3xl font-bold">{s.price.toLocaleString('tr-TR')} ₺</span><span className="text-muted-foreground text-sm ml-1">/ {s.sessions} seans</span></div>
                    <div className="text-sm text-muted-foreground mb-4">Seans süresi: {s.duration}</div>
                    <ul className="space-y-2 mb-6">{s.features.map((f, i) => <li key={i} className="flex items-start gap-2 text-sm"><CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />{f}</li>)}</ul>
                  </div>
                  <Link href="/randevu" className="mt-auto"><Button className="w-full" variant={s.popular ? "default" : "outline"}>Randevu Al</Button></Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>}

      {vis.blog && blogPosts.length > 0 && <section id="blog" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12"><h2 className="text-3xl font-bold tracking-tight mb-4">Blog</h2><p className="text-muted-foreground max-w-2xl mx-auto">Psikoloji dünyasından güncel yazılar ve faydalı bilgiler.</p></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.slice(0, 6).map(post => (
              <Card key={post.id} className="flex flex-col h-full hover:shadow-lg transition-shadow overflow-hidden">
                {post.image && <img src={post.image} alt={post.title} className="w-full h-48 object-cover" />}
                <CardHeader className="flex-shrink-0">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(post.createdAt).toLocaleDateString("tr-TR", { year:"numeric", month:"long", day:"numeric" })}</span>
                    <span>·</span>
                    <span>{post.author}</span>
                  </div>
                  <CardTitle className="text-lg leading-tight">{post.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col flex-grow">
                  <p className="text-sm text-muted-foreground line-clamp-3 flex-grow">{post.excerpt || post.content.substring(0, 150) + "..."}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>}

      {vis.contact && <section id="iletisim" className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12"><h2 className="text-3xl font-bold tracking-tight mb-4">İletişim</h2></div>
          {contact && <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="text-center"><CardContent className="pt-6"><Phone className="h-8 w-8 text-primary mx-auto mb-3" /><h3 className="font-semibold mb-1">Telefon</h3><p className="text-sm text-muted-foreground">{contact.phone}</p></CardContent></Card>
            <Card className="text-center"><CardContent className="pt-6"><Mail className="h-8 w-8 text-primary mx-auto mb-3" /><h3 className="font-semibold mb-1">Email</h3><p className="text-sm text-muted-foreground">{contact.email}</p></CardContent></Card>
            <Card className="text-center"><CardContent className="pt-6"><MapPin className="h-8 w-8 text-primary mx-auto mb-3" /><h3 className="font-semibold mb-1">Adres</h3><p className="text-sm text-muted-foreground">{contact.address}</p></CardContent></Card>
          </div>}
        </div>
      </section>}

      <footer className="py-8 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2"><Brain className="h-5 w-5 text-primary" /><span className="font-semibold">{logo}</span></div>
            <div className="flex items-center gap-4">
              <Link href="/kvkk" className="text-sm text-muted-foreground hover:text-foreground transition-colors">KVKK & Gizlilik</Link>
              <span className="text-muted-foreground">|</span>
              <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Giriş</Link>
              <span className="text-muted-foreground">|</span>
              <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} {logo}. Tüm hakları saklıdır.</p>
            </div>
          </div>
        </div>
      </footer>
      <WhatsAppButton />
    </div>
  );
}
