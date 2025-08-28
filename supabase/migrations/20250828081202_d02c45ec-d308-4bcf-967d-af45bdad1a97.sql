-- Add foreign key reference to profiles table for news_comments
ALTER TABLE public.news_comments 
ADD CONSTRAINT news_comments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;