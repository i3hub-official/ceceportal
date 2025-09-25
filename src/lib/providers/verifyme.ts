// lib/providers/verifyme.ts
import { LookupInput } from './index';

// Docs: VerifyMe NIN by phone; others via their dashboard. :contentReference[oaicite:7]{index=7}
export async function lookupVerifyMe({ method, payload }: LookupInput) {
  const key = process.env.PROVIDER_VERIFYME_KEY!;
  if (!key) throw new Error('Missing PROVIDER_VERIFYME_KEY');

  let url = '';
  let body: Record<string, unknown> = {};

  if (method === 'phone') {
    url = `https://vapi.verifyme.ng/v1/verifications/identities/nin_phone/${encodeURIComponent(payload.phone!)}`;
  } else if (method === 'nin') {
    // If provider supports NIN direct
    url = 'https://vapi.verifyme.ng/v1/verifications/identities/nin'; body = { nin: payload.nin };
  } else {
    throw new Error('Method not supported by VerifyMe in this example');
  }

  const res = await fetch(url, {
    method: body && Object.keys(body).length ? 'POST' : 'GET',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: Object.keys(body).length ? JSON.stringify(body) : undefined
  });

  if (!res.ok) return { ok: false, error: await res.text() };
  const json = await res.json();
  return { ok: true, data: json };
}
