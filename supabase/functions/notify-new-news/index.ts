import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-secret',
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

  const notification = {
    app_id: oneSignalAppId,
    included_segments: ["All"], // Send to all subscribed devices
    headings: { en: title, ar: title },
    contents: { en: subtitle || "اضغط لقراءة التفاصيل", ar: subtitle || "اضغط لقراءة التفاصيل" },
    data: {
      url: url,
      type: "news"
    },
    web_url: url,
    app_url: url
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
    // Verify admin secret
    const adminSecret = req.headers.get('x-admin-secret');
    const expectedSecret = Deno.env.get('ADMIN_SECRET');

    if (!adminSecret || !expectedSecret || adminSecret !== expectedSecret) {
      console.error('Invalid or missing admin secret');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }), 
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
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