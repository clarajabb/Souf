import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { usersApi, reviewsApi } from '../api/client';
import { User, SupplierProfile as SP, Listing, Review } from '../types';
import ListingCard from '../components/ListingCard';
import StarRating from '../components/StarRating';
import VerifiedBadge from '../components/VerifiedBadge';

interface SupplierData extends User {
  supplierProfile?: SP;
  listings: Listing[];
  receivedReviews: Review[];
}

const PRACTICE_LABELS: Record<string, string> = {
  ORGANIC: '🌿 Organic',
  CONVENTIONAL: '🌾 Conventional',
  FREE_RANGE: '🐑 Free-range',
};

export default function SupplierProfile() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();

  const { data: supplier, isLoading } = useQuery<SupplierData>({
    queryKey: ['supplier', id],
    queryFn: () => usersApi.getSupplier(id!).then((r) => r.data),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse">
        <div className="flex gap-4 mb-8">
          <div className="w-24 h-24 rounded-full bg-gray-200" />
          <div className="flex-1 space-y-3">
            <div className="h-6 bg-gray-200 rounded w-48" />
            <div className="h-4 bg-gray-200 rounded w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!supplier) {
    return <div className="text-center py-20 text-gray-500">Supplier not found.</div>;
  }

  const profile = supplier.supplierProfile;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile header */}
      <div className="card p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-brand-100 flex-shrink-0 overflow-hidden flex items-center justify-center text-brand-700 text-3xl font-bold shadow">
            {supplier.avatarUrl ? (
              <img src={supplier.avatarUrl} alt={supplier.name} className="w-full h-full object-cover" />
            ) : (
              supplier.name[0].toUpperCase()
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {profile?.farmName ?? supplier.name}
              </h1>
              {supplier.isVerified && <VerifiedBadge size="md" />}
            </div>

            <p className="text-gray-500 text-sm mb-1">{supplier.name}</p>

            <div className="flex items-center gap-4 flex-wrap text-sm text-gray-500 mb-3">
              {supplier.country && <span>📍 {profile?.location ?? supplier.country}</span>}
              <span>🗓 Member since {new Date(supplier.createdAt).getFullYear()}</span>
              {profile && (
                <span>{PRACTICE_LABELS[profile.farmingPractice]}</span>
              )}
            </div>

            {profile && (
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <StarRating value={profile.rating} size="sm" />
                  <span className="text-sm font-medium text-gray-700">{profile.rating.toFixed(1)}</span>
                </div>
                <span className="text-sm text-gray-500">
                  {profile.totalSales} completed orders
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {profile?.description && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600 leading-relaxed">{profile.description}</p>
          </div>
        )}

        {/* Certifications */}
        {profile && profile.certifications.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.certifications.map((c) => (
              <span key={c} className="bg-brand-50 text-brand-700 text-xs font-medium px-2.5 py-1 rounded-full border border-brand-200">
                {c}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Listings grid */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-5">Active Listings</h2>
        {supplier.listings.length === 0 ? (
          <p className="text-gray-400 text-sm">No active listings.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {supplier.listings.map((l) => (
              <ListingCard key={l.id} listing={{ ...l, supplier }} />
            ))}
          </div>
        )}
      </section>

      {/* Reviews */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-5">{t('listing.reviews')}</h2>
        {supplier.receivedReviews.length === 0 ? (
          <p className="text-gray-400 text-sm">{t('listing.noReviews')}</p>
        ) : (
          <div className="space-y-4">
            {supplier.receivedReviews.map((r) => (
              <div key={r.id} className="card p-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600 flex-shrink-0">
                    {r.reviewer?.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-medium text-sm text-gray-800">{r.reviewer?.name}</span>
                      <StarRating value={r.rating} size="sm" />
                      <span className="text-xs text-gray-400 ml-auto">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
