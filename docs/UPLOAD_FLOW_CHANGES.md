# Upload Flow Navigation Changes

## Overview
Updated the Strmly Studio upload navigation flow to match the new requirements where users can select between episode and single video formats, with episodes requiring series selection or creation.

## New Navigation Flow

### From Drafts Tab
1. **My Drafts** → **Upload new video** → **Upload file** → **Select video format (episode or single)**

### If Episode Selected
2. **Episode** → **Series Selection Screen**
   - Shows existing series with selection
   - "Select" button when series is chosen
   - "Add new series" button always available
3. **Series Selection** → **Series Creation Screen** (if creating new)
   - Same series creation page as in Series tab
   - Give name and type (free/paid)
   - Give series details and create
4. **Series Created/Selected** → **Video Details Pages** (3 steps)
   - Shows selected series information at top
   - Episode title instead of video title
   - Same 3-step detail flow
5. **Final Stage** → **Upload Progress**

### If Single Selected
2. **Single** → **Video Details Pages** (3 steps)
   - Standard single video flow
   - No series information shown
3. **Final Stage** → **Upload Progress**

## Files Modified

### Core Upload Flow
- `app/upload/VideoUploadFlow.tsx` - Added series selection and creation screens to flow
- `app/upload/hooks/useUploadFlow.ts` - Added series-related state and navigation logic
- `app/upload/types.ts` - Added series-related types and new flow steps

### Upload Screens
- `app/upload/screens/VideoDetailScreen.tsx` - Added series information display for episodes
- `app/upload/screens/FinalStageScreen.tsx` - Added series information display for episodes
- `app/upload/screens/FormatSelectScreen.tsx` - Fixed quote escaping

### Series Screens (Reused)
- `app/studio/screens/SeriesSelectionScreen.tsx` - Updated button layout for better UX
- `app/studio/screens/SimpleSeriesCreationScreen.tsx` - No changes (reused as-is)

## Key Features

### Series Information Display
- Episodes show selected series information in video details and final stage
- Series name, access type (free/paid), and episode number displayed
- Visual series icon to distinguish from single videos

### Smart Navigation
- Episode format automatically goes to series selection
- Single format skips series selection entirely
- Series selection allows both selecting existing and creating new series
- Back navigation respects the chosen path

### State Management
- Added `selectedSeries` to upload flow state
- Added `series-selection` and `series-creation` steps
- Proper validation for each step including series selection

## Usage

### For Episodes
1. User selects "Episode" format
2. System shows series selection screen
3. User can select existing series or create new one
4. Series information is carried through the entire upload flow
5. Video details show episode-specific fields and series context

### For Single Videos
1. User selects "Single" format
2. System skips series selection entirely
3. Standard video upload flow continues
4. No series information displayed

## Benefits
- Clear separation between episode and single video workflows
- Reuses existing series creation functionality
- Maintains context throughout the upload process
- Intuitive navigation that matches user mental model
- Consistent with existing series management in Studio