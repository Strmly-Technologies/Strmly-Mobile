import { CONFIG } from '@/Constants/config';

/**
 * Converts S3 URLs to CDN URLs for faster content delivery
 * 
 * @param s3Url - The original S3 URL from the backend
 * @returns CDN URL if CDN is configured, otherwise returns original URL
 * 
 * Example:
 * Input:  "https://strmly-videos-mumbai.s3.ap-south-1.amazonaws.com/thumbnails/abc.jpg"
 * Output: "https://d123abc4xyz.cloudfront.net/thumbnails/abc.jpg"
 */
export const convertToCDNUrl = (s3Url: string): string => {
  // Return original URL if no CDN is configured
  if (!CONFIG.CDN_URL || !CONFIG.S3_BASE_URL) {
    console.warn('CDN not configured, using original S3 URL');
    return s3Url;
  }

  // Return original URL if it's not an S3 URL
  if (!s3Url || !s3Url.includes(CONFIG.S3_BASE_URL)) {
    return s3Url;
  }

  try {
    // Replace S3 base URL with CDN URL
    const cdnUrl = s3Url.replace(CONFIG.S3_BASE_URL, CONFIG.CDN_URL);
    
    console.log('🚀 CDN URL conversion:', {
      original: s3Url,
      cdn: cdnUrl
    });
    
    return cdnUrl;
  } catch (error) {
    console.error('Error converting to CDN URL:', error);
    return s3Url; // Fallback to original URL
  }
};

/**
 * Converts multiple S3 URLs to CDN URLs
 * 
 * @param urls - Array of S3 URLs
 * @returns Array of CDN URLs
 */
export const convertMultipleToCDNUrls = (urls: string[]): string[] => {
  return urls.map(url => convertToCDNUrl(url));
};

/**
 * Processes video data and converts all media URLs to CDN URLs
 * 
 * @param videoData - Video object with URLs
 * @returns Video object with CDN URLs
 */
export const processVideoForCDN = (videoData: any) => {
  if (!videoData) return videoData;

  return {
    ...videoData,
    videoUrl: videoData.videoUrl ? convertToCDNUrl(videoData.videoUrl) : videoData.videoUrl,
    thumbnailUrl: videoData.thumbnailUrl ? convertToCDNUrl(videoData.thumbnailUrl) : videoData.thumbnailUrl,
    // Handle any other media URLs in the video object
    ...(videoData.poster && { poster: convertToCDNUrl(videoData.poster) }),
    ...(videoData.preview && { preview: convertToCDNUrl(videoData.preview) }),
  };
};

/**
 * Processes an array of videos and converts all media URLs to CDN URLs
 * 
 * @param videos - Array of video objects
 * @returns Array of video objects with CDN URLs
 */
export const processVideosForCDN = (videos: any[]): any[] => {
  if (!Array.isArray(videos)) return videos;
  
  return videos.map(video => processVideoForCDN(video));
};

/**
 * Processes user profile data and converts profile images to CDN URLs
 * 
 * @param userData - User object with image URLs
 * @returns User object with CDN URLs
 */
export const processUserForCDN = (userData: any) => {
  if (!userData) return userData;

  return {
    ...userData,
    profile_photo: userData.profile_photo ? convertToCDNUrl(userData.profile_photo) : userData.profile_photo,
    avatar: userData.avatar ? convertToCDNUrl(userData.avatar) : userData.avatar,
    cover_image: userData.cover_image ? convertToCDNUrl(userData.cover_image) : userData.cover_image,
  };
};

/**
 * Debug function to test CDN URL conversion
 */
export const testCDNConversion = () => {
  const testUrls = [
    'https://strmly-videos-mumbai.s3.ap-south-1.amazonaws.com/thumbnails/abc.jpg',
    'https://strmly-videos-mumbai.s3.ap-south-1.amazonaws.com/long_video/video123.mp4',
    'https://strmly-videos-mumbai.s3.ap-south-1.amazonaws.com/profiles/user456.jpg',
    'https://strmly-videos-mumbai.s3.ap-south-1.amazonaws.com/long/2983ed74-befe-4792-adb4-90efed86b94a.mp4',
    'https://other-domain.com/image.jpg', // Should not be converted
  ];

  console.log('🧪 Testing CDN URL conversion with CloudFront:');
  console.log(`🔗 CDN Domain: ${CONFIG.CDN_URL}`);
  console.log(`📦 S3 Domain: ${CONFIG.S3_BASE_URL}`);
  console.log('---');
  
  testUrls.forEach((url, index) => {
    const converted = convertToCDNUrl(url);
    const isConverted = converted !== url;
    const hasCloudFront = converted.includes('d2d0kz44xjmrg8.cloudfront.net');
    
    console.log(`${index + 1}. Original: ${url}`);
    console.log(`   CDN:      ${converted}`);
    console.log(`   Status:   ${isConverted ? (hasCloudFront ? '✅ Converted to CloudFront' : '⚠️ Converted but not CloudFront') : '❌ Not converted'}`);
    console.log('---');
  });
};