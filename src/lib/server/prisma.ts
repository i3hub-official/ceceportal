// // lib/prisma.ts

import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma || new PrismaClient().$extends(withAccelerate());

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// WITHOUT ACCELERATE TECH
// ============================================

// import { PrismaClient } from "@prisma/client";

// const globalForPrisma = globalThis as unknown as {
//     prisma: PrismaClient | undefined;
// };

// export const prisma =
//     globalForPrisma.prisma ??
//     new PrismaClient({
//         log: ["query", "info", "warn", "error"], // Optional: enable logging
//     });

// if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
