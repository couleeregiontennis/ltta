-- Migration to support Zeffy payment webhooks and payment tracking
-- Target: season and player_payment tables

-- 1. Add zeffy_campaign_id column to season table
ALTER TABLE "public"."season" ADD COLUMN IF NOT EXISTS "zeffy_campaign_id" text;
CREATE INDEX IF NOT EXISTS "idx_season_zeffy_campaign_id" ON "public"."season"("zeffy_campaign_id");

-- 2. Create player_payment table
CREATE TABLE IF NOT EXISTS "public"."player_payment" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "player_id" "uuid" REFERENCES "public"."player"("id") ON DELETE SET NULL,
    "season_id" "uuid" NOT NULL REFERENCES "public"."season"("id") ON DELETE CASCADE,
    "zeffy_payment_id" "text" UNIQUE, -- Nullable for manual payments, but must be unique if set
    "amount" numeric(10,2) NOT NULL,
    "payer_email" "text" NOT NULL,
    "raw_payload" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);

-- Primary key constraint
ALTER TABLE ONLY "public"."player_payment"
    ADD CONSTRAINT "player_payment_pkey" PRIMARY KEY ("id");

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "idx_player_payment_season_id" ON "public"."player_payment" USING "btree" ("season_id");
CREATE INDEX IF NOT EXISTS "idx_player_payment_player_id" ON "public"."player_payment" USING "btree" ("player_id");

-- Enable Row Level Security
ALTER TABLE "public"."player_payment" ENABLE ROW LEVEL SECURITY;

-- 3. Policies
-- Allow read access to all authenticated users for their own payments
CREATE POLICY "Allow users to view own payments" ON "public"."player_payment"
    FOR SELECT TO authenticated USING (
        (SELECT "auth"."uid"()) IN (SELECT "user_id" FROM "public"."player" WHERE "id" = "player_id")
    );

-- Allow admins/captains full access to manage all payments (for manual tracking)
CREATE POLICY "Allow admins/captains to manage payments" ON "public"."player_payment"
    FOR ALL TO authenticated USING (
        (SELECT "auth"."uid"()) IN (
            SELECT "user_id" FROM "public"."player"
            WHERE ("is_admin" = true OR "is_captain" = true)
        )
    );

-- Grant privileges for standard roles
GRANT ALL ON TABLE "public"."player_payment" TO "anon";
GRANT ALL ON TABLE "public"."player_payment" TO "authenticated";
GRANT ALL ON TABLE "public"."player_payment" TO "service_role";
