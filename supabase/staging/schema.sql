


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."calculate_match_scores"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."calculate_match_scores"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."process_audit_log"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    payload JSONB;
    old_payload JSONB;
    record_identifier TEXT;
    user_id UUID;
BEGIN
    -- Try to get the current user ID
    user_id := auth.uid();

    -- Determine record ID (assumes 'id' column exists, otherwise generic fallback)
    IF (TG_OP = 'DELETE') THEN
        payload := to_jsonb(OLD);
        -- specific handling for tables without standard 'id' can be added here
        BEGIN
            record_identifier := OLD.id::TEXT;
        EXCEPTION WHEN OTHERS THEN
            record_identifier := 'composite/unknown';
        END;
    ELSE
        payload := to_jsonb(NEW);
        IF (TG_OP = 'UPDATE') THEN
            old_payload := to_jsonb(OLD);
        END IF;
        
        BEGIN
            record_identifier := NEW.id::TEXT;
        EXCEPTION WHEN OTHERS THEN
            record_identifier := 'composite/unknown';
        END;
    END IF;

    INSERT INTO public.audit_logs (
        table_name,
        record_id,
        operation,
        old_data,
        new_data,
        changed_by
    )
    VALUES (
        TG_TABLE_NAME,
        record_identifier,
        TG_OP,
        old_payload,
        payload,
        user_id
    );

    RETURN NULL; -- Result is ignored since this is an AFTER trigger
END;
$$;


ALTER FUNCTION "public"."process_audit_log"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_user_metadata"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF NEW.user_id IS NOT NULL THEN
    UPDATE player
    SET first_name = split_part(NEW.email, '@', 1),
        last_name = split_part(NEW.email, '@', 1)
    WHERE player.user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_user_metadata"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "table_name" "text" NOT NULL,
    "record_id" "text",
    "operation" "text" NOT NULL,
    "old_data" "jsonb",
    "new_data" "jsonb",
    "changed_by" "uuid",
    "changed_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."audit_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."court_group" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "group_name" "text" NOT NULL,
    "court_numbers" "text"[] NOT NULL,
    "location_id" "uuid",
    "is_active" boolean DEFAULT true,
    "preferred_time" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."court_group" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."line_results" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "match_id" "uuid",
    "line_number" integer NOT NULL,
    "match_type" "text" NOT NULL,
    "home_player_1_id" "uuid",
    "home_player_2_id" "uuid",
    "away_player_1_id" "uuid",
    "away_player_2_id" "uuid",
    "home_set_1" integer,
    "away_set_1" integer,
    "home_set_2" integer,
    "away_set_2" integer,
    "home_set_3" integer,
    "away_set_3" integer,
    "home_won" boolean,
    "submitted_by" "uuid",
    "submitted_at" timestamp with time zone DEFAULT "now"(),
    "notes" "text",
    CONSTRAINT "line_results_line_number_check" CHECK (("line_number" = ANY (ARRAY[1, 2, 3]))),
    CONSTRAINT "line_results_match_type_check" CHECK (("match_type" = ANY (ARRAY['singles'::"text", 'doubles'::"text"])))
);


ALTER TABLE "public"."line_results" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."location" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "address" "text",
    "phone" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "map_url" "text",
    "website_url" "text",
    "contact_email" "text",
    "contact_person" "text",
    "number_of_courts" integer DEFAULT 0,
    "facility_type" "text",
    "lighting_info" "text",
    "parking_info" "text",
    "restroom_access" boolean DEFAULT false,
    "open_year_round" boolean DEFAULT false,
    "opening_date" "date",
    "amenities" "jsonb",
    "photos" "text"[],
    CONSTRAINT "location_facility_type_check" CHECK (("facility_type" = ANY (ARRAY['outdoor'::"text", 'indoor'::"text", 'mixed'::"text"])))
);


ALTER TABLE "public"."location" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."match" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "winning_team" "uuid",
    "match_date" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "team_1_points" smallint,
    "team_2_points" smallint
);


ALTER TABLE "public"."match" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."match_scores" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "match_id" "uuid",
    "home_lines_won" integer DEFAULT 0,
    "away_lines_won" integer DEFAULT 0,
    "home_total_games" integer DEFAULT 0,
    "away_total_games" integer DEFAULT 0,
    "home_won" boolean,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."match_scores" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."match_to_team_match" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "match" "uuid" NOT NULL,
    "team_match" "uuid"
);


ALTER TABLE "public"."match_to_team_match" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."matches" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "week" integer NOT NULL,
    "date" "date" NOT NULL,
    "time" "text" NOT NULL,
    "courts" "text" NOT NULL,
    "home_team_number" integer NOT NULL,
    "home_team_name" "text" NOT NULL,
    "home_team_night" "text" NOT NULL,
    "away_team_number" integer NOT NULL,
    "away_team_name" "text" NOT NULL,
    "away_team_night" "text" NOT NULL,
    "status" "text" DEFAULT 'scheduled'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "matches_status_check" CHECK (("status" = ANY (ARRAY['scheduled'::"text", 'completed'::"text", 'cancelled'::"text", 'postponed'::"text"])))
);


ALTER TABLE "public"."matches" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."player" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "first_name" "text" NOT NULL,
    "last_name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text",
    "ranking" smallint DEFAULT 3 NOT NULL,
    "is_captain" boolean DEFAULT false NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "is_admin" boolean DEFAULT false,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."player" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."player_fee" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "season_id" "uuid" NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."player_fee" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."player_to_match" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "player" "uuid",
    "match" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."player_to_match" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."player_to_team" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "player" "uuid",
    "team" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."player_to_team" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."season" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "number" integer NOT NULL,
    "start_date" "date" NOT NULL,
    "end_date" "date" NOT NULL,
    "location_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."season" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."set" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "set_number" integer NOT NULL,
    "home_score" integer,
    "away_score" integer,
    "winner" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."set" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."set_to_match" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "match_id" "uuid",
    "set_id" "uuid"
);


ALTER TABLE "public"."set_to_match" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."team" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "number" integer NOT NULL,
    "name" "text" NOT NULL,
    "play_night" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "team_play_night_check" CHECK (("play_night" = ANY (ARRAY['tuesday'::"text", 'wednesday'::"text"])))
);


ALTER TABLE "public"."team" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."standings_view" WITH ("security_invoker"='on') AS
 WITH "match_details" AS (
         SELECT "m"."id" AS "match_id",
            "m"."home_team_number",
            "m"."away_team_number",
            "ms"."home_total_games",
            "ms"."away_total_games",
            "ms"."home_won",
            ( SELECT ((COALESCE("sum"(
                        CASE
                            WHEN ("lr"."home_set_1" > "lr"."away_set_1") THEN 1
                            ELSE 0
                        END), (0)::bigint) + COALESCE("sum"(
                        CASE
                            WHEN ("lr"."home_set_2" > "lr"."away_set_2") THEN 1
                            ELSE 0
                        END), (0)::bigint)) + COALESCE("sum"(
                        CASE
                            WHEN ("lr"."home_set_3" > "lr"."away_set_3") THEN 1
                            ELSE 0
                        END), (0)::bigint))
                   FROM "public"."line_results" "lr"
                  WHERE ("lr"."match_id" = "m"."id")) AS "home_sets_won",
            ( SELECT ((COALESCE("sum"(
                        CASE
                            WHEN ("lr"."away_set_1" > "lr"."home_set_1") THEN 1
                            ELSE 0
                        END), (0)::bigint) + COALESCE("sum"(
                        CASE
                            WHEN ("lr"."away_set_2" > "lr"."home_set_2") THEN 1
                            ELSE 0
                        END), (0)::bigint)) + COALESCE("sum"(
                        CASE
                            WHEN ("lr"."away_set_3" > "lr"."home_set_3") THEN 1
                            ELSE 0
                        END), (0)::bigint))
                   FROM "public"."line_results" "lr"
                  WHERE ("lr"."match_id" = "m"."id")) AS "away_sets_won"
           FROM ("public"."matches" "m"
             JOIN "public"."match_scores" "ms" ON (("m"."id" = "ms"."match_id")))
          WHERE (("ms"."home_won" IS NOT NULL) OR ("ms"."home_total_games" IS NOT NULL))
        ), "team_match_stats" AS (
         SELECT "t"."id" AS "team_id",
            "t"."number" AS "team_number",
            "t"."name" AS "team_name",
            "t"."play_night",
                CASE
                    WHEN ("md"."home_won" = true) THEN 1
                    WHEN (("md"."home_won" IS NULL) AND ("md"."home_sets_won" > "md"."away_sets_won")) THEN 1
                    WHEN (("md"."home_won" IS NULL) AND ("md"."home_sets_won" = "md"."away_sets_won") AND ("md"."home_total_games" > "md"."away_total_games")) THEN 1
                    ELSE 0
                END AS "is_win",
                CASE
                    WHEN ("md"."home_won" = false) THEN 1
                    WHEN (("md"."home_won" IS NULL) AND ("md"."home_sets_won" < "md"."away_sets_won")) THEN 1
                    WHEN (("md"."home_won" IS NULL) AND ("md"."home_sets_won" = "md"."away_sets_won") AND ("md"."home_total_games" < "md"."away_total_games")) THEN 1
                    ELSE 0
                END AS "is_loss",
                CASE
                    WHEN (("md"."home_won" IS NULL) AND ("md"."home_sets_won" = "md"."away_sets_won") AND ("md"."home_total_games" = "md"."away_total_games")) THEN 1
                    ELSE 0
                END AS "is_tie",
            "md"."home_sets_won" AS "sets_won",
            "md"."away_sets_won" AS "sets_lost",
            COALESCE("md"."home_total_games", 0) AS "games_won",
            COALESCE("md"."away_total_games", 0) AS "games_lost"
           FROM ("public"."team" "t"
             JOIN "match_details" "md" ON (("t"."number" = "md"."home_team_number")))
        UNION ALL
         SELECT "t"."id" AS "team_id",
            "t"."number" AS "team_number",
            "t"."name" AS "team_name",
            "t"."play_night",
                CASE
                    WHEN ("md"."home_won" = false) THEN 1
                    WHEN (("md"."home_won" IS NULL) AND ("md"."away_sets_won" > "md"."home_sets_won")) THEN 1
                    WHEN (("md"."home_won" IS NULL) AND ("md"."away_sets_won" = "md"."home_sets_won") AND ("md"."away_total_games" > "md"."home_total_games")) THEN 1
                    ELSE 0
                END AS "is_win",
                CASE
                    WHEN ("md"."home_won" = true) THEN 1
                    WHEN (("md"."home_won" IS NULL) AND ("md"."away_sets_won" < "md"."home_sets_won")) THEN 1
                    WHEN (("md"."home_won" IS NULL) AND ("md"."away_sets_won" = "md"."home_sets_won") AND ("md"."away_total_games" < "md"."home_total_games")) THEN 1
                    ELSE 0
                END AS "is_loss",
                CASE
                    WHEN (("md"."home_won" IS NULL) AND ("md"."away_sets_won" = "md"."home_sets_won") AND ("md"."away_total_games" = "md"."home_total_games")) THEN 1
                    ELSE 0
                END AS "is_tie",
            "md"."away_sets_won" AS "sets_won",
            "md"."home_sets_won" AS "sets_lost",
            COALESCE("md"."away_total_games", 0) AS "games_won",
            COALESCE("md"."home_total_games", 0) AS "games_lost"
           FROM ("public"."team" "t"
             JOIN "match_details" "md" ON (("t"."number" = "md"."away_team_number")))
        )
 SELECT "team_match_stats"."team_id",
    "team_match_stats"."team_number",
    "team_match_stats"."team_name",
    "team_match_stats"."play_night",
    "sum"("team_match_stats"."is_win") AS "wins",
    "sum"("team_match_stats"."is_loss") AS "losses",
    "sum"("team_match_stats"."is_tie") AS "ties",
    "count"(*) AS "matches_played",
    "sum"("team_match_stats"."sets_won") AS "sets_won",
    "sum"("team_match_stats"."sets_lost") AS "sets_lost",
    "sum"("team_match_stats"."games_won") AS "games_won",
    "sum"("team_match_stats"."games_lost") AS "games_lost",
        CASE
            WHEN ("count"(*) > 0) THEN "round"(((("sum"("team_match_stats"."is_win"))::numeric / ("count"(*))::numeric) * (100)::numeric), 1)
            ELSE (0)::numeric
        END AS "win_percentage",
        CASE
            WHEN (("sum"("team_match_stats"."sets_won") + "sum"("team_match_stats"."sets_lost")) > (0)::numeric) THEN "round"((("sum"("team_match_stats"."sets_won") / ("sum"("team_match_stats"."sets_won") + "sum"("team_match_stats"."sets_lost"))) * (100)::numeric), 1)
            ELSE (0)::numeric
        END AS "set_win_percentage"
   FROM "team_match_stats"
  GROUP BY "team_match_stats"."team_id", "team_match_stats"."team_number", "team_match_stats"."team_name", "team_match_stats"."play_night";


ALTER TABLE "public"."standings_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."suggestions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "content" "text" NOT NULL,
    "user_id" "uuid",
    "status" "text" DEFAULT 'pending'::"text",
    "ip_hash" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "jules_response" "jsonb",
    CONSTRAINT "suggestions_content_check" CHECK ((("length"("content") >= 10) AND ("length"("content") <= 1000))),
    CONSTRAINT "suggestions_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'reviewed'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."suggestions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."team_match" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "date" "date" NOT NULL,
    "time" "text" NOT NULL,
    "courts" "text" NOT NULL,
    "home_team_id" "uuid",
    "away_team_id" "uuid",
    "home_points" numeric(10,2) DEFAULT 0,
    "away_points" numeric(10,2) DEFAULT 0,
    "winner_id" "uuid",
    "status" "text" DEFAULT 'scheduled'::"text",
    "season_id" "uuid",
    "location_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."team_match" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."team_to_season" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team" "uuid",
    "season" "uuid"
);


ALTER TABLE "public"."team_to_season" OWNER TO "postgres";


ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."court_group"
    ADD CONSTRAINT "court_group_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."line_results"
    ADD CONSTRAINT "line_results_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."location"
    ADD CONSTRAINT "location_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."match"
    ADD CONSTRAINT "match_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."match_scores"
    ADD CONSTRAINT "match_scores_match_id_key" UNIQUE ("match_id");



ALTER TABLE ONLY "public"."match_scores"
    ADD CONSTRAINT "match_scores_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."match_to_team_match"
    ADD CONSTRAINT "match_to_team_match_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."player_fee"
    ADD CONSTRAINT "player_fee_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."player"
    ADD CONSTRAINT "player_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."player_to_match"
    ADD CONSTRAINT "player_to_match_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."player_to_team"
    ADD CONSTRAINT "player_to_team_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."season"
    ADD CONSTRAINT "season_number_key" UNIQUE ("number");



ALTER TABLE ONLY "public"."season"
    ADD CONSTRAINT "season_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."set"
    ADD CONSTRAINT "set_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."set_to_match"
    ADD CONSTRAINT "set_to_match_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."suggestions"
    ADD CONSTRAINT "suggestions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_match"
    ADD CONSTRAINT "team_match_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team"
    ADD CONSTRAINT "team_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_to_season"
    ADD CONSTRAINT "team_to_season_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_court_group_is_active" ON "public"."court_group" USING "btree" ("is_active");



CREATE INDEX "idx_court_group_location_id" ON "public"."court_group" USING "btree" ("location_id");



CREATE INDEX "idx_court_group_preferred_time" ON "public"."court_group" USING "btree" ("preferred_time");



CREATE INDEX "idx_line_results_away_player_1_id" ON "public"."line_results" USING "btree" ("away_player_1_id");



CREATE INDEX "idx_line_results_away_player_2_id" ON "public"."line_results" USING "btree" ("away_player_2_id");



CREATE UNIQUE INDEX "idx_line_results_composite" ON "public"."line_results" USING "btree" ("match_id", "line_number");



CREATE INDEX "idx_line_results_home_player_1_id" ON "public"."line_results" USING "btree" ("home_player_1_id");



CREATE INDEX "idx_line_results_home_player_2_id" ON "public"."line_results" USING "btree" ("home_player_2_id");



CREATE INDEX "idx_line_results_match_id" ON "public"."line_results" USING "btree" ("match_id");



CREATE INDEX "idx_line_results_submitted_by" ON "public"."line_results" USING "btree" ("submitted_by");



CREATE INDEX "idx_match_to_team_match_match" ON "public"."match_to_team_match" USING "btree" ("match");



CREATE INDEX "idx_match_to_team_match_team_match" ON "public"."match_to_team_match" USING "btree" ("team_match");



CREATE INDEX "idx_match_winning_team" ON "public"."match" USING "btree" ("winning_team");



CREATE UNIQUE INDEX "idx_player_email" ON "public"."player" USING "btree" ("email");



CREATE INDEX "idx_player_fee_season_id" ON "public"."player_fee" USING "btree" ("season_id");



CREATE INDEX "idx_player_is_active" ON "public"."player" USING "btree" ("is_active");



CREATE INDEX "idx_player_to_match_match" ON "public"."player_to_match" USING "btree" ("match");



CREATE INDEX "idx_player_to_match_player" ON "public"."player_to_match" USING "btree" ("player");



CREATE INDEX "idx_player_to_team_player" ON "public"."player_to_team" USING "btree" ("player");



CREATE INDEX "idx_player_to_team_team" ON "public"."player_to_team" USING "btree" ("team");



CREATE INDEX "idx_player_user_id" ON "public"."player" USING "btree" ("user_id");



CREATE INDEX "idx_season_location_id" ON "public"."season" USING "btree" ("location_id");



CREATE INDEX "idx_set_to_match_match" ON "public"."set_to_match" USING "btree" ("match_id");



CREATE INDEX "idx_set_to_match_set" ON "public"."set_to_match" USING "btree" ("set_id");



CREATE INDEX "idx_team_match_location_id" ON "public"."team_match" USING "btree" ("location_id");



CREATE INDEX "idx_team_match_season_id" ON "public"."team_match" USING "btree" ("season_id");



CREATE INDEX "idx_team_match_team_1" ON "public"."team_match" USING "btree" ("home_team_id");



CREATE INDEX "idx_team_match_team_2" ON "public"."team_match" USING "btree" ("away_team_id");



CREATE INDEX "idx_team_match_winner" ON "public"."team_match" USING "btree" ("winner_id");



CREATE INDEX "idx_team_number_night" ON "public"."team" USING "btree" ("number", "play_night");



CREATE INDEX "idx_team_play_night" ON "public"."team" USING "btree" ("play_night");



CREATE INDEX "idx_team_to_season_season" ON "public"."team_to_season" USING "btree" ("season");



CREATE INDEX "idx_team_to_season_team" ON "public"."team_to_season" USING "btree" ("team");



CREATE OR REPLACE TRIGGER "audit_line_results_changes" AFTER INSERT OR DELETE OR UPDATE ON "public"."line_results" FOR EACH ROW EXECUTE FUNCTION "public"."process_audit_log"();



CREATE OR REPLACE TRIGGER "audit_match_scores_changes" AFTER INSERT OR DELETE OR UPDATE ON "public"."match_scores" FOR EACH ROW EXECUTE FUNCTION "public"."process_audit_log"();



CREATE OR REPLACE TRIGGER "audit_matches_changes" AFTER INSERT OR DELETE OR UPDATE ON "public"."matches" FOR EACH ROW EXECUTE FUNCTION "public"."process_audit_log"();



CREATE OR REPLACE TRIGGER "audit_player_changes" AFTER INSERT OR DELETE OR UPDATE ON "public"."player" FOR EACH ROW EXECUTE FUNCTION "public"."process_audit_log"();



CREATE OR REPLACE TRIGGER "audit_player_to_team_changes" AFTER INSERT OR DELETE OR UPDATE ON "public"."player_to_team" FOR EACH ROW EXECUTE FUNCTION "public"."process_audit_log"();



CREATE OR REPLACE TRIGGER "audit_team_changes" AFTER INSERT OR DELETE OR UPDATE ON "public"."team" FOR EACH ROW EXECUTE FUNCTION "public"."process_audit_log"();



CREATE OR REPLACE TRIGGER "calculate_match_scores_trigger" AFTER INSERT OR UPDATE ON "public"."line_results" FOR EACH ROW EXECUTE FUNCTION "public"."calculate_match_scores"();



CREATE OR REPLACE TRIGGER "sync_player_metadata" AFTER INSERT OR UPDATE OF "user_id" ON "public"."player" FOR EACH ROW EXECUTE FUNCTION "public"."sync_user_metadata"();



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."court_group"
    ADD CONSTRAINT "court_group_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."location"("id");



ALTER TABLE ONLY "public"."line_results"
    ADD CONSTRAINT "line_results_away_player_1_id_fkey" FOREIGN KEY ("away_player_1_id") REFERENCES "public"."player"("id");



ALTER TABLE ONLY "public"."line_results"
    ADD CONSTRAINT "line_results_away_player_2_id_fkey" FOREIGN KEY ("away_player_2_id") REFERENCES "public"."player"("id");



ALTER TABLE ONLY "public"."line_results"
    ADD CONSTRAINT "line_results_home_player_1_id_fkey" FOREIGN KEY ("home_player_1_id") REFERENCES "public"."player"("id");



ALTER TABLE ONLY "public"."line_results"
    ADD CONSTRAINT "line_results_home_player_2_id_fkey" FOREIGN KEY ("home_player_2_id") REFERENCES "public"."player"("id");



ALTER TABLE ONLY "public"."line_results"
    ADD CONSTRAINT "line_results_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "public"."team_match"("id");



ALTER TABLE ONLY "public"."line_results"
    ADD CONSTRAINT "line_results_submitted_by_fkey" FOREIGN KEY ("submitted_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."match_scores"
    ADD CONSTRAINT "match_scores_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id");



ALTER TABLE ONLY "public"."match_to_team_match"
    ADD CONSTRAINT "match_to_team_match_match_fkey" FOREIGN KEY ("match") REFERENCES "public"."match"("id");



ALTER TABLE ONLY "public"."match_to_team_match"
    ADD CONSTRAINT "match_to_team_match_team_match_fkey" FOREIGN KEY ("team_match") REFERENCES "public"."team_match"("id");



ALTER TABLE ONLY "public"."match"
    ADD CONSTRAINT "match_winning_team_fkey" FOREIGN KEY ("winning_team") REFERENCES "public"."team"("id");



ALTER TABLE ONLY "public"."player_fee"
    ADD CONSTRAINT "player_fee_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "public"."season"("id");



ALTER TABLE ONLY "public"."player_to_match"
    ADD CONSTRAINT "player_to_match_match_fkey" FOREIGN KEY ("match") REFERENCES "public"."match"("id");



ALTER TABLE ONLY "public"."player_to_match"
    ADD CONSTRAINT "player_to_match_player_fkey" FOREIGN KEY ("player") REFERENCES "public"."player"("id");



ALTER TABLE ONLY "public"."player_to_team"
    ADD CONSTRAINT "player_to_team_player_fkey" FOREIGN KEY ("player") REFERENCES "public"."player"("id");



ALTER TABLE ONLY "public"."player_to_team"
    ADD CONSTRAINT "player_to_team_team_fkey" FOREIGN KEY ("team") REFERENCES "public"."team"("id");



ALTER TABLE ONLY "public"."player"
    ADD CONSTRAINT "player_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."season"
    ADD CONSTRAINT "season_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."location"("id");



ALTER TABLE ONLY "public"."set_to_match"
    ADD CONSTRAINT "set_to_match_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "public"."match"("id");



ALTER TABLE ONLY "public"."set_to_match"
    ADD CONSTRAINT "set_to_match_set_id_fkey" FOREIGN KEY ("set_id") REFERENCES "public"."set"("id");



ALTER TABLE ONLY "public"."suggestions"
    ADD CONSTRAINT "suggestions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."team_match"
    ADD CONSTRAINT "team_match_away_team_id_fkey" FOREIGN KEY ("away_team_id") REFERENCES "public"."team"("id");



ALTER TABLE ONLY "public"."team_match"
    ADD CONSTRAINT "team_match_home_team_id_fkey" FOREIGN KEY ("home_team_id") REFERENCES "public"."team"("id");



ALTER TABLE ONLY "public"."team_match"
    ADD CONSTRAINT "team_match_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."location"("id");



ALTER TABLE ONLY "public"."team_match"
    ADD CONSTRAINT "team_match_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "public"."season"("id");



ALTER TABLE ONLY "public"."team_match"
    ADD CONSTRAINT "team_match_winner_id_fkey" FOREIGN KEY ("winner_id") REFERENCES "public"."team"("id");



ALTER TABLE ONLY "public"."team_to_season"
    ADD CONSTRAINT "team_to_season_season_fkey" FOREIGN KEY ("season") REFERENCES "public"."season"("id");



ALTER TABLE ONLY "public"."team_to_season"
    ADD CONSTRAINT "team_to_season_team_fkey" FOREIGN KEY ("team") REFERENCES "public"."team"("id");



CREATE POLICY "Admins can update suggestions" ON "public"."suggestions" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Admins can view audit logs" ON "public"."audit_logs" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Admins can view suggestions" ON "public"."suggestions" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow admins to update seasons" ON "public"."season" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") IN ( SELECT "player"."user_id"
   FROM "public"."player"
  WHERE ("player"."is_admin" = true))));



CREATE POLICY "Allow admins to update teams" ON "public"."team" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") IN ( SELECT "player"."user_id"
   FROM "public"."player"
  WHERE ("player"."is_admin" = true))));



CREATE POLICY "Allow authenticated users to insert" ON "public"."matches" FOR INSERT WITH CHECK ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text"));



CREATE POLICY "Allow authenticated users to insert" ON "public"."player" FOR INSERT WITH CHECK ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text"));



CREATE POLICY "Allow authenticated users to insert" ON "public"."set" FOR INSERT WITH CHECK ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text"));



CREATE POLICY "Allow authenticated users to read match" ON "public"."match" FOR SELECT USING ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text"));



CREATE POLICY "Allow authenticated users to read match scores" ON "public"."match_scores" FOR SELECT USING ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text"));



CREATE POLICY "Allow authenticated users to read match to team match" ON "public"."match_to_team_match" FOR SELECT USING ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text"));



CREATE POLICY "Allow authenticated users to read matches" ON "public"."matches" FOR SELECT USING ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text"));



CREATE POLICY "Allow authenticated users to read player fees" ON "public"."player_fee" FOR SELECT USING ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text"));



CREATE POLICY "Allow authenticated users to read player to match" ON "public"."player_to_match" FOR SELECT USING ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text"));



CREATE POLICY "Allow authenticated users to read player to team" ON "public"."player_to_team" FOR SELECT USING ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text"));



CREATE POLICY "Allow authenticated users to read set to match" ON "public"."set_to_match" FOR SELECT USING ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text"));



CREATE POLICY "Allow authenticated users to read sets" ON "public"."set" FOR SELECT USING ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text"));



CREATE POLICY "Allow authenticated users to read team to season" ON "public"."team_to_season" FOR SELECT USING ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text"));



CREATE POLICY "Allow captains and admins to delete" ON "public"."team_match" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") IN ( SELECT "player"."user_id"
   FROM "public"."player"
  WHERE (("player"."is_captain" = true) OR ("player"."is_admin" = true)))));



CREATE POLICY "Allow captains and admins to insert line results" ON "public"."line_results" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") IN ( SELECT "player"."user_id"
   FROM "public"."player"
  WHERE (("player"."is_captain" = true) OR ("player"."is_admin" = true)))));



CREATE POLICY "Allow captains and admins to insert team matches" ON "public"."team_match" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") IN ( SELECT "player"."user_id"
   FROM "public"."player"
  WHERE (("player"."is_captain" = true) OR ("player"."is_admin" = true)))));



CREATE POLICY "Allow captains and admins to update match scores" ON "public"."match_scores" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") IN ( SELECT "player"."user_id"
   FROM "public"."player"
  WHERE (("player"."is_captain" = true) OR ("player"."is_admin" = true)))));



CREATE POLICY "Allow captains and admins to update matches" ON "public"."matches" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") IN ( SELECT "player"."user_id"
   FROM "public"."player"
  WHERE (("player"."is_captain" = true) OR ("player"."is_admin" = true)))));



CREATE POLICY "Allow captains and admins to update team matches" ON "public"."team_match" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") IN ( SELECT "player"."user_id"
   FROM "public"."player"
  WHERE (("player"."is_captain" = true) OR ("player"."is_admin" = true)))));



CREATE POLICY "Allow read access to all users" ON "public"."court_group" FOR SELECT USING (true);



CREATE POLICY "Allow read access to all users" ON "public"."line_results" FOR SELECT USING (true);



CREATE POLICY "Allow read access to all users" ON "public"."location" FOR SELECT USING (true);



CREATE POLICY "Allow read access to all users" ON "public"."player" FOR SELECT USING (true);



CREATE POLICY "Allow read access to all users" ON "public"."season" FOR SELECT USING (true);



CREATE POLICY "Allow read access to all users" ON "public"."team" FOR SELECT USING (true);



CREATE POLICY "Allow read access to all users" ON "public"."team_match" FOR SELECT USING (true);



CREATE POLICY "Allow users to update own player record" ON "public"."player" FOR UPDATE USING (((( SELECT "auth"."uid"() AS "uid") = "user_id") OR (( SELECT "auth"."uid"() AS "uid") IN ( SELECT "player_1"."user_id"
   FROM "public"."player" "player_1"
  WHERE (("player_1"."is_captain" = true) OR ("player_1"."is_admin" = true))))));



CREATE POLICY "Allow users to update own submissions" ON "public"."line_results" FOR UPDATE USING (((( SELECT "auth"."uid"() AS "uid") = "submitted_by") OR (( SELECT "auth"."uid"() AS "uid") IN ( SELECT "player"."user_id"
   FROM "public"."player"
  WHERE (("player"."is_captain" = true) OR ("player"."is_admin" = true))))));



CREATE POLICY "Public can submit suggestions" ON "public"."suggestions" FOR INSERT WITH CHECK (true);



CREATE POLICY "Users can view own suggestions" ON "public"."suggestions" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."audit_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."court_group" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."line_results" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."location" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."match" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."match_scores" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."match_to_team_match" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."matches" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."player" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."player_fee" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."player_to_match" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."player_to_team" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."season" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."set" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."set_to_match" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."suggestions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."team" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."team_match" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."team_to_season" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."calculate_match_scores"() TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_match_scores"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_match_scores"() TO "service_role";



GRANT ALL ON FUNCTION "public"."process_audit_log"() TO "anon";
GRANT ALL ON FUNCTION "public"."process_audit_log"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."process_audit_log"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_user_metadata"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_user_metadata"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_user_metadata"() TO "service_role";


















GRANT ALL ON TABLE "public"."audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."court_group" TO "anon";
GRANT ALL ON TABLE "public"."court_group" TO "authenticated";
GRANT ALL ON TABLE "public"."court_group" TO "service_role";



GRANT ALL ON TABLE "public"."line_results" TO "anon";
GRANT ALL ON TABLE "public"."line_results" TO "authenticated";
GRANT ALL ON TABLE "public"."line_results" TO "service_role";



GRANT ALL ON TABLE "public"."location" TO "anon";
GRANT ALL ON TABLE "public"."location" TO "authenticated";
GRANT ALL ON TABLE "public"."location" TO "service_role";



GRANT ALL ON TABLE "public"."match" TO "anon";
GRANT ALL ON TABLE "public"."match" TO "authenticated";
GRANT ALL ON TABLE "public"."match" TO "service_role";



GRANT ALL ON TABLE "public"."match_scores" TO "anon";
GRANT ALL ON TABLE "public"."match_scores" TO "authenticated";
GRANT ALL ON TABLE "public"."match_scores" TO "service_role";



GRANT ALL ON TABLE "public"."match_to_team_match" TO "anon";
GRANT ALL ON TABLE "public"."match_to_team_match" TO "authenticated";
GRANT ALL ON TABLE "public"."match_to_team_match" TO "service_role";



GRANT ALL ON TABLE "public"."matches" TO "anon";
GRANT ALL ON TABLE "public"."matches" TO "authenticated";
GRANT ALL ON TABLE "public"."matches" TO "service_role";



GRANT ALL ON TABLE "public"."player" TO "anon";
GRANT ALL ON TABLE "public"."player" TO "authenticated";
GRANT ALL ON TABLE "public"."player" TO "service_role";



GRANT ALL ON TABLE "public"."player_fee" TO "anon";
GRANT ALL ON TABLE "public"."player_fee" TO "authenticated";
GRANT ALL ON TABLE "public"."player_fee" TO "service_role";



GRANT ALL ON TABLE "public"."player_to_match" TO "anon";
GRANT ALL ON TABLE "public"."player_to_match" TO "authenticated";
GRANT ALL ON TABLE "public"."player_to_match" TO "service_role";



GRANT ALL ON TABLE "public"."player_to_team" TO "anon";
GRANT ALL ON TABLE "public"."player_to_team" TO "authenticated";
GRANT ALL ON TABLE "public"."player_to_team" TO "service_role";



GRANT ALL ON TABLE "public"."season" TO "anon";
GRANT ALL ON TABLE "public"."season" TO "authenticated";
GRANT ALL ON TABLE "public"."season" TO "service_role";



GRANT ALL ON TABLE "public"."set" TO "anon";
GRANT ALL ON TABLE "public"."set" TO "authenticated";
GRANT ALL ON TABLE "public"."set" TO "service_role";



GRANT ALL ON TABLE "public"."set_to_match" TO "anon";
GRANT ALL ON TABLE "public"."set_to_match" TO "authenticated";
GRANT ALL ON TABLE "public"."set_to_match" TO "service_role";



GRANT ALL ON TABLE "public"."team" TO "anon";
GRANT ALL ON TABLE "public"."team" TO "authenticated";
GRANT ALL ON TABLE "public"."team" TO "service_role";



GRANT ALL ON TABLE "public"."standings_view" TO "anon";
GRANT ALL ON TABLE "public"."standings_view" TO "authenticated";
GRANT ALL ON TABLE "public"."standings_view" TO "service_role";



GRANT ALL ON TABLE "public"."suggestions" TO "anon";
GRANT ALL ON TABLE "public"."suggestions" TO "authenticated";
GRANT ALL ON TABLE "public"."suggestions" TO "service_role";



GRANT ALL ON TABLE "public"."team_match" TO "anon";
GRANT ALL ON TABLE "public"."team_match" TO "authenticated";
GRANT ALL ON TABLE "public"."team_match" TO "service_role";



GRANT ALL ON TABLE "public"."team_to_season" TO "anon";
GRANT ALL ON TABLE "public"."team_to_season" TO "authenticated";
GRANT ALL ON TABLE "public"."team_to_season" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";































