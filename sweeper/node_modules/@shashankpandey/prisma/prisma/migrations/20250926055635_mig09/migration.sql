-- CreateTable
CREATE TABLE "public"."EmailWait" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "messageId" TEXT,
    "workflowId" INTEGER NOT NULL,
    "executionId" INTEGER NOT NULL,
    "nodeId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'WAITING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "EmailWait_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailWait_token_key" ON "public"."EmailWait"("token");

-- CreateIndex
CREATE UNIQUE INDEX "EmailWait_messageId_key" ON "public"."EmailWait"("messageId");
