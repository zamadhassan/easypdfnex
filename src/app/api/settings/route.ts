import { NextResponse } from 'next/server';
import { updateCredentials, getSettings } from '@/lib/blog/auth';
import { requireAuth } from '@/lib/blog/auth-middleware';

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.authorized) return auth.response;

  const settings = await getSettings();
  return NextResponse.json({ username: settings.username });
}

export async function PUT(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.authorized) return auth.response;

  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }
    await updateCredentials(username, password);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
