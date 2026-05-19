import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
  { code: 'ar', label: 'AR' },
  { code: 'es', label: 'ES' },
];

function SoufWordmark({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const heights = { sm: 'h-7', md: 'h-9', lg: 'h-11' };
  return (
    <img
      src="/logo.png"
      alt="SOUF"
      className={`${heights[size]} w-auto select-none`}
      style={{ filter: 'brightness(0) invert(1)' }}
    />
  );
}

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isHome = location.pathname === '/';
  const dashboardPath = user?.role === 'SUPPLIER' ? '/dashboard/supplier' : '/dashboard/buyer';

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  // Nav link style: white on the brown background
  const linkCls = 'text-sm text-white/75 hover:text-white font-medium transition-colors';
  const activeCls = 'text-sm text-white font-semibold';

  return (
    // ── Full-width brown bar ─────────────────────────────────────────────────
    <nav className="sticky top-0 z-50" style={{ backgroundColor: '#c8773a' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Left: SOUF wordmark (always links home) */}
          <Link to="/" className="flex-shrink-0" aria-label="Go to home">
            <SoufWordmark size="md" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-5">

            {/* ── Home button (visible on every page except home) ── */}
            {!isHome && (
              <Link
                to="/"
                className="flex items-center gap-1.5 text-sm text-white/80 hover:text-white font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {t('nav.home')}
              </Link>
            )}

            <Link to="/listings" className={location.pathname === '/listings' ? activeCls : linkCls}>
              {t('nav.browse')}
            </Link>

            {/* Language switcher — adapted for brown bg */}
            <div className="flex items-center gap-0.5 bg-black/15 rounded-lg p-1">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => i18n.changeLanguage(l.code)}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                    i18n.language === l.code
                      ? 'bg-white text-brand-600 shadow-sm'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {user ? (
              <div className="flex items-center gap-4">
                <Link
                  to="/messages"
                  className={location.pathname.startsWith('/messages') ? activeCls : linkCls}
                >
                  {t('nav.messages')}
                </Link>
                <Link
                  to={dashboardPath}
                  className={location.pathname.startsWith('/dashboard') ? activeCls : linkCls}
                >
                  {t('nav.dashboard')}
                </Link>

                {/* Avatar + logout */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name[0].toUpperCase()
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {t('nav.logout')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className={linkCls}>{t('nav.login')}</Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-4 py-1.5 rounded-lg bg-white text-brand-600 text-sm font-semibold hover:bg-brand-50 transition-colors"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile: home icon + hamburger */}
          <div className="md:hidden flex items-center gap-2">
            {!isHome && (
              <Link
                to="/"
                aria-label="Home"
                className="p-2 rounded-lg bg-white/15 hover:bg-white/25 transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </Link>
            )}
            <button
              className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* ── Mobile dropdown ──────────────────────────────────────────── */}
        {menuOpen && (
          <div
            className="md:hidden border-t pb-4 pt-2 space-y-1"
            style={{ borderColor: 'rgba(255,255,255,0.2)' }}
          >
            {/* Home — always shown in mobile menu */}
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 text-sm text-white font-medium rounded-lg hover:bg-white/15 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              {t('nav.home')}
            </Link>

            <Link
              to="/listings"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2.5 text-sm text-white/80 hover:text-white font-medium rounded-lg hover:bg-white/15 transition-colors"
            >
              {t('nav.browse')}
            </Link>

            {/* Language switcher */}
            <div className="flex items-center gap-1 px-3 py-2">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => { i18n.changeLanguage(l.code); setMenuOpen(false); }}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                    i18n.language === l.code
                      ? 'bg-white text-brand-600'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {user ? (
              <>
                <Link
                  to="/messages"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2.5 text-sm text-white/80 hover:text-white font-medium rounded-lg hover:bg-white/15 transition-colors"
                >
                  {t('nav.messages')}
                </Link>
                <Link
                  to={dashboardPath}
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2.5 text-sm text-white/80 hover:text-white font-medium rounded-lg hover:bg-white/15 transition-colors"
                >
                  {t('nav.dashboard')}
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2.5 text-sm text-white/60 hover:text-white font-medium rounded-lg hover:bg-white/10 transition-colors"
                >
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2.5 text-sm text-white/80 hover:text-white font-medium rounded-lg hover:bg-white/15 transition-colors"
                >
                  {t('nav.login')}
                </Link>
                <div className="px-3 pt-1">
                  <Link
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                    className="block text-center py-2 rounded-lg bg-white text-brand-600 text-sm font-semibold hover:bg-brand-50 transition-colors"
                  >
                    {t('nav.register')}
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
