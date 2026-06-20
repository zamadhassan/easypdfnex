'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Settings, Plus, Edit, Trash2, LogOut, FileText, Globe, ExternalLink } from 'lucide-react';

interface Post {
  id: string;
  translations: Record<string, { title: string; slug: string; excerpt: string }>;
  published: boolean;
  publishedAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('easypdfnex_admin_token');
    if (!token) { router.push('/securelogin'); return; }
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/blog');
      const data = await res.json();
      setPosts(data);
    } catch (e) {
      console.error('Failed to fetch posts', e);
    } finally {
      setLoading(false);
    }
  };

  const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('easypdfnex_admin_token')}` });

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post permanently?')) return;
    try {
      await fetch(`/api/blog/${id}`, { method: 'DELETE', headers: authHeaders() });
      setPosts(posts.filter(p => p.id !== id));
    } catch (e) {
      console.error('Failed to delete', e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('easypdfnex_admin_token');
    router.push('/securelogin');
  };

  const getNavTitle = (post: Post) => {
    return post.translations?.en?.title || post.translations?.[Object.keys(post.translations)[0]]?.title || 'Untitled';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--color-background))]">
        <div className="animate-spin w-8 h-8 border-2 border-[hsl(var(--color-primary))] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--color-background))]">
      <header className="border-b border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-[hsl(var(--color-primary))]" />
            <h1 className="font-bold text-[hsl(var(--color-foreground))]">EasyPDFNex CMS</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/securelogin/dashboard/settings" className="flex items-center gap-1.5 text-sm text-[hsl(var(--color-muted-foreground))] hover:text-[hsl(var(--color-primary))] transition-colors">
              <Settings className="w-3.5 h-3.5" /> Settings
            </Link>
            <Link href="/" target="_blank" className="flex items-center gap-1.5 text-sm text-[hsl(var(--color-muted-foreground))] hover:text-[hsl(var(--color-primary))] transition-colors">
              <ExternalLink className="w-3.5 h-3.5" /> View Site
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-[hsl(var(--color-muted-foreground))] hover:text-[hsl(var(--color-destructive))] transition-colors">
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[hsl(var(--color-foreground))]">Blog Posts</h2>
            <p className="text-sm text-[hsl(var(--color-muted-foreground))]">{posts.length} posts total</p>
          </div>
          <Link
            href="/securelogin/dashboard/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[hsl(var(--color-primary))] text-[hsl(var(--color-primary-foreground))] font-medium hover:bg-[hsl(var(--color-primary-hover))] transition-all"
          >
            <Plus className="w-4 h-4" />
            New Post
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-[hsl(var(--color-border))] rounded-2xl">
            <FileText className="w-12 h-12 mx-auto text-[hsl(var(--color-muted-foreground)/0.5)] mb-4" />
            <h3 className="text-lg font-medium text-[hsl(var(--color-muted-foreground))] mb-2">No posts yet</h3>
            <p className="text-sm text-[hsl(var(--color-muted-foreground))] mb-4">Create your first blog post</p>
            <Link
              href="/securelogin/dashboard/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[hsl(var(--color-primary))] text-[hsl(var(--color-primary-foreground))] font-medium hover:bg-[hsl(var(--color-primary-hover))] transition-all"
            >
              <Plus className="w-4 h-4" /> Create Post
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map(post => (
              <div key={post.id} className="flex items-center justify-between p-4 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] hover:shadow-sm transition-shadow">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {!post.published && <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-[hsl(var(--color-warning)/0.2)] text-[hsl(var(--color-warning))]">Draft</span>}
                    <span className="text-xs text-[hsl(var(--color-muted-foreground))]">{post.publishedAt}</span>
                  </div>
                  <h3 className="font-semibold text-[hsl(var(--color-foreground))] truncate">{getNavTitle(post)}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Globe className="w-3 h-3 text-[hsl(var(--color-muted-foreground))]" />
                    <span className="text-xs text-[hsl(var(--color-muted-foreground))]">{Object.keys(post.translations).length} languages</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {post.published && post.translations?.en && (
                    <Link href={`/en/blog/${post.translations.en.slug}`} target="_blank" className="p-2 rounded-lg text-[hsl(var(--color-muted-foreground))] hover:text-[hsl(var(--color-primary))] hover:bg-[hsl(var(--color-muted))] transition-all">
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  )}
                  <Link href={`/securelogin/dashboard/edit/${post.id}`} className="p-2 rounded-lg text-[hsl(var(--color-muted-foreground))] hover:text-[hsl(var(--color-primary))] hover:bg-[hsl(var(--color-muted))] transition-all">
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button onClick={() => handleDelete(post.id)} className="p-2 rounded-lg text-[hsl(var(--color-muted-foreground))] hover:text-[hsl(var(--color-destructive))] hover:bg-[hsl(var(--color-destructive)/0.1)] transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
