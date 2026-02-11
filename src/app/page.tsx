"use client";
import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight as ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { Brain, Heart, Users, Shield, ArrowRight, Phone, Mail, MapPin, Star, CheckCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import WhatsAppButton from "@/components/whatsapp-button";
import { getHeroContent, getFeatures, getStats, getAboutContent, getPackagesAsServices, getContactInfo, getLogo, getLogoImage, getSectionVisibility, getBlogPosts, type HeroContent, type Feature, type Stat, type AboutContent, type Service, type ContactInfo, type SectionVisibility, type BlogPost } from "@/lib/content-manager";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = { Brain, Heart, Users, Shield, Star, CheckCircle };

function HorizontalScroll({ children, visibleCount }: { children: React.ReactNode; visibleCount: number }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 5);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => { el?.removeEventListener("scroll", checkScroll); window.removeEventListener("resize", checkScroll); };
  }, [children]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild ? (el.firstElementChild as HTMLElement).offsetWidth + 24 : 300;
    el.scrollBy({ left: dir === "right" ? cardWidth : -cardWidth, behavior: "smooth" });
  };

  // visibleCount'a göre kart genişliği CSS variable olarak hesaplanır
  const cardStyle = {
    "--visible": visibleCount,
  } as React.CSSProperties;

  return (
    <div className="relative group" style={cardStyle}>
      {canLeft && (
        <button onClick={() => scroll("left")} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 rounded-full bg-background border shadow-lg flex items-center justify-center hover:bg-muted transition-colors opacity-0 group-hover:opacity-100">
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scroll-smooth scrollbar-hide pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {children}
      </div>
      {canRight && (
        <button onClick={() => scroll("right")} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 rounded-full bg-background border shadow-lg flex items-center justify-center hover:bg-muted transition-colors opacity-0 group-hover:opacity-100">
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

function AnimatedStat({ value, label }: { value: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState("0");
  const animated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !animated.current) {
        animated.current = true;
        // Sayısal kısmı ayıkla - baştaki ve sondaki ekleri destekle (%95, 1000+, vb.)
        const match = value.match(/^([^\d]*)([\d.]+)(.*)/);
        if (match) {
          const prefix = match[1]; // %, $ vb.
          const target = parseFloat(match[2]);
          const suffix = match[3]; // +, vb.
          const duration = 2000;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          let step = 0;
          const timer = setInterval(() => {
            step++;
            current = Math.min(current + increment, target);
            if (Number.isInteger(target)) {
              setDisplay(prefix + Math.round(current).toLocaleString("tr-TR") + suffix);
            } else {
              setDisplay(prefix + current.toFixed(1) + suffix);
            }
            if (step >= steps) {
              clearInterval(timer);
              setDisplay(value); // Tam değeri garanti et
            }
          }, duration / steps);
        } else {
          setDisplay(value); // Sayısal değilse direkt göster
        }
      }
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl lg:text-4xl font-bold text-primary">{display}</div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

export default function HomePage() {
  const [hero, setHero] = useState<HeroContent | null>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  const [about, setAbout] = useState<AboutContent | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [logo, setLogo] = useState("PsikoPanel");
  const [logoImage, setLogoImage] = useState("");
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
      setLogoImage(await getLogoImage());
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
            <Link href="/" className="flex items-center gap-2">{logoImage ? <img src={logoImage} alt={logo || "Logo"} className="h-8 object-contain" /> : <Brain className="h-6 w-6 text-primary" />}{logo ? <span className="text-xl font-bold">{logo}</span> : null}</Link>
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
            {stats.map(s => <AnimatedStat key={s.id} value={s.value} label={s.label} />)}
          </div>
        </div>
      </section>}

      {vis.features && <section id="hizmetler" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12"><h2 className="text-3xl font-bold tracking-tight mb-4">Hizmetlerimiz</h2><p className="text-muted-foreground max-w-2xl mx-auto">Profesyonel psikolojik danışmanlık hizmetlerimiz ile size özel çözümler sunuyoruz.</p></div>
          {features.length <= 4 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map(f => { const Icon = iconMap[f.icon] || Brain; return (
                <Card key={f.id} className="text-center hover:shadow-lg transition-shadow"><CardHeader><div className="mx-auto w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2"><Icon className="h-6 w-6 text-primary" /></div><CardTitle className="text-lg">{f.title}</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">{f.description}</p></CardContent></Card>
              ); })}
            </div>
          ) : (
            <HorizontalScroll visibleCount={4}>
              {features.map(f => { const Icon = iconMap[f.icon] || Brain; return (
                <Card key={f.id} className="text-center hover:shadow-lg transition-shadow flex-shrink-0 w-[calc((100%-72px)/4)]" style={{ minWidth: "250px" }}><CardHeader><div className="mx-auto w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2"><Icon className="h-6 w-6 text-primary" /></div><CardTitle className="text-lg">{f.title}</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">{f.description}</p></CardContent></Card>
              ); })}
            </HorizontalScroll>
          )}
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
          {services.length <= 3 ? (
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
          ) : (
            <HorizontalScroll visibleCount={3}>
              {services.map(s => (
                <Card key={s.id} className={`flex flex-col h-full relative flex-shrink-0 w-[calc((100%-48px)/3)] ${s.popular ? 'border-primary shadow-lg' : ''}`} style={{ minWidth: "300px" }}>
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
            </HorizontalScroll>
          )}
        </div>
      </section>}

      {vis.blog && blogPosts.length > 0 && <section id="blog" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12"><h2 className="text-3xl font-bold tracking-tight mb-4">Blog</h2><p className="text-muted-foreground max-w-2xl mx-auto">Psikoloji dünyasından güncel yazılar ve faydalı bilgiler.</p></div>
          {blogPosts.length <= 3 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.map(post => (
                <Link key={post.id} href={`/blog?id=${post.id}`}>
                  <Card className="flex flex-col h-full hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer overflow-hidden">
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
                      <p className="text-sm text-muted-foreground line-clamp-3 flex-grow">{post.excerpt || post.content.replace(/<[^>]*>/g, '').substring(0, 150) + "..."}</p>
                      <span className="text-xs text-primary font-medium mt-2 flex items-center gap-1">Devamını Oku <ArrowRight className="h-3 w-3" /></span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <HorizontalScroll visibleCount={3}>
              {blogPosts.map(post => (
                <Link key={post.id} href={`/blog?id=${post.id}`} className="flex-shrink-0 w-[calc((100%-48px)/3)]" style={{ minWidth: "300px" }}>
                  <Card className="flex flex-col h-full hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer overflow-hidden">
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
                      <p className="text-sm text-muted-foreground line-clamp-3 flex-grow">{post.excerpt || post.content.replace(/<[^>]*>/g, '').substring(0, 150) + "..."}</p>
                      <span className="text-xs text-primary font-medium mt-2 flex items-center gap-1">Devamını Oku <ArrowRight className="h-3 w-3" /></span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </HorizontalScroll>
          )}
          <div className="text-center mt-8"><Link href="/blog"><Button variant="outline" className="gap-2">Tüm Yazıları Gör <ArrowRight className="h-4 w-4" /></Button></Link></div>
        </div>
      </section>}

      {vis.contact && <section id="iletisim" className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12"><h2 className="text-3xl font-bold tracking-tight mb-4">İletişim</h2></div>
          {contact && <>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="text-center"><CardContent className="pt-6"><Phone className="h-8 w-8 text-primary mx-auto mb-3" /><h3 className="font-semibold mb-1">Telefon</h3><p className="text-sm text-muted-foreground">{contact.phone}</p></CardContent></Card>
              <Card className="text-center"><CardContent className="pt-6"><Mail className="h-8 w-8 text-primary mx-auto mb-3" /><h3 className="font-semibold mb-1">Email</h3><p className="text-sm text-muted-foreground">{contact.email}</p></CardContent></Card>
              <Card className="text-center"><CardContent className="pt-6"><MapPin className="h-8 w-8 text-primary mx-auto mb-3" /><h3 className="font-semibold mb-1">Adres</h3><p className="text-sm text-muted-foreground">{contact.address}</p></CardContent></Card>
            </div>
            {/* Sosyal Medya */}
            {(contact.socialMedia?.instagram || contact.socialMedia?.facebook || contact.socialMedia?.twitter || contact.socialMedia?.linkedin) && (
              <div className="flex justify-center gap-4 mt-8">
                {contact.socialMedia.instagram && (
                  <a href={contact.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full bg-background border hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center group" title="Instagram">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  </a>
                )}
                {contact.socialMedia.facebook && (
                  <a href={contact.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full bg-background border hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center group" title="Facebook">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </a>
                )}
                {contact.socialMedia.twitter && (
                  <a href={contact.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full bg-background border hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center group" title="X (Twitter)">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                )}
                {contact.socialMedia.linkedin && (
                  <a href={contact.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full bg-background border hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center group" title="LinkedIn">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </a>
                )}
              </div>
            )}
          </>}
        </div>
      </section>}

      <footer className="py-8 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">{logoImage ? <img src={logoImage} alt={logo || "Logo"} className="h-6 object-contain" /> : <Brain className="h-5 w-5 text-primary" />}{logo ? <span className="font-semibold">{logo}</span> : null}</div>
            <div className="flex items-center gap-4">
              {/* Sosyal Medya Footer */}
              {contact && (contact.socialMedia?.instagram || contact.socialMedia?.facebook || contact.socialMedia?.twitter || contact.socialMedia?.linkedin) && (
                <div className="flex items-center gap-2">
                  {contact.socialMedia.instagram && <a href={contact.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" title="Instagram"><svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></a>}
                  {contact.socialMedia.facebook && <a href={contact.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" title="Facebook"><svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>}
                  {contact.socialMedia.twitter && <a href={contact.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" title="X (Twitter)"><svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>}
                  {contact.socialMedia.linkedin && <a href={contact.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" title="LinkedIn"><svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>}
                  <span className="text-muted-foreground">|</span>
                </div>
              )}
              <Link href="/kvkk" className="text-sm text-muted-foreground hover:text-foreground transition-colors">KVKK & Gizlilik</Link>
              <span className="text-muted-foreground">|</span>
              <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Giriş</Link>
              <span className="text-muted-foreground">|</span>
              <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()}{logo ? ` ${logo}. ` : " "}Tüm hakları saklıdır.</p>
            </div>
          </div>
        </div>
      </footer>
      <WhatsAppButton />
    </div>
  );
}
