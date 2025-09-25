// /lib/utils/id-generator.ts

/**
 * Generate a new Center Number.
 * Format: CEC + 7-digit padded number (e.g., CEC0000123)
 */
export function generateCenterNumber(lastCentreId: number): string {
  return "CEC" + String(lastCentreId + 1).padStart(7, "0");
}

/**
 * Generate a Candidate Number for a given Centre.
 * Format: CentreNumber (CECxxxxxxx) + 3-digit serial (e.g., 001–999)
 * Example: CEC0000123001
 */
export function generateCandidateNumber(
  centreNumber: string,
  lastCandidateId: number
): string {
  const serial = String(lastCandidateId + 1).padStart(3, "0"); // 001 - 999
  return centreNumber + serial;
}

// import { generateCentreNumber, generateCandidateNumber } from "@/lib/utils/id-generator";

// // Generate Centre ID
// const centreId = generateCentreNumber(45); // CEC0000046

// // Generate Candidate IDs under this Centre
// const candidate1 = generateCandidateNumber(centreId, 0); // CEC0000046001
// const candidate2 = generateCandidateNumber(centreId, 1); // CEC0000046002
