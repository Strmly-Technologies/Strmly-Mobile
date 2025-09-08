import { CONFIG } from '@/Constants/config';

// Default profile photo URLs from CDN
export const DEFAULT_PROFILE_PHOTOS = {
  USER: CONFIG.DEFAULT_USER_PROFILE_PHOTO,
  COMMUNITY: CONFIG.DEFAULT_COMMUNITY_PROFILE_PHOTO
};

/**
 * Get the appropriate profile photo URL, falling back to default if none provided
 * @param profilePhoto - The user's profile photo URL
 * @param type - Type of profile ('user' or 'community')
 * @returns The profile photo URL or default URL
 */
export const getProfilePhotoUrl = (profilePhoto: string | null | undefined, type: 'user' | 'community' = 'user'): string => {
  // Return the profile photo if it exists and is not empty
  if (profilePhoto && profilePhoto.trim() !== '') {
    return profilePhoto;
  }
  
  // Return appropriate default based on type
  return type === 'community' ? DEFAULT_PROFILE_PHOTOS.COMMUNITY : CONFIG.DEFAULT_USER_PROFILE_PHOTO;
};

/**
 * Check if a profile photo URL is a default one
 * @param profilePhoto - The profile photo URL to check
 * @returns True if it's a default photo
 */
export const isDefaultProfilePhoto = (profilePhoto: string): boolean => {
  return Object.values(DEFAULT_PROFILE_PHOTOS).includes(profilePhoto);
};