export const emojis = ["😀", "😂", "😍", "🔥", "💯", "👍", "❤️", "🎉", "🚀", "💪", "��", "🙌"]

export interface Comment {
  _id: string
  content: string
  videoId: string
  repliesCount: number
  timestamp: string
  donations: number
  upvotes: number
  downvotes: number
  user: {
    id: string
    name: string
    avatar: string
  }
  upvoted?: boolean
  downvoted?: boolean
  replies: number
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