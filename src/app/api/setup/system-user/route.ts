// File: src/app/api/setup/system-user/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { protectData } from "@/lib/security/dataProtection";
import bcrypt from "bcryptjs";

const SYSTEM_USER = {
  name: process.env.SA_NAME || "",
  email: process.env.SA_EMAIL || "",
  phone: process.env.SA_PHONE || "",
  nin: process.env.SA_NIN || "",
  password: process.env.SA_PW || "",
  role: process.env.SA_ROLE || "Super_Admin",
};

export async function POST(request: NextRequest) {
  try {
    // Check if system user already exists
    const existingUser = await prisma.adminUser.findUnique({
      where: { email: SYSTEM_USER.email },
    });

    if (existingUser) {
      return NextResponse.json({
        success: true,
        message: "System user already exists",
        userId: existingUser.id,
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(
      SYSTEM_USER.password,
      parseInt(process.env.SALT_ROUNDS || "12")
    );

    // Protect sensitive data using the protectData function
    const emailProtected = await protectData(SYSTEM_USER.email, "email");
    const phoneProtected = await protectData(SYSTEM_USER.phone, "phone");
    const ninProtected = await protectData(SYSTEM_USER.nin, "nin");

    // Create the system user
    const systemUser = await prisma.adminUser.create({
      data: {
        name: SYSTEM_USER.name,
        email: SYSTEM_USER.email,
        phone: SYSTEM_USER.phone,
        nin: SYSTEM_USER.nin,
        password: hashedPassword,
        emailHash: emailProtected.searchHash || "",
        phoneHash: phoneProtected.searchHash || "",
        ninHash: ninProtected.searchHash || "",
        isActive: true,
        emailVerified: true,
        role: "Super_Admin",
      },
    });

    return NextResponse.json({
      success: true,
      message: "System user created successfully",
      userId: systemUser.id,
    });
  } catch (error) {
    console.error("Error creating system user:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create system user",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}