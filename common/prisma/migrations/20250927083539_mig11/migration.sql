/*
  Warnings:

  - You are about to drop the column `token` on the `EmailWait` table. All the data in the column will be lost.
  - Made the column `messageId` on table `EmailWait` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "public"."EmailWait_token_key";

-- AlterTable
ALTER TABLE "public"."EmailWait" DROP COLUMN "token",
ALTER COLUMN "messageId" SET NOT NULL;
