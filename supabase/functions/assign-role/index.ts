import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { buildCorsHeaders } from "../_shared/cors.ts";

// Input validation schema
const RoleSchema = z.object({
  requestedRole: z.enum(["candidate", "recruiter", "institution"], {
    errorMap: () => ({ message: "Invalid role. Must be 'candidate', 'recruiter', or 'institution'" }),
  }),
});

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  maxRequests: 3,         // 3 role changes per hour (should rarely be needed)
  windowMs: 60 * 60 * 1000, // 1 hour
  keyPrefix: 'assign-role'
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
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error("Missing or invalid authorization header");
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
      console.error("Authentication failed:", claimsError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log(`Processing role assignment for user: ${userId}`);

    // Use service role for rate limiting and updates
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Check rate limit
    const rateLimitResult = await checkRateLimit(userId, RATE_LIMIT_CONFIG, supabaseAdmin);
    if (!rateLimitResult.allowed) {
      console.log(`Rate limit exceeded for user: ${userId}`);
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
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

    // Parse and validate the request body
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validated = RoleSchema.safeParse(body);
    if (!validated.success) {
      console.error("Validation failed:", validated.error.errors);
      return new Response(
        JSON.stringify({ error: validated.error.errors[0]?.message || 'Invalid role' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { requestedRole } = validated.data;

    // Check if user already has a role (should be assigned by trigger)
    const { data: existingRole, error: fetchError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = row not found, which is acceptable
      console.error("Error fetching existing role:", fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to check existing role' }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (existingRole) {
      // Update existing role (trigger-assigned 'candidate' to user-selected role)
      const { error: updateError } = await supabaseAdmin
        .from('user_roles')
        .update({ role: requestedRole })
        .eq('user_id', userId);

      if (updateError) {
        console.error("Error updating role:", updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to update role' }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.log(`Updated role for user ${userId} from ${existingRole.role} to ${requestedRole}`);
    } else {
      // Insert new role (should rarely happen since trigger creates it)
      const { error: insertError } = await supabaseAdmin
        .from('user_roles')
        .insert({ user_id: userId, role: requestedRole });

      if (insertError) {
        console.error("Error inserting role:", insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to assign role' }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.log(`Inserted role ${requestedRole} for user ${userId}`);
    }

    return new Response(
      JSON.stringify({ success: true, role: requestedRole }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "X-RateLimit-Remaining": String(rateLimitResult.remaining)
        } 
      }
    );

  } catch (error) {
    console.error("Error in assign-role:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Role assignment failed' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
