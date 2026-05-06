import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { listingsApi, ordersApi, samplesApi } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Listing, Order, SampleRequest, MaterialType } from '../../types';
import MaterialBadge from '../../components/MaterialBadge';

const MATERIALS: MaterialType[] = ['WOOL', 'COTTON', 'LINEN', 'SILK', 'LEATHER', 'CASHMERE', 'ALPACA', 'OTHER'];

const STATUS_COLORS: Record<string, string> = {
  PENDING:   'bg-stone-100 text-stone-600',
  PAID:      'bg-brand-50 text-brand-700',
  SHIPPED:   'bg-brand-100 text-brand-800',
  DELIVERED: 'bg-brand-500 text-white',
  DISPUTED:  'bg-gray-900 text-white',
  CANCELLED: 'bg-red-50 text-red-700',
  ACTIVE:    'bg-brand-50 text-brand-700',
  PAUSED:    'bg-gray-100 text-gray-500',
  SOLD_OUT:  'bg-gray-900 text-white',
};

function NewListingForm({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    title: '', materialType: 'WOOL', description: '',
    pricePerKg: '', minimumOrderKg: '', availableKg: '',
    allowSamples: false, samplePriceUsd: '',
  });
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await listingsApi.create(form);
      toast.success('Listing created!');
      onSuccess();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Title</label>
        <input type="text" required value={form.title} onChange={(e) => set('title', e.target.value)} className="input" placeholder="e.g. Baby Alpaca Fleece — Natural White" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Material</label>
          <select value={form.materialType} onChange={(e) => set('materialType', e.target.value)} className="input">
            {MATERIALS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Price / kg (USD)</label>
          <input type="number" min="0.01" step="0.01" required value={form.pricePerKg} onChange={(e) => set('pricePerKg', e.target.value)} className="input" placeholder="0.00" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Min order (kg)</label>
          <input type="number" min="0.1" step="0.1" required value={form.minimumOrderKg} onChange={(e) => set('minimumOrderKg', e.target.value)} className="input" />
        </div>
        <div>
          <label className="label">Available (kg)</label>
          <input type="number" min="0.1" step="0.1" required value={form.availableKg} onChange={(e) => set('availableKg', e.target.value)} className="input" />
        </div>
      </div>

      <div>
        <label className="label">Description</label>
        <textarea required rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} className="input" placeholder="Describe your material in detail..." />
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input type="checkbox" checked={form.allowSamples} onChange={(e) => set('allowSamples', e.target.checked)} className="rounded text-brand-600" />
          Allow sample requests
        </label>
        {form.allowSamples && (
          <div className="flex-1">
            <input type="number" min="0" step="0.01" value={form.samplePriceUsd} onChange={(e) => set('samplePriceUsd', e.target.value)} className="input" placeholder="Sample price USD" />
          </div>
        )}
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? t('common.loading') : 'Create Listing'}
      </button>
    </form>
  );
}

export default function SupplierDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState<'listings' | 'orders' | 'samples'>('listings');
  const [showNewForm, setShowNewForm] = useState(false);

  const { data: listings = [] } = useQuery<Listing[]>({
    queryKey: ['my-listings'],
    queryFn: async () => {
      const res = await listingsApi.getAll({ limit: 50 });
      return (res.data.listings as Listing[]).filter((l: Listing) => l.supplierId === user?.id);
    },
    enabled: !!user,
  });

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ['my-orders'],
    queryFn: () => ordersApi.getAll().then((r) => r.data),
    enabled: !!user,
  });

  const { data: samples = [] } = useQuery<SampleRequest[]>({
    queryKey: ['my-samples'],
    queryFn: () => samplesApi.getAll().then((r) => r.data),
    enabled: !!user,
  });

  const handleMarkShipped = async (orderId: string) => {
    try {
      await ordersApi.updateStatus(orderId, 'SHIPPED');
      qc.invalidateQueries({ queryKey: ['my-orders'] });
      toast.success('Order marked as shipped!');
    } catch {
      toast.error('Failed to update order');
    }
  };

  const handleSampleStatus = async (sampleId: string, status: string) => {
    try {
      await samplesApi.updateStatus(sampleId, status);
      qc.invalidateQueries({ queryKey: ['my-samples'] });
      toast.success(`Sample ${status.toLowerCase()}`);
    } catch {
      toast.error('Failed to update sample');
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (!confirm('Delete this listing?')) return;
    try {
      await listingsApi.delete(id);
      qc.invalidateQueries({ queryKey: ['my-listings'] });
      toast.success('Listing deleted');
    } catch {
      toast.error('Failed to delete listing');
    }
  };

  const totalEarnings = orders
    .filter((o) => o.status === 'DELIVERED')
    .reduce((sum, o) => sum + o.totalPriceUsd, 0);

  const pendingEarnings = orders
    .filter((o) => ['PAID', 'SHIPPED'].includes(o.status))
    .reduce((sum, o) => sum + o.totalPriceUsd, 0);

  const tabs = [
    { id: 'listings', label: t('dashboard.supplier.myListings'), count: listings.length },
    { id: 'orders', label: t('dashboard.supplier.incomingOrders'), count: orders.length },
    { id: 'samples', label: t('dashboard.supplier.sampleRequests'), count: samples.length },
  ] as const;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.supplier.title')}</h1>
        <Link to="/messages" className="btn-secondary text-sm">💬 {t('nav.messages')}</Link>
      </div>

      {/* Earnings */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: t('dashboard.supplier.totalPaid'), value: `$${totalEarnings.toFixed(0)}`, icon: '💰' },
          { label: t('dashboard.supplier.pending'), value: `$${pendingEarnings.toFixed(0)}`, icon: '⏳' },
          { label: 'Active listings', value: listings.filter((l) => l.status === 'ACTIVE').length, icon: '📋' },
          { label: 'Total orders', value: orders.length, icon: '📦' },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <div className="text-2xl mb-1">{s.icon}</div>
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
            onClick={() => { setTab(t_.id); setShowNewForm(false); }}
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

      {/* Listings tab */}
      {tab === 'listings' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowNewForm(!showNewForm)} className="btn-primary text-sm">
              + {t('dashboard.supplier.newListing')}
            </button>
          </div>

          {showNewForm && (
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">New Listing</h3>
              <NewListingForm onSuccess={() => { setShowNewForm(false); qc.invalidateQueries({ queryKey: ['my-listings'] }); }} />
            </div>
          )}

          {listings.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-3">📋</div>
              <p>No listings yet. Create your first listing!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {listings.map((l) => (
                <div key={l.id} className="card p-4 flex items-center gap-4">
                  {l.images?.[0] ? (
                    <img src={l.images[0]} alt={l.title} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-300">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-medium text-sm text-gray-900 truncate">{l.title}</p>
                      <MaterialBadge type={l.materialType} />
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[l.status]}`}>
                        {l.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      ${l.pricePerKg}/kg · {l.availableKg} kg available · MOQ {l.minimumOrderKg} kg
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link to={`/listings/${l.id}`} className="btn-secondary text-xs py-1.5">View</Link>
                    <button onClick={() => handleDeleteListing(l.id)} className="text-red-400 hover:text-red-600 text-xs transition-colors">
                      {t('common.delete')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Orders tab */}
      {tab === 'orders' && (
        <div className="space-y-3">
          {orders.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-3">📦</div>
              <p>No orders yet.</p>
            </div>
          ) : (
            orders.map((o) => (
              <div key={o.id} className="card p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-medium text-sm text-gray-900">{o.listing?.title ?? 'Order'}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[o.status]}`}>
                      {o.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Buyer: {o.buyer?.name} · {o.quantityKg} kg · ${o.totalPriceUsd.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link to={`/orders/${o.id}`} className="btn-secondary text-xs py-1.5">Details</Link>
                  {o.status === 'PAID' && (
                    <button onClick={() => handleMarkShipped(o.id)} className="btn-primary text-xs py-1.5">
                      {t('order.markShipped')}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Samples tab */}
      {tab === 'samples' && (
        <div className="space-y-3">
          {samples.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-3">🧪</div>
              <p>No sample requests yet.</p>
            </div>
          ) : (
            samples.map((s) => (
              <div key={s.id} className="card p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900">{s.listing?.title}</p>
                  <p className="text-xs text-gray-500">From: {s.buyer?.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${STATUS_COLORS[s.status] ?? 'bg-gray-50 text-gray-500'}`}>
                    {s.status}
                  </span>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {s.status === 'PENDING' && (
                    <button onClick={() => handleSampleStatus(s.id, 'ACCEPTED')} className="btn-primary text-xs py-1.5">
                      Accept
                    </button>
                  )}
                  {s.status === 'ACCEPTED' && (
                    <button onClick={() => handleSampleStatus(s.id, 'SHIPPED')} className="btn-primary text-xs py-1.5">
                      Mark Shipped
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
