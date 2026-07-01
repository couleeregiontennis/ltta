# Ticket: Automated Notifications

## Why (Product Goal & Value)
Captains and players frequently miss critical schedule changes, substitute opportunities, or score flags because they do not check the portal daily. We need a reliable notification system to send real-time email alerts for events like:
*   Disputed matches (score flags).
*   Substitute player requests (Sub Board).
*   Invitation of a player to join a team roster.
*   Sign-up verification.

---

## Technical Architecture & Implementation Plan ("How")

### 1. Database Table
Create a `notifications` table to keep track of alerts and prevent duplicates:
```sql
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID REFERENCES public.player(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'dispute', 'sub_request', 'roster_invite'
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'failed'
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own notifications
CREATE POLICY "Users can view own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = recipient_id);
```

### 2. Edge Function for Sending Emails (Resend API)
We will implement a Supabase Edge Function `send-email` that triggers on inserts into the `notifications` table:
*   **Path:** `supabase/functions/send-email/index.ts`
*   **Action:** When a row is inserted, the database webhooks trigger this function. It uses the Resend API to dispatch emails.
*   **API Key:** Set `RESEND_API_KEY` environment variable in Supabase dashboard.

### 3. Database Webhooks Config
Configure database triggers to insert notification logs:
```sql
-- Trigger for Match Dispute Flags
CREATE OR REPLACE FUNCTION notify_match_dispute()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'disputed' AND OLD.status != 'disputed' THEN
        -- Notify Admin & Both Team Captains
        INSERT INTO public.notifications (recipient_id, type, title, body, metadata)
        SELECT 
            p.id, 
            'dispute', 
            'Match Disputed', 
            'A match played by your team has been flagged for dispute.',
            jsonb_build_object('match_id', NEW.id)
        FROM public.player p
        INNER JOIN public.player_to_team ptt ON ptt.player = p.id
        WHERE (ptt.team = NEW.home_team_id OR ptt.team = NEW.away_team_id) AND p.is_captain = true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_notify_match_dispute
    AFTER UPDATE ON public.team_match
    FOR EACH ROW
    EXECUTE FUNCTION notify_match_dispute();
```

---

## Step-by-Step Code Walkthrough for the Intern
1.  **Run SQL Migrations:** Execute the schema SQL to create the `notifications` table, trigger function, and trigger binding.
2.  **Initialize the Edge Function:**
    Use Deno's standard libraries to structure `supabase/functions/send-email/index.ts`:
    ```typescript
    import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

    serve(async (req) => {
      const { record } = await req.json(); // Provided by Supabase Webhook payload
      
      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      
      // Fetch recipient email
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${resendApiKey}`
        },
        body: JSON.stringify({
          from: "LTTA <notifications@couleeregiontennis.org>",
          to: [record.recipient_email],
          subject: record.title,
          html: `<p>${record.body}</p>`
        })
      });

      return new Response(JSON.stringify({ success: response.ok }), { status: 200 });
    })
    ```
3.  **Register the Webhook in Supabase:**
    Go to Supabase Dashboard -> Database -> Webhooks, and bind the `notifications` INSERT event to post to the `send-email` Edge Function.

---

## Testing Plan (Acceptance Criteria)
1.  **Playwright Test File:** [notifications.spec.js](file:///home/brett/Code/ltta/tests/e2e/notifications.spec.js)
2.  **Mocks:** Assert that inserting a record triggers the hook.
3.  **UI Verification:**
    *   Verify notifications are displayed in a dropdown or history tray on the dashboard.
    *   Add tests to confirm notifications are marked "read" when the user clicks them.

---

## Potential Gotchas & Intern Traps
*   **Infinite Hook Loops:** Avoid triggers that update the same table and recursively fire themselves (e.g., updating `notifications` inside a `notifications` trigger).
*   **RLS Policies:** Make sure the system-level Edge Function bypasses RLS by using the `service_role` client when looking up recipient emails from auth schemas, since players can't read other players' emails directly.
