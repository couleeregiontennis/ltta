ALTER TABLE "public"."player" ADD COLUMN IF NOT EXISTS "day_availability" jsonb DEFAULT '{}'::jsonb;
