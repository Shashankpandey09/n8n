/*
  Warnings:

  - A unique constraint covering the columns `[workflowId]` on the table `Execution` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "public"."OutboxEnum" ADD VALUE 'TESTING';

-- CreateIndex
CREATE UNIQUE INDEX "Execution_workflowId_key" ON "public"."Execution"("workflowId");
