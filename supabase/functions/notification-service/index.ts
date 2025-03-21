
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UserNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
  scheduled_for: string | null;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with admin privileges
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // SCHEDULED NOTIFICATIONS
    // Process notifications that are scheduled for now or in the past, but haven't been sent yet
    const now = new Date();
    const { data: dueNotifications, error: fetchError } = await supabaseAdmin
      .from("user_notifications")
      .select("*")
      .lte("scheduled_for", now.toISOString())
      .is("read", false);

    if (fetchError) {
      throw new Error(`Error fetching due notifications: ${fetchError.message}`);
    }

    console.log(`Found ${dueNotifications?.length || 0} due notifications`);

    // Process each due notification
    const processPromises = dueNotifications?.map(async (notification: UserNotification) => {
      try {
        // Mark notification as active (no longer scheduled)
        await supabaseAdmin
          .from("user_notifications")
          .update({ scheduled_for: null })
          .eq("id", notification.id);

        console.log(`Processed scheduled notification: ${notification.id}`);
        
        return { success: true, id: notification.id };
      } catch (err) {
        console.error(`Error processing notification ${notification.id}:`, err);
        return { success: false, id: notification.id, error: err };
      }
    }) || [];

    const results = await Promise.all(processPromises);

    // PERIODIC GLUCOSE CHECKS
    // Get users who haven't logged glucose in the last 12 hours
    const twelveHoursAgo = new Date();
    twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);

    // Get all users
    const { data: users, error: usersError } = await supabaseAdmin
      .from("profiles")
      .select("id");

    if (usersError) {
      throw new Error(`Error fetching users: ${usersError.message}`);
    }

    // For each user, check their recent logs
    const reminderPromises = users?.map(async (user) => {
      try {
        // Get most recent log
        const { data: recentLogs, error: logsError } = await supabaseAdmin
          .from("glucose_logs")
          .select("*")
          .eq("user_id", user.id)
          .order("timestamp", { ascending: false })
          .limit(1);

        if (logsError) {
          throw logsError;
        }

        // If no logs or last log is older than 12 hours, send reminder
        const shouldRemind = !recentLogs?.length || 
          new Date(recentLogs[0].timestamp) < twelveHoursAgo;

        if (shouldRemind) {
          // Check if we already sent a reminder in the last 12 hours
          const { data: recentReminders } = await supabaseAdmin
            .from("user_notifications")
            .select("*")
            .eq("user_id", user.id)
            .eq("type", "reminder")
            .gte("created_at", twelveHoursAgo.toISOString())
            .limit(1);

          // Only send if no recent reminder exists
          if (!recentReminders?.length) {
            const { error: reminderError } = await supabaseAdmin
              .from("user_notifications")
              .insert({
                user_id: user.id,
                title: "Glucose Check Reminder",
                message: "It's been a while since your last glucose check. Consider checking your levels now.",
                type: "reminder",
              });

            if (reminderError) {
              throw reminderError;
            }

            return { success: true, userId: user.id, action: "reminder_sent" };
          }
        }

        return { success: true, userId: user.id, action: "no_action_needed" };
      } catch (err) {
        console.error(`Error processing reminders for user ${user.id}:`, err);
        return { success: false, userId: user.id, error: err };
      }
    }) || [];

    const reminderResults = await Promise.all(reminderPromises);

    return new Response(
      JSON.stringify({
        success: true,
        processed: {
          dueNotifications: results,
          reminders: reminderResults,
        },
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error("Error in notification service:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
});
