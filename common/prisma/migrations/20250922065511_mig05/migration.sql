-- CreateEnum
CREATE TYPE "public"."OutboxEnum" AS ENUM ('UNSENT', 'SENT');

-- AlterTable
ALTER TABLE "public"."Outbox" ADD COLUMN     "status" "public"."OutboxEnum" NOT NULL DEFAULT 'UNSENT';
