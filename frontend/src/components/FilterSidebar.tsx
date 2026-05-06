import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MaterialType, ListingFilters } from '../types';

const MATERIALS: MaterialType[] = ['WOOL', 'COTTON', 'LINEN', 'SILK', 'LEATHER', 'CASHMERE', 'ALPACA', 'OTHER'];

interface Props {
  filters: ListingFilters;
  onChange: (filters: ListingFilters) => void;
}

export default function FilterSidebar({ filters, onChange }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const set = (key: keyof ListingFilters, value: unknown) => {
    onChange({ ...filters, [key]: value, page: 1 });
  };

  const clear = () => onChange({ page: 1 });

  const hasFilters = Object.keys(filters).some(
    (k) => k !== 'page' && filters[k as keyof ListingFilters]
  );

  const content = (
    <div className="space-y-5">
      {/* Material */}
      <div>
        <label className="label">{t('listings.material')}</label>
        <select
          value={filters.materialType ?? ''}
          onChange={(e) => set('materialType', e.target.value as MaterialType | '')}
          className="input"
        >
          <option value="">{t('common.all')}</option>
          {MATERIALS.map((m) => (
            <option key={m} value={m}>{t(`materials.${m}`)}</option>
          ))}
        </select>
      </div>

      {/* Country */}
      <div>
        <label className="label">{t('listings.country')}</label>
        <input
          type="text"
          placeholder="e.g. Peru, France..."
          value={filters.country ?? ''}
          onChange={(e) => set('country', e.target.value)}
          className="input"
        />
      </div>

      {/* Price range */}
      <div>
        <label className="label">{t('listings.priceRange')}</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder={t('listings.minPrice')}
            value={filters.minPrice ?? ''}
            onChange={(e) => set('minPrice', e.target.value)}
            min={0}
            className="input"
          />
          <input
            type="number"
            placeholder={t('listings.maxPrice')}
            value={filters.maxPrice ?? ''}
            onChange={(e) => set('maxPrice', e.target.value)}
            min={0}
            className="input"
          />
        </div>
      </div>

      {/* Min quantity */}
      <div>
        <label className="label">{t('listings.minQuantity')}</label>
        <input
          type="number"
          placeholder="0"
          value={filters.minQuantity ?? ''}
          onChange={(e) => set('minQuantity', e.target.value)}
          min={0}
          className="input"
        />
      </div>

      {/* Samples toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={!!filters.allowSamples}
          onClick={() => set('allowSamples', !filters.allowSamples)}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
            filters.allowSamples ? 'bg-brand-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              filters.allowSamples ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
        <span className="text-sm text-gray-700">{t('listings.samplesOnly')}</span>
      </div>

      {hasFilters && (
        <button onClick={clear} className="btn-secondary w-full">
          {t('listings.clearFilters')}
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">{t('listings.filters')}</h2>
          {content}
        </div>
      </aside>

      {/* Mobile: collapsible */}
      <div className="lg:hidden">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between btn-secondary mb-3"
        >
          <span>{t('listings.filters')}</span>
          <svg
            className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div className="card p-5 mb-4">
            {content}
          </div>
        )}
      </div>
    </>
  );
}
