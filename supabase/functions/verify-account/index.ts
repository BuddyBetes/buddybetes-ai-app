import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { token } = await req.json();

    console.log('Verifying token:', token);

    // Find pending account
    const { data: pending, error: pendingError } = await supabase
      .from('pending_accounts')
      .select('*, event_registrations(*)')
      .eq('verification_token', token)
      .single();

    if (pendingError || !pending) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired verification token' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check expiry
    if (new Date(pending.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Verification token has expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create user account with temporary password
    const tempPassword = crypto.randomUUID();
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: pending.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        first_name: pending.first_name,
        last_name: pending.last_name,
      },
    });

    if (authError) throw authError;

    console.log('User created:', authData.user.id);

    // Update registration with user_id
    await supabase
      .from('event_registrations')
      .update({ user_id: authData.user.id })
      .eq('id', pending.event_registration_id);

    // Send QR code email
    const registration = pending.event_registrations;
    await supabase.functions.invoke('send-event-email', {
      body: {
        type: 'qr_code',
        email: pending.email,
        firstName: pending.first_name,
        qrCode: registration.qr_code,
        eventId: registration.event_id,
      },
    });

    // Delete pending account
    await supabase
      .from('pending_accounts')
      .delete()
      .eq('id', pending.id);

    // Send password reset email
    await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: pending.email,
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Account created successfully. Check your email for password setup instructions and your QR code.',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Verification error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
