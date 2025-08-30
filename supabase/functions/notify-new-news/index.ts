import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  title: string;
  url: string;
  subtitle?: string;
}

const sendBroadcastNotification = async ({ title, url, subtitle }: NotificationRequest) => {
  const oneSignalAppId = Deno.env.get('ONESIGNAL_APP_ID');
  const oneSignalApiKey = Deno.env.get('ONESIGNAL_REST_API_KEY');

  if (!oneSignalAppId || !oneSignalApiKey) {
    throw new Error('OneSignal credentials not configured');
  }

  // Generate web URL for web_url (OneSignal requires http/https)
  const webUrl = url.startsWith('ogonline://') 
    ? url.replace('ogonline://', 'https://ogonline.lovable.app/')
    : url;

  const notification = {
    app_id: oneSignalAppId,
    included_segments: ["All"], // Send to all subscribed devices
    headings: { en: title, ar: title },
    contents: { en: subtitle || "اضغط لقراءة التفاصيل", ar: subtitle || "اضغط لقراءة التفاصيل" },
    data: {
      url: url, // Keep deep link for app navigation
      type: "news"
    },
    web_url: webUrl, // Use HTTP URL for web
    app_url: url // Use deep link for app
  };

  console.log('Sending notification:', notification);

  const response = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${oneSignalApiKey}`
    },
    body: JSON.stringify(notification)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OneSignal API error:', errorText);
    throw new Error(`OneSignal API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  console.log('OneSignal response:', result);
  return result;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Enforce POST
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Authenticate caller and ensure admin role
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error('Missing Supabase environment variables');
      return new Response(JSON.stringify({ error: 'Server misconfiguration' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const authHeader = req.headers.get('Authorization') || '';
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { data: isAdmin, error: roleError } = await supabase.rpc('has_role', { _user_id: userData.user.id, _role: 'admin' });
    if (roleError || !isAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { title, url, subtitle }: NotificationRequest = await req.json();

    if (!title || !url) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: title and url' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const result = await sendBroadcastNotification({ title, url, subtitle });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notification sent successfully',
        oneSignalResponse: result 
      }), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in notify-new-news function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: error.message 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});