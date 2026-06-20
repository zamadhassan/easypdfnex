import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { getAuthSecret } from './auth';

const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000;

function getKey(secret: string): string {
  return crypto.createHash('sha256').update(secret).digest('hex');
}

export async function generateToken(username: string): Promise<string> {
  const secret = await getAuthSecret();
  const expiry = Date.now() + TOKEN_EXPIRY_MS;
  const payload = JSON.stringify({ username, expiry });
  const hmac = crypto.createHmac('sha256', getKey(secret)).update(payload).digest('hex');
  return Buffer.from(JSON.stringify({ payload, hmac })).toString('base64');
}

export async function validateToken(token: string): Promise<{ valid: boolean; username?: string }> {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    const { payload, hmac } = decoded;
    const { username, expiry } = JSON.parse(payload);

    if (Date.now() > expiry) return { valid: false };

    const secret = await getAuthSecret();
    const expected = crypto.createHmac('sha256', getKey(secret)).update(payload).digest();

    const hmacBuf = Buffer.from(hmac, 'hex');
    if (hmacBuf.length !== expected.length) return { valid: false };
    if (!crypto.timingSafeEqual(hmacBuf, expected)) return { valid: false };

    return { valid: true, username };
  } catch {
    return { valid: false };
  }
}

export async function requireAuth(request: Request): Promise<{ authorized: true } | { authorized: false; response: NextResponse }> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { authorized: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  const token = authHeader.slice(7);
  const result = await validateToken(token);
  if (!result.valid) {
    return { authorized: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return { authorized: true };
}
