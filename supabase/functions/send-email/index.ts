import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

serve(async (req) => {
  const payload = await req.json();
  const record = payload.record;

  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    return new Response(JSON.stringify({ error: "Missing RESEND_API_KEY" }), { status: 500 });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Fetch the recipient's email address using the recipient_id (player.id)
  const { data: player, error } = await supabase
    .from('player')
    .select('user_id')
    .eq('id', record.recipient_id)
    .single();

  if (error || !player || !player.user_id) {
    console.error("Failed to find player:", error);
    return new Response(JSON.stringify({ error: "Player not found" }), { status: 404 });
  }

  // Look up user email from auth.users
  const { data: userData, error: userError } = await supabase.auth.admin.getUserById(player.user_id);

  if (userError || !userData.user) {
     console.error("Failed to find user:", userError);
     return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
  }

  const recipientEmail = userData.user.email;

  // Send Email via Resend
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${resendApiKey}`
    },
    body: JSON.stringify({
      from: "LTTA Notifications <notifications@couleeregiontennis.org>",
      to: [recipientEmail],
      subject: record.title,
      html: `<p>${record.body}</p>`
    })
  });

  if (response.ok) {
     await supabase
      .from('notifications')
      .update({ status: 'sent' })
      .eq('id', record.id);
  } else {
     await supabase
      .from('notifications')
      .update({ status: 'failed' })
      .eq('id', record.id);
  }

  return new Response(JSON.stringify({ success: response.ok }), { status: 200 });
});
