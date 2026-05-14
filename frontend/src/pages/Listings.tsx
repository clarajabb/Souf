import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { listingsApi } from '../api/client';
import { Listing, ListingFilters } from '../types';
import ListingCard from '../components/ListingCard';
import FilterSidebar from '../components/FilterSidebar';

export default function Listings() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<ListingFilters>({ page: 1 });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['listings', filters],
    queryFn: () => {
      const params: Record<string, unknown> = {};
      if (filters.materialType) params.materialType = filters.materialType;
      if (filters.country) params.country = filters.country;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.allowSamples) params.allowSamples = true;
      if (filters.minQuantity) params.minQuantity = filters.minQuantity;
      params.page = filters.page ?? 1;
      params.limit = 12;
      return listingsApi.getAll(params).then((r) => r.data);
    },
    placeholderData: (prev) => prev,
  });

  const listings: Listing[] = data?.listings ?? [];
  const pages: number = data?.pages ?? 1;
  const page = filters.page ?? 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">{t('listings.title')}</h1>

      <div className="flex gap-6">
        <FilterSidebar filters={filters} onChange={setFilters} />

        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-24" />
                    <div className="h-4 bg-gray-200 rounded" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-16 text-red-500">{t('common.error')}</div>
          ) : listings.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500">{t('listings.noResults')}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {listings.map((l) => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    onClick={() => setFilters((f) => ({ ...f, page: Math.max(1, page - 1) }))}
                    disabled={page === 1}
                    className="btn-secondary px-3 py-2 disabled:opacity-40"
                  >
                    ←
                  </button>
                  {[...Array(pages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setFilters((f) => ({ ...f, page: i + 1 }))}
                      className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
                        page === i + 1
                          ? 'bg-brand-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setFilters((f) => ({ ...f, page: Math.min(pages, page + 1) }))}
                    disabled={page === pages}
                    className="btn-secondary px-3 py-2 disabled:opacity-40"
                  >
                    →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
