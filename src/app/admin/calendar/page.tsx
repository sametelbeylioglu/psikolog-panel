"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, CalendarCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAppointments, type Appointment } from "@/lib/content-manager";

const DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500",
  confirmed: "bg-green-500",
  completed: "bg-blue-500",
  cancelled: "bg-red-500",
};

export default function CalendarPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => { setAppointments(getAppointments()); }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const today = () => setCurrentDate(new Date());

  const getDateStr = (day: number) => `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const getAppointmentsForDay = (day: number) => appointments.filter(a => a.date === getDateStr(day));

  const todayStr = new Date().toISOString().split("T")[0];
  const selectedAppointments = selectedDate ? appointments.filter(a => a.date === selectedDate) : [];

  const statusLabel: Record<string, string> = { pending: "Beklemede", confirmed: "Onaylandı", completed: "Tamamlandı", cancelled: "İptal" };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Randevu Takvimi</h1>
        <p className="text-muted-foreground">Aylık takvim görünümü.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle>{MONTHS[month]} {year}</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="sm" onClick={today}>Bugün</Button>
              <Button variant="outline" size="icon" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden">
              {DAYS.map(d => <div key={d} className="bg-background p-2 text-center text-xs font-medium text-muted-foreground">{d}</div>)}
              {Array.from({ length: startOffset }).map((_, i) => <div key={`e-${i}`} className="bg-background p-2 min-h-[80px]" />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = getDateStr(day);
                const dayAppointments = getAppointmentsForDay(day);
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDate;

                return (
                  <div key={day} onClick={() => setSelectedDate(dateStr)} className={`bg-background p-2 min-h-[80px] cursor-pointer hover:bg-muted/50 transition-colors ${isSelected ? "ring-2 ring-primary ring-inset" : ""}`}>
                    <div className={`text-sm mb-1 ${isToday ? "bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center font-bold" : "text-foreground"}`}>{day}</div>
                    <div className="space-y-0.5">
                      {dayAppointments.slice(0, 3).map(a => (
                        <div key={a.id} className="flex items-center gap-1">
                          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusColors[a.status]}`} />
                          <span className="text-xs truncate">{a.time} {a.clientName.split(" ")[0]}</span>
                        </div>
                      ))}
                      {dayAppointments.length > 3 && <span className="text-xs text-muted-foreground">+{dayAppointments.length - 3} daha</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected Day Detail */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedDate ? new Date(selectedDate + "T00:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }) : "Bir gün seçin"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedDate ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarCheck className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Takvimden bir gün seçin</p>
              </div>
            ) : selectedAppointments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Bu gün için randevu yok.</p>
            ) : (
              <div className="space-y-3">
                {selectedAppointments.sort((a, b) => a.time.localeCompare(b.time)).map(a => (
                  <div key={a.id} className="border rounded-lg p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{a.time}</span>
                      <Badge className={`text-xs ${
                        a.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                        a.status === "confirmed" ? "bg-green-100 text-green-800" :
                        a.status === "completed" ? "bg-blue-100 text-blue-800" :
                        "bg-red-100 text-red-800"
                      }`}>{statusLabel[a.status]}</Badge>
                    </div>
                    <p className="text-sm font-medium">{a.clientName}</p>
                    <p className="text-xs text-muted-foreground">{a.packageName}</p>
                    <p className="text-xs text-muted-foreground">{a.clientPhone}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
