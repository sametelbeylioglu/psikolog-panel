"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, LogOut, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getNotifications, logout } from "@/lib/content-manager";

export default function Header() {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const update = async () => setUnreadCount((await getNotifications()).filter(n => !n.read).length);
    update();
    const interval = setInterval(update, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card px-6 lg:px-8">
      <div className="lg:hidden w-10" /><div className="flex-1" />
      <div className="flex items-center gap-2">
        <Link href="/admin/notifications"><Button variant="ghost" size="icon" className="relative"><Bell className="h-5 w-5" />{unreadCount > 0 && <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-destructive text-destructive-foreground">{unreadCount}</Badge>}</Button></Link>
        <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><User className="h-5 w-5" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild><Link href="/admin/settings" className="flex items-center gap-2"><Settings className="h-4 w-4" />Ayarlar</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { logout(); router.push("/login"); }} className="flex items-center gap-2 text-destructive"><LogOut className="h-4 w-4" />Çıkış Yap</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
