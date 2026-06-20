'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Key, User } from 'lucide-react';

export default function SettingsPage() {
  const [username, setUsername] = useState('admin');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('easypdfnex_admin_token');
    if (!token) { router.push('/securelogin'); return; }
    fetchSettings();
  }, []);

  const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('easypdfnex_admin_token')}` });

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings', { headers: authHeaders() });
      const data = await res.json();
      setUsername(data.username || 'admin');
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword && newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ username, password: newPassword || currentPassword }),
      });
      if (!res.ok) throw new Error('Failed to save');
      setMessage('Credentials updated successfully');
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--color-background))]">
      <header className="border-b border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-3">
          <Link href="/securelogin/dashboard" className="p-2 rounded-lg hover:bg-[hsl(var(--color-muted))] transition-all">
            <ArrowLeft className="w-5 h-5 text-[hsl(var(--color-muted-foreground))]" />
          </Link>
          <h1 className="font-bold text-[hsl(var(--color-foreground))]">Settings</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-12">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--color-foreground))] mb-1.5 flex items-center gap-2">
              <User className="w-4 h-4 text-[hsl(var(--color-primary))]" /> Username
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))] focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="border-t border-[hsl(var(--color-border))] pt-6">
            <h3 className="text-sm font-semibold text-[hsl(var(--color-foreground))] mb-4 flex items-center gap-2">
              <Key className="w-4 h-4 text-[hsl(var(--color-primary))]" /> Change Password
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--color-foreground))] mb-1.5">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))] focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--color-foreground))] mb-1.5">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))] focus:border-transparent transition-all"
                  placeholder="Leave blank to keep current"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--color-foreground))] mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))] focus:border-transparent transition-all"
                  placeholder="Leave blank to keep current"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-[hsl(var(--color-destructive)/0.1)] border border-[hsl(var(--color-destructive)/0.2)] text-sm text-[hsl(var(--color-destructive))]">{error}</div>
          )}
          {message && (
            <div className="p-3 rounded-lg bg-[hsl(var(--color-success)/0.1)] border border-[hsl(var(--color-success)/0.2)] text-sm text-[hsl(var(--color-success))]">{message}</div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[hsl(var(--color-primary))] text-[hsl(var(--color-primary-foreground))] font-medium hover:bg-[hsl(var(--color-primary-hover))] transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </main>
    </div>
  );
}
