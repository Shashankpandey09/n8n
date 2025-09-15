-- CreateEnum
CREATE TYPE "public"."ExecutionStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."TaskStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Workflow" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "nodes" JSONB NOT NULL,
    "connections" JSONB NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Webhook" (
    "id" SERIAL NOT NULL,
    "workflowId" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "secret" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Webhook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Outbox" (
    "id" SERIAL NOT NULL,
    "topic" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" TIMESTAMP(3),
    "tries" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Outbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Credential" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Credential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Execution" (
    "id" SERIAL NOT NULL,
    "workflowId" INTEGER NOT NULL,
    "status" "public"."ExecutionStatus" NOT NULL DEFAULT 'PENDING',
    "input" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Execution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ExecutionTask" (
    "id" SERIAL NOT NULL,
    "executionId" INTEGER NOT NULL,
    "nodeId" TEXT NOT NULL,
    "status" "public"."TaskStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "input" JSONB,
    "output" JSONB,
    "error" TEXT,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "ExecutionTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Webhook_path_key" ON "public"."Webhook"("path");

-- CreateIndex
CREATE INDEX "Webhook_workflowId_idx" ON "public"."Webhook"("workflowId");

-- CreateIndex
CREATE INDEX "Outbox_processed_idx" ON "public"."Outbox"("processed");

-- CreateIndex
CREATE INDEX "Credential_ownerId_idx" ON "public"."Credential"("ownerId");

-- CreateIndex
CREATE INDEX "Execution_workflowId_status_idx" ON "public"."Execution"("workflowId", "status");

-- CreateIndex
CREATE INDEX "Execution_createdAt_idx" ON "public"."Execution"("createdAt");

-- CreateIndex
CREATE INDEX "ExecutionTask_executionId_nodeId_idx" ON "public"."ExecutionTask"("executionId", "nodeId");

-- CreateIndex
CREATE INDEX "ExecutionTask_status_idx" ON "public"."ExecutionTask"("status");

-- AddForeignKey
ALTER TABLE "public"."Workflow" ADD CONSTRAINT "Workflow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Webhook" ADD CONSTRAINT "Webhook_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "public"."Workflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Credential" ADD CONSTRAINT "Credential_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Execution" ADD CONSTRAINT "Execution_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "public"."Workflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExecutionTask" ADD CONSTRAINT "ExecutionTask_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "public"."Execution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
