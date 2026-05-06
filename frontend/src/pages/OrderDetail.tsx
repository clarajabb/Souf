import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ordersApi, reviewsApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Order } from '../types';
import OrderStatusTimeline from '../components/OrderStatusTimeline';
import StarRating from '../components/StarRating';
import MaterialBadge from '../components/MaterialBadge';

function ReviewForm({ orderId, targetUserId, onSuccess }: { orderId: string; targetUserId: string; onSuccess: () => void }) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await reviewsApi.create({ orderId, rating, comment });
      toast.success(t('review.success'));
      onSuccess();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? t('common.error');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-5 space-y-4">
      <h3 className="font-semibold text-gray-900">{t('review.title')}</h3>
      <div>
        <label className="label">{t('review.rating')}</label>
        <StarRating value={rating} onChange={setRating} size="lg" />
      </div>
      <div>
        <label className="label">{t('review.comment')}</label>
        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="input"
          placeholder="Share your experience..."
        />
      </div>
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? t('common.loading') : t('review.submit')}
      </button>
    </form>
  );
}

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [reviewDone, setReviewDone] = useState(false);

  const { data: order, isLoading } = useQuery<Order>({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getById(id!).then((r) => r.data),
    enabled: !!id,
  });

  const handleConfirmDelivery = async () => {
    if (!confirm('Confirm delivery and release payment to supplier?')) return;
    try {
      await ordersApi.confirmDelivery(id!);
      qc.invalidateQueries({ queryKey: ['order', id] });
      toast.success('Delivery confirmed! Payment released to supplier.');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? t('common.error');
      toast.error(msg);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6" />
        <div className="card p-6 space-y-4">
          <div className="h-6 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!order) {
    return <div className="text-center py-20 text-gray-500">Order not found.</div>;
  }

  const isBuyer = user?.id === order.buyerId;
  const isSupplier = user?.id === order.supplierId;
  const hasReviewed = (order.reviews ?? []).some((r) => r.reviewerId === user?.id);
  const canReview = order.status === 'DELIVERED' && !hasReviewed && !reviewDone;
  const targetUserId = isBuyer ? order.supplierId : order.buyerId;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="text-sm text-brand-600 hover:underline">
          ← {t('common.back')}
        </button>
        <h1 className="text-xl font-bold text-gray-900">{t('order.details')}</h1>
      </div>

      {/* Status timeline */}
      <div className="card p-6 mb-5">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-5">
          {t('order.statusTimeline')}
        </h2>
        <OrderStatusTimeline status={order.status} />
      </div>

      {/* Order info */}
      <div className="card p-6 mb-5 space-y-4">
        {/* Listing preview */}
        {order.listing && (
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            {(order.listing.images ?? [])[0] ? (
              <img
                src={order.listing.images![0]}
                alt={order.listing.title}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0" />
            )}
            <div>
              <Link to={`/listings/${order.listingId}`} className="font-semibold text-gray-900 hover:text-brand-600">
                {order.listing.title}
              </Link>
              {order.listing.materialType && (
                <div className="mt-1">
                  <MaterialBadge type={order.listing.materialType} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Details grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-gray-500">{t('order.quantity')}</div>
            <div className="font-semibold text-gray-900">{order.quantityKg} kg</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">{t('order.total')}</div>
            <div className="font-semibold text-gray-900">${order.totalPriceUsd.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">{t('order.created')}</div>
            <div className="font-semibold text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">{t('order.status')}</div>
            <div className="font-semibold text-gray-900">{order.status}</div>
          </div>
        </div>

        {/* Parties */}
        <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
          {[
            { label: 'Buyer', person: order.buyer },
            { label: 'Supplier', person: order.supplier },
          ].map(({ label, person }) => (
            <div key={label}>
              <div className="text-xs text-gray-500 mb-1">{label}</div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-sm font-bold overflow-hidden">
                  {person?.avatarUrl ? (
                    <img src={person.avatarUrl} alt={person.name} className="w-full h-full object-cover" />
                  ) : (
                    (person?.name ?? '?')[0].toUpperCase()
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{person?.name}</p>
                  {person?.country && <p className="text-xs text-gray-400">{person.country}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mb-5">
        {isBuyer && order.status === 'SHIPPED' && (
          <button onClick={handleConfirmDelivery} className="btn-primary">
            ✅ {t('order.confirmDelivery')}
          </button>
        )}
        {order.buyer && (
          <Link
            to={`/messages/${isBuyer ? order.supplierId : order.buyerId}`}
            className="btn-secondary"
          >
            💬 Message {isBuyer ? order.supplier?.name : order.buyer?.name}
          </Link>
        )}
      </div>

      {/* Leave review */}
      {canReview && (
        <ReviewForm
          orderId={order.id}
          targetUserId={targetUserId}
          onSuccess={() => {
            setReviewDone(true);
            qc.invalidateQueries({ queryKey: ['order', id] });
          }}
        />
      )}

      {hasReviewed && (
        <div className="card p-4 bg-brand-50 border-brand-100 text-sm text-brand-700 flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {t('review.success')}
        </div>
      )}
    </div>
  );
}
