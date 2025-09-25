// src/lib/utils/jwt.ts
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

export interface TokenPayload extends JWTPayload {
  type?: string;
  userId?: string;
  adminId?: string;
  schoolId?: string;
  email?: string;
  role?: string;
  centerNumber?: string;
  [key: string]: unknown;
}

export interface TokenOptions {
  expiresIn?: string;
  issuer?: string;
  audience?: string;
  subject?: string;
}

class JWTError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = "JWTError";
  }
}

export class JWTUtils {
  private static getSecretKey(): Uint8Array {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new JWTError(
        "JWT_SECRET environment variable is not set",
        "MISSING_SECRET"
      );
    }
    return new TextEncoder().encode(secret);
  }

  private static getDefaultOptions(): Required<TokenOptions> {
    return {
      expiresIn: "24h",
      issuer: "cecms-system",
      audience: "cecms-users",
      subject: "auth-token",
    };
  }

  /**
   * Generate a JWT token with the provided payload
   */
  static async generateToken(
    payload: TokenPayload,
    options: TokenOptions = {}
  ): Promise<string> {
    try {
      const secretKey = this.getSecretKey();
      const defaultOptions = this.getDefaultOptions();
      const finalOptions = { ...defaultOptions, ...options };

      const jwt = await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setIssuer(finalOptions.issuer)
        .setAudience(finalOptions.audience)
        .setSubject(finalOptions.subject)
        .setExpirationTime(finalOptions.expiresIn)
        .sign(secretKey);

      return jwt;
    } catch (error) {
      console.error("JWT generation error:", error);
      throw new JWTError("Failed to generate JWT token", "GENERATION_FAILED");
    }
  }

  /**
   * Verify and decode a JWT token
   */
  static async verifyToken(token: string): Promise<TokenPayload> {
    try {
      const secretKey = this.getSecretKey();

      const { payload } = await jwtVerify(token, secretKey, {
        issuer: "cecms-system",
        audience: "cecms-users",
      });

      return payload as TokenPayload;
    } catch (error) {
      console.error("JWT verification error:", error);

      if (error instanceof Error) {
        if (error.message.includes("expired")) {
          throw new JWTError("Token has expired", "TOKEN_EXPIRED");
        } else if (error.message.includes("invalid")) {
          throw new JWTError("Invalid token", "INVALID_TOKEN");
        } else if (error.message.includes("signature")) {
          throw new JWTError("Invalid token signature", "INVALID_SIGNATURE");
        }
      }

      throw new JWTError("Token verification failed", "VERIFICATION_FAILED");
    }
  }

  /**
   * Generate email verification token
   */
  static async generateEmailVerificationToken(data: {
    type: "school" | "admin";
    email: string;
    entityId: string;
    centerNumber?: string;
  }): Promise<string> {
    const payload: TokenPayload = {
      type: "email_verification",
      verifyType: data.type,
      email: data.email,
      entityId: data.entityId,
      centerNumber: data.centerNumber,
    };

    return this.generateToken(payload, {
      expiresIn: "24h",
      subject: "email-verification",
    });
  }

  /**
   * Generate password reset token
   */
  static async generatePasswordResetToken(data: {
    adminId: string;
    email: string;
  }): Promise<string> {
    const payload: TokenPayload = {
      type: "password_reset",
      adminId: data.adminId,
      email: data.email,
    };

    return this.generateToken(payload, {
      expiresIn: "1h",
      subject: "password-reset",
    });
  }

  /**
   * Generate authentication token for login
   */
  static async generateAuthToken(data: {
    adminId: string;
    email: string;
    schoolId: string;
    role: string;
    centerNumber: string;
  }): Promise<string> {
    const payload: TokenPayload = {
      type: "auth",
      adminId: data.adminId,
      email: data.email,
      schoolId: data.schoolId,
      role: data.role,
      centerNumber: data.centerNumber,
    };

    return this.generateToken(payload, {
      expiresIn: "8h",
      subject: "authentication",
    });
  }

  /**
   * Generate refresh token
   */
  static async generateRefreshToken(adminId: string): Promise<string> {
    const payload: TokenPayload = {
      type: "refresh",
      adminId,
    };

    return this.generateToken(payload, {
      expiresIn: "7d",
      subject: "refresh-token",
    });
  }

  /**
   * Verify email verification token
   */
  static async verifyEmailToken(token: string): Promise<{
    type: "school" | "admin";
    email: string;
    entityId: string;
    centerNumber?: string;
  }> {
    const payload = await this.verifyToken(token);

    if (payload.type !== "email_verification") {
      throw new JWTError(
        "Invalid token type for email verification",
        "INVALID_TOKEN_TYPE"
      );
    }

    return {
      type: payload.verifyType as "school" | "admin",
      email: payload.email as string,
      entityId: payload.entityId as string,
      centerNumber: payload.centerNumber as string,
    };
  }

  /**
   * Verify password reset token
   */
  static async verifyPasswordResetToken(token: string): Promise<{
    adminId: string;
    email: string;
  }> {
    const payload = await this.verifyToken(token);

    if (payload.type !== "password_reset") {
      throw new JWTError(
        "Invalid token type for password reset",
        "INVALID_TOKEN_TYPE"
      );
    }

    return {
      adminId: payload.adminId as string,
      email: payload.email as string,
    };
  }

  /**
   * Verify authentication token
   */
  static async verifyAuthToken(token: string): Promise<{
    adminId: string;
    email: string;
    schoolId: string;
    role: string;
    centerNumber: string;
  }> {
    const payload = await this.verifyToken(token);

    if (payload.type !== "auth") {
      throw new JWTError(
        "Invalid token type for authentication",
        "INVALID_TOKEN_TYPE"
      );
    }

    return {
      adminId: payload.adminId as string,
      email: payload.email as string,
      schoolId: payload.schoolId as string,
      role: payload.role as string,
      centerNumber: payload.centerNumber as string,
    };
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authorization: string | null): string | null {
    if (!authorization) return null;

    const [bearer, token] = authorization.split(" ");
    if (bearer !== "Bearer" || !token) return null;

    return token;
  }

  /**
   * Check if token is expired without throwing error
   */
  static async isTokenExpired(token: string): Promise<boolean> {
    try {
      await this.verifyToken(token);
      return false;
    } catch (error) {
      if (error instanceof JWTError && error.code === "TOKEN_EXPIRED") {
        return true;
      }
      // For other errors, consider token as invalid/expired
      return true;
    }
  }
}

export { JWTError };
