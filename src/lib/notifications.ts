import { supabase } from '@/integrations/supabase/client';

interface NotificationData {
  title: string;
  url: string;
  subtitle?: string;
}

export const sendNewsNotification = async (data: NotificationData) => {
  try {
    // Use a temporary admin secret - this should be configured properly
    const adminSecret = 'temp-admin-secret-123'; // This should be replaced with actual secret management
    
    const { data: result, error } = await supabase.functions.invoke('notify-new-news', {
      body: data,
      headers: {
        'x-admin-secret': adminSecret
      }
    });

    if (error) {
      throw error;
    }

    console.log('Notification sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};


export const generateNewsUrl = (newsId: string) => {
  const baseUrl = 'https://3e2213ca-bd16-4ff2-8f69-45d0069c6783.lovableproject.com'; 
  return `${baseUrl}/news?id=${newsId}`;
};

export const sendTestNotification = async (newsItem: { id: string; title: string }) => {
  try {
    const newsUrl = generateNewsUrl(newsItem.id);
    await sendNewsNotification({
      title: `[اختبار] ${newsItem.title}`,
      url: newsUrl,
      subtitle: "هذا إشعار تجريبي - اضغط لقراءة التفاصيل"
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending test notification:', error);
    throw error;
  }
};