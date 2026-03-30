export interface Comment {
  _id: string;
  content: string;
  author: {
    username: string;
    avatar?: string;
  };
  createdAt: string;
  pending?: boolean;
}

export interface CommentFormData {
  content: string;
}
