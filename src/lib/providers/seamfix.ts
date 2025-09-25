import { LookupInput } from "./index";

export async function lookupSeamfix({ method, payload }: LookupInput) {
  // Fake Seamfix vNIN verification result
  const sample = {
    provider: "seamfix",
    status: "matched",
    method,
    person: {
      firstName: "Chinedu",
      lastName: "Okeke",
      nin: payload.nin ?? "88888888888",
      dob: "1988-03-10",
      gender: "M",
    },
    verification: {
      vnin: payload.nin ? "A1B2C3D4E5" : undefined,
      providerRef: "sf-" + Math.floor(Math.random() * 1000000),
      confidence: 0.97,
    },
  };

  // Trigger error if email missing
  if (method === "email" && !payload.email) {
    return { ok: false, error: "Email is required for Seamfix flow" };
  }

  return { ok: true, data: sample };
}
