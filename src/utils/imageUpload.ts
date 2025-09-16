import { supabase } from '../integrations/supabase/client';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Upload image to Supabase Storage
 * @param file - The image file to upload
 * @param folder - The folder to upload to (e.g., 'shop-images', 'mall-images')
 * @param fileName - Optional custom file name
 */
export const uploadImageToStorage = async (
  file: File,
  folder: string = 'images',
  fileName?: string
): Promise<UploadResult> => {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: 'يرجى اختيار ملف صورة صالح'
      };
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return {
        success: false,
        error: 'حجم الملف يجب أن يكون أقل من 10 ميجابايت'
      };
    }

    // Generate unique file name
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const finalFileName = fileName || `${timestamp}_${randomString}.${fileExtension}`;
    const filePath = `${folder}/${finalFileName}`;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading image:', error);
      return {
        success: false,
        error: 'حدث خطأ أثناء رفع الصورة'
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return {
      success: true,
      url: urlData.publicUrl
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    return {
      success: false,
      error: 'حدث خطأ غير متوقع أثناء رفع الصورة'
    };
  }
};

/**
 * Delete image from Supabase Storage
 * @param url - The public URL of the image to delete
 */
export const deleteImageFromStorage = async (url: string): Promise<boolean> => {
  try {
    // Extract file path from URL
    const urlParts = url.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const folder = urlParts[urlParts.length - 2];
    const filePath = `${folder}/${fileName}`;

    const { error } = await supabase.storage
      .from('images')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting image:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};

/**
 * Convert file to base64 for preview
 * @param file - The file to convert
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Validate image file
 * @param file - The file to validate
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return {
      valid: false,
      error: 'يرجى اختيار ملف صورة صالح'
    };
  }

  // Check file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return {
      valid: false,
      error: 'حجم الملف يجب أن يكون أقل من 10 ميجابايت'
    };
  }

  // Check file extension
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  
  if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
    return {
      valid: false,
      error: 'نوع الملف غير مدعوم. يرجى اختيار صورة بصيغة JPG, PNG, GIF, أو WebP'
    };
  }

  return { valid: true };
};
