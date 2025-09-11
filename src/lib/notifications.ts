import { supabase } from '@/integrations/supabase/client';

interface NotificationData {
  title: string;
  url: string;
  subtitle?: string;
}

export const sendNewsNotification = async (data: NotificationData) => {
  try {
    const { data: result, error } = await supabase.functions.invoke('notify-new-news', {
      body: data,
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


import { generateUniversalUrl, DEEP_LINK_PATHS, generateDeepLink } from '@/utils/deepLinkUtils';

export const generateNewsUrl = (newsId: string) => {
  // Always use deep link scheme for notifications to ensure app opens
  return generateDeepLink(DEEP_LINK_PATHS.NEWS, { id: newsId });
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