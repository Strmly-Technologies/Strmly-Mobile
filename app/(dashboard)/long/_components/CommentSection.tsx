import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Animated,
  Easing,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Smile,
  ArrowBigUp,
  ArrowBigDown,
  IndianRupee,
  ChevronDown,
  SendHorizonal,
  ReplyIcon,
} from "lucide-react-native";
import { useAuthStore } from "@/store/useAuthStore";
import {
  upvoteComment,
  downvoteComment,
  giftComment,
} from "@/api/Long/CommentAction";
import { Comment, reply } from "@/types/Comments";
import { mockComments as DebugComments } from "@/utils/CommentGenerator";

const mockComments: Comment[] = DebugComments;

interface CommentsSectionProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string | null;
  longVideosOnly: boolean;
  commentss?: [{}]
}

const CommentsSection = (props: CommentsSectionProps) => {
  const { isOpen, onClose, videoId, longVideosOnly, commentss } = props;
  const [comments, setComments] = useState<Comment[]>([]);
  const [comment, setComment] = useState("");
  const [openReplies, setOpenReplies] = useState<{ [key: string]: reply[] }>(
    {}
  );
  const [loadingReplies, setLoadingReplies] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const token = useAuthStore((state) => state.token);
  const [replyTo, setReplyTo] = useState<{
    commentId: string;
    username: string;
  } | null>(null);

  const insets = useSafeAreaInsets();
  const animatedBottom = useRef(new Animated.Value(insets.bottom)).current;

  // --- Fetch functions, reused/stable ---
  const fetchComments = useCallback(async () => {
    if (!token || !videoId) {
      setComments(mockComments);
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/interaction/videos/${videoId}/comments?videoType=${longVideosOnly ? "long" : "short"}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch comments");
      const data = await response.json();
      setComments(data);
    } catch (err) {
      // Optionally use an Alert here
      setComments(mockComments);
    }
  }, [token, longVideosOnly, videoId]);

  useEffect(() => {
    if (isOpen && videoId) fetchComments();
    // eslint-disable-next-line
  }, [isOpen, videoId, fetchComments]);

  const fetchReplies = async (commentID: string) => {
    if (openReplies[commentID]) {
      setOpenReplies((prev) => {
        const newReplies = { ...prev };
        delete newReplies[commentID];
        return newReplies;
      });
      return;
    }
    try {
      setLoadingReplies(commentID);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/interaction/videos/${videoId}/comments/${commentID}/replies`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      setOpenReplies((prev) => ({ ...prev, [commentID]: data }));
    } catch (err) {
      // Optionally handle error
    } finally {
      setLoadingReplies(null);
    }
  };

  const handleUpvote = async (commentID: string) => {
    try {
      const data = await upvoteComment({
        token,
        commentId: commentID,
        videoId,
        videoType: longVideosOnly ? "long" : "short",
      });
      setComments((prev) =>
        prev.map((comment) =>
          comment._id === commentID
            ? {
                ...comment,
                upvotes: data.upvotes,
                downvotes: data.downvotes,
                upvoted: !comment.upvoted,
                downvoted: false,
              }
            : comment
        )
      );
    } catch (err) {}
  };
  const handleDownvote = async (commentID: string) => {
    try {
      const data = await downvoteComment({
        token,
        commentId: commentID,
        videoId,
        videoType: longVideosOnly ? "long" : "short",
      });
      setComments((prev) =>
        prev.map((comment) =>
          comment._id === commentID
            ? {
                ...comment,
                upvotes: data.upvotes,
                downvotes: data.downvotes,
                downvoted: !comment.downvoted,
                upvoted: false,
              }
            : comment
        )
      );
    } catch (err) {}
  };

  const handleGiftComment = async (commentID: string) => {
    // Replace with a modal or a separate gifting screen for input instead of 'prompt'
    // For now, skip gifting UI.
  };

  const handleSendComment = async () => {
    if (!token || !videoId || !comment.trim()) return;
    setIsLoading(true);
    try {
      const body = replyTo
        ? {
            reply: comment,
            videoType: longVideosOnly ? "long" : "short",
            commentId: replyTo.commentId,
            videoId: videoId,
          }
        : {
            videoId,
            videoType: longVideosOnly ? "long" : "short",
            comment,
          };
      const endpoint = replyTo
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/interaction/comments/reply`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/interaction/comment`;
      const response = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error("Failed to post");
      await fetchComments();
      if (replyTo) await fetchReplies(replyTo.commentId);
      setComment("");
      setReplyTo(null);
    } catch (err) {
      // Optionally handle
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        Animated.timing(animatedBottom, {
          toValue: e.endCoordinates.height,
          duration: 250,
          useNativeDriver: false,
          easing: Easing.out(Easing.ease),
        }).start();
      }
    );

    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        Animated.timing(animatedBottom, {
          toValue: insets.bottom,
          duration: 200,
          useNativeDriver: false,
          easing: Easing.out(Easing.ease),
        }).start();
      }
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [insets.bottom]);

  if (!isOpen) return null;

  return (
    <KeyboardAvoidingView
      className="w-full absolute rounded-t-lg max-h-[60%] bottom-0"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 0 : 0}
      style={{ flex: 1 }}
    >
      <View
        className="flex-1 bg-[#1A1A1A] rounded-t-3xl z-30"
        style={{ marginTop: "auto" }}
      >
        {/* Header */}
        <View className="items-center justify-center p-4 rounded-t-3xl">
          <View className="w-20 h-1 bg-white/80 rounded-full my-2" />
          <Text className="text-2xl font-bold text-white">Comments</Text>
        </View>

        {/* Comments List */}
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 16 }}
          className="flex-1"
        >
          <View className="gap-5 p-4">
            {comments.map((comment) => (
              <View key={comment._id}>
                {/* Only display if comment.videoId matches current */}
                {/* For mock/testing, you can skip this check */}
                {/* Example: if (comment.videoId !== videoId) return null */}
                <View className="flex-row gap-1">
                  {/* Avatar */}
                  <Image
                    source={{ uri: comment.user?.avatar ?? "" }}
                    className="size-10 rounded-full bg-white mr-2"
                    defaultSource={require("@/assets/images/back.png")}
                  />
                  <View className="flex-1">
                    <View className="flex-row items-center space-x-2 mb-1">
                      <Text
                        className="text-sm text-[#B0B0B0] font-semibold flex-1"
                        numberOfLines={1}
                      >
                        {comment.user?.name || "Anonymous User"}
                      </Text>
                    </View>
                    <View className="flex-row gap-1 items-center">
                      <Text className="text-base text-white">
                        {comment.content.slice(0, 15)}...
                      </Text>
                      <Text className="text-xs text-[#B0B0B0]">
                        {new Date(comment.timestamp).toLocaleDateString()}
                      </Text>
                    </View>
                    {/* Actions Row */}
                    <View className="flex-row gap-5 items-center">
                      <Pressable
                        onPress={() =>
                          setReplyTo({
                            commentId: comment._id,
                            username: comment.user?.name || "Anonymous",
                          })
                        }
                      >
                        <Text className="text-sm text-[#B0B0B0]">Reply</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => fetchReplies(comment._id)}
                        className="flex-row gap-1 mt-0.5 items-center"
                      >
                        <Text className="text-sm text-[#B0B0B0]">
                          View replies ({comment.replies})
                        </Text>
                        <ChevronDown size={16} color="#B0B0B0" />
                      </Pressable>
                    </View>
                    {/* Replies */}
                    {!!openReplies[comment._id]?.length && (
                      <View className="ml-8 mt-2 py-2">
                        {openReplies[comment._id].map((reply) => (
                          <View key={reply._id} className="flex-row space-x-2">
                            <Image
                              source={{ uri: reply.user?.avatar || "" }}
                              className="w-6 h-6 rounded-full"
                            />
                            <View>
                              <View className="flex-row items-center space-x-2 mb-1">
                                <Text className="font-medium text-xs text-white">
                                  {reply.user.name}
                                </Text>
                                <Text className="text-xs text-[#B0B0B0]">
                                  {new Date(
                                    reply.timestamp
                                  ).toLocaleDateString()}
                                </Text>
                              </View>
                              <Text className="text-sm text-white">
                                {reply.content}
                              </Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                    {loadingReplies === comment._id && (
                      <Text className="text-xs ml-10 text-[#B0B0B0]">
                        Loading replies...
                      </Text>
                    )}
                  </View>
                  {/* Upvote / Downvote / Gift actions */}
                  <View className="flex-row gap-2 items-center">
                    <TouchableOpacity
                      onPress={() => handleGiftComment(comment._id)}
                      className="items-center pt-1"
                    >
                      <IndianRupee size={16} color="#fdde86" />
                      <Text className="text-xs pt-1 text-[#B0B0B0]">
                        {comment.donations ?? 0}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleUpvote(comment._id)}
                      className="items-center"
                    >
                      <ArrowBigUp
                        size={22}
                        color={comment.upvoted ? "#4ade80" : "#B0B0B0"}
                      />
                      <Text className="text-xs text-[#B0B0B0]">
                        {comment.upvotes}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDownvote(comment._id)}
                      className="items-center"
                    >
                      <ArrowBigDown
                        size={22}
                        color={comment.downvoted ? "#f87171" : "#B0B0B0"}
                      />
                      <Text className="text-xs text-[#B0B0B0]">
                        {comment.downvotes}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* ---- INPUT BAR: Always at bottom, outside ScrollView ---- */}
        <Animated.View
          className="bg-[#181818] border-t border-[#353535] px-2 pt-2 pb-3 flex-row items-center space-x-2"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: animatedBottom,
            paddingBottom: insets.bottom,
          }}
        >
          {!!replyTo && (
            <View className="absolute flex-row -top-6 left-2 bg-[#6D6F6E] px-2 py-1 rounded">
              <Text className="text-xs text-white">
                to @{replyTo.username}
              </Text>
              <TouchableOpacity onPress={() => setReplyTo(null)}>
                <Text className="text-xs text-red-400">Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Add a comment..."
            placeholderTextColor="#999"
            className="flex-1 text-white px-3 py-2"
            multiline
          />
          <TouchableOpacity
            onPress={handleSendComment}
            disabled={!comment.trim()}
          >
            <SendHorizonal
              size={20}
              color={comment.trim() ? "#4ade80" : "#888"}
            />
          </TouchableOpacity>
        </Animated.View>
        {/* ---- END INPUT BAR ---- */}
      </View>
    </KeyboardAvoidingView>
  );
};

export default CommentsSection;
