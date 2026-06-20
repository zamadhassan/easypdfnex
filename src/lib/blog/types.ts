export interface BlogTranslation {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  focusKeywords: string;
}

export interface BlogPost {
  id: string;
  translations: Record<string, BlogTranslation>;
  featuredImage: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  published: boolean;
  categories: string[];
}

export interface BlogSettings {
  username: string;
  password: string;
}
