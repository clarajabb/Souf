import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';
import { listingsApi, ordersApi, reviewsApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Listing, Review } from '../types';
import ImageGallery from '../components/ImageGallery';
import SourceCard from '../components/SourceCard';
import MaterialBadge from '../components/MaterialBadge';
import VerifiedBadge from '../components/VerifiedBadge';
import StarRating from '../components/StarRating';
import SampleRequestModal from '../components/SampleRequestModal';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? '');

function CheckoutForm({ clientSecret, orderId }: { clientSecret: string; orderId: string }) {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    const { error } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      toast.error(error.message ?? 'Payment failed');
      setLoading(false);
    } else {
      // Update order status to PAID via our API
      try {
        await ordersApi.updateStatus(orderId, 'PAID');
      } catch {
        // status update is best-effort; webhook would handle in production
      }
      toast.success('Payment successful!');
      navigate(`/orders/${orderId}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <button type="submit" disabled={loading || !stripe} className="btn-primary w-full">
        {loading ? t('common.loading') : t('listing.pay')}
      </button>
    </form>
  );
}

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [qty, setQty] = useState('');
  const [ordering, setOrdering] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [pendingOrderId, setPendingOrderId] = useState('');
  const [showSampleModal, setShowSampleModal] = useState(false);

  const { data: listing, isLoading } = useQuery<Listing>({
    queryKey: ['listing', id],
    queryFn: () => listingsApi.getById(id!).then((r) => r.data),
    enabled: !!id,
  });

  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ['reviews', listing?.supplierId],
    queryFn: () => reviewsApi.getForUser(listing!.supplierId).then((r) => r.data),
    enabled: !!listing?.supplierId,
  });

  const qtyNum = parseFloat(qty) || 0;
  const total = listing ? (qtyNum * listing.pricePerKg).toFixed(2) : '0.00';

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (!listing) return;
    if (qtyNum < listing.minimumOrderKg) {
      toast.error(`Minimum order is ${listing.minimumOrderKg} kg`);
      return;
    }

    setOrdering(true);
    try {
      const res = await ordersApi.create({ listingId: listing.id, quantityKg: qtyNum });
      setClientSecret(res.data.clientSecret);
      setPendingOrderId(res.data.order.id);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? t('common.error');
      toast.error(msg);
    } finally {
      setOrdering(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="aspect-[4/3] bg-gray-200 rounded-xl max-w-xl" />
          <div className="h-8 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-full" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return <div className="text-center py-20 text-gray-500">Listing not found.</div>;
  }

  const supplier = listing.supplier;
  const canOrder = user && user.role === 'BUYER' && listing.supplierId !== user.id;
  const canSample = canOrder && listing.allowSamples;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/listings" className="text-sm text-brand-600 hover:underline mb-4 inline-block">
        ← {t('common.back')}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: image + details */}
        <div className="lg:col-span-2 space-y-6">
          <ImageGallery images={listing.images} title={listing.title} />

          {/* Title + badges */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <MaterialBadge type={listing.materialType} size="md" />
              {supplier?.isVerified && <VerifiedBadge size="md" />}
              {listing.allowSamples && (
                <span className="bg-brand-50 text-brand-700 text-xs font-medium px-2.5 py-1 rounded-full">
                  {t('listing.allowsSamples')}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{listing.title}</h1>
          </div>

          {/* Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: t('listing.pricePerKg'), value: `$${listing.pricePerKg.toFixed(2)}` },
              { label: t('listing.moq'), value: `${listing.minimumOrderKg} kg` },
              { label: t('listing.available'), value: `${listing.availableKg} kg` },
              { label: t('listing.samplePrice'), value: listing.samplePriceUsd ? `$${listing.samplePriceUsd}` : '—' },
            ].map((s) => (
              <div key={s.label} className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500">{s.label}</div>
                <div className="font-bold text-gray-900 mt-0.5">{s.value}</div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div>
            <h2 className="font-semibold text-gray-900 mb-2">{t('listing.description')}</h2>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{listing.description}</p>
          </div>

          {/* Reviews */}
          <div>
            <h2 className="font-semibold text-gray-900 mb-4">{t('listing.reviews')}</h2>
            {reviews.length === 0 ? (
              <p className="text-sm text-gray-400">{t('listing.noReviews')}</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-bold">
                        {r.reviewer?.name?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{r.reviewer?.name}</span>
                      <StarRating value={r.rating} size="sm" />
                      <span className="text-xs text-gray-400 ml-auto">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Source card + order form */}
        <div className="space-y-6">
          {/* Source Card */}
          {supplier && supplier.supplierProfile && (
            <SourceCard supplier={supplier as Parameters<typeof SourceCard>[0]['supplier']} />
          )}

          {/* Order / Sample panel */}
          {!user ? (
            <div className="card p-5 text-center space-y-3">
              <p className="text-sm text-gray-500">Log in to place an order or request a sample.</p>
              <Link to="/login" className="btn-primary w-full">Log in</Link>
            </div>
          ) : (
            <div className="card p-5 space-y-4">
              {clientSecret ? (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Complete Payment</h3>
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CheckoutForm clientSecret={clientSecret} orderId={pendingOrderId} />
                  </Elements>
                </div>
              ) : (
                <>
                  {canSample && (
                    <button
                      onClick={() => setShowSampleModal(true)}
                      className="btn-secondary w-full"
                    >
                      🧪 {t('listing.requestSample')}
                      {listing.samplePriceUsd && ` — $${listing.samplePriceUsd}`}
                    </button>
                  )}

                  {canOrder && (
                    <form onSubmit={handleOrder} className="space-y-4">
                      <h3 className="font-semibold text-gray-900">{t('listing.placeOrder')}</h3>
                      <div>
                        <label className="label">{t('listing.quantity')}</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={listing.minimumOrderKg}
                            max={listing.availableKg}
                            step="0.1"
                            value={qty}
                            onChange={(e) => setQty(e.target.value)}
                            placeholder={`Min ${listing.minimumOrderKg} kg`}
                            className="input"
                            required
                          />
                          <span className="text-sm text-gray-500 flex-shrink-0">kg</span>
                        </div>
                      </div>
                      {qtyNum > 0 && (
                        <div className="bg-brand-50 rounded-lg px-4 py-3 flex justify-between">
                          <span className="text-sm text-brand-700 font-medium">{t('listing.total')}</span>
                          <span className="text-lg font-bold text-brand-900">${total}</span>
                        </div>
                      )}
                      <button type="submit" disabled={ordering || !qty} className="btn-primary w-full">
                        {ordering ? t('common.loading') : t('listing.placeOrder')}
                      </button>
                    </form>
                  )}

                  {user.role === 'SUPPLIER' && (
                    <p className="text-sm text-gray-400 text-center">Switch to a buyer account to place orders.</p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {showSampleModal && listing && (
        <SampleRequestModal listing={listing} onClose={() => setShowSampleModal(false)} />
      )}
    </div>
  );
}
