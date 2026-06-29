# Ticket: Real-time Rainout SMS Alerts

## Why (Product Goal & Value)
When matches are rained out, admins or captains mark them as "Rained Out" in the dashboard. However, players are often already driving to the courts because they didn't check the website. We need a real-time SMS broadcast to instantly alert all captains and scheduled players for matches canceled due to rain, saving them unnecessary travel.

---

## Technical Architecture & Implementation Plan ("How")

### 1. Triggers & Event Flow
*   When an admin updates a match status to `rained_out` in `team_match`, a Database Webhook fires.
*   The webhook triggers a Supabase Edge Function `/functions/rainout-sms`.
*   The Edge function:
    1.  Extracts the `match_id`, home team, and away team.
    2.  Queries the rosters of both teams to extract all player phone numbers.
    3.  Dispatches SMS messages via the Twilio Messaging API.

### 2. Database Columns
To support SMS, we need to capture phone numbers and SMS consent:
```sql
ALTER TABLE public.player 
    ADD COLUMN phone_number VARCHAR(20),
    ADD COLUMN sms_opt_in BOOLEAN DEFAULT false;
```

### 3. Twilio API Integration (Edge Function)
Create the edge function `rainout-sms` at `supabase/functions/rainout-sms/index.ts`:
*   Use environment variables `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER`.

---

## Step-by-Step Code Walkthrough for the Intern
1.  **Define the Edge Function:**
    ```typescript
    import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
    import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

    serve(async (req) => {
      const { record, old_record } = await req.json(); // DB Webhook payload
      
      // Only trigger if status changed to 'rained_out'
      if (record.status !== 'rained_out' || old_record.status === 'rained_out') {
        return new Response("No-op", { status: 200 });
      }

      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' // Need service role to query phone numbers
      );

      // 1. Fetch team numbers/names for the match
      // 2. Fetch all players on home_team_id & away_team_id who have phone_number AND sms_opt_in = true
      const { data: players } = await supabase
        .from('player')
        .select('phone_number, first_name')
        .or(`team.eq.${record.home_team_id},team.eq.${record.away_team_id}`) // Custom join query
        .eq('sms_opt_in', true);

      // 3. Dispatch SMS requests in parallel via Twilio API
      const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID');
      const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
      const twilioFrom = Deno.env.get('TWILIO_PHONE_NUMBER');

      const message = `LTTA Alert: The match scheduled for tonight (${record.date} @ ${record.time}) has been rained out. Please coordinate with your captain for reschedules.`;

      const sendSms = async (to: string) => {
        const body = new URLSearchParams({ To: to, From: twilioFrom, Body: message });
        await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
          method: "POST",
          headers: {
            "Authorization": `Basic ${btoa(`${twilioSid}:${twilioAuthToken}`)}`,
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: body.toString()
        });
      };

      await Promise.all(players.map(p => sendSms(p.phone_number)));

      return new Response(JSON.stringify({ sentCount: players.length }), { status: 200 });
    });
    ```
2.  **Add Consent Toggle to Profile:**
    In [PlayerProfile.jsx](file:///home/brett/Code/ltta/src/components/PlayerProfile.jsx), add an SMS opt-in checkbox and a phone number text field.

---

## Testing Plan (Acceptance Criteria)
1.  **Playwright Test File:** [rainout.spec.js](file:///home/brett/Code/ltta/tests/e2e/rainout.spec.js)
2.  **Verification:**
    *   Verify checking the SMS opt-in saves to `player.phone_number` and `player.sms_opt_in` in the database.
    *   Mock the Twilio API call and confirm it receives requests for all registered player numbers when a match is updated to `rained_out`.

---

## Potential Gotchas & Intern Traps
*   **Twilio Sandbox Numbers:** For testing, Twilio accounts in sandbox mode can only send SMS to *verified numbers*. Interns should use mock testing endpoints or verify their own personal phone number for local developer validation.
*   **Formatting Phone Numbers:** Validate that user phone numbers are clean digits or E.164 formatted (e.g. `+16085550123`) before passing to Twilio, preventing webhook failures.
