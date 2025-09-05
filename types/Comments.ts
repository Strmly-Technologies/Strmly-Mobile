export const emojis = ["😀", "😂", "😍", "🔥", "💯", "👍", "❤", "🎉", "🚀", "💪", "��", "🙌"]

export interface Comment {
  _id: string
  content: string
  videoId: string
  repliesCount: number
  timestamp: string
  createdAt?: string // Add optional createdAt for backward compatibility
  donations: number
  gifts?: number // Add optional gifts field
  upvotes: number
  downvotes: number
  user: {
    id: string
    username: string;
    name: string
    avatar: string
  }
  upvoted?: boolean
  downvoted?: boolean
  replies: number
  is_monetized: boolean
}

export interface reply {
  _id: string
  content: string
  parentId: string
  timestamp: string
  donations: number
  upvotes: number
  downvotes: number
  user: {
    id: string
    name: string
    username: string
    avatar: string
  }
  upvoted?: boolean
  downvoted?: boolean
}