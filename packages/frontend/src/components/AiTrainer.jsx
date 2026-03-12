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
  User, Expand, Scale, ArrowUpDown
} from 'lucide-react';

import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

const AiTrainer = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [heightCm, setHeightCm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const containerRef = useRef(null);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("Ảnh quá lớn (>10MB)");
        return;
      }
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
      setAnalysisResult(null);
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    if (event) event.preventDefault();
    if (!selectedFile) return;
    setIsLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("image", selectedFile);
    if (heightCm) formData.append("known_height_cm", String(heightCm));

    try {
      const response = await api.post(`/api/trainer/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data?.success) setAnalysisResult(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi phân tích. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewImage(null);
    setAnalysisResult(null);
    setHeightCm("");
    setError("");
  };

  const handleCreatePlanFromAI = async () => {
    try {
      setIsCreatingPlan(true);
      const analysis = analysisResult?.analysis_data;
      const planRes = await createPlanApi({
        name: `AI Plan - ${new Date().toLocaleDateString()}`,
        description: "Tối ưu bởi AI",
        difficulty_level: 'beginner',
        is_public: false
      });

      const planId = planRes?.data?.plan_id || planRes?.plan_id;
      if (!planId) return;

      const catalogRes = await api.get('/api/exercises', { params: { page: 1, pageSize: 1000 } });
      const catalog = catalogRes?.data?.data || [];
      const exercises = Array.isArray(analysis?.exercises) ? analysis.exercises : [];

      for (let i = 0; i < exercises.length; i++) {
        const name = exercises[i].split(':')[0].trim();
        const found = catalog.find(ex => ex.name.toLowerCase().includes(name.toLowerCase()));
        if (found) await addExerciseToPlanApi({ planId, exercise_id: found.id || found.exercise_id, session_order: i + 1 });
      }
      navigate(`/plans/${planId}`);
    } catch (e) {
      setError("Lỗi tạo kế hoạch. Vui lòng thử lại sau.");
    } finally {
      setIsCreatingPlan(false);
    }
  };

  // --- Tính toán dữ liệu hình thể an toàn trước khi render ---
  const px = analysisResult?.measurements?.pixel_measurements || {};
  const shoulder = px.shoulder_width || 0;
  const waist = px.waist_width || 0;
  const hip = px.hip_width || 0;
  const leg = px.leg_length || 0;
  const heightPx = px.height || 0;

  const shoulderWaist = waist > 0 ? (shoulder / waist).toFixed(2) : "--";
  const waistHip = hip > 0 ? (waist / hip).toFixed(2) : "--";
  const legRatio = heightPx > 0 ? ((leg / heightPx) * 100).toFixed(0) + "%" : "--";

  const shapeTranslations = {
    'Rectangle': 'Chữ Nhật',
    'Inverted Triangle': 'Tam Giác Ngược',
    'Triangle': 'Tam Giác',
    'Hourglass': 'Đồng Hồ Cát',
    'Oval': 'Trái Xoan'
  };
  const rawShape = analysisResult?.analysis_data?.shape_type;
  const shapeType = shapeTranslations[rawShape] || rawShape || "--";

  return (
    <div className="min-h-screen bg-slate-50/50 font-inter text-slate-900">
      <HeaderLogin />

      <div ref={containerRef} className="max-w-5xl mx-auto px-6 py-12 md:py-20">

        {/* HERO SECTION */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge className="bg-blue-600 mb-4 px-4 py-1.5 rounded-full uppercase tracking-tighter font-bold">Fitnexus AI</Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            PHÂN TÍCH CƠ THỂ
          </h1>
          <p className="text-slate-500 font-medium max-w-lg mx-auto">
            Hệ thống AI tự động đo lường và đưa ra gợi ý tập luyện dựa trên vóc dáng thực tế của bạn.
          </p>
        </motion.div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-center font-medium shadow-sm border border-red-100">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {!analysisResult && !isLoading ? (
            <motion.div
              key="setup"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">

                {/* UPLOAD ZONE */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    min-h-[320px] rounded-3xl border-2 border-dashed transition-all duration-300
                    flex flex-col items-center justify-center p-8 cursor-pointer relative overflow-hidden
                    ${selectedFile ? 'border-blue-500 bg-white shadow-lg' : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50'}
                  `}
                >
                  <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />

                  {selectedFile ? (
                    <div className="absolute inset-0 w-full h-full group">
                      <img src={previewImage} className="w-full h-full object-cover" alt="Preview" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white">
                        <RefreshCcw className="w-8 h-8 mb-2" />
                        <span className="font-medium">Đổi ảnh khác</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
                        <Upload size={28} />
                      </div>
                      <span className="text-lg font-bold block mb-1 text-slate-800">Tải ảnh toàn thân</span>
                      <span className="text-slate-500 text-sm">Kéo thả hoặc nhấn để chọn</span>
                    </div>
                  )}
                </motion.div>

                {/* FORM & ACTION ZONE */}
                <Card className="rounded-3xl border border-slate-200 shadow-sm p-8 flex flex-col justify-between bg-white">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-slate-800">Thông tin cơ bản</h3>
                      <p className="text-slate-500 text-sm mb-4">Nhập chiều cao để AI nội suy tỷ lệ khung xương chuẩn xác hơn.</p>
                      <div className="relative">
                        <input
                          type="number"
                          value={heightCm}
                          onChange={(e) => setHeightCm(e.target.value)}
                          placeholder="000"
                          className="w-full text-3xl font-bold p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                        />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">CM</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <Button
                      disabled={!selectedFile || !heightCm}
                      onClick={handleSubmit}
                      className="w-full h-14 rounded-2xl text-lg font-bold bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                    >
                      BẮT ĐẦU PHÂN TÍCH <ChevronRight className="ml-2 w-5 h-5" />
                    </Button>
                  </div>
                </Card>
              </div>

              <div className="mt-6 bg-amber-50/80 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
                <Info className="text-amber-500 shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-amber-800 font-medium">
                  Mẹo: Hãy mặc đồ thể thao ôm sát, đứng thẳng người và chụp toàn thân trước gương hoặc nhờ người khác chụp để AI đo đạc chính xác nhất.
                </p>
              </div>

            </motion.div>

          ) : isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="relative mb-6">
                <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
                <Zap className="absolute inset-0 m-auto text-blue-600 w-6 h-6 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-slate-800">Đang phân tích dữ liệu...</h2>
              <p className="text-slate-500 max-w-sm mx-auto">Hệ thống đang trích xuất các điểm đặc trưng và tính toán tỷ lệ sinh trắc học của bạn.</p>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* PROCESSED IMAGE */}
                <div className="lg:col-span-5">
                  <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm h-full max-h-[600px] flex items-center justify-center group">
                    <img
                      src={analysisResult?.processed_image_url || previewImage}
                      className="w-full h-full object-contain bg-slate-50"
                      alt="Analyzed body"
                    />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-white/90 backdrop-blur-md border border-slate-100 px-5 py-3 rounded-2xl flex items-center justify-between shadow-sm">
                        <span className="font-semibold text-slate-500 text-xs uppercase tracking-wider">Body Type</span>
                        <span className="font-bold text-slate-900">{shapeType}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* METRICS & INSIGHTS */}
                <div className="lg:col-span-7 flex flex-col gap-6">

                  {/* REAL METRIC CARDS GRID */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <VisualMetric icon={<User />} label="Vóc dáng" value={shapeType} color="blue" />
                    <VisualMetric icon={<Expand />} label="Tỷ lệ Vai/Eo" value={shoulderWaist} color="indigo" />
                    <VisualMetric icon={<Scale />} label="Tỷ lệ Eo/Hông" value={waistHip} color="green" />
                    <VisualMetric icon={<ArrowUpDown />} label="Chân/Cơ thể" value={legRatio} color="blue" />
                  </div>

                  {/* DETAILED PROPORTIONS */}
                  <Card className="rounded-3xl border border-slate-200 shadow-sm p-6 bg-white">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                        <Layers className="text-blue-600 w-5 h-5" /> Kích thước chi tiết
                      </h4>
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-semibold">{heightCm || '--'} cm</Badge>
                    </div>
                    <DetailedMetrics analysisResult={analysisResult} heightCm={heightCm} />
                  </Card>

                  {/* AI SUMMARY ACTION CARD */}
                  <div className="bg-slate-900 rounded-3xl p-6 text-white flex flex-col md:flex-row gap-6 items-center shadow-lg">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2 text-blue-400">
                        <Zap size={18} fill="currentColor" />
                        <span className="font-bold uppercase tracking-wider text-xs">AI Insight</span>
                      </div>
                      <div className="relative">
                        <p className={`text-base text-slate-200 leading-relaxed ${!isExpanded ? 'line-clamp-2' : ''}`}>
                          {analysisResult?.analysis_data?.body_analysis || "Dữ liệu tỷ lệ khung xương đã được lưu trữ để tính toán lộ trình."}
                        </p>
                        {!isExpanded && (analysisResult?.analysis_data?.body_analysis?.length > 150) && (
                          <button
                            onClick={() => setIsExpanded(true)}
                            className="text-blue-400 hover:text-blue-300 text-sm font-bold mt-1 transition-colors"
                          >
                            ... Xem thêm
                          </button>
                        )}
                        {isExpanded && (
                          <button
                            onClick={() => setIsExpanded(false)}
                            className="text-blue-400 hover:text-blue-300 text-sm font-bold mt-2 block transition-colors"
                          >
                            Thu gọn
                          </button>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={handleCreatePlanFromAI}
                      disabled={isCreatingPlan}
                      className="w-full md:w-auto h-14 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md transition-all shrink-0"
                    >
                      {isCreatingPlan ? <Loader2 className="animate-spin w-5 h-5" /> : "TẠO LỘ TRÌNH TẬP"}
                    </Button>
                  </div>

                </div>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="flex justify-center items-center gap-4 pt-4">
                <Button variant="outline" onClick={handleReset} className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold h-12 px-6">
                  <RotateCcw className="w-4 h-4 mr-2" /> Làm Lại
                </Button>
                <ScreenshotCapture targetRef={containerRef} feature="ai_trainer" disabled={!analysisResult} />
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// --- Refactored Sub-Components ---

const VisualMetric = ({ icon, label, value, color }) => {
  const displayValue = value || "--";

  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    green: 'bg-emerald-50 text-emerald-600'
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center transition-all"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colorMap[color] || colorMap.blue}`}>
        {React.cloneElement(icon, { size: 20 })}
      </div>
      <span className="text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-tight mb-1 leading-tight">{label}</span>
      <span className="text-xl font-black text-slate-800">{displayValue}</span>
    </motion.div>
  );
};

const DetailedMetrics = ({ analysisResult, heightCm }) => {
  const m = analysisResult?.measurements || {};
  const px = m.pixel_measurements || {};
  const cm = m.cm_measurements || {};
  const scale = m?.scale_cm_per_px || (heightCm && px.height ? heightCm / px.height : null);

  const fmt = (key) => {
    if (cm && cm[key]) return `${Math.round(cm[key])} cm`;
    if (scale && px[key]) return `${Math.round(px[key] * scale)} cm`;
    return "--";
  };

  const items = [
    { label: "VAI", val: fmt("shoulder_width") },
    { label: "EO", val: fmt("waist_width") },
    { label: "HÔNG", val: fmt("hip_width") },
    { label: "CHÂN", val: fmt("leg_length") },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {items.map((item, i) => (
        <div key={i} className="text-center bg-slate-50 py-3 rounded-xl border border-slate-100">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{item.label}</p>
          <p className="text-lg font-bold text-slate-800">{item.val}</p>
        </div>
      ))}
    </div>
  );
};

export default AiTrainer;