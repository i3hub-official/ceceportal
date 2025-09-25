// lib/providers/mock.ts
import { LookupInput } from './index';

export async function lookupMock({ method, payload }: LookupInput) {
  // Simulate matches and edge cases like IPE
  const sample = {
    status: payload.nin === '00000000000' ? 'ipe' : 'matched',
    person: {
      firstName: 'Ada',
      lastName: 'Okafor',
      nin: payload.nin ?? '12345678901',
      dob: '1992-07-15',
      gender: 'F',
    },
    verification: {
      method,
      confidence: 0.98,
      timestamp: new Date().toISOString(),
    }
  };
  return { ok: true, data: sample };
}
