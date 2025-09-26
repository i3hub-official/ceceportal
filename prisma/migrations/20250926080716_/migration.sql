-- CreateEnum
CREATE TYPE "public"."gender" AS ENUM ('Male', 'Female');

-- CreateEnum
CREATE TYPE "public"."disability" AS ENUM ('None', 'Visual', 'Hearing', 'Physical', 'Learning', 'Other');

-- CreateEnum
CREATE TYPE "public"."registration_status" AS ENUM ('Pending', 'Submitted', 'Verified', 'Rejected', 'Cancelled');

-- CreateEnum
CREATE TYPE "public"."school_type" AS ENUM ('Secondary', 'Seminary');

-- CreateEnum
CREATE TYPE "public"."admin_role" AS ENUM ('Super_Admin', 'Admin', 'Operator');

-- CreateEnum
CREATE TYPE "public"."exam_session_status" AS ENUM ('Upcoming', 'Registration_Open', 'Registration_Closed', 'In_Progress', 'Completed', 'Cancelled');

-- CreateTable
CREATE TABLE "public"."admin_audit_logs" (
    "id" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "schoolId" TEXT,

    CONSTRAINT "admin_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."schools" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "centerNumber" TEXT NOT NULL,
    "centerName" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "lga" TEXT NOT NULL,
    "schoolEmail" TEXT NOT NULL,
    "schoolPhone" TEXT NOT NULL,
    "schoolAddress" TEXT NOT NULL,
    "schoolType" "public"."school_type" NOT NULL,
    "principalName" TEXT NOT NULL,
    "principalPhone" TEXT NOT NULL,
    "examOfficerPhone" TEXT,
    "schoolEmailHash" TEXT NOT NULL,
    "principalPhoneHash" TEXT NOT NULL,
    "examOfficerPhoneHash" TEXT,
    "schoolPhoneHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifiedAt" TIMESTAMP(3),
    "adminId" TEXT,

    CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."admin_users" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "nin" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "emailHash" TEXT NOT NULL,
    "phoneHash" TEXT NOT NULL,
    "ninHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifiedAt" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "role" "public"."admin_role" NOT NULL DEFAULT 'Admin',
    "schoolId" TEXT,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."candidates" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "surname" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "otherName" TEXT,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" "public"."gender" NOT NULL,
    "nin" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "disability" "public"."disability",
    "state" TEXT NOT NULL,
    "lga" TEXT NOT NULL,
    "passportPhotoUrl" TEXT,
    "registrationNumber" TEXT NOT NULL,
    "acceptedTerms" BOOLEAN NOT NULL DEFAULT false,
    "registrationStatus" "public"."registration_status" NOT NULL DEFAULT 'Pending',
    "schoolId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "examSessionId" TEXT,
    "submittedAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,

    CONSTRAINT "candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."exam_sessions" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "examDate" TIMESTAMP(3) NOT NULL,
    "examTime" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "registrationStartDate" TIMESTAMP(3) NOT NULL,
    "registrationEndDate" TIMESTAMP(3) NOT NULL,
    "status" "public"."exam_session_status" NOT NULL DEFAULT 'Upcoming',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "registrationFee" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "exam_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."password_reset_tokens" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."email_verification" (
    "id" TEXT NOT NULL,
    "adminId" TEXT,
    "schoolId" TEXT,
    "emailHash" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "failureReason" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),
    "type" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "email_verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."states" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."lgas" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stateId" TEXT NOT NULL,

    CONSTRAINT "lgas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."candidate_audit_logs" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "changes" JSONB,
    "performedBy" TEXT,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "candidate_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."system_config" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_SchoolAdmins" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SchoolAdmins_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_ExamSessionToSchool" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ExamSessionToSchool_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "schools_centerNumber_key" ON "public"."schools"("centerNumber");

-- CreateIndex
CREATE UNIQUE INDEX "schools_schoolEmail_key" ON "public"."schools"("schoolEmail");

-- CreateIndex
CREATE UNIQUE INDEX "schools_schoolEmailHash_key" ON "public"."schools"("schoolEmailHash");

-- CreateIndex
CREATE UNIQUE INDEX "schools_principalPhoneHash_key" ON "public"."schools"("principalPhoneHash");

-- CreateIndex
CREATE UNIQUE INDEX "schools_schoolPhoneHash_key" ON "public"."schools"("schoolPhoneHash");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "public"."admin_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_nin_key" ON "public"."admin_users"("nin");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_emailHash_key" ON "public"."admin_users"("emailHash");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_phoneHash_key" ON "public"."admin_users"("phoneHash");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_ninHash_key" ON "public"."admin_users"("ninHash");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "public"."sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "candidates_nin_key" ON "public"."candidates"("nin");

-- CreateIndex
CREATE UNIQUE INDEX "candidates_registrationNumber_key" ON "public"."candidates"("registrationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "public"."password_reset_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "email_verification_token_key" ON "public"."email_verification"("token");

-- CreateIndex
CREATE UNIQUE INDEX "states_name_key" ON "public"."states"("name");

-- CreateIndex
CREATE UNIQUE INDEX "lgas_name_stateId_key" ON "public"."lgas"("name", "stateId");

-- CreateIndex
CREATE UNIQUE INDEX "system_config_key_key" ON "public"."system_config"("key");

-- CreateIndex
CREATE INDEX "_SchoolAdmins_B_index" ON "public"."_SchoolAdmins"("B");

-- CreateIndex
CREATE INDEX "_ExamSessionToSchool_B_index" ON "public"."_ExamSessionToSchool"("B");

-- AddForeignKey
ALTER TABLE "public"."admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "public"."admin_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."admin_users" ADD CONSTRAINT "admin_users_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "public"."admin_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."candidates" ADD CONSTRAINT "candidates_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."candidates" ADD CONSTRAINT "candidates_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."admin_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."candidates" ADD CONSTRAINT "candidates_examSessionId_fkey" FOREIGN KEY ("examSessionId") REFERENCES "public"."exam_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_verification" ADD CONSTRAINT "email_verification_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."admin_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lgas" ADD CONSTRAINT "lgas_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "public"."states"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_SchoolAdmins" ADD CONSTRAINT "_SchoolAdmins_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."admin_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_SchoolAdmins" ADD CONSTRAINT "_SchoolAdmins_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ExamSessionToSchool" ADD CONSTRAINT "_ExamSessionToSchool_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."exam_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ExamSessionToSchool" ADD CONSTRAINT "_ExamSessionToSchool_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
