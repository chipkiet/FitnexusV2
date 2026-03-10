import React, { useEffect, useState } from "react";
import HeaderLogin from "../../components/header/HeaderLogin.jsx";
import { listUserScreenshotsApi } from "../../lib/api.js";

const featureOptions = [
  { value: "all", label: "Tất cả" },
  { value: "ai_trainer", label: "AI Trainer" },
  { value: "nutrition_ai", label: "Nutrition AI" },
];

const featureLabel = (value) => {
  const found = featureOptions.find((f) => f.value === value);
  return found?.label || value || "Khác";
};

const formatTime = (iso) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("vi-VN");
  } catch {
    return iso;
  }
};

export default function ScreenshotLibrary() {
  const [feature, setFeature] = useState("all");
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeItem, setActiveItem] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await listUserScreenshotsApi({ feature, page, limit });
        const data = res?.data || {};
        if (cancelled) return;
        setItems(Array.isArray(data.items) ? data.items : []);
        setTotal(Number(data.pagination?.total) || 0);
      } catch (e) {
        if (cancelled) return;
        const msg =
          e?.response?.data?.message || e?.message || "Không thể tải danh sách ảnh.";
        setError(msg);
        setItems([]);
        setTotal(0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [feature, page, limit]);

  useEffect(() => {
    console.log("Screenshot items:", items);
  }, [items]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const handleChangeFeature = (value) => {
    setFeature(value);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderLogin />
      <main className="max-w-6xl px-4 py-8 mx-auto">
        <header className="flex flex-col items-start justify-between gap-3 pb-6 border-b border-gray-200 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Thư viện ảnh AI
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Lưu lại những khoảnh khắc quan trọng từ AI Trainer và Nutrition
              AI.
            </p>
          </div>
          <div className="inline-flex p-1 text-xs bg-gray-100 rounded-full">
            {featureOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleChangeFeature(opt.value)}
                className={`px-3 py-1 rounded-full font-medium transition ${
                  feature === opt.value
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </header>

        {error && (
          <div className="px-4 py-3 mt-6 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">
            {error}
          </div>
        )}

        <section className="mt-6">
          {loading && (
            <div className="flex justify-center py-10">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="w-4 h-4 border-2 border-gray-300 rounded-full border-t-blue-500 animate-spin" />
                Đang tải ảnh...
              </div>
            </div>
          )}

          {!loading && !items.length && !error && (
            <div className="py-10 text-sm text-center text-gray-500">
              Chưa có ảnh nào được lưu. Hãy thử chụp từ AI Trainer hoặc
              Nutrition AI.
            </div>
          )}

          {!loading && items.length > 0 && (
            <>
              <div className="grid grid-cols-1 gap-4 mt-2 sm:grid-cols-2 md:grid-cols-3">
                {items.map((item) => {
                  const src = item.image_url || item.imageUrl;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className="overflow-hidden text-left transition bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-blue-300"
                      onClick={() => setActiveItem(item)}
                    >
                      {/* THAY cả div relative cũ bằng đoạn này */}
                      <div className="bg-gray-100">
                        {src ? (
                          <img
                            src={src}
                            alt={item.description || item.feature}
                            className="block w-full h-auto"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-40 text-xs text-gray-400">
                            Không có ảnh
                          </div>
                        )}
                      </div>

                      <div className="p-3 space-y-1">
                        <div className="text-[10px] font-semibold text-gray-500 uppercase">
                          {featureLabel(item.feature)}
                        </div>
                        {item.description && (
                          <p className="text-xs text-gray-800 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                        <p className="text-[11px] text-gray-500">
                          {formatTime(item.created_at)}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between mt-6 text-xs text-gray-600">
                <span>
                  Trang {page} / {totalPages} • Tổng {total} ảnh
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page <= 1 || loading}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className={`px-3 py-1.5 rounded-lg border text-xs ${
                      page <= 1 || loading
                        ? "border-gray-200 text-gray-400"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    Trang trước
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages || loading}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className={`px-3 py-1.5 rounded-lg border text-xs ${
                      page >= totalPages || loading
                        ? "border-gray-200 text-gray-400"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    Trang sau
                  </button>
                </div>
              </div>
            </>
          )}
        </section>

        {activeItem && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70"
            onClick={() => setActiveItem(null)}
          >
            <div
              className="max-w-4xl max-h-[90vh] p-4 mx-4 bg-white rounded-2xl shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase">
                    {featureLabel(activeItem.feature)}
                  </div>
                  {activeItem.description && (
                    <div className="mt-1 text-sm text-gray-800">
                      {activeItem.description}
                    </div>
                  )}
                  <div className="mt-1 text-xs text-gray-500">
                    {formatTime(activeItem.created_at)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveItem(null)}
                  className="inline-flex items-center justify-center w-8 h-8 text-gray-500 transition bg-gray-100 rounded-full hover:bg-gray-200"
                  aria-label="Đóng"
                >
                  ×
                </button>
              </div>
              <div className="relative max-h-[70vh] overflow-auto rounded-xl bg-gray-100">
                {activeItem.image_url ? (
                  <img
                    src={activeItem.image_url}
                    alt={activeItem.description || activeItem.feature}
                    className="block max-w-full mx-auto"
                  />
                ) : (
                  <div className="flex items-center justify-center h-64 text-sm text-gray-400">
                    Không có ảnh
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
