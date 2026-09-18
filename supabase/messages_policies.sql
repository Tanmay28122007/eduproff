-- =========================================================
-- ALLOW USERS & RECRUITERS TO DELETE AND END THEIR MESSAGES
-- Run this in Supabase SQL Editor
-- =========================================================

DROP POLICY IF EXISTS "Users can delete own messages" ON public.messages;
CREATE POLICY "Users can delete own messages" ON public.messages
FOR DELETE TO authenticated
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
