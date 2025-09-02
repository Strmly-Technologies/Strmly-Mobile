// lib/commentActions.ts
import { CONFIG } from '../../Constants/config';

export const upvoteComment = async ({ token, commentId, videoId, videoType }: any) => {
  const res = await fetch(`${CONFIG.API_BASE_URL}/interactions/comments/upvote`, {
    method: "POST",
    credentials: "include",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ commentId, videoId, videoType })
  });

  if (!res.ok) throw new Error("Failed to upvote");
  return await res.json();
};

export const downvoteComment = async ({ token, commentId, videoId, videoType }: any) => {
  const res = await fetch(`${CONFIG.API_BASE_URL}/interactions/comments/downvote`, {
    method: "POST",
    credentials: "include",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ commentId, videoId, videoType })
  });

  if (!res.ok) throw new Error("Failed to downvote");
  return await res.json();
};

export const giftComment = async ({ token, commentId, videoId, videoType, amount, giftNote }: any) => {
  const res = await fetch(`${CONFIG.API_BASE_URL}/interactions/gift-comment`, {
    method: "POST",
    credentials: "include",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ commentId, videoId, videoType, amount, giftNote })
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to gift");
  }

  return await res.json();
};