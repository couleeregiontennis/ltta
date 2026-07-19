-- Admin-only access to registrations and payments for the registration dashboard.
-- This follows the payment security hardening in PR #102 and adds the admin
-- read policies required by the new Registration Management page.

-- Admins can view all registrations (e.g. to manage the registration dashboard).
CREATE POLICY "Admins can view all registrations" ON public.registrations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.player
            WHERE user_id = auth.uid() AND is_admin = true
        )
    );

-- Admins can view all payments (e.g. to reconcile payment status).
CREATE POLICY "Admins can view all payments" ON public.payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.player
            WHERE user_id = auth.uid() AND is_admin = true
        )
    );
