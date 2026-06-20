'use client';

import Link from 'next/link';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { BlogPost } from '@/lib/blog/types';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function BlogPostContent({ post, locale }: { post: BlogPost; locale: string }) {
  const t = post.translations[locale]!;

  return (
    <div className="min-h-screen flex flex-col">
      <Header locale={locale as any} />

      <main className="flex-1">
        <article className="max-w-3xl mx-auto px-4 py-12">
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--color-muted-foreground))] hover:text-[hsl(var(--color-primary))] transition-colors mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Blog
          </Link>

          {post.featuredImage && (
            <div className="aspect-video rounded-2xl overflow-hidden mb-8">
              <img src={post.featuredImage} alt={t.title} className="w-full h-full object-cover" />
            </div>
          )}

          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[hsl(var(--color-foreground))] mb-4">{t.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-[hsl(var(--color-muted-foreground))]">
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{post.publishedAt}</span>
              <span className="flex items-center gap-1.5"><User className="w-4 h-4" />{post.author}</span>
              {post.categories?.length > 0 && (
                <div className="flex items-center gap-2">
                  {post.categories.map(cat => (
                    <span key={cat} className="px-2.5 py-1 rounded-lg bg-[hsl(var(--color-muted))] text-xs">{cat}</span>
                  ))}
                </div>
              )}
            </div>
          </header>

          <div className="prose prose-sm md:prose-base max-w-none prose-headings:text-[hsl(var(--color-foreground))] prose-p:text-[hsl(var(--color-muted-foreground))] prose-a:text-[hsl(var(--color-primary))] prose-strong:text-[hsl(var(--color-foreground))] prose-code:text-[hsl(var(--color-primary))] prose-pre:bg-[hsl(var(--color-muted))] prose-pre:border prose-pre:border-[hsl(var(--color-border))]">
            <ReactMarkdown>{t.content}</ReactMarkdown>
          </div>
        </article>
      </main>

      <Footer locale={locale as any} />
    </div>
  );
}
