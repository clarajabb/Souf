import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { samplesApi } from '../api/client';
import { Listing } from '../types';

interface Props {
  listing: Listing;
  onClose: () => void;
}

export default function SampleRequestModal({ listing, onClose }: Props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await samplesApi.create(listing.id);
      toast.success(t('sample.success'));
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? t('common.error');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div>
          <h2 className="text-lg font-semibold text-gray-900">{t('sample.requestTitle')}</h2>
          <p className="text-sm text-gray-500 mt-1">{listing.title}</p>
        </div>

        {listing.samplePriceUsd && (
          <div className="bg-brand-50 rounded-lg px-4 py-3 flex justify-between items-center">
            <span className="text-sm font-medium text-brand-700">{t('sample.price')}</span>
            <span className="text-lg font-bold text-brand-900">${listing.samplePriceUsd}</span>
          </div>
        )}

        <p className="text-sm text-gray-600">
          Requesting a sample will notify the supplier. They will accept and arrange shipping separately.
        </p>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="btn-secondary flex-1">
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary flex-1"
          >
            {loading ? t('common.loading') : t('sample.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
