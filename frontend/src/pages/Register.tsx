import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { authApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

type Role = 'SUPPLIER' | 'BUYER';

export default function Register() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<Role>('BUYER');
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    country: '', phone: '',
    // Supplier-only
    farmName: '', location: '', farmingPractice: 'CONVENTIONAL',
  });
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await authApi.register({ ...form, role });
      // Auto-login
      await login(form.email, form.password);
      toast.success('Account created!');
      navigate(role === 'SUPPLIER' ? '/dashboard/supplier' : '/dashboard/buyer');
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
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-3">
            <img src="/logo.png" alt="SOUF" className="h-24 w-auto mx-auto" />
          </Link>
          <p className="text-gray-500 text-sm">{t('auth.registerTitle')}</p>
        </div>

        <div className="card p-8">
          {/* Role toggle */}
          <div className="flex gap-2 mb-6">
            {(['BUYER', 'SUPPLIER'] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg border transition-colors ${
                  role === r
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-brand-300'
                }`}
              >
                {r === 'BUYER' ? t('auth.buyer') : t('auth.supplier')}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">{t('auth.name')}</label>
              <input type="text" required value={form.name} onChange={(e) => set('name', e.target.value)} className="input" placeholder="Your full name" />
            </div>

            <div>
              <label className="label">{t('auth.email')}</label>
              <input type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} className="input" placeholder="you@example.com" />
            </div>

            <div>
              <label className="label">{t('auth.password')}</label>
              <input type="password" required minLength={6} value={form.password} onChange={(e) => set('password', e.target.value)} className="input" placeholder="Min 6 characters" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">{t('auth.country')}</label>
                <input type="text" value={form.country} onChange={(e) => set('country', e.target.value)} className="input" placeholder="France" />
              </div>
              <div>
                <label className="label">{t('auth.phone')}</label>
                <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} className="input" placeholder="+33..." />
              </div>
            </div>

            {/* Supplier-only fields */}
            {role === 'SUPPLIER' && (
              <div className="border-t border-dashed border-gray-200 pt-4 space-y-4">
                <p className="text-xs font-medium text-brand-600 uppercase tracking-wide">Farm details</p>

                <div>
                  <label className="label">{t('auth.farmName')}</label>
                  <input type="text" value={form.farmName} onChange={(e) => set('farmName', e.target.value)} className="input" placeholder="Andes Alpaca Co." />
                </div>

                <div>
                  <label className="label">{t('auth.location')}</label>
                  <input type="text" value={form.location} onChange={(e) => set('location', e.target.value)} className="input" placeholder="Puno, Peru" />
                </div>

                <div>
                  <label className="label">{t('auth.farmingPractice')}</label>
                  <select value={form.farmingPractice} onChange={(e) => set('farmingPractice', e.target.value)} className="input">
                    <option value="ORGANIC">{t('auth.organic')}</option>
                    <option value="CONVENTIONAL">{t('auth.conventional')}</option>
                    <option value="FREE_RANGE">{t('auth.freeRange')}</option>
                  </select>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-2">
              {loading ? t('common.loading') : t('auth.registerBtn')}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          {t('auth.haveAccount')}{' '}
          <Link to="/login" className="text-brand-600 font-medium hover:underline">
            {t('nav.login')}
          </Link>
        </p>
      </div>
    </div>
  );
}
