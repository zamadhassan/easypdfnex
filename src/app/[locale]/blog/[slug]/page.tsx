import { unstable_noStore as noStore } from 'next/cache';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { readPosts } from '@/lib/blog/posts';
import BlogPostContent from './BlogPostContent';
import { siteConfig } from '@/config/site';
import { locales } from '@/lib/i18n/config';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  noStore();
  const { locale, slug } = await params;
  const posts = await readPosts();
  const post = posts.find(p => p.translations[locale]?.slug === slug);
  if (!post) return {};
  const t = post.translations[locale]!;
  const canonical = `${siteConfig.url}/${locale}/blog/${t.slug}`;
  const languages = Object.fromEntries(
    locales
      .filter((availableLocale) => post.translations[availableLocale]?.slug)
      .map((availableLocale) => [
        availableLocale,
        `${siteConfig.url}/${availableLocale}/blog/${post.translations[availableLocale]!.slug}`,
      ])
  );

  return {
    title: t.metaTitle || t.title,
    description: t.metaDescription || t.excerpt,
    keywords: t.focusKeywords,
    alternates: {
      canonical,
      languages: {
        ...languages,
        'x-default': `${siteConfig.url}/en/blog/${post.translations.en?.slug || t.slug}`,
      },
    },
    openGraph: {
      title: t.metaTitle || t.title,
      description: t.metaDescription || t.excerpt,
      url: canonical,
      type: 'article',
      images: post.featuredImage ? [post.featuredImage] : undefined,
    },
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
