// lib/providers/index.ts
import { lookupMock } from './mock';
import { lookupVerifyMe } from './verifyme';
import { lookupMetaMap } from './metamap';
import { lookupSeamfix } from './seamfix';
import { lookupMono } from './mono';

type Method = 'phone'|'email'|'nin'|'tracking_id'|'demography';

export interface LookupInput {
  method: Method;
  payload: Record<string, string>;
}

export async function providerLookup(input: LookupInput) {
  const prov = process.env.NIN_PROVIDER || 'mock';
  switch (prov) {
    case 'verifyme': return lookupVerifyMe(input);
    case 'metamap': return lookupMetaMap(input);
    case 'seamfix': return lookupSeamfix(input);
    case 'mono': return lookupMono(input);
    default: return lookupMock(input);
  }
}
