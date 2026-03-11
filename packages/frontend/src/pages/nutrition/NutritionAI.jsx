import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, ImagePlus, Leaf, Loader2, Scale, UtensilsCrossed, ChevronRight } from "lucide-react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import * as mobilenet from "@tensorflow-models/mobilenet";
import "./NutritionAI.css";
import { useAuth } from "../../context/auth.context.jsx";
import HeaderLogin from "../../components/header/HeaderLogin.jsx";

import ScreenshotCapture from "../../components/screenshot/ScreenshotCapture.jsx";
import TrackpadScale from "@/components/TrackpadScale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function centerCropToSquare(imgEl, size = 224) {
  const s = Math.min(imgEl.naturalWidth, imgEl.naturalHeight);
  const sx = Math.floor((imgEl.naturalWidth - s) / 2);
  const sy = Math.floor((imgEl.naturalHeight - s) / 2);
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  ctx.drawImage(imgEl, sx, sy, s, s, 0, 0, size, size);
  return c;
}

function norm(s) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_");
}

export default function FoodCalorie() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAuthenticated = !!user;
  const [ready, setReady] = useState(false);
  const [labels, setLabels] = useState([]);
  const [calo, setCalo] = useState({});
  const [portion, setPortion] = useState({});
  const [macrosMap, setMacrosMap] = useState({});
  const [result, setResult] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const gramsRef = useRef();
  const sizeRef = useRef();
  const fileRef = useRef();
  const containerRef = useRef(null);

  const models = useMemo(() => ({ net: null, clf: null }), []);

  const setMacrosWithNormalization = (macros) => {
    const map = {};
    if (Array.isArray(macros)) {
      for (const item of macros) {
        const k1 = item?.key || (item?.name ? norm(item.name) : null);
        if (item?.name) map[item.name] = item;
        if (k1) {
          map[k1] = item;
          map[norm(k1)] = item;
        }
      }
    } else {
      for (const [k, v] of Object.entries(macros || {})) {
        map[k] = v;
        map[norm(k)] = v;
      }
    }
    setMacrosMap(map);
  };

  useEffect(() => {
    (async () => {
      try {
        try {
          await tf.setBackend("webgl");
        } catch (_) {
          await tf.setBackend("cpu");
        }
        await tf.ready();

        const tryLocalMobileNet = async () => {
          const candidates = [
            "/model/mobilenet/model.json",
            "/model/mobilenet_v2/model.json",
            "/model/mobilenet_v2_1.0_224/model.json",
            "/model/mobilenet_v2_100_224/model.json",
            "/model/mobilenet_v2_1.0_224/classification/2/model.json",
            "/model/mobilenet_v2_100_224/classification/2/model.json",
          ];
          for (const url of candidates) {
            try {
              const res = await fetch(url, { method: "GET", cache: "no-store" });
              if (res.ok) {
                return await mobilenet.load({ version: 2, alpha: 1.0, modelUrl: url });
              }
            } catch (_) { /* try next */ }
          }
          return await mobilenet.load({ version: 2, alpha: 1.0 });
        };

        const net = await tryLocalMobileNet();
        const clf = await tf.loadLayersModel("/model/classifier/model.json");
        const lbs = await (await fetch("/model/labels.json")).json();
        const cal = await (await fetch("/tables/calorie_table.json")).json();
        const por = await (await fetch("/tables/portion_defaults.json")).json();
        let macros = {};
        try {
          const r = await fetch("/tables/macros_table.json", { cache: "no-store" });
          if (r.ok) macros = await r.json();
        } catch { }
        models.net = net;
        models.clf = clf;
        setLabels(lbs);
        setCalo(cal);
        setPortion(por?.default_portions || por || {});
        setMacrosWithNormalization(macros || {});
        setReady(true);
        setError("");
      } catch (e) {
        console.error(e);
        setError("Không thể tải mô hình. Kiểm tra /public/model và /public/tables.");
        setReady(false);
      }
    })();
    return () => { try { models.clf?.dispose(); } catch { } };
  }, [models]);

  function computePortionGrams(key, userGrams, size) {
    const baseFromMacros = macrosMap[key]?.serving_g ? Number(macrosMap[key].serving_g) : null;
    const base = portion[key] ?? baseFromMacros ?? 250;
    if (userGrams && userGrams > 0) return userGrams;
    if (size === "s") return Math.round(base * 0.7);
    if (size === "l") return Math.round(base * 1.3);
    return base;
  }

  function computeMacros(key, grams) {
    const entry = macrosMap[key] || null;
    if (!entry) return null;
    const src = entry?.per_100g && typeof entry.per_100g === "object" ? entry.per_100g : entry;
    const canon = (k) => {
      const s = String(k || "").toLowerCase();
      const base = s.replace(/_(g|mg)$/, "");
      if (["protein", "proteins", "prot"].includes(base)) return "protein";
      if (["carb", "carbs", "carbohydrate", "carbohydrates"].includes(base)) return "carbs";
      if (["fat", "fats"].includes(base)) return "fat";
      if (["alcohol"].includes(base)) return "alcohol";
      if (["sugar", "sugars"].includes(base)) return "sugar";
      if (["fiber", "fibre"].includes(base)) return "fiber";
      if (["sodium", "salt"].includes(base)) return "sodium";
      if (["kcal", "calories", "energy"].includes(base)) return base;
      return base;
    };
    const detectUnit = (k) => {
      const s = String(k || "").toLowerCase();
      if (/_mg$/.test(s)) return "mg";
      if (/_g$/.test(s)) return "g";
      if (["kcal", "calories", "energy"].includes(s.replace(/_(g|mg)$/, ""))) return "kcal";
      return "g";
    };
    const niceName = (id) => {
      const map = { protein: "Protein", carbs: "Carb", fat: "Fat", alcohol: "Alcohol", sugar: "Sugar", fiber: "Fiber", sodium: "Sodium", kcal: "Calories", calories: "Calories", energy: "Energy" };
      const s = String(id || "");
      return map[s] || s.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
    };
    const per100By = {};
    const amountBy = {};
    const details = [];
    for (const [k, v] of Object.entries(src)) {
      const id = canon(k);
      const unit = detectUnit(k);
      const per100 = Number(v) || 0;
      per100By[id] = per100;
      const value = unit === "mg" ? Math.round((per100 * grams) / 100) : +((per100 * grams) / 100).toFixed(1);
      details.push({ id, name: niceName(id), value, unit });
      if ((id === "protein" || id === "carbs" || id === "fat" || id === "alcohol") && unit === "g") {
        amountBy[id] = value;
      }
    }
    const pG = amountBy.protein || 0, cG = amountBy.carbs || 0, fG = amountBy.fat || 0, aG = amountBy.alcohol || 0;
    const pKcal = pG * 4, cKcal = cG * 4, fKcal = fG * 9, aKcal = aG * 7;
    const kcalFromMacros = pKcal + cKcal + fKcal + aKcal;
    const kcal100Field = per100By.kcal ?? per100By.calories ?? per100By.energy ?? null;
    const kcal100FromMacros = per100By.protein || per100By.carbs || per100By.fat || per100By.alcohol
      ? (per100By.protein || 0) * 4 + (per100By.carbs || 0) * 4 + (per100By.fat || 0) * 9 + (per100By.alcohol || 0) * 7
      : null;
    const kcal100Effective = Number.isFinite(kcal100Field) ? kcal100Field : Number.isFinite(kcal100FromMacros) ? Math.round(kcal100FromMacros) : null;
    const pct = kcalFromMacros > 0
      ? { p: +((pKcal / kcalFromMacros) * 100).toFixed(0), c: +((cKcal / kcalFromMacros) * 100).toFixed(0), f: +((fKcal / kcalFromMacros) * 100).toFixed(0), a: +((aKcal / kcalFromMacros) * 100).toFixed(0) }
      : { p: 0, c: 0, f: 0, a: 0 };
    const order = ["protein", "carbs", "fat", "alcohol"];
    details.sort((a, b) => {
      const ia = order.indexOf(a.id), ib = order.indexOf(b.id);
      if (ia !== -1 || ib !== -1) return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
      return a.name.localeCompare(b.name);
    });
    return { grams: { p: pG, c: cG, f: fG, a: aG }, kcal: { p: Math.round(pKcal), c: Math.round(cKcal), f: Math.round(fKcal), a: Math.round(aKcal), total: Math.round(kcalFromMacros) }, pct, details, per100By, kcal100Field, kcal100FromMacros, kcal100Effective };
  }

  function recalcFromControls(cur) {
    if (!cur) return;
    const userGrams = gramsRef.current?.value ? Number(gramsRef.current.value) : null;
    const size = sizeRef.current?.value || "";
    const grams = computePortionGrams(cur.key, userGrams, size);
    const macros = computeMacros(cur.key, grams);
    const kcal100Eff = macros?.kcal100Effective ?? cur.kcal100;
    const total = Math.round(((kcal100Eff || 0) * grams) / 100);
    setResult({ ...cur, grams, total, macros, kcal100: kcal100Eff });
  }

  function showDishInfo(dish, confidence) {
    try {
      const key = calo[dish] != null ? dish : norm(dish);
      const macros0 = computeMacros(key, 100);
      const kcal100 = macros0?.kcal100Effective ?? calo[key] ?? 150;
      const userGrams = gramsRef.current?.value ? Number(gramsRef.current.value) : null;
      const size = sizeRef.current?.value || "";
      const grams = computePortionGrams(key, userGrams, size);
      const total = Math.round((kcal100 * grams) / 100);
      const macros = computeMacros(key, grams);
      setResult((prev) => ({ ...(prev || {}), dish, confidence: confidence ?? prev?.confidence ?? null, key, kcal100, grams, total, macros }));
    } catch { }
  }

  async function onPickFile(e) {
    if (!ready) return;
    if (user?.user_type !== 'premium') {
      const usageKey = 'fitnexus_nutrition_ai_usage';
      const today = new Date().toISOString().split('T')[0];
      let usage = { date: today, count: 0 };
      try {
        const storedUsage = JSON.parse(localStorage.getItem(usageKey));
        if (storedUsage.date === today) usage = storedUsage;
      } catch { }
      if (usage.count >= 3) {
        alert('Bạn đã hết 3 lượt phân tích miễn phí hôm nay. Nâng cấp Premium để dùng không giới hạn.');
        if (fileRef.current) fileRef.current.value = '';
        return;
      }
      usage.count++;
      localStorage.setItem(usageKey, JSON.stringify(usage));
    }
    const f = e.target.files?.[0];
    if (!f) return;
    const img = new Image();
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
    img.src = url;
    await new Promise((r) => (img.onload = () => r()));
    const canvas = centerCropToSquare(img, 224);
    const prediction = tf.tidy(() => {
      const x = tf.browser.fromPixels(canvas);
      const emb = models.net.infer(x.expandDims(0), "global_average");
      const probs = models.clf.predict(emb).dataSync();
      const arr = Array.from(probs);
      const top = arr.map((v, i) => ({ i, v })).sort((a, b) => b.v - a.v).slice(0, 3);
      return { arr, top };
    });
    const top1 = prediction.top[0];
    const dish = labels[top1.i];
    const key = calo[dish] != null ? dish : norm(dish);
    const macros0 = computeMacros(key, 100);
    const kcal100 = macros0?.kcal100Effective ?? calo[key] ?? 150;
    const userGrams = gramsRef.current?.value ? Number(gramsRef.current.value) : null;
    const size = sizeRef.current?.value || "";
    const grams = computePortionGrams(key, userGrams, size);
    const total = Math.round((kcal100 * grams) / 100);
    const macros = computeMacros(key, grams);
    setResult({ dish, confidence: top1.v, top3: prediction.top.map((t) => ({ dish: labels[t.i], confidence: t.v })), grams, kcal100, total, key, macros });
  }

  // ─── Shared nav bar ────────────────────────────────────────────────────────
  const NavBar = () => (
    <div style={{
      display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap',
    }}>
      <button
        onClick={() => fileRef.current?.click()} disabled={!ready}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          padding: '9px 16px', border: 'none', borderRadius: 10,
          background: '#0F172A', color: '#fff', fontSize: 13, fontWeight: 600,
          cursor: ready ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
          opacity: ready ? 1 : 0.5, transition: 'opacity 0.2s',
        }}>
        <ImagePlus size={15} />
        {!ready && !error ? 'Đang tải mô hình…' : 'Phân tích ảnh'}
      </button>

      <button
        onClick={() => navigate('/meal-planner')}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          padding: '9px 16px', border: '1px solid #E2E8F0', borderRadius: 10,
          background: '#fff', color: '#1E293B', fontSize: 13, fontWeight: 600,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
        <UtensilsCrossed size={15} />
        Meal Planner
      </button>

      <button
        onClick={() => navigate('/nutrition-ai/personalize')}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          padding: '9px 16px', border: '1px solid #E2E8F0', borderRadius: 10,
          background: '#fff', color: '#1E293B', fontSize: 13, fontWeight: 600,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
        Cá nhân hoá <ChevronRight size={14} />
      </button>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <HeaderLogin />
      <ScreenshotCapture targetRef={containerRef} feature="nutrition_ai" disabled={!result} description="Ảnh kết quả Nutrition AI" />

      <input ref={fileRef} type="file" accept="image/*" onChange={onPickFile} hidden disabled={!ready} />

      <div ref={containerRef} style={{ flex: 1, maxWidth: 960, margin: '0 auto', padding: '96px 24px 64px', width: '100%' }}>

        {!previewUrl ? (
          <>
            {/* Editorial hero */}
            <div style={{ marginBottom: 56 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#10B981', marginBottom: 14 }}>
                FITNEXUS · AI Nutrition
              </p>
              <h1 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 800, color: '#0F172A', lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 16px', maxWidth: 600 }}>
                Nhận diện món ăn<br />& tính calo tức thì
              </h1>
              <p style={{ fontSize: 15, color: '#64748B', maxWidth: 440, lineHeight: 1.65, margin: '0 0 32px' }}>
                Chụp ảnh bất kỳ món ăn — AI sẽ nhận diện và trả về thông tin calo, protein, carb, fat ngay lập tức.
              </p>

              <NavBar />

              {error && (
                <p style={{ fontSize: 13, color: '#EF4444', marginTop: 8 }}>{error}</p>
              )}
            </div>

            {/* Feature grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {[
                { icon: <Brain size={20} />, title: 'AI nhận diện chính xác', desc: 'MobileNetV2 + classifier tùy chỉnh được huấn luyện trên hàng trăm món ăn Việt và quốc tế.', accent: '#6366F1' },
                { icon: <Leaf size={20} />, title: 'Macro chi tiết', desc: 'Protein · Carb · Fat · Fiber · Sodium — ước tính từ bảng dinh dưỡng chuẩn.', accent: '#10B981' },
                { icon: <UtensilsCrossed size={20} />, title: 'Meal Planner', desc: 'Lưu thực đơn theo ngày, theo dõi tổng calo và macro cho cả tuần.', accent: '#F59E0B', onClick: () => navigate('/meal-planner'), clickable: true },
              ].map((c, i) => (
                <div key={i} onClick={c.onClick}
                  style={{
                    padding: '20px 18px', border: '1px solid #E2E8F0', borderRadius: 14,
                    cursor: c.clickable ? 'pointer' : 'default',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                  onMouseEnter={e => { if (c.clickable) { e.currentTarget.style.borderColor = c.accent; e.currentTarget.style.boxShadow = `0 0 0 3px ${c.accent}18`; } }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: c.accent + '14', color: c.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                    {c.icon}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 5 }}>{c.title}</div>
                  <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.55 }}>{c.desc}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <section className="fc-scanner">
            {/* Compact header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#10B981', marginBottom: 4 }}>AI · Nutrition</p>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: 0 }}>Kết quả phân tích</h2>
              </div>
              <NavBar />
            </div>

            <div className="fc-card">
              <div className="fc-grid">
                <div className="fc-col">
                  <div className="fc-preview">
                    {previewUrl
                      ? <img src={previewUrl} alt="preview" loading="lazy" decoding="async" />
                      : <div className="fc-placeholder">Chưa có ảnh</div>}
                  </div>
                </div>

                <div className="fc-col">
                  <label className="fc-label">Thiết lập khẩu phần</label>
                  <div className="fc-controls">
                    <div style={{ display: "flex", gap: "8px", width: "100%", alignItems: "center" }}>
                      <input className="fc-input" style={{ flex: 1, minWidth: 0 }} ref={gramsRef}
                        type="number" placeholder="Khối lượng (gram) – tuỳ chọn"
                        onChange={() => recalcFromControls(result)} />
                      <Dialog>
                        <DialogTrigger asChild>
                          <button type="button" className="fc-btn-secondary"
                            style={{ padding: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}
                            title="Sử dụng cân Trackpad">
                            <Scale size={18} />
                          </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader><DialogTitle>Cân Trackpad</DialogTitle></DialogHeader>
                          <div className="flex justify-center items-center py-4">
                            <TrackpadScale onWeightLock={(weight) => {
                              if (gramsRef.current) { gramsRef.current.value = Math.round(weight); recalcFromControls(result); }
                            }} />
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <select className="fc-select" ref={sizeRef} defaultValue="" onChange={() => recalcFromControls(result)}>
                      <option value="">Kích cỡ khẩu phần</option>
                      <option value="s">Nhỏ (S)</option>
                      <option value="m">Vừa (M)</option>
                      <option value="l">Lớn (L)</option>
                    </select>

                    <button className="fc-btn-secondary" onClick={() => fileRef.current?.click()} disabled={!ready}>
                      Chọn / đổi ảnh
                    </button>
                  </div>

                  {result && (
                    <div className="fc-result" aria-live="polite">
                      <div className="fc-row"><span className="fc-key">Món ăn:</span><span className="fc-val">{result.dish}</span></div>
                      <div className="fc-row"><span className="fc-key">Khối lượng:</span><span className="fc-val">{result.grams} g</span></div>
                      <div className="fc-row"><span className="fc-key">Calo / 100g:</span><span className="fc-val">{result.kcal100}</span></div>
                      <div className="fc-total">Tổng: {result.total} kcal</div>

                      <div className="fc-top3">
                        {result.top3.map((t, idx) => {
                          const active = result.dish === t.dish;
                          return (
                            <span key={idx} className={`fc-chip clickable${active ? " active" : ""}`}
                              role="button" tabIndex={0} aria-pressed={active} title="Xem dinh dưỡng món này"
                              onClick={() => showDishInfo(t.dish, t.confidence)}
                              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); showDishInfo(t.dish, t.confidence); } }}>
                              {t.dish} {(t.confidence * 100).toFixed(1)}%
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {result && (result.macros ? (
                    <div className="fc-macros">
                      <div className="fc-macros-head">
                        <div className="fc-macros-title">Thành phần dinh dưỡng ({result.grams}g)</div>
                        <div className="fc-macros-sub">Ước tính từ bảng macro/100g</div>
                      </div>
                      <div className="fc-macro-rows">
                        {result.macros.details.map((it) => {
                          const pctBadge = it.id === "protein" ? result.macros.pct.p : it.id === "carbs" ? result.macros.pct.c : it.id === "fat" ? result.macros.pct.f : it.id === "alcohol" ? result.macros.pct.a : null;
                          return (
                            <div key={it.id} className="fc-macro-row">
                              <div className="fc-macro-name">{it.name}</div>
                              <div className="fc-macro-val">
                                {it.value} {it.unit}
                                {pctBadge !== null && pctBadge !== undefined ? <><span className="fc-badge">{pctBadge}%</span></> : null}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="fc-macro-stack" aria-label="Macro energy split">
                        <div className="seg protein" style={{ width: `${result.macros.pct.p}%` }} />
                        <div className="seg carb" style={{ width: `${result.macros.pct.c}%` }} />
                        <div className="seg fat" style={{ width: `${result.macros.pct.f}%` }} />
                        {result.macros.grams.a > 0 ? <div className="seg alcohol" style={{ width: `${result.macros.pct.a}%` }} /> : null}
                      </div>
                      <div className="fc-macro-legend">
                        <span className="dot protein" /> Protein
                        <span className="dot carb" /> Carb
                        <span className="dot fat" /> Fat
                        {result.macros.grams.a > 0 ? <><span className="dot alcohol" /> Alcohol</> : null}
                      </div>
                    </div>
                  ) : (
                    <div className="fc-error">Chưa có dữ liệu macro chi tiết cho món này.</div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

