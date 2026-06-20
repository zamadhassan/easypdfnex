import { NextResponse } from 'next/server';
import { readPosts, createPost } from '@/lib/blog/posts';
import { requireAuth } from '@/lib/blog/auth-middleware';

export async function GET() {
  const posts = await readPosts();
  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.authorized) return auth.response;

  try {
    const post = await request.json();
    if (!post.id || !post.translations || typeof post.translations !== 'object') {
      return NextResponse.json({ error: 'Invalid post data: missing id or translations' }, { status: 400 });
    }
    const created = await createPost(post);
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Invalid request' }, { status: 400 });
  }
}
