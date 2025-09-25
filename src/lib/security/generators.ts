import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// Generate registration number
export const generateRegistrationNumber = (): string => {
  const prefix = 'CEC';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substr(2, 3).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

export async function generateAuthToken(agentId: string, req?: Request) {
  const plainToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto
    .createHash("sha256")
    .update(plainToken)
    .digest("hex");

  let ipAddress: string | undefined;
  let userAgent: string | undefined;
  if (req) {
    ipAddress = req.headers.get("x-forwarded-for") || undefined;
    userAgent = req.headers.get("user-agent") || undefined;
  }

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // await prisma.session.create({
    // data: {
    //    id,
    //   sessionToken: tokenHash,
    //   agentId,
    //   adminUserId,
    //   expires
    //   expiresAt,
    // },
  // });

  return plainToken;
}
