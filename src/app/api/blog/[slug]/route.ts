import { NextResponse } from 'next/server';
import { readPosts, updatePost, deletePost } from '@/lib/blog/posts';
import { requireAuth } from '@/lib/blog/auth-middleware';

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const posts = await readPosts();
  const post = posts.find(p => p.id === slug);
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(post);
}

export async function PUT(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const auth = await requireAuth(request);
  if (!auth.authorized) return auth.response;

  const { slug } = await params;
  try {
    const updates = await request.json();
    const allowed = ['translations', 'featuredImage', 'author', 'published', 'categories', 'publishedAt'];
    const sanitized: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in updates) sanitized[key] = updates[key];
    }
    const updated = await updatePost(slug, sanitized);
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const auth = await requireAuth(request);
  if (!auth.authorized) return auth.response;

  const { slug } = await params;
  const deleted = await deletePost(slug);
  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
