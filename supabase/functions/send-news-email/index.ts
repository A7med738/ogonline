import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NewsEmailRequest {
  newsId: string;
  title: string;
  summary: string;
  category: string;
  imageUrl?: string;
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { newsId, title, summary, category, imageUrl }: NewsEmailRequest = await req.json();

    console.log('Sending news email for:', { newsId, title });

    // Get all subscribed users
    const { data: subscriptions, error: subscriptionError } = await supabase
      .from('email_subscriptions')
      .select('email')
      .eq('subscribed', true);

    if (subscriptionError) {
      console.error('Error fetching subscriptions:', subscriptionError);
      throw new Error('Failed to fetch email subscriptions');
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('No subscribers found');
      return new Response(JSON.stringify({ message: 'No subscribers found' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${subscriptions.length} subscribers`);

    // Create email template
    const emailHtml = `
      <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; text-align: right;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px; font-weight: bold;">🗞️ خبر جديد حصري!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">تطبيق حدائق أكتوبر</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e1e5e9; border-top: none;">
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <span style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 5px 15px; border-radius: 20px; font-size: 14px;">
              ${category}
            </span>
          </div>
          
          ${imageUrl ? `
            <div style="margin: 20px 0; text-align: center;">
              <img src="${imageUrl}" alt="${title}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />
            </div>
          ` : ''}
          
          <h2 style="color: #1f2937; font-size: 22px; margin: 20px 0 15px 0; line-height: 1.4;">
            ${title}
          </h2>
          
          <p style="color: #4b5563; line-height: 1.6; font-size: 16px; margin: 0 0 25px 0;">
            ${summary}
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${Deno.env.get('SITE_URL') || 'https://lovable.dev'}/news" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
              اقرأ الخبر كاملاً
            </a>
          </div>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 0 0 10px 10px; border: 1px solid #e1e5e9; border-top: none; text-align: center;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            تم إرسال هذا الإيميل لأنك مشترك في نشرة أخبار تطبيق حدائق أكتوبر
          </p>
          <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
            يمكنك إلغاء الاشتراك في أي وقت من إعدادات التطبيق
          </p>
        </div>
      </div>
    `;

    // Send emails to all subscribers
    const emailPromises = subscriptions.map(async (subscription) => {
      try {
        await resend.emails.send({
          from: 'تطبيق حدائق أكتوبر <news@resend.dev>',
          to: [subscription.email],
          subject: `🗞️ خبر جديد حصري: ${title}`,
          html: emailHtml,
        });
        console.log(`Email sent successfully to: ${subscription.email}`);
        return { email: subscription.email, status: 'success' };
      } catch (error) {
        console.error(`Failed to send email to ${subscription.email}:`, error);
        return { email: subscription.email, status: 'failed', error: error.message };
      }
    });

    const results = await Promise.all(emailPromises);
    const successCount = results.filter(r => r.status === 'success').length;
    const failedCount = results.filter(r => r.status === 'failed').length;

    console.log(`Email sending complete: ${successCount} successful, ${failedCount} failed`);

    return new Response(
      JSON.stringify({
        message: 'Emails sent',
        total: subscriptions.length,
        successful: successCount,
        failed: failedCount,
        results
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error("Error in send-news-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);