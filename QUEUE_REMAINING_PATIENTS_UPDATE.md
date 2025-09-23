# إضافة عدد المرضى المتبقين - نظام احجزلي

## ✅ **التحديث المطلوب:**
إضافة عدد المرضى المتبقين في المكان المحدد بالدائرة الحمراء في بطاقة الموعد.

## 🎯 **ما تم تنفيذه:**

### **الخطوة 1: تحديث صفحة المواعيد (MyAppointments.tsx)**

تم تحديث قسم "معلومات الطابور" ليعرض 3 معلومات بدلاً من 2:

```typescript
<div className="grid grid-cols-3 gap-2 text-center">
  <div className="bg-white rounded-lg p-2 shadow-sm">
    <div className="text-lg font-bold text-orange-600">#{appointment.queue_number}</div>
    <div className="text-xs text-gray-600">رقم الطابور</div>
  </div>
  <div className="bg-white rounded-lg p-2 shadow-sm">
    <div className="text-lg font-bold text-blue-600">{appointment.queue_position}</div>
    <div className="text-xs text-gray-600">موضعك</div>
  </div>
  <div className="bg-white rounded-lg p-2 shadow-sm">
    <div className="text-lg font-bold text-red-600">{appointment.queue_position - 1}</div>
    <div className="text-xs text-gray-600">المتبقي</div>
  </div>
</div>
```

### **الخطوة 2: تحديث صفحة تأكيد الحجز (AppointmentConfirmation.tsx)**

تم تحديث قسم "معلومات الطابور" ليعرض 3 معلومات بدلاً من 2:

```typescript
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
  <div className="bg-white rounded-xl p-4 text-center shadow-sm">
    <div className="text-3xl font-bold text-orange-600 mb-2">#{appointment.queue_number}</div>
    <div className="text-sm font-semibold text-gray-700">رقم الطابور</div>
  </div>
  <div className="bg-white rounded-xl p-4 text-center shadow-sm">
    <div className="text-3xl font-bold text-blue-600 mb-2">{appointment.queue_position}</div>
    <div className="text-sm font-semibold text-gray-700">موضعك في الطابور</div>
  </div>
  <div className="bg-white rounded-xl p-4 text-center shadow-sm">
    <div className="text-3xl font-bold text-red-600 mb-2">{appointment.queue_position - 1}</div>
    <div className="text-sm font-semibold text-gray-700">المرضى المتبقين</div>
  </div>
</div>
```

## 🎨 **التصميم:**

### **الألوان المستخدمة:**
- **برتقالي** (`text-orange-600`): لرقم الطابور
- **أزرق** (`text-blue-600`): لموضع المريض في الطابور
- **أحمر** (`text-red-600`): لعدد المرضى المتبقين

### **التخطيط:**
- **3 أعمدة** في صفحة المواعيد
- **3 أعمدة** في صفحة التأكيد (مع استجابة للشاشات الصغيرة)
- **تصميم متسق** مع باقي النظام

## 📊 **كيفية حساب المرضى المتبقين:**

```typescript
المرضى المتبقين = موضع المريض - 1
```

**مثال:**
- إذا كان موضع المريض = 5
- فإن المرضى المتبقين = 5 - 1 = 4 مرضى

## 🎯 **النتيجة المتوقعة:**

بعد هذا التحديث:
- ✅ **سيظهر عدد المرضى المتبقين** في المكان المحدد
- ✅ **تصميم متسق** مع باقي النظام
- ✅ **معلومات واضحة** للمريض عن موقعه في الطابور
- ✅ **تجربة مستخدم محسنة** مع معلومات أكثر تفصيلاً

## ⚠️ **ملاحظات مهمة:**

1. **اللون الأحمر** يلفت الانتباه لعدد المرضى المتبقين
2. **التصميم متجاوب** ويعمل على جميع أحجام الشاشات
3. **المعلومات محدثة** تلقائياً مع كل حجز جديد

---
**تاريخ التحديث**: 2025-01-25  
**الحالة**: تم التحديث بنجاح ✅
