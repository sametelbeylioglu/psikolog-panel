"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Bell, CalendarCheck, Calendar, Users, Package, BarChart3, Globe, Settings, ChevronDown, ChevronRight, Brain, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLogo, getLogoImage } from "@/lib/content-manager";

const menuItems = [
  { title: "Kontrol Paneli", icon: LayoutDashboard, href: "/admin" },
  { title: "Bildirimler", icon: Bell, href: "/admin/notifications" },
  { title: "Randevular", icon: CalendarCheck, href: "/admin/appointments" },
  { title: "Randevu Takvimi", icon: Calendar, href: "/admin/calendar" },
  { title: "Danışanlar", icon: Users, href: "/admin/clients" },
  { title: "Paketler", icon: Package, href: "/admin/packages" },
  { title: "Raporlar", icon: BarChart3, href: "/admin/reports" },
  { title: "Web Sitesi Yönetimi", icon: Globe, submenu: [
    { title: "Ana Sayfa", href: "/admin/website/homepage" },
    { title: "Hakkımda", href: "/admin/website/about" },
    { title: "Blog", href: "/admin/website/blog" },
    { title: "İletişim", href: "/admin/website/contact" },
  ]},
  { title: "Ayarlar", icon: Settings, href: "/admin/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [websiteOpen, setWebsiteOpen] = useState(pathname.startsWith("/admin/website"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logo, setLogo] = useState("");
  const [logoImg, setLogoImg] = useState("");
  const [logoLoaded, setLogoLoaded] = useState(false);
  const isActive = (href: string) => href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  useEffect(() => {
    Promise.all([getLogo(), getLogoImage()]).then(([l, img]) => { setLogo(l); setLogoImg(img); setLogoLoaded(true); });
  }, []);

  const content = (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-6 py-5 border-b">
        {!logoLoaded ? <Brain className="h-7 w-7 text-primary" /> : (logoImg ? <img src={logoImg} alt={logo || "Logo"} className="h-8 object-contain" /> : <Brain className="h-7 w-7 text-primary" />)}
        {logoLoaded && logo ? <span className="text-xl font-bold tracking-tight">{logo}</span> : null}
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            if (item.submenu) return (
              <li key={item.title}>
                <button onClick={() => setWebsiteOpen(!websiteOpen)} className={cn("flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors", pathname.startsWith("/admin/website") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground")}>
                  <div className="flex items-center gap-3"><item.icon className="h-4 w-4" />{item.title}</div>
                  {websiteOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                {websiteOpen && <ul className="ml-7 mt-1 space-y-1">{item.submenu.map((sub) => (
                  <li key={sub.href}><Link href={sub.href} onClick={() => setMobileOpen(false)} className={cn("block px-3 py-2 rounded-lg text-sm transition-colors", isActive(sub.href) ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-accent hover:text-foreground")}>{sub.title}</Link></li>
                ))}</ul>}
              </li>
            );
            return (
              <li key={item.href}><Link href={item.href!} onClick={() => setMobileOpen(false)} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors", isActive(item.href!) ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground")}><item.icon className="h-4 w-4" />{item.title}</Link></li>
            );
          })}
        </ul>
      </nav>
      <div className="px-6 py-4 border-t"><p className="text-xs text-muted-foreground">Psikolog Panel v2.0</p></div>
    </div>
  );

  return (
    <>
      <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50 lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>
      {mobileOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={cn("fixed inset-y-0 left-0 z-40 w-64 bg-card border-r transform transition-transform lg:hidden", mobileOpen ? "translate-x-0" : "-translate-x-full")}>{content}</aside>
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-card border-r">{content}</aside>
    </>
  );
}
