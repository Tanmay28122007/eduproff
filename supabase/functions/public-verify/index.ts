import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { buildCorsHeaders } from "../_shared/cors.ts";

// UUID validation schema
const CertificateIdSchema = z.object({
  certificateId: z.string().uuid("Invalid certificate ID format"),
});

// Rate limiting configuration for public endpoint
const RATE_LIMIT_CONFIG = {
  maxRequests: 20,        // 20 requests per 5 minutes
  windowMs: 5 * 60 * 1000, // 5 minutes
  keyPrefix: 'public-verify'
};

// Check rate limit using database
async function checkRateLimit(
  identifier: string,
  config: typeof RATE_LIMIT_CONFIG,
  supabaseAdmin: any
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const key = `${config.keyPrefix}:${identifier}`;
  const now = Date.now();
  const windowStart = now - config.windowMs;
  const resetTime = now + config.windowMs;
  
  const { data: existing } = await supabaseAdmin
    .from('rate_limits')
    .select('count, window_start')
    .eq('key', key)
    .maybeSingle();
  
  if (!existing || existing.window_start < windowStart) {
    // New window - reset or create entry
    await supabaseAdmin.from('rate_limits').upsert({
      key,
      count: 1,
      window_start: now,
      updated_at: new Date().toISOString()
    });
    return { allowed: true, remaining: config.maxRequests - 1, resetTime };
  }
  
  if (existing.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetTime: existing.window_start + config.windowMs };
  }
  
  await supabaseAdmin.from('rate_limits').update({
    count: existing.count + 1,
    updated_at: new Date().toISOString()
  }).eq('key', key);
  
  return { 
    allowed: true, 
    remaining: config.maxRequests - existing.count - 1,
    resetTime: existing.window_start + config.windowMs
  };
}

serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role for rate limiting and queries
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get client IP for rate limiting
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               req.headers.get('x-real-ip') || 
               'unknown';
    
    // Check rate limit
    const rateLimitResult = await checkRateLimit(ip, RATE_LIMIT_CONFIG, supabaseAdmin);
    if (!rateLimitResult.allowed) {
      console.log(`Rate limit exceeded for IP: ${ip}`);
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "X-RateLimit-Limit": String(RATE_LIMIT_CONFIG.maxRequests),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(rateLimitResult.resetTime)
          } 
        }
      );
    }

    // Parse and validate request body
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validated = CertificateIdSchema.safeParse(body);
    if (!validated.success) {
      return new Response(
        JSON.stringify({ error: "Invalid certificate ID format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { certificateId } = validated.data;
    console.log(`Public verification request for certificate: ${certificateId}`);

    // Fetch only public-safe certificate info
    const { data: certificate, error } = await supabaseAdmin
      .from("certificates")
      .select("id, title, issuer, verification_status, issue_date, created_at")
      .eq("id", certificateId)
      .maybeSingle();

    if (error) {
      console.error("Database error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to verify certificate" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!certificate) {
      return new Response(
        JSON.stringify({ 
          found: false, 
          message: "No certificate found with this ID" 
        }),
        { 
          status: 404, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "X-RateLimit-Remaining": String(rateLimitResult.remaining)
          } 
        }
      );
    }

    console.log(`Certificate found: ${certificate.title} - Status: ${certificate.verification_status}`);

    return new Response(
      JSON.stringify({
        found: true,
        certificate: {
          id: certificate.id,
          title: certificate.title,
          issuer: certificate.issuer,
          status: certificate.verification_status,
          issueDate: certificate.issue_date,
          verifiedAt: certificate.created_at,
        }
      }),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "X-RateLimit-Remaining": String(rateLimitResult.remaining)
        } 
      }
    );

  } catch (error) {
    console.error("Error in public-verify:", error);
    return new Response(
      JSON.stringify({ error: "Verification failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
