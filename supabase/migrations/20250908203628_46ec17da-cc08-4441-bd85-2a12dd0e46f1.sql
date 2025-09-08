-- إضافة العلاقة بين lost_and_found_items و profiles
ALTER TABLE public.lost_and_found_items 
ADD CONSTRAINT lost_and_found_items_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(user_id) 
ON DELETE CASCADE;