CREATE OR REPLACE FUNCTION "public"."sync_user_metadata"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF NEW.user_id IS NOT NULL THEN
    UPDATE player
    SET first_name = CASE 
                       WHEN player.first_name IS NULL OR player.first_name = '' THEN split_part(NEW.email, '@', 1)
                       ELSE player.first_name
                     END,
        last_name = CASE 
                      WHEN player.last_name IS NULL OR player.last_name = '' THEN split_part(NEW.email, '@', 1)
                      ELSE player.last_name
                    END
    WHERE player.id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;
