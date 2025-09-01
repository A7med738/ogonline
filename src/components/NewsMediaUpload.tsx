import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { X, Upload, Image, Video, FileVideo } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface MediaFile {
  id: string;
  file?: File;
  url?: string;
  type: 'image' | 'video';
  name: string;
  size?: number;
  isExisting?: boolean;
}

interface NewsMediaUploadProps {
  onMediaChange: (media: MediaFile[]) => void;
  initialMedia?: MediaFile[];
  disabled?: boolean;
}

export const NewsMediaUpload: React.FC<NewsMediaUploadProps> = ({
  onMediaChange,
  initialMedia = [],
  disabled = false
}) => {
  const [media, setMedia] = useState<MediaFile[]>(initialMedia);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const newMedia: MediaFile[] = [];

    for (const file of files) {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      if (!isImage && !isVideo) {
        toast({
          title: "نوع ملف غير مدعوم",
          description: "يرجى اختيار صور أو فيديوهات فقط",
          variant: "destructive"
        });
        continue;
      }

      // Check file size (max 10MB for images, 50MB for videos)
      const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast({
          title: "حجم الملف كبير جداً",
          description: `الحد الأقصى للصور 10 ميجا، وللفيديوهات 50 ميجا`,
          variant: "destructive"
        });
        continue;
      }

      newMedia.push({
        id: Math.random().toString(36).substring(2),
        file,
        type: isImage ? 'image' : 'video',
        name: file.name,
        size: file.size
      });
    }

    const updatedMedia = [...media, ...newMedia];
    setMedia(updatedMedia);
    onMediaChange(updatedMedia);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeMedia = (id: string) => {
    const updatedMedia = media.filter(item => item.id !== id);
    setMedia(updatedMedia);
    onMediaChange(updatedMedia);
  };

  const uploadMedia = async (mediaFile: MediaFile): Promise<string | null> => {
    if (!mediaFile.file) return mediaFile.url || null;

    try {
      const fileExt = mediaFile.file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const bucket = mediaFile.type === 'image' ? 'news-images' : 'news-videos';

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, mediaFile.file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading media:', error);
      toast({
        title: "خطأ في رفع الملف",
        description: `فشل في رفع ${mediaFile.name}`,
        variant: "destructive"
      });
      return null;
    }
  };

  const uploadAllMedia = async (): Promise<MediaFile[]> => {
    setUploading(true);
    const uploadedMedia: MediaFile[] = [];

    for (const mediaItem of media) {
      const url = await uploadMedia(mediaItem);
      if (url) {
        uploadedMedia.push({
          ...mediaItem,
          url,
          file: undefined // Remove file after upload
        });
      }
    }

    setUploading(false);
    return uploadedMedia;
  };

  const getPreviewUrl = (mediaItem: MediaFile): string => {
    if (mediaItem.url) return mediaItem.url;
    if (mediaItem.file) return URL.createObjectURL(mediaItem.file);
    return '';
  };

  // Expose upload function
  React.useEffect(() => {
    (window as any).uploadNewsMedia = uploadAllMedia;
  }, [media]);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="media-upload">الصور والفيديوهات</Label>
        <div className="mt-2">
          <Input
            ref={fileInputRef}
            id="media-upload"
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileSelect}
            disabled={disabled || uploading}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            اختيار ملفات
          </Button>
        </div>
      </div>

      {media.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {media.map((mediaItem) => (
            <Card key={mediaItem.id} className="relative p-2">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-1 right-1 z-10 h-6 w-6 p-0"
                onClick={() => removeMedia(mediaItem.id)}
                disabled={disabled || uploading}
              >
                <X className="h-3 w-3" />
              </Button>
              
              <div className="aspect-square rounded overflow-hidden bg-muted flex items-center justify-center">
                {mediaItem.type === 'image' ? (
                  <img
                    src={getPreviewUrl(mediaItem)}
                    alt={mediaItem.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <FileVideo className="h-8 w-8 mb-1" />
                    <span className="text-xs text-center px-1">{mediaItem.name}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-2 text-xs text-center">
                <div className="flex items-center justify-center gap-1">
                  {mediaItem.type === 'image' ? (
                    <Image className="h-3 w-3" />
                  ) : (
                    <Video className="h-3 w-3" />
                  )}
                  <span className="truncate">
                    {mediaItem.size ? `${(mediaItem.size / 1024 / 1024).toFixed(1)} MB` : ''}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {uploading && (
        <div className="text-center text-sm text-muted-foreground">
          جاري رفع الملفات...
        </div>
      )}
    </div>
  );
};