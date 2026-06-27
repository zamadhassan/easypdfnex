import { notFound } from 'next/navigation';
import { readPosts } from '@/lib/blog/posts';
import BlogPostContent from './BlogPostContent';
import { locales, type Locale } from '@/lib/i18n/config';

// Required for static export - generate all possible blog post paths
export const dynamic = 'force-static';

export async function generateStaticParams() {
  const posts = await readPosts();
  const params: { locale: string; slug: string }[] = [];

  for (const locale of locales) {
    for (const post of posts) {
      const translation = post.translations[locale];
      if (translation?.slug) {
        params.push({ locale, slug: translation.slug });
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
