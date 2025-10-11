import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CheckInRequest {
  qrCode: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { qrCode }: CheckInRequest = await req.json();

    console.log('Processing check-in for QR code:', qrCode);

    // Find registration by QR code
    const { data: registration, error: findError } = await supabase
      .from('event_registrations')
      .select(`
        id,
        first_name,
        last_name,
        email,
        checked_in,
        checked_in_at,
        event_id,
        events (
          title,
          event_date
        )
      `)
      .eq('qr_code', qrCode)
      .single();

    if (findError || !registration) {
      console.error('Registration not found:', findError);
      return new Response(
        JSON.stringify({ error: 'Invalid QR code' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Check if already checked in
    if (registration.checked_in) {
      return new Response(
        JSON.stringify({ 
          success: true,
          alreadyCheckedIn: true,
          attendee: {
            firstName: registration.first_name,
            lastName: registration.last_name,
            email: registration.email,
            checkedInAt: registration.checked_in_at
          },
          event: registration.events
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update check-in status
    const { error: updateError } = await supabase
      .from('event_registrations')
      .update({ checked_in: true })
      .eq('id', registration.id);

    if (updateError) {
      console.error('Error updating check-in status:', updateError);
      throw updateError;
    }

    console.log('Check-in successful for:', registration.email);

    return new Response(
      JSON.stringify({ 
        success: true,
        attendee: {
          firstName: registration.first_name,
          lastName: registration.last_name,
          email: registration.email
        },
        event: registration.events
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Check-in error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
