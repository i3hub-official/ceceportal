// src/app/api/center/center-lookup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";

interface CenterData {
  id: string;
  number: string;
  name: string;
  address: string;
  state: string;
  lga: string;
  isActive: boolean;
}

interface CenterResponse {
  success: boolean;
  data: CenterData;
  message: string;
  timestamp: string;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const number = searchParams.get("number");

  console.log("🔍 Received center lookup request:", {
    method: req.method,
    number,
    from: req.headers.get("referer") || "unknown origin",
  });

  if (!number || typeof number !== "string") {
    return NextResponse.json(
      {
        success: false,
        message: "Center number is required",
        error: "Invalid or missing center number parameter",
      },
      { status: 400 }
    );
  }

  if (number.length < 6 || number.length > 10) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid center number format",
        error: "Center number must be between 6 and 10 characters",
      },
      { status: 400 }
    );
  }

  try {
    // 🚫 FIRST: Check if center is already registered in our database
    console.log("📋 Checking if center is already registered in database...");

    const existingSchool = await prisma.school.findUnique({
      where: { centerNumber: number },
      select: {
        id: true,
        centerNumber: true,
        centerName: true,
        state: true,
        lga: true,
        isActive: true,
        createdAt: true,
        schoolEmail: true, // For additional context
      },
    });

    if (existingSchool) {
      console.log("❌ Center already registered:", {
        centerNumber: existingSchool.centerNumber,
        centerName: existingSchool.centerName,
        registeredAt: existingSchool.createdAt,
      });

      return NextResponse.json(
        {
          success: false,
          message: `This center (${number}) is already registered in the system. If you believe this is an error or need assistance, please contact the Catholic Education Commission office for support.`,
          error: "CENTER_ALREADY_REGISTERED",
          data: {
            centerNumber: existingSchool.centerNumber,
            centerName: existingSchool.centerName,
            registeredDate: existingSchool.createdAt
              .toISOString()
              .split("T")[0], // YYYY-MM-DD format
          },
        },
        { status: 409 } // Conflict status code
      );
    }

    console.log(
      "✅ Center not found in local database, proceeding to external lookup..."
    );

    // 🌐 SECOND: If not in our database, lookup from external CECMS API
    const apiBaseUrl =
      process.env.CECMS_API_BASE_URL || "https://cecms.vercel.app";
    const apiToken = process.env.CECMS_API_TOKEN;

    if (!apiToken) {
      console.error("❌ Missing CECMS API token configuration");
      return NextResponse.json(
        {
          success: false,
          message: "Server configuration error. Please contact support.",
          error: "API_CONFIGURATION_MISSING",
        },
        { status: 500 }
      );
    }

    const apiUrl = `${apiBaseUrl}/apis/v1/center-lookup?number=${encodeURIComponent(number)}`;

    console.log("📡 Making external API request to CECMS:", {
      url: apiUrl,
      method: "GET",
    });

    const externalResponse = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "CECMS-Registration-System/1.0",
      },
      // Add timeout for better error handling
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    const contentType = externalResponse.headers.get("content-type");

    if (!contentType || !contentType.includes("application/json")) {
      console.error("❌ Invalid content type from CECMS API:", {
        status: externalResponse.status,
        contentType,
        statusText: externalResponse.statusText,
      });

      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid response from center verification service. Please try again later.",
          error: "INVALID_RESPONSE_FORMAT",
        },
        { status: 502 } // Bad Gateway
      );
    }

    const responseData: CenterResponse = await externalResponse.json();

    console.log("📨 External API response:", {
      status: externalResponse.status,
      success: responseData.success,
      hasData: !!responseData.data,
    });

    if (!externalResponse.ok) {
      let errorMessage = "Failed to verify center number";
      let errorCode = "VERIFICATION_FAILED";

      switch (externalResponse.status) {
        case 401:
          errorMessage =
            "Authentication failed with verification service. Please try again later.";
          errorCode = "AUTH_FAILED";
          break;
        case 403:
          errorMessage =
            "Access denied by verification service. Please contact support.";
          errorCode = "ACCESS_DENIED";
          break;
        case 404:
          errorMessage =
            "Center number not found in the Catholic Education Commission database. Please verify your center number and try again.";
          errorCode = "CENTER_NOT_FOUND";
          break;
        case 429:
          errorMessage =
            "Too many requests. Please wait a moment and try again.";
          errorCode = "RATE_LIMITED";
          break;
        case 500:
        case 502:
        case 503:
          errorMessage =
            "Verification service is temporarily unavailable. Please try again later.";
          errorCode = "SERVICE_UNAVAILABLE";
          break;
        default:
          errorMessage = responseData.message || errorMessage;
          errorCode = "UNKNOWN_ERROR";
      }

      return NextResponse.json(
        {
          success: false,
          message: errorMessage,
          error: errorCode,
        },
        {
          status:
            externalResponse.status === 404
              ? 404
              : externalResponse.status === 429
                ? 429
                : 400,
        }
      );
    }

    const centerData = responseData.data;

    if (!centerData || !responseData.success) {
      console.error("❌ Invalid response structure:", {
        hasData: !!centerData,
        success: responseData.success,
        message: responseData.message,
      });

      return NextResponse.json(
        {
          success: false,
          message:
            responseData.message ||
            "Center number not found. Please check your center number and try again.",
          error: "CENTER_DATA_INVALID",
        },
        { status: 404 }
      );
    }

    // 🔍 Validate center status
    if (!centerData.isActive) {
      console.log("⚠️ Center found but inactive:", {
        centerNumber: centerData.number,
        centerName: centerData.name,
      });

      return NextResponse.json(
        {
          success: false,
          message: `Center ${centerData.number} (${centerData.name}) is currently inactive. Please contact the Catholic Education Commission office for assistance.`,
          error: "CENTER_INACTIVE",
          data: {
            centerNumber: centerData.number,
            centerName: centerData.name,
          },
        },
        { status: 403 }
      );
    }

    // 🔍 Validate required fields
    const requiredFields = ["id", "number", "name", "state", "lga"];
    const missingFields = requiredFields.filter(
      (field) => !centerData[field as keyof CenterData]
    );

    if (missingFields.length > 0) {
      console.error("❌ Missing required fields in API response:", {
        missingFields,
        receivedData: Object.keys(centerData),
      });

      return NextResponse.json(
        {
          success: false,
          message:
            "Incomplete center data received from verification service. Please try again or contact support.",
          error: "INCOMPLETE_CENTER_DATA",
        },
        { status: 502 }
      );
    }

    // 🎉 Success - return validated center data
    console.log("✅ Center lookup successful:", {
      centerNumber: centerData.number,
      centerName: centerData.name,
      state: centerData.state,
      lga: centerData.lga,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: centerData.id,
          number: centerData.number,
          name: centerData.name,
          address: centerData.address || "",
          state: centerData.state,
          lga: centerData.lga,
          isActive: centerData.isActive,
        },
        message: "Center verified successfully and available for registration",
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error("❌ Center lookup error:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      centerNumber: number,
    });

    let errorMessage = "An error occurred while verifying the center number";
    let errorCode = "LOOKUP_ERROR";

    if (error instanceof TypeError && error.message.includes("fetch")) {
      errorMessage =
        "Unable to connect to the center verification service. Please check your internet connection and try again.";
      errorCode = "NETWORK_ERROR";
    } else if (error instanceof DOMException && error.name === "TimeoutError") {
      errorMessage = "Center verification request timed out. Please try again.";
      errorCode = "TIMEOUT_ERROR";
    } else if (error instanceof SyntaxError) {
      errorMessage =
        "Invalid response received from verification service. Please try again.";
      errorCode = "RESPONSE_PARSING_ERROR";
    } else if (error instanceof Error && error.message.includes("ENOTFOUND")) {
      errorMessage =
        "Center verification service is currently unavailable. Please try again later.";
      errorCode = "SERVICE_UNREACHABLE";
    }

    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
        error: errorCode,
      },
      { status: 500 }
    );
  }
}
