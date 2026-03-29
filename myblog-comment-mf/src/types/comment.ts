/** 与主站 comment API populate('user', ...) 字段一致 */
export interface CommentUser {
  username?: string;
  nickname?: string;
  avatar?: string;
  htmlUrl?: string;
}

export interface Comment {
  _id: string;
  content: string;
  user?: CommentUser;
  /** 乐观更新 / dev 模拟仍可能用 author */
  author?: CommentUser;
  createdAt: string;
  pending?: boolean;
}

export interface CommentFormData {
  content: string;
}
