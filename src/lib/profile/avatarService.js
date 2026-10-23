import { supabase } from '../supabase/client.js';

export const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
export const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Validates an avatar file before uploading.
 */
export function validateAvatarFile(file) {
  if (!file) {
    return { valid: false, error: 'No file provided.' };
  }

  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file format. Please upload a JPEG, PNG, WebP, or GIF image.',
    };
  }

  if (file.size > MAX_AVATAR_SIZE_BYTES) {
    return {
      valid: false,
      error: 'Image file size exceeds the 2MB limit. Please choose a smaller image.',
    };
  }

  return { valid: true };
}

/**
 * Uploads an avatar image to Supabase Storage under /avatars/{userId}/...
 * Returns the resulting public URL.
 */
export async function uploadAvatarFile(userId, file) {
  const validation = validateAvatarFile(file);
  if (!validation.valid) {
    return { error: validation.error };
  }

  if (!userId) {
    return { error: 'User is not authenticated.' };
  }

  try {
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png';
    const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.warn('Supabase storage upload error:', uploadError);
      return { error: uploadError.message || 'Failed to upload avatar image to storage.' };
    }

    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return { publicUrl: urlData?.publicUrl || null };
  } catch (err) {
    console.error('Unexpected avatar upload error:', err);
    return { error: 'An unexpected error occurred while uploading your profile picture.' };
  }
}
