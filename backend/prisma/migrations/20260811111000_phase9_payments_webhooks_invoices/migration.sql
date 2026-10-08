-- AlterEnum
ALTER TYPE "PaymentProvider" ADD VALUE 'CELTIS_SBIN';

-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'EXPIRED';

-- AlterTable
ALTER TABLE "payments" ADD COLUMN "expiresAt" TIMESTAMP(3), ADD COLUMN "externalReference" VARCHAR(180), ADD COLUMN "failureReason" TEXT, ADD COLUMN "idempotencyKey" VARCHAR(160), ADD COLUMN "metadata" JSONB;

-- CreateTable
CREATE TABLE "payment_webhook_events" (
    "id" UUID NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "eventId" VARCHAR(180) NOT NULL,
    "paymentId" UUID,
    "payload" JSONB NOT NULL,
    "signatureValid" BOOLEAN NOT NULL,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "payment_webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" UUID NOT NULL,
    "paymentId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "requestId" UUID,
    "invoiceNumber" VARCHAR(80) NOT NULL,
    "transactionReference" VARCHAR(180) NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "amountXof" INTEGER NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'XOF',
    "status" "PaymentStatus" NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "payment_webhook_events_paymentId_createdAt_idx" ON "payment_webhook_events"("paymentId", "createdAt");
CREATE INDEX "payment_webhook_events_provider_createdAt_idx" ON "payment_webhook_events"("provider", "createdAt");
CREATE UNIQUE INDEX "payment_webhook_events_provider_eventId_key" ON "payment_webhook_events"("provider", "eventId");
CREATE UNIQUE INDEX "invoices_paymentId_key" ON "invoices"("paymentId");
CREATE UNIQUE INDEX "invoices_invoiceNumber_key" ON "invoices"("invoiceNumber");
CREATE INDEX "invoices_userId_issuedAt_idx" ON "invoices"("userId", "issuedAt");
CREATE INDEX "invoices_requestId_idx" ON "invoices"("requestId");
CREATE UNIQUE INDEX "payments_idempotencyKey_key" ON "payments"("idempotencyKey");
CREATE INDEX "payments_provider_externalReference_idx" ON "payments"("provider", "externalReference");
CREATE INDEX "payments_status_expiresAt_idx" ON "payments"("status", "expiresAt");

ALTER TABLE "payment_webhook_events" ADD CONSTRAINT "payment_webhook_events_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "repair_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
