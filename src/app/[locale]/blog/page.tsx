import { locales } from '@/lib/i18n/config';
import { readPosts } from '@/lib/blog/posts';
import BlogList from './BlogList';

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const posts = (await readPosts()).filter(p => p.published);
  return <BlogList posts={posts} locale={locale} />;
}
