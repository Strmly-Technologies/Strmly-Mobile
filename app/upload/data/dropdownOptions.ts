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

// Genre options for video classification
// Backend: GET /api/genres
export const genreOptions: DropdownOption[] = [
  {
    label: 'Action',
    value: 'action',
  },
  {
    label: 'Comedy',
    value: 'comedy',
  },
  {
    label: 'Drama',
    value: 'drama',
  },
  {
    label: 'Documentary',
    value: 'documentary',
  },
  {
    label: 'Educational',
    value: 'educational',
  },
  {
    label: 'Entertainment',
    value: 'entertainment',
  },
  {
    label: 'Horror',
    value: 'horror',
  },
  {
    label: 'Music',
    value: 'music',
  },
  {
    label: 'News',
    value: 'news',
  },
  {
    label: 'Sports',
    value: 'sports',
  },
  {
    label: 'Technology',
    value: 'technology',
  },
  {
    label: 'Travel',
    value: 'travel',
  },
];

/**
 * Helper function to get options by type
 * Useful for dynamic option loading
 */
export const getDropdownOptions = (type: 'community' | 'format' | 'genre'): DropdownOption[] => {
  switch (type) {
    case 'community':
      return communityOptions;
    case 'format':
      return formatOptions;
    case 'genre':
      return genreOptions;
    default:
      return [];
  }
};

/**
 * Helper function to find option label by value
 * Useful for displaying selected values
 */
export const getOptionLabel = (type: 'community' | 'format' | 'genre', value: string): string => {
  const options = getDropdownOptions(type);
  const option = options.find(opt => opt.value === value);
  return option?.label || value;
};