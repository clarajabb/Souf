import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? t('common.error');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-3">
            <img src="/logo.png" alt="SOUF" className="h-24 w-auto mx-auto" />
          </Link>
          <p className="text-gray-500 text-sm">{t('auth.loginTitle')}</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label" htmlFor="email">{t('auth.email')}</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="label" htmlFor="password">{t('auth.password')}</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? t('common.loading') : t('auth.loginBtn')}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-3">Demo accounts (all use: password123)</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Supplier (Peru)', email: 'alejandro@andes-alpaca.com' },
                { label: 'Buyer (Germany)', email: 'nora@ecothreads.com' },
              ].map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => { setEmail(acc.email); setPassword('password123'); }}
                  className="text-xs text-left px-3 py-2 bg-gray-50 hover:bg-brand-50 rounded-lg border border-gray-100 hover:border-brand-200 transition-colors"
                >
                  <div className="font-medium text-gray-700">{acc.label}</div>
                  <div className="text-gray-400 truncate">{acc.email}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="text-brand-600 font-medium hover:underline">
            {t('nav.register')}
          </Link>
        </p>
      </div>
    </div>
  );
}
