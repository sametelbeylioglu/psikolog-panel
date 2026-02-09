// =============================================
// Psikolog Panel - Content Manager
// Tüm veri yönetimi localStorage üzerinden
// =============================================

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

const STORAGE_KEYS = {
  HOMEPAGE: 'homepage_content',
  ABOUT: 'about_content',
  STATS: 'stats_content',
  FEATURES: 'features_content',
  LOGO: 'site_logo',
  THERAPY_PACKAGES: 'THERAPY_PACKAGES',
  APPOINTMENTS: 'appointments_data',
  NOTIFICATIONS: 'notifications_data',
  CLIENTS: 'clients_data',
  BLOG_POSTS: 'blog_posts',
  CONTACT_INFO: 'contact_info',
  IS_AUTHENTICATED: 'isAuthenticated',
  USER_EMAIL: 'userEmail',
  USER_PASSWORD: 'userPassword',
  TWO_FACTOR_ENABLED: 'twoFactorEnabled',
  TWO_FACTOR_CODE: 'twoFactorCode',
};

function getStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key}:`, error);
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

const defaultAppointments: Appointment[] = [
  { id: '1', clientName: 'Ahmet Yılmaz', clientEmail: 'ahmet@example.com', clientPhone: '0532 111 22 33', packageId: '2', packageName: 'Standart Terapi Paketi', date: '2026-02-10', time: '10:00', status: 'confirmed', notes: 'İlk seans', createdAt: '2026-02-01T10:00:00' },
  { id: '2', clientName: 'Elif Kaya', clientEmail: 'elif@example.com', clientPhone: '0533 222 33 44', packageId: '3', packageName: 'Yoğun Terapi Paketi', date: '2026-02-10', time: '14:00', status: 'pending', createdAt: '2026-02-02T14:00:00' },
  { id: '3', clientName: 'Mehmet Demir', clientEmail: 'mehmet@example.com', clientPhone: '0535 333 44 55', packageId: '1', packageName: 'Başlangıç Paketi', date: '2026-02-11', time: '11:00', status: 'confirmed', createdAt: '2026-02-03T11:00:00' },
  { id: '4', clientName: 'Zeynep Arslan', clientEmail: 'zeynep@example.com', clientPhone: '0536 444 55 66', packageId: '2', packageName: 'Standart Terapi Paketi', date: '2026-02-08', time: '16:00', status: 'completed', createdAt: '2026-01-25T16:00:00' },
];

const defaultNotifications: Notification[] = [
  { id: '1', type: 'appointment', title: 'Yeni Randevu Talebi', message: 'Elif Kaya yeni bir randevu talebi oluşturdu.', read: false, createdAt: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: '2', type: 'payment', title: 'Ödeme Alındı', message: 'Ahmet Yılmaz - Standart Terapi Paketi ödemesi alındı.', read: false, createdAt: new Date(Date.now() - 5 * 3600000).toISOString() },
  { id: '3', type: 'general', title: 'Hoş Geldiniz', message: "Psikolog Panel'e hoş geldiniz!", read: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
];

const defaultClients: Client[] = [
  { id: '1', name: 'Ahmet Yılmaz', email: 'ahmet@example.com', phone: '0532 111 22 33', firstVisit: '2025-06-15', lastVisit: '2026-02-08', totalSessions: 12, status: 'active', notes: 'Kaygı bozukluğu - BDT' },
  { id: '2', name: 'Elif Kaya', email: 'elif@example.com', phone: '0533 222 33 44', firstVisit: '2025-09-01', lastVisit: '2026-02-05', totalSessions: 8, status: 'active', notes: 'Depresyon' },
  { id: '3', name: 'Mehmet Demir', email: 'mehmet@example.com', phone: '0535 333 44 55', firstVisit: '2026-01-10', lastVisit: '2026-02-03', totalSessions: 3, status: 'active' },
  { id: '4', name: 'Zeynep Arslan', email: 'zeynep@example.com', phone: '0536 444 55 66', firstVisit: '2025-03-20', lastVisit: '2026-01-15', totalSessions: 20, status: 'active', notes: 'Çift terapisi' },
  { id: '5', name: 'Can Özkan', email: 'can@example.com', phone: '0537 555 66 77', firstVisit: '2025-11-01', lastVisit: '2026-01-05', totalSessions: 5, status: 'inactive', notes: 'Tamamlandı' },
];

const defaultBlogPosts: BlogPost[] = [
  { id: '1', title: 'Kaygı Bozukluğu ile Başa Çıkma Yolları', content: 'Kaygı bozukluğu, günümüzde en sık karşılaşılan ruhsal sorunlardan biridir...', excerpt: 'Kaygı bozukluğu ile başa çıkmanın etkili yollarını keşfedin.', author: 'Psk. Uzman', createdAt: '2026-01-15T10:00:00', published: true },
  { id: '2', title: 'Sağlıklı İlişkilerin Temelleri', content: 'Sağlıklı ilişkiler, mutlu bir yaşamın temel yapı taşlarından biridir...', excerpt: 'Sağlıklı ve mutlu ilişkilerin temellerini öğrenin.', author: 'Psk. Uzman', createdAt: '2026-01-28T14:00:00', published: true },
];

const defaultContactInfo: ContactInfo = {
  address: 'Bağdat Caddesi No: 123, Kat: 4, Kadıköy/İstanbul',
  phone: '0212 555 44 33',
  email: 'info@psikolog.com',
  workingHours: 'Pazartesi - Cuma: 09:00 - 18:00\nCumartesi: 10:00 - 14:00',
  socialMedia: { instagram: 'https://instagram.com/psikolog', facebook: 'https://facebook.com/psikolog', linkedin: 'https://linkedin.com/in/psikolog' },
};

// ============ HERO ============
export function getHeroContent(): HeroContent { return getStorageItem(STORAGE_KEYS.HOMEPAGE, defaultHeroContent); }
export function saveHeroContent(content: HeroContent): void { setStorageItem(STORAGE_KEYS.HOMEPAGE, content); }

// ============ FEATURES ============
export function getFeatures(): Feature[] { return getStorageItem(STORAGE_KEYS.FEATURES, defaultFeatures); }
export function saveFeatures(features: Feature[]): void { setStorageItem(STORAGE_KEYS.FEATURES, features); }

// ============ STATS ============
export function getStats(): Stat[] { return getStorageItem(STORAGE_KEYS.STATS, defaultStats); }
export function saveStats(stats: Stat[]): void { setStorageItem(STORAGE_KEYS.STATS, stats); }

// ============ ABOUT ============
export function getAboutContent(): AboutContent { return getStorageItem(STORAGE_KEYS.ABOUT, defaultAboutContent); }
export function saveAboutContent(content: AboutContent): void { setStorageItem(STORAGE_KEYS.ABOUT, content); }

// ============ PACKAGES ============
export function getPackages(): TherapyPackage[] { return getStorageItem(STORAGE_KEYS.THERAPY_PACKAGES, defaultPackages); }
export function savePackages(packages: TherapyPackage[]): void { setStorageItem(STORAGE_KEYS.THERAPY_PACKAGES, packages); }
export function getPackagesAsServices(): Service[] { return getPackages().map(p => ({ ...p })); }

// ============ APPOINTMENTS ============
export function getAppointments(): Appointment[] { return getStorageItem(STORAGE_KEYS.APPOINTMENTS, defaultAppointments); }
export function saveAppointments(appointments: Appointment[]): void { setStorageItem(STORAGE_KEYS.APPOINTMENTS, appointments); }
export function saveAppointment(apt: Appointment): void { const all = getAppointments(); all.push(apt); saveAppointments(all); }
export function updateAppointment(id: string, updates: Partial<Appointment>): void { const all = getAppointments(); const i = all.findIndex(a => a.id === id); if (i !== -1) { all[i] = { ...all[i], ...updates }; saveAppointments(all); } }

// ============ CLIENTS ============
export function getClients(): Client[] { return getStorageItem(STORAGE_KEYS.CLIENTS, defaultClients); }
export function saveClients(clients: Client[]): void { setStorageItem(STORAGE_KEYS.CLIENTS, clients); }

// ============ NOTIFICATIONS ============
export function getNotifications(): Notification[] { return getStorageItem(STORAGE_KEYS.NOTIFICATIONS, defaultNotifications); }
export function saveNotifications(notifications: Notification[]): void { setStorageItem(STORAGE_KEYS.NOTIFICATIONS, notifications); }
export function addNotification(n: Notification): void { const all = getNotifications(); all.unshift(n); saveNotifications(all); }
export function markNotificationAsRead(id: string): void { const all = getNotifications(); const i = all.findIndex(n => n.id === id); if (i !== -1) { all[i].read = true; saveNotifications(all); } }
export function deleteNotification(id: string): void { saveNotifications(getNotifications().filter(n => n.id !== id)); }

// ============ BLOG ============
export function getBlogPosts(): BlogPost[] { return getStorageItem(STORAGE_KEYS.BLOG_POSTS, defaultBlogPosts); }
export function saveBlogPosts(posts: BlogPost[]): void { setStorageItem(STORAGE_KEYS.BLOG_POSTS, posts); }

// ============ CONTACT ============
export function getContactInfo(): ContactInfo { return getStorageItem(STORAGE_KEYS.CONTACT_INFO, defaultContactInfo); }
export function saveContactInfo(info: ContactInfo): void { setStorageItem(STORAGE_KEYS.CONTACT_INFO, info); }

// ============ LOGO ============
export function getLogo(): string { return getStorageItem(STORAGE_KEYS.LOGO, 'PsikoPanel'); }
export function saveLogo(logo: string): void { setStorageItem(STORAGE_KEYS.LOGO, logo); }

// ============ AUTH ============
export function initializeAuth(): void {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem(STORAGE_KEYS.USER_EMAIL)) localStorage.setItem(STORAGE_KEYS.USER_EMAIL, 'admin@psikolog.com');
  if (!localStorage.getItem(STORAGE_KEYS.USER_PASSWORD)) localStorage.setItem(STORAGE_KEYS.USER_PASSWORD, 'admin123');
}
export function isAuthenticated(): boolean { if (typeof window === 'undefined') return false; return localStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED) === 'true'; }
export function login(email: string, password: string): boolean { initializeAuth(); if (email === localStorage.getItem(STORAGE_KEYS.USER_EMAIL) && password === localStorage.getItem(STORAGE_KEYS.USER_PASSWORD)) { localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, 'true'); return true; } return false; }
export function logout(): void { if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEYS.IS_AUTHENTICATED); }
export function isTwoFactorEnabled(): boolean { if (typeof window === 'undefined') return false; return localStorage.getItem(STORAGE_KEYS.TWO_FACTOR_ENABLED) === 'true'; }
export function getTwoFactorCode(): string | null { if (typeof window === 'undefined') return null; return localStorage.getItem(STORAGE_KEYS.TWO_FACTOR_CODE); }
export function enableTwoFactor(): string { const code = Math.floor(100000 + Math.random() * 900000).toString(); localStorage.setItem(STORAGE_KEYS.TWO_FACTOR_ENABLED, 'true'); localStorage.setItem(STORAGE_KEYS.TWO_FACTOR_CODE, code); return code; }
export function disableTwoFactor(): void { localStorage.removeItem(STORAGE_KEYS.TWO_FACTOR_ENABLED); localStorage.removeItem(STORAGE_KEYS.TWO_FACTOR_CODE); }
export function verifyTwoFactor(code: string): boolean { return code === getTwoFactorCode(); }
export function changePassword(old: string, newP: string): boolean { if (old === localStorage.getItem(STORAGE_KEYS.USER_PASSWORD)) { localStorage.setItem(STORAGE_KEYS.USER_PASSWORD, newP); return true; } return false; }

// ============ UTILITY ============
export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString); const now = new Date();
  const m = Math.floor((now.getTime() - date.getTime()) / 60000);
  const h = Math.floor(m / 60); const d = Math.floor(h / 24);
  if (m < 1) return "Az önce"; if (m < 60) return `${m} dakika önce`;
  if (h < 24) return `${h} saat önce`; if (d < 7) return `${d} gün önce`;
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}
export function generateId(): string { return Date.now().toString(36) + Math.random().toString(36).substring(2); }
export function downloadCSV(data: Record<string, string>[], filename: string): void {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const csv = [headers.join(','), ...data.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = filename; link.click();
}
