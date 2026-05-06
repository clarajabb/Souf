import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { listingsApi } from '../api/client';
import { Listing } from '../types';
import ListingCard from '../components/ListingCard';

function SoufWordmark({ className = '' }: { className?: string }) {
  return (
    <span
      className={`font-bold text-brand-500 uppercase tracking-[0.22em] ${className}`}
    >
      SOUF
    </span>
  );
}

export default function Home() {
  const { t } = useTranslation();

  const { data } = useQuery({
    queryKey: ['listings', 'featured'],
    queryFn: () => listingsApi.getAll({ limit: 6 }).then((r) => r.data),
  });

  const featured: Listing[] = data?.listings ?? [];

  return (
    <div className="bg-white">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ backgroundColor: '#c8773a' }}>
        {/* Subtle textile-grain texture overlay */}
        <div className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='1' height='1' fill='%23fff'/%3E%3C/svg%3E")`,
            backgroundSize: '4px 4px',
          }}
        />

        {/* Subtle dark vignette at edges */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/20 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 sm:pt-32 sm:pb-40">
          {/* Wordmark above hero */}
          <div className="mb-10">
            <SoufWordmark className="text-3xl sm:text-4xl" />
          </div>

          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-black/15 text-white/80 text-xs font-medium px-3 py-1.5 rounded-full mb-8 border border-white/20">
              Sustainable sourcing · Direct from the farm
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6">
              {t('home.hero.title')}
            </h1>

            <p className="text-base sm:text-lg text-white/60 mb-10 leading-relaxed max-w-xl">
              {t('home.hero.subtitle')}
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/listings"
                className="inline-flex items-center gap-2 bg-white text-brand-600 font-semibold px-6 py-3 rounded-lg hover:bg-brand-50 transition-colors text-sm"
              >
                {t('home.hero.cta')}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-white/10 text-white border border-white/20 font-medium px-6 py-3 rounded-lg hover:bg-white/15 transition-colors text-sm backdrop-blur-sm"
              >
                {t('home.hero.supplierCta')}
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom wave into white */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 64" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full block">
            <path d="M0,40 C480,80 960,0 1440,40 L1440,64 L0,64 Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-brand-500 tracking-[0.2em] uppercase mb-3">Process</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {t('home.howItWorks.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 relative">
            {/* connector lines (desktop) */}
            <div className="hidden sm:block absolute top-8 left-1/3 right-1/3 h-px bg-gradient-to-r from-brand-200 to-brand-200" />

            {[
              { num: '01', title: t('home.howItWorks.step1Title'), desc: t('home.howItWorks.step1Desc') },
              { num: '02', title: t('home.howItWorks.step2Title'), desc: t('home.howItWorks.step2Desc') },
              { num: '03', title: t('home.howItWorks.step3Title'), desc: t('home.howItWorks.step3Desc') },
            ].map((step) => (
              <div key={step.num} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-brand-50 border-2 border-brand-200 flex items-center justify-center mb-5 relative z-10">
                  <span className="text-lg font-bold text-brand-500 tracking-wide">{step.num}</span>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust badges ─────────────────────────────────────────────── */}
      <section className="bg-sand-50 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                icon: (
                  <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                ),
                title: t('home.trust.verified'),
                desc: t('home.trust.verifiedDesc'),
              },
              {
                icon: (
                  <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ),
                title: t('home.trust.escrow'),
                desc: t('home.trust.escrowDesc'),
              },
              {
                icon: (
                  <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: t('home.trust.traceable'),
                desc: t('home.trust.traceableDesc'),
              },
            ].map((badge) => (
              <div
                key={badge.title}
                className="bg-white rounded-xl p-6 border border-sand-200 flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                  {badge.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{badge.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured listings ─────────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold text-brand-500 tracking-[0.2em] uppercase mb-2">Marketplace</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('home.featured')}</h2>
          </div>
          <Link
            to="/listings"
            className="text-sm font-medium text-brand-500 hover:text-brand-600 transition-colors"
          >
            View all →
          </Link>
        </div>

        {featured.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="aspect-[4/3] bg-gray-100" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-20" />
                  <div className="h-4 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────── */}
      <section className="mx-4 sm:mx-6 lg:mx-8 mb-16 rounded-2xl overflow-hidden relative" style={{ backgroundColor: '#c8773a' }}>
        <div className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='1' height='1' fill='%23fff'/%3E%3C/svg%3E")`,
            backgroundSize: '4px 4px',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/15 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-8 py-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <SoufWordmark className="text-xl mb-3" />
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
              Ready to source smarter?
            </h2>
            <p className="text-white/50 text-sm">
              Join suppliers and brands already on SOUF.
            </p>
          </div>
          <Link
            to="/register"
            className="flex-shrink-0 inline-flex items-center gap-2 bg-white text-brand-600 font-semibold px-6 py-3 rounded-lg hover:bg-brand-50 transition-colors text-sm"
          >
            Create a free account →
          </Link>
        </div>
      </section>
    </div>
  );
}
