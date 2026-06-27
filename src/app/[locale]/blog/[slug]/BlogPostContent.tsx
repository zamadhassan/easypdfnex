'use client';

import Link from 'next/link';
import { ArrowLeft, Calendar, User, ExternalLink, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { BlogPost } from '@/lib/blog/types';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getToolById } from '@/config/tools';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card';

export default function BlogPostContent({ post, locale }: { post: BlogPost; locale: string }) {
  const t = post.translations[locale]!;
  const tCommon = useTranslations();

  // Get related tools data
  const relatedTools = post.relatedTools
    ?.map(slug => getToolById(slug))
    .filter((tool): tool is NonNullable<typeof tool> => tool !== undefined) || [];

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

          {/* Related Tools Section */}
          {relatedTools.length > 0 && (
            <section className="mt-16 pt-8 border-t border-[hsl(var(--color-border))]">
              <h2 className="text-2xl font-bold text-[hsl(var(--color-foreground))] mb-6 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[hsl(var(--color-primary))]" />
                {tCommon('blog.relatedTools') || 'Related Tools'}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {relatedTools.map(tool => (
                  <Link
                    key={tool.id}
                    href={`/${locale}/tools/${tool.slug}`}
                    className="group"
                  >
                    <Card className="h-full glass-card hover:bg-[hsl(var(--color-card))/0.8] transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-[hsl(var(--color-border))/0.6] p-5">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(var(--color-primary)/0.1)] to-[hsl(var(--color-accent)/0.1)] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <svg className="w-6 h-6 text-[hsl(var(--color-primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-[hsl(var(--color-foreground))] group-hover:text-[hsl(var(--color-primary))] transition-colors truncate">
                            {tool.id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                          </h3>
                          <p className="text-sm text-[hsl(var(--color-muted-foreground))] mt-1 line-clamp-2">
                            {tCommon(`tools.${tool.id}.description`) || 'PDF tool for processing documents'}
                          </p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-[hsl(var(--color-primary))] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>
      </main>

      <Footer locale={locale as any} />
    </div>
  );
}
