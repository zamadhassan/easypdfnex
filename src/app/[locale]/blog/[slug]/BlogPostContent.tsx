'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowLeft, Calendar, User, ExternalLink, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { BlogPost } from '@/lib/blog/types';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getToolById } from '@/config/tools';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card';

function getNodeText(children: ReactNode): string {
  if (typeof children === 'string' || typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(getNodeText).join('');
  return '';
}

function slugifyHeading(value: string): string {
  const slug = value
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-');
  return slug || 'section';
}

function getMarkdownHeadings(content: string): { id: string; title: string }[] {
  return content
    .split('\n')
    .map((line) => line.match(/^##\s+(?!#)(.+)$/)?.[1]?.trim())
    .filter((title): title is string => Boolean(title))
    .map((title) => ({ id: slugifyHeading(title), title }));
}

export default function BlogPostContent({ post, locale }: { post: BlogPost; locale: string }) {
  const t = post.translations[locale]!;
  const tCommon = useTranslations();
  const tBlog = useTranslations('blog');
  const headings = getMarkdownHeadings(t.content);

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
            <ArrowLeft className="w-3.5 h-3.5" /> {tBlog('backToBlog')}
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

          {headings.length > 0 && (
            <nav
              aria-label="Blog post sections"
              className="mb-10 rounded-2xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-5 shadow-sm"
            >
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-[hsl(var(--color-primary))]">
                {tBlog('inThisGuide')}
              </div>
              <ol className="mt-4 grid gap-2 sm:grid-cols-2">
                {headings.map((heading) => (
                  <li key={heading.id}>
                    <a
                      href={`#${heading.id}`}
                      className="block rounded-xl px-3 py-2 text-sm font-medium text-[hsl(var(--color-muted-foreground))] hover:bg-[hsl(var(--color-primary)/0.08)] hover:text-[hsl(var(--color-primary))] transition-colors"
                    >
                      {heading.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <div className="max-w-none">
            <ReactMarkdown
              components={{
                h2: ({ children }) => {
                  const title = getNodeText(children);
                  return (
                    <h2
                      id={slugifyHeading(title)}
                      className="scroll-mt-28 mt-12 mb-5 border-l-4 border-[hsl(var(--color-primary))] pl-4 text-2xl md:text-3xl font-bold tracking-tight text-[hsl(var(--color-foreground))]"
                    >
                      {children}
                    </h2>
                  );
                },
                h3: ({ children }) => {
                  const title = getNodeText(children);
                  return (
                    <h3
                      id={slugifyHeading(title)}
                      className="scroll-mt-28 mt-8 mb-3 text-xl font-semibold text-[hsl(var(--color-foreground))]"
                    >
                      {children}
                    </h3>
                  );
                },
                p: ({ children }) => (
                  <p className="mb-5 text-base leading-8 text-[hsl(var(--color-muted-foreground))] md:text-[1.05rem]">
                    {children}
                  </p>
                ),
                a: ({ href, children }) => {
                  const className = 'font-semibold text-[hsl(var(--color-primary))] underline decoration-[hsl(var(--color-primary)/0.35)] decoration-2 underline-offset-4 hover:decoration-[hsl(var(--color-primary))]';
                  if (href?.startsWith('/')) {
                    return <Link href={href} className={className}>{children}</Link>;
                  }
                  return <a href={href} className={className} target="_blank" rel="noopener noreferrer">{children}</a>;
                },
                ul: ({ children }) => (
                  <ul className="mb-6 space-y-3 rounded-2xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-muted)/0.35)] p-5">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => <ol className="mb-6 list-decimal space-y-3 pl-6 text-[hsl(var(--color-muted-foreground))]">{children}</ol>,
                li: ({ children }) => (
                  <li className="ml-5 list-disc pl-1 leading-7 text-[hsl(var(--color-muted-foreground))] marker:text-[hsl(var(--color-primary))]">
                    {children}
                  </li>
                ),
                strong: ({ children }) => <strong className="font-bold text-[hsl(var(--color-foreground))]">{children}</strong>,
              }}
            >
              {t.content}
            </ReactMarkdown>
          </div>

          {/* Related Tools Section */}
          {relatedTools.length > 0 && (
            <section className="mt-16 pt-8 border-t border-[hsl(var(--color-border))]">
              <h2 className="text-2xl font-bold text-[hsl(var(--color-foreground))] mb-6 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[hsl(var(--color-primary))]" />
                {tBlog('relatedTools')}
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
