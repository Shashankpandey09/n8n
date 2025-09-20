/*
  Warnings:

  - A unique constraint covering the columns `[workflowId]` on the table `Webhook` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Webhook_workflowId_key" ON "public"."Webhook"("workflowId");
