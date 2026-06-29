import { unstable_noStore as noStore } from 'next/cache';
import type { Metadata } from 'next';
import { readPosts } from '@/lib/blog/posts';
import BlogList from './BlogList';
import { siteConfig } from '@/config/site';
import { locales } from '@/lib/i18n/config';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  noStore();
  const { locale } = await params;
  const canonical = `${siteConfig.url}/${locale}/blog`;
  const languages = Object.fromEntries(
    locales.map((availableLocale) => [availableLocale, `${siteConfig.url}/${availableLocale}/blog`])
  );

  return {
    title: 'Blog | EasyPDFNex',
    description: 'Tips, tutorials and news about PDF processing from EasyPDFNex.',
    alternates: {
      canonical,
      languages: {
        ...languages,
        'x-default': `${siteConfig.url}/en/blog`,
      },
    },
    openGraph: {
      title: 'Blog | EasyPDFNex',
      description: 'Tips, tutorials and news about PDF processing from EasyPDFNex.',
      url: canonical,
      type: 'website',
    },
  };
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  noStore();
  const { locale } = await params;
  const posts = (await readPosts()).filter(p => p.published);
  return <BlogList posts={posts} locale={locale} />;
}
