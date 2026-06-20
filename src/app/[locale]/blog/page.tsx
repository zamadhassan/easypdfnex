import { readPosts } from '@/lib/blog/posts';
import BlogList from './BlogList';

export const dynamic = 'force-dynamic';

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const posts = (await readPosts()).filter(p => p.published);
  return <BlogList posts={posts} locale={locale} />;
}
