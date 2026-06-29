import { unstable_noStore as noStore } from 'next/cache';
import { notFound } from 'next/navigation';
import { readPosts } from '@/lib/blog/posts';
import BlogPostContent from './BlogPostContent';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  noStore();
  const { locale, slug } = await params;
  const posts = await readPosts();
  const post = posts.find(p => p.translations[locale]?.slug === slug);
  if (!post) return {};
  const t = post.translations[locale]!;
  return {
    title: t.metaTitle || t.title,
    description: t.metaDescription || t.excerpt,
    keywords: t.focusKeywords,
    openGraph: post.featuredImage ? { images: [post.featuredImage] } : undefined,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  noStore();
  const { locale, slug } = await params;
  const posts = await readPosts();
  const post = posts.find(p => p.translations[locale]?.slug === slug);
  if (!post) notFound();
  return <BlogPostContent post={post} locale={locale} />;
}
