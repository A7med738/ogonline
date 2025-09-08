-- تحديث قيد التحقق لعمود status لإضافة pending
ALTER TABLE public.lost_and_found_items 
DROP CONSTRAINT IF EXISTS lost_and_found_items_status_check;

ALTER TABLE public.lost_and_found_items 
ADD CONSTRAINT lost_and_found_items_status_check 
CHECK (status IN ('active', 'resolved', 'expired', 'pending', 'rejected'));