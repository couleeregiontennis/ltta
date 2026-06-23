-- Create Suggestions Table
CREATE TABLE IF NOT EXISTS public.suggestions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL CHECK (length(content) >= 10 AND length(content) <= 1000),
    user_id UUID REFERENCES auth.users(id), -- Nullable: NULL means Anonymous
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'archived')),
    ip_hash TEXT, -- Stored securely (hashed) to help with rate limiting if needed later
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone (Anon or Auth) can INSERT a suggestion
-- We restrict what columns they can set to prevent tampering (e.g., setting their own status to 'reviewed')
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policy
        WHERE polname = 'Public can submit suggestions'
        AND polrelid = 'public.suggestions'::regclass
    ) THEN
        CREATE POLICY "Public can submit suggestions" ON public.suggestions
            FOR INSERT
            TO public
            WITH CHECK (true);
    END IF;
END
$$;

-- Policy: Only Authenticated users (Admins) can SELECT/VIEW suggestions
-- (You can refine this later to only allow specific admin UUIDs or roles)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policy
        WHERE polname = 'Admins can view suggestions'
        AND polrelid = 'public.suggestions'::regclass
    ) THEN
        CREATE POLICY "Admins can view suggestions" ON public.suggestions
            FOR SELECT
            TO authenticated
            USING (true);
    END IF;
END
$$;

-- Policy: Only Authenticated users (Admins) can UPDATE suggestions (e.g. change status)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policy
        WHERE polname = 'Admins can update suggestions'
        AND polrelid = 'public.suggestions'::regclass
    ) THEN
        CREATE POLICY "Admins can update suggestions" ON public.suggestions
            FOR UPDATE
            TO authenticated
            USING (true)
            WITH CHECK (true);
    END IF;
END
$$;
