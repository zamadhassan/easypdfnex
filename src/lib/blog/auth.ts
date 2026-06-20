import crypto from 'crypto';
import { getSupabase } from './supabase';
import { BlogSettings } from './types';

async function readSettings(): Promise<BlogSettings> {
  const supabase = getSupabase();
  if (!supabase) {
    return { username: 'admin', password: hashPassword('Admin!@2026') };
  }

  try {
    const { data, error } = await (supabase as any)
      .from('admin_settings')
      .select('*')
      .eq('id', 1)
      .single();
    if (error || !data) return createDefaultSettings(supabase);
    return { username: data.username, password: data.password_hash };
  } catch {
    return createDefaultSettings(supabase);
  }
}

async function createDefaultSettings(supabase: any): Promise<BlogSettings> {
  const password = hashPassword('Admin!@2026');
  const authSecret = crypto.randomBytes(32).toString('hex');
  await supabase.from('admin_settings').upsert({
    id: 1, username: 'admin', password_hash: password, auth_secret: authSecret,
  });
  return { username: 'admin', password };
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 600000, 64, 'sha512');
  return `${salt}:${hash.toString('hex')}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  const verify = crypto.pbkdf2Sync(password, salt, 600000, 64, 'sha512');
  const hashBuf = Buffer.from(hash, 'hex');
  if (verify.length !== hashBuf.length) return false;
  return crypto.timingSafeEqual(verify, hashBuf);
}

export async function validateCredentials(username: string, password: string): Promise<boolean> {
  const settings = await readSettings();
  if (username !== settings.username) return false;
  return verifyPassword(password, settings.password);
}

export async function updateCredentials(username: string, password: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  const updates: Record<string, string> = {};
  if (username) updates.username = username;
  if (password) updates.password_hash = hashPassword(password);
  await (supabase as any).from('admin_settings').update(updates).eq('id', 1);
}

export async function getSettings(): Promise<BlogSettings> {
  return readSettings();
}

export async function getAuthSecret(): Promise<string> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  try {
    const { data, error } = await (supabase as any)
      .from('admin_settings')
      .select('auth_secret')
      .eq('id', 1)
      .single();
    if (error || !data?.auth_secret) {
      const secret = crypto.randomBytes(32).toString('hex');
      await (supabase as any).from('admin_settings').update({ auth_secret: secret }).eq('id', 1);
      return secret;
    }
    return data.auth_secret;
  } catch {
    const secret = crypto.randomBytes(32).toString('hex');
    await (supabase as any).from('admin_settings').update({ auth_secret: secret }).eq('id', 1);
    return secret;
  }
}
