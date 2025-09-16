# دليل نظام تتبع مشاهدات المحلات

## نظرة عامة
تم إضافة نظام تتبع مشاهدات المحلات لتتبع عدد مرات عرض كل محل في المول.

## الميزات الجديدة

### 1. عمود عدد المشاهدات
- تم إضافة عمود `view_count` إلى جدول `mall_shops`
- يعرض العدد الإجمالي للمشاهدات لكل محل

### 2. جدول تتبع المشاهدات التفصيلي
- جدول `shop_views` لتتبع تفاصيل كل مشاهدة
- يتضمن معلومات مثل IP، User Agent، Session ID، والتوقيت

### 3. الدوال المساعدة
- `increment_shop_view()`: لزيادة عدد المشاهدات
- `get_shop_view_stats()`: للحصول على إحصائيات المشاهدات
- `get_most_viewed_shops()`: للحصول على أكثر المحلات مشاهدة

## كيفية الاستخدام

### في الواجهة الأمامية
```typescript
import { trackShopView, getShopViewStats, getMostViewedShops } from '@/utils/shopViewTracking';

// تتبع مشاهدة محل
const newViewCount = await trackShopView(shopId, {
  sessionId: 'unique_session_id',
  userAgent: navigator.userAgent
});

// الحصول على إحصائيات محل
const stats = await getShopViewStats(shopId);

// الحصول على أكثر المحلات مشاهدة
const popularShops = await getMostViewedShops(mallId, 10);
```

### في قاعدة البيانات
```sql
-- زيادة عدد المشاهدات
SELECT increment_shop_view('shop-uuid-here');

-- الحصول على إحصائيات محل
SELECT * FROM get_shop_view_stats('shop-uuid-here');

-- الحصول على أكثر المحلات مشاهدة
SELECT * FROM get_most_viewed_shops('mall-uuid-here', 5);
```

## التحديثات المطبقة

### 1. تحديث قاعدة البيانات
- إضافة عمود `view_count` إلى `mall_shops`
- إنشاء جدول `shop_views` الجديد
- إضافة الدوال المساعدة والفهارس

### 2. تحديث الواجهة الأمامية
- تحديث `MallDetails.tsx` لعرض عدد المشاهدات
- إضافة تتبع المشاهدات عند تحميل المحلات
- تحديث TypeScript types

### 3. تحسينات الأداء
- إضافة فهارس للبحث السريع
- استخدام `Promise.allSettled` لتتبع المشاهدات المتوازي
- تحديث الحالة المحلية فوراً

## الأمان والخصوصية
- تم تفعيل Row Level Security (RLS)
- البيانات الشخصية محدودة (IP و User Agent اختيارية)
- يمكن تخصيص مستوى التتبع حسب الحاجة

## ملاحظات مهمة
- عدد المشاهدات يبدأ من 0
- يتم تتبع المشاهدات عند تحميل صفحة المول
- يمكن تخصيص منطق التتبع حسب احتياجات العمل
- النظام يدعم التتبع المتوازي لعدة محلات

## الخطوات التالية
1. تطبيق migration على قاعدة البيانات
2. اختبار النظام في بيئة التطوير
3. مراقبة الأداء والاستخدام
4. إضافة المزيد من التحليلات حسب الحاجة
