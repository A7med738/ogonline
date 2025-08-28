import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useNewsNotifications = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    let newsChannel: any;

    const setupRealtimeAndFetch = async () => {
      // Get user's last visit to news page
      const { data: userActivity } = await supabase
        .from('user_news_activity')
        .select('last_visited_at')
        .eq('user_id', user.id)
        .single();

      const lastVisited = userActivity?.last_visited_at || '1970-01-01T00:00:00Z';

      // Count unread news
      const { data: unreadNews, count } = await supabase
        .from('news')
        .select('*', { count: 'exact', head: true })
        .gt('published_at', lastVisited);

      setUnreadCount(count || 0);

      // Set up realtime subscription for new news
      newsChannel = supabase
        .channel('news-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'news'
          },
          (payload) => {
            // Check if the new news is newer than last visit
            const newNewsDate = new Date(payload.new.published_at);
            const lastVisitDate = new Date(lastVisited);
            
            if (newNewsDate > lastVisitDate) {
              setUnreadCount(prev => prev + 1);
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'user_news_activity',
            filter: `user_id=eq.${user.id}`
          },
          async (payload) => {
            // Recalculate unread count when user activity is updated
            const newLastVisited = payload.new.last_visited_at;
            const { data: unreadNews, count } = await supabase
              .from('news')
              .select('*', { count: 'exact', head: true })
              .gt('published_at', newLastVisited);
            
            setUnreadCount(count || 0);
          }
        )
        .subscribe();
    };

    setupRealtimeAndFetch();

    return () => {
      if (newsChannel) {
        supabase.removeChannel(newsChannel);
      }
    };
  }, [user]);

  const markNewsAsRead = async () => {
    if (!user) return;

    try {
      // Insert or update user's last visit timestamp
      const { error } = await supabase
        .from('user_news_activity')
        .upsert({
          user_id: user.id,
          last_visited_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
      
      // The realtime subscription will update the count automatically
    } catch (error) {
      console.error('Error marking news as read:', error);
    }
  };

  return {
    unreadCount,
    markNewsAsRead
  };
};