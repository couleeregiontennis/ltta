-- Add status column to track pending vs verified payments
ALTER TABLE public.season_payments 
ADD COLUMN status text DEFAULT 'verified' CHECK (status IN ('pending', 'verified'));

-- Update existing policy or add a new one for users to self-report
-- They can only insert payments where player_id matches their own player record
CREATE POLICY "Allow users to insert their own payments" 
ON public.season_payments 
FOR INSERT TO authenticated 
WITH CHECK (
    player_id IN (
        SELECT id 
        FROM public.player 
        WHERE user_id = auth.uid()
    )
);
