import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadImageToStorage, fileToBase64, validateImageFile, deleteImageFromStorage } from "@/utils/imageUpload";
import { useToast } from "@/hooks/use-toast";
import ImageViewer from "./ImageViewer";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  placeholder?: string;
  className?: string;
  aspectRatio?: "square" | "video" | "auto";
  folder?: string; // Folder in Supabase Storage
  onError?: (error: string) => void;
}

const ImageUpload = ({ 
  value, 
  onChange, 
  placeholder = "اضغط لرفع صورة",
  className,
  aspectRatio = "auto",
  folder = "images",
  onError
}: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      const errorMessage = validation.error || 'خطأ في الملف';
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive"
      });
      if (onError) onError(errorMessage);
      return;
    }

    setIsUploading(true);

    try {
      // Create preview
      const base64Preview = await fileToBase64(file);
      setPreview(base64Preview);

      // Upload to Supabase Storage
      const uploadResult = await uploadImageToStorage(file, folder);
      
      if (uploadResult.success && uploadResult.url) {
        onChange(uploadResult.url);
        toast({
          title: "تم بنجاح",
          description: "تم رفع الصورة بنجاح"
        });
      } else {
        throw new Error(uploadResult.error || 'فشل في رفع الصورة');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء رفع الصورة';
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive"
      });
      if (onError) onError(errorMessage);
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    try {
      // If there's a stored image, try to delete it from storage
      if (value && value.startsWith('http')) {
        await deleteImageFromStorage(value);
      }
    } catch (error) {
      console.error('Error deleting image from storage:', error);
      // Continue with removal even if storage deletion fails
    }

    setPreview(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    toast({
      title: "تم الحذف",
      description: "تم حذف الصورة بنجاح"
    });
  };

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square';
      case 'video':
        return 'aspect-video';
      default:
        return 'aspect-auto';
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {preview ? (
        <Card className="relative group">
          <CardContent className="p-0">
            <div className={cn("relative overflow-hidden rounded-lg", getAspectRatioClass())}>
              <ImageViewer
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              >
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </ImageViewer>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    تغيير
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleRemove}
                    disabled={isUploading}
                  >
                    <X className="w-4 h-4 mr-2" />
                    حذف
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card 
          className={cn(
            "border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer",
            getAspectRatioClass()
          )}
          onClick={() => fileInputRef.current?.click()}
        >
          <CardContent className="flex flex-col items-center justify-center h-full p-6">
            {isUploading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">جاري الرفع...</p>
              </div>
            ) : (
              <div className="text-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {placeholder}
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, GIF, WebP حتى 10 ميجابايت
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImageUpload;
