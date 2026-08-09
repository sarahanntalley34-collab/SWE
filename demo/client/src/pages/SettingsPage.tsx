import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { getSettings, updateSettings } from '../api/client';
import type { Plan, Settings } from '../types';

const PLAN_OPTIONS: Plan[] = ['Starter', 'Pro', 'Enterprise'];

type Feedback = { kind: 'success' | 'error'; message: string } | null;

const inputClasses =
  'w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-colors';
const labelClasses = 'block text-sm font-medium text-gray-400 mb-1.5';

export function SettingsPage() {
  const [form, setForm] = useState<Settings>({
    company_name: '',
    email: '',
    plan: 'Pro',
    notifications_enabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const load = useCallback(() => {
    setLoading(true);
    getSettings()
      .then((s) => {
        setForm(s);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setFeedback({
          kind: 'error',
          message: err instanceof Error ? err.message : 'Failed to load settings',
        });
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Auto-dismiss feedback after a few seconds.
  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 4000);
    return () => clearTimeout(t);
  }, [feedback]);

  const setField = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.company_name.trim() || !form.email.trim()) {
      setFeedback({ kind: 'error', message: 'Company name and email are required.' });
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      const saved = await updateSettings({
        company_name: form.company_name.trim(),
        email: form.email.trim(),
        plan: form.plan,
        notifications_enabled: form.notifications_enabled,
      });
      setForm(saved);
      setFeedback({ kind: 'success', message: 'Settings saved successfully.' });
    } catch (err) {
      setFeedback({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Failed to save settings.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl space-y-4">
        <div className="h-8 w-48 bg-gray-900 border border-gray-800 rounded animate-pulse" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-900 border border-gray-800 rounded-xl animate-pulse" />
        ))}
        <div className="h-10 w-28 bg-gray-900 border border-gray-800 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-1">Account Settings</h2>
        <p className="text-sm text-gray-500 mb-6">Manage your company profile and preferences.</p>

        {feedback && (
          <div
            role="status"
            className={`mb-5 px-4 py-3 rounded-lg border text-sm ${
              feedback.kind === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}
          >
            {feedback.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label htmlFor="company_name" className={labelClasses}>
              Company Name
            </label>
            <input
              id="company_name"
              type="text"
              value={form.company_name}
              onChange={(e) => setField('company_name', e.target.value)}
              placeholder="Acme Corp"
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="email" className={labelClasses}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setField('email', e.target.value)}
              placeholder="admin@acme.com"
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="plan" className={labelClasses}>
              Plan
            </label>
            <select
              id="plan"
              value={form.plan}
              onChange={(e) => setField('plan', e.target.value as Plan)}
              className={inputClasses}
            >
              {PLAN_OPTIONS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="text-sm font-medium text-gray-300">Notifications</p>
              <p className="text-xs text-gray-500">Receive email notifications about your account.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={form.notifications_enabled}
              aria-label="Toggle notifications"
              onClick={() => setField('notifications_enabled', !form.notifications_enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                form.notifications_enabled ? 'bg-emerald-600' : 'bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  form.notifications_enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={load}
              className="px-4 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium transition-colors"
            >
              Discard
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
