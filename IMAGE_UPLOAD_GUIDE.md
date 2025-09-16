# دليل نظام رفع الصور

## نظرة عامة
تم تطوير نظام شامل لرفع وإدارة الصور باستخدام Supabase Storage مع واجهة مستخدم محسنة.

## الميزات الجديدة

### 1. رفع الصور إلى Supabase Storage
- رفع الصور مباشرة إلى Supabase Storage
- دعم أنواع ملفات متعددة (JPG, PNG, GIF, WebP)
- حد أقصى 10 ميجابايت لكل صورة
- إنشاء أسماء ملفات فريدة تلقائياً

### 2. مكون ImageUpload المحسن
- معاينة فورية للصورة
- رفع تلقائي إلى Storage
- حذف الصور من Storage عند الحذف
- رسائل خطأ واضحة
- دعم مجلدات مختلفة

### 3. مكون ImageViewer
- تكبير الصور
- تحميل الصور
- واجهة مستخدم محسنة

## كيفية الاستخدام

### 1. إعداد Supabase Storage
```sql
-- تشغيل ملف setup_image_storage.sql
-- لإنشاء bucket وإعداد السياسات
```

### 2. استخدام مكون ImageUpload
```tsx
import ImageUpload from '@/components/ImageUpload';

<ImageUpload
  value={imageUrl}
  onChange={setImageUrl}
  placeholder="اضغط لرفع صورة"
  folder="mall-images" // مجلد في Storage
  aspectRatio="video" // square, video, auto
  onError={(error) => console.error(error)}
/>
```

### 3. استخدام مكون ImageViewer
```tsx
import ImageViewer from '@/components/ImageViewer';

<ImageViewer
  src={imageUrl}
  alt="وصف الصورة"
  showZoomButton={true}
  showDownloadButton={true}
>
  <img src={imageUrl} alt="وصف" className="w-full h-48 object-cover" />
</ImageViewer>
```

### 4. استخدام دوال رفع الصور مباشرة
```tsx
import { uploadImageToStorage, deleteImageFromStorage } from '@/utils/imageUpload';

// رفع صورة
const result = await uploadImageToStorage(file, 'shop-images');
if (result.success) {
  console.log('URL:', result.url);
}

// حذف صورة
const deleted = await deleteImageFromStorage(imageUrl);
```

## الخصائص المتاحة

### ImageUpload Props
- `value`: URL الصورة الحالية
- `onChange`: دالة تحديث URL
- `placeholder`: نص placeholder
- `className`: CSS classes إضافية
- `aspectRatio`: نسبة العرض للارتفاع
- `folder`: مجلد Storage
- `onError`: دالة معالجة الأخطاء

### ImageViewer Props
- `src`: URL الصورة
- `alt`: نص بديل
- `className`: CSS classes
- `showZoomButton`: إظهار زر التكبير
- `showDownloadButton`: إظهار زر التحميل
- `children`: محتوى مخصص

## أمثلة الاستخدام

### 1. رفع صورة المول
```tsx
<ImageUpload
  value={mall.image_url}
  onChange={(url) => setMall({...mall, image_url: url})}
  placeholder="صورة المول الرئيسية"
  folder="mall-images"
  aspectRatio="video"
/>
```

### 2. رفع شعار المحل
```tsx
<ImageUpload
  value={shop.logo_url}
  onChange={(url) => setShop({...shop, logo_url: url})}
  placeholder="شعار المحل"
  folder="shop-logos"
  aspectRatio="square"
/>
```

### 3. رفع صور متعددة
```tsx
{images.map((image, index) => (
  <ImageUpload
    key={index}
    value={image}
    onChange={(url) => updateImage(index, url)}
    folder="shop-images"
    aspectRatio="square"
  />
))}
```

## الأمان والتحقق

### 1. التحقق من نوع الملف
- JPG, JPEG, PNG, GIF, WebP فقط
- رفض الملفات غير المدعومة

### 2. التحقق من حجم الملف
- حد أقصى 10 ميجابايت
- رسائل خطأ واضحة

### 3. أمان Storage
- سياسات RLS مفعلة
- وصول محدود حسب الدور
- حماية من الوصول غير المصرح

## معالجة الأخطاء

### 1. أخطاء الرفع
- رسائل خطأ باللغة العربية
- إعادة المحاولة التلقائية
- تسجيل الأخطاء في console

### 2. أخطاء الحذف
- استمرار العمل حتى لو فشل الحذف من Storage
- رسائل تأكيد للمستخدم

## الأداء والتحسين

### 1. معاينة فورية
- تحويل إلى base64 للمعاينة
- رفع متوازي في الخلفية

### 2. تحسين الصور
- ضغط تلقائي
- تنسيقات محسنة
- cache control

### 3. تجربة المستخدم
- مؤشرات تحميل
- رسائل نجاح/فشل
- واجهة تفاعلية

## الخطوات التالية

1. **تطبيق إعداد Storage**: تشغيل `setup_image_storage.sql`
2. **اختبار النظام**: رفع وحذف الصور
3. **تخصيص المجلدات**: إضافة مجلدات جديدة حسب الحاجة
4. **مراقبة الاستخدام**: تتبع مساحة التخزين المستخدمة

## ملاحظات مهمة

- تأكد من إعداد Supabase Storage قبل الاستخدام
- استخدم مجلدات منفصلة لأنواع مختلفة من الصور
- راقب مساحة التخزين المستخدمة
- احذف الصور غير المستخدمة بانتظام
