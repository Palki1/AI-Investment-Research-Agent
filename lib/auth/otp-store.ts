export const OTP_STORE = new Map<string, { code: string; expiresAt: number }>();

export function setOtp(email: string, code: string, expiresAt: number) {
  OTP_STORE.set(email, { code, expiresAt });
}

export function getOtp(email: string) {
  return OTP_STORE.get(email);
}

export function deleteOtp(email: string) {
  OTP_STORE.delete(email);
}
