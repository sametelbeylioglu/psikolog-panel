"use client";
import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { getContactInfo } from "@/lib/content-manager";

export default function WhatsAppButton() {
  const [phone, setPhone] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const load = async () => {
      const contact = await getContactInfo();
      // Telefon numarasını WhatsApp formatına çevir (sadece rakamlar)
      const cleaned = contact.phone.replace(/\D/g, "");
      // Başında 0 varsa kaldır ve 90 ekle (Türkiye)
      const formatted = cleaned.startsWith("90") ? cleaned : cleaned.startsWith("0") ? "90" + cleaned.slice(1) : "90" + cleaned;
      setPhone(formatted);
    };
    load();
    // 3 saniye sonra tooltip göster
    const timer = setTimeout(() => setShowTooltip(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismissTooltip = () => {
    setDismissed(true);
    setShowTooltip(false);
  };

  if (!phone) return null;

  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent("Merhaba, randevu almak istiyorum.")}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-end gap-3">
      {showTooltip && !dismissed && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 pr-8 max-w-[220px] relative animate-in fade-in slide-in-from-right-5 duration-300">
          <button onClick={handleDismissTooltip} className="absolute top-1.5 right-1.5 text-muted-foreground hover:text-foreground">
            <X className="h-3.5 w-3.5" />
          </button>
          <p className="text-sm font-medium text-foreground">Size nasıl yardımcı olabiliriz?</p>
          <p className="text-xs text-muted-foreground mt-0.5">WhatsApp ile hızlı iletişim kurun</p>
        </div>
      )}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        aria-label="WhatsApp ile iletişime geçin"
      >
        <MessageCircle className="h-7 w-7 fill-current" />
      </a>
    </div>
  );
}
