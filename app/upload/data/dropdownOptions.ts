import { DropdownOption } from '../types';

/**
 * Dropdown Options Data
 * Static data for dropdown components - replace with API calls in production
 * 
 * Backend Integration Notes:
 * - Replace these static arrays with API calls
 * - Consider implementing caching for frequently accessed data
 * - Add pagination for large datasets
 * - Implement search/filter functionality
 */

// Community options for video categorization
// Backend: GET /api/communities
export const communityOptions: DropdownOption[] = [
  {
    label: 'No Community',
    value: 'none',
  },
  {
    label: '#Startup India',
    value: 'startup-india',
  },
  {
    label: '#Tech Talk',
    value: 'tech-talk',
  },
  {
    label: '#Business',
    value: 'business',
  },
  {
    label: '#Entertainment',
    value: 'entertainment',
  },
];

// Format options for content type
// Backend: GET /api/formats
export const formatOptions: DropdownOption[] = [
  {
    label: 'Netflix',
    value: 'netflix',
  },
  {
    label: 'Youtube',
    value: 'youtube',
  },
];

// Video type options for monetization
// Backend: GET /api/video-types
export const videoTypeOptions: DropdownOption[] = [
  {
    label: 'Free',
    value: 'free',
  },
  {
    label: 'Paid',
    value: 'paid',
  },
];

// Genre options for video classification - matching Draft model enum values
// Backend: GET /api/genres
export const genreOptions: DropdownOption[] = [
  {
    label: 'Action',
    value: 'Action',
  },
  {
    label: 'Comedy',
    value: 'Comedy',
  },
  {
    label: 'Drama',
    value: 'Drama',
  },
  {
    label: 'Horror',
    value: 'Horror',
  },
  {
    label: 'Sci-Fi',
    value: 'Sci-Fi',
  },
  {
    label: 'Romance',
    value: 'Romance',
  },
  {
    label: 'Documentary',
    value: 'Documentary',
  },
  {
    label: 'Thriller',
    value: 'Thriller',
  },
  {
    label: 'Fantasy',
    value: 'Fantasy',
  },
  {
    label: 'Animation',
    value: 'Animation',
  },
];

/**
 * Helper function to get options by type
 * Useful for dynamic option loading
 */
export const getDropdownOptions = (type: 'community' | 'format' | 'genre' | 'videoType'): DropdownOption[] => {
  switch (type) {
    case 'community':
      return communityOptions;
    case 'format':
      return formatOptions;
    case 'genre':
      return genreOptions;
    case 'videoType':
      return videoTypeOptions;
    default:
      return [];
  }
};

/**
 * Helper function to find option label by value
 * Useful for displaying selected values
 */
export const getOptionLabel = (type: 'community' | 'format' | 'genre' | 'videoType', value: string): string => {
  const options = getDropdownOptions(type);
  const option = options.find(opt => opt.value === value);
  return option?.label || value;
};