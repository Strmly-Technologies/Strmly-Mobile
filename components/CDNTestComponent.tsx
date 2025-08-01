import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { convertToCDNUrl, testCDNConversion, processVideoForCDN } from '@/utils/cdnUtils';
import { CONFIG } from '@/Constants/config';

export const CDNTestComponent: React.FC = () => {
  const handleTestConversion = () => {
    console.log('🧪 Testing CDN URL conversion with real CloudFront domain...');
    testCDNConversion();
  };

  const handleTestSingleUrl = () => {
    const testUrl = 'https://strmly-videos-mumbai.s3.ap-south-1.amazonaws.com/thumbnails/test.jpg';
    const converted = convertToCDNUrl(testUrl);
    console.log('✅ Single URL test:', { 
      original: testUrl, 
      converted,
      success: converted.includes('d2d0kz44xjmrg8.cloudfront.net')
    });
  };

  const handleTestVideoProcessing = () => {
    const testVideo = {
      videoUrl: 'https://strmly-videos-mumbai.s3.ap-south-1.amazonaws.com/long_video/video123.mp4',
      thumbnailUrl: 'https://strmly-videos-mumbai.s3.ap-south-1.amazonaws.com/video_thumbnails/thumb123.jpg',
      title: 'Test Video'
    };
    
    const processed = processVideoForCDN(testVideo);
    console.log('✅ Video processing test:', { 
      original: testVideo, 
      processed,
      videoUrlConverted: processed.videoUrl?.includes('d2d0kz44xjmrg8.cloudfront.net'),
      thumbnailConverted: processed.thumbnailUrl?.includes('d2d0kz44xjmrg8.cloudfront.net')
    });
  };

  const handleTestRealVideoUrls = () => {
    // Test with actual URLs from your backend
    const realUrls = [
      'https://strmly-videos-mumbai.s3.ap-south-1.amazonaws.com/long/2983ed74-befe-4792-adb4-90efed86b94a.mp4',
      'https://strmly-videos-mumbai.s3.ap-south-1.amazonaws.com/long_video/82b00792-26e2-411c-b932-403656c21da3.mp4',
      'https://strmly-videos-mumbai.s3.ap-south-1.amazonaws.com/video_thumbnails/80f89da2-1254-4dfd-ae2a-fd97d1cb5580.mp4_thumbnail'
    ];

    console.log('🧪 Testing real video URLs from backend:');
    realUrls.forEach((url, index) => {
      const converted = convertToCDNUrl(url);
      console.log(`${index + 1}. Original: ${url}`);
      console.log(`   CDN:      ${converted}`);
      console.log(`   Success:  ${converted.includes('d2d0kz44xjmrg8.cloudfront.net')}`);
      console.log('---');
    });
  };

  return (
    <ScrollView style={{ padding: 20, backgroundColor: '#1a1a1a', margin: 10, borderRadius: 8 }}>
      <Text style={{ color: 'white', fontSize: 18, marginBottom: 10 }}>CDN Test Panel</Text>
      
      <View style={{ marginBottom: 15 }}>
        <Text style={{ color: '#ccc', marginBottom: 5 }}>Configuration:</Text>
        <Text style={{ color: '#888', fontSize: 12 }}>
          CDN URL: {CONFIG.CDN_URL || 'Not configured'}
        </Text>
        <Text style={{ color: '#888', fontSize: 12 }}>
          S3 Base: {CONFIG.S3_BASE_URL}
        </Text>
      </View>

      <TouchableOpacity
        onPress={handleTestConversion}
        style={{
          backgroundColor: '#007AFF',
          padding: 12,
          borderRadius: 6,
          marginBottom: 10
        }}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>
          Test Multiple URLs
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleTestSingleUrl}
        style={{
          backgroundColor: '#34C759',
          padding: 12,
          borderRadius: 6,
          marginBottom: 10
        }}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>
          Test Single URL
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleTestVideoProcessing}
        style={{
          backgroundColor: '#FF9500',
          padding: 12,
          borderRadius: 6,
          marginBottom: 10
        }}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>
          Test Video Processing
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleTestRealVideoUrls}
        style={{
          backgroundColor: '#FF3B30',
          padding: 12,
          borderRadius: 6,
          marginBottom: 10
        }}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>
          Test Real Backend URLs
        </Text>
      </TouchableOpacity>

      <View style={{ marginTop: 15 }}>
        <Text style={{ color: '#ccc', fontSize: 14 }}>
          CDN Domain: d2d0kz44xjmrg8.cloudfront.net
        </Text>
        <Text style={{ color: '#888', fontSize: 12, marginTop: 5 }}>
          Check console logs for test results
        </Text>
      </View>
    </ScrollView>
  );
};