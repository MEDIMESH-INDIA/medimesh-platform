-- =============================================================================
-- Migration: 20260918000000_user_system
-- Description: User System & Personal Discovery Relational Architecture
-- Canonical Schema: prisma/schema.prisma
-- Target: PostgreSQL
-- =============================================================================

-- 1. Create Enums
CREATE TYPE "SavedEntityType" AS ENUM (
  'FACILITY',
  'HOSPITAL',
  'SPECIALTY',
  'DOCTOR',
  'SERVICE',
  'SCHEME',
  'TARIFF',
  'AMBULANCE',
  'PHARMACY',
  'HOME_HEALTHCARE'
);

CREATE TYPE "NotificationType" AS ENUM (
  'SAVED_INFORMATION',
  'CORRECTION_UPDATE',
  'ACCOUNT_SECURITY',
  'SYSTEM'
);

CREATE TYPE "UserStatus" AS ENUM (
  'ACTIVE',
  'SUSPENDED',
  'DEACTIVATED'
);

CREATE TYPE "LocationPreferenceMode" AS ENUM (
  'SELECTED',
  'APPROXIMATE',
  'ACTUAL'
);

-- 2. Create Users Table
CREATE TABLE "users" (
  "id" TEXT NOT NULL,
  "auth_identifier" TEXT NOT NULL,
  "display_name" TEXT NOT NULL,
  "email" TEXT,
  "preferred_language" TEXT NOT NULL DEFAULT 'en',
  "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_auth_identifier_key" ON "users"("auth_identifier");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- 3. Create User Preferences Table (No GPS / No PinCode)
CREATE TABLE "user_preferences" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "location_mode" "LocationPreferenceMode" NOT NULL DEFAULT 'SELECTED',
  "location_display_name" TEXT,
  "location_city" TEXT,
  "location_state" TEXT,
  "reduce_motion" BOOLEAN NOT NULL DEFAULT false,
  "larger_text" BOOLEAN NOT NULL DEFAULT false,
  "high_contrast" BOOLEAN NOT NULL DEFAULT false,
  "email_updates" BOOLEAN NOT NULL DEFAULT true,
  "service_announcements" BOOLEAN NOT NULL DEFAULT true,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_preferences_user_id_key" ON "user_preferences"("user_id");

-- 4. Create Saved Items Table (No Free-Text Notes)
CREATE TABLE "saved_items" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "entity_type" "SavedEntityType" NOT NULL,
  "entity_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "saved_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "saved_items_user_id_entity_type_entity_id_key" ON "saved_items"("user_id", "entity_type", "entity_id");
CREATE INDEX "saved_items_user_id_idx" ON "saved_items"("user_id");
CREATE INDEX "saved_items_user_id_entity_type_idx" ON "saved_items"("user_id", "entity_type");
CREATE INDEX "saved_items_user_id_created_at_idx" ON "saved_items"("user_id", "created_at");

-- 5. Create Saved Comparisons Table (Strictly 2 Facilities)
CREATE TABLE "saved_comparisons" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "entity_type" TEXT NOT NULL DEFAULT 'FACILITY',
  "entity_a_id" TEXT NOT NULL,
  "entity_b_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "saved_comparisons_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "saved_comparisons_user_id_entity_type_entity_a_id_entity_b_id_key" ON "saved_comparisons"("user_id", "entity_type", "entity_a_id", "entity_b_id");
CREATE INDEX "saved_comparisons_user_id_idx" ON "saved_comparisons"("user_id");
CREATE INDEX "saved_comparisons_user_id_created_at_idx" ON "saved_comparisons"("user_id", "created_at");

-- 6. Create Recent Searches Table (Non-Diagnostic)
CREATE TABLE "recent_searches" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "query" TEXT NOT NULL,
  "interpreted_intent" TEXT,
  "selected_location" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "recent_searches_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "recent_searches_user_id_idx" ON "recent_searches"("user_id");
CREATE INDEX "recent_searches_user_id_created_at_idx" ON "recent_searches"("user_id", "created_at");

-- 7. Create Notifications Table (Informational Platform Only)
CREATE TABLE "notifications" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "type" "NotificationType" NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "related_entity_type" "SavedEntityType",
  "related_entity_id" TEXT,
  "read_at" TIMESTAMP(3),
  "expires_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");
CREATE INDEX "notifications_user_id_read_at_idx" ON "notifications"("user_id", "read_at");
CREATE INDEX "notifications_user_id_created_at_idx" ON "notifications"("user_id", "created_at");

-- 8. Add Foreign Keys with Cascade Deletion on User Ownership
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "saved_items" ADD CONSTRAINT "saved_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "saved_comparisons" ADD CONSTRAINT "saved_comparisons_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "recent_searches" ADD CONSTRAINT "recent_searches_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
