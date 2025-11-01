import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/auth.context.jsx';
import HeaderLogin from '../../components/header/HeaderLogin.jsx';
import HeaderDemo from '../../components/header/HeaderDemo.jsx';
import { getActiveSubscriptionPlans, createPaymentLinkApi } from '../../lib/api.js';
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Dumbbell,
  Layers,
  Sparkles,
  Smartphone,
  UtensilsCrossed,
} from 'lucide-react';

const PLAN_BENEFITS = [
  'Truy cập thư viện bài tập 3D đầy đủ.',
  'AI Fitnexus xây dựng kế hoạch luyện tập riêng.',
  'Theo dõi chi tiết buổi tập và tiến độ cơ thể.',
  'Sử dụng Nutrition AI để gợi ý bữa ăn lành mạnh.',
];

const FITNEXUS_FEATURES = [
  {
    icon: Activity,
    title: 'Kế hoạch tập luyện thích ứng',
    description: 'AI Fitnexus tính toán chương trình dựa trên mục tiêu và lịch sinh hoạt của bạn.',
  },
  {
    icon: Sparkles,
    title: 'Hướng dẫn AI ATP Coach',
    description: 'Nhận gợi ý thông minh, điều chỉnh độ khó một cách tự động theo tiến độ.',
  },
  {
    icon: Layers,
    title: 'Mô hình 3D cơ bắp',
    description: 'Quan sát chính xác nhóm cơ đang hoạt động và tư thế hỗ trợ kỹ thuật tập luyện.',
  },
  {
    icon: BarChart3,
    title: 'Theo dõi số liệu realtime',
    description: 'Báo cáo chi tiết số calo, thời gian tập và sự tiến bộ theo tuần.',
  },
  {
    icon: UtensilsCrossed,
    title: 'Nutrition AI đồng hành',
    description: 'Lập thực đơn phù hợp mục tiêu giảm mỡ hay tăng cơ chỉ trong vài giây.',
  },
  {
    icon: Smartphone,
    title: 'Đồng bộ đa thiết bị',
    description: 'Luyện tập linh hoạt trên web, mobile, tablet và đồng bộ kế hoạch mỗi lúc.',
  },
  {
    icon: Dumbbell,
    title: 'Thử thách và sự kiện Fitness',
    description: 'Mở khóa các sự kiện tập trung, leaderboard và huấn luyện viên trực tuyến.',
  },
];

const formatPrice = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return `${value || 0} VND`;
  return `${num.toLocaleString('vi-VN')} VND`;
};

const calcDailyPrice = (price, durationDays) => {
  const amount = Number(price);
  const days = Number(durationDays);
  if (!amount || !days || Number.isNaN(amount) || Number.isNaN(days)) return null;
  return Math.round(amount / days);
};

export default function Pricing() {
  const { user, loading } = useAuth();
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const isAuthenticated = !!user;
  const currentYear = new Date().getFullYear();

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

  const recommendedPlanId = useMemo(() => {
    if (!plans.length) return null;
    const best = plans.reduce((acc, plan) => {
      if (!acc) return plan;
      const durationAcc = Number(acc.duration_days || 0);
      const durationPlan = Number(plan.duration_days || 0);
      if (durationPlan > durationAcc) return plan;
      if (durationPlan === durationAcc) {
        const priceAcc = Number(acc.price || 0);
        const pricePlan = Number(plan.price || 0);
        return pricePlan < priceAcc ? plan : acc;
      }
      return acc;
    }, null);
    return best?.plan_id ?? null;
  }, [plans]);

  const handlePurchase = async (planId) => {
    try {
      setBusy(true);
      const res = await createPaymentLinkApi(planId);
      const url = res?.data?.checkoutUrl;
      if (!url) throw new Error('Thiếu checkoutUrl từ PayOS');
      window.location.href = url;
    } catch (e) {
      setError(e?.response?.data || { message: e.message });
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-slate-600">
        Đang tải...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      {isAuthenticated ? <HeaderLogin /> : <HeaderDemo />}

      <main className="flex-1 bg-slate-50">
        <section className="px-4 pt-24 pb-16">
          <div className="mx-auto flex max-w-5xl flex-col gap-4 text-center">
            <span className="inline-flex items-center gap-2 self-center rounded-full bg-indigo-100 px-4 py-1 text-sm font-medium text-indigo-700">
              <Sparkles className="h-4 w-4" /> Trải nghiệm Fitnexus Premium
            </span>
            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Khám phá Fitnexus Premium – nơi kế hoạch tập luyện, các bài tập yêu thích và dữ liệu tiến độ của bạn được đồng bộ hóa để mang đến một trải nghiệm tập luyện mượt mà và hiệu quả hơn bao giờ hết.
            </h1>
            <p className="mx-auto max-w-3xl text-base text-slate-600">
              Fitnexus Premium hỗ trợ AI Coach, mô hình 3D, kế hoạch cá nhân và báo cáo tiến độ chi tiết giúp bạn giữ động lực và đạt mục tiêu nhanh hơn.
            </p>
            {!isAuthenticated && (
              <p className="text-sm text-slate-500">
                Đăng nhập hoặc tạo tài khoản để mua gói Premium và bắt đầu đồng bộ Spotify ngay hôm nay.
              </p>
            )}
          </div>

          <div className="mx-auto mt-10 max-w-6xl">
            {error ? (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error.message || 'Đã xảy ra lỗi, vui lòng thử lại sau.'}
              </div>
            ) : null}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan) => {
                const isRecommended = recommendedPlanId === plan.plan_id;
                const perDay = calcDailyPrice(plan.price, plan.duration_days);
                return (
                  <article
                    key={plan.plan_id}
                    className={`flex h-full flex-col rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
                      isRecommended ? 'border-indigo-400 shadow-indigo-200' : 'border-slate-200'
                    }`}
                  >
                    {isRecommended && (
                      <span className="mb-4 inline-flex w-fit items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold uppercase text-indigo-700">
                        Phổ biến nhất
                      </span>
                    )}

                    <header className="flex flex-col gap-1">
                      <h3 className="text-xl font-semibold text-slate-900">{plan.name}</h3>
                      <div className="text-3xl font-bold text-indigo-600">{formatPrice(plan.price)}</div>
                      <p className="text-sm text-slate-500">Chu kỳ {plan.duration_days} ngày</p>
                      {perDay ? (
                        <p className="text-xs text-slate-400">Khoảng {perDay.toLocaleString('vi-VN')} VND/ngày</p>
                      ) : null}
                    </header>

                    <ul className="mt-6 flex flex-1 flex-col gap-3 text-sm text-slate-600">
                      {PLAN_BENEFITS.slice(0, 4).map((benefit) => (
                        <li key={`${plan.plan_id}-${benefit}`} className="flex items-start gap-3">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 text-indigo-500" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      className="mt-8 w-full rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={busy || !isAuthenticated}
                      onClick={() => handlePurchase(plan.plan_id)}
                    >
                      {isAuthenticated ? (busy ? 'Đang xử lý...' : 'Thanh toán và nâng cấp') : 'Đăng nhập để mua'}
                    </button>
                    <p className="mt-3 text-xs text-slate-400">
                      Spotify Premium sẽ được kích hoạt với tài khoản Fitnexus của bạn ngay sau khi thanh toán thành công.
                    </p>
                  </article>
                );
              })}

              {!plans.length && !error && (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
                  Hiện chưa có gói Premium nào khả dụng. Vui lòng quay lại sau.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mb-10 max-w-3xl">
              <h2 className="text-2xl font-semibold text-slate-900">Spotify Premium tích hợp giúp bạn tập tốt hơn</h2>
              <p className="mt-3 text-base text-slate-600">
                Tổng hợp những tính năng chỉ có ở gói Premium của Fitnexus. Mỗi mục được đồng bộ với các module sẵn có trong dự án: AI Trainer, Nutrition AI, Onboarding và thống kê tiến độ.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {FITNEXUS_FEATURES.map(({ icon: Icon, title, description }) => (
                <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <span>&copy; {currentYear} Fitnexus. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <a href="/support/faq" className="transition hover:text-slate-700">Hỗ trợ</a>
            <a href="/nutrition-ai" className="transition hover:text-slate-700">Nutrition AI</a>
            <a href="/modeling-demo" className="transition hover:text-slate-700">Modeling 3D</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
