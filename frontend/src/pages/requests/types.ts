export interface Request {
  id: number;
  title: string;
  description: string;
  type: string;
  status: string;
  submitted_to: string;
  category: string;
  submitter_id: number;
  submitter_name: string;
  submitter_avatar?: string;
  supporters?: number;
  required?: number;
  progress?: number;
  resolution?: string;
  response_time?: string;
  submitted_at: string;
  comments?: Comment[];
  attachments?: string[];
  priority?: string;
  tags?: string[];
}

export interface Comment {
  id: number;
  user_id: number;
  user_name: string;
  user_avatar?: string;
  content: string;
  created_at: string;
}
