// =============================================
// Psikolog Panel - Content Manager
// Supabase (merkezi) + localStorage (fallback)
// =============================================

import { getSupabase, isSupabaseConfigured } from './supabase';

// ============ INTERFACES ============

export interface HeroContent {
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  image?: string;
}

export interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface Stat {
  id: string;
  value: string;
  label: string;
}

export interface AboutContent {
  title: string;
  description: string;
  image?: string;
  qualifications: string[];
  experience: string;
  approach: string;
}

export interface TherapyPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  sessions: number;
  features: string[];
  popular?: boolean;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  sessions: number;
  features: string[];
  popular?: boolean;
}

export interface Appointment {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  packageId: string;
  packageName: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  firstVisit: string;
  lastVisit: string;
  totalSessions: number;
  status: 'active' | 'inactive';
  notes?: string;
}

export interface Notification {
  id: string;
  type: 'appointment' | 'payment' | 'general';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  image?: string;
  author: string;
  createdAt: string;
  published: boolean;
}

export interface ContactInfo {
  address: string;
  phone: string;
  email: string;
  workingHours: string;
  mapEmbed?: string;
  socialMedia: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
  };
}

// ============ STORAGE KEYS ============

const STORAGE_KEYS = {
  HOMEPAGE: 'homepage_content',
  ABOUT: 'about_content',
  STATS: 'stats_content',
  FEATURES: 'features_content',
  LOGO: 'site_logo',
  THERAPY_PACKAGES: 'THERAPY_PACKAGES',
  APPOINTMENTS: 'appointments_data',
  SLOT_RESERVATIONS: 'slot_reservations',
  NOTIFICATIONS: 'notifications_data',
  CLIENTS: 'clients_data',
  BLOG_POSTS: 'blog_posts',
  CONTACT_INFO: 'contact_info',
  IS_AUTHENTICATED: 'isAuthenticated',
  USER_EMAIL: 'userEmail',
  USER_PASSWORD: 'userPassword',
  TWO_FACTOR_ENABLED: 'twoFactorEnabled',
  TWO_FACTOR_CODE: 'twoFactorCode',
  LOGO_IMAGE: 'site_logo_image',
  FAVICON: 'site_favicon',
  SITE_TITLE: 'site_title',
};

// ============ CORE STORAGE (Supabase + fallback) ============

async function getStorageItem<T>(key: string, defaultValue: T): Promise<T> {
  if (typeof window === 'undefined') return defaultValue;

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('site_data')
        .select('value')
        .eq('key', key)
        .single();

      if (data && !error) return data.value as T;

      // İlk kez: varsayılan değeri veritabanına kaydet
      await supabase.from('site_data').upsert({ key, value: defaultValue as unknown });
      return defaultValue;
    } catch {
      return defaultValue;
    }
  }

  // Fallback: localStorage
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

async function setStorageItem<T>(key: string, value: T): Promise<void> {
  if (typeof window === 'undefined') return;

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('site_data').upsert({ key, value: value as unknown });
    } catch (error) {
      console.error(`Error writing ${key} to Supabase:`, error);
    }
  }

  // Her zaman localStorage'a da yaz (local cache)
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
  }
}

// ============ DEFAULT DATA ============

const defaultHeroContent: HeroContent = {
  title: "Profesyonel Psikolojik Danışmanlık",
  subtitle: "Uzman Psikolog",
  description: "Bireysel terapi, çift terapisi ve aile danışmanlığı hizmetleri ile yaşam kalitenizi artırın. Güvenli ve destekleyici bir ortamda, sizin için en uygun terapi yaklaşımını birlikte belirleyelim.",
  buttonText: "Randevu Al",
  buttonLink: "/randevu",
};

const defaultFeatures: Feature[] = [
  { id: '1', icon: 'Brain', title: 'Bireysel Terapi', description: 'Kaygı, depresyon, stres ve kişisel gelişim konularında birebir profesyonel destek.' },
  { id: '2', icon: 'Heart', title: 'Çift Terapisi', description: 'İlişki sorunları, iletişim problemleri ve çift uyumu konularında uzman rehberlik.' },
  { id: '3', icon: 'Users', title: 'Aile Danışmanlığı', description: 'Aile içi iletişim, ebeveynlik becerileri ve aile dinamikleri üzerine destek.' },
  { id: '4', icon: 'Shield', title: 'Travma Terapisi', description: 'EMDR ve bilişsel davranışçı terapi teknikleri ile travma sonrası iyileşme.' },
];

const defaultStats: Stat[] = [
  { id: '1', value: '1000+', label: 'Mutlu Danışan' },
  { id: '2', value: '15+', label: 'Yıllık Deneyim' },
  { id: '3', value: '5000+', label: 'Terapi Seansı' },
  { id: '4', value: '%95', label: 'Memnuniyet Oranı' },
];

const defaultAboutContent: AboutContent = {
  title: "Hakkımda",
  description: "Klinik psikolog olarak 15 yılı aşkın deneyimimle, bireylerin ruh sağlığını korumalarına ve geliştirmelerine yardımcı oluyorum. Bilişsel Davranışçı Terapi (BDT), EMDR ve Şema Terapi alanlarında uzmanlaştım.",
  qualifications: [
    "İstanbul Üniversitesi - Klinik Psikoloji Doktora",
    "Bilişsel Davranışçı Terapi Sertifikası",
    "EMDR Uygulayıcı Sertifikası",
    "Şema Terapi Eğitimi",
    "Türk Psikologlar Derneği Üyesi",
  ],
  experience: "15+ yıl klinik deneyim",
  approach: "Danışan merkezli, kanıta dayalı terapi yaklaşımları kullanarak, her bireyin benzersiz ihtiyaçlarına uygun kişiselleştirilmiş tedavi planları oluşturuyorum.",
};

const defaultPackages: TherapyPackage[] = [
  { id: '1', name: 'Başlangıç Paketi', description: 'Psikolojik danışmanlığa ilk adım.', price: 2500, duration: '50 dakika', sessions: 4, features: ['Kapsamlı psikolojik değerlendirme', 'Kişiye özel terapi planı', '4 bireysel seans', 'Seans arası destek'] },
  { id: '2', name: 'Standart Terapi Paketi', description: 'Düzenli terapi süreci için ideal paket.', price: 5500, duration: '50 dakika', sessions: 8, popular: true, features: ['Detaylı psikolojik değerlendirme', 'Kişiye özel terapi planı', '8 bireysel seans', 'Seans arası WhatsApp desteği', 'Ev ödevleri ve çalışma materyalleri', 'İlerleme raporları'] },
  { id: '3', name: 'Yoğun Terapi Paketi', description: 'Kapsamlı terapi süreci.', price: 9500, duration: '50 dakika', sessions: 16, features: ['Kapsamlı psikolojik test bataryası', 'Kişiye özel terapi planı', '16 bireysel seans', '7/24 WhatsApp desteği', 'Ev ödevleri ve çalışma materyalleri', 'Aylık ilerleme raporları', 'Gerektiğinde aile görüşmesi', '3 ay takip seansı'] },
];

const defaultAppointments: Appointment[] = [];

const defaultNotifications: Notification[] = [
  { id: '1', type: 'general', title: 'Hoş Geldiniz', message: "Psikolog Panel'e hoş geldiniz!", read: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
];

const defaultClients: Client[] = [];

const defaultBlogPosts: BlogPost[] = [
  { id: '1', title: 'Kaygı Bozukluğu ile Başa Çıkma Yolları', content: 'Kaygı bozukluğu, günümüzde en sık karşılaşılan ruhsal sorunlardan biridir. Modern yaşamın getirdiği stres, belirsizlik ve hızlı değişimler, kaygı düzeyimizi artırabilir.\n\nKaygıyla başa çıkmak için bazı etkili yöntemler:\n\n1. Derin Nefes Egzersizleri: Günde en az 3 kez, 5 dakika boyunca derin nefes alıp verin.\n\n2. Mindfulness (Farkındalık): Anı yaşamaya odaklanın. Geçmiş veya gelecek hakkında düşünmek yerine şu ana konsantre olun.\n\n3. Düzenli Egzersiz: Haftada en az 3 gün, 30 dakika yürüyüş veya spor yapın.\n\n4. Uyku Düzeni: Her gün aynı saatte yatıp kalkın, 7-8 saat uyuyun.\n\n5. Profesyonel Destek: Kaygınız günlük yaşamınızı etkiliyorsa bir uzmana başvurun.', excerpt: 'Kaygı bozukluğu ile başa çıkmanın etkili yollarını keşfedin.', author: 'Psk. Uzman', createdAt: '2026-01-15T10:00:00', published: true },
  { id: '2', title: 'Sağlıklı İlişkilerin Temelleri', content: 'Sağlıklı ilişkiler, mutlu bir yaşamın temel yapı taşlarından biridir. İster romantik, ister aile veya arkadaşlık ilişkisi olsun, sağlıklı bir ilişkinin temel bileşenleri benzerdir.\n\nSağlıklı ilişkilerin temel özellikleri:\n\n1. Açık İletişim: Duygularınızı ve düşüncelerinizi karşı tarafa açıkça ifade edin.\n\n2. Karşılıklı Saygı: Farklılıklara saygı gösterin ve sınırları kabul edin.\n\n3. Güven: Güven inşa etmek zaman alır ama ilişkinin temelidir.\n\n4. Empati: Karşı tarafın perspektifinden bakmaya çalışın.\n\n5. Birlikte Büyüme: İlişkide her iki tarafın da gelişimine alan tanıyın.', excerpt: 'Sağlıklı ve mutlu ilişkilerin temellerini öğrenin.', author: 'Psk. Uzman', createdAt: '2026-01-28T14:00:00', published: true },
];

const defaultContactInfo: ContactInfo = {
  address: 'Bağdat Caddesi No: 123, Kat: 4, Kadıköy/İstanbul',
  phone: '0212 555 44 33',
  email: 'info@psikolog.com',
  workingHours: 'Pazartesi - Cuma: 09:00 - 18:00\nCumartesi: 10:00 - 14:00',
  socialMedia: { instagram: 'https://instagram.com/psikolog', facebook: 'https://facebook.com/psikolog', linkedin: 'https://linkedin.com/in/psikolog' },
};

// ============ HERO ============
export async function getHeroContent(): Promise<HeroContent> { return getStorageItem(STORAGE_KEYS.HOMEPAGE, defaultHeroContent); }
export async function saveHeroContent(content: HeroContent): Promise<void> { await setStorageItem(STORAGE_KEYS.HOMEPAGE, content); }

// ============ FEATURES ============
export async function getFeatures(): Promise<Feature[]> { return getStorageItem(STORAGE_KEYS.FEATURES, defaultFeatures); }
export async function saveFeatures(features: Feature[]): Promise<void> { await setStorageItem(STORAGE_KEYS.FEATURES, features); }

// ============ STATS ============
export async function getStats(): Promise<Stat[]> { return getStorageItem(STORAGE_KEYS.STATS, defaultStats); }
export async function saveStats(stats: Stat[]): Promise<void> { await setStorageItem(STORAGE_KEYS.STATS, stats); }

// ============ ABOUT ============
export async function getAboutContent(): Promise<AboutContent> { return getStorageItem(STORAGE_KEYS.ABOUT, defaultAboutContent); }
export async function saveAboutContent(content: AboutContent): Promise<void> { await setStorageItem(STORAGE_KEYS.ABOUT, content); }

// ============ PACKAGES ============
export async function getPackages(): Promise<TherapyPackage[]> { return getStorageItem(STORAGE_KEYS.THERAPY_PACKAGES, defaultPackages); }
export async function savePackages(packages: TherapyPackage[]): Promise<void> { await setStorageItem(STORAGE_KEYS.THERAPY_PACKAGES, packages); }
export async function getPackagesAsServices(): Promise<Service[]> { return (await getPackages()).map(p => ({ ...p })); }

// ============ APPOINTMENTS ============
export async function getAppointments(): Promise<Appointment[]> { return getStorageItem(STORAGE_KEYS.APPOINTMENTS, defaultAppointments); }
export async function saveAppointments(appointments: Appointment[]): Promise<void> { await setStorageItem(STORAGE_KEYS.APPOINTMENTS, appointments); }
export async function saveAppointment(apt: Appointment): Promise<void> { const all = await getAppointments(); all.push(apt); await saveAppointments(all); }
export async function updateAppointment(id: string, updates: Partial<Appointment>): Promise<void> { const all = await getAppointments(); const i = all.findIndex(a => a.id === id); if (i !== -1) { all[i] = { ...all[i], ...updates }; await saveAppointments(all); } }

// ============ SLOT RESERVATIONS (kısa süreli rezerve - çakışmayı önler) ============
const RESERVATION_TTL_MS = 15 * 60 * 1000; // 15 dakika

export interface SlotReservation { date: string; time: string; expiresAt: string; }

async function getSlotReservationsRaw(): Promise<SlotReservation[]> {
  return getStorageItem<SlotReservation[]>(STORAGE_KEYS.SLOT_RESERVATIONS, []);
}

export async function getTakenAndReservedForDate(date: string): Promise<{ taken: string[]; reserved: string[] }> {
  const appointments = await getAppointments();
  const taken = appointments
    .filter(a => a.date === date && a.status !== 'cancelled')
    .map(a => a.time);
  const now = new Date().getTime();
  let raw = await getSlotReservationsRaw();
  raw = raw.filter(r => r.expiresAt && new Date(r.expiresAt).getTime() > now);
  await setStorageItem(STORAGE_KEYS.SLOT_RESERVATIONS, raw);
  const reserved = raw.filter(r => r.date === date).map(r => r.time);
  return { taken: [...new Set(taken)], reserved: [...new Set(reserved)] };
}

export async function addSlotReservation(date: string, time: string): Promise<void> {
  const raw = await getSlotReservationsRaw();
  const now = new Date().getTime();
  const expiresAt = new Date(now + RESERVATION_TTL_MS).toISOString();
  const filtered = raw.filter(r => !(r.date === date && r.time === time) && new Date(r.expiresAt).getTime() > now);
  filtered.push({ date, time, expiresAt });
  await setStorageItem(STORAGE_KEYS.SLOT_RESERVATIONS, filtered);
}

export async function removeSlotReservation(date: string, time: string): Promise<void> {
  const raw = await getSlotReservationsRaw();
  const now = new Date().getTime();
  const filtered = raw.filter(r => (r.date !== date || r.time !== time) && new Date(r.expiresAt).getTime() > now);
  await setStorageItem(STORAGE_KEYS.SLOT_RESERVATIONS, filtered);
}

// ============ CLIENTS ============
export async function getClients(): Promise<Client[]> { return getStorageItem(STORAGE_KEYS.CLIENTS, defaultClients); }
export async function saveClients(clients: Client[]): Promise<void> { await setStorageItem(STORAGE_KEYS.CLIENTS, clients); }

// ============ NOTIFICATIONS ============
export async function getNotifications(): Promise<Notification[]> { return getStorageItem(STORAGE_KEYS.NOTIFICATIONS, defaultNotifications); }
export async function saveNotifications(notifications: Notification[]): Promise<void> { await setStorageItem(STORAGE_KEYS.NOTIFICATIONS, notifications); }
export async function addNotification(n: Notification): Promise<void> { const all = await getNotifications(); all.unshift(n); await saveNotifications(all); }
export async function markNotificationAsRead(id: string): Promise<void> { const all = await getNotifications(); const i = all.findIndex(n => n.id === id); if (i !== -1) { all[i].read = true; await saveNotifications(all); } }
export async function deleteNotification(id: string): Promise<void> { const all = await getNotifications(); await saveNotifications(all.filter(n => n.id !== id)); }

// ============ BLOG ============
export async function getBlogPosts(): Promise<BlogPost[]> { return getStorageItem(STORAGE_KEYS.BLOG_POSTS, defaultBlogPosts); }
export async function saveBlogPosts(posts: BlogPost[]): Promise<void> { await setStorageItem(STORAGE_KEYS.BLOG_POSTS, posts); }

// ============ CONTACT ============
export async function getContactInfo(): Promise<ContactInfo> { return getStorageItem(STORAGE_KEYS.CONTACT_INFO, defaultContactInfo); }
export async function saveContactInfo(info: ContactInfo): Promise<void> { await setStorageItem(STORAGE_KEYS.CONTACT_INFO, info); }

// ============ LOGO ============
export async function getLogo(): Promise<string> { return getStorageItem(STORAGE_KEYS.LOGO, 'PsikoPanel'); }
export async function saveLogo(logo: string): Promise<void> { await setStorageItem(STORAGE_KEYS.LOGO, logo); }

// ============ LOGO IMAGE ============
export async function getLogoImage(): Promise<string> { return getStorageItem(STORAGE_KEYS.LOGO_IMAGE, ''); }
export async function saveLogoImage(img: string): Promise<void> { await setStorageItem(STORAGE_KEYS.LOGO_IMAGE, img); }

// ============ FAVICON ============
export async function getFavicon(): Promise<string> { return getStorageItem(STORAGE_KEYS.FAVICON, ''); }
export async function saveFavicon(fav: string): Promise<void> { await setStorageItem(STORAGE_KEYS.FAVICON, fav); }

// ============ SITE TITLE (Browser Tab) ============
export async function getSiteTitle(): Promise<string> { return getStorageItem(STORAGE_KEYS.SITE_TITLE, 'PsikoPanel - Profesyonel Psikolojik Danışmanlık'); }
export async function saveSiteTitle(title: string): Promise<void> { await setStorageItem(STORAGE_KEYS.SITE_TITLE, title); }

// ============ PASSWORD HASHING (SHA-256) ============
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + '_psikopanel_salt_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ============ AUTH ============
// Varsayılan şifre hash'i (pre-computed, kaynak kodda açık şifre yok)
const DEFAULT_PW_HASH = '718bea54d0d80474708fb1b01c10010ea639a4fcec8103f2e600b40ae9e62476';

export async function initializeAuth(): Promise<void> {
  if (typeof window === 'undefined') return;
  const version = await getStorageItem('auth_version', '');
  if (version !== 'v6') {
    await setStorageItem(STORAGE_KEYS.USER_EMAIL, 'admin');
    await setStorageItem(STORAGE_KEYS.USER_PASSWORD, DEFAULT_PW_HASH);
    await setStorageItem('auth_version', 'v6');
    localStorage.removeItem(STORAGE_KEYS.IS_AUTHENTICATED);
  }
}

export async function isAuthenticated(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED) === 'true';
}

export async function login(username: string, password: string): Promise<boolean> {
  await initializeAuth();
  const storedUsername = await getStorageItem(STORAGE_KEYS.USER_EMAIL, '');
  const storedHash = await getStorageItem(STORAGE_KEYS.USER_PASSWORD, '');
  const inputHash = await hashPassword(password);
  if (username === storedUsername && inputHash === storedHash) {
    localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, 'true');
    return true;
  }
  return false;
}

export function logout(): void {
  if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEYS.IS_AUTHENTICATED);
}

export async function isTwoFactorEnabled(): Promise<boolean> {
  return await getStorageItem(STORAGE_KEYS.TWO_FACTOR_ENABLED, false);
}

export async function getTwoFactorSecret(): Promise<string | null> {
  return await getStorageItem(STORAGE_KEYS.TWO_FACTOR_CODE, null as string | null);
}

// Eski uyumluluk (getTwoFactorCode alias)
export async function getTwoFactorCode(): Promise<string | null> {
  return getTwoFactorSecret();
}

export async function saveTwoFactorSecret(secret: string): Promise<void> {
  await setStorageItem(STORAGE_KEYS.TWO_FACTOR_CODE, secret);
}

export async function enableTwoFactor(): Promise<string> {
  // TOTP modülünden secret üret
  const { generateTOTPSecret } = await import('./totp');
  const secret = generateTOTPSecret();
  await setStorageItem(STORAGE_KEYS.TWO_FACTOR_CODE, secret);
  // Henüz etkinleştirme - doğrulama sonrası yapılacak
  return secret;
}

export async function confirmTwoFactor(): Promise<void> {
  await setStorageItem(STORAGE_KEYS.TWO_FACTOR_ENABLED, true);
}

export async function disableTwoFactor(): Promise<void> {
  await setStorageItem(STORAGE_KEYS.TWO_FACTOR_ENABLED, false);
  await setStorageItem(STORAGE_KEYS.TWO_FACTOR_CODE, null);
}

export async function verifyTwoFactor(code: string): Promise<boolean> {
  const secret = await getTwoFactorSecret();
  if (!secret) return false;
  const { verifyTOTPCode } = await import('./totp');
  return verifyTOTPCode(secret, code);
}

export async function changePassword(oldP: string, newP: string): Promise<boolean> {
  const storedHash = await getStorageItem(STORAGE_KEYS.USER_PASSWORD, '');
  const oldHash = await hashPassword(oldP);
  if (oldHash === storedHash) {
    const newHash = await hashPassword(newP);
    await setStorageItem(STORAGE_KEYS.USER_PASSWORD, newHash);
    return true;
  }
  return false;
}

// ============ SECTION VISIBILITY ============
export interface SectionVisibility {
  hero: boolean;
  stats: boolean;
  features: boolean;
  about: boolean;
  packages: boolean;
  contact: boolean;
  navbar: boolean;
  blog: boolean;
}

const defaultVisibility: SectionVisibility = {
  hero: true,
  stats: true,
  features: true,
  about: true,
  packages: true,
  contact: true,
  navbar: true,
  blog: true,
};

export async function getSectionVisibility(): Promise<SectionVisibility> { return getStorageItem('section_visibility', defaultVisibility); }
export async function saveSectionVisibility(v: SectionVisibility): Promise<void> { await setStorageItem('section_visibility', v); }

// ============ EMAIL NOTIFICATION SETTINGS ============
export interface EmailNotificationSettings {
  enabled: boolean;
  notificationEmail: string;
  webhookUrl: string;
}

const defaultEmailSettings: EmailNotificationSettings = {
  enabled: false,
  notificationEmail: '',
  webhookUrl: '',
};

export async function getEmailSettings(): Promise<EmailNotificationSettings> {
  return getStorageItem('email_notification_settings', defaultEmailSettings);
}

export async function saveEmailSettings(settings: EmailNotificationSettings): Promise<void> {
  await setStorageItem('email_notification_settings', settings);
}

export async function sendEmailNotification(appointment: {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  packageName: string;
  date: string;
  time: string;
  notes?: string;
}): Promise<boolean> {
  const settings = await getEmailSettings();
  if (!settings.enabled || !settings.webhookUrl) return false;

  try {
    await fetch(settings.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: settings.notificationEmail,
        subject: `Yeni Randevu Talebi - ${appointment.clientName}`,
        ...appointment,
        message: `Yeni randevu talebi:\n\nDanışan: ${appointment.clientName}\nEmail: ${appointment.clientEmail}\nTelefon: ${appointment.clientPhone}\nPaket: ${appointment.packageName}\nTarih: ${appointment.date}\nSaat: ${appointment.time}${appointment.notes ? '\nNotlar: ' + appointment.notes : ''}`,
      }),
    });
    return true;
  } catch {
    console.error('Email notification failed');
    return false;
  }
}

// ============ UTILITY ============
export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const m = Math.floor((now.getTime() - date.getTime()) / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (m < 1) return "Az önce";
  if (m < 60) return `${m} dakika önce`;
  if (h < 24) return `${h} saat önce`;
  if (d < 7) return `${d} gün önce`;
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export function downloadCSV(data: Record<string, string>[], filename: string): void {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const csv = [headers.join(','), ...data.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}
