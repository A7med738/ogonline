# دليل تطبيق نظام فئات المدارس

## المشكلة التي تم حلها
كان هناك خطأ `ERROR: 42P01: relation "user_profiles" does not exist` لأن النظام كان يحاول الوصول إلى جدول `user_profiles` غير الموجود.

## الحل المطبق
تم تحديث جميع ملفات SQL لاستخدام نظام الأدوار الصحيح في Supabase:
- `has_role(auth.uid(), 'admin'::app_role)` بدلاً من `user_profiles`

## الملفات المحدثة

### 1. الملفات الجاهزة للتطبيق:
- ✅ `apply_school_categories_final.sql` - **النسخة الموصى بها للتطبيق**
- ✅ `apply_school_categories_simple.sql` - نسخة بديلة
- ✅ `create_school_categories_fixed.sql` - نسخة محسنة

### 2. ملفات Migration:
- ✅ `supabase/migrations/20241220_create_school_categories.sql` - تم إصلاحه

## كيفية التطبيق

### الطريقة الأولى: استخدام Supabase Dashboard
1. افتح Supabase Dashboard
2. اذهب إلى SQL Editor
3. انسخ محتوى `apply_school_categories_final.sql`
4. شغل الكود

### الطريقة الثانية: استخدام Supabase CLI
```bash
# إذا كان Supabase يعمل محلياً
npx supabase db reset

# أو تطبيق migration محدد
npx supabase migration up
```

### الطريقة الثالثة: استخدام psql مباشرة
```bash
psql -h your-host -U your-user -d your-database -f apply_school_categories_final.sql
```

## ما سيتم إنشاؤه

### 1. جدول `school_categories`
```sql
- id (UUID, Primary Key)
- name_ar (VARCHAR) - الاسم بالعربية
- name_en (VARCHAR) - الاسم بالإنجليزية  
- description_ar (TEXT) - الوصف بالعربية
- description_en (TEXT) - الوصف بالإنجليزية
- color (VARCHAR) - لون الفئة
- icon (VARCHAR) - أيقونة الفئة
- sort_order (INTEGER) - ترتيب العرض
- is_active (BOOLEAN) - حالة التفعيل
- created_at (TIMESTAMP) - تاريخ الإنشاء
- updated_at (TIMESTAMP) - تاريخ التحديث
```

### 2. تحديث جدول `schools`
- إضافة عمود `category_id` للربط بالفئات

### 3. الفئات الافتراضية
- **مدارس حكومية** (أخضر #10B981)
- **مدارس ناشونال** (برتقالي #F59E0B)
- **مدارس انترناشونال** (بنفسجي #8B5CF6)

### 4. السياسات الأمنية
- قراءة عامة للفئات النشطة
- إدارة كاملة للمدراء فقط
- تحديث سياسة المدارس لتشمل الفئات

## التحقق من التطبيق

### 1. تحقق من إنشاء الجدول
```sql
SELECT * FROM school_categories;
```

### 2. تحقق من الفئات الافتراضية
```sql
SELECT name_ar, name_en, color FROM school_categories ORDER BY sort_order;
```

### 3. تحقق من ربط المدارس
```sql
SELECT s.name, sc.name_ar as category 
FROM schools s 
LEFT JOIN school_categories sc ON s.category_id = sc.id 
LIMIT 5;
```

## الميزات المتاحة بعد التطبيق

### للمدراء:
- إدارة فئات المدارس من لوحة الإدارة
- إضافة/تعديل/حذف الفئات
- تخصيص الألوان والأيقونات
- ترتيب الفئات
- تفعيل/إلغاء تفعيل الفئات

### للمستخدمين:
- فلترة المدارس حسب النوع
- بحث متقدم في المدارس
- ترتيب النتائج
- عرض الفئات مع الألوان المخصصة

## استكشاف الأخطاء

### إذا ظهر خطأ "relation does not exist":
- تأكد من أن Supabase يعمل بشكل صحيح
- تحقق من اتصال قاعدة البيانات
- تأكد من صلاحيات المستخدم

### إذا ظهر خطأ "permission denied":
- تأكد من أن المستخدم لديه صلاحيات إدارة
- تحقق من سياسات RLS

### إذا لم تظهر الفئات:
- تحقق من أن البيانات تم إدراجها
- تأكد من أن `is_active = true`
- تحقق من سياسات القراءة

## الدعم
لأي مشاكل أو استفسارات، يرجى مراجعة:
1. ملفات SQL للتأكد من صحة الكود
2. سجلات Supabase للأخطاء
3. سياسات RLS في Supabase Dashboard
