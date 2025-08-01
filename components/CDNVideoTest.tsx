import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { convertToCDNUrl } from '@/utils/cdnUtils';

export const CDNVideoTest: React.FC = () => {
  const [testResults, setTestResults] = useState<any[]>([]);

  // Sample URLs from your actual backend response
  const sampleVideoUrls = [
    {
      type: 'Video',
      original: 'https://strmly-videos-mumbai.s3.ap-south-1.amazonaws.com/long/2983ed74-befe-4792-adb4-90efed86b94a.mp4'
    },
    {
      type: 'Video',
      original: 'https://strmly-videos-mumbai.s3.ap-south-1.amazonaws.com/long_video/82b00792-26e2-411c-b932-403656c21da3.mp4'
    },
    {
      type: 'Thumbnail',
      original: 'https://strmly-videos-mumbai.s3.ap-south-1.amazonaws.com/video_thumbnails/80f89da2-1254-4dfd-ae2a-fd97d1cb5580.mp4_thumbnail'
    },
    {
      type: 'Thumbnail',
      original: 'https://strmly-videos-mumbai.s3.ap-south-1.amazonaws.com/video_thumbnails/96c847ad-0721-477f-8b01-ca98650996b5.mp4_thumbnail'
    }
  ];

  const handleTestCDNConversion = () => {
    console.log('🧪 Testing CDN conversion with real backend URLs...');
    
    const results = sampleVideoUrls.map(item => {
      const converted = convertToCDNUrl(item.original);
      const isConverted = converted !== item.original;
      const hasCloudFront = converted.includes('d2d0kz44xjmrg8.cloudfront.net');
      
      const result = {
        ...item,
        converted,
        isConverted,
        hasCloudFront,
        status: isConverted ? (hasCloudFront ? '✅ Success' : '⚠️ Partial') : '❌ Failed'
      };
      
      console.log(`${item.type}: ${result.status}`);
      console.log(`Original: ${item.original}`);
      console.log(`CDN:      ${converted}`);
      console.log('---');
      
      return result;
    });
    
    setTestResults(results);
  };

  const handleTestThumbnailLoad = (url: string) => {
    console.log('🖼️ Testing thumbnail load from CDN:', url);
    // You can add actual image loading test here
  };

  return (
    <ScrollView style={{ padding: 20, backgroundColor: '#1a1a1a', margin: 10, borderRadius: 8 }}>
      <Text style={{ color: 'white', fontSize: 18, marginBottom: 10 }}>CDN Video Test Panel</Text>
      
      <View style={{ marginBottom: 15 }}>
        <Text style={{ color: '#ccc', marginBottom: 5 }}>CloudFront CDN:</Text>
        <Text style={{ color: '#888', fontSize: 12 }}>
          d2d0kz44xjmrg8.cloudfront.net
        </Text>
      </View>

      <TouchableOpacity
        onPress={handleTestCDNConversion}
        style={{
          backgroundColor: '#007AFF',
          padding: 12,
          borderRadius: 6,
          marginBottom: 15
        }}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>
          Test Real Backend URLs
        </Text>
      </TouchableOpacity>

      {testResults.length > 0 && (
        <View style={{ marginTop: 10 }}>
          <Text style={{ color: 'white', fontSize: 16, marginBottom: 10 }}>Test Results:</Text>
          {testResults.map((result, index) => (
            <View key={index} style={{ 
              backgroundColor: '#2a2a2a', 
              padding: 10, 
              borderRadius: 6, 
              marginBottom: 10 
            }}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>
                {result.type} {result.status}
              </Text>
              <Text style={{ color: '#888', fontSize: 10, marginTop: 5 }}>
                Original: {result.original.substring(0, 50)}...
              </Text>
              <Text style={{ color: '#888', fontSize: 10 }}>
                CDN: {result.converted.substring(0, 50)}...
              </Text>
              
              {result.type === 'Thumbnail' && result.hasCloudFront && (
                <TouchableOpacity
                  onPress={() => handleTestThumbnailLoad(result.converted)}
                  style={{
                    backgroundColor: '#34C759',
                    padding: 8,
                    borderRadius: 4,
                    marginTop: 8
                  }}
                >
                  <Text style={{ color: 'white', textAlign: 'center', fontSize: 12 }}>
                    Test Load Image
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      )}

      <View style={{ marginTop: 15 }}>
        <Text style={{ color: '#ccc', fontSize: 14 }}>
          This tests CDN conversion with actual URLs from your backend
        </Text>
      </View>
    </ScrollView>
  );
};