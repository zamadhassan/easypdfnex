import { getSupabase } from './supabase';
import { BlogPost } from './types';

export async function readPosts(): Promise<BlogPost[]> {
  try {
    const supabase = getSupabase();
    if (!supabase) return [];
    const { data, error } = await (supabase as any)
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(transformRow);
  } catch {
    return [];
  }
}

export async function getPostById(id: string): Promise<BlogPost | undefined> {
  try {
    const supabase = getSupabase();
    if (!supabase) return undefined;
    const { data, error } = await (supabase as any)
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data ? transformRow(data) : undefined;
  } catch {
    return undefined;
  }
}

export async function getPostBySlug(slug: string, locale: string): Promise<BlogPost | undefined> {
  try {
    const posts = await readPosts();
    return posts.find(p => p.translations[locale]?.slug === slug);
  } catch {
    return undefined;
  }
}

export async function createPost(post: BlogPost): Promise<BlogPost> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  const { error } = await (supabase as any).from('blog_posts').insert({
    id: post.id,
    translations: JSON.stringify(post.translations),
    featured_image: post.featuredImage || '',
    author: post.author || 'EasyPDFNex',
    published_at: post.publishedAt || new Date().toISOString().split('T')[0],
    updated_at: post.updatedAt || new Date().toISOString().split('T')[0],
    published: post.published ?? false,
    categories: JSON.stringify(post.categories || []),
    related_tools: JSON.stringify(post.relatedTools || []),
  });
  if (error) throw error;
  return post;
}

export async function updatePost(id: string, updates: Partial<BlogPost>): Promise<BlogPost | null> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  const dbUpdates: Record<string, unknown> = {
    updated_at: new Date().toISOString().split('T')[0],
  };
  if (updates.translations !== undefined) dbUpdates.translations = JSON.stringify(updates.translations);
  if (updates.featuredImage !== undefined) dbUpdates.featured_image = updates.featuredImage;
  if (updates.author !== undefined) dbUpdates.author = updates.author;
  if (updates.published !== undefined) dbUpdates.published = updates.published;
  if (updates.categories !== undefined) dbUpdates.categories = JSON.stringify(updates.categories);
  if (updates.publishedAt !== undefined) dbUpdates.published_at = updates.publishedAt;
  if (updates.relatedTools !== undefined) dbUpdates.related_tools = JSON.stringify(updates.relatedTools);

  const { error, data } = await (supabase as any)
    .from('blog_posts')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data ? transformRow(data) : null;
}

export async function deletePost(id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  const { error } = await (supabase as any).from('blog_posts').delete().eq('id', id);
  if (error) throw error;
  return true;
}

function transformRow(row: any): BlogPost {
  return {
    id: row.id,
    translations: typeof row.translations === 'string' ? JSON.parse(row.translations) : row.translations,
    featuredImage: row.featured_image || '',
    author: row.author || 'EasyPDFNex',
    publishedAt: row.published_at || '',
    updatedAt: row.updated_at || '',
    published: row.published ?? false,
    categories: typeof row.categories === 'string' ? JSON.parse(row.categories) : (row.categories || []),
    relatedTools: typeof row.related_tools === 'string' ? JSON.parse(row.related_tools) : (row.related_tools || []),
  };
}
