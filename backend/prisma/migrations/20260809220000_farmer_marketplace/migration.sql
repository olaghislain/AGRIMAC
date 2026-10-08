-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "ProductKind" AS ENUM ('MACHINE', 'PRODUCT', 'INPUT');
CREATE TYPE "RequestKind" AS ENUM ('SERVICE', 'REPAIR', 'RENTAL', 'PURCHASE');
CREATE TYPE "RequestStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'QUOTED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE "QuoteStatus" AS ENUM ('SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED');
CREATE TYPE "PaymentProvider" AS ENUM ('MTN_MOMO', 'MOOV_MONEY', 'FLOOZ');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'CANCELLED');

CREATE TABLE "categories" (
  "id" UUID NOT NULL,
  "name" VARCHAR(120) NOT NULL,
  "slug" VARCHAR(140) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "products" (
  "id" UUID NOT NULL,
  "companyId" UUID NOT NULL,
  "categoryId" UUID,
  "title" VARCHAR(180) NOT NULL,
  "slug" VARCHAR(220) NOT NULL,
  "description" TEXT,
  "kind" "ProductKind" NOT NULL DEFAULT 'PRODUCT',
  "status" "ListingStatus" NOT NULL DEFAULT 'DRAFT',
  "priceXof" INTEGER,
  "stock" INTEGER NOT NULL DEFAULT 0,
  "city" VARCHAR(120),
  "region" VARCHAR(120),
  "latitude" DECIMAL(10,7),
  "longitude" DECIMAL(10,7),
  "imageUrl" VARCHAR(500),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "services" (
  "id" UUID NOT NULL,
  "companyId" UUID,
  "technicianId" UUID,
  "categoryId" UUID,
  "title" VARCHAR(180) NOT NULL,
  "slug" VARCHAR(220) NOT NULL,
  "description" TEXT,
  "status" "ListingStatus" NOT NULL DEFAULT 'DRAFT',
  "priceXof" INTEGER,
  "city" VARCHAR(120),
  "region" VARCHAR(120),
  "latitude" DECIMAL(10,7),
  "longitude" DECIMAL(10,7),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "repair_requests" (
  "id" UUID NOT NULL,
  "requesterId" UUID NOT NULL,
  "assigneeId" UUID,
  "kind" "RequestKind" NOT NULL DEFAULT 'SERVICE',
  "status" "RequestStatus" NOT NULL DEFAULT 'PUBLISHED',
  "title" VARCHAR(180) NOT NULL,
  "description" TEXT NOT NULL,
  "city" VARCHAR(120),
  "region" VARCHAR(120),
  "latitude" DECIMAL(10,7),
  "longitude" DECIMAL(10,7),
  "budgetXof" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "repair_requests_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "quotes" (
  "id" UUID NOT NULL,
  "requestId" UUID NOT NULL,
  "authorId" UUID NOT NULL,
  "status" "QuoteStatus" NOT NULL DEFAULT 'SENT',
  "amountXof" INTEGER NOT NULL,
  "message" TEXT,
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "quotes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "favorites" (
  "id" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "productId" UUID,
  "serviceId" UUID,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "reviews" (
  "id" UUID NOT NULL,
  "authorId" UUID NOT NULL,
  "targetUserId" UUID,
  "productId" UUID,
  "serviceId" UUID,
  "rating" INTEGER NOT NULL,
  "comment" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "payments" (
  "id" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "requestId" UUID,
  "reference" VARCHAR(80) NOT NULL,
  "provider" "PaymentProvider" NOT NULL,
  "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "amountXof" INTEGER NOT NULL,
  "currency" VARCHAR(3) NOT NULL DEFAULT 'XOF',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");
CREATE INDEX "products_status_kind_idx" ON "products"("status", "kind");
CREATE INDEX "products_companyId_idx" ON "products"("companyId");
CREATE INDEX "products_categoryId_idx" ON "products"("categoryId");
CREATE INDEX "products_city_region_idx" ON "products"("city", "region");
CREATE UNIQUE INDEX "services_slug_key" ON "services"("slug");
CREATE INDEX "services_status_idx" ON "services"("status");
CREATE INDEX "services_companyId_idx" ON "services"("companyId");
CREATE INDEX "services_technicianId_idx" ON "services"("technicianId");
CREATE INDEX "services_categoryId_idx" ON "services"("categoryId");
CREATE INDEX "services_city_region_idx" ON "services"("city", "region");
CREATE INDEX "repair_requests_requesterId_status_idx" ON "repair_requests"("requesterId", "status");
CREATE INDEX "repair_requests_assigneeId_status_idx" ON "repair_requests"("assigneeId", "status");
CREATE INDEX "repair_requests_kind_status_idx" ON "repair_requests"("kind", "status");
CREATE INDEX "repair_requests_createdAt_idx" ON "repair_requests"("createdAt");
CREATE INDEX "quotes_requestId_status_idx" ON "quotes"("requestId", "status");
CREATE INDEX "quotes_authorId_status_idx" ON "quotes"("authorId", "status");
CREATE UNIQUE INDEX "favorites_userId_productId_key" ON "favorites"("userId", "productId");
CREATE UNIQUE INDEX "favorites_userId_serviceId_key" ON "favorites"("userId", "serviceId");
CREATE INDEX "favorites_userId_createdAt_idx" ON "favorites"("userId", "createdAt");
CREATE INDEX "reviews_targetUserId_idx" ON "reviews"("targetUserId");
CREATE INDEX "reviews_productId_idx" ON "reviews"("productId");
CREATE INDEX "reviews_serviceId_idx" ON "reviews"("serviceId");
CREATE UNIQUE INDEX "payments_reference_key" ON "payments"("reference");
CREATE INDEX "payments_userId_status_idx" ON "payments"("userId", "status");
CREATE INDEX "payments_requestId_idx" ON "payments"("requestId");

ALTER TABLE "products" ADD CONSTRAINT "products_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "services" ADD CONSTRAINT "services_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "services" ADD CONSTRAINT "services_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "technician_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "services" ADD CONSTRAINT "services_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "repair_requests" ADD CONSTRAINT "repair_requests_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "repair_requests" ADD CONSTRAINT "repair_requests_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "repair_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "repair_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
