"use client";
import { useState, useEffect } from "react";
import { Bell, CalendarCheck, DollarSign, Info, Trash2, Check, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getNotifications, markNotificationAsRead, deleteNotification, saveNotifications, formatTimeAgo, type Notification } from "@/lib/content-manager";
import { useRouter } from "next/navigation";

const typeConfig: Record<string, { icon: typeof Bell; color: string; label: string }> = {
  appointment: { icon: CalendarCheck, color: "text-blue-600 bg-blue-100", label: "Randevu" },
  payment: { icon: DollarSign, color: "text-green-600 bg-green-100", label: "Ödeme" },
  general: { icon: Info, color: "text-gray-600 bg-gray-100", label: "Genel" },
};

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => { setNotifications(getNotifications()); }, []);
  const refresh = () => setNotifications(getNotifications());

  const handleRead = (id: string) => { markNotificationAsRead(id); refresh(); };
  const handleDelete = (id: string) => { if (!confirm("Bu bildirimi silmek istediğinize emin misiniz?")) return; deleteNotification(id); refresh(); };
  const markAllRead = () => {
    const all = getNotifications().map(n => ({ ...n, read: true }));
    saveNotifications(all);
    refresh();
  };

  const handleClick = (n: Notification) => {
    if (!n.read) handleRead(n.id);
    if (n.type === "appointment") router.push("/admin/appointments");
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const filtered = notifications.filter(n => {
    if (filter === "unread") return !n.read;
    if (filter === "read") return n.read;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bildirimler</h1>
          <p className="text-muted-foreground">{unreadCount} okunmamış bildirim</p>
        </div>
        {unreadCount > 0 && <Button variant="outline" onClick={markAllRead} className="gap-2"><Check className="h-4 w-4" />Tümünü Okundu İşaretle</Button>}
      </div>

      <div className="flex gap-2">
        {[
          { key: "all", label: "Tümü", count: notifications.length },
          { key: "unread", label: "Okunmamış", count: unreadCount },
          { key: "read", label: "Okunmuş", count: notifications.length - unreadCount },
        ].map(f => (
          <Button key={f.key} variant={filter === f.key ? "default" : "outline"} size="sm" onClick={() => setFilter(f.key)}>
            {f.label} ({f.count})
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <Bell className="h-12 w-12 mx-auto mb-3 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground">Bildirim bulunamadı.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(n => {
            const config = typeConfig[n.type] || typeConfig.general;
            const Icon = config.icon;
            return (
              <Card key={n.id} className={`cursor-pointer hover:shadow-md transition-shadow ${!n.read ? "border-l-4 border-l-primary bg-primary/5" : ""}`}>
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${config.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0" onClick={() => handleClick(n)}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className={`text-sm ${!n.read ? "font-semibold" : "font-medium"}`}>{n.title}</p>
                            <Badge variant="secondary" className="text-xs">{config.label}</Badge>
                            {!n.read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{formatTimeAgo(n.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!n.read && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleRead(n.id); }} title="Okundu işaretle"><Check className="h-4 w-4" /></Button>}
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }} title="Sil"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
