// File: src/app/api/admin/resend-verification/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { JWTUtils, JWTError } from "@/lib/server/jwt";
import { col } from "framer-motion/client";

export async function POST(request: NextRequest) {
  console.log("We are in the resend verification endpoint");
}
