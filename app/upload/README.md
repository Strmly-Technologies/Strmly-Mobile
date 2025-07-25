# Video Upload Flow - Backend Integration Guide

This document provides a comprehensive guide for implementing the backend API endpoints and integration points for the video upload flow.

## Overview

The video upload flow consists of 5 main screens:
1. **Upload Progress Screen** - Shows upload progress with animated indicator
2. **Video Detail Screen (Step 1)** - Title and Community selection
3. **Video Detail Screen (Step 2)** - Adds Format selection
4. **Video Detail Screen (Step 3)** - All fields without dropdowns
5. **Final Stage Screen** - Genre, autoplay timing, and unlock timing

## API Endpoints Required

### 1. Video Upload Endpoint
```
POST /api/videos/upload
Content-Type: multipart/form-data

Request Body:
- video: File (video file)
- metadata: JSON string (optional initial metadata)

Response:
{
  "uploadId": "uuid",
  "status": "uploading",
  "progress": 0
}
```

### 2. Upload Progress Tracking
```
GET /api/videos/upload-progress/:uploadId

Response:
{
  "uploadId": "uuid",
  "progress": 45,
  "status": "uploading" | "completed" | "failed",
  "error": "error message if failed"
}
```

### 3. Dropdown Data Endpoints

#### Communities
```
GET /api/communities

Response:
{
  "communities": [
    {
      "id": "uuid",
      "name": "#Startup India",
      "value": "startup-india",
      "memberCount": 1250
    }
  ]
}
```

#### Formats
```
GET /api/formats

Response:
{
  "formats": [
    {
      "id": "uuid",
      "name": "Netflix",
      "value": "netflix",
      "description": "Long-form content format"
    },
    {
      "id": "uuid", 
      "name": "Youtube",
      "value": "youtube",
      "description": "Short to medium form content"
    }
  ]
}
```

#### Genres
```
GET /api/genres

Response:
{
  "genres": [
    {
      "id": "uuid",
      "name": "Action",
      "value": "action"
    }
  ]
}
```

### 4. Video Publication Endpoint
```
POST /api/videos/publish

Request Body:
{
  "uploadId": "uuid",
  "title": "Video Title",
  "community": "startup-india",
  "format": "netflix",
  "genre": "educational",
  "autoplayStartTime": 22,  // in seconds
  "unlockFromTime": 45,     // in seconds
  "description": "Optional description"
}

Response:
{
  "videoId": "uuid",
  "status": "published",
  "url": "https://app.strmly.com/video/uuid"
}
```

### 5. Draft Management
```
POST /api/videos/draft
PUT /api/videos/draft/:draftId
GET /api/videos/drafts

// Save draft during form filling
POST /api/videos/draft
{
  "uploadId": "uuid",
  "title": "Partial title",
  "community": "startup-india",
  // ... other partial data
}
```

## Data Models

### Video Upload Model
```typescript
interface VideoUpload {
  id: string;
  userId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  duration?: number;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number;
  uploadedAt: Date;
  completedAt?: Date;
  error?: string;
}
```

### Video Model
```typescript
interface Video {
  id: string;
  uploadId: string;
  userId: string;
  title: string;
  description?: string;
  communityId: string;
  format: 'netflix' | 'youtube';
  genre: string;
  autoplayStartTime: number; // seconds
  unlockFromTime: number;    // seconds
  thumbnailUrl?: string;
  videoUrl: string;
  duration: number;
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  publishedAt?: Date;
}
```

## Implementation Notes

### File Upload Handling
- Use multipart upload for large video files
- Implement chunked upload for better reliability
- Generate thumbnails during processing
- Validate file types and sizes
- Store files in cloud storage (AWS S3, Google Cloud, etc.)

### Progress Tracking
- Use WebSocket or Server-Sent Events for real-time progress
- Alternative: Polling with GET /api/videos/upload-progress/:uploadId
- Update progress during upload and video processing phases

### Error Handling
- Network connectivity issues
- File size/format validation errors
- Server processing errors
- Storage quota exceeded
- Invalid metadata

### Security Considerations
- Authenticate all API requests
- Validate file types and sizes
- Scan uploaded files for malware
- Rate limit upload requests
- Implement proper CORS policies

### Database Schema

#### videos table
```sql
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id UUID REFERENCES uploads(id),
  user_id UUID REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  community_id UUID REFERENCES communities(id),
  format VARCHAR(50) NOT NULL,
  genre VARCHAR(100) NOT NULL,
  autoplay_start_time INTEGER NOT NULL DEFAULT 0,
  unlock_from_time INTEGER NOT NULL DEFAULT 0,
  thumbnail_url TEXT,
  video_url TEXT NOT NULL,
  duration INTEGER,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP
);
```

#### uploads table
```sql
CREATE TABLE uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size BIGINT NOT NULL,
  status VARCHAR(50) DEFAULT 'uploading',
  progress INTEGER DEFAULT 0,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  error_message TEXT
);
```

## Frontend Integration Points

### Key Files to Modify for Backend Integration:

1. **`app/upload/hooks/useUploadFlow.ts`**
   - Replace `simulateUpload()` with real API calls
   - Implement `submitUpload()` with actual API endpoint
   - Add error handling and retry logic

2. **`app/upload/data/dropdownOptions.ts`**
   - Replace static arrays with API calls
   - Add caching for frequently accessed data
   - Implement search/filter functionality

3. **`app/upload/screens/UploadProgressScreen.tsx`**
   - Connect to real-time progress updates
   - Add proper error handling for upload failures

4. **`app/upload/VideoUploadFlow.tsx`**
   - Add proper error boundaries
   - Implement offline support for draft saving

### Environment Variables
```env
API_BASE_URL=https://api.strmly.com
UPLOAD_MAX_SIZE=100MB
SUPPORTED_FORMATS=mp4,mov,avi,mkv
```

## Testing Recommendations

### Backend Testing
- Unit tests for all API endpoints
- Integration tests for upload flow
- Load testing for concurrent uploads
- Error scenario testing

### Frontend Testing
- Mock API responses for development
- Test offline scenarios
- Test large file uploads
- Test network interruption recovery

## Monitoring and Analytics

### Metrics to Track
- Upload success/failure rates
- Average upload times
- Popular communities and genres
- User drop-off points in the flow
- Video processing times

### Logging
- Upload start/completion events
- Error occurrences with context
- User interaction events
- Performance metrics

This implementation provides a solid foundation for the video upload feature with clear separation between frontend and backend concerns.