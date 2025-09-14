import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Image as ImageIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MultiImageUploadProps {
  value?: string[];
  onChange: (urls: string[]) => void;
  placeholder?: string;
  className?: string;
  maxImages?: number;
}

const MultiImageUpload = ({ 
  value = [], 
  onChange, 
  placeholder = "اضغط لرفع صور",
  className,
  maxImages = 10
}: MultiImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validate file types
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      alert('يرجى اختيار ملفات صور صالحة فقط');
      return;
    }

    // Validate file sizes (max 5MB each)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert('حجم كل ملف يجب أن يكون أقل من 5 ميجابايت');
      return;
    }

    // Check total images limit
    if (value.length + files.length > maxImages) {
      alert(`يمكن رفع ${maxImages} صورة كحد أقصى`);
      return;
    }

    setIsUploading(true);

    try {
      const newUrls: string[] = [];
      
      for (const file of files) {
        // Convert to base64
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64String = e.target?.result as string;
          newUrls.push(base64String);
          
          // If this is the last file, update the state
          if (newUrls.length === files.length) {
            onChange([...value, ...newUrls]);
          }
        };
        reader.readAsDataURL(file);
      }
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('حدث خطأ أثناء رفع الصور');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (index: number) => {
    const newUrls = value.filter((_, i) => i !== index);
    onChange(newUrls);
  };

  const handleAddMore = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("w-full", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <div className="space-y-4">
        {/* Existing Images */}
        {value.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {value.map((url, index) => (
              <Card key={index} className="relative group">
                <CardContent className="p-0">
                  <div className="aspect-square relative overflow-hidden rounded-lg">
                    <img
                      src={url}
                      alt={`صورة ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemove(index)}
                        disabled={isUploading}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add More Button */}
        {value.length < maxImages && (
          <Card 
            className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer"
            onClick={handleAddMore}
          >
            <CardContent className="flex flex-col items-center justify-center p-6">
              {isUploading ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">جاري الرفع...</p>
                </div>
              ) : (
                <div className="text-center">
                  <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {value.length === 0 ? placeholder : "إضافة المزيد من الصور"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, GIF حتى 5 ميجابايت لكل صورة
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {value.length}/{maxImages} صور
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MultiImageUpload;
