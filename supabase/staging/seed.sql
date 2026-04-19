-- location
INSERT INTO "public"."location" ("id", "name", "address", "number_of_courts", "facility_type") 
VALUES ('11111111-1111-1111-1111-111111111111', 'Coulee Region Tennis Center', '123 Main St, La Crosse, WI', 6, 'outdoor');

-- season
INSERT INTO "public"."season" ("id", "number", "start_date", "end_date", "location_id")
VALUES ('22222222-2222-2222-2222-222222222222', 1, '2026-05-01', '2026-08-31', '11111111-1111-1111-1111-111111111111');

-- team
INSERT INTO "public"."team" ("id", "number", "name", "play_night") VALUES
('33333333-3333-3333-3333-333333333331', 1, 'Aces', 'tuesday'),
('33333333-3333-3333-3333-333333333332', 2, 'Faults', 'tuesday'),
('33333333-3333-3333-3333-333333333333', 3, 'Netters', 'wednesday'),
('33333333-3333-3333-3333-333333333334', 4, 'Lobbers', 'wednesday');

-- team_to_season
INSERT INTO "public"."team_to_season" ("team", "season") VALUES
('33333333-3333-3333-3333-333333333331', '22222222-2222-2222-2222-222222222222'),
('33333333-3333-3333-3333-333333333332', '22222222-2222-2222-2222-222222222222'),
('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222'),
('33333333-3333-3333-3333-333333333334', '22222222-2222-2222-2222-222222222222');

-- Matches (matches and team_match)
-- team_match creates the matches schedule
INSERT INTO "public"."team_match" ("id", "date", "time", "courts", "home_team_id", "away_team_id", "status", "season_id", "location_id") VALUES
('66666666-6666-6666-6666-666666666661', '2026-05-05', '18:00', '1, 2, 3', '33333333-3333-3333-3333-333333333331', '33333333-3333-3333-3333-333333333332', 'completed', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111'),
('66666666-6666-6666-6666-666666666662', '2026-05-06', '18:00', '4, 5, 6', '33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333334', 'scheduled', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111');

-- The legacy 'matches' table which is joined against 'match_scores' in 'standings_view'
INSERT INTO "public"."matches" ("id", "week", "date", "time", "courts", "home_team_number", "home_team_name", "home_team_night", "away_team_number", "away_team_name", "away_team_night", "status") VALUES
('66666666-6666-6666-6666-666666666661', 1, '2026-05-05', '18:00', '1, 2, 3', 1, 'Aces', 'tuesday', 2, 'Faults', 'tuesday', 'completed'),
('66666666-6666-6666-6666-666666666662', 1, '2026-05-06', '18:00', '4, 5, 6', 3, 'Netters', 'wednesday', 4, 'Lobbers', 'wednesday', 'scheduled');

-- insert match scores
INSERT INTO "public"."match_scores" ("id", "match_id", "home_lines_won", "away_lines_won", "home_total_games", "away_total_games", "home_won") VALUES
(gen_random_uuid(), '66666666-6666-6666-6666-666666666661', 2, 1, 30, 25, true);

-- line results
INSERT INTO "public"."line_results" ("match_id", "line_number", "match_type", "home_set_1", "away_set_1", "home_set_2", "away_set_2", "home_set_3", "away_set_3", "home_won") VALUES
('66666666-6666-6666-6666-666666666661', 1, 'singles', 6, 4, 6, 2, null, null, true),
('66666666-6666-6666-6666-666666666661', 2, 'singles', 3, 6, 4, 6, null, null, false),
('66666666-6666-6666-6666-666666666661', 3, 'doubles', 6, 3, 5, 7, 7, 5, true);
-- Force workflow run
