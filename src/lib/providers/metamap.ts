import { LookupInput } from "./index";

export async function lookupMetaMap({ method, payload }: LookupInput) {
  // Pretend MetaMap always returns a neat verification package
  const sample = {
    provider: "metamap",
    status: "matched",
    method,
    person: {
      firstName: "Ifeoma",
      lastName: "Uche",
      nin: payload.nin ?? "99999999999",
      dob: "1995-11-22",
      gender: "F",
    },
    meta: {
      workflow: "nin_verification",
      providerRef: "mm-" + Math.floor(Math.random() * 1000000),
      timestamp: new Date().toISOString(),
    },
  };

  // Add a fake IPE branch
  if (payload.nin === "11111111111") {
    sample.status = "ipe";
  }

  return { ok: true, data: sample };
}
