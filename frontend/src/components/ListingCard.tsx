import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Listing } from '../types';
import MaterialBadge from './MaterialBadge';
import StarRating from './StarRating';
import VerifiedBadge from './VerifiedBadge';

interface Props {
  listing: Listing;
}

export default function ListingCard({ listing }: Props) {
  const { t } = useTranslation();
  const profile = listing.supplier?.supplierProfile;
  const image = listing.images?.[0];

  return (
    <Link
      to={`/listings/${listing.id}`}
      className="card hover:shadow-md transition-shadow flex flex-col group"
    >
      {/* Image */}
      <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative">
        {image ? (
          <img
            src={image}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {listing.allowSamples && (
          <span className="absolute top-2 left-2 bg-white/90 text-brand-700 text-xs font-medium px-2 py-0.5 rounded-full shadow-sm">
            {t('listings.sampleAvailable')}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <div className="flex items-start justify-between gap-2">
          <MaterialBadge type={listing.materialType} />
          {listing.supplier?.isVerified && <VerifiedBadge />}
        </div>

        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors">
          {listing.title}
        </h3>

        {/* Supplier */}
        {listing.supplier && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="font-medium text-gray-700">
              {profile?.farmName || listing.supplier.name}
            </span>
            {listing.supplier.country && (
              <span>· {listing.supplier.country}</span>
            )}
          </div>
        )}

        {/* Rating */}
        {profile && profile.rating > 0 && (
          <div className="flex items-center gap-1">
            <StarRating value={profile.rating} size="sm" />
            <span className="text-xs text-gray-500">{profile.rating.toFixed(1)}</span>
          </div>
        )}

        {/* Price + Stock */}
        <div className="mt-auto pt-2 border-t border-gray-50 flex items-end justify-between">
          <div>
            <span className="text-lg font-bold text-gray-900">
              ${listing.pricePerKg.toFixed(2)}
            </span>
            <span className="text-xs text-gray-500 ml-1">{t('listings.perKg')}</span>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">
              {t('listings.moq')} {listing.minimumOrderKg} {t('common.kg')}
            </div>
            <div className="text-xs text-gray-400">
              {listing.availableKg} {t('common.kg')} {t('listings.available')}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
