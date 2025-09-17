import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ImageUploadProps {
  label?: string;
  value?: string;
  onChange: (url: string) => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  label = "رفع صورة",
  value,
  onChange,
  accept = "image/*",
  maxSize = 5,
  className = ""
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`حجم الملف يجب أن يكون أقل من ${maxSize} ميجابايت`);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('يجب أن يكون الملف صورة');
      return;
    }

    setIsUploading(true);

    try {
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `city-services/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        
        // إذا كان bucket غير موجود، أنشئه أولاً
        if (uploadError.message?.includes('Bucket not found')) {
          toast.error('يجب إنشاء bucket التخزين أولاً. يرجى تطبيق ملف create_storage_bucket.sql');
          return;
        }
        
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      onChange(data.publicUrl);
      toast.success('تم رفع الصورة بنجاح');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('حدث خطأ أثناء رفع الصورة. تأكد من وجود bucket التخزين');
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label>{label}</Label>
      
      <div className="space-y-2">
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-32 object-cover rounded-lg border"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleRemove}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
            onClick={handleButtonClick}
          >
            {isUploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            ) : (
              <>
                <ImageIcon className="h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-500 mt-2">انقر لرفع صورة</p>
                <p className="text-xs text-gray-400">أقصى حجم: {maxSize} ميجابايت</p>
              </>
            )}
          </div>
        )}

        <Input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
        />

        <Button
          type="button"
          variant="outline"
          onClick={handleButtonClick}
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              جاري الرفع...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              {preview ? 'تغيير الصورة' : 'رفع صورة'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ImageUpload;
