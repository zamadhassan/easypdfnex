'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, Trash2, Image } from 'lucide-react';
import Link from 'next/link';

const LOCALES = [
  { code: 'en', name: 'English' }, { code: 'ja', name: 'Japanese' }, { code: 'ko', name: 'Korean' },
  { code: 'es', name: 'Spanish' }, { code: 'fr', name: 'French' }, { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese (Simplified)' }, { code: 'zh-TW', name: 'Chinese (Traditional)' },
  { code: 'pt', name: 'Portuguese' }, { code: 'ar', name: 'Arabic' }, { code: 'it', name: 'Italian' },
  { code: 'id', name: 'Indonesian' }, { code: 'vi', name: 'Vietnamese' }, { code: 'ro', name: 'Romanian' },
];

const emptyTranslation = {
  title: '', slug: '', content: '', excerpt: '',
  metaTitle: '', metaDescription: '', focusKeywords: '',
};

export default function PostForm({ postId }: { postId?: string }) {
  const [translations, setTranslations] = useState<Record<string, typeof emptyTranslation>>({ en: { ...emptyTranslation } });
  const [featuredImage, setFeaturedImage] = useState('');
  const [author, setAuthor] = useState('EasyPDFNex');
  const [published, setPublished] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(postId ? true : false);
  const [activeLang, setActiveLang] = useState('en');
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('easypdfnex_admin_token');
    if (!token) { router.push('/securelogin'); }
  }, []);

  useEffect(() => {
    if (!postId) return;
    (async () => {
      try {
        const res = await fetch(`/api/blog/${postId}`);
        const post = await res.json();
        setTranslations(post.translations);
        setFeaturedImage(post.featuredImage || '');
        setAuthor(post.author || 'EasyPDFNex');
        setPublished(post.published);
        setCategories(post.categories || []);
      } catch (e) {
        console.error('Failed to load post', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [postId]);

  const updateTranslation = (locale: string, field: string, value: string) => {
    setTranslations(prev => ({ ...prev, [locale]: { ...prev[locale] || { ...emptyTranslation }, [field]: value } }));
  };

  const addLanguage = (code: string) => {
    if (translations[code]) return;
    const slug = translations.en?.slug || '';
    const autoSlug = slug ? `${code}-${Date.now()}` : '';
    setTranslations(prev => ({ ...prev, [code]: { ...emptyTranslation, slug: autoSlug } }));
  };

  const removeLanguage = (code: string) => {
    if (code === 'en') return;
    setTranslations(prev => {
      const next = { ...prev };
      delete next[code];
      return next;
    });
  };

  const addCategory = () => {
    const cat = newCategory.trim();
    if (cat && !categories.includes(cat)) setCategories([...categories, cat]);
    setNewCategory('');
  };

  const removeCategory = (cat: string) => setCategories(categories.filter(c => c !== cat));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    const token = localStorage.getItem('easypdfnex_admin_token');
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
    const now = new Date().toISOString().split('T')[0];
    const payload = { translations, featuredImage, author, published, categories };

    try {
      if (postId) {
        const res = await fetch(`/api/blog/${postId}`, {
          method: 'PUT', headers,
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Update failed');
        setMessage('Saved!');
        setTimeout(() => setMessage(''), 2000);
      } else {
        const res = await fetch('/api/blog', {
          method: 'POST', headers,
          body: JSON.stringify({ ...payload, id: crypto.randomUUID?.() || `${Date.now()}`, publishedAt: now, updatedAt: now }),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Create failed (${res.status})`);
        }
        const post = await res.json();
        router.push(`/securelogin/dashboard/edit/${post.id}`);
      }
    } catch (e: any) {
      setMessage(e.message || 'Error saving post');
    } finally {
      setSaving(false);
    }
  };

  const langsAvailable = LOCALES.filter(l => !translations[l.code]);
  const t = translations[activeLang] || emptyTranslation;

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
            <Link href="/securelogin/dashboard" className="p-2 rounded-lg hover:bg-[hsl(var(--color-muted))] transition-all">
              <ArrowLeft className="w-5 h-5 text-[hsl(var(--color-muted-foreground))]" />
            </Link>
            <h1 className="font-bold text-[hsl(var(--color-foreground))]">{postId ? 'Edit Post' : 'New Post'}</h1>
          </div>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[hsl(var(--color-primary))] text-[hsl(var(--color-primary-foreground))] font-medium hover:bg-[hsl(var(--color-primary-hover))] transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {message && (
          <div className={`mb-6 p-3 rounded-lg text-sm ${
            message === 'Saved!' ? 'bg-[hsl(var(--color-success)/0.1)] text-[hsl(var(--color-success))] border border-[hsl(var(--color-success)/0.2)]' :
            'bg-[hsl(var(--color-destructive)/0.1)] text-[hsl(var(--color-destructive))] border border-[hsl(var(--color-destructive)/0.2)]'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Language Tabs */}
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-1.5 mb-4 border-b border-[hsl(var(--color-border))] pb-2">
              {Object.keys(translations).map(code => {
                const lang = LOCALES.find(l => l.code === code);
                return (
                  <button key={code} type="button" onClick={() => setActiveLang(code)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                      activeLang === code ? 'bg-[hsl(var(--color-primary))] text-[hsl(var(--color-primary-foreground))] font-medium' :
                      'text-[hsl(var(--color-muted-foreground))] hover:bg-[hsl(var(--color-muted))]'
                    }`}>
                    {lang?.name || code}
                  </button>
                );
              })}
              {langsAvailable.length > 0 && (
                <div className="relative group">
                  <button type="button" className="px-3 py-1.5 text-sm rounded-lg border border-dashed border-[hsl(var(--color-border))] text-[hsl(var(--color-muted-foreground))] hover:border-[hsl(var(--color-primary))] hover:text-[hsl(var(--color-primary))] transition-all flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add Language
                  </button>
                  <div className="absolute top-full left-0 mt-1 w-48 bg-[hsl(var(--color-card))] border border-[hsl(var(--color-border))] rounded-xl shadow-lg hidden group-hover:block z-50">
                    {langsAvailable.map(l => (
                      <button key={l.code} type="button" onClick={() => addLanguage(l.code)}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-[hsl(var(--color-muted))] transition-colors first:rounded-t-xl last:rounded-b-xl">
                        {l.name} ({l.code})
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {Object.keys(translations).length > 1 && activeLang !== 'en' && (
              <button type="button" onClick={() => removeLanguage(activeLang)} className="mb-4 text-xs text-[hsl(var(--color-destructive))] hover:underline">
                Remove {LOCALES.find(l => l.code === activeLang)?.name} translation
              </button>
            )}

            {/* Translation Fields */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--color-foreground))] mb-1.5">Title</label>
                <input type="text" value={t.title} onChange={e => updateTranslation(activeLang, 'title', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))] focus:border-transparent transition-all"
                  required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--color-foreground))] mb-1.5">Slug</label>
                <input type="text" value={t.slug} onChange={e => updateTranslation(activeLang, 'slug', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))] focus:border-transparent transition-all font-mono text-sm"
                  required />
                {t.slug && <p className="mt-1 text-xs text-[hsl(var(--color-muted-foreground))]">/{activeLang}/blog/{t.slug}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--color-foreground))] mb-1.5">Excerpt</label>
                <textarea value={t.excerpt} onChange={e => updateTranslation(activeLang, 'excerpt', e.target.value)} rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))] focus:border-transparent transition-all resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--color-foreground))] mb-1.5">Content (Markdown)</label>
                <textarea value={t.content} onChange={e => updateTranslation(activeLang, 'content', e.target.value)} rows={15}
                  className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))] focus:border-transparent transition-all font-mono text-sm" />
              </div>
              <div className="border-t border-[hsl(var(--color-border))] pt-5">
                <h3 className="text-sm font-semibold text-[hsl(var(--color-foreground))] mb-3">SEO Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[hsl(var(--color-foreground))] mb-1.5">Meta Title</label>
                    <input type="text" value={t.metaTitle} onChange={e => updateTranslation(activeLang, 'metaTitle', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))] focus:border-transparent transition-all" />
                    <p className="mt-1 text-xs text-[hsl(var(--color-muted-foreground))]">{t.metaTitle.length} characters</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[hsl(var(--color-foreground))] mb-1.5">Meta Description</label>
                    <textarea value={t.metaDescription} onChange={e => updateTranslation(activeLang, 'metaDescription', e.target.value)} rows={2}
                      className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))] focus:border-transparent transition-all resize-none" />
                    <p className="mt-1 text-xs text-[hsl(var(--color-muted-foreground))]">{t.metaDescription.length} characters</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[hsl(var(--color-foreground))] mb-1.5">Focus Keywords</label>
                    <input type="text" value={t.focusKeywords} onChange={e => updateTranslation(activeLang, 'focusKeywords', e.target.value)}
                      placeholder="keyword1, keyword2, keyword3"
                      className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))] focus:border-transparent transition-all" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Global Fields */}
          <div className="border-t border-[hsl(var(--color-border))] pt-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--color-foreground))] mb-1.5">Featured Image URL</label>
              <div className="flex gap-3">
                <input type="url" value={featuredImage} onChange={e => setFeaturedImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))] focus:border-transparent transition-all" />
                <div className="w-14 h-14 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-muted))] flex items-center justify-center overflow-hidden">
                  {featuredImage ? <img src={featuredImage} alt="" className="w-full h-full object-cover" onError={(e: any) => e.target.style.display = 'none'} /> : <Image className="w-5 h-5 text-[hsl(var(--color-muted-foreground)/0.5)]" />}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--color-foreground))] mb-1.5">Author</label>
              <input type="text" value={author} onChange={e => setAuthor(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))] focus:border-transparent transition-all max-w-xs" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--color-foreground))] mb-1.5">Categories</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {categories.map(cat => (
                  <span key={cat} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[hsl(var(--color-muted))] text-sm">
                    {cat}
                    <button type="button" onClick={() => removeCategory(cat)} className="hover:text-[hsl(var(--color-destructive))] transition-colors">&times;</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" value={newCategory} onChange={e => setNewCategory(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCategory())}
                  placeholder="Add category..." className="px-4 py-2 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))] focus:border-transparent transition-all" />
                <button type="button" onClick={addCategory} className="px-3 py-2 rounded-xl border border-dashed border-[hsl(var(--color-border))] text-sm hover:border-[hsl(var(--color-primary))] hover:text-[hsl(var(--color-primary))] transition-all">
                  Add
                </button>
              </div>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)}
                className="w-5 h-5 rounded-lg border-[hsl(var(--color-border))] text-[hsl(var(--color-primary))] focus:ring-[hsl(var(--color-primary))]" />
              <div>
                <span className="text-sm font-medium text-[hsl(var(--color-foreground))]">Publish</span>
                <p className="text-xs text-[hsl(var(--color-muted-foreground))]">Make this post visible on the blog</p>
              </div>
            </label>
          </div>
        </form>
      </main>
    </div>
  );
}
