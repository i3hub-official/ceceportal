-- CreateTable
CREATE TABLE "public"."api_clients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "accessCode" TEXT NOT NULL,
    "secretKey" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "rateLimit" INTEGER NOT NULL DEFAULT 1000,
    "allowedIps" TEXT[],
    "scopes" TEXT[],
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "schoolId" TEXT,

    CONSTRAINT "api_clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."api_usage_logs" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT,
    "statusCode" INTEGER NOT NULL,
    "responseTime" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestId" TEXT,

    CONSTRAINT "api_usage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "api_clients_accessCode_key" ON "public"."api_clients"("accessCode");

-- CreateIndex
CREATE INDEX "api_usage_logs_clientId_timestamp_idx" ON "public"."api_usage_logs"("clientId", "timestamp");

-- CreateIndex
CREATE INDEX "api_usage_logs_endpoint_timestamp_idx" ON "public"."api_usage_logs"("endpoint", "timestamp");

-- AddForeignKey
ALTER TABLE "public"."api_clients" ADD CONSTRAINT "api_clients_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."api_clients" ADD CONSTRAINT "api_clients_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."admin_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."api_usage_logs" ADD CONSTRAINT "api_usage_logs_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."api_clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
