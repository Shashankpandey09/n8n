/*
  Warnings:

  - A unique constraint covering the columns `[ownerId,platform]` on the table `Credential` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Credential_ownerId_idx";

-- DropIndex
DROP INDEX "public"."Credential_ownerId_platform_idx";

-- DropIndex
DROP INDEX "public"."Credential_platform_key";

-- CreateIndex
CREATE UNIQUE INDEX "Credential_ownerId_platform_key" ON "public"."Credential"("ownerId", "platform");
