# حل مشكلة أخطاء 406 (Not Acceptable) في المولات

## المشكلة
تظهر أخطاء 406 عند محاولة الوصول لجدولي `mall_cinema` و `mall_games` في Supabase:

```
GET https://xjjczlhybgeslfiovkun.supabase.co/rest/v1/mall_cinema?select=*&mall_id=eq.92a36e2e-dfa9-4910-84d3-b59c24676314 406 (Not Acceptable)
GET https://xjjczlhybgeslfiovkun.supabase.co/rest/v1/mall_games?select=*&mall_id=eq.92a36e2e-dfa9-4910-84d3-b59c24676314 406 (Not Acceptable)
```

## السبب
الجداول `mall_cinema` و `mall_games` و `mall_movies` و `mall_events` غير موجودة في قاعدة البيانات، مما يسبب أخطاء 406 عند محاولة الاستعلام عنها.

## الحل

### الخطوة 1: إنشاء الجداول المفقودة

قم بتشغيل أحد الملفات التالية في Supabase SQL Editor:

#### الخيار 1: الحل البسيط (مستحسن)
```sql
-- انسخ والصق محتوى ملف simple_fix_mall_tables.sql في Supabase SQL Editor
```

#### الخيار 2: الحل الشامل
```sql
-- انسخ والصق محتوى ملف fix_mall_tables_406_errors.sql في Supabase SQL Editor
```

### الخطوة 2: التحقق من النتائج

بعد تشغيل SQL، يجب أن تظهر الجداول التالية في قاعدة البيانات:
- `mall_cinema`
- `mall_movies` 
- `mall_games`
- `mall_events`

### الخطوة 3: اختبار التطبيق

1. أعد تحميل التطبيق
2. اذهب لصفحة إدارة المولات
3. اذهب لصفحة أي مول
4. تحقق من console - لا يجب أن تظهر أخطاء 406

## الملفات المحدثة

### 1. ملفات SQL الجديدة:
- `simple_fix_mall_tables.sql` - حل بسيط وسريع
- `fix_mall_tables_406_errors.sql` - حل شامل مع فحص الأخطاء

### 2. ملفات الكود المحدثة:
- `src/pages/admin/MallsManagement.tsx` - تحسين معالجة الأخطاء
- `src/pages/MallDetails.tsx` - تحسين معالجة الأخطاء

## التحسينات المطبقة

### 1. معالجة أخطاء محسنة
```typescript
const { data: cinemaData, error: cinemaError } = await supabase
  .from('mall_cinema')
  .select('*')
  .eq('mall_id', mallId)
  .single();

if (cinemaError && cinemaError.code !== 'PGRST116') {
  console.log('Cinema query error:', cinemaError);
} else {
  cinema = cinemaData;
  // ... rest of logic
}
```

### 2. إنشاء الجداول مع RLS
- تم إنشاء الجداول مع Row Level Security
- تم إضافة policies للقراءة العامة
- تم إضافة policies للكتابة للمستخدمين المسجلين

### 3. فهرسة محسنة
- تم إضافة indexes للبحث السريع
- تم تحسين الأداء للاستعلامات

## النتائج المتوقعة

✅ **لا توجد أخطاء 406**: التطبيق لن يحاول الوصول للجداول غير الموجودة  
✅ **معالجة أخطاء آمنة**: إذا لم تكن الجداول موجودة، سيتم تجاهلها بأمان  
✅ **تجربة مستخدم أفضل**: لا توجد أخطاء في console تؤثر على الأداء  
✅ **مرونة أكبر**: التطبيق يعمل حتى لو لم تكن جميع الجداول موجودة  

## اختبار الحل

1. **شغل SQL**: انسخ والصق `simple_fix_mall_tables.sql` في Supabase SQL Editor
2. **أعد تحميل التطبيق**: تأكد من عدم وجود أخطاء 406
3. **اختبر المولات**: اذهب لصفحة أي مول وتأكد من عملها
4. **اختبر الإدارة**: اذهب لصفحة إدارة المولات وتأكد من عملها

## ملاحظات مهمة

1. **الجداول اختيارية**: السينما والألعاب ليست ضرورية لعمل المولات
2. **معالجة الأخطاء**: الكود الآن يتعامل مع الجداول المفقودة بأمان
3. **الأداء**: لا توجد محاولات متكررة للوصول للجداول المفقودة
4. **التوافق**: يعمل مع أي إعداد قاعدة بيانات

## استكشاف الأخطاء

إذا استمرت المشكلة:

1. **تحقق من الجداول**: تأكد من وجود الجداول في Supabase
2. **تحقق من RLS**: تأكد من تفعيل Row Level Security
3. **تحقق من Policies**: تأكد من وجود policies للقراءة
4. **تحقق من Console**: ابحث عن أخطاء أخرى في console

## الدعم

إذا واجهت أي مشاكل، تأكد من:
- تشغيل SQL بشكل صحيح
- عدم وجود أخطاء في Supabase
- إعادة تحميل التطبيق بعد التغييرات
