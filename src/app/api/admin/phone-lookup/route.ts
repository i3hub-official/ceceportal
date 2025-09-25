// File: src/app/api/admin/lookup-phone/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { protectData, unprotectData } from "@/lib/security/dataProtection";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session-token")?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: No session token" },
        { status: 401 }
      );
    }

    // Verify session
    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: { adminUser: true },
    });

    if (!session || session.expires < new Date()) {
      // Delete expired session
      if (session) {
        await prisma.session.delete({ where: { id: session.id } });
      }
      return NextResponse.json(
        { success: false, message: "Unauthorized: Session expired" },
        { status: 401 }
      );
    }

    // Check if admin user is active
    if (!session.adminUser.isActive) {
      return NextResponse.json(
        { success: false, message: "Account deactivated" },
        { status: 403 }
      );
    }

    // Get phone number from request body
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, message: "Phone number is required" },
        { status: 400 }
      );
    }

    // Normalize phone number
    const normalizedPhone = phoneNumber.trim();

    // Generate searchable hash for the phone number
    const phoneProtection = await protectData(normalizedPhone, "phone");
    const phoneHash = phoneProtection.searchHash;

    if (!phoneHash) {
      return NextResponse.json(
        { success: false, message: "Invalid phone number format" },
        { status: 400 }
      );
    }

    // Search for schools with this phone number
    const schools = await prisma.school.findMany({
      where: { schoolPhoneHash: phoneHash },
      select: {
        id: true,
        centerNumber: true,
        centerName: true,
        state: true,
        lga: true,
        schoolType: true,
        isActive: true,
        isVerified: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    // Search for admin users with this phone number
    const adminUsers = await prisma.adminUser.findMany({
      where: { phoneHash: phoneHash },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        school: {
          select: {
            id: true,
            centerNumber: true,
            centerName: true,
          },
        },
      },
    });

    // Decrypt sensitive data for schools
    const decryptedSchools = await Promise.all(
      schools.map(async (school) => ({
        ...school,
        centerName: await unprotectData(school.centerName, "name"),
      }))
    );

    // Decrypt sensitive data for admin users
    const decryptedAdminUsers = await Promise.all(
      adminUsers.map(async (admin) => ({
        id: admin.id,
        name: await unprotectData(admin.name, "name"),
        email: await unprotectData(admin.email, "email"),
        role: admin.role,
        isActive: admin.isActive,
        emailVerified: admin.emailVerified,
        lastLoginAt: admin.lastLoginAt,
        createdAt: admin.createdAt,
        school: admin.school
          ? {
              id: admin.school.id,
              centerNumber: admin.school.centerNumber,
              centerName: await unprotectData(admin.school.centerName, "name"),
            }
          : null,
      }))
    );

    // Log the lookup action
    await prisma.adminAuditLog.create({
      data: {
        adminUserId: session.adminUserId,
        action: "PHONE_LOOKUP",
        details: {
          phoneNumber: normalizedPhone,
          resultsCount: decryptedSchools.length + decryptedAdminUsers.length,
          schoolsFound: decryptedSchools.length,
          adminsFound: decryptedAdminUsers.length,
        },
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    });

    // Return results
    return NextResponse.json({
      success: true,
      data: {
        schools: decryptedSchools,
        adminUsers: decryptedAdminUsers,
      },
    });
  } catch (error) {
    console.error("Phone lookup error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred during phone lookup" },
      { status: 500 }
    );
  }
}
