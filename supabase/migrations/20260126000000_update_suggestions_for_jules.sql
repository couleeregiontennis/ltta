-- Add jules_response column to store the AI's feedback
ALTER TABLE public.suggestions ADD COLUMN IF NOT EXISTS jules_response JSONB;

-- Allow authenticated users to view their own suggestions
CREATE POLICY "Users can view own suggestions" ON public.suggestions
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
