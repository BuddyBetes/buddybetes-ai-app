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

    // Check if user already registered by email OR user_id
    const { data: existingReg } = await supabase
      .from('event_registrations')
      .select('id, qr_code')
      .eq('event_id', eventId)
      .or(userId ? `email.eq.${email},user_id.eq.${userId}` : `email.eq.${email}`)
      .maybeSingle();

    if (existingReg) {
      return new Response(
        JSON.stringify({ 
          success: true,
          alreadyRegistered: true,
          qrCode: existingReg.qr_code
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

    // If new user, create account immediately
    let newUserId = userId;
    if (!userId) {
      // Generate a temporary password for the new user
      const tempPassword = crypto.randomUUID();

      // Create the user account
      const { data: newUser, error: createUserError } = await supabase.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true, // Auto-confirm email since we're not using email verification
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
        }
      });

      if (createUserError) {
        console.error('Error creating user:', createUserError);
        throw createUserError;
      }

      newUserId = newUser.user.id;
      console.log('New user created:', newUserId);

      // Update the registration with the new user_id
      const { error: updateError } = await supabase
        .from('event_registrations')
        .update({ user_id: newUserId })
        .eq('id', registration.id);

      if (updateError) throw updateError;

      // Trigger password reset email (Supabase handles this automatically)
      await supabase.auth.admin.generateLink({
        type: 'recovery',
        email,
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        registrationId: registration.id,
        qrCode: qrCode,
        isNewUser: !userId,
        userId: newUserId,
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
