-- Add phone field to mall_shops table if it doesn't exist
ALTER TABLE mall_shops ADD COLUMN IF NOT EXISTS phone TEXT;

-- Insert the main mall
INSERT INTO malls (name, description, address, phone, website, is_open, closing_time, rating, image_url, logo_url, about) VALUES
('مول بيت المصريه', 'أكثر الخدمات والمحلات', 'بيت المصريه', '01000000000', '', true, '11:00 مساءً', 4.0, '/placeholder.svg', '/placeholder.svg', 'مول بيت المصريه يضم أكثر الخدمات والمحلات في المنطقة');

-- Get the mall ID (assuming it's the last inserted one)
-- We'll use a variable to store the mall ID
DO $$
DECLARE
    mall_uuid UUID;
BEGIN
    -- Get the mall ID
    SELECT id INTO mall_uuid FROM malls WHERE name = 'مول بيت المصريه' ORDER BY created_at DESC LIMIT 1;
    
    -- Insert markets (الماركت)
    INSERT INTO mall_shops (mall_id, name, category, phone) VALUES
    (mall_uuid, 'أسواق المدينه', 'سوبر ماركت', '01114599005'),
    (mall_uuid, 'خير بلدنا', 'سوبر ماركت', '01062348500');
    
    -- Insert vegetables and meat shops (الخضار واللحوم)
    INSERT INTO mall_shops (mall_id, name, category, phone) VALUES
    (mall_uuid, 'خضار بيت المصريه', 'خضار وفواكه', '01116447852'),
    (mall_uuid, 'خضار وفواكه أولاد عز', 'خضار وفواكه', '01031869019'),
    (mall_uuid, 'طيور الصعيدي', 'دواجن', '01010572238'),
    (mall_uuid, 'طيور دجاجتي', 'دواجن', '01123113546'),
    (mall_uuid, 'المخبز', 'مخبز', '01128912665');
    
    -- Insert ready food shops (محلات اكل جاهز)
    INSERT INTO mall_shops (mall_id, name, category, phone) VALUES
    (mall_uuid, 'أسماك هامور', 'مأكولات بحرية', '01002613518');
    
    -- Insert pharmacies (صيدليات)
    INSERT INTO mall_shops (mall_id, name, category, phone) VALUES
    (mall_uuid, 'روشته', 'صيدلية', '01010595910'),
    (mall_uuid, 'د/ دعاء فتحي', 'صيدلية', '01111784885');
    
    -- Insert clinics and laboratories (العيادات ومعامل التحاليل)
    INSERT INTO mall_shops (mall_id, name, category, phone) VALUES
    (mall_uuid, 'معمل كيان للتحاليل', 'معمل تحاليل', '01090553038'),
    (mall_uuid, 'د/ أميره السيد (أطفال)', 'عيادة أطفال', '01153384663'),
    (mall_uuid, 'عيادة Blume للأسنان', 'عيادة أسنان', '01140415571'),
    (mall_uuid, 'عيادة الريان للأسنان', 'عيادة أسنان', '01099961364'),
    (mall_uuid, 'مركز اللوتس للتخاطب', 'مركز تخاطب', '01028522449'),
    (mall_uuid, 'د / لمياء (نسا وتوليد)', 'عيادة نساء وتوليد', '01096055268'),
    (mall_uuid, 'المحامي أحمد البحار', 'محامي', '01152341612');
    
    -- Insert dry cleaning (دراي كلين)
    INSERT INTO mall_shops (mall_id, name, category, phone) VALUES
    (mall_uuid, 'خالد بن الوليد', 'دراي كلين', '01032769540'),
    (mall_uuid, 'مكه', 'دراي كلين', '01110509667');
    
    -- Insert mall services
    INSERT INTO mall_services (mall_id, name, icon) VALUES
    (mall_uuid, 'سوبر ماركت', '🛒'),
    (mall_uuid, 'خضار وفواكه', '🥬'),
    (mall_uuid, 'دواجن', '🐔'),
    (mall_uuid, 'مخبز', '🍞'),
    (mall_uuid, 'مأكولات بحرية', '🐟'),
    (mall_uuid, 'صيدليات', '💊'),
    (mall_uuid, 'عيادات طبية', '🏥'),
    (mall_uuid, 'معامل تحاليل', '🧪'),
    (mall_uuid, 'خدمات قانونية', '⚖️'),
    (mall_uuid, 'دراي كلين', '👔');
    
END $$;
