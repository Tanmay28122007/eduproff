import { supabase } from '@/integrations/supabase/client';

/**
 * Logs a verification attempt to the verification_logs table.
 *
 * @param {string} userId - The ID of the user attempting verification.
 * @param {boolean} success - Whether the verification attempt was successful.
 * @param {string} message - Additional message regarding the verification attempt.
 */
async function logVerificationAttempt(userId: string, success: boolean, message = '') {
    const { data, error } = await supabase
        .from('verification_logs')
        .insert([{ user_id: userId, status: success ? 'verified' : 'failed', message, created_at: new Date().toISOString() } as any]);

    if (error) {
        console.error('Error logging verification attempt:', error);
    } else {
        console.log('Verification attempt logged:', data);
    }
}

export default logVerificationAttempt;