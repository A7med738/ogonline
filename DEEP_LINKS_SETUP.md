# إعداد Deep Links لتطبيق أكتوبر جاردنز أونلاين

## نظرة عامة
تم إعداد Deep Links في التطبيق لتمكين المستخدمين من العودة إلى التطبيق عند النقر على الروابط في البريد الإلكتروني والإشعارات.

## الملفات المحدثة

### 1. إعدادات Capacitor
- `capacitor.config.ts`: تم إضافة `customUrlScheme: 'ogonline'`

### 2. معالجات Deep Links
- `src/hooks/useDeepLink.tsx`: معالج Deep Links الرئيسي
- `src/components/OneSignalHandler.tsx`: معالج إشعارات OneSignal
- `src/utils/deepLinkUtils.ts`: دوال مساعدة للتعامل مع Deep Links

### 3. صفحات التطبيق
- `src/pages/EmailConfirmation.tsx`: صفحة تأكيد البريد الإلكتروني
- `src/pages/Auth.tsx`: تحديث URL إعادة التوجيه

### 4. ملفات Android
- `android/app/src/main/AndroidManifest.xml`: إعدادات Android للتعامل مع Deep Links
- `android/app/src/main/res/xml/file_paths.xml`: ملف مساعد لـ FileProvider

### 5. ملفات iOS
- `ios/App/App/Info.plist`: إعدادات iOS للتعامل مع Deep Links

### 6. ملفات التحقق
- `public/.well-known/assetlinks.json`: ملف التحقق من Android
- `public/.well-known/apple-app-site-association`: ملف التحقق من iOS

## كيفية عمل Deep Links

### 1. تأكيد البريد الإلكتروني
- عند التسجيل، يتم إرسال رابط تأكيد إلى البريد الإلكتروني
- الرابط يشير إلى `/email-confirmation`
- عند النقر على الرابط، يتم فتح التطبيق وانتقال المستخدم إلى صفحة التأكيد

### 2. الإشعارات
- عند إرسال إشعارات الأخبار، يتم استخدام Deep Links
- الرابط يكون بصيغة `ogonline://news?id=123`
- عند النقر على الإشعار، يتم فتح التطبيق وانتقال المستخدم إلى صفحة الأخبار

## اختبار Deep Links

### على Android
```bash
adb shell am start -W -a android.intent.action.VIEW -d "ogonline://news?id=123" co.median.android.odxmwym
```

### على iOS
```bash
xcrun simctl openurl booted "ogonline://news?id=123"
```

## استكشاف الأخطاء

### 1. Deep Links لا تعمل
- تأكد من أن التطبيق مثبت على الجهاز
- تحقق من إعدادات AndroidManifest.xml و Info.plist
- تأكد من أن ملفات التحقق متاحة على الخادم

### 2. الإشعارات لا تعيد إلى التطبيق
- تحقق من إعدادات OneSignal
- تأكد من أن الروابط تستخدم الصيغة الصحيحة
- تحقق من معالج OneSignalHandler

### 3. تأكيد البريد الإلكتروني لا يعمل
- تحقق من إعدادات Supabase
- تأكد من أن URL إعادة التوجيه صحيح
- تحقق من معالج useDeepLink

## ملاحظات مهمة

1. **تحديث التطبيق**: بعد إجراء هذه التغييرات، يجب إعادة بناء التطبيق ونشره
2. **اختبار شامل**: اختبر جميع الروابط على أجهزة مختلفة
3. **مراقبة الأخطاء**: راقب console logs للتأكد من عمل Deep Links بشكل صحيح
4. **تحديث الخادم**: تأكد من أن ملفات التحقق متاحة على الخادم

## الدعم

في حالة وجود مشاكل، يرجى:
1. التحقق من console logs
2. اختبار Deep Links باستخدام الأوامر المذكورة أعلاه
3. التأكد من إعدادات الخادم والملفات
