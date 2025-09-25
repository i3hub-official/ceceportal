// lib/validators.ts
export function requireConsent(fd: FormData) {
  if (!fd.get('consent')) throw new Error('Consent is required.');
}
export function getMethod(fd: FormData) {
  const m = String(fd.get('method') || 'nin');
  if (!['phone','email','nin','tracking_id','demography'].includes(m)) throw new Error('Invalid method.');
  return m as 'phone' | 'email' | 'nin' | 'tracking_id' | 'demography';
}
