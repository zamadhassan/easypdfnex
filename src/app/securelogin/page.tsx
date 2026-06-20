'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, LogIn } from 'lucide-react';

export default function SecureLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) throw new Error('Invalid credentials');
      const data = await res.json();
      localStorage.setItem('easypdfnex_admin_token', data.token);
      router.push('/securelogin/dashboard');
    } catch {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(var(--color-background))] to-[hsl(var(--color-muted))]">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(var(--color-primary))] to-[hsl(var(--color-accent))] flex items-center justify-center shadow-lg shadow-[hsl(var(--color-primary)/0.3)] mb-4">
            <Lock className="w-8 h-8 text-[hsl(var(--color-primary-foreground))]" />
          </div>
          <h1 className="text-2xl font-bold text-[hsl(var(--color-foreground))]">Admin Login</h1>
          <p className="text-sm text-[hsl(var(--color-muted-foreground))] mt-1">EasyPDFNex Blog CMS</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--color-foreground))] mb-1.5">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))] focus:border-transparent transition-all"
              placeholder="Enter username"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--color-foreground))] mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))] focus:border-transparent transition-all"
              placeholder="Enter password"
              required
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-[hsl(var(--color-destructive)/0.1)] border border-[hsl(var(--color-destructive)/0.2)] text-sm text-[hsl(var(--color-destructive))]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[hsl(var(--color-primary))] text-[hsl(var(--color-primary-foreground))] font-medium hover:bg-[hsl(var(--color-primary-hover))] transition-all disabled:opacity-50"
          >
            {loading ? 'Signing in...' : (
              <>
                <LogIn className="w-4 h-4" />
                Sign In
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
