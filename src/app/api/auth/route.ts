import { NextResponse } from 'next/server';
import { validateCredentials } from '@/lib/blog/auth';
import { generateToken } from '@/lib/blog/auth-middleware';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    const valid = await validateCredentials(username, password);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    const token = await generateToken(username);
    return NextResponse.json({ success: true, token });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
