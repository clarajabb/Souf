import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, SupplierProfile } from '../types';
import StarRating from './StarRating';
import VerifiedBadge from './VerifiedBadge';

// Lazy-load Leaflet map to avoid SSR issues
const MapEmbed = lazy(() => import('./MapEmbed'));

interface Props {
  supplier: User & { supplierProfile?: SupplierProfile };
}

const PRACTICE_LABELS: Record<string, string> = {
  ORGANIC: '🌿 Organic',
  CONVENTIONAL: '🌾 Conventional',
  FREE_RANGE: '🐑 Free-range',
};

export default function SourceCard({ supplier }: Props) {
  const { t } = useTranslation();
  const profile = supplier.supplierProfile;

  if (!profile) return null;

  const memberYear = new Date(supplier.createdAt).getFullYear();

  return (
    <div className="card p-6 space-y-4">
      <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
        <span>📍</span> {t('source.title')}
      </h2>

      {/* Supplier header */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full bg-brand-100 flex-shrink-0 overflow-hidden flex items-center justify-center text-brand-700 text-xl font-bold">
          {supplier.avatarUrl ? (
            <img src={supplier.avatarUrl} alt={supplier.name} className="w-full h-full object-cover" />
          ) : (
            supplier.name[0].toUpperCase()
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900">{profile.farmName}</h3>
            {supplier.isVerified && <VerifiedBadge />}
          </div>
          <p className="text-sm text-gray-500">{supplier.name}</p>
          <p className="text-sm text-gray-500">
            📍 {profile.location}
            {profile.region && `, ${profile.region}`}
            {supplier.country && ` · ${supplier.country}`}
          </p>
        </div>
      </div>

      {/* Map */}
      {profile.lat && profile.lng && (
        <div className="rounded-lg overflow-hidden h-40 border border-gray-100">
          <Suspense fallback={<div className="h-full bg-gray-100 animate-pulse" />}>
            <MapEmbed lat={profile.lat} lng={profile.lng} label={profile.farmName} />
          </Suspense>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center bg-gray-50 rounded-lg py-2 px-1">
          <div className="text-lg font-bold text-gray-900">{profile.totalSales}</div>
          <div className="text-xs text-gray-500">{t('source.orders')}</div>
        </div>
        <div className="text-center bg-gray-50 rounded-lg py-2 px-1">
          <div className="flex justify-center mb-0.5">
            <StarRating value={profile.rating} size="sm" />
          </div>
          <div className="text-xs text-gray-500">{profile.rating.toFixed(1)}</div>
        </div>
        <div className="text-center bg-gray-50 rounded-lg py-2 px-1">
          <div className="text-lg font-bold text-gray-900">{memberYear}</div>
          <div className="text-xs text-gray-500">{t('source.member')}</div>
        </div>
      </div>

      {/* Practice */}
      <div className="space-y-2">
        <div>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('source.practice')}</span>
          <p className="text-sm text-gray-700 mt-0.5">
            {PRACTICE_LABELS[profile.farmingPractice] ?? profile.farmingPractice}
          </p>
        </div>

        {profile.certifications.length > 0 && (
          <div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('source.certifications')}</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {profile.certifications.map((cert) => (
                <span
                  key={cert}
                  className="bg-brand-50 text-brand-700 text-xs font-medium px-2 py-0.5 rounded-full border border-brand-200"
                >
                  {cert}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <Link
        to={`/suppliers/${supplier.id}`}
        className="block text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
      >
        {t('source.viewProfile')} →
      </Link>
    </div>
  );
}
