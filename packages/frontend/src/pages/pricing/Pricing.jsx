import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/auth.context.jsx';
import { getActiveSubscriptionPlans, createPaymentLinkApi } from '../../lib/api.js';

export default function Pricing() {
  const { user, loading } = useAuth();
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await getActiveSubscriptionPlans();
        setPlans(res?.data || []);
      } catch (e) {
        setError(e?.response?.data || { message: e.message });
      }
    })();
  }, []);

  const handlePurchase = async (planId) => {
    try {
      setBusy(true);
      const res = await createPaymentLinkApi(planId);
      const url = res?.data?.checkoutUrl;
      if (url) window.location.href = url;
    } catch (e) {
      setError(e?.response?.data || { message: e.message });
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-5xl px-4 py-10 mx-auto">
      <h1 className="mb-2 text-3xl font-bold">Pricing</h1>
      <p className="mb-6 text-gray-600">Choose a plan that fits your needs.</p>

      {error ? (
        <div className="p-4 mb-6 text-sm text-red-800 bg-red-100 border border-red-200 rounded">{error.message || 'Error'}</div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((p) => (
          <div key={p.plan_id} className="p-6 bg-white border rounded shadow-sm">
            <h3 className="text-xl font-semibold">{p.name}</h3>
            <div className="mt-2 text-2xl font-bold">{(p.price || 0).toLocaleString()} VND</div>
            <div className="mt-1 text-sm text-gray-500">{p.duration_days} days</div>
            <button
              className="w-full px-4 py-2 mt-4 text-white bg-indigo-600 rounded hover:bg-indigo-700 disabled:opacity-50"
              disabled={busy || !user}
              onClick={() => handlePurchase(p.plan_id)}
            >
              {user ? (busy ? 'Processing...' : 'Purchase') : 'Login to Purchase'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

