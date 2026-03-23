export interface UploadedFile {
  id: string;
  filename: string;
  month: string;
  uploaded_by: string;
  uploaded_by_name: string;
  uploaded_at: string;
  row_count: number;
}

export interface Post {
  id: string;
  file_id: string;
  title: string;
  published_at: string;
  reach: number;
  engagement: number;
  reactions: number;
  comments: number;
  shares: number;
  saves?: number;
  link_clicks: number;
  ctr: number;
  post_type: "image" | "video" | "link" | "text";
}

export interface MonthStats {
  month: string;
  totalReach: number;
  totalEngagement: number;
  postCount: number;
  avgReach: number;
  avgEngagement: number;
  bestPostType: string;
}

export interface KpiData {
  label: string;
  value: number | string;
  change?: number; // % vs previous month
}
