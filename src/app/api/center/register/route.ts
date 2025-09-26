// src/app/api/center/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { protectData } from "@/lib/security/dataProtection";
import { EmailService } from "@/lib/services/emailService";
import { JWTUtils } from "@/lib/utils/jwt";

const emailService = EmailService.getInstance();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("📝 School registration request received:", {
      centerNumber: body.centerNumber,
      schoolEmail: body.schoolEmail ? "[PROVIDED]" : "[MISSING]",
      adminEmail: body.adminEmail ? "[PROVIDED]" : "[MISSING]",
      existingAdmin: !!body.existingAdmin,
      hasAdminId: !!body.adminId,
      // Log all fields for debugging
      allFields: Object.keys(body),
    });

    // Required fields validation - UPDATED to use adminNin
    const requiredFields = [
      "centerId",
      "centerNumber",
      "centerName",
      "state",
      "lga",
      "schoolEmail",
      "schoolPhone",
      "schoolAddress",
      "schoolType",
      "principalName",
      "principalPhone",
      "adminEmail",
      "adminPhone",
      "password",
      "adminNin", // Changed from 'nin' to 'adminNin'
    ];

    // Additional validation for new admins
    if (!body.existingAdmin) {
      requiredFields.push("adminName");
    }

    console.log("🔍 Checking required fields:", { requiredFields });

    for (const field of requiredFields) {
      if (!body[field]) {
        console.error(`❌ Missing required field: ${field}`);
        return NextResponse.json(
          {
            success: false,
            message: `${field.replace(/([A-Z])/g, " $1").toLowerCase()} is required`,
            error: "MISSING_REQUIRED_FIELD",
            field: field,
          },
          { status: 400 }
        );
      }
    }

    console.log("✅ All required fields present");

    // Protect sensitive data for lookups - UPDATED to use adminNin
    console.log("🔐 Starting data protection...");
    const [
      protectedSchoolEmail,
      protectedSchoolPhone,
      protectedPrincipalPhone,
      protectedAdminEmail,
      protectedAdminPhone,
      protectedAdminPassword,
      protectedNin,
    ] = await Promise.all([
      protectData(body.schoolEmail, "email"),
      protectData(body.schoolPhone, "phone"),
      protectData(body.principalPhone, "phone"),
      protectData(body.adminEmail, "email"),
      protectData(body.adminPhone, "phone"),
      protectData(body.password, "system-code"),
      protectData(body.adminNin, "nin"), // Changed from body.nin to body.adminNin
    ]);

    console.log("✅ Data protection completed");

    // 1. Check if center number already exists
    console.log("🔍 Checking for existing center registration...");
    const existingCenter = await prisma.school.findFirst({
      where: { centerNumber: body.centerNumber },
      select: {
        id: true,
        centerNumber: true,
        centerName: true,
        createdAt: true,
      },
    });

    if (existingCenter) {
      console.log("❌ Center already registered:", existingCenter.centerNumber);
      return NextResponse.json(
        {
          success: false,
          message: `Center ${body.centerNumber} is already registered in the system. If you believe this is an error, please contact the Catholic Education Commission office.`,
          error: "CENTER_ALREADY_REGISTERED",
        },
        { status: 409 }
      );
    }

    console.log("✅ Center number is unique");

    // 2. Check if school email already exists
    console.log("📧 Checking for existing school email...");
    const existingSchoolEmail = await prisma.school.findFirst({
      where: { schoolEmailHash: protectedSchoolEmail.searchHash },
      select: { id: true, centerNumber: true },
    });

    if (existingSchoolEmail) {
      console.log(
        "❌ School email already exists:",
        existingSchoolEmail.centerNumber
      );
      return NextResponse.json(
        {
          success: false,
          message:
            "A school with this email address is already registered. Please use a different email address.",
          error: "SCHOOL_EMAIL_EXISTS",
        },
        { status: 409 }
      );
    }

    console.log("✅ School email is unique");

    // 3. Check if school phone already exists
    console.log("📞 Checking for existing school phone...");
    const existingSchoolPhone = await prisma.school.findFirst({
      where: { schoolPhoneHash: protectedSchoolPhone.searchHash },
      select: { id: true, centerNumber: true },
    });

    if (existingSchoolPhone) {
      console.log(
        "❌ School phone already exists:",
        existingSchoolPhone.centerNumber
      );
      return NextResponse.json(
        {
          success: false,
          message:
            "A school with this phone number is already registered. Please use a different phone number.",
          error: "SCHOOL_PHONE_EXISTS",
        },
        { status: 409 }
      );
    }

    console.log("✅ School phone is unique");

    // 4. Check if principal phone already exists
    console.log("👤 Checking for existing principal phone...");
    const existingPrincipal = await prisma.school.findFirst({
      where: { principalPhoneHash: protectedPrincipalPhone.searchHash },
      select: {
        id: true,
        centerNumber: true,
        centerName: true,
        principalName: true,
      },
    });

    if (existingPrincipal) {
      console.log(
        "❌ Principal phone already exists:",
        existingPrincipal.centerNumber
      );
      return NextResponse.json(
        {
          success: false,
          message:
            "This principal is already managing another school. According to policy, one principal can only manage one school. Please contact the Catholic Education Commission if you need assistance.",
          error: "PRINCIPAL_ALREADY_EXISTS",
        },
        { status: 409 }
      );
    }

    console.log("✅ Principal phone is unique");

    // 5. Handle admin verification and creation
    let adminUser;
    let isNewAdmin = false;

    if (body.existingAdmin && body.adminId) {
      // Existing admin - verify and link
      console.log("🔗 Linking existing admin to new school...");

      adminUser = await prisma.adminUser.findFirst({
        where: {
          id: body.adminId,
          ninHash: protectedNin.searchHash,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          emailVerified: true,
          role: true,
        },
      });

      if (!adminUser) {
        console.log("❌ Existing admin verification failed");
        return NextResponse.json(
          {
            success: false,
            message:
              "Administrator verification failed. Please verify your NIN and try again.",
            error: "ADMIN_VERIFICATION_FAILED",
          },
          { status: 400 }
        );
      }

      // Check if admin email is verified
      if (!adminUser.emailVerified) {
        console.log("❌ Admin email not verified");
        return NextResponse.json(
          {
            success: false,
            message:
              "Administrator email must be verified before managing additional schools. Please verify your email first.",
            error: "ADMIN_EMAIL_NOT_VERIFIED",
          },
          { status: 400 }
        );
      }

      console.log("✅ Existing admin verified successfully");
    } else {
      // New admin - check if NIN already exists
      console.log("👨‍💼 Creating new admin account...");

      const existingAdminByNin = await prisma.adminUser.findFirst({
        where: { ninHash: protectedNin.searchHash },
        select: { id: true, name: true },
      });

      if (existingAdminByNin) {
        console.log("❌ Admin NIN already exists");
        return NextResponse.json(
          {
            success: false,
            message:
              "An administrator with this NIN already exists. Please use the existing admin verification process.",
            error: "ADMIN_NIN_EXISTS",
          },
          { status: 409 }
        );
      }

      isNewAdmin = true;
      console.log("✅ NIN is unique for new admin");
    }

    // Protect additional data
    console.log("🔐 Protecting additional data...");
    const [
      protectedSchoolAddress,
      protectedPrincipalName,
      protectedExamOfficerPhone,
      protectedAdminName,
    ] = await Promise.all([
      protectData(body.schoolAddress, "location"),
      protectData(body.principalName, "name"),
      body.examOfficerPhone
        ? protectData(body.examOfficerPhone, "phone")
        : Promise.resolve(null),
      body.adminName
        ? protectData(body.adminName, "name")
        : Promise.resolve(null),
    ]);

    console.log("✅ Additional data protected");

    // Transaction: create school + admin (if new)
    console.log("💾 Starting database transaction...");
    const result = await prisma.$transaction(async (tx: typeof prisma) => {
      let finalAdminUser;

      if (isNewAdmin) {
        // Create new admin
        console.log("👨‍💼 Creating new admin in database...");
        finalAdminUser = await tx.adminUser.create({
          data: {
            name: protectedAdminName!.encrypted,
            email: protectedAdminEmail.encrypted,
            emailHash: protectedAdminEmail.searchHash ?? "",
            phone: protectedAdminPhone.encrypted,
            phoneHash: protectedAdminPhone.searchHash ?? "",
            password: protectedAdminPassword.encrypted,
            nin: protectedNin.encrypted,
            ninHash: protectedNin.searchHash ?? "",
            role: "Admin",
            isActive: true,
            emailVerified: false,
          },
        });
        console.log("✅ New admin created:", finalAdminUser.id);
      } else {
        // Update existing admin password
        console.log("🔄 Updating existing admin password...");
        finalAdminUser = await tx.adminUser.update({
          where: { id: adminUser!.id },
          data: {
            password: protectedAdminPassword.encrypted,
          },
        });
        console.log("✅ Existing admin password updated");
      }

      // Create school with admin reference
      console.log("🏫 Creating school in database...");
      const school = await tx.school.create({
        data: {
          centerNumber: body.centerNumber,
          centerName: body.centerName,
          state: body.state,
          lga: body.lga,
          schoolEmail: protectedSchoolEmail.encrypted,
          schoolEmailHash: protectedSchoolEmail.searchHash ?? "",
          schoolPhone: protectedSchoolPhone.encrypted,
          schoolPhoneHash: protectedSchoolPhone.searchHash ?? "",
          schoolAddress: protectedSchoolAddress.encrypted,
          schoolType: body.schoolType,
          principalName: protectedPrincipalName.encrypted,
          principalPhone: protectedPrincipalPhone.encrypted,
          principalPhoneHash: protectedPrincipalPhone.searchHash ?? "",
          examOfficerPhone: protectedExamOfficerPhone?.encrypted || null,
          examOfficerPhoneHash: protectedExamOfficerPhone?.searchHash || null,
          isVerified: false,
          emailVerified: false,
          adminId: finalAdminUser.id,
        },
      });
      console.log("✅ School created:", school.id);

      // Create audit log
      console.log("📝 Creating audit log...");
      await tx.adminAuditLog.create({
        data: {
          adminUserId: finalAdminUser.id,
          action: "SCHOOL_REGISTRATION",
          details: {
            schoolId: school.id,
            schoolName: school.centerName,
            centerNumber: school.centerNumber,
            registrationDate: new Date().toISOString(),
            isNewAdmin: isNewAdmin,
            adminVerified: !isNewAdmin,
          },
          ipAddress: request.headers.get("x-forwarded-for") || "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
        },
      });
      console.log("✅ Audit log created");

      return { school, adminUser: finalAdminUser };
    });

    console.log("✅ Database transaction completed successfully");

    // Generate JWT tokens for email verification
    console.log("🔐 Generating JWT tokens...");

    // Generate school email verification token
    const schoolToken = await JWTUtils.generateEmailVerificationToken({
      type: "school",
      email: body.schoolEmail,
      entityId: result.school.id,
      centerNumber: body.centerNumber,
    });

    // Generate admin email verification token (only for new admins)
    let adminToken = null;
    if (isNewAdmin) {
      adminToken = await JWTUtils.generateEmailVerificationToken({
        type: "admin",
        email: body.adminEmail,
        entityId: result.adminUser.id,
        centerNumber: body.centerNumber,
      });
    }

    // Store tokens in database
    console.log("💾 Storing verification tokens in database...");

    // Store school verification token
    await prisma.emailVerification.create({
      data: {
        schoolId: result.school.id,
        emailHash: protectedSchoolEmail.searchHash ?? "",
        token: schoolToken,
        type: "SCHOOL_EMAIL_VERIFICATION",
        status: "PENDING",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    });

    // Store admin verification token (only for new admins)
    if (isNewAdmin && adminToken) {
      await prisma.emailVerification.create({
        data: {
          adminId: result.adminUser.id,
          emailHash: protectedAdminEmail.searchHash ?? "",
          token: adminToken,
          type: "ADMIN_EMAIL_VERIFICATION",
          status: "PENDING",
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          ipAddress: request.headers.get("x-forwarded-for") || "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
        },
      });
    }

    console.log("✅ Tokens stored in database");

    // Send verification emails
    try {
      console.log("📧 Sending verification emails...");

      // Always send school email verification
      const schoolEmailSent = await emailService.sendSchoolVerificationEmail(
        body.schoolEmail,
        {
          schoolName: body.centerName,
          centerNumber: body.centerNumber,
          verificationLink: `${emailService.getBaseUrl()}/center/verify-email?token=${schoolToken}&schoolId=${result.school.id}`,
          recipientName: body.centerName,
        }
      );

      console.log("📧 School email sent:", schoolEmailSent);

      // Send admin email verification only for new admins
      if (isNewAdmin && adminToken) {
        const adminEmailSent = await emailService.sendAdminVerificationEmail(
          body.adminEmail,
          {
            adminName: body.adminName,
            verificationLink: `${emailService.getBaseUrl()}/admin/verify-email?token=${adminToken}&adminId=${result.adminUser.id}`,
            schoolName: body.centerName,
            recipientName: body.adminName,
          }
        );

        console.log("📧 Admin email sent:", adminEmailSent);
      }

      console.log("✅ Verification emails sent successfully");
    } catch (emailError) {
      console.error("❌ Failed to send verification emails:", emailError);
      // Continue with registration but log the error
    }

    // Success response
    console.log("🎉 Registration completed successfully");
    return NextResponse.json({
      success: true,
      message: isNewAdmin
        ? "School registration successful! Please check both the school and administrator email addresses for verification links. You must verify both emails before you can log in."
        : "School registration successful! Please check the school email for a verification link. The administrator account is already verified.",
      data: {
        school: {
          id: result.school.id,
          centerNumber: result.school.centerNumber,
          centerName: result.school.centerName,
          state: result.school.state,
          lga: result.school.lga,
          isVerified: result.school.isVerified,
          emailVerified: result.school.emailVerified,
          createdAt: result.school.createdAt,
        },
        admin: {
          id: result.adminUser.id,
          name: body.adminName || "[EXISTING ADMIN]",
          email: body.adminEmail,
          role: result.adminUser.role,
          isNewAdmin: isNewAdmin,
          emailVerified: !isNewAdmin,
        },
        verificationRequired: {
          schoolEmail: true,
          adminEmail: isNewAdmin,
        },
      },
    });
  } catch (error) {
    console.error("❌ School registration error:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    let errorMessage = "Internal server error. Please try again later.";
    let errorCode = "INTERNAL_ERROR";

    if (error instanceof Error) {
      if (error.message.includes("Unique constraint failed")) {
        errorMessage =
          "Registration failed due to duplicate data. Please check your information and try again.";
        errorCode = "DUPLICATE_DATA_ERROR";
      } else if (error.message.includes("Foreign key constraint failed")) {
        errorMessage =
          "Invalid reference data provided. Please refresh the page and try again.";
        errorCode = "REFERENCE_ERROR";
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
        error: errorCode,
        details:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
  }
}
