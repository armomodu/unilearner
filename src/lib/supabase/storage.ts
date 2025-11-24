import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const BUCKET_NAME = 'blog-images'; // Default bucket name
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export interface UploadResult {
  success: boolean;
  imageUrl?: string;
  imagePath?: string;
  error?: string;
}

export async function uploadHeaderImage(
  file: File,
  blogId: string,
  userId: string
): Promise<UploadResult> {
  try {
    // Validate file
    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    if (file.size > MAX_FILE_SIZE) {
      return { success: false, error: 'File size must be less than 5MB' };
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return { success: false, error: 'Please upload a valid image file (JPEG, PNG, WebP, or GIF)' };
    }

    const supabase = createClientComponentClient();

    // Create unique filename
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const fileName = `${blogId}_${Date.now()}.${fileExt}`;
    const filePath = `users/${userId}/blogs/${fileName}`;

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { success: false, error: 'Failed to upload image' };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      return { success: false, error: 'Failed to get image URL' };
    }

    return {
      success: true,
      imageUrl: urlData.publicUrl,
      imagePath: filePath,
    };

  } catch (error) {
    console.error('Image upload error:', error);
    return { success: false, error: 'An unexpected error occurred during upload' };
  }
}

export async function deleteHeaderImage(imagePath: string): Promise<boolean> {
  try {
    const supabase = createClientComponentClient();

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([imagePath]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Image delete error:', error);
    return false;
  }
}

export function optimizeImageUrl(url: string, width?: number, height?: number, quality: number = 80): string {
  if (!url) return url;
  
  // For Supabase, we can use transformation parameters if enabled
  // This would require enabling Supabase's image transformation features
  // For now, return the original URL
  return url;
}

export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  if (!file) {
    return { isValid: false, error: 'No file selected' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { isValid: false, error: 'File size must be less than 5MB' };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { isValid: false, error: 'Please upload a valid image file (JPEG, PNG, WebP, or GIF)' };
  }

  return { isValid: true };
}