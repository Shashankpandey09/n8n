/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Outbox` table. All the data in the column will be lost.
  - You are about to drop the column `payload` on the `Outbox` table. All the data in the column will be lost.
  - You are about to drop the column `processed` on the `Outbox` table. All the data in the column will be lost.
  - You are about to drop the column `processedAt` on the `Outbox` table. All the data in the column will be lost.
  - You are about to drop the column `topic` on the `Outbox` table. All the data in the column will be lost.
  - You are about to drop the column `tries` on the `Outbox` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[platform]` on the table `Credential` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[workflowId]` on the table `Outbox` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[executionId]` on the table `Outbox` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `executionId` to the `Outbox` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workflowId` to the `Outbox` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Outbox_processed_idx";

-- AlterTable
ALTER TABLE "public"."Credential" ALTER COLUMN "title" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Outbox" DROP COLUMN "createdAt",
DROP COLUMN "payload",
DROP COLUMN "processed",
DROP COLUMN "processedAt",
DROP COLUMN "topic",
DROP COLUMN "tries",
ADD COLUMN     "executionId" INTEGER NOT NULL,
ADD COLUMN     "workflowId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Credential_platform_key" ON "public"."Credential"("platform");

-- CreateIndex
CREATE UNIQUE INDEX "Outbox_workflowId_key" ON "public"."Outbox"("workflowId");

-- CreateIndex
CREATE UNIQUE INDEX "Outbox_executionId_key" ON "public"."Outbox"("executionId");

-- CreateIndex
CREATE INDEX "Outbox_workflowId_idx" ON "public"."Outbox"("workflowId");

-- AddForeignKey
ALTER TABLE "public"."Outbox" ADD CONSTRAINT "Outbox_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "public"."Workflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
