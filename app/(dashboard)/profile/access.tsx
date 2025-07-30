import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  StatusBar,
  Alert,
} from "react-native";
import { ArrowLeft, MoreVertical } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import { CONFIG } from "@/Constants/config";

interface AssetData {
  _id: string;
  title?: string;
  name?: string;
  description: string;
  posterUrl?: string;
  thumbnailUrl?: string;
  total_episodes?: number;
}

interface Asset {
  _id: string;
  user_id: string;
  content_id: string;
  content_type: 'video' | 'series';
  access_type: string;
  payment_method: string;
  payment_amount: number;
  expires_at: string | null;
  granted_at: string;
  createdAt: string;
  updatedAt: string;
  asset_data: AssetData;
}

interface CreatorPass {
  _id: string;
  user_id: string;
  creator_id: {
    _id: string;
    username: string;
    profile_photo: string;
  };
  amount_paid: number;
  end_date: string;
  status: string;
  start_date: string;
  createdAt: string;
}

interface PurchasedAccessData {
  assets: Asset[];
  creator_passes: CreatorPass[];
}

export default function AccessPage() {
  const [activeTab, setActiveTab] = useState<'content' | 'series' | 'creator'>('content');
  const [purchasedData, setPurchasedData] = useState<PurchasedAccessData>({ assets: [], creator_passes: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const router = useRouter();
  const { token, user } = useAuthStore();

  console.log("User email:", user?.email);
  console.log("Token:", token ? "Token exists" : "No token");

  useEffect(() => {
    fetchPurchasedAccess();
  }, []);

  const fetchPurchasedAccess = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${CONFIG.API_BASE_URL}/api/v1/user/purchased-access`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (response.ok) {
        setPurchasedData(result.data || { assets: [], creator_passes: [] });
      } else {
        setPurchasedData({ assets: [], creator_passes: [] });
      }
    } catch (error) {
      setPurchasedData({ assets: [], creator_passes: [] });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveAccess = async (id: string, type: 'asset' | 'creator_pass') => {
    Alert.alert(
      "Remove Access",
      `Are you sure you want to remove this ${type === 'asset' ? 'content' : 'creator pass'} from your purchased access?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            setIsRemoving(id);
            try {
              const endpoint = type === 'asset'
                ? `${CONFIG.API_BASE_URL}/api/v1/user/purchased-access/asset/${id}`
                : `${CONFIG.API_BASE_URL}/api/v1/user/purchased-access/creator-pass/${id}`;

              const response = await fetch(endpoint, {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              });

              if (response.ok) {
                // Remove from local state
                if (type === 'asset') {
                  setPurchasedData(prev => ({
                    ...prev,
                    assets: prev.assets.filter(asset => asset._id !== id)
                  }));
                } else {
                  setPurchasedData(prev => ({
                    ...prev,
                    creator_passes: prev.creator_passes.filter(pass => pass._id !== id)
                  }));
                }
                Alert.alert("Success", "Access removed successfully");
              } else {
                Alert.alert("Error", "Failed to remove access. Please try again.");
              }
            } catch (error) {
              Alert.alert("Error", "Failed to remove access. Please try again.");
            } finally {
              setIsRemoving(null);
              setActiveDropdown(null);
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dateString;
    }
  };

  const getFilteredData = () => {
    switch (activeTab) {
      case 'content':
        return purchasedData.assets.filter(asset => asset.content_type === 'video');
      case 'series':
        return purchasedData.assets.filter(asset => asset.content_type === 'series');
      case 'creator':
        return purchasedData.creator_passes;
      default:
        return [];
    }
  };

  const renderTabButton = (tab: 'content' | 'series' | 'creator', label: string) => (
    <TouchableOpacity
      onPress={() => setActiveTab(tab)}
      className={`flex-1 pb-4 ${activeTab === tab ? 'border-b-2 border-white' : ''}`}
    >
      <Text className={`text-center font-medium ${activeTab === tab ? 'text-white' : 'text-gray-400'
        }`}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderAssetItem = (asset: Asset) => (
    <View key={asset._id} className="relative">
      <LinearGradient
        colors={['#000000', '#0a0a0a', '#1a1a1a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-row items-center p-4 rounded-lg mb-3"
      >
        <Image
          source={{
            uri: asset.asset_data.thumbnailUrl || asset.asset_data.posterUrl ||
              'https://images.unsplash.com/photo-1489599735734-79b4169c2a78?w=100&h=100&fit=crop'
          }}
          className="w-12 h-12 rounded-lg"
          resizeMode="cover"
        />
        <View className="flex-1 ml-3">
          <Text className="text-white font-medium text-base">
            {asset.asset_data.title || asset.asset_data.name || 'Untitled'}
          </Text>
          <Text className="text-gray-400 text-sm mt-1">
            Purchase on {formatDate(asset.granted_at)}
          </Text>
        </View>
        <TouchableOpacity
          className="p-2"
          onPress={() => setActiveDropdown(activeDropdown === asset._id ? null : asset._id)}
        >
          <MoreVertical size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Dropdown Menu */}
      {activeDropdown === asset._id && (
        <View
          className="absolute right-4 top-16 rounded-lg border border-gray-700 z-10 min-w-32"
          style={{ backgroundColor: '#6B7280' }}
        >
          <TouchableOpacity
            className="px-4 py-3"
            onPress={() => handleRemoveAccess(asset._id, 'asset')}
            disabled={isRemoving === asset._id}
          >
            <Text style={{ color: '#FFFFFF' }} className="font-medium">
              {isRemoving === asset._id ? 'Removing...' : 'Remove'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderCreatorPassItem = (creatorPass: CreatorPass) => (
    <LinearGradient
      key={creatorPass._id}
      colors={['#000000', '#0a0a0a', '#1a1a1a']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-row items-center p-4 rounded-lg mb-3"
    >
      <Image
        source={{
          uri: creatorPass.creator_id.profile_photo ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${creatorPass.creator_id.username}`
        }}
        className="w-16 h-16 rounded-full"
        resizeMode="cover"
      />
      <View className="flex-1 ml-4">
        <Text className="text-white font-semibold text-lg">
          {creatorPass.creator_id.username}
        </Text>
        <Text className="text-gray-400 text-sm mt-1">
          Access till {formatDate(creatorPass.end_date)}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => handleRemoveAccess(creatorPass._id, 'creator_pass')}
        disabled={isRemoving === creatorPass._id}
        className="px-2 py-1 rounded-lg border border-white"
        style={{
          backgroundColor: 'transparent',
          borderColor: '#FFFFFF',
          borderWidth: 1
        }}
      >
        <Text className="text-white font-medium text-sm">
          {isRemoving === creatorPass._id ? 'Removing...' : 'Remove'}
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-12 pb-4">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-semibold">Purchased Access</Text>
        <View className="w-8" />
      </View>

      {/* Tabs */}
      <View className="flex-row px-4 mb-6">
        {renderTabButton('content', 'Content')}
        {renderTabButton('series', 'Series')}
        {renderTabButton('creator', 'Creator')}
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-4">
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setActiveDropdown(null)}
          className="flex-1"
        >
          {isLoading ? (
            <View className="flex-1 items-center justify-center mt-20">
              <ActivityIndicator size="large" color="#F1C40F" />
            </View>
          ) : (() => {
            const filteredData = getFilteredData();

            return filteredData.length > 0 ? (
              filteredData.map((item: any) =>
                activeTab === 'creator' ? renderCreatorPassItem(item) : renderAssetItem(item)
              )
            ) : (
              <View className="flex-1 items-center justify-center mt-20">
                <Text className="text-gray-400 text-center">
                  No purchased {activeTab} found
                </Text>
              </View>
            );
          })()}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}