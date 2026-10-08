CREATE TYPE "InterventionStatus" AS ENUM ('PLANNED', 'CONFIRMED', 'EN_ROUTE', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE "AvailabilityStatus" AS ENUM ('AVAILABLE', 'UNAVAILABLE');

CREATE TABLE "technician_zones" (
  "id" UUID NOT NULL,
  "technicianId" UUID NOT NULL,
  "name" VARCHAR(120) NOT NULL,
  "city" VARCHAR(120),
  "region" VARCHAR(120),
  "radiusKm" INTEGER NOT NULL DEFAULT 15,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "technician_zones_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "availability_slots" (
  "id" UUID NOT NULL,
  "technicianId" UUID NOT NULL,
  "dayOfWeek" INTEGER NOT NULL,
  "startTime" VARCHAR(5) NOT NULL,
  "endTime" VARCHAR(5) NOT NULL,
  "status" "AvailabilityStatus" NOT NULL DEFAULT 'AVAILABLE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "availability_slots_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "interventions" (
  "id" UUID NOT NULL,
  "technicianId" UUID NOT NULL,
  "requestId" UUID,
  "quoteId" UUID,
  "title" VARCHAR(180) NOT NULL,
  "description" TEXT,
  "location" VARCHAR(240),
  "scheduledAt" TIMESTAMP(3) NOT NULL,
  "completedAt" TIMESTAMP(3),
  "amountXof" INTEGER,
  "status" "InterventionStatus" NOT NULL DEFAULT 'PLANNED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "interventions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "availability_slots_technicianId_dayOfWeek_key" ON "availability_slots"("technicianId", "dayOfWeek");
CREATE INDEX "technician_zones_technicianId_active_idx" ON "technician_zones"("technicianId", "active");
CREATE INDEX "technician_zones_city_region_idx" ON "technician_zones"("city", "region");
CREATE INDEX "availability_slots_technicianId_status_idx" ON "availability_slots"("technicianId", "status");
CREATE INDEX "interventions_technicianId_status_idx" ON "interventions"("technicianId", "status");
CREATE INDEX "interventions_scheduledAt_idx" ON "interventions"("scheduledAt");
CREATE INDEX "interventions_requestId_idx" ON "interventions"("requestId");

ALTER TABLE "technician_zones" ADD CONSTRAINT "technician_zones_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "technician_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "availability_slots" ADD CONSTRAINT "availability_slots_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "technician_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "interventions" ADD CONSTRAINT "interventions_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "interventions" ADD CONSTRAINT "interventions_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "repair_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "interventions" ADD CONSTRAINT "interventions_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "quotes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
