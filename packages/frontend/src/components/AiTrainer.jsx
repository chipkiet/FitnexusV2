import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api.js';
import { createPlanApi, addExerciseToPlanApi } from '../lib/api.js';
import HeaderLogin from './header/HeaderLogin.jsx';
import ScreenshotCapture from './screenshot/ScreenshotCapture.jsx';
import {
  Upload, Info, ChevronRight, Layers,
  Loader2, RefreshCcw, Zap, RotateCcw,
  User, Expand, Scale, ArrowUpDown, Sparkles
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

// ─── Design Tokens ──────────────────────────────────────────────────────────
const SHAPE_TRANSLATIONS = {
  Rectangle: 'Chữ Nhật',
  'Inverted Triangle': 'Tam Giác Ngược',
  Triangle: 'Tam Giác',
  Hourglass: 'Đồng Hồ Cát',
  Oval: 'Trái Xoan',
};

const METRIC_COLORS = {
  blue: { bg: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-100' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' },
  green: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
};

const normalize = (s) =>
  (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

// ─── Sub-components ──────────────────────────────────────────────────────────

const SectionLabel = ({ children }) => (
  <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-slate-400 mb-1">
    {children}
  </p>
);

const StatCard = ({ icon, label, value, color = 'blue' }) => {
  const c = METRIC_COLORS[color] || METRIC_COLORS.blue;
  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={`flex flex-col items-center justify-center gap-2 p-5 rounded-2xl bg-white border ${c.border} shadow-sm`}
    >
      <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${c.bg} ${c.text}`}>
        {React.cloneElement(icon, { size: 18 })}
      </span>
      <SectionLabel>{label}</SectionLabel>
      <span className="text-xl font-black text-slate-900 tracking-tight">{value || '—'}</span>
    </motion.div>
  );
};

const MeasureRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
    <span className="text-sm font-bold text-slate-800">{value}</span>
  </div>
);

const RatioChip = ({ label, value }) => (
  <div className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100">
    <SectionLabel>{label}</SectionLabel>
    <span className="text-base font-black text-slate-800">{value}</span>
  </div>
);

const DetailedMetrics = ({ analysisResult, heightCm }) => {
  const m = analysisResult?.measurements || {};
  const px = m.pixel_measurements || {};
  const cm = m.cm_measurements || {};
  const data = analysisResult?.analysis_data || {};
  const ratios = data.ratios || {};
  const scale = m?.scale_cm_per_px || (heightCm && px.height ? heightCm / px.height : null);

  const fmt = (key) => {
    if (cm[key]) return `${Math.round(cm[key])} cm`;
    if (scale && px[key]) return `${Math.round(px[key] * scale)} cm`;
    return '—';
  };

  const ratioFmt = (key) => {
    const v = ratios[key];
    return v ? (typeof v === 'number' ? v.toFixed(2) : v) : '—';
  };

  const legToHeight = ratios.leg_to_height_ratio
    ? `${(parseFloat(ratios.leg_to_height_ratio) * 100).toFixed(0)}%`
    : '—';

  const measures = [
    { label: 'Vai', value: fmt('shoulder_width') },
    { label: 'Eo', value: fmt('waist_width') },
    { label: 'Hông', value: fmt('hip_width') },
    { label: 'Chiều cao ước tính', value: fmt('height') },
    { label: 'Độ dài chân', value: fmt('leg_length') },
  ];

  const ratiosRow = [
    { label: 'Vai / Hông', value: ratioFmt('shoulder_hip_ratio') },
    { label: 'Eo / Hông', value: ratioFmt('waist_hip_ratio') },
    { label: 'Chân / Cao', value: legToHeight },
  ];

  return (
    <div className="space-y-5">
      <div>
        {measures.map((r) => <MeasureRow key={r.label} {...r} />)}
      </div>

      {(data.shape_type || data.somatotype) && (
        <div className="flex gap-3 pt-3">
          {data.shape_type && (
            <div className="flex-1 rounded-xl bg-sky-50 border border-sky-100 p-4 text-center">
              <SectionLabel>Body Shape</SectionLabel>
              <p className="text-base font-black text-sky-700">{data.shape_type}</p>
            </div>
          )}
          {data.somatotype && (
            <div className="flex-1 rounded-xl bg-indigo-50 border border-indigo-100 p-4 text-center">
              <SectionLabel>Somatotype</SectionLabel>
              <p className="text-base font-black text-indigo-700">{data.somatotype}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Upload Zone ─────────────────────────────────────────────────────────────

const UploadZone = ({ selectedFile, previewImage, onFileChange, fileInputRef }) => (
  <div
    onClick={() => fileInputRef.current?.click()}
    className={`
      relative flex flex-col items-center justify-center
      min-h-[320px] rounded-2xl border-2 border-dashed cursor-pointer
      transition-all duration-300 overflow-hidden
      ${selectedFile
        ? 'border-sky-400 bg-white'
        : 'border-slate-200 bg-slate-50 hover:border-sky-400 hover:bg-white'
      }
    `}
  >
    <input type="file" ref={fileInputRef} className="hidden" onChange={onFileChange} accept="image/*" />

    {selectedFile ? (
      <div className="absolute inset-0 group">
        <img src={previewImage} className="w-full h-full object-cover" alt="Preview" />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white">
          <RefreshCcw className="w-8 h-8 mb-2" />
          <span className="text-sm font-bold tracking-wide">Đổi ảnh</span>
        </div>
      </div>
    ) : (
      <div className="text-center px-6">
        <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center mx-auto mb-4">
          <Upload size={24} />
        </div>
        <p className="text-sm font-bold text-slate-700 mb-1">Tải ảnh toàn thân</p>
        <p className="text-xs text-slate-400">Bấm để chọn ảnh · Tối đa 10 MB</p>
      </div>
    )}
  </div>
);

// ─── Height Input ─────────────────────────────────────────────────────────────

const HeightInput = ({ value, onChange }) => (
  <div>
    <label className="block text-[10px] font-bold tracking-[0.18em] uppercase text-slate-400 mb-2">
      Chiều cao (cm)
    </label>
    <div className="relative">
      <input
        type="number"
        value={value}
        onChange={onChange}
        placeholder="170"
        className="
          w-full px-5 py-4 text-3xl font-black tracking-tight
          rounded-xl border-2 border-slate-200
          focus:border-sky-500 focus:ring-4 focus:ring-sky-50
          outline-none transition-all bg-white
          placeholder:text-slate-300
        "
      />
      <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">CM</span>
    </div>
  </div>
);

// ─── Tip Banner ───────────────────────────────────────────────────────────────

const TipBanner = () => (
  <div className="flex gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
    <Info className="text-amber-500 shrink-0 mt-0.5" size={16} />
    <p className="text-xs text-amber-700 font-medium leading-relaxed">
      Mẹo: Mặc đồ ôm sát, đứng thẳng và chụp toàn thân trước gương để AI đo đạc chính xác nhất.
    </p>
  </div>
);

// ─── Alert ────────────────────────────────────────────────────────────────────

const Alert = ({ message }) => (
  <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    className="mb-6 px-5 py-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium text-center"
  >
    {message}
  </motion.div>
);

// ─── Loading State ────────────────────────────────────────────────────────────

const AnalyzingView = () => (
  <motion.div
    key="loading"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex flex-col items-center justify-center py-32 gap-5"
  >
    <div className="relative">
      <Loader2 className="w-14 h-14 text-sky-500 animate-spin" />
      <Zap className="absolute inset-0 m-auto text-sky-500 w-5 h-5 animate-pulse" />
    </div>
    <div className="text-center">
      <p className="text-xl font-black text-slate-800 mb-1">Đang phân tích…</p>
      <p className="text-sm text-slate-400 max-w-xs mx-auto">
        AI đang trích xuất điểm đặc trưng và tính tỷ lệ sinh trắc học của bạn.
      </p>
    </div>
  </motion.div>
);

// ─── Setup Form View ──────────────────────────────────────────────────────────

const SetupView = ({ selectedFile, previewImage, heightCm, onFileChange, onHeightChange, onSubmit, fileInputRef }) => (
  <motion.div
    key="setup"
    initial={{ opacity: 0, scale: 0.97 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.97 }}
    transition={{ duration: 0.25 }}
    className="max-w-3xl mx-auto"
  >
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Accent top bar */}
      <div className="h-1 w-full bg-gradient-to-r from-sky-400 via-indigo-500 to-sky-400" />

      <div className="p-8 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Left: Upload */}
          <div className="space-y-3">
            <SectionLabel>Ảnh phân tích</SectionLabel>
            <UploadZone
              selectedFile={selectedFile}
              previewImage={previewImage}
              onFileChange={onFileChange}
              fileInputRef={fileInputRef}
            />
          </div>

          {/* Right: Inputs */}
          <div className="flex flex-col gap-6 justify-between h-full">
            <div className="space-y-1">
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Thông số cơ thể</h2>
              <p className="text-sm text-slate-500">Nhập chiều cao để AI tính tỷ lệ sinh trắc học chính xác.</p>
            </div>

            <HeightInput value={heightCm} onChange={onHeightChange} />
            <TipBanner />

            <button
              disabled={!selectedFile || !heightCm}
              onClick={onSubmit}
              className="
                w-full h-14 rounded-xl text-sm font-bold tracking-wide
                bg-slate-900 text-white hover:bg-slate-700
                disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed
                transition-all duration-200 flex items-center justify-center gap-2 group
              "
            >
              <Sparkles size={16} className="opacity-70" />
              BẮT ĐẦU PHÂN TÍCH
              <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <p className="mt-5 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
      <Zap size={12} className="text-amber-400" />
      Đo lường tự động bằng AI · Kết quả tham khảo
    </p>
  </motion.div>
);

// ─── Result View ──────────────────────────────────────────────────────────────

const ResultView = ({
  analysisResult, previewImage, heightCm,
  shapeType, shoulderWaist, waistHip, legRatio,
  isCreatingPlan, planCreateMsg,
  onReset, onCreatePlan, containerRef,
}) => {
  const exercises = analysisResult?.analysis_data?.exercises || [];

  return (
    <motion.div
      key="result"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── Processed image ── */}
        <div className="lg:col-span-2">
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm h-full min-h-[420px] flex items-center justify-center">
            <img
              src={analysisResult?.processed_image_url || previewImage}
              className="w-full h-full object-contain bg-slate-50"
              alt="Kết quả phân tích"
            />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-white/90 backdrop-blur-sm border border-slate-100 px-4 py-2.5 rounded-xl flex items-center justify-between shadow-sm">
                <SectionLabel>Body Type</SectionLabel>
                <span className="text-sm font-black text-slate-900">{shapeType}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard icon={<User />} label="Vóc dáng" value={shapeType} color="blue" />
            <StatCard icon={<Expand />} label="Vai / Eo" value={shoulderWaist} color="indigo" />
            <StatCard icon={<Scale />} label="Eo / Hông" value={waistHip} color="green" />
            <StatCard icon={<ArrowUpDown />} label="Chân / Cao" value={legRatio} color="amber" />
          </div>

          {/* Detailed metrics */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Layers className="text-sky-500 w-4 h-4" />
                Kích thước chi tiết
              </h4>
              {heightCm && (
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  {heightCm} cm
                </span>
              )}
            </div>
            <DetailedMetrics analysisResult={analysisResult} heightCm={heightCm} />
          </div>

          {/* Exercise suggestions */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-sky-500" />
              <h4 className="text-sm font-bold text-slate-800">Đề xuất bài tập</h4>
            </div>

            {exercises.length > 0 ? (
              <ul className="space-y-2">
                {exercises.map((ex, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed">
                    <span className="mt-1 w-4 h-4 rounded-full bg-sky-50 border border-sky-200 flex items-center justify-center text-[9px] font-black text-sky-500 shrink-0">
                      {i + 1}
                    </span>
                    {ex}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">Chưa có gợi ý bài tập chi tiết.</p>
            )}

            <button
              onClick={onCreatePlan}
              disabled={isCreatingPlan}
              className="
                w-full h-12 rounded-xl text-sm font-bold
                bg-sky-600 text-white hover:bg-sky-700
                disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed
                transition-all duration-200 flex items-center justify-center gap-2
              "
            >
              {isCreatingPlan ? (
                <>
                  <div className="w-4 h-4 border-2 rounded-full border-white/30 border-t-white animate-spin" />
                  Đang tạo kế hoạch…
                </>
              ) : (
                <>
                  <Zap size={15} />
                  Tạo kế hoạch theo gợi ý này
                </>
              )}
            </button>

            {planCreateMsg && (
              <p className="text-center text-xs text-rose-500 font-medium">{planCreateMsg}</p>
            )}
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-center gap-3 pt-2">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-5 h-10 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <RotateCcw size={14} /> Làm lại
        </button>
        <ScreenshotCapture targetRef={containerRef} feature="ai_trainer" disabled={!analysisResult} />
      </div>
    </motion.div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AiTrainer = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const containerRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [heightCm, setHeightCm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [planCreateMsg, setPlanCreateMsg] = useState('');

  // ── Handlers ──

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError('Ảnh quá lớn (>10MB)'); return; }
    setSelectedFile(file);
    setPreviewImage(URL.createObjectURL(file));
    setAnalysisResult(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedFile) return;
    setIsLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('image', selectedFile);
    if (heightCm) formData.append('known_height_cm', String(heightCm));
    try {
      const res = await api.post('/api/trainer/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success) setAnalysisResult(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi phân tích. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewImage(null);
    setAnalysisResult(null);
    setHeightCm('');
    setError('');
  };

  const handleCreatePlanFromAI = async () => {
    try {
      setIsCreatingPlan(true);
      const analysis = analysisResult?.analysis_data;
      if (!analysis) return;

      const planRes = await createPlanApi({
        name: `AI Plan - ${new Date().toLocaleDateString()}`,
        description: 'Tối ưu bởi AI',
        difficulty_level: 'beginner',
        is_public: false,
      });
      const planId = planRes?.data?.plan_id || planRes?.plan_id;
      if (!planId) return;

      const catalogRes = await api.get('/api/exercises', { params: { page: 1, pageSize: 2000 } });
      const catalog = catalogRes?.data?.data || [];

      const exercisesVi = Array.isArray(analysis?.exercises) ? analysis.exercises : [];
      const exercisesEn = Array.isArray(analysis?.exercises_en) ? analysis.exercises_en : [];

      const queriesVi = exercisesVi.map((e) => e.split(':')[0].trim()).filter(Boolean);
      const queriesEn = exercisesEn.filter(Boolean);
      const queries = [...new Set([...queriesVi, ...queriesEn])];

      let matchedCount = 0;
      const addedIds = new Set();
      const failures = [];

      for (const raw of queries) {
        try {
          const q = normalize(raw);
          if (!q || q.length < 3) continue;

          let found = catalog.find(
            (ex) => normalize(ex.name) === q || normalize(ex.name_en) === q
          );
          if (!found) {
            found = catalog.find(
              (ex) =>
                normalize(ex.name).includes(q) ||
                normalize(ex.name_en).includes(q) ||
                q.includes(normalize(ex.name)) ||
                q.includes(normalize(ex.name_en))
            );
          }

          if (found) {
            const id = found.id || found.exercise_id;
            if (!addedIds.has(id)) {
              await addExerciseToPlanApi({ planId, exercise_id: id, session_order: matchedCount + 1 });
              addedIds.add(id);
              matchedCount++;
            }
          } else {
            failures.push(raw);
          }
        } catch { /* skip individual errors */ }
      }

      if (matchedCount === 0) {
        setError(`Không tìm thấy bài tập phù hợp: ${failures.slice(0, 2).join(', ')}`);
      } else {
        navigate(`/plans/${planId}`);
      }
    } catch {
      setError('Lỗi tạo kế hoạch. Vui lòng thử lại sau.');
    } finally {
      setIsCreatingPlan(false);
    }
  };

  // ── Derived values ──

  const px = analysisResult?.measurements?.pixel_measurements || {};
  const shoulder = px.shoulder_width || 0;
  const waist = px.waist_width || 0;
  const hip = px.hip_width || 0;
  const leg = px.leg_length || 0;
  const heightPx = px.height || 0;
  const shoulderWaist = waist > 0 ? (shoulder / waist).toFixed(2) : '—';
  const waistHip = hip > 0 ? (waist / hip).toFixed(2) : '—';
  const legRatio = heightPx > 0 ? `${((leg / heightPx) * 100).toFixed(0)}%` : '—';
  const rawShape = analysisResult?.analysis_data?.shape_type;
  const shapeType = SHAPE_TRANSLATIONS[rawShape] || rawShape || '—';

  // ── Render ──

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <HeaderLogin />

      <div ref={containerRef} className="max-w-5xl mx-auto px-5 py-14 md:py-20">
        {/* Page header */}


        {error && <Alert message={error} />}

        <AnimatePresence mode="wait">
          {!analysisResult && !isLoading && (
            <SetupView
              selectedFile={selectedFile}
              previewImage={previewImage}
              heightCm={heightCm}
              onFileChange={handleFileChange}
              onHeightChange={(e) => setHeightCm(e.target.value)}
              onSubmit={handleSubmit}
              fileInputRef={fileInputRef}
            />
          )}

          {isLoading && <AnalyzingView />}

          {analysisResult && !isLoading && (
            <ResultView
              analysisResult={analysisResult}
              previewImage={previewImage}
              heightCm={heightCm}
              shapeType={shapeType}
              shoulderWaist={shoulderWaist}
              waistHip={waistHip}
              legRatio={legRatio}
              isCreatingPlan={isCreatingPlan}
              planCreateMsg={planCreateMsg}
              onReset={handleReset}
              onCreatePlan={handleCreatePlanFromAI}
              containerRef={containerRef}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AiTrainer;
