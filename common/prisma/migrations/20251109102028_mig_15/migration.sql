/*
  Warnings:

  - Made the column `startedAt` on table `ExecutionTask` required. This step will fail if there are existing NULL values in that column.
  - Made the column `finishedAt` on table `ExecutionTask` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "public"."ExecutionStatus" ADD VALUE 'TESTING';

-- AlterEnum
ALTER TYPE "public"."TaskStatus" ADD VALUE 'TESTING';

-- AlterTable
ALTER TABLE "public"."ExecutionTask" ALTER COLUMN "startedAt" SET NOT NULL,
ALTER COLUMN "finishedAt" SET NOT NULL;
