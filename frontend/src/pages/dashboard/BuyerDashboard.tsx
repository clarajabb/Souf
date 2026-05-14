import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ordersApi, samplesApi } from '../../api/client';
import { Order, SampleRequest } from '../../types';
import OrderStatusTimeline from '../../components/OrderStatusTimeline';

const STATUS_COLORS: Record<string, string> = {
  PENDING:   'bg-stone-100 text-stone-600',
  PAID:      'bg-brand-50 text-brand-700',
  SHIPPED:   'bg-brand-100 text-brand-800',
  DELIVERED: 'bg-brand-500 text-white',
  DISPUTED:  'bg-gray-900 text-white',
  CANCELLED: 'bg-red-50 text-red-700',
  PENDING_S: 'bg-stone-100 text-stone-600',
  ACCEPTED:  'bg-brand-50 text-brand-700',
  RECEIVED:  'bg-brand-500 text-white',
};

export default function BuyerDashboard() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<'orders' | 'samples'>('orders');

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ['buyer-orders'],
    queryFn: () => ordersApi.getAll().then((r) => r.data),
  });

  const { data: samples = [] } = useQuery<SampleRequest[]>({
    queryKey: ['buyer-samples'],
    queryFn: () => samplesApi.getAll().then((r) => r.data),
  });

  const activeOrders = orders.filter((o) => !['DELIVERED', 'CANCELLED'].includes(o.status)).length;

  const tabs = [
    { id: 'orders', label: t('dashboard.buyer.myOrders'), count: orders.length },
    { id: 'samples', label: t('dashboard.buyer.mySamples'), count: samples.length },
  ] as const;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.buyer.title')}</h1>
        <Link to="/messages" className="btn-secondary text-sm">{t('nav.messages')}</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total orders', value: orders.length },
          { label: 'Active', value: activeOrders },
          { label: 'Sample requests', value: samples.length },
        ].map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <div className="text-xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6">
        {tabs.map((t_) => (
          <button
            key={t_.id}
            onClick={() => setTab(t_.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-md transition-colors ${
              tab === t_.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t_.label}
            {t_.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                tab === t_.id ? 'bg-brand-100 text-brand-700' : 'bg-gray-200 text-gray-500'
              }`}>
                {t_.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders */}
      {tab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No orders yet.</p>
              <Link to="/listings" className="btn-primary text-sm mt-4 inline-block">
                Browse materials
              </Link>
            </div>
          ) : (
            orders.map((o) => (
              <Link key={o.id} to={`/orders/${o.id}`} className="card p-5 block hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-4">
                  {o.listing?.images?.[0] ? (
                    <img src={o.listing.images[0]} alt={o.listing.title} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-gray-100 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-medium text-sm text-gray-900">{o.listing?.title ?? 'Order'}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[o.status]}`}>
                        {o.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {o.quantityKg} kg · ${o.totalPriceUsd.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400">
                      Supplier: {o.supplier?.name} · {new Date(o.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <OrderStatusTimeline status={o.status} />
              </Link>
            ))
          )}
        </div>
      )}

      {/* Samples */}
      {tab === 'samples' && (
        <div className="space-y-3">
          {samples.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No sample requests sent yet.</p>
              <Link to="/listings" className="btn-primary text-sm mt-4 inline-block">
                Browse materials
              </Link>
            </div>
          ) : (
            samples.map((s) => (
              <div key={s.id} className="card p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <Link to={`/listings/${s.listingId}`} className="font-medium text-sm text-gray-900 hover:text-brand-600">
                    {s.listing?.title ?? 'Sample request'}
                  </Link>
                  {s.listing?.samplePriceUsd && (
                    <p className="text-xs text-gray-500">${s.listing.samplePriceUsd} sample fee</p>
                  )}
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${
                  STATUS_COLORS[s.status === 'PENDING' ? 'PENDING_S' : s.status] ?? 'bg-gray-50 text-gray-500'
                }`}>
                  {s.status}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
