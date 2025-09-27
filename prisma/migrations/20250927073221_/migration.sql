-- CreateIndex
CREATE INDEX "api_clients_isActive_createdAt_idx" ON "public"."api_clients"("isActive", "createdAt");

-- CreateIndex
CREATE INDEX "api_clients_schoolId_createdAt_idx" ON "public"."api_clients"("schoolId", "createdAt");

-- CreateIndex
CREATE INDEX "api_clients_createdBy_createdAt_idx" ON "public"."api_clients"("createdBy", "createdAt");

-- CreateIndex
CREATE INDEX "api_clients_accessCode_idx" ON "public"."api_clients"("accessCode");

-- CreateIndex
CREATE INDEX "api_clients_scopes_idx" ON "public"."api_clients" USING GIN ("scopes");

-- CreateIndex
CREATE INDEX "api_clients_rateLimit_idx" ON "public"."api_clients"("rateLimit");

-- CreateIndex
CREATE INDEX "api_clients_lastUsedAt_idx" ON "public"."api_clients"("lastUsedAt");

-- CreateIndex
CREATE INDEX "api_clients_createdAt_idx" ON "public"."api_clients"("createdAt");

-- CreateIndex
CREATE INDEX "api_clients_updatedAt_idx" ON "public"."api_clients"("updatedAt");
