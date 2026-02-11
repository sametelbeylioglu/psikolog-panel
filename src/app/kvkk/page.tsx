"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Brain, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLogo, getLogoImage, getContactInfo, type ContactInfo } from "@/lib/content-manager";

export default function KVKKPage() {
  const [logo, setLogo] = useState("PsikoPanel");
  const [logoImg, setLogoImg] = useState("");
  const [contact, setContact] = useState<ContactInfo | null>(null);

  useEffect(() => {
    const load = async () => {
      setLogo(await getLogo());
      setLogoImg(await getLogoImage());
      setContact(await getContactInfo());
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">{logoImg ? <img src={logoImg} alt={logo || "Logo"} className="h-8 object-contain" /> : <Brain className="h-6 w-6 text-primary" />}{logo ? <span className="text-xl font-bold">{logo}</span> : null}</Link>
          <Link href="/"><Button variant="ghost" className="gap-2"><ArrowLeft className="h-4 w-4" />Ana Sayfa</Button></Link>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Kişisel Verilerin Korunması ve Gizlilik Politikası</h1>

        <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">1. Veri Sorumlusu</h2>
            <p>6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) uyarınca, kişisel verileriniz; veri sorumlusu olarak {logo ? `${logo} tarafından` : "aşağıda belirtilen veri sorumlusu tarafından"} aşağıda açıklanan kapsamda işlenebilecektir.</p>
            {contact && <p>İletişim: {contact.email} | {contact.phone}</p>}
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">2. Toplanan Kişisel Veriler</h2>
            <p>Web sitemiz üzerinden aşağıdaki kişisel veriler toplanabilmektedir:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Kimlik bilgileri (ad, soyad)</li>
              <li>İletişim bilgileri (e-posta adresi, telefon numarası)</li>
              <li>Randevu bilgileri (tarih, saat, tercih edilen hizmet)</li>
              <li>Seans notları (yalnızca danışman tarafından erişilebilir)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">3. Kişisel Verilerin İşlenme Amacı</h2>
            <p>Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Randevu oluşturma ve yönetimi</li>
              <li>Psikolojik danışmanlık hizmetlerinin sunulması</li>
              <li>Sizinle iletişime geçilmesi</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi</li>
              <li>Hizmet kalitesinin artırılması</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">4. Kişisel Verilerin Aktarılması</h2>
            <p>Kişisel verileriniz, yasal zorunluluklar dışında üçüncü kişilerle paylaşılmamaktadır. Verileriniz güvenli sunucularda şifreli olarak saklanmaktadır.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">5. Kişisel Verilerin Saklanma Süresi</h2>
            <p>Kişisel verileriniz, işlenme amacının gerektirdiği süre boyunca ve yasal saklama süreleri kapsamında muhafaza edilmektedir. Sürelerin sona ermesiyle birlikte verileriniz silinir, yok edilir veya anonim hale getirilir.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">6. Veri Sahibinin Hakları</h2>
            <p>KVKK&apos;nın 11. maddesi gereğince aşağıdaki haklara sahipsiniz:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
              <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
              <li>Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
              <li>Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme</li>
              <li>Kişisel verilerinizin eksik veya yanlış işlenmiş olması halinde bunların düzeltilmesini isteme</li>
              <li>KVKK&apos;nın 7. maddesinde öngörülen şartlar çerçevesinde kişisel verilerinizin silinmesini veya yok edilmesini isteme</li>
              <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
              <li>Kişisel verilerinizin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız halinde zararın giderilmesini talep etme</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">7. Çerez Politikası</h2>
            <p>Web sitemiz, kullanıcı deneyimini iyileştirmek amacıyla çerezler kullanabilir. Çerezler, tarayıcınız aracılığıyla cihazınıza yerleştirilen küçük veri dosyalarıdır. Tarayıcı ayarlarınızdan çerezleri devre dışı bırakabilirsiniz.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">8. Gizlilik Politikası Değişiklikleri</h2>
            <p>Bu gizlilik politikası gerektiğinde güncellenebilir. Güncellemeler web sitemizde yayınlandığı tarihte yürürlüğe girer.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">9. İletişim</h2>
            <p>Kişisel verilerinizle ilgili sorularınız için bizimle iletişime geçebilirsiniz:</p>
            {contact && (
              <div className="bg-muted rounded-lg p-4 mt-2 space-y-1">
                <p>E-posta: {contact.email}</p>
                <p>Telefon: {contact.phone}</p>
                <p>Adres: {contact.address}</p>
              </div>
            )}
          </section>

          <p className="text-xs text-muted-foreground mt-8 border-t pt-4">Son güncelleme: {new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
      </div>
    </div>
  );
}
