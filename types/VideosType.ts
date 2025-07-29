export type VideoItemType = {
  _id: string;
  video: string; // or `videoUrl` if your backend returns it that way
  title?: string;
  videoUrl: string;
  start_time: number;
  display_till_time: number;
  visibility: string;
  hidden_at: null;
  name: string;
  description: string;
  thumbnailUrl?: string;
  likes: number;
  shares: number;
  views: number;
  genre: string;
  type: string;
  language: string;
  age_restriction: boolean;
  //   series: null;
  //   episode_number: null;
  season_number: number;
  is_standalone: boolean;

  comments?: [{}];

  created_by?: {
    _id: string;
    username: string;
    email: string;
  };

  community?: {
    name: string;
  };
  
  series?: {
    title: string;
  };
};
