-- LTTA Seeding Script for Staging Database
-- Generated automatically from players and teams Google Sheet CSV

-- 1. Location
INSERT INTO "public"."location" ("id", "name", "address", "number_of_courts", "facility_type")
VALUES ('11111111-1111-1111-1111-111111111111', 'Coulee Region Tennis Center', '123 Main St, La Crosse, WI', 6, 'outdoor')
ON CONFLICT (id) DO NOTHING;

-- 2. Season
INSERT INTO "public"."season" ("id", "number", "start_date", "end_date", "location_id")
VALUES ('22222222-2222-2222-2222-222222222222', 1, '2026-05-01', '2026-08-31', '11111111-1111-1111-1111-111111111111')
ON CONFLICT (id) DO NOTHING;

-- 3. Teams
INSERT INTO "public"."team" ("id", "number", "name", "play_night") VALUES
('33333333-3333-3333-3333-333333333301', 1, 'Spin Doctors', 'tuesday'),
('33333333-3333-3333-3333-333333333302', 2, 'Subs', 'tuesday'),
('33333333-3333-3333-3333-333333333303', 3, 'Herons', 'tuesday'),
('33333333-3333-3333-3333-333333333304', 4, 'Approach Shots', 'tuesday'),
('33333333-3333-3333-3333-333333333305', 5, 'Racquet Scientists', 'tuesday'),
('33333333-3333-3333-3333-333333333306', 6, 'Rascals', 'tuesday'),
('33333333-3333-3333-3333-333333333307', 7, 'Good Ol'' Boys', 'tuesday'),
('33333333-3333-3333-3333-333333333308', 8, 'Return to Sender with Love', 'tuesday'),
('33333333-3333-3333-3333-333333333309', 9, 'Bounce It', 'tuesday'),
('33333333-3333-3333-3333-333333333310', 10, 'Jetsetters', 'tuesday'),
('33333333-3333-3333-3333-333333333311', 11, 'Full Metal Racquet', 'tuesday'),
('33333333-3333-3333-3333-333333333312', 12, 'Easy Overhead', 'tuesday'),
('33333333-3333-3333-3333-333333333321', 1, 'LAX-Winona Fusion', 'wednesday'),
('33333333-3333-3333-3333-333333333322', 2, 'Rally Monkeys', 'wednesday'),
('33333333-3333-3333-3333-333333333323', 3, 'Hit Squad', 'wednesday'),
('33333333-3333-3333-3333-333333333324', 4, 'Hot Shots', 'wednesday'),
('33333333-3333-3333-3333-333333333325', 5, 'Glory Days', 'wednesday'),
('33333333-3333-3333-3333-333333333326', 6, 'Howie''s Team', 'wednesday'),
('33333333-3333-3333-3333-333333333327', 7, 'Serve Aces', 'wednesday'),
('33333333-3333-3333-3333-333333333328', 8, 'Not My Fault', 'wednesday'),
('33333333-3333-3333-3333-333333333329', 9, 'Baseliners', 'wednesday'),
('33333333-3333-3333-3333-333333333330', 10, 'Backhand Bandits', 'wednesday'),
('33333333-3333-3333-3333-333333333331', 11, 'Simply Smashing', 'wednesday'),
('33333333-3333-3333-3333-333333333332', 12, 'Nothing But Net', 'wednesday')
ON CONFLICT (id) DO NOTHING;

-- 4. Team to Season mapping
INSERT INTO "public"."team_to_season" ("team", "season") VALUES
('33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222222'),
('33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222222'),
('33333333-3333-3333-3333-333333333303', '22222222-2222-2222-2222-222222222222'),
('33333333-3333-3333-3333-333333333304', '22222222-2222-2222-2222-222222222222'),
('33333333-3333-3333-3333-333333333305', '22222222-2222-2222-2222-222222222222'),
('33333333-3333-3333-3333-333333333306', '22222222-2222-2222-2222-222222222222'),
('33333333-3333-3333-3333-333333333307', '22222222-2222-2222-2222-222222222222'),
('33333333-3333-3333-3333-333333333308', '22222222-2222-2222-2222-222222222222'),
('33333333-3333-3333-3333-333333333309', '22222222-2222-2222-2222-222222222222'),
('33333333-3333-3333-3333-333333333310', '22222222-2222-2222-2222-222222222222'),
('33333333-3333-3333-3333-333333333311', '22222222-2222-2222-2222-222222222222'),
('33333333-3333-3333-3333-333333333312', '22222222-2222-2222-2222-222222222222'),
('33333333-3333-3333-3333-333333333321', '22222222-2222-2222-2222-222222222222'),
('33333333-3333-3333-3333-333333333322', '22222222-2222-2222-2222-222222222222'),
('33333333-3333-3333-3333-333333333323', '22222222-2222-2222-2222-222222222222'),
('33333333-3333-3333-3333-333333333324', '22222222-2222-2222-2222-222222222222'),
('33333333-3333-3333-3333-333333333325', '22222222-2222-2222-2222-222222222222'),
('33333333-3333-3333-3333-333333333326', '22222222-2222-2222-2222-222222222222'),
('33333333-3333-3333-3333-333333333327', '22222222-2222-2222-2222-222222222222'),
('33333333-3333-3333-3333-333333333328', '22222222-2222-2222-2222-222222222222'),
('33333333-3333-3333-3333-333333333329', '22222222-2222-2222-2222-222222222222'),
('33333333-3333-3333-3333-333333333330', '22222222-2222-2222-2222-222222222222'),
('33333333-3333-3333-3333-333333333331', '22222222-2222-2222-2222-222222222222'),
('33333333-3333-3333-3333-333333333332', '22222222-2222-2222-2222-222222222222')
ON CONFLICT DO NOTHING;

-- 5. Auth Users
INSERT INTO "auth"."users" (
    "id", "instance_id", "email", "encrypted_password", "email_confirmed_at",
    "raw_app_meta_data", "raw_user_meta_data", "created_at", "updated_at",
    "role", "aud"
) VALUES
(
    '70f8084a-68e2-40b4-8f1e-32042291d06d', '00000000-0000-0000-0000-000000000000', 'tung.ouy@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Tung", "last_name": "Ouy"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '7f965026-b886-4b90-85d8-aa7ce7905154', '00000000-0000-0000-0000-000000000000', 'richpuent@yahoo.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Rich", "last_name": "Puent"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '9e2f4e99-9187-41e5-8029-846e26694358', '00000000-0000-0000-0000-000000000000', 'charan.mathi@yahoo.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Sai", "last_name": "Charan"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'dd13b9dd-8dc6-4dcc-8f78-af497b99ba02', '00000000-0000-0000-0000-000000000000', 'isaac.puent@ltta-mock.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Isaac", "last_name": "Puent"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'c9fedc56-af91-4250-8977-51694f2bec0f', '00000000-0000-0000-0000-000000000000', 'mstenger6180@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Molly", "last_name": "Stenger"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '7a9e2b4f-21f8-4928-86de-e47072a318d7', '00000000-0000-0000-0000-000000000000', 'lbower44@yahoo.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Leah", "last_name": "Bower"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '4cabf96b-4fd0-46cf-804e-b820349d0688', '00000000-0000-0000-0000-000000000000', 'jim.brieske@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Jim", "last_name": "Brieske"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '787db583-b984-4f6c-8b90-9d858467a2cd', '00000000-0000-0000-0000-000000000000', 'kalyan.satyadeep@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Kalyan", "last_name": "Boyina"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'a4881b8e-6ac1-4775-8d46-6d7991b76bbf', '00000000-0000-0000-0000-000000000000', 'sawyerkuck@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Sawyer", "last_name": "Kuck"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'd01d86f2-5522-40a6-8bfc-40ebabb819b7', '00000000-0000-0000-0000-000000000000', 'dave.wissink@ltta-mock.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Dave", "last_name": "Wissink"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '0286256c-6d27-4621-895f-67f46c5960a7', '00000000-0000-0000-0000-000000000000', 'millsfamof6@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Dave", "last_name": "Mills"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '78d73bd5-ec79-4081-8d82-88d17b842eac', '00000000-0000-0000-0000-000000000000', 'aareneson@trane.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Amanda", "last_name": "Arneson"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '2f45d8bf-38d7-4d1f-843a-04a18c46b91a', '00000000-0000-0000-0000-000000000000', 'kirk.arneson@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Kirk", "last_name": "Arneson"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'f2790a75-59a7-4586-82be-3879b1ca8a27', '00000000-0000-0000-0000-000000000000', 'brettfsm@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Stephan", "last_name": "Brettfeld"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'fc1864aa-3c23-44f8-81c1-b6660d59b86c', '00000000-0000-0000-0000-000000000000', 'jgregas@yahoo.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Joe", "last_name": "Gregas"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'dc4f7d6a-5839-4b2c-8aea-eb4f8c7e13b0', '00000000-0000-0000-0000-000000000000', 'maddielohh@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Madeline", "last_name": "Loh"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '0ebc3a07-0d33-4f2c-8167-bed10b4250c5', '00000000-0000-0000-0000-000000000000', 'tufficat@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Adrienne", "last_name": "Loh"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '89d7a188-dd9e-4849-8d8c-267482f02557', '00000000-0000-0000-0000-000000000000', 'stanton.loh@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Stanton", "last_name": "Loh"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '29927655-b80f-43fd-8c0a-f83bca96a1de', '00000000-0000-0000-0000-000000000000', 'malakaiberget@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Malakai", "last_name": "Berget"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '06de5dc4-9460-4ef5-8c89-f2b9e1cecafe', '00000000-0000-0000-0000-000000000000', 'kmgelbmann@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Kaitlyn", "last_name": "Northrup"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'd6fdd4a0-21f2-41a0-81f8-367ec77dbd3f', '00000000-0000-0000-0000-000000000000', 'srmydy@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Steve", "last_name": "Mydy"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '2180c5cb-5487-4318-886a-2b97293ce029', '00000000-0000-0000-0000-000000000000', 'schigreg@luther.k12.wi.us',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Greg", "last_name": "Schibbelhut"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '794ecda5-a273-46ef-8a61-fad53e75e878', '00000000-0000-0000-0000-000000000000', 'eddingsa.dill@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Dillon", "last_name": "Eddingsaas"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '3509a081-2066-4a4a-8c28-04de93e89fc1', '00000000-0000-0000-0000-000000000000', 'matthewjisaacson@hotmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Matthew", "last_name": "Isaacson"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '8a02856a-2f38-43c8-8385-43931d474671', '00000000-0000-0000-0000-000000000000', 'marylaschenbrenner@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Mary", "last_name": "Aschenbrenner"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'ec39d0cb-dee5-4415-834e-7de655eef46e', '00000000-0000-0000-0000-000000000000', 'lacrosseusta@yahoo.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Dale", "last_name": "Barclay"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '06580ce1-e5f0-47d3-833d-29b3f216a91c', '00000000-0000-0000-0000-000000000000', 'rhlevinger@yahoo.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Rich", "last_name": "Levinger"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '7f7503b2-38ef-4fcd-8317-dbb42bfcb12c', '00000000-0000-0000-0000-000000000000', 'engenjudith@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Judith", "last_name": "Engen"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'a39786aa-51f2-4b68-86d5-ea55e1d8f950', '00000000-0000-0000-0000-000000000000', 'amandawilkie98@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Amanda", "last_name": "Wilke"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'ffdc2042-740c-4c2a-8cf4-338dd0223751', '00000000-0000-0000-0000-000000000000', 'mjharris84@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Mark", "last_name": "Harris"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'cded44ff-ee44-4873-8ce3-1d02d038d24b', '00000000-0000-0000-0000-000000000000', 'tunksnathan@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Nathan", "last_name": "Tunks"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '5b1759e5-91cc-4d56-88a8-9d0eb1950b99', '00000000-0000-0000-0000-000000000000', 'gavingoss13@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Gavin", "last_name": "Goss"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '4f375033-68f0-4879-835c-7634aadc530f', '00000000-0000-0000-0000-000000000000', 'fwschwarz@hotmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Frank", "last_name": "Schwarz"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '87547b26-f67e-415a-8912-1bdb90f06a26', '00000000-0000-0000-0000-000000000000', 'twinberg@aol.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Nancy", "last_name": "Winberg"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '25f45923-dbc7-4a6e-8898-6a7eec61518a', '00000000-0000-0000-0000-000000000000', 'ryan.karie.johnson@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Karie", "last_name": "Johnson"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '74558594-af3d-46de-8d6e-1f9d80b71c0c', '00000000-0000-0000-0000-000000000000', 'thurkkim@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Kim", "last_name": "Thurk"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '29206031-ac58-45cb-8389-c01ad39f96c6', '00000000-0000-0000-0000-000000000000', 'mmm91492@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Morgan", "last_name": "McBride"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '58af58e0-df0d-4619-8215-4a7a32150d95', '00000000-0000-0000-0000-000000000000', 'pcoppola6@yahoo.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Peter", "last_name": "Coppola"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'faf4321e-a249-4a82-8a46-176465adfb5e', '00000000-0000-0000-0000-000000000000', 'fritzwigz15@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Fritz", "last_name": "Wiggert"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '1194452e-4660-4a02-8788-4a151a2d1a42', '00000000-0000-0000-0000-000000000000', 'seithamer@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Ellen", "last_name": "Seithamer"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'ac20675f-f953-411a-83ee-a1bda486cc96', '00000000-0000-0000-0000-000000000000', 'magsmpls@yahoo.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Margi", "last_name": "Hanson"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '6253e441-0dc4-4593-8d17-f71303274cb9', '00000000-0000-0000-0000-000000000000', 'hanz2116@yahoo.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Craig", "last_name": "Hanson"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '8f209af5-6936-47b2-8a8c-005489b8c366', '00000000-0000-0000-0000-000000000000', 'jason.herbert@dairylandpower.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Jason", "last_name": "Herbert"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '1c8598c7-6aa6-47a8-8a35-1fefd9e97ae4', '00000000-0000-0000-0000-000000000000', 'erinkherbert@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Erin", "last_name": "Herbert"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '3e0873b8-f915-4ead-8f89-762b248a4023', '00000000-0000-0000-0000-000000000000', '8088rauch@charter.net',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Becky", "last_name": "Rauch"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '1942fbe8-ce72-46b8-8489-f280ce31a03e', '00000000-0000-0000-0000-000000000000', 'pandrew77@yahoo.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Paul", "last_name": "Jacobson"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '5e0d5989-99fd-4b01-837d-3e0454bdcc9c', '00000000-0000-0000-0000-000000000000', 'brennanjquinn@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Brennan", "last_name": "Quinn"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '6addd815-2a50-4984-8e36-c81f4025f755', '00000000-0000-0000-0000-000000000000', 'dondharvey@centurytel.net',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Don", "last_name": "Harvey"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'e628fdbd-5ed9-45d5-82bb-e706afd90ecc', '00000000-0000-0000-0000-000000000000', 'dllange@charter.net',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "David", "last_name": "Lange"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '95d28468-20f2-4915-883c-4c409070f6b5', '00000000-0000-0000-0000-000000000000', 'lruff@ticinsurance.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Larry", "last_name": "Ruff"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '9aa96ea1-f9d6-450d-850f-7998c24fe385', '00000000-0000-0000-0000-000000000000', 'coryruud@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Cory", "last_name": "Ruud"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'fb1a6824-e677-41c0-8fad-f7c361671258', '00000000-0000-0000-0000-000000000000', 'penniepierce2@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Pennie", "last_name": "Pierce-Jorgeson"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'ce537244-dbc4-498c-8c03-23309723c258', '00000000-0000-0000-0000-000000000000', 'sallyruud@charter.net',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Sally", "last_name": "Ruud"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '18654518-04e1-4ffa-879b-d5b4ad5d51fc', '00000000-0000-0000-0000-000000000000', '4953drk@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Denny", "last_name": "Kreuser"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '5b49d316-fbce-454d-88f8-e49f04ab5d0f', '00000000-0000-0000-0000-000000000000', 'paul.leitholdmusic@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Paul", "last_name": "Leithold"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '45555c53-986f-4d8b-832f-fb87e31ec9c0', '00000000-0000-0000-0000-000000000000', 'sarabieneman@yahoo.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Sara", "last_name": "Bieneman"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'be3542eb-6c73-42a5-8864-2c6b260b9c7e', '00000000-0000-0000-0000-000000000000', 'marcus.missy5@yahoo.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Missy", "last_name": "Marcus"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '14a2d544-e4ec-4cb5-8005-ceaaa3a51075', '00000000-0000-0000-0000-000000000000', 'juleskam57@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Julie", "last_name": "Kamla"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '1182a965-51c5-4131-8d92-08115556e53e', '00000000-0000-0000-0000-000000000000', 'msasher05@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Asher", "last_name": "Helgerson"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'a8a980ce-54b0-4a81-8f14-d3598bcf92ee', '00000000-0000-0000-0000-000000000000', 'croraff@charter.net',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Catherine", "last_name": "Roraff"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'a1bef002-6977-4942-8bc0-4cc42a698ef5', '00000000-0000-0000-0000-000000000000', 'mhoeftleithold@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Mary", "last_name": "Leithold"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'e49d617a-abf6-4379-83c2-cfd3f5df1757', '00000000-0000-0000-0000-000000000000', 'nianyb@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Yubo", "last_name": "Nian"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'bdf33d1a-8db6-4ddf-855d-d29c1a4391de', '00000000-0000-0000-0000-000000000000', 'diehl.mattp@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Matt", "last_name": "Diehl"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '9476ac16-5a2a-4431-80fb-0f65f20fcec9', '00000000-0000-0000-0000-000000000000', 'tdwyer8989@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Tom", "last_name": "Dwyer"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '07406065-524e-4866-8788-ab1c339ff1a7', '00000000-0000-0000-0000-000000000000', 'roskos.mcr@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Mike", "last_name": "Roscos"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'af4360e8-52d7-4bba-8a2b-46c687790b5b', '00000000-0000-0000-0000-000000000000', 'soflaherty@lacrosselaw.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Sean", "last_name": "O''Flaherty"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '875044ce-393a-494a-86b3-1a3395d0d557', '00000000-0000-0000-0000-000000000000', 'danielskemp@hotmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Dan", "last_name": "Skemp"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'ec63f65c-b528-4807-84b2-a9232b5d3d24', '00000000-0000-0000-0000-000000000000', 'joanko34@aol.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Joe", "last_name": "Kotnour Sr."}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'dbfaa16d-f435-41b2-8fd7-70d5f3ca6fc2', '00000000-0000-0000-0000-000000000000', 'ann.kotnour@ltta-mock.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Ann", "last_name": "Kotnour"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '4ce63882-f326-4803-8088-8c6f2f6459a7', '00000000-0000-0000-0000-000000000000', 'wonderlingdrake@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Drake", "last_name": "Wonderling"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'befb2d07-e0b4-412f-87f0-dfe4a43d2b83', '00000000-0000-0000-0000-000000000000', 'stauner.core@alumni.uwlax.edu',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Corey", "last_name": "Stauner"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '7450cbf3-10a6-4010-8707-b019c150472f', '00000000-0000-0000-0000-000000000000', 'dane.smith@ltta-mock.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Dane", "last_name": "Smith"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '2148caeb-b909-42b5-82cc-a9a98693f6c2', '00000000-0000-0000-0000-000000000000', 'danieldrp@charter.net',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Dan", "last_name": "Petersen"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'd731837a-5efa-4935-8903-9e0c5c291882', '00000000-0000-0000-0000-000000000000', 'xyuan6388@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Shirley", "last_name": "Yuan"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '3c3341dd-4de7-48b4-84e7-2534e8b0d035', '00000000-0000-0000-0000-000000000000', 'benty613@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Tyler", "last_name": "Benson"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '1c110d7e-276d-4b0c-8b58-01e0b8af6bd6', '00000000-0000-0000-0000-000000000000', 'reagan1223@yahoo.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Reagan", "last_name": "Warren"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '7c80e1e7-26f2-4590-8adc-0a8ffd15e839', '00000000-0000-0000-0000-000000000000', 'jherde18@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Jeff", "last_name": "Herde"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '02998209-3cf3-4883-8ca7-d0db6dca6fc3', '00000000-0000-0000-0000-000000000000', 'colelapp365@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Cole", "last_name": "Lapp"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'cf71f8db-66b1-4bce-8e22-b5284f05d4cc', '00000000-0000-0000-0000-000000000000', 'billlapp@aol.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Bill", "last_name": "Lapp"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'f8366d56-4ae9-4f7c-8db6-4839494d77ea', '00000000-0000-0000-0000-000000000000', 'regina.jones@irco.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Regina", "last_name": "Jones"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'e0ab8da5-6ada-4492-89d5-7de6cffe1020', '00000000-0000-0000-0000-000000000000', 'samuelhschmidt@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Sam", "last_name": "Schmidt"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '47c171c2-d23e-4a5a-8192-822af833a167', '00000000-0000-0000-0000-000000000000', 'hannah.exner@yahoo.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Hannah", "last_name": "Exner"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '317ba4e9-b44f-44bc-8131-cb80ec8f6648', '00000000-0000-0000-0000-000000000000', 'gang.sarah4@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Sarah", "last_name": "Gang"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'd4be146a-7fa7-4b5f-8591-28b9a6469346', '00000000-0000-0000-0000-000000000000', 'mobybrazil.mb@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Morgan", "last_name": "Brazil"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '9d7f6e18-507b-459f-833b-dd42691190a6', '00000000-0000-0000-0000-000000000000', 'bmansky@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Brian", "last_name": "Mansky"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '98649551-bad0-483a-8dd5-af6540666aa3', '00000000-0000-0000-0000-000000000000', 'm.rp74@yahoo.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Ryan", "last_name": "Mullaney"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '2e4801b8-266d-496a-8f53-b9199d93cf68', '00000000-0000-0000-0000-000000000000', 'lubimi@centurytel.net',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Heidi", "last_name": "Barreyro"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '31d9b19a-c84c-44da-8fca-8b84b8ff909c', '00000000-0000-0000-0000-000000000000', 'shantorg42@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Shanon", "last_name": "Torgerud"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'bb5222e6-a95a-4749-8c29-0a8c965afeed', '00000000-0000-0000-0000-000000000000', 'barreode@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Odessa", "last_name": "Barreyro"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '4e2aa287-3740-4387-88f5-7ccfa693e669', '00000000-0000-0000-0000-000000000000', 'johnson.katie2005@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Katie", "last_name": "Johnson"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'a7b294a5-387e-442f-8f08-da60f777b8e7', '00000000-0000-0000-0000-000000000000', 'amiteshm55@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Amit", "last_name": "Mishra"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '4ed45237-8e66-4251-8a8a-b9a55b24196f', '00000000-0000-0000-0000-000000000000', 'sllim.dwight@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Dwight", "last_name": "Mills"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'c1308664-a1f2-4c1f-84e1-6f74e3a58cad', '00000000-0000-0000-0000-000000000000', 'plo722@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Pheng", "last_name": "Lo"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '1a9b5223-631d-4cd6-8179-30f06e54b181', '00000000-0000-0000-0000-000000000000', 'danlewispiano@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Dan", "last_name": "Lewis"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '5ad4e34e-0e2a-4fc5-8e78-40eaff595857', '00000000-0000-0000-0000-000000000000', 'joe_heer@hotmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Joe", "last_name": "Heer"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '164e78b0-6625-498b-8d18-76056ef93a9b', '00000000-0000-0000-0000-000000000000', 'jhriver@mac.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Janice", "last_name": "Hoeschler"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '671c4f12-bf30-4542-8674-74019f1787e9', '00000000-0000-0000-0000-000000000000', 'lacschott@charter.net',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Jeffrey", "last_name": "Schott"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'c297b716-4da8-4a0a-83c6-73e40fcea382', '00000000-0000-0000-0000-000000000000', 'subtendor@hotmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Nikki", "last_name": "Nakano"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'e60e0c94-f85c-4be9-8e6c-db1aeb495515', '00000000-0000-0000-0000-000000000000', 'lovelatte50@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Lora", "last_name": "Cadwell"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'ddf31196-083f-48fd-82a0-64370712cd5b', '00000000-0000-0000-0000-000000000000', 'onabus99@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Barb", "last_name": "Buswell"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '98160638-0cf0-4563-8a71-164aa71c91e1', '00000000-0000-0000-0000-000000000000', 'brett.meddaugh@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Brett", "last_name": "Meddaugh"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'd2664bda-409d-4c38-81fd-ff3ab4f17fa1', '00000000-0000-0000-0000-000000000000', 'meredholt@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Meredith", "last_name": "Holt"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'ae9927f0-9bda-4b6d-878d-244aeaacbd9a', '00000000-0000-0000-0000-000000000000', 'pokeworld.vvm@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Ronghui", "last_name": "Chen"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'a78de660-3223-4206-8a04-ce8470d5b04b', '00000000-0000-0000-0000-000000000000', 'kholman502@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Kayla", "last_name": "Holman"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'bd257186-37b3-40e3-8289-d5713ec5ab7f', '00000000-0000-0000-0000-000000000000', 'kelly.gorres@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Kelly", "last_name": "Gorres"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'cfb18aee-f0f4-48a1-888e-6d8219345ce6', '00000000-0000-0000-0000-000000000000', 'masonengebretson@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Mason", "last_name": "Engebretsen"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'c812a739-60ea-4ecb-8d43-ff7c8ff8bf8f', '00000000-0000-0000-0000-000000000000', 'i.dahman01@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Isaiah", "last_name": "Dahman"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'f0ea1da5-5049-4b76-8984-0291bd706781', '00000000-0000-0000-0000-000000000000', 'shinton@tranetechnologies.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Sam", "last_name": "Hinton"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'c8bb5f79-89bf-48b1-8e5e-a2834ba42dc2', '00000000-0000-0000-0000-000000000000', 'caleb.mcclung@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Caleb", "last_name": "McClung"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '1c160c48-d1ac-41ce-85c4-e09d82ccbc8a', '00000000-0000-0000-0000-000000000000', 'sheldonhlee@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Sheldon", "last_name": "Lee"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '319efc77-4408-48e3-8d8f-6393df46a0a6', '00000000-0000-0000-0000-000000000000', 'mrcrashkd@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Kyle", "last_name": "Deyo"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'ccd5cc26-780f-47e6-8f8d-9c4e1400eb7c', '00000000-0000-0000-0000-000000000000', 'michael@mcurrent.name',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Michael", "last_name": "Current"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '303fef36-e6b2-411e-88eb-d25c6eaba8c7', '00000000-0000-0000-0000-000000000000', 'ch.stins@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Christine", "last_name": "Lee"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'fd788afa-7f94-4abd-81ad-8ba266c25d7e', '00000000-0000-0000-0000-000000000000', 'tnjohnsullivan@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "John", "last_name": "Sullivan"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'a0babb73-a70c-4569-8e47-8336e0c14cdd', '00000000-0000-0000-0000-000000000000', 'anna.rydeski@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Anna", "last_name": "Rydeski"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '38fd53c2-e629-4dfc-85ec-41deb1a55e8e', '00000000-0000-0000-0000-000000000000', 'mkodesignart@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Michelle", "last_name": "Ottum"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '7c5e00ea-10f4-4002-8d0f-f60129f8ff45', '00000000-0000-0000-0000-000000000000', 'jkelly@uwlax.edu',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "John", "last_name": "Kelly"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '547aaf31-95f1-4a51-8dc0-99159546bac0', '00000000-0000-0000-0000-000000000000', 'reutla01@yahoo.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Laura", "last_name": "Reutlinger"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '35380cd1-5c6b-41b3-87e3-aed2ed999f3b', '00000000-0000-0000-0000-000000000000', 'randerson529@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Roxie", "last_name": "Anderson"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '64db7079-606a-4dd3-834d-fe72ea01be9e', '00000000-0000-0000-0000-000000000000', 'c_kahlow@yahoo.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Chris", "last_name": "Kahlow"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'c14ab963-4db9-40bb-8795-d3b3ad496f32', '00000000-0000-0000-0000-000000000000', 'taysnelson20@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Taylor", "last_name": "Nelson"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '74435b8b-5df2-43ea-8267-2f85dfd0a54c', '00000000-0000-0000-0000-000000000000', 'paytondemeyer1@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Payton", "last_name": "Demeyer"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'a60d8187-a48a-4225-8358-2b2b2dc2dda7', '00000000-0000-0000-0000-000000000000', 'tialeen@outlook.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Tia", "last_name": "Leen"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'f53884da-7f6e-4ec4-8e1a-0fc67094ad83', '00000000-0000-0000-0000-000000000000', 'leomnm@msn.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Mike", "last_name": "Leonard"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'dfc0e130-3322-4a47-8132-0f4e6eb8749e', '00000000-0000-0000-0000-000000000000', 'johnn@nobleinsurance.net',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "John", "last_name": "Noble"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '982ab8f3-33ef-4647-8d81-2bd73a5ae417', '00000000-0000-0000-0000-000000000000', 'laxoneills@charter.net',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Mike", "last_name": "O''Neill"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '493424df-b05a-4d74-849a-2475761c5c0c', '00000000-0000-0000-0000-000000000000', 'debmikefahey@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Mike", "last_name": "Fahey"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '4fcda52b-795c-412b-8a7a-efecd43f2f9d', '00000000-0000-0000-0000-000000000000', 'zach.acklin@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Zach", "last_name": "Acklin"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '7813a578-a40e-4d5f-82d0-6d8dfb31f72e', '00000000-0000-0000-0000-000000000000', 'laurono@charter.net',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Laura", "last_name": "O''Neill"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '3510b695-f0e3-42fe-8244-eb6e1624f5d4', '00000000-0000-0000-0000-000000000000', 'amyvalentine011@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Amy", "last_name": "Valentine"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '3808369e-65d9-49a9-882c-52f82f7fabf1', '00000000-0000-0000-0000-000000000000', 'timothyacklin@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Tim", "last_name": "Acklin"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '0054133b-7022-4002-8ac3-7785c365206e', '00000000-0000-0000-0000-000000000000', 'srosew10@msn.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Sarah", "last_name": "Meyers"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '43b4496a-793a-491d-8d46-3a29550b9a77', '00000000-0000-0000-0000-000000000000', 'ncrowder@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Nathan", "last_name": "Crowder"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '034d5f22-bf87-4454-8bf1-71183943dc12', '00000000-0000-0000-0000-000000000000', 'meyers.michael@mayo.edu',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Mike", "last_name": "Meyers"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'd0ef5c81-b5a5-470a-85af-3dc14c2db1ce', '00000000-0000-0000-0000-000000000000', 'brianday99@hotmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Brian", "last_name": "Day"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'dcc5935c-46b4-4335-8411-e17cd380f108', '00000000-0000-0000-0000-000000000000', 'busch.shira@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Shira", "last_name": "Busch"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '36f5b1cc-32e5-4938-812f-7b5ffe3c7b45', '00000000-0000-0000-0000-000000000000', 'janeenday64@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Janeen", "last_name": "Day"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '51d0c3fe-dca9-4ff5-83b5-a8217ae23a8d', '00000000-0000-0000-0000-000000000000', 'pholmanlax@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Paul", "last_name": "Holman"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'fdab48a7-da73-486a-8e8b-621165942ba1', '00000000-0000-0000-0000-000000000000', 'austin.stahsberg@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Austin", "last_name": "Stalsberg"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '0256b749-f35b-4681-8cfe-226b6298c7eb', '00000000-0000-0000-0000-000000000000', 'jlfloppy@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Lisa", "last_name": "Flottmeyer"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '90cf6f85-7c63-4648-8965-ab77ebe72c19', '00000000-0000-0000-0000-000000000000', 'gmcoleman@ymail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Gretchen", "last_name": "Coleman"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'b35a1f69-558e-4497-87e0-15abe390ddf6', '00000000-0000-0000-0000-000000000000', 'reallylazymark@yahoo.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Mark", "last_name": "Hoff"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'e6883e73-5b01-472d-8298-9fe18b2ca298', '00000000-0000-0000-0000-000000000000', 'randydoc7@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Randy", "last_name": "Moseng"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'fa23c346-4060-4adc-84a8-2548142b706b', '00000000-0000-0000-0000-000000000000', 'bussld07@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Luke/", "last_name": "Emily Bussiere"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '4c9a50d5-7a9a-4c30-8755-8e60790d7283', '00000000-0000-0000-0000-000000000000', 'franklingreene19@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Franklin", "last_name": "Greene"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '57026613-2682-419c-8663-49c498f3570e', '00000000-0000-0000-0000-000000000000', 'nhoff377@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Nicole", "last_name": "Hoff"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'eebf1ba9-6b98-45d9-8e75-64b7b49a80ba', '00000000-0000-0000-0000-000000000000', 'michellerank7@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Michelle", "last_name": "Rank"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'ab400457-a499-4281-8c6d-d31025406f3d', '00000000-0000-0000-0000-000000000000', 'sharonjharter@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Sharon", "last_name": "Harter"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '128189f1-439a-4900-8f66-653772b50254', '00000000-0000-0000-0000-000000000000', 'gharter@harters.net',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Gary", "last_name": "Harter"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '6e1ccbed-393e-4fa8-8bbf-40e05f55ea5b', '00000000-0000-0000-0000-000000000000', 'dahlgl17@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Gina", "last_name": "Nelms"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'c6e00d05-e5a0-4cc4-88bd-21834f84dc70', '00000000-0000-0000-0000-000000000000', 'b2014s@icloud.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Brian", "last_name": "Spier"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '08f5c7e4-4f80-4491-8762-7dd652e06a49', '00000000-0000-0000-0000-000000000000', 'grilley@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Dan", "last_name": "Grilley"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'add08119-269e-4138-8d3c-99baa15bd8fd', '00000000-0000-0000-0000-000000000000', 'bhaenni@uwlax.edu',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Ben", "last_name": "Haenni"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'ee51792d-45b9-4621-8eca-662549ea0b9e', '00000000-0000-0000-0000-000000000000', 'fraubyrne@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Tamara", "last_name": "Byrne"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '88c06d7d-a5fd-46c3-83f8-25c9c8dbe896', '00000000-0000-0000-0000-000000000000', 'jdneukom@yahoo.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Josh", "last_name": "Neukom"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '66a65a1b-1274-41dd-8e19-82f651bbbf9a', '00000000-0000-0000-0000-000000000000', 'bbhattacharyya@uwalumni.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Basu", "last_name": "Bhattacharyya"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '2a29a2c2-6478-4159-82a4-402e655c090c', '00000000-0000-0000-0000-000000000000', 'jmay439@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "John", "last_name": "May"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'f0ceda64-e3ef-49b3-8dfd-ca41ea90eb08', '00000000-0000-0000-0000-000000000000', 'jrhildebrandt39@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "John", "last_name": "Hildebrandt"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '21bb6155-b9db-4e72-816f-fc0b2d1508f0', '00000000-0000-0000-0000-000000000000', 'dvbodelson@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Dan", "last_name": "Bodelson"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '07945dac-0094-40d6-8331-1d0ea2d900a2', '00000000-0000-0000-0000-000000000000', 'dickdeml608@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Dick", "last_name": "Deml"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'b9882df8-182e-4380-8d2a-5e6bde8c3734', '00000000-0000-0000-0000-000000000000', 'agraewin@aol.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Al", "last_name": "Graewin"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '27245977-4a6e-45c2-8a24-8d9e870afdf9', '00000000-0000-0000-0000-000000000000', 'ballasj@centurytel.net',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Jim", "last_name": "Ballas"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '16d4acbc-e360-40db-8dc7-b4757381f820', '00000000-0000-0000-0000-000000000000', 'barbrb2002@yahoo.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Bob", "last_name": "Hildebrandt"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '1afa7a47-3c13-48eb-8383-c07d316cae93', '00000000-0000-0000-0000-000000000000', 'terrijk@charter.net',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Terri", "last_name": "Kaiser"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '3cc7f91d-966b-4d3f-8c82-1c02887500f4', '00000000-0000-0000-0000-000000000000', 'jill.graewin@ltta-mock.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Jill", "last_name": "Graewin"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'df4a4d59-fc4d-4019-8e16-31d0a4655a0e', '00000000-0000-0000-0000-000000000000', 'leahfortun@hotmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Leah", "last_name": "Fortun"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'af32162b-d204-43db-80b7-e9126d1ff9a1', '00000000-0000-0000-0000-000000000000', 'josh.fortun@ltta-mock.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Josh", "last_name": "Fortun"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '86f65343-a528-4c84-845a-069652d76164', '00000000-0000-0000-0000-000000000000', 'carrcrew5@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Jennifer", "last_name": "Carr"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '36f5af33-3cc9-446b-880d-c2ae1b13f4ab', '00000000-0000-0000-0000-000000000000', 'marcou4@charter.net',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Amy", "last_name": "Marcou"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'aa3990ae-d7c0-44b7-8b34-909d3336d04f', '00000000-0000-0000-0000-000000000000', 'moojelabi@yahoo.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Michael", "last_name": "Ojelabi"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'd7d84287-e123-41ee-8ad7-e551ea5d317f', '00000000-0000-0000-0000-000000000000', 'macrosby@emplifyhealth.org',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Marc", "last_name": "Crosby"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '34cf7e47-c8ba-43c9-86f9-7b40b63a54e5', '00000000-0000-0000-0000-000000000000', 'jerverdeleon@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Eli", "last_name": "De Leon"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '784dc87e-ce08-4b4a-8b88-ced577505f35', '00000000-0000-0000-0000-000000000000', 'ijsalvador1@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Irene", "last_name": "Johnson-Salvador"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'c26f8886-26c6-4196-878b-9062e2978a41', '00000000-0000-0000-0000-000000000000', 'kurt@gutknecht.ws',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Kurt", "last_name": "Gutknecht"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '5c3c8c16-abcd-42db-8879-799ebfdc1bb1', '00000000-0000-0000-0000-000000000000', 'theresewaltz3@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Therese", "last_name": "Waltz"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'bd5c425e-ba57-42dd-8dd7-5372a0a144cd', '00000000-0000-0000-0000-000000000000', 'kaceynomland@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Kacey", "last_name": "Nomland"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'd21b158d-10a0-4c7c-822d-058a2580ef3e', '00000000-0000-0000-0000-000000000000', 'tylert614@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Tyler", "last_name": "Thomas"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'ddfab3a8-6c2e-4894-8fd7-94b49fd456ac', '00000000-0000-0000-0000-000000000000', 'ydavidyao8@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "David", "last_name": "Yao"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'b5888989-7848-4682-8e06-5bc755b14d57', '00000000-0000-0000-0000-000000000000', 'jkbartley@charter.net',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Kris", "last_name": "Bartley"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '8ef58761-fa4d-4618-8951-0cecfc1abe09', '00000000-0000-0000-0000-000000000000', 'dinkelj3@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Jenna", "last_name": "Dinkel"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '8a898eb7-f986-459f-810b-4c962aba8d27', '00000000-0000-0000-0000-000000000000', 'logandzlnsk@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Logan", "last_name": "Dzielinski"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'b6214bb4-37b7-4a62-87ad-faec9b537970', '00000000-0000-0000-0000-000000000000', 'alexmoorehiller@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Alex", "last_name": "Hiller"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '2932d103-a7fe-4a82-8e05-1854564a3aba', '00000000-0000-0000-0000-000000000000', 'erijohnson214@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Eric", "last_name": "Johnson"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '6fb17ffd-884c-4a86-8796-56107dfb36e3', '00000000-0000-0000-0000-000000000000', 'lewis.kuhlman@me.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Lewis", "last_name": "Kuhlman"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '4b6b3223-75e0-4165-8cc0-3fb013a5a2f7', '00000000-0000-0000-0000-000000000000', 'sarah.wengerter@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Sarah", "last_name": "Wengerter"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '21ee4d86-0ddf-4d19-8b8d-4a72d7ae04c9', '00000000-0000-0000-0000-000000000000', 'brittmd101@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Brittney", "last_name": "DeChambeau"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '9121c338-8a86-437e-86fa-ca76bc8fd3a4', '00000000-0000-0000-0000-000000000000', 'kdleque@yahoo.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Kevin", "last_name": "LeQue"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'c9d41e0f-7672-4295-8bd3-dca1dd49027e', '00000000-0000-0000-0000-000000000000', 'aharter@harters.net',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Asa", "last_name": "Harter"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '69d73637-a52e-429c-8543-0e898b16e966', '00000000-0000-0000-0000-000000000000', 'bahrloganj.b@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Logan", "last_name": "Bahr"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '6f39d09a-25d4-4f3b-8fa4-35c243006d9b', '00000000-0000-0000-0000-000000000000', 'sub.onlylist@ltta-mock.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "SUB", "last_name": "ONLY LIST"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '2e9aadc6-3e0a-43e4-88c9-c6a365f8cc7d', '00000000-0000-0000-0000-000000000000', 'email',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Name", "last_name": "Player"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '4f58aac8-5582-451e-8547-f0608a6e5ca4', '00000000-0000-0000-0000-000000000000', 'rjand541@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Ruben", "last_name": "Anderson"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '8243bc7f-2b4b-4369-866d-14698c2bd6e5', '00000000-0000-0000-0000-000000000000', 'jbird1950@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Julio", "last_name": "Bird"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'b6232a88-1d14-486c-8724-531a58989d3f', '00000000-0000-0000-0000-000000000000', 'moohansoon@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Soonjung", "last_name": "Choi"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'db01b9ca-6171-41a6-8d62-af14003e9587', '00000000-0000-0000-0000-000000000000', 'theresewalz3@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Shanyn", "last_name": "Kuljian"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'cbd0da66-31fd-4cb2-83a1-cec74b8555c7', '00000000-0000-0000-0000-000000000000', 'abigail.l.ho@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Abigail", "last_name": "Ho"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'e8bc038c-d6e1-4a71-84b1-f10769ac2381', '00000000-0000-0000-0000-000000000000', 'qlamers13@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Quentin", "last_name": "Lamers"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '5e5b9b1d-fa55-4f99-8667-6262fa175330', '00000000-0000-0000-0000-000000000000', 'dan.olsen153@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Dan", "last_name": "Olson"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '8f0b52a1-bacb-4cf1-8281-93b9d39cbeb2', '00000000-0000-0000-0000-000000000000', 'timverbeke@yahoo.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Tim", "last_name": "Verbeke"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '1a9c8ec1-72d4-4fe1-8bb3-72d2baae6d5a', '00000000-0000-0000-0000-000000000000', 'kbpt87@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Karen", "last_name": "Bonifas"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '1975fb46-2de4-40e0-84f7-feff369dca26', '00000000-0000-0000-0000-000000000000', 'lcoppola323@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Laura", "last_name": "Coppola"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '1f922a2e-5346-431b-8dd8-eba527f28ec1', '00000000-0000-0000-0000-000000000000', 'blfowler@gundersenhealth.org',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Brad", "last_name": "Fowler"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '161e8850-3559-4fa9-8856-87e398fff5ce', '00000000-0000-0000-0000-000000000000', 'christian.gundersen@ltta-mock.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Christian", "last_name": "Gundersen"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '9ee9db6a-a8ac-496e-89f5-8c41439fccc5', '00000000-0000-0000-0000-000000000000', 'jphartfield77@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Jon", "last_name": "Hartfield"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '5c26ada2-358d-43f2-8d95-3f4c356091a8', '00000000-0000-0000-0000-000000000000', 'ndheath@wisc.edu',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Nolan", "last_name": "Heath"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'e6eb6d7d-72fd-4bce-8523-dbdfc3010755', '00000000-0000-0000-0000-000000000000', 'thomas.londergan62@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Tom", "last_name": "Londergan"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'c7d4f89f-46e8-4c00-8df9-8f1a5f123f82', '00000000-0000-0000-0000-000000000000', 'ingebrit@hotmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Britt", "last_name": "Lund"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'cbc52441-4ba7-404f-83c4-9546dabc2828', '00000000-0000-0000-0000-000000000000', 'izzyploessl@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Izzy", "last_name": "Ploessl"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '0dfdf555-4ac4-4153-8eca-984b8e04debc', '00000000-0000-0000-0000-000000000000', 'jjp1020@hotmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Josh", "last_name": "Potaracke"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '55760c1f-72c0-40ca-820f-baf3a8556c97', '00000000-0000-0000-0000-000000000000', 'elia@alseed.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Elia", "last_name": "Romano"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '7ab46155-51ac-41e9-802c-23010d7b05b8', '00000000-0000-0000-0000-000000000000', 'scott.michael1@mayo.edu',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Michael", "last_name": "Scott"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '38985974-9a2a-4bb1-8d60-94c604f4a5be', '00000000-0000-0000-0000-000000000000', 'kvinceme@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Kelly", "last_name": "Skaff"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '1ea6a45a-6885-4e42-82db-a96bc590b0d7', '00000000-0000-0000-0000-000000000000', 'katiejsteingraeber@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Katie", "last_name": "Steingraeber"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'ec3c9da2-d674-45cf-822d-1cfc538744e2', '00000000-0000-0000-0000-000000000000', 'tsyring@me.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Tim", "last_name": "Syring"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'a2cf1b54-179c-423a-8092-94bb2e1c7fb6', '00000000-0000-0000-0000-000000000000', 'evsunwoodard@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Evan", "last_name": "Woodward"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'b9702fbf-78cb-4e73-8aa8-4140190edaa6', '00000000-0000-0000-0000-000000000000', 'stevewissink1@hotmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Steve", "last_name": "Wissink"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '128d36d4-cccb-414a-8c4b-06b367272e67', '00000000-0000-0000-0000-000000000000', 'eyehle@blc.edu',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Emily", "last_name": "Yehle"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '1acf070b-16ea-4d1e-88b0-8fe9a74edf0a', '00000000-0000-0000-0000-000000000000', 'andy.seithamer@ltta-mock.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Andy", "last_name": "Seithamer"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'dcc431d0-df96-41c0-8459-d6f69b7f0f36', '00000000-0000-0000-0000-000000000000', 'juliaalk@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Julia", "last_name": "Alkhovsky"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '8b385d8b-6278-4f2e-8486-74a4eecd3c2e', '00000000-0000-0000-0000-000000000000', 'jaschen456@aol.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "John", "last_name": "Aschenbrenner"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '242715ee-0b14-419a-8848-3c930b4961fd', '00000000-0000-0000-0000-000000000000', 'bornitzs@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Micah", "last_name": "Bornitz"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'e54ae82e-de48-4f68-865f-5ccc0b03bbc8', '00000000-0000-0000-0000-000000000000', 'audry.endrizzi@ltta-mock.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Audry", "last_name": "Endrizzi"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'cb44b353-f10e-4e3b-800a-339fa3b4c3cf', '00000000-0000-0000-0000-000000000000', 'engen.danni@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Danni", "last_name": "Engen"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '6273a33e-0d96-4b59-89cd-97f4ddb89005', '00000000-0000-0000-0000-000000000000', 'joshuafitzner9@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Josh", "last_name": "Fitzner"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'e78bbaf9-5d02-47dd-8b70-84b1ff2690d2', '00000000-0000-0000-0000-000000000000', 'joejoegun20@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Joe", "last_name": "Francksen"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'c2d7bdc0-e931-4f9c-85c7-4520e324b886', '00000000-0000-0000-0000-000000000000', 'kelly.gorres@ltta-mock.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Kelly", "last_name": "Gorres"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'fe694dc9-7cc8-460c-86e4-134e5d96ef67', '00000000-0000-0000-0000-000000000000', 'bkgroen@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Brendon", "last_name": "Groen"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '323b487f-f633-412d-8b3c-42238c0d2739', '00000000-0000-0000-0000-000000000000', 'heiderscheitc@charter.net',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Chris", "last_name": "Heiderscheit"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '84586b14-5689-4616-857b-626a7cd77286', '00000000-0000-0000-0000-000000000000', 'j.e.n.n.a.r.i.a.n.e@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Jenna", "last_name": "Helminski Juve"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '8747cce6-de3c-4b81-8280-ed411202a314', '00000000-0000-0000-0000-000000000000', 'dale.hockhaufer@ltta-mock.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Dale", "last_name": "Hockhaufer"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '52b4ec67-02d0-4bad-805d-a01259ed678a', '00000000-0000-0000-0000-000000000000', 'lori.hochhaufer@ltta-mock.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Lori", "last_name": "Hochhaufer"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '23f9f795-8371-40f0-8e74-a436fc4fd57f', '00000000-0000-0000-0000-000000000000', 'kjensen532@yahoo.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Kyle", "last_name": "Jensen"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '49b55364-3c54-4061-8144-b0b02ae4c158', '00000000-0000-0000-0000-000000000000', 'logan.johnson8907@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Logan", "last_name": "Johnson"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'ff88c675-acee-49df-82aa-9d1440d66aaa', '00000000-0000-0000-0000-000000000000', 'kotnour.maggie@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Maggie", "last_name": "Kotnour"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '670f83d0-e4bc-4932-8d44-3332b4e04a46', '00000000-0000-0000-0000-000000000000', 'calvin_krz@yahoo.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Calvin", "last_name": "Krzebietke"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '3c31f07b-a0fa-410b-8547-393d282e407c', '00000000-0000-0000-0000-000000000000', 'mlakmann@lacrossesd.org',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Mark", "last_name": "Lakmann"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'b938890b-ba1c-4036-8262-bf3d0d0833c2', '00000000-0000-0000-0000-000000000000', 'ran.ikeyama@ltta-mock.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Ran", "last_name": "Ikeyama"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '5e6acb70-0fe1-4f77-8ca7-496d80f42438', '00000000-0000-0000-0000-000000000000', 'graciemiller000@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Gracie", "last_name": "Miller"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '28e22143-3574-4f92-849a-e6d1cf580802', '00000000-0000-0000-0000-000000000000', 'reinhart.brad@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Brad", "last_name": "Reinhart"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '25b74195-b1fa-4a50-8a45-88b93dbe9fe9', '00000000-0000-0000-0000-000000000000', 'rajr09@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Raj", "last_name": "Remnarace"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'b7a60311-7d01-4569-8441-23d4d6edd403', '00000000-0000-0000-0000-000000000000', 'richardsbj13@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Brian", "last_name": "Richardson"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'a6b89930-e25b-43a1-8c44-93766222abb6', '00000000-0000-0000-0000-000000000000', 'aschlicht2@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Allie", "last_name": "Schlicht"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'e507cfdc-006b-4b69-82d7-af875d167c28', '00000000-0000-0000-0000-000000000000', 'spindler.indy@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Indy", "last_name": "Spindler"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '1ac91963-cca8-4d9c-8df9-3f2600d5c4b8', '00000000-0000-0000-0000-000000000000', 'toddjtheisen@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Todd", "last_name": "Theisen"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '260b7fd7-3888-4491-8478-49a5d04ec9b9', '00000000-0000-0000-0000-000000000000', 'pete.thomson@ltta-mock.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Pete", "last_name": "Thomson"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'a77dbb01-f852-4cb9-8979-416e2ba1cfb0', '00000000-0000-0000-0000-000000000000', 'storibio@uwlax.edu',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Sherwin", "last_name": "Toribio"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '886afd4e-c2ea-4b9b-8c6c-64b848aeb4bd', '00000000-0000-0000-0000-000000000000', 'sofia.tucker@ltta-mock.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Sofia", "last_name": "Tucker"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '0a32fa10-238a-4a1f-8ce3-ee8c5abd8de9', '00000000-0000-0000-0000-000000000000', 'cynthiatmvo@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Cynthia", "last_name": "Vo"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'caffa9e1-a704-421a-8b96-228052e06d7c', '00000000-0000-0000-0000-000000000000', 'devinvoss@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Devin", "last_name": "Voss"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'a0c81721-0383-49f3-8167-c683a41eedde', '00000000-0000-0000-0000-000000000000', 'ashrya7@yahoo.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Ashley", "last_name": "Patros"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '075feb31-b9a1-4da0-8bba-761cfe66987a', '00000000-0000-0000-0000-000000000000', 'mohan.ananth@ltta-mock.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Mohan", "last_name": "Ananth"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '2d60d559-ae6e-4c5d-8670-f5d9546feed4', '00000000-0000-0000-0000-000000000000', 'azizy.bhetasiwala@trane.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Aziz", "last_name": "Bhetasiwala"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '449597b4-d445-4925-8260-e1bd649e013d', '00000000-0000-0000-0000-000000000000', 'michael@barreyro.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Michael", "last_name": "Barreyro"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '2cffef9f-a7cd-479a-83ca-b0915b53bc59', '00000000-0000-0000-0000-000000000000', 'cgaard@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Christina", "last_name": "Baumgart"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'a5a971af-a98d-452d-8501-e09df9fe4233', '00000000-0000-0000-0000-000000000000', 'debbiebaxley@juno.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Deb", "last_name": "Baxley"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '1072d942-1719-44a4-8518-64ec338e59ee', '00000000-0000-0000-0000-000000000000', 'davidbleidorn@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "David", "last_name": "Bleidorn"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '2e408e39-7439-4ac5-8eab-a2ff0cd08348', '00000000-0000-0000-0000-000000000000', 'pkcoff@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Paul", "last_name": "Coffman"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '17567d10-27f5-452c-8bdd-909d8d5c32b3', '00000000-0000-0000-0000-000000000000', 'jackson.ehle@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Jackson", "last_name": "Ehle"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '30dc61f3-f2ba-4ad5-8d08-a40e0a66690b', '00000000-0000-0000-0000-000000000000', 'forddd9000@aol.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Dennis", "last_name": "Ford"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'ef705aae-d1aa-4b26-84ff-b29a831f0e54', '00000000-0000-0000-0000-000000000000', 'fordla9000@aol.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Lauri", "last_name": "Ford"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '7a2c9175-ee3a-40b5-8d83-2de16b3566a2', '00000000-0000-0000-0000-000000000000', 'eagleflight@charter.net',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Steve", "last_name": "Gilman"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '53c54195-02f4-4a0e-8b94-35d6cf7e9996', '00000000-0000-0000-0000-000000000000', 'thejosiahgreen@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Josiah", "last_name": "Green"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '1457fbd9-7d93-48f9-8c8a-9cb3c32de90c', '00000000-0000-0000-0000-000000000000', 'kegrey27@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Kaitlin", "last_name": "Grey"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'b042c9bd-c9fa-411c-8be4-7f68845c79e7', '00000000-0000-0000-0000-000000000000', 'amyharter66@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Amy", "last_name": "Harter"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'be932fb1-7921-4de0-8f14-8f65b74fd60b', '00000000-0000-0000-0000-000000000000', 'tjhemp98@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Tommi", "last_name": "Hemp"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '1a57d8bf-f68b-49c3-8938-bae1767dfd9e', '00000000-0000-0000-0000-000000000000', 'darleneisaacson@live.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Darlene", "last_name": "Isaacson"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '7221586b-7035-4a0d-8b25-31c91d53512b', '00000000-0000-0000-0000-000000000000', 'allison.kleman@ltta-mock.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Allison", "last_name": "Kleman"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'bff9bebd-afc3-4487-822c-10c1d48e3779', '00000000-0000-0000-0000-000000000000', 'sammar22@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Samantha", "last_name": "Marr"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'e0959c4a-075b-4cdb-844d-5252e9cedac5', '00000000-0000-0000-0000-000000000000', 'eem2912@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Eric", "last_name": "Marr"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '092b0c46-e62b-43c5-8846-4d54c5171b15', '00000000-0000-0000-0000-000000000000', 'ato222@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Aaron", "last_name": "Olson"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'f6a0c383-0e31-4539-85f5-6c3e5901ec5b', '00000000-0000-0000-0000-000000000000', 'akwarpinski@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Anna", "last_name": "Olson"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'c1c6da7a-7b62-4ea6-86bd-69b101bd73aa', '00000000-0000-0000-0000-000000000000', 'dpow88048804@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Dylan", "last_name": "Powell"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'b25d4438-8f35-40e3-83bf-9f168dcf35bd', '00000000-0000-0000-0000-000000000000', 'sneathryan@yahoo.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Ryan", "last_name": "Sneath"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '2e2b47c8-74e5-4d49-8098-56ff1cddc997', '00000000-0000-0000-0000-000000000000', 'dale.ralph@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Dale", "last_name": "Ralph"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '09fc46c9-cd36-497c-820a-d2d591a417f5', '00000000-0000-0000-0000-000000000000', 'druss0605@hotmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Dan", "last_name": "Russell"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'f226c6df-f099-4b1d-8c61-aa302ba407a2', '00000000-0000-0000-0000-000000000000', 'apvpcs@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Andrew", "last_name": "Vogel"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '2bc4171e-428b-48f3-8128-0b912c56691f', '00000000-0000-0000-0000-000000000000', 'jesshytry@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Jess", "last_name": "Hytry"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '39361013-3fc1-4a17-8a53-b8e8a8bc75a6', '00000000-0000-0000-0000-000000000000', 'bigleypool@icloud.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Donna", "last_name": "Brogan"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '9a4c3ed0-5787-4ae0-897f-a55fe566d983', '00000000-0000-0000-0000-000000000000', 'alexiscroox@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Alexis", "last_name": "Croox"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '6a0ce3d3-d1ba-44e1-88b3-e9063f253dd3', '00000000-0000-0000-0000-000000000000', 'davs912@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Polly", "last_name": "Davenport"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'd4dd8206-8e1f-4b2f-8cef-91e24c7954ea', '00000000-0000-0000-0000-000000000000', 'adrockxchw@yahoo.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Adam", "last_name": "Driscoll"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '94427a79-2d59-4d6a-84ec-73bad3e41887', '00000000-0000-0000-0000-000000000000', 'superjennylee1226@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Jenny", "last_name": "Lee"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '401e04d2-6a2d-4fc9-8188-a1fc86cb1ea8', '00000000-0000-0000-0000-000000000000', 'ttma2007@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "TingTing", "last_name": "Ma"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '0d6a9ab9-138e-4474-81ce-cef5cb63daaa', '00000000-0000-0000-0000-000000000000', 'samantha.marr@ltta-mock.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Samantha", "last_name": "Marr"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'c1f581c8-7e7c-475e-8712-f52108afaad6', '00000000-0000-0000-0000-000000000000', 'kimberly.phillips@ltta-mock.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Kimberly", "last_name": "Phillips"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'bb690970-0ba4-40b5-872a-ad3ce5e7f9f3', '00000000-0000-0000-0000-000000000000', 'laura.prosperi@ltta-mock.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Laura", "last_name": "Prosperi"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    '4f6dc9e2-cbdd-448c-8af7-f50ac360a470', '00000000-0000-0000-0000-000000000000', 'pattyrausa@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Patty", "last_name": "Rausa"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'a5a2d28b-f166-418c-8259-22aa32e45d55', '00000000-0000-0000-0000-000000000000', 'lwetterlin@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Lisa", "last_name": "Swenson"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'd8d75eef-7bf3-428f-8a24-906d621088a9', '00000000-0000-0000-0000-000000000000', 'catherine_tang05@yahoo.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Catherine", "last_name": "Tang"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
),
(
    'e6cc0ec8-217e-4ded-8183-46b9ac52a31d', '00000000-0000-0000-0000-000000000000', 'tomparr27@gmail.com',
    '$2a$10$TqyYtQpG2qK4vBq.lHjRmeS.67k91V1.1S2Lg9HlYQ91H99e91.e.', NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Tom", "last_name": "Parr"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
)
ON CONFLICT (id) DO NOTHING;

-- 6. Players
INSERT INTO "public"."player" (
    "id", "user_id", "first_name", "last_name", "email", "phone",
    "ranking", "is_captain", "is_active", "notes"
) VALUES
(
    'e209c7b9-0ac7-4c3f-800f-b2f06ab5602d', '70f8084a-68e2-40b4-8f1e-32042291d06d', 'Tung', 'Ouy', 'tung.ouy@gmail.com',
    '608 572 3325', 1, false, true, NULL
),
(
    'eb12017c-fb77-48f1-8909-70d17fd83fb6', '7f965026-b886-4b90-85d8-aa7ce7905154', 'Rich', 'Puent', 'richpuent@yahoo.com',
    '608 769 3206', 2, false, true, NULL
),
(
    'f940c065-045d-415e-81f2-4d995f4556b5', '9e2f4e99-9187-41e5-8029-846e26694358', 'Sai', 'Charan', 'charan.mathi@yahoo.com',
    '785 424 4984', 3, false, true, NULL
),
(
    '5b494ba0-f35f-4d50-8f58-88bc7d0e1b90', 'dd13b9dd-8dc6-4dcc-8f78-af497b99ba02', 'Isaac', 'Puent', 'isaac.puent@ltta-mock.com',
    NULL, 3, false, true, NULL
),
(
    'ed5e88f3-3861-4723-8b1f-278258fa1a98', 'c9fedc56-af91-4250-8977-51694f2bec0f', 'Molly', 'Stenger', 'mstenger6180@gmail.com',
    '608 797 7925', 3, false, true, NULL
),
(
    'bf93a669-a572-4c53-882b-6efaa02d05b7', '7a9e2b4f-21f8-4928-86de-e47072a318d7', 'Leah', 'Bower', 'lbower44@yahoo.com',
    '612 462 1458', 3, false, true, 'moved from different team'
),
(
    '074f45c7-d1cc-4cda-8f0c-73ab4e0412e7', '4cabf96b-4fd0-46cf-804e-b820349d0688', 'Jim', 'Brieske', 'jim.brieske@gmail.com',
    '608 386 1313', 4, true, true, NULL
),
(
    'b23c59c2-5726-49d2-8b54-70d3f04e5a64', '787db583-b984-4f6c-8b90-9d858467a2cd', 'Kalyan', 'Boyina', 'kalyan.satyadeep@gmail.com',
    '918 493 0512', 5, false, true, NULL
),
(
    '6e526980-b766-4126-8ff7-a08ccc452310', 'a4881b8e-6ac1-4775-8d46-6d7991b76bbf', 'Sawyer', 'Kuck', 'sawyerkuck@gmail.com',
    '952 381-4679', 1, false, true, NULL
),
(
    '1e4b4beb-fed9-490d-8956-e1f22555d135', 'd01d86f2-5522-40a6-8bfc-40ebabb819b7', 'Dave', 'Wissink', 'dave.wissink@ltta-mock.com',
    '608 397 3629', 2, false, true, NULL
),
(
    '8786c21a-f609-44a4-8d30-e2d17d3ee14c', '0286256c-6d27-4621-895f-67f46c5960a7', 'Dave', 'Mills', 'millsfamof6@gmail.com',
    NULL, 3, true, true, NULL
),
(
    '88b3cdfa-4c69-497c-8f2b-5cb9ab2e8f0b', '78d73bd5-ec79-4081-8d82-88d17b842eac', 'Amanda', 'Arneson', 'aareneson@trane.com',
    '608 397 4537', 3, false, true, NULL
),
(
    '2a2478d8-06d8-4a42-8e3c-c02f8d5e49f1', '2f45d8bf-38d7-4d1f-843a-04a18c46b91a', 'Kirk', 'Arneson', 'kirk.arneson@gmail.com',
    '608 397 4536', 3, false, true, NULL
),
(
    '6366e981-3101-4adf-805c-33b0e2a366aa', 'f2790a75-59a7-4586-82be-3879b1ca8a27', 'Stephan', 'Brettfeld', 'brettfsm@gmail.com',
    '608 461 1527', 1, false, true, NULL
),
(
    '3f80c7fe-9fa7-4df8-88cd-050d0b86b569', 'fc1864aa-3c23-44f8-81c1-b6660d59b86c', 'Joe', 'Gregas', 'jgregas@yahoo.com',
    '608 317 0010', 2, false, true, NULL
),
(
    '4756c879-1719-4cea-8d91-9fe5efdbe575', 'dc4f7d6a-5839-4b2c-8aea-eb4f8c7e13b0', 'Madeline', 'Loh', 'maddielohh@gmail.com',
    '608 799 0073', 3, false, true, NULL
),
(
    '6fcc4337-4ad4-42c2-8a23-1062a8dd90c3', '0ebc3a07-0d33-4f2c-8167-bed10b4250c5', 'Adrienne', 'Loh', 'tufficat@gmail.com',
    '607 227 2745', 3, true, true, NULL
),
(
    'baf5769d-90e2-4da5-8b93-0ee0bfe60b00', '89d7a188-dd9e-4849-8d8c-267482f02557', 'Stanton', 'Loh', 'stanton.loh@gmail.com',
    '607 592 9204', 3, false, true, NULL
),
(
    'c49cad23-a794-4d2c-8d28-e64ee442bfa5', '29927655-b80f-43fd-8c0a-f83bca96a1de', 'Malakai', 'Berget', 'malakaiberget@gmail.com',
    '608 738 7645', 3, false, true, NULL
),
(
    'afc148c0-0b24-4f0d-8530-32a776a946e6', '06de5dc4-9460-4ef5-8c89-f2b9e1cecafe', 'Kaitlyn', 'Northrup', 'kmgelbmann@gmail.com',
    '651 334 2495', 4, false, true, NULL
),
(
    'fa231168-9242-42f5-899c-01699bd3fe40', 'd6fdd4a0-21f2-41a0-81f8-367ec77dbd3f', 'Steve', 'Mydy', 'srmydy@gmail.com',
    '608 518 8508', 5, false, true, NULL
),
(
    '9750e4ff-7970-4082-8f03-532db15bdfff', '2180c5cb-5487-4318-886a-2b97293ce029', 'Greg', 'Schibbelhut', 'schigreg@luther.k12.wi.us',
    '608 518 0187', 1, false, true, NULL
),
(
    'b81caec2-439f-49a6-8563-783a2a19ecad', '794ecda5-a273-46ef-8a61-fad53e75e878', 'Dillon', 'Eddingsaas', 'eddingsa.dill@gmail.com',
    '920 285 0575', 2, false, true, NULL
),
(
    '032313b5-764c-441a-8650-4cee780f8f70', '3509a081-2066-4a4a-8c28-04de93e89fc1', 'Matthew', 'Isaacson', 'matthewjisaacson@hotmail.com',
    '816 678 8656', 3, false, true, NULL
),
(
    '7b702586-6720-4958-8c0d-e8e4449ac295', '8a02856a-2f38-43c8-8385-43931d474671', 'Mary', 'Aschenbrenner', 'marylaschenbrenner@gmail.com',
    '608 792 3860', 3, false, true, NULL
),
(
    '5e002bdf-2292-40ea-8a46-46d4d2ab9d40', 'ec39d0cb-dee5-4415-834e-7de655eef46e', 'Dale', 'Barclay', 'lacrosseusta@yahoo.com',
    '608 396 1259', 3, true, true, NULL
),
(
    'a458470e-dd26-43bb-8617-4d8357d86693', '06580ce1-e5f0-47d3-833d-29b3f216a91c', 'Rich', 'Levinger', 'rhlevinger@yahoo.com',
    '608 780 1913', 3, false, true, NULL
),
(
    '2968d29a-d312-4044-85e3-d9ccc5464412', '7f7503b2-38ef-4fcd-8317-dbb42bfcb12c', 'Judith', 'Engen', 'engenjudith@gmail.com',
    '608 797 5579', 4, false, true, NULL
),
(
    'eba90def-1869-4afb-8ed4-d7b77454fe07', 'a39786aa-51f2-4b68-86d5-ea55e1d8f950', 'Amanda', 'Wilke', 'amandawilkie98@gmail.com',
    '608 449 2999', 5, false, true, NULL
),
(
    'c8262133-3efc-4627-844a-e2c3d13fcb59', 'ffdc2042-740c-4c2a-8cf4-338dd0223751', 'Mark', 'Harris', 'mjharris84@gmail.com',
    '608 729 4419', 1, false, true, NULL
),
(
    '37b26af4-01ef-42a0-8c6a-2571b7b44a9b', 'cded44ff-ee44-4873-8ce3-1d02d038d24b', 'Nathan', 'Tunks', 'tunksnathan@gmail.com',
    '608 317 8347', 2, true, true, NULL
),
(
    '65b8c820-2026-4e55-8a44-66acf0e17302', '5b1759e5-91cc-4d56-88a8-9d0eb1950b99', 'Gavin', 'Goss', 'gavingoss13@gmail.com',
    '608 606 6365', 3, false, true, NULL
),
(
    'de949656-a5a3-458b-8f8d-48f739511ed5', '4f375033-68f0-4879-835c-7634aadc530f', 'Frank', 'Schwarz', 'fwschwarz@hotmail.com',
    '608 518 5400', 3, false, true, NULL
),
(
    '335c73a5-0808-48d8-8d2e-009da680ee5c', '87547b26-f67e-415a-8912-1bdb90f06a26', 'Nancy', 'Winberg', 'twinberg@aol.com',
    '507 993 8314', 3, false, true, NULL
),
(
    '9b5834d1-1f9e-4b80-8e62-220ceb2b36bc', '25f45923-dbc7-4a6e-8898-6a7eec61518a', 'Karie', 'Johnson', 'ryan.karie.johnson@gmail.com',
    '920 723 7477', 3, false, true, NULL
),
(
    '7618161e-6522-4f95-825b-a420218f4456', '74558594-af3d-46de-8d6e-1f9d80b71c0c', 'Kim', 'Thurk', 'thurkkim@gmail.com',
    '608 406 8835', 4, false, true, 'added to team'
),
(
    '3171bb71-42a7-4013-8b46-ab6ffde3ae06', '29206031-ac58-45cb-8389-c01ad39f96c6', 'Morgan', 'McBride', 'mmm91492@gmail.com',
    NULL, 5, false, true, NULL
),
(
    '658d461d-e6be-4f3f-8918-99509619bd55', '58af58e0-df0d-4619-8215-4a7a32150d95', 'Peter', 'Coppola', 'pcoppola6@yahoo.com',
    '608 386 4777', 1, true, true, NULL
),
(
    '35e4c6fe-b623-4c65-8285-7c2d241ed9b0', 'faf4321e-a249-4a82-8a46-176465adfb5e', 'Fritz', 'Wiggert', 'fritzwigz15@gmail.com',
    '608 386 3422', 2, false, true, NULL
),
(
    '5959f6b4-504f-4866-85e5-b51cca52a528', '1194452e-4660-4a02-8788-4a151a2d1a42', 'Ellen', 'Seithamer', 'seithamer@gmail.com',
    '608 289 0369', 3, false, true, NULL
),
(
    '9153df0f-58d3-4e56-80dd-f743d3060054', 'ac20675f-f953-411a-83ee-a1bda486cc96', 'Margi', 'Hanson', 'magsmpls@yahoo.com',
    '612 386 1358', 3, false, true, NULL
),
(
    '7c57d768-1997-4c6c-8bde-e440f22e1340', '6253e441-0dc4-4593-8d17-f71303274cb9', 'Craig', 'Hanson', 'hanz2116@yahoo.com',
    '612 220 1971', 3, false, true, NULL
),
(
    'e3eba457-bcb4-4aa5-8bad-f8bef7b006dc', '8f209af5-6936-47b2-8a8c-005489b8c366', 'Jason', 'Herbert', 'jason.herbert@dairylandpower.com',
    '703 622 2010', 3, false, true, NULL
),
(
    '636906e2-ef39-4a2e-89fb-27496cf3aa56', '1c8598c7-6aa6-47a8-8a35-1fefd9e97ae4', 'Erin', 'Herbert', 'erinkherbert@gmail.com',
    '703 795 8916', 4, false, true, NULL
),
(
    'e0fb1f18-579e-4989-8570-a01e9daa6631', '3e0873b8-f915-4ead-8f89-762b248a4023', 'Becky', 'Rauch', '8088rauch@charter.net',
    '608 797 0963', 5, false, true, NULL
),
(
    '45ee3124-c7ca-453a-87e0-55a0b20b36d2', '1942fbe8-ce72-46b8-8489-f280ce31a03e', 'Paul', 'Jacobson', 'pandrew77@yahoo.com',
    '608 317 7640', 1, true, true, NULL
),
(
    '7bb4a303-807d-4e5f-82d7-6b4f79ce7183', '5e0d5989-99fd-4b01-837d-3e0454bdcc9c', 'Brennan', 'Quinn', 'brennanjquinn@gmail.com',
    '608 792 6780', 2, false, true, 'added to team'
),
(
    '54221383-2b98-49a2-86a2-63e8aab9145c', '6addd815-2a50-4984-8e36-c81f4025f755', 'Don', 'Harvey', 'dondharvey@centurytel.net',
    '608 385 7684', 3, false, true, NULL
),
(
    '8211bd9f-ec22-47c1-8184-ba799e29cb37', 'e628fdbd-5ed9-45d5-82bb-e706afd90ecc', 'David', 'Lange', 'dllange@charter.net',
    '608 790 2813', 3, false, true, NULL
),
(
    '1c7bd05d-1b8a-4adb-850e-32dbe46d80b9', '95d28468-20f2-4915-883c-4c409070f6b5', 'Larry', 'Ruff', 'lruff@ticinsurance.com',
    '608 304 1596', 3, false, true, NULL
),
(
    '983c3872-e42d-4454-8f33-ea05b98fcc21', '9aa96ea1-f9d6-450d-850f-7998c24fe385', 'Cory', 'Ruud', 'coryruud@gmail.com',
    '541 207 7904', 3, false, true, NULL
),
(
    '16bf7161-a3f9-4a86-8be5-442b351d9202', 'fb1a6824-e677-41c0-8fad-f7c361671258', 'Pennie', 'Pierce-Jorgeson', 'penniepierce2@gmail.com',
    '608 317 0684', 4, false, true, NULL
),
(
    'e314d427-6e5f-411c-8e4b-c4809fd47803', 'ce537244-dbc4-498c-8c03-23309723c258', 'Sally', 'Ruud', 'sallyruud@charter.net',
    '608 317 1982', 5, true, true, NULL
),
(
    '918ff6f4-3774-4b40-88db-8eb029f375e7', '18654518-04e1-4ffa-879b-d5b4ad5d51fc', 'Denny', 'Kreuser', '4953drk@gmail.com',
    '608 526 3321', 1, false, true, NULL
),
(
    '5c78a4b2-c9f8-4c4e-8d9c-414925a49fbe', '5b49d316-fbce-454d-88f8-e49f04ab5d0f', 'Paul', 'Leithold', 'paul.leitholdmusic@gmail.com',
    '608 317 2524', 2, false, true, NULL
),
(
    'b2c9235d-250f-4d24-834b-6796d472d565', '45555c53-986f-4d8b-832f-fb87e31ec9c0', 'Sara', 'Bieneman', 'sarabieneman@yahoo.com',
    '262 417 5784', 3, false, true, NULL
),
(
    '0d15342f-c238-4f42-8464-0696cb39cc30', 'be3542eb-6c73-42a5-8864-2c6b260b9c7e', 'Missy', 'Marcus', 'marcus.missy5@yahoo.com',
    NULL, 3, false, true, NULL
),
(
    'b018152e-511f-4738-887b-2f10864ac1fa', '14a2d544-e4ec-4cb5-8005-ceaaa3a51075', 'Julie', 'Kamla', 'juleskam57@gmail.com',
    '608 792 6918', 3, true, true, NULL
),
(
    'b2b6f8b4-3ec8-460e-8b0c-b5b3baab9ab8', '1182a965-51c5-4131-8d92-08115556e53e', 'Asher', 'Helgerson', 'msasher05@gmail.com',
    '6083045816', 3, false, true, NULL
),
(
    '0f6dd0b7-8ad2-48d2-821c-0cd3c8118c0b', 'a8a980ce-54b0-4a81-8f14-d3598bcf92ee', 'Catherine', 'Roraff', 'croraff@charter.net',
    '608 769 2215', 4, true, true, NULL
),
(
    'ee1b4799-e47e-4350-8df0-d9b597e0305a', 'a1bef002-6977-4942-8bc0-4cc42a698ef5', 'Mary', 'Leithold', 'mhoeftleithold@gmail.com',
    '608 790 2524', 5, false, true, NULL
),
(
    'b8a2dd08-e7a5-4b7a-838c-3af89193c0bf', 'e49d617a-abf6-4379-83c2-cfd3f5df1757', 'Yubo', 'Nian', 'nianyb@gmail.com',
    '608 881 1818', 1, false, true, NULL
),
(
    'd3dd9417-e229-464f-85ed-59162cdea8b2', 'bdf33d1a-8db6-4ddf-855d-d29c1a4391de', 'Matt', 'Diehl', 'diehl.mattp@gmail.com',
    '608 370 9703', 2, false, true, NULL
),
(
    '3deaa355-e57b-4da8-86a3-b5a5a6823b63', '9476ac16-5a2a-4431-80fb-0f65f20fcec9', 'Tom', 'Dwyer', 'tdwyer8989@gmail.com',
    '815 904 0008', 3, true, true, NULL
),
(
    '12c46b24-6451-4aa8-8751-86d2ef5bcb03', '07406065-524e-4866-8788-ab1c339ff1a7', 'Mike', 'Roscos', 'roskos.mcr@gmail.com',
    '608 386 7158', 3, true, true, NULL
),
(
    '2d636d8d-ab43-4dc9-8e33-71ff748acfe7', 'af4360e8-52d7-4bba-8a2b-46c687790b5b', 'Sean', 'O''Flaherty', 'soflaherty@lacrosselaw.com',
    '608 792 0192', 3, false, true, 're'
),
(
    'd8675929-49d4-478f-8395-cccf04a2f3e5', '875044ce-393a-494a-86b3-1a3395d0d557', 'Dan', 'Skemp', 'danielskemp@hotmail.com',
    '608 790 5410', 3, false, true, NULL
),
(
    'fc4943a6-df18-4a22-888f-530a7a90748b', 'ec63f65c-b528-4807-84b2-a9232b5d3d24', 'Joe', 'Kotnour Sr.', 'joanko34@aol.com',
    '608 498 6177', 4, false, true, NULL
),
(
    '5fb2cf9a-9e94-42a6-8940-25912bb55cc8', 'dbfaa16d-f435-41b2-8fd7-70d5f3ca6fc2', 'Ann', 'Kotnour', 'ann.kotnour@ltta-mock.com',
    NULL, 5, false, true, 'new to team'
),
(
    '47c44052-2a62-4738-8d14-66a85385c5c3', '4ce63882-f326-4803-8088-8c6f2f6459a7', 'Drake', 'Wonderling', 'wonderlingdrake@gmail.com',
    NULL, 1, false, true, NULL
),
(
    '6871578e-f59f-4227-85aa-1cc0835437fb', 'befb2d07-e0b4-412f-87f0-dfe4a43d2b83', 'Corey', 'Stauner', 'stauner.core@alumni.uwlax.edu',
    '608 799 6891', 2, false, true, NULL
),
(
    '46fb67a7-05ea-4f9f-8d11-7d7aa49b5920', '7450cbf3-10a6-4010-8707-b019c150472f', 'Dane', 'Smith', 'dane.smith@ltta-mock.com',
    '608 386 1064', 3, false, true, NULL
),
(
    '48a554f1-d610-4857-80d2-5b794d1371cd', '2148caeb-b909-42b5-82cc-a9a98693f6c2', 'Dan', 'Petersen', 'danieldrp@charter.net',
    '608 386 7333', 3, true, true, NULL
),
(
    '487d53a6-a4d9-43ed-8a9d-48a5dbb6a1e0', 'd731837a-5efa-4935-8903-9e0c5c291882', 'Shirley', 'Yuan', 'xyuan6388@gmail.com',
    '608 304 6921', 3, false, true, NULL
),
(
    'df5d57ca-9ab1-47c4-80ec-c6206ac7b3aa', '3c3341dd-4de7-48b4-84e7-2534e8b0d035', 'Tyler', 'Benson', 'benty613@gmail.com',
    '907 314 2004', 3, false, true, NULL
),
(
    '9db17513-a260-4902-8c45-200c1326c72f', '1c110d7e-276d-4b0c-8b58-01e0b8af6bd6', 'Reagan', 'Warren', 'reagan1223@yahoo.com',
    '817 271 6593', 4, false, true, NULL
),
(
    '06e05461-4c60-4ee8-83fa-d8d375dd2b4a', '7c80e1e7-26f2-4590-8adc-0a8ffd15e839', 'Jeff', 'Herde', 'jherde18@gmail.com',
    '717 299 1572', 1, false, true, NULL
),
(
    'd292761d-9dd4-4098-8efb-9e0a1f7a3422', '02998209-3cf3-4883-8ca7-d0db6dca6fc3', 'Cole', 'Lapp', 'colelapp365@gmail.com',
    '608 797 3112', 2, false, true, NULL
),
(
    '2e1fa11f-d9ab-4685-8878-c36ee365c265', 'cf71f8db-66b1-4bce-8e22-b5284f05d4cc', 'Bill', 'Lapp', 'billlapp@aol.com',
    '608 317 8219', 3, false, true, NULL
),
(
    'ef465608-a3e0-463d-8914-8d523bf65b26', 'f8366d56-4ae9-4f7c-8db6-4839494d77ea', 'Regina', 'Jones', 'regina.jones@irco.com',
    '608 385 5359', 3, true, true, NULL
),
(
    'e9bc7b31-0a25-4eee-8d80-a737ab675986', 'e0ab8da5-6ada-4492-89d5-7de6cffe1020', 'Sam', 'Schmidt', 'samuelhschmidt@gmail.com',
    '608 234 1214', 3, false, true, NULL
),
(
    '970a64c0-3439-4fa3-8d93-eedc1bc2b8d6', '47c171c2-d23e-4a5a-8192-822af833a167', 'Hannah', 'Exner', 'hannah.exner@yahoo.com',
    '262 290 7890', 3, false, true, NULL
),
(
    'f3c663ca-a0a3-44cb-8401-379a2a58855a', '317ba4e9-b44f-44bc-8131-cb80ec8f6648', 'Sarah', 'Gang', 'gang.sarah4@gmail.com',
    '608 333 9772', 4, false, true, NULL
),
(
    'd1908c58-34df-4f51-89d3-d95c940d4538', 'd4be146a-7fa7-4b5f-8591-28b9a6469346', 'Morgan', 'Brazil', 'mobybrazil.mb@gmail.com',
    '507 458 1804', 5, false, true, NULL
),
(
    '213b4cb9-e1de-41e0-8f2c-16dfbec596a2', '9d7f6e18-507b-459f-833b-dd42691190a6', 'Brian', 'Mansky', 'bmansky@gmail.com',
    '715 972 0026', 1, false, true, NULL
),
(
    'd6d9fc7a-de2b-4d9f-839c-aab394128383', '98649551-bad0-483a-8dd5-af6540666aa3', 'Ryan', 'Mullaney', 'm.rp74@yahoo.com',
    '608 792 8413', 2, false, true, NULL
),
(
    '5a53725b-2082-4d68-8363-b98a075a5558', '2e4801b8-266d-496a-8f53-b9199d93cf68', 'Heidi', 'Barreyro', 'lubimi@centurytel.net',
    '608 797 6457', 3, true, true, NULL
),
(
    'c01065bd-c55e-4a05-84d2-9d0ae44a7bf3', '31d9b19a-c84c-44da-8fca-8b84b8ff909c', 'Shanon', 'Torgerud', 'shantorg42@gmail.com',
    '608 790 3706', 3, false, true, NULL
),
(
    '6cbb5558-9405-457e-8322-082c088e7249', 'bb5222e6-a95a-4749-8c29-0a8c965afeed', 'Odessa', 'Barreyro', 'barreode@gmail.com',
    '608 780 4058', 3, false, true, NULL
),
(
    'aae1c364-7919-467e-843f-dd3d0ba94c76', '4e2aa287-3740-4387-88f5-7ccfa693e669', 'Katie', 'Johnson', 'johnson.katie2005@gmail.com',
    '605 777 2217', 3, false, true, NULL
),
(
    '60b57e6e-0733-46aa-819b-c33aa6e28642', 'a7b294a5-387e-442f-8f08-da60f777b8e7', 'Amit', 'Mishra', 'amiteshm55@gmail.com',
    '313 802 9111', 4, false, true, NULL
),
(
    'ae0ac4b0-4bdf-46ca-8009-6e2ce88d15a7', '4ed45237-8e66-4251-8a8a-b9a55b24196f', 'Dwight', 'Mills', 'sllim.dwight@gmail.com',
    '608 386-3720', 5, false, true, NULL
),
(
    '7c1639b9-e097-474e-8ada-cec5d2d8793c', 'c1308664-a1f2-4c1f-84e1-6f74e3a58cad', 'Pheng', 'Lo', 'plo722@gmail.com',
    '6088657834', 1, false, true, 'new to team'
),
(
    '4cef8eff-c67d-4671-8c57-32d4b9298c59', '1a9b5223-631d-4cd6-8179-30f06e54b181', 'Dan', 'Lewis', 'danlewispiano@gmail.com',
    '507 676 3998', 2, false, true, NULL
),
(
    '78b4b6a5-9fb1-4fe8-8343-fa51b032e3af', '5ad4e34e-0e2a-4fc5-8e78-40eaff595857', 'Joe', 'Heer', 'joe_heer@hotmail.com',
    '507 459 3789', 3, true, true, NULL
),
(
    '94ef7b04-7b39-4f95-8179-c5c333ab8217', '164e78b0-6625-498b-8d18-76056ef93a9b', 'Janice', 'Hoeschler', 'jhriver@mac.com',
    '507 858 9293', 3, false, true, NULL
),
(
    'd0a4a3c1-cee8-41a3-8468-a4e76137d7ad', '671c4f12-bf30-4542-8674-74019f1787e9', 'Jeffrey', 'Schott', 'lacschott@charter.net',
    '608 317 8180', 3, false, true, NULL
),
(
    'aa03065a-fe4f-447f-8fe2-3b53e58a2a10', 'c297b716-4da8-4a0a-83c6-73e40fcea382', 'Nikki', 'Nakano', 'subtendor@hotmail.com',
    '608 386 4189', 3, false, true, NULL
),
(
    'a8d728ad-8fd0-414a-85c2-14e7d925e44e', 'e60e0c94-f85c-4be9-8e6c-db1aeb495515', 'Lora', 'Cadwell', 'lovelatte50@gmail.com',
    '608 790 5997', 4, false, true, NULL
),
(
    '1a9d3ec6-86de-4947-8065-d3041eb5bf4e', 'ddf31196-083f-48fd-82a0-64370712cd5b', 'Barb', 'Buswell', 'onabus99@gmail.com',
    '608 769 0602', 5, false, true, NULL
),
(
    '6edc2d93-0de5-4335-8a84-c2c31bd18736', '98160638-0cf0-4563-8a71-164aa71c91e1', 'Brett', 'Meddaugh', 'brett.meddaugh@gmail.com',
    '907 980 1293', 1, true, true, NULL
),
(
    '500d494c-0c46-4730-83ba-82d41b17d640', 'd2664bda-409d-4c38-81fd-ff3ab4f17fa1', 'Meredith', 'Holt', 'meredholt@gmail.com',
    '608 385 8178', 2, false, true, NULL
),
(
    '0879719f-271c-42d2-8b35-898c07cc8ade', 'ae9927f0-9bda-4b6d-878d-244aeaacbd9a', 'Ronghui', 'Chen', 'pokeworld.vvm@gmail.com',
    '917 292 8345', 3, false, true, NULL
),
(
    '3bf4b677-8f55-4c0c-8aa7-ab42fc2a7b5f', 'a78de660-3223-4206-8a04-ce8470d5b04b', 'Kayla', 'Holman', 'kholman502@gmail.com',
    '608 769 8431', 3, false, true, 'sharing a spot'
),
(
    '3c9b1cce-1b3e-4d02-86b8-ecd88ba0c314', 'bd257186-37b3-40e3-8289-d5713ec5ab7f', 'Kelly', 'Gorres', 'kelly.gorres@gmail.com',
    '608 658 9375', 3, false, true, 'sharing a spot'
),
(
    '3eadd7f4-28a3-4510-8bdf-ca6d5c876d26', 'cfb18aee-f0f4-48a1-888e-6d8219345ce6', 'Mason', 'Engebretsen', 'masonengebretson@gmail.com',
    '608 799 9647', 3, false, true, NULL
),
(
    '8b865870-fef6-4ad8-8324-d9ea7a2049bc', 'c812a739-60ea-4ecb-8d43-ff7c8ff8bf8f', 'Isaiah', 'Dahman', 'i.dahman01@gmail.com',
    '608 799 7480', 3, false, true, NULL
),
(
    'cc121819-30dc-4f9a-8bf8-0ae07ace3dda', 'f0ea1da5-5049-4b76-8984-0291bd706781', 'Sam', 'Hinton', 'shinton@tranetechnologies.com',
    '608 792 3469', 4, false, true, NULL
),
(
    '6a11f32a-f27a-4187-8a2c-192a90106da7', 'c8bb5f79-89bf-48b1-8e5e-a2834ba42dc2', 'Caleb', 'McClung', 'caleb.mcclung@gmail.com',
    '608 797 9058', 5, false, true, NULL
),
(
    '82603afb-40c8-420b-869e-3e131acf65df', '1c160c48-d1ac-41ce-85c4-e09d82ccbc8a', 'Sheldon', 'Lee', 'sheldonhlee@gmail.com',
    NULL, 1, true, true, NULL
),
(
    '46bc0d77-2fe4-48a3-85fc-9962ca174ab6', '319efc77-4408-48e3-8d8f-6393df46a0a6', 'Kyle', 'Deyo', 'mrcrashkd@gmail.com',
    '608 397 2152', 2, false, true, NULL
),
(
    '63597f8c-dfc6-475e-8cc2-bfb832a28fbc', 'ccd5cc26-780f-47e6-8f8d-9c4e1400eb7c', 'Michael', 'Current', 'michael@mcurrent.name',
    '608 397 3153', 3, false, true, NULL
),
(
    'a9eedc85-ee19-4cf4-8ac9-2c4f4d5f882b', '303fef36-e6b2-411e-88eb-d25c6eaba8c7', 'Christine', 'Lee', 'ch.stins@gmail.com',
    '608 863 0092', 3, true, true, NULL
),
(
    'f7aa55a7-0180-4f88-8422-e2e977e8755b', 'fd788afa-7f94-4abd-81ad-8ba266c25d7e', 'John', 'Sullivan', 'tnjohnsullivan@gmail.com',
    '715 441 0699', 3, false, true, NULL
),
(
    '73bfe70d-898e-4159-8b6a-bae3a5a730fa', 'a0babb73-a70c-4569-8e47-8336e0c14cdd', 'Anna', 'Rydeski', 'anna.rydeski@gmail.com',
    '715 921 4436', 3, false, true, NULL
),
(
    '39394b5f-ef68-4bef-8f5b-80981114ac91', '38fd53c2-e629-4dfc-85ec-41deb1a55e8e', 'Michelle', 'Ottum', 'mkodesignart@gmail.com',
    '608 386 2716', 4, false, true, NULL
),
(
    'd23bc1c4-5a45-4c49-8250-8a00539ba9a9', '7c5e00ea-10f4-4002-8d0f-f60129f8ff45', 'John', 'Kelly', 'jkelly@uwlax.edu',
    NULL, 5, false, true, NULL
),
(
    '51cbb930-4de6-4b04-8f75-5e0ffa48550f', '547aaf31-95f1-4a51-8dc0-99159546bac0', 'Laura', 'Reutlinger', 'reutla01@yahoo.com',
    '563 419 0372', 1, false, true, NULL
),
(
    '66072751-397d-48ed-82a2-21100ad1ed1b', '35380cd1-5c6b-41b3-87e3-aed2ed999f3b', 'Roxie', 'Anderson', 'randerson529@gmail.com',
    '414 659 0770', 2, true, true, NULL
),
(
    '77d7a169-6b7f-49ac-8d93-f191a589b377', '64db7079-606a-4dd3-834d-fe72ea01be9e', 'Chris', 'Kahlow', 'c_kahlow@yahoo.com',
    '608 448 5114', 3, false, true, NULL
),
(
    '0b5c9731-7099-4405-8cdc-a8ba4c6d4382', 'c14ab963-4db9-40bb-8795-d3b3ad496f32', 'Taylor', 'Nelson', 'taysnelson20@gmail.com',
    '608 575 1733', 3, false, true, NULL
),
(
    'f3db05a1-d841-4d34-829f-7b43b3042e0f', '74435b8b-5df2-43ea-8267-2f85dfd0a54c', 'Payton', 'Demeyer', 'paytondemeyer1@gmail.com',
    '620 644 2289', 3, false, true, NULL
),
(
    '7373b184-0312-4bc4-8149-b17a56d6266b', 'a60d8187-a48a-4225-8358-2b2b2dc2dda7', 'Tia', 'Leen', 'tialeen@outlook.com',
    '320 339 1897', 3, false, true, NULL
),
(
    '2d1ab2e0-5d27-4c1f-873c-a6420599d827', 'f53884da-7f6e-4ec4-8e1a-0fc67094ad83', 'Mike', 'Leonard', 'leomnm@msn.com',
    '608 860 5230', 4, false, true, NULL
),
(
    '07015459-b161-4494-8e7d-7380d73116ad', 'dfc0e130-3322-4a47-8132-0f4e6eb8749e', 'John', 'Noble', 'johnn@nobleinsurance.net',
    '608 343 1229', 5, false, true, NULL
),
(
    '88319f71-061f-4156-8ac6-d01f36a12859', '982ab8f3-33ef-4647-8d81-2bd73a5ae417', 'Mike', 'O''Neill', 'laxoneills@charter.net',
    '608 769 0888', 1, true, true, NULL
),
(
    'ec3cbc63-fb68-4504-883c-786e0271877b', '493424df-b05a-4d74-849a-2475761c5c0c', 'Mike', 'Fahey', 'debmikefahey@gmail.com',
    '507 459 6542', 2, false, true, NULL
),
(
    'cbe52322-998a-49c9-89f4-51ca09d10468', '4fcda52b-795c-412b-8a7a-efecd43f2f9d', 'Zach', 'Acklin', 'zach.acklin@gmail.com',
    '608 787 4547', 3, false, true, NULL
),
(
    '2794cba8-7fb3-40a8-893b-10465b4651eb', '7813a578-a40e-4d5f-82d0-6d8dfb31f72e', 'Laura', 'O''Neill', 'laurono@charter.net',
    '608 769 0882', 3, false, true, NULL
),
(
    '57eb6a97-63f5-4e94-8446-0eee1caa2b46', '3510b695-f0e3-42fe-8244-eb6e1624f5d4', 'Amy', 'Valentine', 'amyvalentine011@gmail.com',
    '608 386 8599', 3, false, true, NULL
),
(
    'b0b9a722-acc8-4c68-8e97-bb7eca45084d', '3808369e-65d9-49a9-882c-52f82f7fabf1', 'Tim', 'Acklin', 'timothyacklin@gmail.com',
    '608 797 0050', 3, false, true, NULL
),
(
    'd7d00b98-46a3-40e4-8cf7-bada0c804181', '0054133b-7022-4002-8ac3-7785c365206e', 'Sarah', 'Meyers', 'srosew10@msn.com',
    '608 792 7223', 4, false, true, NULL
),
(
    '14e83cc9-42f7-474a-8e81-032837a052a5', '43b4496a-793a-491d-8d46-3a29550b9a77', 'Nathan', 'Crowder', 'ncrowder@gmail.com',
    '479 531 3449', 5, false, true, NULL
),
(
    '31aabd69-c25f-47f9-8392-554ed5fce502', '034d5f22-bf87-4454-8bf1-71183943dc12', 'Mike', 'Meyers', 'meyers.michael@mayo.edu',
    '608 797 6991', 1, false, true, NULL
),
(
    '99e598eb-64fa-4e9b-8c60-a24cb7552255', 'd0ef5c81-b5a5-470a-85af-3dc14c2db1ce', 'Brian', 'Day', 'brianday99@hotmail.com',
    '608 461 0438', 2, true, true, NULL
),
(
    'e0ce6763-87ea-4c49-8ad6-95c4b378e054', 'dcc5935c-46b4-4335-8411-e17cd380f108', 'Shira', 'Busch', 'busch.shira@gmail.com',
    '608 397 2717', 3, false, true, NULL
),
(
    '7df72c08-6110-4e53-85fa-5b1de6e72ad7', '36f5b1cc-32e5-4938-812f-7b5ffe3c7b45', 'Janeen', 'Day', 'janeenday64@gmail.com',
    '608 783 7503', 3, false, true, NULL
),
(
    '3d01e0b0-22dc-4d81-80f3-2c30981e2f8d', '51d0c3fe-dca9-4ff5-83b5-a8217ae23a8d', 'Paul', 'Holman', 'pholmanlax@gmail.com',
    '608 788 6056', 3, false, true, NULL
),
(
    'c05e5bdd-cf4e-44de-809e-9cf17a44d775', 'fdab48a7-da73-486a-8e8b-621165942ba1', 'Austin', 'Stalsberg', 'austin.stahsberg@gmail.com',
    '608 881 9118', 3, false, true, NULL
),
(
    'cd4947b5-975f-4261-888b-c064f06e6d8e', '0256b749-f35b-4681-8cfe-226b6298c7eb', 'Lisa', 'Flottmeyer', 'jlfloppy@gmail.com',
    '608 386 1040', 4, false, true, NULL
),
(
    'a41a3653-9b11-4b34-8877-fbf2a75ef258', '90cf6f85-7c63-4648-8965-ab77ebe72c19', 'Gretchen', 'Coleman', 'gmcoleman@ymail.com',
    '608 769 6528', 5, false, true, NULL
),
(
    '8e4d91c2-c560-4bb3-8942-c16da327fe47', 'b35a1f69-558e-4497-87e0-15abe390ddf6', 'Mark', 'Hoff', 'reallylazymark@yahoo.com',
    '608-386-9310', 1, true, true, NULL
),
(
    '9b2b91a7-f95a-4bf3-8089-7d4e8d7b3bf8', 'e6883e73-5b01-472d-8298-9fe18b2ca298', 'Randy', 'Moseng', 'randydoc7@gmail.com',
    '608 792 6780', 2, false, true, NULL
),
(
    '92ec6727-b7a6-4cd7-83ed-b80180821840', 'fa23c346-4060-4adc-84a8-2548142b706b', 'Luke/', 'Emily Bussiere', 'bussld07@gmail.com',
    '906 221 5190', 3, false, true, NULL
),
(
    '974f56b2-9586-4ac2-881a-b6f93cfb3107', '4c9a50d5-7a9a-4c30-8755-8e60790d7283', 'Franklin', 'Greene', 'franklingreene19@gmail.com',
    '608 385 6751', 3, false, true, NULL
),
(
    '3b260ae5-4b3b-45a4-8161-3291bf1c7d71', '57026613-2682-419c-8663-49c498f3570e', 'Nicole', 'Hoff', 'nhoff377@gmail.com',
    '608 386 2605', 3, true, true, NULL
),
(
    '35749af6-20a5-44ee-8ee7-991a2f81bc7d', 'eebf1ba9-6b98-45d9-8e75-64b7b49a80ba', 'Michelle', 'Rank', 'michellerank7@gmail.com',
    '608 797 3138', 3, false, true, NULL
),
(
    '0463e7ad-aeae-47ac-83de-b3cc81aa6aae', 'ab400457-a499-4281-8c6d-d31025406f3d', 'Sharon', 'Harter', 'sharonjharter@gmail.com',
    '608 784 6803', 4, false, true, NULL
),
(
    '95224ea2-c009-49fd-8faf-3e8a7ac7b10f', '128189f1-439a-4900-8f66-653772b50254', 'Gary', 'Harter', 'gharter@harters.net',
    '608 304 0619', 5, false, true, NULL
),
(
    '6ad8bfb6-b0a3-4999-8ff9-330c6e4db443', '6e1ccbed-393e-4fa8-8bbf-40e05f55ea5b', 'Gina', 'Nelms', 'dahlgl17@gmail.com',
    '920 222 9221', 1, false, true, NULL
),
(
    'f37c4156-7310-49d2-8f60-9dcdfd3b28fa', 'c6e00d05-e5a0-4cc4-88bd-21834f84dc70', 'Brian', 'Spier', 'b2014s@icloud.com',
    '507 251 8744', 2, false, true, NULL
),
(
    'ff031acd-a327-479f-8a47-03758dd9c079', '08f5c7e4-4f80-4491-8762-7dd652e06a49', 'Dan', 'Grilley', 'grilley@gmail.com',
    '608 881 4554', 3, true, true, NULL
),
(
    'b83e3422-24c0-4f88-8c29-b13feed23054', 'add08119-269e-4138-8d3c-99baa15bd8fd', 'Ben', 'Haenni', 'bhaenni@uwlax.edu',
    '608 960 6204', 3, false, true, NULL
),
(
    'cd501b6e-e04d-4d39-8ebe-580ba2e2772f', 'ee51792d-45b9-4621-8eca-662549ea0b9e', 'Tamara', 'Byrne', 'fraubyrne@gmail.com',
    '608 406 8438', 3, true, true, NULL
),
(
    '5ed06a6e-ad49-4f4d-8622-dfbcf8e3f9f9', '88c06d7d-a5fd-46c3-83f8-25c9c8dbe896', 'Josh', 'Neukom', 'jdneukom@yahoo.com',
    '847 373 2770', 3, false, true, NULL
),
(
    '77ba2623-1ecf-4070-838e-f9d42bd1901f', '66a65a1b-1274-41dd-8e19-82f651bbbf9a', 'Basu', 'Bhattacharyya', 'bbhattacharyya@uwalumni.com',
    '608 957 1421', 4, false, true, NULL
),
(
    '37afd582-49ff-4502-8aa2-51bf1450aa0a', '2a29a2c2-6478-4159-82a4-402e655c090c', 'John', 'May', 'jmay439@gmail.com',
    '608 695 2655', 5, false, true, NULL
),
(
    'ed7e9c69-f6b5-4aec-8f35-c1632ef4ae54', 'f0ceda64-e3ef-49b3-8dfd-ca41ea90eb08', 'John', 'Hildebrandt', 'jrhildebrandt39@gmail.com',
    '608 359 9161', 1, false, true, NULL
),
(
    'e3ee14f9-a8b6-47cc-83d6-453a627c1637', '21bb6155-b9db-4e72-816f-fc0b2d1508f0', 'Dan', 'Bodelson', 'dvbodelson@gmail.com',
    '608 515 5003', 2, false, true, NULL
),
(
    'c57312de-d279-43ec-87f1-b321a39f09fe', '07945dac-0094-40d6-8331-1d0ea2d900a2', 'Dick', 'Deml', 'dickdeml608@gmail.com',
    '608 461 0632', 3, false, true, NULL
),
(
    '5f997464-21cd-40ec-8ce3-a221e82ef911', 'b9882df8-182e-4380-8d2a-5e6bde8c3734', 'Al', 'Graewin', 'agraewin@aol.com',
    '608 782 7284', 3, true, true, NULL
),
(
    '5dff312a-54a5-4e41-85c8-c1e19a6237fb', '27245977-4a6e-45c2-8a24-8d9e870afdf9', 'Jim', 'Ballas', 'ballasj@centurytel.net',
    '916 799 4746', 3, false, true, NULL
),
(
    '3c2be2db-2df8-4802-8c91-b79ea85c132d', '16d4acbc-e360-40db-8dc7-b4757381f820', 'Bob', 'Hildebrandt', 'barbrb2002@yahoo.com',
    '507 217 1086', 3, false, true, NULL
),
(
    '847ab7b9-4c47-4224-843f-891c9633fb50', '1afa7a47-3c13-48eb-8383-c07d316cae93', 'Terri', 'Kaiser', 'terrijk@charter.net',
    '608 783 0959', 4, false, true, NULL
),
(
    'fefac696-a25e-419f-88a5-cfabd43c2f5d', '3cc7f91d-966b-4d3f-8c82-1c02887500f4', 'Jill', 'Graewin', 'jill.graewin@ltta-mock.com',
    '608 782 7284', 5, false, true, NULL
),
(
    '983c76f0-7458-44e4-80cb-9dd2837a3246', 'df4a4d59-fc4d-4019-8e16-31d0a4655a0e', 'Leah', 'Fortun', 'leahfortun@hotmail.com',
    '608 780 6195', 1, false, true, NULL
),
(
    '43d2c08f-0581-4763-84bf-6466cf2e4717', 'af32162b-d204-43db-80b7-e9126d1ff9a1', 'Josh', 'Fortun', 'josh.fortun@ltta-mock.com',
    NULL, 2, false, true, NULL
),
(
    '4d008344-6a34-4209-8649-3f47cf6d556e', '86f65343-a528-4c84-845a-069652d76164', 'Jennifer', 'Carr', 'carrcrew5@gmail.com',
    '608 797 1708', 3, true, true, NULL
),
(
    '9754dc36-98f5-41ee-83d5-a48f768f655c', '36f5af33-3cc9-446b-880d-c2ae1b13f4ab', 'Amy', 'Marcou', 'marcou4@charter.net',
    '608 799 2013', 3, false, true, NULL
),
(
    '29088b70-1439-4693-83eb-0e2f72812635', 'aa3990ae-d7c0-44b7-8b34-909d3336d04f', 'Michael', 'Ojelabi', 'moojelabi@yahoo.com',
    '608 461 1858', 3, false, true, NULL
),
(
    'a4ea1d91-cd43-4a7e-8923-fafc01827b6a', 'd7d84287-e123-41ee-8ad7-e551ea5d317f', 'Marc', 'Crosby', 'macrosby@emplifyhealth.org',
    '801 703 3201', 3, false, true, NULL
),
(
    '6625e3ad-0206-4302-890a-54fae281abc2', '34cf7e47-c8ba-43c9-86f9-7b40b63a54e5', 'Eli', 'De Leon', 'jerverdeleon@gmail.com',
    '503 906 0564', 4, false, true, NULL
),
(
    'da51e2b7-db91-462d-877d-8a72dce3fe1c', '784dc87e-ce08-4b4a-8b88-ced577505f35', 'Irene', 'Johnson-Salvador', 'ijsalvador1@gmail.com',
    '651 235 9862', 5, false, true, NULL
),
(
    '8add4497-c41b-4edb-8ffc-fbdbf0908905', 'c26f8886-26c6-4196-878b-9062e2978a41', 'Kurt', 'Gutknecht', 'kurt@gutknecht.ws',
    '608 304 9524', 1, false, true, NULL
),
(
    '12355085-528a-4192-8d3c-693fe0c42e1e', '5c3c8c16-abcd-42db-8879-799ebfdc1bb1', 'Therese', 'Waltz', 'theresewaltz3@gmail.com',
    '608 769 9882', 2, true, true, NULL
),
(
    'ec6772de-f7ab-426a-834f-3c0c85670d0b', 'bd5c425e-ba57-42dd-8dd7-5372a0a144cd', 'Kacey', 'Nomland', 'kaceynomland@gmail.com',
    '608 769 2762', 3, false, true, NULL
),
(
    '39489023-e274-48e4-862d-10af17407586', 'd21b158d-10a0-4c7c-822d-058a2580ef3e', 'Tyler', 'Thomas', 'tylert614@gmail.com',
    '608 397 3831', 3, false, true, NULL
),
(
    'dd49f813-1236-4c9f-84db-c11d565213b9', 'ddfab3a8-6c2e-4894-8fd7-94b49fd456ac', 'David', 'Yao', 'ydavidyao8@gmail.com',
    '608 518 1269', 3, false, true, NULL
),
(
    'e9688ec8-009d-43e8-86f3-b4a1cefc2e72', 'b5888989-7848-4682-8e06-5bc755b14d57', 'Kris', 'Bartley', 'jkbartley@charter.net',
    '608 386 7299', 3, false, true, NULL
),
(
    '9957b004-6fb0-4c7e-884d-82cfc5559c5c', '8ef58761-fa4d-4618-8951-0cecfc1abe09', 'Jenna', 'Dinkel', 'dinkelj3@gmail.com',
    '920 728 4487', 4, false, true, NULL
),
(
    '39f56b6d-0568-46ab-88f7-15bf56d9907c', '8a898eb7-f986-459f-810b-4c962aba8d27', 'Logan', 'Dzielinski', 'logandzlnsk@gmail.com',
    '920 650 4834', 5, false, true, NULL
),
(
    '089129e4-7466-4e72-8239-294b5963c48b', 'b6214bb4-37b7-4a62-87ad-faec9b537970', 'Alex', 'Hiller', 'alexmoorehiller@gmail.com',
    '651 587 6764', 1, true, true, NULL
),
(
    '2534d224-f62a-4bc1-87ad-cb68aacb5800', '2932d103-a7fe-4a82-8e05-1854564a3aba', 'Eric', 'Johnson', 'erijohnson214@gmail.com',
    '651 357 8926', 2, false, true, NULL
),
(
    'ebc151e7-6203-4a32-843d-05e4fcd224f1', '6fb17ffd-884c-4a86-8796-56107dfb36e3', 'Lewis', 'Kuhlman', 'lewis.kuhlman@me.com',
    '507 381 7749', 3, false, true, NULL
),
(
    'e417c09e-174a-499e-85a5-917a7dfea539', '4b6b3223-75e0-4165-8cc0-3fb013a5a2f7', 'Sarah', 'Wengerter', 'sarah.wengerter@gmail.com',
    '920 660 6194', 3, false, true, NULL
),
(
    '993b0d56-38bc-452a-858e-66b315692f48', '21ee4d86-0ddf-4d19-8b8d-4a72d7ae04c9', 'Brittney', 'DeChambeau', 'brittmd101@gmail.com',
    '608 669 1791', 3, false, true, NULL
),
(
    'b1ed86e6-d79c-45a9-8f03-cc2fdbd9ff16', '9121c338-8a86-437e-86fa-ca76bc8fd3a4', 'Kevin', 'LeQue', 'kdleque@yahoo.com',
    '608 604 6320', 3, false, true, NULL
),
(
    '2a7be5bc-c51a-4c44-83fd-1e3d83dd05d7', 'c9d41e0f-7672-4295-8bd3-dca1dd49027e', 'Asa', 'Harter', 'aharter@harters.net',
    '608 304 0619', 4, false, true, NULL
),
(
    'd249c170-9c43-4018-8183-fd124f7fa735', '69d73637-a52e-429c-8543-0e898b16e966', 'Logan', 'Bahr', 'bahrloganj.b@gmail.com',
    '920 247 1314', 5, false, true, NULL
),
(
    '55d4e4ea-6027-4a91-8d53-2a3736ede726', '6f39d09a-25d4-4f3b-8fa4-35c243006d9b', 'SUB', 'ONLY LIST', 'sub.onlylist@ltta-mock.com',
    NULL, 3, false, true, NULL
),
(
    'e86e1d1d-b59e-4190-8f49-625998144519', '2e9aadc6-3e0a-43e4-88c9-c6a365f8cc7d', 'Name', 'Player', 'email',
    'Phone', 3, false, true, 'MISC'
),
(
    'e40b6c5c-4b94-4f54-8aa1-898d16eb74a0', '4f58aac8-5582-451e-8547-f0608a6e5ca4', 'Ruben', 'Anderson', 'rjand541@gmail.com',
    '608 797 6733', 1, false, true, NULL
),
(
    'd89da1d9-f0c9-45ae-814d-d80b572523c1', '8243bc7f-2b4b-4369-866d-14698c2bd6e5', 'Julio', 'Bird', 'jbird1950@gmail.com',
    '608 385 6964', 1, false, true, NULL
),
(
    'ca553704-158e-416e-877b-d89a62895aa7', 'b6232a88-1d14-486c-8724-531a58989d3f', 'Soonjung', 'Choi', 'moohansoon@gmail.com',
    '608 871 3223', 1, false, true, NULL
),
(
    '0b58d742-dda9-41bc-8b92-38e0bba10917', 'db01b9ca-6171-41a6-8d62-af14003e9587', 'Shanyn', 'Kuljian', 'theresewalz3@gmail.com',
    '608 769 9882', 1, false, true, NULL
),
(
    'e7c3525a-05ed-417a-83c5-6cb16a737c1c', 'cbd0da66-31fd-4cb2-83a1-cec74b8555c7', 'Abigail', 'Ho', 'abigail.l.ho@gmail.com',
    '715 213 4064', 1, false, true, NULL
),
(
    'f8fc8760-edca-43c5-8342-99a8736e9db7', 'e8bc038c-d6e1-4a71-84b1-f10769ac2381', 'Quentin', 'Lamers', 'qlamers13@gmail.com',
    '608 397 9877', 1, false, true, NULL
),
(
    'ddc234b5-2212-4743-8efa-d04a89ca8a6d', '5e5b9b1d-fa55-4f99-8667-6262fa175330', 'Dan', 'Olson', 'dan.olsen153@gmail.com',
    '608 797 5793', 1, false, true, NULL
),
(
    '11f2e597-50e8-4c59-8872-dc4c8e149a3f', '8f0b52a1-bacb-4cf1-8281-93b9d39cbeb2', 'Tim', 'Verbeke', 'timverbeke@yahoo.com',
    '507 459 8763', 1, false, true, NULL
),
(
    '5b3b2472-bf32-4fa6-838a-b31fb15d9e2a', '1a9c8ec1-72d4-4fe1-8bb3-72d2baae6d5a', 'Karen', 'Bonifas', 'kbpt87@gmail.com',
    '608 780 5715', 2, false, true, NULL
),
(
    '6a540980-d705-4a88-8c51-f47526949efa', '1975fb46-2de4-40e0-84f7-feff369dca26', 'Laura', 'Coppola', 'lcoppola323@gmail.com',
    '608 397 7175', 2, false, true, 'Not this year(2026)'
),
(
    '2e518b08-e865-4c28-809c-c3a4ad8d388d', '1f922a2e-5346-431b-8dd8-eba527f28ec1', 'Brad', 'Fowler', 'blfowler@gundersenhealth.org',
    '608 406 6334', 2, false, true, NULL
),
(
    '0cb5a405-64f3-4179-895f-3378b5861811', '161e8850-3559-4fa9-8856-87e398fff5ce', 'Christian', 'Gundersen', 'christian.gundersen@ltta-mock.com',
    '608 397 3856', 2, false, true, NULL
),
(
    '8c9b8fb6-508d-4ee8-8eee-f20d5e5f8fdd', '9ee9db6a-a8ac-496e-89f5-8c41439fccc5', 'Jon', 'Hartfield', 'jphartfield77@gmail.com',
    '608 790 2115', 2, false, true, NULL
),
(
    '999d9c40-0386-49b0-8e15-f7a4562bac0d', '5c26ada2-358d-43f2-8d95-3f4c356091a8', 'Nolan', 'Heath', 'ndheath@wisc.edu',
    '608 406 5470', 2, false, true, NULL
),
(
    'dfb64607-9ee2-4a4a-8b62-40acfdee0266', 'e6eb6d7d-72fd-4bce-8523-dbdfc3010755', 'Tom', 'Londergan', 'thomas.londergan62@gmail.com',
    '608 461 1545', 2, false, true, NULL
),
(
    '0321df02-0d43-4e73-8f49-cdaeb75000de', 'c7d4f89f-46e8-4c00-8df9-8f1a5f123f82', 'Britt', 'Lund', 'ingebrit@hotmail.com',
    '608 406 5553', 2, false, true, NULL
),
(
    '8c3c1df0-65c9-499c-88eb-41498478a3b0', 'cbc52441-4ba7-404f-83c4-9546dabc2828', 'Izzy', 'Ploessl', 'izzyploessl@gmail.com',
    NULL, 2, false, true, NULL
),
(
    '41d26e0e-3975-4cab-89b3-6758c33ce131', '0dfdf555-4ac4-4153-8eca-984b8e04debc', 'Josh', 'Potaracke', 'jjp1020@hotmail.com',
    '608 780 7005', 2, false, true, NULL
),
(
    '88e5b2c7-4fa4-401e-8c5d-8fc58bba9a77', '55760c1f-72c0-40ca-820f-baf3a8556c97', 'Elia', 'Romano', 'elia@alseed.com',
    '507 213 0262', 2, false, true, NULL
),
(
    'bb8508cc-9caa-4140-8449-e299562b998b', '7ab46155-51ac-41e9-802c-23010d7b05b8', 'Michael', 'Scott', 'scott.michael1@mayo.edu',
    '563 663 6781', 2, false, true, NULL
),
(
    '99a625f7-ab17-42fd-8a5b-6ff52a09ce1e', '38985974-9a2a-4bb1-8d60-94c604f4a5be', 'Kelly', 'Skaff', 'kvinceme@gmail.com',
    '608 780 3974', 2, false, true, NULL
),
(
    '076abc5c-d96e-4366-8c29-e71c3f9a3b2b', '1ea6a45a-6885-4e42-82db-a96bc590b0d7', 'Katie', 'Steingraeber', 'katiejsteingraeber@gmail.com',
    '612-221-2745', 2, false, true, NULL
),
(
    '5813a506-f811-4038-877d-a4d1797b5066', 'ec3c9da2-d674-45cf-822d-1cfc538744e2', 'Tim', 'Syring', 'tsyring@me.com',
    '608 738 1600', 2, false, true, NULL
),
(
    '842cd9a9-57af-4ac2-8346-0b150ad1c511', 'a2cf1b54-179c-423a-8092-94bb2e1c7fb6', 'Evan', 'Woodward', 'evsunwoodard@gmail.com',
    '612 500 6123', 2, false, true, NULL
),
(
    'e5778077-9146-4a9f-8ae6-9f1d7844bfac', 'b9702fbf-78cb-4e73-8aa8-4140190edaa6', 'Steve', 'Wissink', 'stevewissink1@hotmail.com',
    '608 406 6344', 2, false, true, NULL
),
(
    '8fc17d3d-b64c-416c-8696-3e8b75053be5', '128d36d4-cccb-414a-8c4b-06b367272e67', 'Emily', 'Yehle', 'eyehle@blc.edu',
    '507 429 8300', 2, false, true, NULL
),
(
    '6c6f321d-6913-445c-8571-bb5b7cfcf440', '1acf070b-16ea-4d1e-88b0-8fe9a74edf0a', 'Andy', 'Seithamer', 'andy.seithamer@ltta-mock.com',
    '608 799 5798', 3, false, true, NULL
),
(
    'f5184888-9d35-4418-8e34-f49fbe51211a', 'dcc431d0-df96-41c0-8459-d6f69b7f0f36', 'Julia', 'Alkhovsky', 'juliaalk@gmail.com',
    '847 650 4499', 3, false, true, NULL
),
(
    'cd04a578-8bfc-4bdb-86f7-65c8c504ed14', '8b385d8b-6278-4f2e-8486-74a4eecd3c2e', 'John', 'Aschenbrenner', 'jaschen456@aol.com',
    '608 792 2860', 3, false, true, 'play w/spouse'
),
(
    '862f92fe-42c4-4c9c-84bf-5229f4b74226', '242715ee-0b14-419a-8848-3c930b4961fd', 'Micah', 'Bornitz', 'bornitzs@gmail.com',
    NULL, 3, false, true, 'play w/spouse'
),
(
    'b6434631-c9f0-4812-8a9f-62979a1cde40', 'e54ae82e-de48-4f68-865f-5ccc0b03bbc8', 'Audry', 'Endrizzi', 'audry.endrizzi@ltta-mock.com',
    '608 385 3377', 3, false, true, NULL
),
(
    '89e25d8f-5a54-4dbf-8b0f-baada83823f0', 'cb44b353-f10e-4e3b-800a-339fa3b4c3cf', 'Danni', 'Engen', 'engen.danni@gmail.com',
    '608 669 1791', 3, false, true, NULL
),
(
    '84349ba5-0bf9-43ec-81aa-58f12e966765', '6273a33e-0d96-4b59-89cd-97f4ddb89005', 'Josh', 'Fitzner', 'joshuafitzner9@gmail.com',
    '608 306 3076', 3, false, true, NULL
),
(
    'a4dd45c8-af1a-4c42-810a-5bb284ed1ee7', 'e78bbaf9-5d02-47dd-8b70-84b1ff2690d2', 'Joe', 'Francksen', 'joejoegun20@gmail.com',
    '608 792 5551', 3, false, true, NULL
),
(
    '0941dc84-de0b-4735-89d1-1c1d6df718e4', 'c2d7bdc0-e931-4f9c-85c7-4520e324b886', 'Kelly', 'Gorres', 'kelly.gorres@ltta-mock.com',
    NULL, 3, false, true, NULL
),
(
    '25121894-cbca-4bf1-8ecd-154f54a3ac9e', 'fe694dc9-7cc8-460c-86e4-134e5d96ef67', 'Brendon', 'Groen', 'bkgroen@gmail.com',
    '936 404 6950', 3, false, true, NULL
),
(
    '37e454f5-e094-4a31-834d-15464ca65997', '323b487f-f633-412d-8b3c-42238c0d2739', 'Chris', 'Heiderscheit', 'heiderscheitc@charter.net',
    '608 780 5546', 3, false, true, NULL
),
(
    '1d5f3bc8-cd67-415c-88b7-51903dc53365', '84586b14-5689-4616-857b-626a7cd77286', 'Jenna', 'Helminski Juve', 'j.e.n.n.a.r.i.a.n.e@gmail.com',
    '715 572 7540', 3, false, true, NULL
),
(
    '90ae1785-a259-4e02-82f0-cd6c78947573', '8747cce6-de3c-4b81-8280-ed411202a314', 'Dale', 'Hockhaufer', 'dale.hockhaufer@ltta-mock.com',
    '608 317 5939', 3, false, true, NULL
),
(
    '2d08f63d-d1fc-401b-8dab-4f08f09cf322', '52b4ec67-02d0-4bad-805d-a01259ed678a', 'Lori', 'Hochhaufer', 'lori.hochhaufer@ltta-mock.com',
    '608 317 5939', 3, false, true, NULL
),
(
    '13f77355-641b-4868-8555-de5ff1654992', '23f9f795-8371-40f0-8e74-a436fc4fd57f', 'Kyle', 'Jensen', 'kjensen532@yahoo.com',
    '608 397 3269', 3, false, true, NULL
),
(
    '439f5dae-fd5a-481f-8125-e226ffa23d58', '49b55364-3c54-4061-8144-b0b02ae4c158', 'Logan', 'Johnson', 'logan.johnson8907@gmail.com',
    '651 347 9400', 3, false, true, NULL
),
(
    '5b0066bb-cdd2-40f2-80ec-dd32fd2b27cd', 'ff88c675-acee-49df-82aa-9d1440d66aaa', 'Maggie', 'Kotnour', 'kotnour.maggie@gmail.com',
    '608 317 8281', 3, false, true, NULL
),
(
    'e685efff-7cb1-4516-82cb-538d55721352', '670f83d0-e4bc-4932-8d44-3332b4e04a46', 'Calvin', 'Krzebietke', 'calvin_krz@yahoo.com',
    '608 792 7939', 3, false, true, NULL
),
(
    'd2ed29e9-7aa4-4da8-80f8-0b23b0942598', '3c31f07b-a0fa-410b-8547-393d282e407c', 'Mark', 'Lakmann', 'mlakmann@lacrossesd.org',
    '608 397 5430', 3, false, true, NULL
),
(
    'c03bd5c2-a167-4c06-8773-0ceb5905779e', 'b938890b-ba1c-4036-8262-bf3d0d0833c2', 'Ran', 'Ikeyama', 'ran.ikeyama@ltta-mock.com',
    '608 738 5507', 3, false, true, NULL
),
(
    '538e13cf-b746-4b3d-8136-1170ef324e4a', '5e6acb70-0fe1-4f77-8ca7-496d80f42438', 'Gracie', 'Miller', 'graciemiller000@gmail.com',
    '608 351 9405', 3, false, true, 'not this summer'
),
(
    'b4900372-6b29-4b7b-8682-2128c523780d', '28e22143-3574-4f92-849a-e6d1cf580802', 'Brad', 'Reinhart', 'reinhart.brad@gmail.com',
    '608 518 0316', 3, false, true, NULL
),
(
    '6c4dc109-5fb4-4727-8f6f-5876dd0ff1e6', '25b74195-b1fa-4a50-8a45-88b93dbe9fe9', 'Raj', 'Remnarace', 'rajr09@gmail.com',
    '608 792 6330', 3, false, true, NULL
),
(
    '11c96c7d-8cf5-4846-88f4-9d18f69230f6', 'b7a60311-7d01-4569-8441-23d4d6edd403', 'Brian', 'Richardson', 'richardsbj13@gmail.com',
    '608 732 7970', 3, false, true, NULL
),
(
    '3eb649b7-9045-4d0f-8da5-eefa27c9b254', 'a6b89930-e25b-43a1-8c44-93766222abb6', 'Allie', 'Schlicht', 'aschlicht2@gmail.com',
    '608 881 9267', 3, false, true, NULL
),
(
    'f9484b97-888d-426a-8773-659803d5f61f', 'e507cfdc-006b-4b69-82d7-af875d167c28', 'Indy', 'Spindler', 'spindler.indy@gmail.com',
    '715 899 3337', 3, false, true, NULL
),
(
    'bfa49631-9c9e-4166-8725-70ed37765e25', '1ac91963-cca8-4d9c-8df9-3f2600d5c4b8', 'Todd', 'Theisen', 'toddjtheisen@gmail.com',
    '608 695 0290', 3, false, true, NULL
),
(
    '854d615b-e676-40df-8501-72c272976c3f', '260b7fd7-3888-4491-8478-49a5d04ec9b9', 'Pete', 'Thomson', 'pete.thomson@ltta-mock.com',
    '608 780 2683', 3, false, true, NULL
),
(
    'fcc21600-b80f-4bbd-817c-0713b1df46a0', 'a77dbb01-f852-4cb9-8979-416e2ba1cfb0', 'Sherwin', 'Toribio', 'storibio@uwlax.edu',
    '608 784 8106', 3, false, true, NULL
),
(
    '56a4ca7d-49fe-4076-8cf6-1ec2841803d3', '886afd4e-c2ea-4b9b-8c6c-64b848aeb4bd', 'Sofia', 'Tucker', 'sofia.tucker@ltta-mock.com',
    '608 317 0338', 3, false, true, NULL
),
(
    'b85c2fd4-5e24-48c9-86dd-e93b0ad16f78', '0a32fa10-238a-4a1f-8ce3-ee8c5abd8de9', 'Cynthia', 'Vo', 'cynthiatmvo@gmail.com',
    '669 285 9873', 3, false, true, NULL
),
(
    'e8cbef19-c7e5-47f3-86bf-fa0f5d27bc0b', 'caffa9e1-a704-421a-8b96-228052e06d7c', 'Devin', 'Voss', 'devinvoss@gmail.com',
    '608 606 4940', 3, false, true, NULL
),
(
    '9bd5f245-0dfd-4851-85e5-b1d2edd4b2cb', 'a0c81721-0383-49f3-8167-c683a41eedde', 'Ashley', 'Patros', 'ashrya7@yahoo.com',
    '608 385 7887', 3, false, true, NULL
),
(
    '4a778343-1d18-460b-8d1b-bc2180e804fe', '075feb31-b9a1-4da0-8bba-761cfe66987a', 'Mohan', 'Ananth', 'mohan.ananth@ltta-mock.com',
    NULL, 4, false, true, NULL
),
(
    'f7109aca-96f9-45e2-8ec4-f846b3df837d', '2d60d559-ae6e-4c5d-8670-f5d9546feed4', 'Aziz', 'Bhetasiwala', 'azizy.bhetasiwala@trane.com',
    '412 589 4995', 4, false, true, NULL
),
(
    'c3c2316c-80e2-4b54-8ac4-a5f9375568de', '449597b4-d445-4925-8260-e1bd649e013d', 'Michael', 'Barreyro', 'michael@barreyro.com',
    '715 586 1736', 4, false, true, NULL
),
(
    '1e5ad7bf-8df6-4096-8b90-c4d80cbdf3cb', '2cffef9f-a7cd-479a-83ca-b0915b53bc59', 'Christina', 'Baumgart', 'cgaard@gmail.com',
    '563 380 6468', 4, false, true, NULL
),
(
    '102b4f05-1b44-430a-814b-c86c2c529e55', 'a5a971af-a98d-452d-8501-e09df9fe4233', 'Deb', 'Baxley', 'debbiebaxley@juno.com',
    '608 797 1669', 4, false, true, NULL
),
(
    'c8d77d51-4d83-49e2-8e6d-b642372b3f24', '1072d942-1719-44a4-8518-64ec338e59ee', 'David', 'Bleidorn', 'davidbleidorn@gmail.com',
    '608 461 1602', 4, false, true, NULL
),
(
    'd61c94b9-4863-4dc3-88c1-d2422533f90c', '2e408e39-7439-4ac5-8eab-a2ff0cd08348', 'Paul', 'Coffman', 'pkcoff@gmail.com',
    '507 254 0762', 4, false, true, NULL
),
(
    'afb1ed01-d314-4b1a-801b-149dd47be80f', '17567d10-27f5-452c-8bdd-909d8d5c32b3', 'Jackson', 'Ehle', 'jackson.ehle@gmail.com',
    '608 852 2712', 4, false, true, NULL
),
(
    '968f5393-c9c8-47bb-8dab-f66d04260382', '30dc61f3-f2ba-4ad5-8d08-a40e0a66690b', 'Dennis', 'Ford', 'forddd9000@aol.com',
    '608 386 2728', 4, false, true, NULL
),
(
    '796d461d-d681-4011-8796-01183c982f94', 'ef705aae-d1aa-4b26-84ff-b29a831f0e54', 'Lauri', 'Ford', 'fordla9000@aol.com',
    '608 386 3632', 4, false, true, NULL
),
(
    '981521da-3ba8-4d72-80e9-24e5a5748255', '7a2c9175-ee3a-40b5-8d83-2de16b3566a2', 'Steve', 'Gilman', 'eagleflight@charter.net',
    '608 784 1491', 4, false, true, NULL
),
(
    'c3937435-8198-46d7-8ca9-a0c7e816b504', '53c54195-02f4-4a0e-8b94-35d6cf7e9996', 'Josiah', 'Green', 'thejosiahgreen@gmail.com',
    NULL, 4, false, true, NULL
),
(
    'eb0fea93-5015-494c-8ec6-68c2da56635e', '1457fbd9-7d93-48f9-8c8a-9cb3c32de90c', 'Kaitlin', 'Grey', 'kegrey27@gmail.com',
    '920 279 0152', 4, false, true, NULL
),
(
    '133e4c9e-5722-4287-89dc-e35f24e11ebb', 'b042c9bd-c9fa-411c-8be4-7f68845c79e7', 'Amy', 'Harter', 'amyharter66@gmail.com',
    '608 461 1845', 4, false, true, NULL
),
(
    'dbdb1fa8-2112-4c4e-894f-a060b0ea0cf6', 'be932fb1-7921-4de0-8f14-8f65b74fd60b', 'Tommi', 'Hemp', 'tjhemp98@gmail.com',
    '608 790 6125', 4, false, true, NULL
),
(
    'be7dd541-7d67-48d7-85c3-247152ae3f8c', '1a57d8bf-f68b-49c3-8938-bae1767dfd9e', 'Darlene', 'Isaacson', 'darleneisaacson@live.com',
    '608 518 8894', 4, false, true, NULL
),
(
    '7fec527f-7719-4602-8d49-c94a923c0123', '7221586b-7035-4a0d-8b25-31c91d53512b', 'Allison', 'Kleman', 'allison.kleman@ltta-mock.com',
    '715 321 2954', 4, false, true, NULL
),
(
    'ab9b9596-ee9f-417d-8477-1ee0cee53045', 'bff9bebd-afc3-4487-822c-10c1d48e3779', 'Samantha', 'Marr', 'sammar22@gmail.com',
    '608 633 8975', 4, false, true, NULL
),
(
    'ceb749c8-9ebc-4cf3-82e6-1d4e0147684d', 'e0959c4a-075b-4cdb-844d-5252e9cedac5', 'Eric', 'Marr', 'eem2912@gmail.com',
    '608 797 2734', 4, false, true, NULL
),
(
    '178451c6-a6b1-4808-8258-8d404d088881', '092b0c46-e62b-43c5-8846-4d54c5171b15', 'Aaron', 'Olson', 'ato222@gmail.com',
    '608 790 6510', 4, false, true, NULL
),
(
    'e1495ffd-ba9d-418a-81f4-7f8e9d5a5863', 'f6a0c383-0e31-4539-85f5-6c3e5901ec5b', 'Anna', 'Olson', 'akwarpinski@gmail.com',
    '608 213 3340', 4, false, true, NULL
),
(
    'dbd1c94f-c9ee-4b79-849f-f92f90a03f12', 'c1c6da7a-7b62-4ea6-86bd-69b101bd73aa', 'Dylan', 'Powell', 'dpow88048804@gmail.com',
    '608 487 7388', 4, false, true, NULL
),
(
    '1a7fbfc4-9c46-4ab6-8f77-83c621d39a46', 'b25d4438-8f35-40e3-83bf-9f168dcf35bd', 'Ryan', 'Sneath', 'sneathryan@yahoo.com',
    '608 397 1080', 4, false, true, NULL
),
(
    '9bc0d853-6708-4e90-8c79-16c9af8d8ffa', '2e2b47c8-74e5-4d49-8098-56ff1cddc997', 'Dale', 'Ralph', 'dale.ralph@gmail.com',
    '608 399 4166', 4, false, true, NULL
),
(
    'b807f527-2392-4e50-843f-06b159dd1bf7', '09fc46c9-cd36-497c-820a-d2d591a417f5', 'Dan', 'Russell', 'druss0605@hotmail.com',
    '608 386 2810', 4, false, true, NULL
),
(
    'b6c52210-6198-42d8-8a34-99d622e20171', 'f226c6df-f099-4b1d-8c61-aa302ba407a2', 'Andrew', 'Vogel', 'apvpcs@gmail.com',
    '507 725 3804', 4, false, true, NULL
),
(
    '9af99f9a-17e7-44e4-8a08-8bbec4224239', '2bc4171e-428b-48f3-8128-0b912c56691f', 'Jess', 'Hytry', 'jesshytry@gmail.com',
    '608 397 0713', 4, false, true, NULL
),
(
    '58732494-f3d0-4357-850a-4846b01c8c79', '39361013-3fc1-4a17-8a53-b8e8a8bc75a6', 'Donna', 'Brogan', 'bigleypool@icloud.com',
    '608 797 2418', 5, false, true, NULL
),
(
    'caa585a3-acba-4b06-89c8-19862d4c5b98', '9a4c3ed0-5787-4ae0-897f-a55fe566d983', 'Alexis', 'Croox', 'alexiscroox@gmail.com',
    '507 961 3861', 5, false, true, NULL
),
(
    'f19fa001-d159-4b61-8513-ebae2ab056b5', '6a0ce3d3-d1ba-44e1-88b3-e9063f253dd3', 'Polly', 'Davenport', 'davs912@gmail.com',
    '608-461-1478', 5, false, true, NULL
),
(
    '0a677fd0-685e-4669-8bd6-3e5215e5e490', 'd4dd8206-8e1f-4b2f-8cef-91e24c7954ea', 'Adam', 'Driscoll', 'adrockxchw@yahoo.com',
    '252 414 3733', 5, false, true, NULL
),
(
    'a65dfcd4-9bf4-4ce0-8ec1-3449b0a52afa', '94427a79-2d59-4d6a-84ec-73bad3e41887', 'Jenny', 'Lee', 'superjennylee1226@gmail.com',
    '608 385 5954', 5, false, true, NULL
),
(
    '08ee9c63-6393-4968-8dcd-b4b60903be36', '401e04d2-6a2d-4fc9-8188-a1fc86cb1ea8', 'TingTing', 'Ma', 'ttma2007@gmail.com',
    '608 406 4060', 5, false, true, NULL
),
(
    '1cd63ebb-8251-46d9-873f-ec00166e74f5', '0d6a9ab9-138e-4474-81ce-cef5cb63daaa', 'Samantha', 'Marr', 'samantha.marr@ltta-mock.com',
    '6086338975', 5, false, true, NULL
),
(
    '06bf2c98-7009-4dd2-8518-3aed95438281', 'c1f581c8-7e7c-475e-8712-f52108afaad6', 'Kimberly', 'Phillips', 'kimberly.phillips@ltta-mock.com',
    '608 790 3736', 5, false, true, NULL
),
(
    '5bbacf2e-f243-48fb-8ce5-34d2442a991b', 'bb690970-0ba4-40b5-872a-ad3ce5e7f9f3', 'Laura', 'Prosperi', 'laura.prosperi@ltta-mock.com',
    '608 317 6959', 5, false, true, NULL
),
(
    '0757bd78-25fb-4808-8062-26827a2b9716', '4f6dc9e2-cbdd-448c-8af7-f50ac360a470', 'Patty', 'Rausa', 'pattyrausa@gmail.com',
    NULL, 5, false, true, NULL
),
(
    '97b54d89-ef5c-444d-8e38-456849e9f844', 'a5a2d28b-f166-418c-8259-22aa32e45d55', 'Lisa', 'Swenson', 'lwetterlin@gmail.com',
    '715 252 8713', 5, false, true, NULL
),
(
    '2970ffc7-07e6-4e2a-86b7-3e7afe829fe3', 'd8d75eef-7bf3-428f-8a24-906d621088a9', 'Catherine', 'Tang', 'catherine_tang05@yahoo.com',
    '608 769 2537', 5, false, true, NULL
),
(
    '33cb2827-9e48-402f-8c67-5e10688d9ef2', 'e6cc0ec8-217e-4ded-8183-46b9ac52a31d', 'Tom', 'Parr', 'tomparr27@gmail.com',
    NULL, 3, false, true, NULL
)
ON CONFLICT (id) DO NOTHING;

-- 7. Player to Team registrations
INSERT INTO "public"."player_to_team" ("player", "team") VALUES
('e209c7b9-0ac7-4c3f-800f-b2f06ab5602d', '33333333-3333-3333-3333-333333333301'),
('eb12017c-fb77-48f1-8909-70d17fd83fb6', '33333333-3333-3333-3333-333333333301'),
('f940c065-045d-415e-81f2-4d995f4556b5', '33333333-3333-3333-3333-333333333301'),
('5b494ba0-f35f-4d50-8f58-88bc7d0e1b90', '33333333-3333-3333-3333-333333333301'),
('ed5e88f3-3861-4723-8b1f-278258fa1a98', '33333333-3333-3333-3333-333333333301'),
('bf93a669-a572-4c53-882b-6efaa02d05b7', '33333333-3333-3333-3333-333333333301'),
('074f45c7-d1cc-4cda-8f0c-73ab4e0412e7', '33333333-3333-3333-3333-333333333301'),
('b23c59c2-5726-49d2-8b54-70d3f04e5a64', '33333333-3333-3333-3333-333333333301'),
('6e526980-b766-4126-8ff7-a08ccc452310', '33333333-3333-3333-3333-333333333302'),
('1e4b4beb-fed9-490d-8956-e1f22555d135', '33333333-3333-3333-3333-333333333302'),
('8786c21a-f609-44a4-8d30-e2d17d3ee14c', '33333333-3333-3333-3333-333333333302'),
('88b3cdfa-4c69-497c-8f2b-5cb9ab2e8f0b', '33333333-3333-3333-3333-333333333302'),
('2a2478d8-06d8-4a42-8e3c-c02f8d5e49f1', '33333333-3333-3333-3333-333333333302'),
('6366e981-3101-4adf-805c-33b0e2a366aa', '33333333-3333-3333-3333-333333333303'),
('3f80c7fe-9fa7-4df8-88cd-050d0b86b569', '33333333-3333-3333-3333-333333333303'),
('4756c879-1719-4cea-8d91-9fe5efdbe575', '33333333-3333-3333-3333-333333333303'),
('6fcc4337-4ad4-42c2-8a23-1062a8dd90c3', '33333333-3333-3333-3333-333333333303'),
('baf5769d-90e2-4da5-8b93-0ee0bfe60b00', '33333333-3333-3333-3333-333333333303'),
('c49cad23-a794-4d2c-8d28-e64ee442bfa5', '33333333-3333-3333-3333-333333333303'),
('afc148c0-0b24-4f0d-8530-32a776a946e6', '33333333-3333-3333-3333-333333333303'),
('fa231168-9242-42f5-899c-01699bd3fe40', '33333333-3333-3333-3333-333333333303'),
('9750e4ff-7970-4082-8f03-532db15bdfff', '33333333-3333-3333-3333-333333333304'),
('b81caec2-439f-49a6-8563-783a2a19ecad', '33333333-3333-3333-3333-333333333304'),
('032313b5-764c-441a-8650-4cee780f8f70', '33333333-3333-3333-3333-333333333304'),
('7b702586-6720-4958-8c0d-e8e4449ac295', '33333333-3333-3333-3333-333333333304'),
('5e002bdf-2292-40ea-8a46-46d4d2ab9d40', '33333333-3333-3333-3333-333333333304'),
('a458470e-dd26-43bb-8617-4d8357d86693', '33333333-3333-3333-3333-333333333304'),
('2968d29a-d312-4044-85e3-d9ccc5464412', '33333333-3333-3333-3333-333333333304'),
('eba90def-1869-4afb-8ed4-d7b77454fe07', '33333333-3333-3333-3333-333333333304'),
('c8262133-3efc-4627-844a-e2c3d13fcb59', '33333333-3333-3333-3333-333333333305'),
('37b26af4-01ef-42a0-8c6a-2571b7b44a9b', '33333333-3333-3333-3333-333333333305'),
('65b8c820-2026-4e55-8a44-66acf0e17302', '33333333-3333-3333-3333-333333333305'),
('de949656-a5a3-458b-8f8d-48f739511ed5', '33333333-3333-3333-3333-333333333305'),
('335c73a5-0808-48d8-8d2e-009da680ee5c', '33333333-3333-3333-3333-333333333305'),
('9b5834d1-1f9e-4b80-8e62-220ceb2b36bc', '33333333-3333-3333-3333-333333333305'),
('7618161e-6522-4f95-825b-a420218f4456', '33333333-3333-3333-3333-333333333305'),
('3171bb71-42a7-4013-8b46-ab6ffde3ae06', '33333333-3333-3333-3333-333333333305'),
('658d461d-e6be-4f3f-8918-99509619bd55', '33333333-3333-3333-3333-333333333306'),
('35e4c6fe-b623-4c65-8285-7c2d241ed9b0', '33333333-3333-3333-3333-333333333306'),
('5959f6b4-504f-4866-85e5-b51cca52a528', '33333333-3333-3333-3333-333333333306'),
('9153df0f-58d3-4e56-80dd-f743d3060054', '33333333-3333-3333-3333-333333333306'),
('7c57d768-1997-4c6c-8bde-e440f22e1340', '33333333-3333-3333-3333-333333333306'),
('e3eba457-bcb4-4aa5-8bad-f8bef7b006dc', '33333333-3333-3333-3333-333333333306'),
('636906e2-ef39-4a2e-89fb-27496cf3aa56', '33333333-3333-3333-3333-333333333306'),
('e0fb1f18-579e-4989-8570-a01e9daa6631', '33333333-3333-3333-3333-333333333306'),
('45ee3124-c7ca-453a-87e0-55a0b20b36d2', '33333333-3333-3333-3333-333333333307'),
('7bb4a303-807d-4e5f-82d7-6b4f79ce7183', '33333333-3333-3333-3333-333333333307'),
('54221383-2b98-49a2-86a2-63e8aab9145c', '33333333-3333-3333-3333-333333333307'),
('8211bd9f-ec22-47c1-8184-ba799e29cb37', '33333333-3333-3333-3333-333333333307'),
('1c7bd05d-1b8a-4adb-850e-32dbe46d80b9', '33333333-3333-3333-3333-333333333307'),
('983c3872-e42d-4454-8f33-ea05b98fcc21', '33333333-3333-3333-3333-333333333307'),
('16bf7161-a3f9-4a86-8be5-442b351d9202', '33333333-3333-3333-3333-333333333307'),
('e314d427-6e5f-411c-8e4b-c4809fd47803', '33333333-3333-3333-3333-333333333307'),
('918ff6f4-3774-4b40-88db-8eb029f375e7', '33333333-3333-3333-3333-333333333308'),
('5c78a4b2-c9f8-4c4e-8d9c-414925a49fbe', '33333333-3333-3333-3333-333333333308'),
('b2c9235d-250f-4d24-834b-6796d472d565', '33333333-3333-3333-3333-333333333308'),
('0d15342f-c238-4f42-8464-0696cb39cc30', '33333333-3333-3333-3333-333333333308'),
('b018152e-511f-4738-887b-2f10864ac1fa', '33333333-3333-3333-3333-333333333308'),
('b2b6f8b4-3ec8-460e-8b0c-b5b3baab9ab8', '33333333-3333-3333-3333-333333333308'),
('0f6dd0b7-8ad2-48d2-821c-0cd3c8118c0b', '33333333-3333-3333-3333-333333333308'),
('ee1b4799-e47e-4350-8df0-d9b597e0305a', '33333333-3333-3333-3333-333333333308'),
('b8a2dd08-e7a5-4b7a-838c-3af89193c0bf', '33333333-3333-3333-3333-333333333309'),
('d3dd9417-e229-464f-85ed-59162cdea8b2', '33333333-3333-3333-3333-333333333309'),
('3deaa355-e57b-4da8-86a3-b5a5a6823b63', '33333333-3333-3333-3333-333333333309'),
('12c46b24-6451-4aa8-8751-86d2ef5bcb03', '33333333-3333-3333-3333-333333333309'),
('2d636d8d-ab43-4dc9-8e33-71ff748acfe7', '33333333-3333-3333-3333-333333333309'),
('d8675929-49d4-478f-8395-cccf04a2f3e5', '33333333-3333-3333-3333-333333333309'),
('fc4943a6-df18-4a22-888f-530a7a90748b', '33333333-3333-3333-3333-333333333309'),
('5fb2cf9a-9e94-42a6-8940-25912bb55cc8', '33333333-3333-3333-3333-333333333309'),
('47c44052-2a62-4738-8d14-66a85385c5c3', '33333333-3333-3333-3333-333333333310'),
('6871578e-f59f-4227-85aa-1cc0835437fb', '33333333-3333-3333-3333-333333333310'),
('46fb67a7-05ea-4f9f-8d11-7d7aa49b5920', '33333333-3333-3333-3333-333333333310'),
('48a554f1-d610-4857-80d2-5b794d1371cd', '33333333-3333-3333-3333-333333333310'),
('487d53a6-a4d9-43ed-8a9d-48a5dbb6a1e0', '33333333-3333-3333-3333-333333333310'),
('df5d57ca-9ab1-47c4-80ec-c6206ac7b3aa', '33333333-3333-3333-3333-333333333310'),
('9db17513-a260-4902-8c45-200c1326c72f', '33333333-3333-3333-3333-333333333310'),
('06e05461-4c60-4ee8-83fa-d8d375dd2b4a', '33333333-3333-3333-3333-333333333311'),
('d292761d-9dd4-4098-8efb-9e0a1f7a3422', '33333333-3333-3333-3333-333333333311'),
('2e1fa11f-d9ab-4685-8878-c36ee365c265', '33333333-3333-3333-3333-333333333311'),
('ef465608-a3e0-463d-8914-8d523bf65b26', '33333333-3333-3333-3333-333333333311'),
('e9bc7b31-0a25-4eee-8d80-a737ab675986', '33333333-3333-3333-3333-333333333311'),
('970a64c0-3439-4fa3-8d93-eedc1bc2b8d6', '33333333-3333-3333-3333-333333333311'),
('f3c663ca-a0a3-44cb-8401-379a2a58855a', '33333333-3333-3333-3333-333333333311'),
('d1908c58-34df-4f51-89d3-d95c940d4538', '33333333-3333-3333-3333-333333333311'),
('213b4cb9-e1de-41e0-8f2c-16dfbec596a2', '33333333-3333-3333-3333-333333333312'),
('d6d9fc7a-de2b-4d9f-839c-aab394128383', '33333333-3333-3333-3333-333333333312'),
('5a53725b-2082-4d68-8363-b98a075a5558', '33333333-3333-3333-3333-333333333312'),
('c01065bd-c55e-4a05-84d2-9d0ae44a7bf3', '33333333-3333-3333-3333-333333333312'),
('6cbb5558-9405-457e-8322-082c088e7249', '33333333-3333-3333-3333-333333333312'),
('aae1c364-7919-467e-843f-dd3d0ba94c76', '33333333-3333-3333-3333-333333333312'),
('60b57e6e-0733-46aa-819b-c33aa6e28642', '33333333-3333-3333-3333-333333333312'),
('ae0ac4b0-4bdf-46ca-8009-6e2ce88d15a7', '33333333-3333-3333-3333-333333333312'),
('7c1639b9-e097-474e-8ada-cec5d2d8793c', '33333333-3333-3333-3333-333333333321'),
('4cef8eff-c67d-4671-8c57-32d4b9298c59', '33333333-3333-3333-3333-333333333321'),
('78b4b6a5-9fb1-4fe8-8343-fa51b032e3af', '33333333-3333-3333-3333-333333333321'),
('94ef7b04-7b39-4f95-8179-c5c333ab8217', '33333333-3333-3333-3333-333333333321'),
('d0a4a3c1-cee8-41a3-8468-a4e76137d7ad', '33333333-3333-3333-3333-333333333321'),
('aa03065a-fe4f-447f-8fe2-3b53e58a2a10', '33333333-3333-3333-3333-333333333321'),
('a8d728ad-8fd0-414a-85c2-14e7d925e44e', '33333333-3333-3333-3333-333333333321'),
('1a9d3ec6-86de-4947-8065-d3041eb5bf4e', '33333333-3333-3333-3333-333333333321'),
('6edc2d93-0de5-4335-8a84-c2c31bd18736', '33333333-3333-3333-3333-333333333322'),
('500d494c-0c46-4730-83ba-82d41b17d640', '33333333-3333-3333-3333-333333333322'),
('0879719f-271c-42d2-8b35-898c07cc8ade', '33333333-3333-3333-3333-333333333322'),
('3bf4b677-8f55-4c0c-8aa7-ab42fc2a7b5f', '33333333-3333-3333-3333-333333333322'),
('3c9b1cce-1b3e-4d02-86b8-ecd88ba0c314', '33333333-3333-3333-3333-333333333322'),
('3eadd7f4-28a3-4510-8bdf-ca6d5c876d26', '33333333-3333-3333-3333-333333333322'),
('8b865870-fef6-4ad8-8324-d9ea7a2049bc', '33333333-3333-3333-3333-333333333322'),
('cc121819-30dc-4f9a-8bf8-0ae07ace3dda', '33333333-3333-3333-3333-333333333322'),
('6a11f32a-f27a-4187-8a2c-192a90106da7', '33333333-3333-3333-3333-333333333322'),
('82603afb-40c8-420b-869e-3e131acf65df', '33333333-3333-3333-3333-333333333323'),
('46bc0d77-2fe4-48a3-85fc-9962ca174ab6', '33333333-3333-3333-3333-333333333323'),
('63597f8c-dfc6-475e-8cc2-bfb832a28fbc', '33333333-3333-3333-3333-333333333323'),
('a9eedc85-ee19-4cf4-8ac9-2c4f4d5f882b', '33333333-3333-3333-3333-333333333323'),
('f7aa55a7-0180-4f88-8422-e2e977e8755b', '33333333-3333-3333-3333-333333333323'),
('73bfe70d-898e-4159-8b6a-bae3a5a730fa', '33333333-3333-3333-3333-333333333323'),
('39394b5f-ef68-4bef-8f5b-80981114ac91', '33333333-3333-3333-3333-333333333323'),
('d23bc1c4-5a45-4c49-8250-8a00539ba9a9', '33333333-3333-3333-3333-333333333323'),
('51cbb930-4de6-4b04-8f75-5e0ffa48550f', '33333333-3333-3333-3333-333333333324'),
('66072751-397d-48ed-82a2-21100ad1ed1b', '33333333-3333-3333-3333-333333333324'),
('77d7a169-6b7f-49ac-8d93-f191a589b377', '33333333-3333-3333-3333-333333333324'),
('0b5c9731-7099-4405-8cdc-a8ba4c6d4382', '33333333-3333-3333-3333-333333333324'),
('f3db05a1-d841-4d34-829f-7b43b3042e0f', '33333333-3333-3333-3333-333333333324'),
('7373b184-0312-4bc4-8149-b17a56d6266b', '33333333-3333-3333-3333-333333333324'),
('2d1ab2e0-5d27-4c1f-873c-a6420599d827', '33333333-3333-3333-3333-333333333324'),
('07015459-b161-4494-8e7d-7380d73116ad', '33333333-3333-3333-3333-333333333324'),
('88319f71-061f-4156-8ac6-d01f36a12859', '33333333-3333-3333-3333-333333333325'),
('ec3cbc63-fb68-4504-883c-786e0271877b', '33333333-3333-3333-3333-333333333325'),
('cbe52322-998a-49c9-89f4-51ca09d10468', '33333333-3333-3333-3333-333333333325'),
('2794cba8-7fb3-40a8-893b-10465b4651eb', '33333333-3333-3333-3333-333333333325'),
('57eb6a97-63f5-4e94-8446-0eee1caa2b46', '33333333-3333-3333-3333-333333333325'),
('b0b9a722-acc8-4c68-8e97-bb7eca45084d', '33333333-3333-3333-3333-333333333325'),
('d7d00b98-46a3-40e4-8cf7-bada0c804181', '33333333-3333-3333-3333-333333333325'),
('14e83cc9-42f7-474a-8e81-032837a052a5', '33333333-3333-3333-3333-333333333325'),
('31aabd69-c25f-47f9-8392-554ed5fce502', '33333333-3333-3333-3333-333333333326'),
('99e598eb-64fa-4e9b-8c60-a24cb7552255', '33333333-3333-3333-3333-333333333326'),
('e0ce6763-87ea-4c49-8ad6-95c4b378e054', '33333333-3333-3333-3333-333333333326'),
('7df72c08-6110-4e53-85fa-5b1de6e72ad7', '33333333-3333-3333-3333-333333333326'),
('3d01e0b0-22dc-4d81-80f3-2c30981e2f8d', '33333333-3333-3333-3333-333333333326'),
('c05e5bdd-cf4e-44de-809e-9cf17a44d775', '33333333-3333-3333-3333-333333333326'),
('cd4947b5-975f-4261-888b-c064f06e6d8e', '33333333-3333-3333-3333-333333333326'),
('a41a3653-9b11-4b34-8877-fbf2a75ef258', '33333333-3333-3333-3333-333333333326'),
('8e4d91c2-c560-4bb3-8942-c16da327fe47', '33333333-3333-3333-3333-333333333327'),
('9b2b91a7-f95a-4bf3-8089-7d4e8d7b3bf8', '33333333-3333-3333-3333-333333333327'),
('92ec6727-b7a6-4cd7-83ed-b80180821840', '33333333-3333-3333-3333-333333333327'),
('974f56b2-9586-4ac2-881a-b6f93cfb3107', '33333333-3333-3333-3333-333333333327'),
('3b260ae5-4b3b-45a4-8161-3291bf1c7d71', '33333333-3333-3333-3333-333333333327'),
('35749af6-20a5-44ee-8ee7-991a2f81bc7d', '33333333-3333-3333-3333-333333333327'),
('0463e7ad-aeae-47ac-83de-b3cc81aa6aae', '33333333-3333-3333-3333-333333333327'),
('95224ea2-c009-49fd-8faf-3e8a7ac7b10f', '33333333-3333-3333-3333-333333333327'),
('6ad8bfb6-b0a3-4999-8ff9-330c6e4db443', '33333333-3333-3333-3333-333333333328'),
('f37c4156-7310-49d2-8f60-9dcdfd3b28fa', '33333333-3333-3333-3333-333333333328'),
('ff031acd-a327-479f-8a47-03758dd9c079', '33333333-3333-3333-3333-333333333328'),
('b83e3422-24c0-4f88-8c29-b13feed23054', '33333333-3333-3333-3333-333333333328'),
('cd501b6e-e04d-4d39-8ebe-580ba2e2772f', '33333333-3333-3333-3333-333333333328'),
('5ed06a6e-ad49-4f4d-8622-dfbcf8e3f9f9', '33333333-3333-3333-3333-333333333328'),
('77ba2623-1ecf-4070-838e-f9d42bd1901f', '33333333-3333-3333-3333-333333333328'),
('37afd582-49ff-4502-8aa2-51bf1450aa0a', '33333333-3333-3333-3333-333333333328'),
('ed7e9c69-f6b5-4aec-8f35-c1632ef4ae54', '33333333-3333-3333-3333-333333333329'),
('e3ee14f9-a8b6-47cc-83d6-453a627c1637', '33333333-3333-3333-3333-333333333329'),
('c57312de-d279-43ec-87f1-b321a39f09fe', '33333333-3333-3333-3333-333333333329'),
('5f997464-21cd-40ec-8ce3-a221e82ef911', '33333333-3333-3333-3333-333333333329'),
('5dff312a-54a5-4e41-85c8-c1e19a6237fb', '33333333-3333-3333-3333-333333333329'),
('3c2be2db-2df8-4802-8c91-b79ea85c132d', '33333333-3333-3333-3333-333333333329'),
('847ab7b9-4c47-4224-843f-891c9633fb50', '33333333-3333-3333-3333-333333333329'),
('fefac696-a25e-419f-88a5-cfabd43c2f5d', '33333333-3333-3333-3333-333333333329'),
('983c76f0-7458-44e4-80cb-9dd2837a3246', '33333333-3333-3333-3333-333333333330'),
('43d2c08f-0581-4763-84bf-6466cf2e4717', '33333333-3333-3333-3333-333333333330'),
('4d008344-6a34-4209-8649-3f47cf6d556e', '33333333-3333-3333-3333-333333333330'),
('9754dc36-98f5-41ee-83d5-a48f768f655c', '33333333-3333-3333-3333-333333333330'),
('29088b70-1439-4693-83eb-0e2f72812635', '33333333-3333-3333-3333-333333333330'),
('a4ea1d91-cd43-4a7e-8923-fafc01827b6a', '33333333-3333-3333-3333-333333333330'),
('6625e3ad-0206-4302-890a-54fae281abc2', '33333333-3333-3333-3333-333333333330'),
('da51e2b7-db91-462d-877d-8a72dce3fe1c', '33333333-3333-3333-3333-333333333330'),
('8add4497-c41b-4edb-8ffc-fbdbf0908905', '33333333-3333-3333-3333-333333333331'),
('12355085-528a-4192-8d3c-693fe0c42e1e', '33333333-3333-3333-3333-333333333331'),
('ec6772de-f7ab-426a-834f-3c0c85670d0b', '33333333-3333-3333-3333-333333333331'),
('39489023-e274-48e4-862d-10af17407586', '33333333-3333-3333-3333-333333333331'),
('dd49f813-1236-4c9f-84db-c11d565213b9', '33333333-3333-3333-3333-333333333331'),
('e9688ec8-009d-43e8-86f3-b4a1cefc2e72', '33333333-3333-3333-3333-333333333331'),
('9957b004-6fb0-4c7e-884d-82cfc5559c5c', '33333333-3333-3333-3333-333333333331'),
('39f56b6d-0568-46ab-88f7-15bf56d9907c', '33333333-3333-3333-3333-333333333331'),
('089129e4-7466-4e72-8239-294b5963c48b', '33333333-3333-3333-3333-333333333332'),
('2534d224-f62a-4bc1-87ad-cb68aacb5800', '33333333-3333-3333-3333-333333333332'),
('ebc151e7-6203-4a32-843d-05e4fcd224f1', '33333333-3333-3333-3333-333333333332'),
('e417c09e-174a-499e-85a5-917a7dfea539', '33333333-3333-3333-3333-333333333332'),
('993b0d56-38bc-452a-858e-66b315692f48', '33333333-3333-3333-3333-333333333332'),
('b1ed86e6-d79c-45a9-8f03-cc2fdbd9ff16', '33333333-3333-3333-3333-333333333332'),
('2a7be5bc-c51a-4c44-83fd-1e3d83dd05d7', '33333333-3333-3333-3333-333333333332'),
('d249c170-9c43-4018-8183-fd124f7fa735', '33333333-3333-3333-3333-333333333332')
ON CONFLICT DO NOTHING;

-- 8. Season Payments (Manual payment tracker)
INSERT INTO "public"."season_payments" ("id", "season_id", "player_id", "amount_paid", "payment_method", "notes") VALUES
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'e209c7b9-0ac7-4c3f-800f-b2f06ab5602d', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'eb12017c-fb77-48f1-8909-70d17fd83fb6', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'f940c065-045d-415e-81f2-4d995f4556b5', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '5b494ba0-f35f-4d50-8f58-88bc7d0e1b90', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'ed5e88f3-3861-4723-8b1f-278258fa1a98', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'bf93a669-a572-4c53-882b-6efaa02d05b7', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '074f45c7-d1cc-4cda-8f0c-73ab4e0412e7', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'b23c59c2-5726-49d2-8b54-70d3f04e5a64', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '6e526980-b766-4126-8ff7-a08ccc452310', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '1e4b4beb-fed9-490d-8956-e1f22555d135', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '8786c21a-f609-44a4-8d30-e2d17d3ee14c', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '88b3cdfa-4c69-497c-8f2b-5cb9ab2e8f0b', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '2a2478d8-06d8-4a42-8e3c-c02f8d5e49f1', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '6366e981-3101-4adf-805c-33b0e2a366aa', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '3f80c7fe-9fa7-4df8-88cd-050d0b86b569', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '4756c879-1719-4cea-8d91-9fe5efdbe575', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '6fcc4337-4ad4-42c2-8a23-1062a8dd90c3', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'baf5769d-90e2-4da5-8b93-0ee0bfe60b00', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'c49cad23-a794-4d2c-8d28-e64ee442bfa5', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'afc148c0-0b24-4f0d-8530-32a776a946e6', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'fa231168-9242-42f5-899c-01699bd3fe40', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '9750e4ff-7970-4082-8f03-532db15bdfff', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'b81caec2-439f-49a6-8563-783a2a19ecad', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '032313b5-764c-441a-8650-4cee780f8f70', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '7b702586-6720-4958-8c0d-e8e4449ac295', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '5e002bdf-2292-40ea-8a46-46d4d2ab9d40', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'a458470e-dd26-43bb-8617-4d8357d86693', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '2968d29a-d312-4044-85e3-d9ccc5464412', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'eba90def-1869-4afb-8ed4-d7b77454fe07', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'c8262133-3efc-4627-844a-e2c3d13fcb59', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '37b26af4-01ef-42a0-8c6a-2571b7b44a9b', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '65b8c820-2026-4e55-8a44-66acf0e17302', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'de949656-a5a3-458b-8f8d-48f739511ed5', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '335c73a5-0808-48d8-8d2e-009da680ee5c', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '9b5834d1-1f9e-4b80-8e62-220ceb2b36bc', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '7618161e-6522-4f95-825b-a420218f4456', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '3171bb71-42a7-4013-8b46-ab6ffde3ae06', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '658d461d-e6be-4f3f-8918-99509619bd55', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '35e4c6fe-b623-4c65-8285-7c2d241ed9b0', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '5959f6b4-504f-4866-85e5-b51cca52a528', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '9153df0f-58d3-4e56-80dd-f743d3060054', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '7c57d768-1997-4c6c-8bde-e440f22e1340', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'e3eba457-bcb4-4aa5-8bad-f8bef7b006dc', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '636906e2-ef39-4a2e-89fb-27496cf3aa56', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'e0fb1f18-579e-4989-8570-a01e9daa6631', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '45ee3124-c7ca-453a-87e0-55a0b20b36d2', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '7bb4a303-807d-4e5f-82d7-6b4f79ce7183', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '54221383-2b98-49a2-86a2-63e8aab9145c', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '8211bd9f-ec22-47c1-8184-ba799e29cb37', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '1c7bd05d-1b8a-4adb-850e-32dbe46d80b9', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '983c3872-e42d-4454-8f33-ea05b98fcc21', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '16bf7161-a3f9-4a86-8be5-442b351d9202', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'e314d427-6e5f-411c-8e4b-c4809fd47803', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '918ff6f4-3774-4b40-88db-8eb029f375e7', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '5c78a4b2-c9f8-4c4e-8d9c-414925a49fbe', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'b2c9235d-250f-4d24-834b-6796d472d565', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '0d15342f-c238-4f42-8464-0696cb39cc30', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'b018152e-511f-4738-887b-2f10864ac1fa', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'b2b6f8b4-3ec8-460e-8b0c-b5b3baab9ab8', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '0f6dd0b7-8ad2-48d2-821c-0cd3c8118c0b', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'ee1b4799-e47e-4350-8df0-d9b597e0305a', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'b8a2dd08-e7a5-4b7a-838c-3af89193c0bf', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'd3dd9417-e229-464f-85ed-59162cdea8b2', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '3deaa355-e57b-4da8-86a3-b5a5a6823b63', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '12c46b24-6451-4aa8-8751-86d2ef5bcb03', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '2d636d8d-ab43-4dc9-8e33-71ff748acfe7', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'd8675929-49d4-478f-8395-cccf04a2f3e5', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'fc4943a6-df18-4a22-888f-530a7a90748b', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '5fb2cf9a-9e94-42a6-8940-25912bb55cc8', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '47c44052-2a62-4738-8d14-66a85385c5c3', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '6871578e-f59f-4227-85aa-1cc0835437fb', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '46fb67a7-05ea-4f9f-8d11-7d7aa49b5920', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '48a554f1-d610-4857-80d2-5b794d1371cd', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '487d53a6-a4d9-43ed-8a9d-48a5dbb6a1e0', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'df5d57ca-9ab1-47c4-80ec-c6206ac7b3aa', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '9db17513-a260-4902-8c45-200c1326c72f', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '06e05461-4c60-4ee8-83fa-d8d375dd2b4a', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '970a64c0-3439-4fa3-8d93-eedc1bc2b8d6', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '213b4cb9-e1de-41e0-8f2c-16dfbec596a2', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'd6d9fc7a-de2b-4d9f-839c-aab394128383', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '5a53725b-2082-4d68-8363-b98a075a5558', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'c01065bd-c55e-4a05-84d2-9d0ae44a7bf3', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '6cbb5558-9405-457e-8322-082c088e7249', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'aae1c364-7919-467e-843f-dd3d0ba94c76', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '60b57e6e-0733-46aa-819b-c33aa6e28642', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'ae0ac4b0-4bdf-46ca-8009-6e2ce88d15a7', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '7c1639b9-e097-474e-8ada-cec5d2d8793c', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '4cef8eff-c67d-4671-8c57-32d4b9298c59', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '78b4b6a5-9fb1-4fe8-8343-fa51b032e3af', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '94ef7b04-7b39-4f95-8179-c5c333ab8217', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'd0a4a3c1-cee8-41a3-8468-a4e76137d7ad', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'aa03065a-fe4f-447f-8fe2-3b53e58a2a10', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'a8d728ad-8fd0-414a-85c2-14e7d925e44e', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '1a9d3ec6-86de-4947-8065-d3041eb5bf4e', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '6edc2d93-0de5-4335-8a84-c2c31bd18736', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '0879719f-271c-42d2-8b35-898c07cc8ade', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'cc121819-30dc-4f9a-8bf8-0ae07ace3dda', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '6a11f32a-f27a-4187-8a2c-192a90106da7', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '63597f8c-dfc6-475e-8cc2-bfb832a28fbc', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '73bfe70d-898e-4159-8b6a-bae3a5a730fa', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '66072751-397d-48ed-82a2-21100ad1ed1b', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '77d7a169-6b7f-49ac-8d93-f191a589b377', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '0b5c9731-7099-4405-8cdc-a8ba4c6d4382', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'f3db05a1-d841-4d34-829f-7b43b3042e0f', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '7373b184-0312-4bc4-8149-b17a56d6266b', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '2d1ab2e0-5d27-4c1f-873c-a6420599d827', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '07015459-b161-4494-8e7d-7380d73116ad', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '88319f71-061f-4156-8ac6-d01f36a12859', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'ec3cbc63-fb68-4504-883c-786e0271877b', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'cbe52322-998a-49c9-89f4-51ca09d10468', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '2794cba8-7fb3-40a8-893b-10465b4651eb', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '57eb6a97-63f5-4e94-8446-0eee1caa2b46', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'b0b9a722-acc8-4c68-8e97-bb7eca45084d', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'd7d00b98-46a3-40e4-8cf7-bada0c804181', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '14e83cc9-42f7-474a-8e81-032837a052a5', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '31aabd69-c25f-47f9-8392-554ed5fce502', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '99e598eb-64fa-4e9b-8c60-a24cb7552255', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'e0ce6763-87ea-4c49-8ad6-95c4b378e054', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '7df72c08-6110-4e53-85fa-5b1de6e72ad7', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '3d01e0b0-22dc-4d81-80f3-2c30981e2f8d', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'c05e5bdd-cf4e-44de-809e-9cf17a44d775', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'cd4947b5-975f-4261-888b-c064f06e6d8e', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'a41a3653-9b11-4b34-8877-fbf2a75ef258', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '8e4d91c2-c560-4bb3-8942-c16da327fe47', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '9b2b91a7-f95a-4bf3-8089-7d4e8d7b3bf8', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '92ec6727-b7a6-4cd7-83ed-b80180821840', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '974f56b2-9586-4ac2-881a-b6f93cfb3107', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '3b260ae5-4b3b-45a4-8161-3291bf1c7d71', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '35749af6-20a5-44ee-8ee7-991a2f81bc7d', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '0463e7ad-aeae-47ac-83de-b3cc81aa6aae', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '95224ea2-c009-49fd-8faf-3e8a7ac7b10f', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '6ad8bfb6-b0a3-4999-8ff9-330c6e4db443', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '5ed06a6e-ad49-4f4d-8622-dfbcf8e3f9f9', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'ed7e9c69-f6b5-4aec-8f35-c1632ef4ae54', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'e3ee14f9-a8b6-47cc-83d6-453a627c1637', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'c57312de-d279-43ec-87f1-b321a39f09fe', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '5f997464-21cd-40ec-8ce3-a221e82ef911', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '5dff312a-54a5-4e41-85c8-c1e19a6237fb', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '3c2be2db-2df8-4802-8c91-b79ea85c132d', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '847ab7b9-4c47-4224-843f-891c9633fb50', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'fefac696-a25e-419f-88a5-cfabd43c2f5d', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '983c76f0-7458-44e4-80cb-9dd2837a3246', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '43d2c08f-0581-4763-84bf-6466cf2e4717', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '4d008344-6a34-4209-8649-3f47cf6d556e', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '9754dc36-98f5-41ee-83d5-a48f768f655c', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '29088b70-1439-4693-83eb-0e2f72812635', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'a4ea1d91-cd43-4a7e-8923-fafc01827b6a', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '6625e3ad-0206-4302-890a-54fae281abc2', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'da51e2b7-db91-462d-877d-8a72dce3fe1c', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '8add4497-c41b-4edb-8ffc-fbdbf0908905', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '12355085-528a-4192-8d3c-693fe0c42e1e', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'ec6772de-f7ab-426a-834f-3c0c85670d0b', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '39489023-e274-48e4-862d-10af17407586', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'dd49f813-1236-4c9f-84db-c11d565213b9', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'e9688ec8-009d-43e8-86f3-b4a1cefc2e72', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '9957b004-6fb0-4c7e-884d-82cfc5559c5c', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '39f56b6d-0568-46ab-88f7-15bf56d9907c', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '089129e4-7466-4e72-8239-294b5963c48b', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '2534d224-f62a-4bc1-87ad-cb68aacb5800', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'ebc151e7-6203-4a32-843d-05e4fcd224f1', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'e417c09e-174a-499e-85a5-917a7dfea539', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '993b0d56-38bc-452a-858e-66b315692f48', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'b1ed86e6-d79c-45a9-8f03-cc2fdbd9ff16', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '2a7be5bc-c51a-4c44-83fd-1e3d83dd05d7', 40.00, 'zeffy', 'Initial import from sheet'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'd249c170-9c43-4018-8183-fd124f7fa735', 40.00, 'zeffy', 'Initial import from sheet')
ON CONFLICT DO NOTHING;

-- 9. Player Payments (Zeffy tracker)
INSERT INTO "public"."player_payment" ("id", "player_id", "season_id", "zeffy_payment_id", "amount", "payer_email", "raw_payload") VALUES
(gen_random_uuid(), 'e209c7b9-0ac7-4c3f-800f-b2f06ab5602d', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_e209c7b9-0ac7-4c3f-800f-b2f06ab5602d', 40.00, 'tung.ouy@gmail.com', '{}'::jsonb),
(gen_random_uuid(), 'eb12017c-fb77-48f1-8909-70d17fd83fb6', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_eb12017c-fb77-48f1-8909-70d17fd83fb6', 40.00, 'richpuent@yahoo.com', '{}'::jsonb),
(gen_random_uuid(), 'f940c065-045d-415e-81f2-4d995f4556b5', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_f940c065-045d-415e-81f2-4d995f4556b5', 40.00, 'charan.mathi@yahoo.com', '{}'::jsonb),
(gen_random_uuid(), '5b494ba0-f35f-4d50-8f58-88bc7d0e1b90', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_5b494ba0-f35f-4d50-8f58-88bc7d0e1b90', 40.00, 'isaac.puent@ltta-mock.com', '{}'::jsonb),
(gen_random_uuid(), 'ed5e88f3-3861-4723-8b1f-278258fa1a98', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_ed5e88f3-3861-4723-8b1f-278258fa1a98', 40.00, 'mstenger6180@gmail.com', '{}'::jsonb),
(gen_random_uuid(), 'bf93a669-a572-4c53-882b-6efaa02d05b7', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_bf93a669-a572-4c53-882b-6efaa02d05b7', 40.00, 'lbower44@yahoo.com', '{}'::jsonb),
(gen_random_uuid(), '074f45c7-d1cc-4cda-8f0c-73ab4e0412e7', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_074f45c7-d1cc-4cda-8f0c-73ab4e0412e7', 40.00, 'jim.brieske@gmail.com', '{}'::jsonb),
(gen_random_uuid(), 'b23c59c2-5726-49d2-8b54-70d3f04e5a64', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_b23c59c2-5726-49d2-8b54-70d3f04e5a64', 40.00, 'kalyan.satyadeep@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '6e526980-b766-4126-8ff7-a08ccc452310', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_6e526980-b766-4126-8ff7-a08ccc452310', 40.00, 'sawyerkuck@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '1e4b4beb-fed9-490d-8956-e1f22555d135', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_1e4b4beb-fed9-490d-8956-e1f22555d135', 40.00, 'dave.wissink@ltta-mock.com', '{}'::jsonb),
(gen_random_uuid(), '8786c21a-f609-44a4-8d30-e2d17d3ee14c', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_8786c21a-f609-44a4-8d30-e2d17d3ee14c', 40.00, 'millsfamof6@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '88b3cdfa-4c69-497c-8f2b-5cb9ab2e8f0b', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_88b3cdfa-4c69-497c-8f2b-5cb9ab2e8f0b', 40.00, 'aareneson@trane.com', '{}'::jsonb),
(gen_random_uuid(), '2a2478d8-06d8-4a42-8e3c-c02f8d5e49f1', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_2a2478d8-06d8-4a42-8e3c-c02f8d5e49f1', 40.00, 'kirk.arneson@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '6366e981-3101-4adf-805c-33b0e2a366aa', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_6366e981-3101-4adf-805c-33b0e2a366aa', 40.00, 'brettfsm@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '3f80c7fe-9fa7-4df8-88cd-050d0b86b569', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_3f80c7fe-9fa7-4df8-88cd-050d0b86b569', 40.00, 'jgregas@yahoo.com', '{}'::jsonb),
(gen_random_uuid(), '4756c879-1719-4cea-8d91-9fe5efdbe575', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_4756c879-1719-4cea-8d91-9fe5efdbe575', 40.00, 'maddielohh@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '6fcc4337-4ad4-42c2-8a23-1062a8dd90c3', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_6fcc4337-4ad4-42c2-8a23-1062a8dd90c3', 40.00, 'tufficat@gmail.com', '{}'::jsonb),
(gen_random_uuid(), 'baf5769d-90e2-4da5-8b93-0ee0bfe60b00', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_baf5769d-90e2-4da5-8b93-0ee0bfe60b00', 40.00, 'stanton.loh@gmail.com', '{}'::jsonb),
(gen_random_uuid(), 'c49cad23-a794-4d2c-8d28-e64ee442bfa5', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_c49cad23-a794-4d2c-8d28-e64ee442bfa5', 40.00, 'malakaiberget@gmail.com', '{}'::jsonb),
(gen_random_uuid(), 'afc148c0-0b24-4f0d-8530-32a776a946e6', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_afc148c0-0b24-4f0d-8530-32a776a946e6', 40.00, 'kmgelbmann@gmail.com', '{}'::jsonb),
(gen_random_uuid(), 'fa231168-9242-42f5-899c-01699bd3fe40', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_fa231168-9242-42f5-899c-01699bd3fe40', 40.00, 'srmydy@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '9750e4ff-7970-4082-8f03-532db15bdfff', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_9750e4ff-7970-4082-8f03-532db15bdfff', 40.00, 'schigreg@luther.k12.wi.us', '{}'::jsonb),
(gen_random_uuid(), 'b81caec2-439f-49a6-8563-783a2a19ecad', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_b81caec2-439f-49a6-8563-783a2a19ecad', 40.00, 'eddingsa.dill@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '032313b5-764c-441a-8650-4cee780f8f70', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_032313b5-764c-441a-8650-4cee780f8f70', 40.00, 'matthewjisaacson@hotmail.com', '{}'::jsonb),
(gen_random_uuid(), '7b702586-6720-4958-8c0d-e8e4449ac295', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_7b702586-6720-4958-8c0d-e8e4449ac295', 40.00, 'marylaschenbrenner@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '5e002bdf-2292-40ea-8a46-46d4d2ab9d40', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_5e002bdf-2292-40ea-8a46-46d4d2ab9d40', 40.00, 'lacrosseusta@yahoo.com', '{}'::jsonb),
(gen_random_uuid(), 'a458470e-dd26-43bb-8617-4d8357d86693', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_a458470e-dd26-43bb-8617-4d8357d86693', 40.00, 'rhlevinger@yahoo.com', '{}'::jsonb),
(gen_random_uuid(), '2968d29a-d312-4044-85e3-d9ccc5464412', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_2968d29a-d312-4044-85e3-d9ccc5464412', 40.00, 'engenjudith@gmail.com', '{}'::jsonb),
(gen_random_uuid(), 'eba90def-1869-4afb-8ed4-d7b77454fe07', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_eba90def-1869-4afb-8ed4-d7b77454fe07', 40.00, 'amandawilkie98@gmail.com', '{}'::jsonb),
(gen_random_uuid(), 'c8262133-3efc-4627-844a-e2c3d13fcb59', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_c8262133-3efc-4627-844a-e2c3d13fcb59', 40.00, 'mjharris84@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '37b26af4-01ef-42a0-8c6a-2571b7b44a9b', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_37b26af4-01ef-42a0-8c6a-2571b7b44a9b', 40.00, 'tunksnathan@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '65b8c820-2026-4e55-8a44-66acf0e17302', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_65b8c820-2026-4e55-8a44-66acf0e17302', 40.00, 'gavingoss13@gmail.com', '{}'::jsonb),
(gen_random_uuid(), 'de949656-a5a3-458b-8f8d-48f739511ed5', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_de949656-a5a3-458b-8f8d-48f739511ed5', 40.00, 'fwschwarz@hotmail.com', '{}'::jsonb),
(gen_random_uuid(), '335c73a5-0808-48d8-8d2e-009da680ee5c', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_335c73a5-0808-48d8-8d2e-009da680ee5c', 40.00, 'twinberg@aol.com', '{}'::jsonb),
(gen_random_uuid(), '9b5834d1-1f9e-4b80-8e62-220ceb2b36bc', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_9b5834d1-1f9e-4b80-8e62-220ceb2b36bc', 40.00, 'ryan.karie.johnson@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '7618161e-6522-4f95-825b-a420218f4456', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_7618161e-6522-4f95-825b-a420218f4456', 40.00, 'thurkkim@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '3171bb71-42a7-4013-8b46-ab6ffde3ae06', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_3171bb71-42a7-4013-8b46-ab6ffde3ae06', 40.00, 'mmm91492@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '658d461d-e6be-4f3f-8918-99509619bd55', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_658d461d-e6be-4f3f-8918-99509619bd55', 40.00, 'pcoppola6@yahoo.com', '{}'::jsonb),
(gen_random_uuid(), '35e4c6fe-b623-4c65-8285-7c2d241ed9b0', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_35e4c6fe-b623-4c65-8285-7c2d241ed9b0', 40.00, 'fritzwigz15@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '5959f6b4-504f-4866-85e5-b51cca52a528', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_5959f6b4-504f-4866-85e5-b51cca52a528', 40.00, 'seithamer@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '9153df0f-58d3-4e56-80dd-f743d3060054', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_9153df0f-58d3-4e56-80dd-f743d3060054', 40.00, 'magsmpls@yahoo.com', '{}'::jsonb),
(gen_random_uuid(), '7c57d768-1997-4c6c-8bde-e440f22e1340', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_7c57d768-1997-4c6c-8bde-e440f22e1340', 40.00, 'hanz2116@yahoo.com', '{}'::jsonb),
(gen_random_uuid(), 'e3eba457-bcb4-4aa5-8bad-f8bef7b006dc', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_e3eba457-bcb4-4aa5-8bad-f8bef7b006dc', 40.00, 'jason.herbert@dairylandpower.com', '{}'::jsonb),
(gen_random_uuid(), '636906e2-ef39-4a2e-89fb-27496cf3aa56', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_636906e2-ef39-4a2e-89fb-27496cf3aa56', 40.00, 'erinkherbert@gmail.com', '{}'::jsonb),
(gen_random_uuid(), 'e0fb1f18-579e-4989-8570-a01e9daa6631', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_e0fb1f18-579e-4989-8570-a01e9daa6631', 40.00, '8088rauch@charter.net', '{}'::jsonb),
(gen_random_uuid(), '45ee3124-c7ca-453a-87e0-55a0b20b36d2', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_45ee3124-c7ca-453a-87e0-55a0b20b36d2', 40.00, 'pandrew77@yahoo.com', '{}'::jsonb),
(gen_random_uuid(), '7bb4a303-807d-4e5f-82d7-6b4f79ce7183', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_7bb4a303-807d-4e5f-82d7-6b4f79ce7183', 40.00, 'brennanjquinn@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '54221383-2b98-49a2-86a2-63e8aab9145c', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_54221383-2b98-49a2-86a2-63e8aab9145c', 40.00, 'dondharvey@centurytel.net', '{}'::jsonb),
(gen_random_uuid(), '8211bd9f-ec22-47c1-8184-ba799e29cb37', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_8211bd9f-ec22-47c1-8184-ba799e29cb37', 40.00, 'dllange@charter.net', '{}'::jsonb),
(gen_random_uuid(), '1c7bd05d-1b8a-4adb-850e-32dbe46d80b9', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_1c7bd05d-1b8a-4adb-850e-32dbe46d80b9', 40.00, 'lruff@ticinsurance.com', '{}'::jsonb),
(gen_random_uuid(), '983c3872-e42d-4454-8f33-ea05b98fcc21', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_983c3872-e42d-4454-8f33-ea05b98fcc21', 40.00, 'coryruud@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '16bf7161-a3f9-4a86-8be5-442b351d9202', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_16bf7161-a3f9-4a86-8be5-442b351d9202', 40.00, 'penniepierce2@gmail.com', '{}'::jsonb),
(gen_random_uuid(), 'e314d427-6e5f-411c-8e4b-c4809fd47803', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_e314d427-6e5f-411c-8e4b-c4809fd47803', 40.00, 'sallyruud@charter.net', '{}'::jsonb),
(gen_random_uuid(), '918ff6f4-3774-4b40-88db-8eb029f375e7', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_918ff6f4-3774-4b40-88db-8eb029f375e7', 40.00, '4953drk@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '5c78a4b2-c9f8-4c4e-8d9c-414925a49fbe', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_5c78a4b2-c9f8-4c4e-8d9c-414925a49fbe', 40.00, 'paul.leitholdmusic@gmail.com', '{}'::jsonb),
(gen_random_uuid(), 'b2c9235d-250f-4d24-834b-6796d472d565', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_b2c9235d-250f-4d24-834b-6796d472d565', 40.00, 'sarabieneman@yahoo.com', '{}'::jsonb),
(gen_random_uuid(), '0d15342f-c238-4f42-8464-0696cb39cc30', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_0d15342f-c238-4f42-8464-0696cb39cc30', 40.00, 'marcus.missy5@yahoo.com', '{}'::jsonb),
(gen_random_uuid(), 'b018152e-511f-4738-887b-2f10864ac1fa', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_b018152e-511f-4738-887b-2f10864ac1fa', 40.00, 'juleskam57@gmail.com', '{}'::jsonb),
(gen_random_uuid(), 'b2b6f8b4-3ec8-460e-8b0c-b5b3baab9ab8', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_b2b6f8b4-3ec8-460e-8b0c-b5b3baab9ab8', 40.00, 'msasher05@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '0f6dd0b7-8ad2-48d2-821c-0cd3c8118c0b', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_0f6dd0b7-8ad2-48d2-821c-0cd3c8118c0b', 40.00, 'croraff@charter.net', '{}'::jsonb),
(gen_random_uuid(), 'ee1b4799-e47e-4350-8df0-d9b597e0305a', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_ee1b4799-e47e-4350-8df0-d9b597e0305a', 40.00, 'mhoeftleithold@gmail.com', '{}'::jsonb),
(gen_random_uuid(), 'b8a2dd08-e7a5-4b7a-838c-3af89193c0bf', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_b8a2dd08-e7a5-4b7a-838c-3af89193c0bf', 40.00, 'nianyb@gmail.com', '{}'::jsonb),
(gen_random_uuid(), 'd3dd9417-e229-464f-85ed-59162cdea8b2', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_d3dd9417-e229-464f-85ed-59162cdea8b2', 40.00, 'diehl.mattp@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '3deaa355-e57b-4da8-86a3-b5a5a6823b63', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_3deaa355-e57b-4da8-86a3-b5a5a6823b63', 40.00, 'tdwyer8989@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '12c46b24-6451-4aa8-8751-86d2ef5bcb03', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_12c46b24-6451-4aa8-8751-86d2ef5bcb03', 40.00, 'roskos.mcr@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '2d636d8d-ab43-4dc9-8e33-71ff748acfe7', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_2d636d8d-ab43-4dc9-8e33-71ff748acfe7', 40.00, 'soflaherty@lacrosselaw.com', '{}'::jsonb),
(gen_random_uuid(), 'd8675929-49d4-478f-8395-cccf04a2f3e5', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_d8675929-49d4-478f-8395-cccf04a2f3e5', 40.00, 'danielskemp@hotmail.com', '{}'::jsonb),
(gen_random_uuid(), 'fc4943a6-df18-4a22-888f-530a7a90748b', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_fc4943a6-df18-4a22-888f-530a7a90748b', 40.00, 'joanko34@aol.com', '{}'::jsonb),
(gen_random_uuid(), '5fb2cf9a-9e94-42a6-8940-25912bb55cc8', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_5fb2cf9a-9e94-42a6-8940-25912bb55cc8', 40.00, 'ann.kotnour@ltta-mock.com', '{}'::jsonb),
(gen_random_uuid(), '47c44052-2a62-4738-8d14-66a85385c5c3', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_47c44052-2a62-4738-8d14-66a85385c5c3', 40.00, 'wonderlingdrake@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '6871578e-f59f-4227-85aa-1cc0835437fb', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_6871578e-f59f-4227-85aa-1cc0835437fb', 40.00, 'stauner.core@alumni.uwlax.edu', '{}'::jsonb),
(gen_random_uuid(), '46fb67a7-05ea-4f9f-8d11-7d7aa49b5920', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_46fb67a7-05ea-4f9f-8d11-7d7aa49b5920', 40.00, 'dane.smith@ltta-mock.com', '{}'::jsonb),
(gen_random_uuid(), '48a554f1-d610-4857-80d2-5b794d1371cd', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_48a554f1-d610-4857-80d2-5b794d1371cd', 40.00, 'danieldrp@charter.net', '{}'::jsonb),
(gen_random_uuid(), '487d53a6-a4d9-43ed-8a9d-48a5dbb6a1e0', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_487d53a6-a4d9-43ed-8a9d-48a5dbb6a1e0', 40.00, 'xyuan6388@gmail.com', '{}'::jsonb),
(gen_random_uuid(), 'df5d57ca-9ab1-47c4-80ec-c6206ac7b3aa', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_df5d57ca-9ab1-47c4-80ec-c6206ac7b3aa', 40.00, 'benty613@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '9db17513-a260-4902-8c45-200c1326c72f', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_9db17513-a260-4902-8c45-200c1326c72f', 40.00, 'reagan1223@yahoo.com', '{}'::jsonb),
(gen_random_uuid(), '06e05461-4c60-4ee8-83fa-d8d375dd2b4a', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_06e05461-4c60-4ee8-83fa-d8d375dd2b4a', 40.00, 'jherde18@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '970a64c0-3439-4fa3-8d93-eedc1bc2b8d6', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_970a64c0-3439-4fa3-8d93-eedc1bc2b8d6', 40.00, 'hannah.exner@yahoo.com', '{}'::jsonb),
(gen_random_uuid(), '213b4cb9-e1de-41e0-8f2c-16dfbec596a2', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_213b4cb9-e1de-41e0-8f2c-16dfbec596a2', 40.00, 'bmansky@gmail.com', '{}'::jsonb),
(gen_random_uuid(), 'd6d9fc7a-de2b-4d9f-839c-aab394128383', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_d6d9fc7a-de2b-4d9f-839c-aab394128383', 40.00, 'm.rp74@yahoo.com', '{}'::jsonb),
(gen_random_uuid(), '5a53725b-2082-4d68-8363-b98a075a5558', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_5a53725b-2082-4d68-8363-b98a075a5558', 40.00, 'lubimi@centurytel.net', '{}'::jsonb),
(gen_random_uuid(), 'c01065bd-c55e-4a05-84d2-9d0ae44a7bf3', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_c01065bd-c55e-4a05-84d2-9d0ae44a7bf3', 40.00, 'shantorg42@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '6cbb5558-9405-457e-8322-082c088e7249', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_6cbb5558-9405-457e-8322-082c088e7249', 40.00, 'barreode@gmail.com', '{}'::jsonb),
(gen_random_uuid(), 'aae1c364-7919-467e-843f-dd3d0ba94c76', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_aae1c364-7919-467e-843f-dd3d0ba94c76', 40.00, 'johnson.katie2005@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '60b57e6e-0733-46aa-819b-c33aa6e28642', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_60b57e6e-0733-46aa-819b-c33aa6e28642', 40.00, 'amiteshm55@gmail.com', '{}'::jsonb),
(gen_random_uuid(), 'ae0ac4b0-4bdf-46ca-8009-6e2ce88d15a7', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_ae0ac4b0-4bdf-46ca-8009-6e2ce88d15a7', 40.00, 'sllim.dwight@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '7c1639b9-e097-474e-8ada-cec5d2d8793c', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_7c1639b9-e097-474e-8ada-cec5d2d8793c', 40.00, 'plo722@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '4cef8eff-c67d-4671-8c57-32d4b9298c59', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_4cef8eff-c67d-4671-8c57-32d4b9298c59', 40.00, 'danlewispiano@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '78b4b6a5-9fb1-4fe8-8343-fa51b032e3af', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_78b4b6a5-9fb1-4fe8-8343-fa51b032e3af', 40.00, 'joe_heer@hotmail.com', '{}'::jsonb),
(gen_random_uuid(), '94ef7b04-7b39-4f95-8179-c5c333ab8217', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_94ef7b04-7b39-4f95-8179-c5c333ab8217', 40.00, 'jhriver@mac.com', '{}'::jsonb),
(gen_random_uuid(), 'd0a4a3c1-cee8-41a3-8468-a4e76137d7ad', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_d0a4a3c1-cee8-41a3-8468-a4e76137d7ad', 40.00, 'lacschott@charter.net', '{}'::jsonb),
(gen_random_uuid(), 'aa03065a-fe4f-447f-8fe2-3b53e58a2a10', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_aa03065a-fe4f-447f-8fe2-3b53e58a2a10', 40.00, 'subtendor@hotmail.com', '{}'::jsonb),
(gen_random_uuid(), 'a8d728ad-8fd0-414a-85c2-14e7d925e44e', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_a8d728ad-8fd0-414a-85c2-14e7d925e44e', 40.00, 'lovelatte50@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '1a9d3ec6-86de-4947-8065-d3041eb5bf4e', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_1a9d3ec6-86de-4947-8065-d3041eb5bf4e', 40.00, 'onabus99@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '6edc2d93-0de5-4335-8a84-c2c31bd18736', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_6edc2d93-0de5-4335-8a84-c2c31bd18736', 40.00, 'brett.meddaugh@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '0879719f-271c-42d2-8b35-898c07cc8ade', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_0879719f-271c-42d2-8b35-898c07cc8ade', 40.00, 'pokeworld.vvm@gmail.com', '{}'::jsonb),
(gen_random_uuid(), 'cc121819-30dc-4f9a-8bf8-0ae07ace3dda', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_cc121819-30dc-4f9a-8bf8-0ae07ace3dda', 40.00, 'shinton@tranetechnologies.com', '{}'::jsonb),
(gen_random_uuid(), '6a11f32a-f27a-4187-8a2c-192a90106da7', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_6a11f32a-f27a-4187-8a2c-192a90106da7', 40.00, 'caleb.mcclung@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '63597f8c-dfc6-475e-8cc2-bfb832a28fbc', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_63597f8c-dfc6-475e-8cc2-bfb832a28fbc', 40.00, 'michael@mcurrent.name', '{}'::jsonb),
(gen_random_uuid(), '73bfe70d-898e-4159-8b6a-bae3a5a730fa', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_73bfe70d-898e-4159-8b6a-bae3a5a730fa', 40.00, 'anna.rydeski@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '66072751-397d-48ed-82a2-21100ad1ed1b', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_66072751-397d-48ed-82a2-21100ad1ed1b', 40.00, 'randerson529@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '77d7a169-6b7f-49ac-8d93-f191a589b377', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_77d7a169-6b7f-49ac-8d93-f191a589b377', 40.00, 'c_kahlow@yahoo.com', '{}'::jsonb),
(gen_random_uuid(), '0b5c9731-7099-4405-8cdc-a8ba4c6d4382', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_0b5c9731-7099-4405-8cdc-a8ba4c6d4382', 40.00, 'taysnelson20@gmail.com', '{}'::jsonb),
(gen_random_uuid(), 'f3db05a1-d841-4d34-829f-7b43b3042e0f', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_f3db05a1-d841-4d34-829f-7b43b3042e0f', 40.00, 'paytondemeyer1@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '7373b184-0312-4bc4-8149-b17a56d6266b', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_7373b184-0312-4bc4-8149-b17a56d6266b', 40.00, 'tialeen@outlook.com', '{}'::jsonb),
(gen_random_uuid(), '2d1ab2e0-5d27-4c1f-873c-a6420599d827', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_2d1ab2e0-5d27-4c1f-873c-a6420599d827', 40.00, 'leomnm@msn.com', '{}'::jsonb),
(gen_random_uuid(), '07015459-b161-4494-8e7d-7380d73116ad', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_07015459-b161-4494-8e7d-7380d73116ad', 40.00, 'johnn@nobleinsurance.net', '{}'::jsonb),
(gen_random_uuid(), '88319f71-061f-4156-8ac6-d01f36a12859', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_88319f71-061f-4156-8ac6-d01f36a12859', 40.00, 'laxoneills@charter.net', '{}'::jsonb),
(gen_random_uuid(), 'ec3cbc63-fb68-4504-883c-786e0271877b', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_ec3cbc63-fb68-4504-883c-786e0271877b', 40.00, 'debmikefahey@gmail.com', '{}'::jsonb),
(gen_random_uuid(), 'cbe52322-998a-49c9-89f4-51ca09d10468', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_cbe52322-998a-49c9-89f4-51ca09d10468', 40.00, 'zach.acklin@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '2794cba8-7fb3-40a8-893b-10465b4651eb', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_2794cba8-7fb3-40a8-893b-10465b4651eb', 40.00, 'laurono@charter.net', '{}'::jsonb),
(gen_random_uuid(), '57eb6a97-63f5-4e94-8446-0eee1caa2b46', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_57eb6a97-63f5-4e94-8446-0eee1caa2b46', 40.00, 'amyvalentine011@gmail.com', '{}'::jsonb),
(gen_random_uuid(), 'b0b9a722-acc8-4c68-8e97-bb7eca45084d', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_b0b9a722-acc8-4c68-8e97-bb7eca45084d', 40.00, 'timothyacklin@gmail.com', '{}'::jsonb),
(gen_random_uuid(), 'd7d00b98-46a3-40e4-8cf7-bada0c804181', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_d7d00b98-46a3-40e4-8cf7-bada0c804181', 40.00, 'srosew10@msn.com', '{}'::jsonb),
(gen_random_uuid(), '14e83cc9-42f7-474a-8e81-032837a052a5', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_14e83cc9-42f7-474a-8e81-032837a052a5', 40.00, 'ncrowder@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '31aabd69-c25f-47f9-8392-554ed5fce502', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_31aabd69-c25f-47f9-8392-554ed5fce502', 40.00, 'meyers.michael@mayo.edu', '{}'::jsonb),
(gen_random_uuid(), '99e598eb-64fa-4e9b-8c60-a24cb7552255', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_99e598eb-64fa-4e9b-8c60-a24cb7552255', 40.00, 'brianday99@hotmail.com', '{}'::jsonb),
(gen_random_uuid(), 'e0ce6763-87ea-4c49-8ad6-95c4b378e054', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_e0ce6763-87ea-4c49-8ad6-95c4b378e054', 40.00, 'busch.shira@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '7df72c08-6110-4e53-85fa-5b1de6e72ad7', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_7df72c08-6110-4e53-85fa-5b1de6e72ad7', 40.00, 'janeenday64@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '3d01e0b0-22dc-4d81-80f3-2c30981e2f8d', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_3d01e0b0-22dc-4d81-80f3-2c30981e2f8d', 40.00, 'pholmanlax@gmail.com', '{}'::jsonb),
(gen_random_uuid(), 'c05e5bdd-cf4e-44de-809e-9cf17a44d775', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_c05e5bdd-cf4e-44de-809e-9cf17a44d775', 40.00, 'austin.stahsberg@gmail.com', '{}'::jsonb),
(gen_random_uuid(), 'cd4947b5-975f-4261-888b-c064f06e6d8e', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_cd4947b5-975f-4261-888b-c064f06e6d8e', 40.00, 'jlfloppy@gmail.com', '{}'::jsonb),
(gen_random_uuid(), 'a41a3653-9b11-4b34-8877-fbf2a75ef258', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_a41a3653-9b11-4b34-8877-fbf2a75ef258', 40.00, 'gmcoleman@ymail.com', '{}'::jsonb),
(gen_random_uuid(), '8e4d91c2-c560-4bb3-8942-c16da327fe47', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_8e4d91c2-c560-4bb3-8942-c16da327fe47', 40.00, 'reallylazymark@yahoo.com', '{}'::jsonb),
(gen_random_uuid(), '9b2b91a7-f95a-4bf3-8089-7d4e8d7b3bf8', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_9b2b91a7-f95a-4bf3-8089-7d4e8d7b3bf8', 40.00, 'randydoc7@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '92ec6727-b7a6-4cd7-83ed-b80180821840', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_92ec6727-b7a6-4cd7-83ed-b80180821840', 40.00, 'bussld07@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '974f56b2-9586-4ac2-881a-b6f93cfb3107', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_974f56b2-9586-4ac2-881a-b6f93cfb3107', 40.00, 'franklingreene19@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '3b260ae5-4b3b-45a4-8161-3291bf1c7d71', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_3b260ae5-4b3b-45a4-8161-3291bf1c7d71', 40.00, 'nhoff377@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '35749af6-20a5-44ee-8ee7-991a2f81bc7d', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_35749af6-20a5-44ee-8ee7-991a2f81bc7d', 40.00, 'michellerank7@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '0463e7ad-aeae-47ac-83de-b3cc81aa6aae', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_0463e7ad-aeae-47ac-83de-b3cc81aa6aae', 40.00, 'sharonjharter@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '95224ea2-c009-49fd-8faf-3e8a7ac7b10f', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_95224ea2-c009-49fd-8faf-3e8a7ac7b10f', 40.00, 'gharter@harters.net', '{}'::jsonb),
(gen_random_uuid(), '6ad8bfb6-b0a3-4999-8ff9-330c6e4db443', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_6ad8bfb6-b0a3-4999-8ff9-330c6e4db443', 40.00, 'dahlgl17@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '5ed06a6e-ad49-4f4d-8622-dfbcf8e3f9f9', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_5ed06a6e-ad49-4f4d-8622-dfbcf8e3f9f9', 40.00, 'jdneukom@yahoo.com', '{}'::jsonb),
(gen_random_uuid(), 'ed7e9c69-f6b5-4aec-8f35-c1632ef4ae54', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_ed7e9c69-f6b5-4aec-8f35-c1632ef4ae54', 40.00, 'jrhildebrandt39@gmail.com', '{}'::jsonb),
(gen_random_uuid(), 'e3ee14f9-a8b6-47cc-83d6-453a627c1637', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_e3ee14f9-a8b6-47cc-83d6-453a627c1637', 40.00, 'dvbodelson@gmail.com', '{}'::jsonb),
(gen_random_uuid(), 'c57312de-d279-43ec-87f1-b321a39f09fe', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_c57312de-d279-43ec-87f1-b321a39f09fe', 40.00, 'dickdeml608@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '5f997464-21cd-40ec-8ce3-a221e82ef911', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_5f997464-21cd-40ec-8ce3-a221e82ef911', 40.00, 'agraewin@aol.com', '{}'::jsonb),
(gen_random_uuid(), '5dff312a-54a5-4e41-85c8-c1e19a6237fb', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_5dff312a-54a5-4e41-85c8-c1e19a6237fb', 40.00, 'ballasj@centurytel.net', '{}'::jsonb),
(gen_random_uuid(), '3c2be2db-2df8-4802-8c91-b79ea85c132d', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_3c2be2db-2df8-4802-8c91-b79ea85c132d', 40.00, 'barbrb2002@yahoo.com', '{}'::jsonb),
(gen_random_uuid(), '847ab7b9-4c47-4224-843f-891c9633fb50', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_847ab7b9-4c47-4224-843f-891c9633fb50', 40.00, 'terrijk@charter.net', '{}'::jsonb),
(gen_random_uuid(), 'fefac696-a25e-419f-88a5-cfabd43c2f5d', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_fefac696-a25e-419f-88a5-cfabd43c2f5d', 40.00, 'jill.graewin@ltta-mock.com', '{}'::jsonb),
(gen_random_uuid(), '983c76f0-7458-44e4-80cb-9dd2837a3246', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_983c76f0-7458-44e4-80cb-9dd2837a3246', 40.00, 'leahfortun@hotmail.com', '{}'::jsonb),
(gen_random_uuid(), '43d2c08f-0581-4763-84bf-6466cf2e4717', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_43d2c08f-0581-4763-84bf-6466cf2e4717', 40.00, 'josh.fortun@ltta-mock.com', '{}'::jsonb),
(gen_random_uuid(), '4d008344-6a34-4209-8649-3f47cf6d556e', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_4d008344-6a34-4209-8649-3f47cf6d556e', 40.00, 'carrcrew5@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '9754dc36-98f5-41ee-83d5-a48f768f655c', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_9754dc36-98f5-41ee-83d5-a48f768f655c', 40.00, 'marcou4@charter.net', '{}'::jsonb),
(gen_random_uuid(), '29088b70-1439-4693-83eb-0e2f72812635', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_29088b70-1439-4693-83eb-0e2f72812635', 40.00, 'moojelabi@yahoo.com', '{}'::jsonb),
(gen_random_uuid(), 'a4ea1d91-cd43-4a7e-8923-fafc01827b6a', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_a4ea1d91-cd43-4a7e-8923-fafc01827b6a', 40.00, 'macrosby@emplifyhealth.org', '{}'::jsonb),
(gen_random_uuid(), '6625e3ad-0206-4302-890a-54fae281abc2', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_6625e3ad-0206-4302-890a-54fae281abc2', 40.00, 'jerverdeleon@gmail.com', '{}'::jsonb),
(gen_random_uuid(), 'da51e2b7-db91-462d-877d-8a72dce3fe1c', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_da51e2b7-db91-462d-877d-8a72dce3fe1c', 40.00, 'ijsalvador1@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '8add4497-c41b-4edb-8ffc-fbdbf0908905', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_8add4497-c41b-4edb-8ffc-fbdbf0908905', 40.00, 'kurt@gutknecht.ws', '{}'::jsonb),
(gen_random_uuid(), '12355085-528a-4192-8d3c-693fe0c42e1e', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_12355085-528a-4192-8d3c-693fe0c42e1e', 40.00, 'theresewaltz3@gmail.com', '{}'::jsonb),
(gen_random_uuid(), 'ec6772de-f7ab-426a-834f-3c0c85670d0b', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_ec6772de-f7ab-426a-834f-3c0c85670d0b', 40.00, 'kaceynomland@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '39489023-e274-48e4-862d-10af17407586', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_39489023-e274-48e4-862d-10af17407586', 40.00, 'tylert614@gmail.com', '{}'::jsonb),
(gen_random_uuid(), 'dd49f813-1236-4c9f-84db-c11d565213b9', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_dd49f813-1236-4c9f-84db-c11d565213b9', 40.00, 'ydavidyao8@gmail.com', '{}'::jsonb),
(gen_random_uuid(), 'e9688ec8-009d-43e8-86f3-b4a1cefc2e72', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_e9688ec8-009d-43e8-86f3-b4a1cefc2e72', 40.00, 'jkbartley@charter.net', '{}'::jsonb),
(gen_random_uuid(), '9957b004-6fb0-4c7e-884d-82cfc5559c5c', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_9957b004-6fb0-4c7e-884d-82cfc5559c5c', 40.00, 'dinkelj3@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '39f56b6d-0568-46ab-88f7-15bf56d9907c', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_39f56b6d-0568-46ab-88f7-15bf56d9907c', 40.00, 'logandzlnsk@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '089129e4-7466-4e72-8239-294b5963c48b', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_089129e4-7466-4e72-8239-294b5963c48b', 40.00, 'alexmoorehiller@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '2534d224-f62a-4bc1-87ad-cb68aacb5800', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_2534d224-f62a-4bc1-87ad-cb68aacb5800', 40.00, 'erijohnson214@gmail.com', '{}'::jsonb),
(gen_random_uuid(), 'ebc151e7-6203-4a32-843d-05e4fcd224f1', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_ebc151e7-6203-4a32-843d-05e4fcd224f1', 40.00, 'lewis.kuhlman@me.com', '{}'::jsonb),
(gen_random_uuid(), 'e417c09e-174a-499e-85a5-917a7dfea539', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_e417c09e-174a-499e-85a5-917a7dfea539', 40.00, 'sarah.wengerter@gmail.com', '{}'::jsonb),
(gen_random_uuid(), '993b0d56-38bc-452a-858e-66b315692f48', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_993b0d56-38bc-452a-858e-66b315692f48', 40.00, 'brittmd101@gmail.com', '{}'::jsonb),
(gen_random_uuid(), 'b1ed86e6-d79c-45a9-8f03-cc2fdbd9ff16', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_b1ed86e6-d79c-45a9-8f03-cc2fdbd9ff16', 40.00, 'kdleque@yahoo.com', '{}'::jsonb),
(gen_random_uuid(), '2a7be5bc-c51a-4c44-83fd-1e3d83dd05d7', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_2a7be5bc-c51a-4c44-83fd-1e3d83dd05d7', 40.00, 'aharter@harters.net', '{}'::jsonb),
(gen_random_uuid(), 'd249c170-9c43-4018-8183-fd124f7fa735', '22222222-2222-2222-2222-222222222222', 'zeffy_mock_d249c170-9c43-4018-8183-fd124f7fa735', 40.00, 'bahrloganj.b@gmail.com', '{}'::jsonb)
ON CONFLICT DO NOTHING;

-- 10. Matches (matches and team_match)
INSERT INTO "public"."team_match" ("id", "date", "time", "courts", "home_team_id", "away_team_id", "status", "season_id", "location_id") VALUES
('66666666-6666-6666-6666-666666666661', '2026-05-05', '18:00', '1, 2, 3', '33333333-3333-3333-3333-333333333301', '33333333-3333-3333-3333-333333333302', 'completed', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111'),
('66666666-6666-6666-6666-666666666662', '2026-05-06', '18:00', '4, 5, 6', '33333333-3333-3333-3333-333333333323', '33333333-3333-3333-3333-333333333324', 'scheduled', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111')
ON CONFLICT (id) DO NOTHING;

INSERT INTO "public"."matches" ("id", "week", "date", "time", "courts", "home_team_number", "home_team_name", "home_team_night", "away_team_number", "away_team_name", "away_team_night", "status") VALUES
('66666666-6666-6666-6666-666666666661', 1, '2026-05-05', '18:00', '1, 2, 3', 1, 'Spin Doctors', 'tuesday', 2, 'Subs', 'tuesday', 'completed'),
('66666666-6666-6666-6666-666666666662', 1, '2026-05-06', '18:00', '4, 5, 6', 3, 'Hit Squad', 'wednesday', 4, 'Hot Shots', 'wednesday', 'scheduled')
ON CONFLICT (id) DO NOTHING;

INSERT INTO "public"."match_scores" ("id", "match_id", "home_lines_won", "away_lines_won", "home_total_games", "away_total_games", "home_won") VALUES
(gen_random_uuid(), '66666666-6666-6666-6666-666666666661', 2, 1, 30, 25, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO "public"."line_results" ("match_id", "line_number", "match_type", "home_set_1", "away_set_1", "home_set_2", "away_set_2", "home_set_3", "away_set_3", "home_won") VALUES
('66666666-6666-6666-6666-666666666661', 1, 'singles', 6, 4, 6, 2, null, null, true),
('66666666-6666-6666-6666-666666666661', 2, 'singles', 3, 6, 4, 6, null, null, false),
('66666666-6666-6666-6666-666666666661', 3, 'doubles', 6, 3, 5, 7, 7, 5, true)
ON CONFLICT DO NOTHING;
