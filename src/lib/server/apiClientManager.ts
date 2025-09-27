// ========================================
// 🔧 API CLIENT MANAGEMENT UTILITIES
// ========================================

// File: src/lib/server/apiClientManager.ts
import { prisma } from "@/lib/server/prisma";
import { hashData } from "@/lib/security/encryption";
import { nanoid } from "nanoid";
import { ApiJWTUtils } from "./apiJwt";

export class ApiClientManager {
  /**
   * Create new API client
   */
  static async createClient(data: {
    name: string;
    description?: string;
    scopes: string[];
    schoolId?: string;
    createdBy: string;
    rateLimit?: number;
    allowedIps?: string[];
  }) {
    const accessCode = `ak_${nanoid(32)}`;
    const secretKey = `sk_${nanoid(64)}`;
    const hashedSecret = await hashData(secretKey);

    const client = await prisma.apiClient.create({
      data: {
        name: data.name,
        description: data.description,
        accessCode,
        secretKey: hashedSecret,
        scopes: data.scopes,
        schoolId: data.schoolId,
        createdBy: data.createdBy,
        rateLimit: data.rateLimit || 1000,
        allowedIps: data.allowedIps || [],
      },
    });

    // Generate initial token
    const token = await ApiJWTUtils.generateApiToken({
      clientId: client.id,
      accessCode: client.accessCode,
      secretKey, // Use unhashed secret for token generation
      scopes: client.scopes,
      schoolId: client.schoolId || undefined,
    });

    return {
      client: {
        id: client.id,
        name: client.name,
        accessCode: client.accessCode,
        scopes: client.scopes,
        rateLimit: client.rateLimit,
      },
      secretKey, // Return this only once!
      initialToken: token,
    };
  }

  /**
   * Generate new token for existing client
   */
  static async generateToken(
    accessCode: string,
    options?: { expiresIn?: string }
  ) {
    const client = await prisma.apiClient.findUnique({
      where: { accessCode, isActive: true },
    });

    if (!client) {
      throw new Error("Client not found or inactive");
    }

    return ApiJWTUtils.generateApiToken(
      {
        clientId: client.id,
        accessCode: client.accessCode,
        secretKey: client.secretKey, // This should be unhashed for token generation
        scopes: client.scopes,
        schoolId: client.schoolId || undefined,
      },
      options
    );
  }
}
