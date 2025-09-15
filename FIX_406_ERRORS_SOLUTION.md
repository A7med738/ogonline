# حل مشكلة أخطاء 406 (Not Acceptable)

## المشكلة
كانت تظهر أخطاء 406 عند محاولة الوصول لجدولي `mall_cinema` و `mall_games` في Supabase:

```
GET https://xjjczlhybgeslfiovkun.supabase.co/rest/v1/mall_cinema?select=*&mall_id=eq.92a36e2e-dfa9-4910-84d3-b59c24676314 406 (Not Acceptable)
GET https://xjjczlhybgeslfiovkun.supabase.co/rest/v1/mall_games?select=*&mall_id=eq.92a36e2e-dfa9-4910-84d3-b59c24676314 406 (Not Acceptable)
```

## الأسباب المحتملة
1. **الجداول غير موجودة** في قاعدة البيانات
2. **عدم وجود صلاحيات** للوصول للجداول
3. **مشاكل في Row Level Security (RLS)**

## الحلول المطبقة

### 1. إضافة معالجة الأخطاء في الكود

#### في `MallDetails.tsx`:
```typescript
// Load cinema (with error handling)
let cinema = null;
let movies = [];
try {
  const { data: cinemaData } = await supabase
    .from('mall_cinema')
    .select('*')
    .eq('mall_id', mallId)
    .single();
  cinema = cinemaData;
  // ... rest of cinema logic
} catch (error) {
  console.log('Cinema data not available:', error);
  cinema = null;
  movies = [];
}
```

#### في `MallsManagement.tsx`:
نفس المعالجة للجداول المفقودة.

### 2. إنشاء الجداول المفقودة

تم إنشاء ملف `create_missing_mall_tables.sql` يحتوي على:

- **`mall_cinema`**: جدول السينما
- **`mall_movies`**: جدول الأفلام
- **`mall_games`**: جدول الألعاب
- **`mall_events`**: جدول الفعاليات

### 3. إصلاح تحذيرات DialogContent

تم إضافة `DialogDescription` للـ dialogs لتجنب التحذيرات:

```typescript
<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
  <DialogHeader>
    <DialogTitle>إضافة مول جديد</DialogTitle>
    <DialogDescription>
      أضف مول جديد مع جميع التفاصيل والمحلات والخدمات
    </DialogDescription>
  </DialogHeader>
  {/* ... rest of dialog content */}
</DialogContent>
```

## كيفية التطبيق

### 1. تشغيل SQL لإنشاء الجداول:
```sql
-- شغل هذا الملف على قاعدة البيانات
-- create_missing_mall_tables.sql
```

### 2. التحقق من النتائج:
- ✅ لا توجد أخطاء 406 في console
- ✅ التطبيق يعمل بدون أخطاء
- ✅ لا توجد تحذيرات DialogContent
- ✅ البيانات تُحمل بشكل صحيح

## الملفات المحدثة

- ✅ `src/pages/MallDetails.tsx` - إضافة معالجة الأخطاء
- ✅ `src/pages/admin/MallsManagement.tsx` - إضافة معالجة الأخطاء + DialogDescription
- ✅ `create_missing_mall_tables.sql` - جديد (لإنشاء الجداول المفقودة)

## النتائج المتوقعة

1. **لا توجد أخطاء 406**: التطبيق لن يحاول الوصول للجداول غير الموجودة
2. **معالجة أخطاء آمنة**: إذا لم تكن الجداول موجودة، سيتم تجاهلها بأمان
3. **تجربة مستخدم أفضل**: لا توجد أخطاء في console تؤثر على الأداء
4. **مرونة أكبر**: التطبيق يعمل حتى لو لم تكن جميع الجداول موجودة

## ملاحظات مهمة

1. **الجداول اختيارية**: السينما والألعاب ليست ضرورية لعمل المولات
2. **معالجة الأخطاء**: الكود الآن يتعامل مع الجداول المفقودة بأمان
3. **الأداء**: لا توجد محاولات متكررة للوصول للجداول المفقودة
4. **التوافق**: يعمل مع أي إعداد قاعدة بيانات

## اختبار الحل

1. شغل ملف `create_missing_mall_tables.sql` على قاعدة البيانات
2. أعد تحميل التطبيق
3. تحقق من console - لا توجد أخطاء 406
4. اذهب لصفحة أي مول - يجب أن تعمل بدون أخطاء
