import { LookupInput } from "./index";

export async function lookupMono({ method, payload }: LookupInput) {
  // Pretend Mono lets you resolve NIN by phone or trackingId
  const sample = {
    provider: "mono",
    status: "matched",
    method,
    person: {
      firstName: "Bola",
      lastName: "Adeyemi",
      nin: payload.nin ?? "77777777777",
      dob: "1990-01-05",
      gender: "F",
    },
    session: {
      providerRef: "mono-" + Math.floor(Math.random() * 1000000),
      trackingId: payload.trackingId ?? "trk-" + Date.now(),
    },
  };

  // Fake not found if phone is too short
  if (method === "phone" && (!payload.phone || payload.phone.length < 8)) {
    return { ok: false, error: "Invalid phone number" };
  }

  return { ok: true, data: sample };
}
