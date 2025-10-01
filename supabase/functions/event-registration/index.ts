import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RegistrationRequest {
  eventId: string;
  email: string;
  firstName: string;
  lastName: string;
  userId?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { eventId, email, firstName, lastName, userId }: RegistrationRequest = await req.json();

    console.log('Processing registration for:', { eventId, email, userId });

    // Check if user already registered
    const { data: existingReg } = await supabase
      .from('event_registrations')
      .select('id')
      .eq('event_id', eventId)
      .eq('email', email)
      .single();

    if (existingReg) {
      return new Response(
        JSON.stringify({ error: 'Already registered for this event' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate unique QR code
    const qrCode = crypto.randomUUID();
    const registrationType = userId ? 'existing_user' : 'new_user';

    // Create registration
    const { data: registration, error: regError } = await supabase
      .from('event_registrations')
      .insert({
        event_id: eventId,
        user_id: userId || null,
        email,
        first_name: firstName,
        last_name: lastName,
        qr_code: qrCode,
        registration_type: registrationType,
      })
      .select()
      .single();

    if (regError) throw regError;

    console.log('Registration created:', registration.id);

    // If new user, create pending account
    if (!userId) {
      const verificationToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiry

      const { error: pendingError } = await supabase
        .from('pending_accounts')
        .insert({
          email,
          first_name: firstName,
          last_name: lastName,
          verification_token: verificationToken,
          event_registration_id: registration.id,
          expires_at: expiresAt.toISOString(),
        });

      if (pendingError) throw pendingError;

      console.log('Pending account created with token:', verificationToken);

      // Send verification email
      await supabase.functions.invoke('send-event-email', {
        body: {
          type: 'verification',
          email,
          firstName,
          verificationToken,
          eventId,
        },
      });
    } else {
      // Send QR code email immediately for existing users
      await supabase.functions.invoke('send-event-email', {
        body: {
          type: 'qr_code',
          email,
          firstName,
          qrCode,
          eventId,
        },
      });
    }

    // Mark email as sent
    await supabase
      .from('event_registrations')
      .update({ email_sent: true })
      .eq('id', registration.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        registrationId: registration.id,
        requiresVerification: !userId,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
