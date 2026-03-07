import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { content, captchaToken } = await req.json()

    // Enhanced Input Validation
    if (!content || typeof content !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid content format.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (content.length < 10) {
      return new Response(
        JSON.stringify({ error: 'Suggestion must be at least 10 characters long.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (content.length > 1000) {
      return new Response(
        JSON.stringify({ error: 'Suggestion must not exceed 1000 characters.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // 1. Initialize Supabase Client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 2. Authenticate User
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
        return new Response(
            JSON.stringify({ error: 'Missing Authorization header.' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        )
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    
    if (authError || !user) {
        return new Response(
            JSON.stringify({ error: 'Unauthorized.' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        )
    }

    // 3. Verify CAPTCHA (Optional but good practice)
    const TURNSTILE_SECRET_KEY = Deno.env.get('TURNSTILE_SECRET_KEY')
    if (TURNSTILE_SECRET_KEY && captchaToken) {
        const ip = req.headers.get('cf-connecting-ip')
        
        const formData = new FormData();
        formData.append('secret', TURNSTILE_SECRET_KEY);
        formData.append('response', captchaToken);
        formData.append('remoteip', ip);

        const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
        const result = await fetch(url, {
            body: formData,
            method: 'POST',
        });

        const outcome = await result.json();
        if (!outcome.success) {
             return new Response(
                JSON.stringify({ error: 'CAPTCHA verification failed.' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            )
        }
    }

    // 4. Insert Suggestion (Initial Save)
    const { data: suggestionData, error: dbError } = await supabase
      .from('suggestions')
      .insert([
        {
          content: content,
          user_id: user.id, // Authenticated User ID
          status: 'pending'
        },
      ])
      .select()
      .single()

    if (dbError) throw dbError

    // 5. Call Jules API
    let julesResponseData = null;
    const JULES_API_KEY = Deno.env.get('JULES_API_KEY') || Deno.env.get('VITE_JULES_API_KEY');
    const JULES_PROJECT_ID = Deno.env.get('JULES_PROJECT_ID');
    const JULES_LOCATION = Deno.env.get('JULES_LOCATION');

    if (JULES_API_KEY && JULES_PROJECT_ID && JULES_LOCATION) {
        try {
            console.log("Calling Jules API...");
            const julesUrl = `https://jules.googleapis.com/v1alpha/projects/${JULES_PROJECT_ID}/locations/${JULES_LOCATION}/sessions?key=${JULES_API_KEY}`;
            const julesPayload = {
                // Adjust this payload structure if the API requires something specific
                // Assuming a standard session creation or prompt execution
                source: "user-suggestion-feature", 
                prompt: `You are the Product Owner (@ProductOwner) for the Coulee Region Tennis Association (LTTA) website. 
A user has submitted the following suggestion:
"${content}"

Your instructions:
1. Determine if this suggestion is related to the website/software application itself, OR if it's a general league policy/leadership request (e.g., changing rules, fees, tennis formats).
2. If it is a leadership/policy request, politely thank them and state that this will be forwarded to the LTTA Board for review.
3. If it is a website/software request, act as the Product Owner. Briefly refine the request into a high-level user story, and state that you are invoking the "/pipeline" skill so your development team (@Architect, @Developer, @QA) can begin evaluating it for the roadmap.`
            };

            const julesRes = await fetch(julesUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(julesPayload)
            });

            if (julesRes.ok) {
                julesResponseData = await julesRes.json();
                
                // Update the suggestion with Jules' response
                await supabase
                    .from('suggestions')
                    .update({ jules_response: julesResponseData, status: 'processed' })
                    .eq('id', suggestionData.id);
            } else {
                console.error("Jules API Error:", julesRes.status, await julesRes.text());
                // Don't fail the request, just log it. The suggestion is saved.
            }
        } catch (julesError) {
            console.error("Jules Integration Failed:", julesError);
        }
    } else {
        console.warn("Jules API credentials missing. Skipping AI integration.");
    }

    return new Response(
      JSON.stringify({ 
          message: 'Suggestion submitted successfully!', 
          data: suggestionData,
          jules_response: julesResponseData 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
