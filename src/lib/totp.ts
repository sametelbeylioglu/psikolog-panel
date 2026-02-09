// =============================================
// TOTP (Time-based One-Time Password) Module
// RFC 6238 uyumlu - Google Authenticator, Authy,
// Microsoft Authenticator ile çalışır
// =============================================

import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';

const ISSUER = 'PsikoPanel';
const ALGORITHM = 'SHA1';
const DIGITS = 6;
const PERIOD = 30;

/**
 * Yeni TOTP secret oluşturur
 */
export function generateTOTPSecret(): string {
  const secret = new OTPAuth.Secret({ size: 20 });
  return secret.base32;
}

/**
 * TOTP URI oluşturur (authenticator app'e eklemek için)
 */
export function getTOTPUri(secret: string, accountName: string): string {
  const totp = new OTPAuth.TOTP({
    issuer: ISSUER,
    label: accountName,
    algorithm: ALGORITHM,
    digits: DIGITS,
    period: PERIOD,
    secret: OTPAuth.Secret.fromBase32(secret),
  });
  return totp.toString();
}

/**
 * QR kod data URL oluşturur (base64 image)
 */
export async function generateQRCode(secret: string, accountName: string): Promise<string> {
  const uri = getTOTPUri(secret, accountName);
  return QRCode.toDataURL(uri, {
    width: 256,
    margin: 2,
    color: { dark: '#000000', light: '#FFFFFF' },
  });
}

/**
 * TOTP kodunu doğrular (30 saniyelik pencere, ±1 adım tolerans)
 */
export function verifyTOTPCode(secret: string, token: string): boolean {
  const totp = new OTPAuth.TOTP({
    issuer: ISSUER,
    algorithm: ALGORITHM,
    digits: DIGITS,
    period: PERIOD,
    secret: OTPAuth.Secret.fromBase32(secret),
  });

  // window: 1 = ±30 saniye tolerans (toplam 90 saniyelik pencere)
  const delta = totp.validate({ token, window: 1 });
  return delta !== null;
}

/**
 * Mevcut TOTP kodunu üretir (test amaçlı)
 */
export function generateCurrentCode(secret: string): string {
  const totp = new OTPAuth.TOTP({
    issuer: ISSUER,
    algorithm: ALGORITHM,
    digits: DIGITS,
    period: PERIOD,
    secret: OTPAuth.Secret.fromBase32(secret),
  });
  return totp.generate();
}
