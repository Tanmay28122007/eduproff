import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildCorsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify the JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;

    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ status: "not_found", trust_score: 0, message: "Invalid request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { certificate_id } = body;

    if (!certificate_id?.trim()) {
      return new Response(
        JSON.stringify({ status: "not_found", trust_score: 0, message: "Certificate ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const normalizedCode = certificate_id.trim();
    const { data: certRecord, error: dbError } = await serviceClient
      .from('issued_certificates')
      .select('*')
      .eq('certificate_id', normalizedCode)
      .maybeSingle();

    if (dbError) {
      console.error("Database query error:", dbError);
      return new Response(
        JSON.stringify({ status: "error", trust_score: 0, message: "Verification system error. Please try again later." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let result;

    if (certRecord) {
      result = {
        status: "verified",
        trust_score: 100,
        message: "Certificate Verified Successfully",
        student_name: certRecord.student_name,
        course_name: certRecord.course_name,
        issue_date: certRecord.issue_date,
      };
    } else {
      result = {
        status: "not_found",
        trust_score: 0,
        message: "Certificate Not Found",
      };
    }

    // Log the verification attempt using the authenticated user's ID
    try {
      await serviceClient.from('verification_logs').insert({
        certificate_id: normalizedCode,
        recruiter_id: userId,
        status: result.status,
        trust_score: result.trust_score,
      });
    } catch (logError) {
      console.error("Failed to log verification:", logError);
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in verify-certificate:", error);
    return new Response(
      JSON.stringify({ status: "error", trust_score: 0, message: "Verification system error." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
