import { notFound } from 'next/navigation';
import { locales } from '@/lib/i18n/config';
import { readPosts } from '@/lib/blog/posts';
import BlogPostContent from './BlogPostContent';

export async function generateStaticParams() {
  const posts = await readPosts();
  const params: { locale: string; slug: string }[] = [];
  for (const locale of locales) {
    for (const post of posts) {
      const t = post.translations[locale];
      if (t?.slug) {
        params.push({ locale, slug: t.slug });
      }
    }
  }
  return params;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
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
  const { locale, slug } = await params;
  const posts = await readPosts();
  const post = posts.find(p => p.translations[locale]?.slug === slug);
  if (!post) notFound();
  return <BlogPostContent post={post} locale={locale} />;
}
