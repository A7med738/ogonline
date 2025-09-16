import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ImageUpload from './ImageUpload';

const ImageUploadExample = () => {
  const [mallImage, setMallImage] = useState<string>('');
  const [shopLogo, setShopLogo] = useState<string>('');
  const [shopImages, setShopImages] = useState<string[]>([]);

  const handleAddShopImage = (imageUrl: string) => {
    setShopImages(prev => [...prev, imageUrl]);
  };

  const handleRemoveShopImage = (index: number) => {
    setShopImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">مثال على رفع الصور</h1>
      
      {/* Mall Image Upload */}
      <Card>
        <CardHeader>
          <CardTitle>صورة المول الرئيسية</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUpload
            value={mallImage}
            onChange={setMallImage}
            placeholder="اضغط لرفع صورة المول"
            folder="mall-images"
            aspectRatio="video"
          />
        </CardContent>
      </Card>

      {/* Shop Logo Upload */}
      <Card>
        <CardHeader>
          <CardTitle>شعار المحل</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUpload
            value={shopLogo}
            onChange={setShopLogo}
            placeholder="اضغط لرفع شعار المحل"
            folder="shop-logos"
            aspectRatio="square"
          />
        </CardContent>
      </Card>

      {/* Multiple Shop Images */}
      <Card>
        <CardHeader>
          <CardTitle>صور المحل الإضافية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shopImages.map((image, index) => (
              <div key={index} className="relative">
                <ImageUpload
                  value={image}
                  onChange={(url) => {
                    const newImages = [...shopImages];
                    newImages[index] = url;
                    setShopImages(newImages);
                  }}
                  placeholder="صورة إضافية"
                  folder="shop-images"
                  aspectRatio="square"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute -top-2 -right-2"
                  onClick={() => handleRemoveShopImage(index)}
                >
                  ×
                </Button>
              </div>
            ))}
            <ImageUpload
              value=""
              onChange={handleAddShopImage}
              placeholder="إضافة صورة جديدة"
              folder="shop-images"
              aspectRatio="square"
            />
          </div>
        </CardContent>
      </Card>

      {/* Display Current Values */}
      <Card>
        <CardHeader>
          <CardTitle>القيم الحالية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>صورة المول:</strong> {mallImage || 'لم يتم اختيار صورة'}</p>
            <p><strong>شعار المحل:</strong> {shopLogo || 'لم يتم اختيار شعار'}</p>
            <p><strong>صور المحل:</strong> {shopImages.length} صورة</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageUploadExample;
