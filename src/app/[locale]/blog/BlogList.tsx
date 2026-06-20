'use client';

import Link from 'next/link';
import { Calendar, User, ArrowRight, FileText } from 'lucide-react';
import { BlogPost } from '@/lib/blog/types';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function BlogList({ posts, locale }: { posts: BlogPost[]; locale: string }) {
  const withTranslation = posts.filter(p => p.translations[locale]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header locale={locale as any} />

      <main className="flex-1">
        <section className="relative py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--color-primary)/0.08)] to-transparent" />
          <div className="max-w-6xl mx-auto px-4 relative">
            <div className="text-center max-w-2xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold text-[hsl(var(--color-foreground))] mb-4">
                Blog
              </h1>
              <p className="text-lg text-[hsl(var(--color-muted-foreground))]">
                Tips, tutorials and news about PDF processing
              </p>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 pb-20">
          {withTranslation.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-[hsl(var(--color-border))] rounded-2xl">
              <FileText className="w-12 h-12 mx-auto text-[hsl(var(--color-muted-foreground)/0.5)] mb-4" />
              <h2 className="text-xl font-semibold text-[hsl(var(--color-muted-foreground))]">No posts yet</h2>
              <p className="text-[hsl(var(--color-muted-foreground))] mt-2">Check back soon for new content</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {withTranslation.map(post => {
                const t = post.translations[locale]!;
                return (
                  <Link
                    key={post.id}
                    href={`/${locale}/blog/${t.slug}`}
                    className="group rounded-2xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] overflow-hidden hover:shadow-lg hover:border-[hsl(var(--color-primary)/0.3)] transition-all duration-300"
                  >
                    {post.featuredImage && (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={post.featuredImage}
                          alt={t.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-center gap-3 text-xs text-[hsl(var(--color-muted-foreground))] mb-3">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{post.publishedAt}</span>
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{post.author}</span>
                      </div>
                      <h2 className="text-lg font-semibold text-[hsl(var(--color-foreground))] group-hover:text-[hsl(var(--color-primary))] transition-colors mb-2 line-clamp-2">
                        {t.title}
                      </h2>
                      {t.excerpt && (
                        <p className="text-sm text-[hsl(var(--color-muted-foreground))] line-clamp-2 mb-4">
                          {t.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-1 text-sm font-medium text-[hsl(var(--color-primary))]">
                        Read More <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Footer locale={locale as any} />
    </div>
  );
}
