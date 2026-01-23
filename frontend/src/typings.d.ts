declare namespace API {
  // 用户
  interface User {
    _id: string;
    username: string;
    email: string;
    avatar?: string;
    role: 'admin' | 'user';
    createdAt: string;
    updatedAt: string;
  }

  // 文章
  interface Article {
    _id: string;
    title: string;
    content: string;
    summary: string;
    cover?: string;
    category: Category;
    tags: Tag[];
    views: number;
    status: 'draft' | 'published';
    author: User;
    createdAt: string;
    updatedAt: string;
  }

  // 分类
  interface Category {
    _id: string;
    name: string;
    description?: string;
    articleCount?: number;
    createdAt: string;
    updatedAt: string;
  }

  // 标签
  interface Tag {
    _id: string;
    name: string;
    articleCount?: number;
    createdAt: string;
    updatedAt: string;
  }

  // 留言
  interface Message {
    _id: string;
    nickname: string;
    email: string;
    content: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    updatedAt: string;
  }

  // 统计数据
  interface Statistics {
    articleCount: number;
    categoryCount: number;
    tagCount: number;
    messageCount: number;
    totalViews: number;
  }

  // 分页响应
  interface PageResult<T> {
    list: T[];
    total: number;
    page: number;
    pageSize: number;
  }

  // 通用响应
  interface Response<T = any> {
    code: number;
    message: string;
    data: T;
  }
}

// CSS Modules
declare module '*.less' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
}
