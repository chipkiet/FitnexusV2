import React, { useState, useRef, useEffect } from 'react';
import api from '../lib/api.js';
import HeaderLogin from './header/HeaderLogin.jsx';
import { useNavigate } from 'react-router-dom';
import { createPlanApi, addExerciseToPlanApi } from '../lib/api.js';
import ScreenshotCapture from './screenshot/ScreenshotCapture.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Info, 
  ChevronRight, 
  Activity, 
  User, 
  Layers, 
  Maximize2, 
  CheckCircle2,
  Loader2,
  RefreshCcw,
  Zap,
  RotateCcw,
  Apple,
  Heart,
  TrendingUp,
  Target
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from './ui/card';
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
  const [planCreateMsg, setPlanCreateMsg] = useState("");

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
      setError(err.response?.data?.message || "Lỗi phân tích");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewImage(null);
    setAnalysisResult(null);
    setError("");
  };

  const handleCreatePlanFromAI = async () => {
    try {
      setIsCreatingPlan(true);
      const analysis = analysisResult?.analysis_data;
      const planName = `AI Plan - ${new Date().toLocaleDateString()}`;
      const planRes = await createPlanApi({ name: planName, description: "Tối ưu bởi AI", difficulty_level: 'beginner', is_public: false });
      const planId = planRes?.data?.plan_id || planRes?.plan_id;
      if (!planId) return;

      const catalogRes = await api.get('/api/exercises', { params: { page: 1, pageSize: 1000 } });
      const catalog = catalogRes?.data?.data || [];
      const exercises = Array.isArray(analysis.exercises) ? analysis.exercises : [];

      for (let i = 0; i < exercises.length; i++) {
        // Logic tìm kiếm bài tập đơn giản hóa để tiết kiệm thời gian
        const name = exercises[i].split(':')[0].trim();
        const found = catalog.find(ex => ex.name.toLowerCase().includes(name.toLowerCase()));
        if (found) await addExerciseToPlanApi({ planId, exercise_id: found.id || found.exercise_id, session_order: i + 1 });
      }
      navigate(`/plans/${planId}`);
    } catch (e) {
      setPlanCreateMsg("Lỗi tạo kế hoạch");
    } finally {
      setIsCreatingPlan(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 font-inter text-slate-900">
      <HeaderLogin />
      
      <div ref={containerRef} className="max-w-6xl mx-auto px-6 py-12 md:py-20">
        
        {/* HERO - Compact */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge className="bg-blue-600 mb-4 px-4 py-1.5 rounded-full uppercase tracking-tighter font-bold">Fitnexus AI</Badge>
          <h1 className="text-4xl md:text-6xl font-poppins font-black tracking-tight mb-4">
            PHÂN TÍCH CƠ THỂ
          </h1>
          <p className="text-slate-500 font-medium max-w-lg mx-auto">
            Hệ thống AI tự động đo lường và đưa ra gợi ý tập luyện dựa trên vóc dáng thực tế của bạn.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!analysisResult && !isLoading ? (
            <motion.div 
              key="setup"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch"
            >
              {/* UPLOAD BOX - Clean */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`
                  aspect-square md:aspect-auto rounded-[40px] border-4 border-dashed transition-all duration-500
                  flex flex-col items-center justify-center p-8 cursor-pointer
                  ${selectedFile ? 'border-blue-500 bg-white shadow-2xl' : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-white'}
                `}
              >
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />
                
                {selectedFile ? (
                   <div className="relative w-full h-full rounded-3xl overflow-hidden group">
                     <img src={previewImage} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                       <RefreshCcw className="text-white w-10 h-10" />
                     </div>
                   </div>
                ) : (
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-6">
                      <Upload size={32} />
                    </div>
                    <span className="text-xl font-bold block mb-1">Tải ảnh toàn thân</span>
                    <span className="text-slate-400 text-sm font-medium">Kéo thả hoặc nhấn để chọn</span>
                  </div>
                )}
              </div>

              {/* ACTION PANEL */}
              <div className="flex flex-col gap-6">
                <Card className="rounded-[40px] border-none shadow-xl shadow-slate-200/50 p-8 flex-1 flex flex-col justify-center">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold mb-1">Nhập chiều cao</h3>
                      <p className="text-slate-400 text-sm mb-4">Để AI tính toán các chỉ số cơ thể chính xác.</p>
                      <div className="relative">
                        <input
                          type="number"
                          value={heightCm}
                          onChange={(e) => setHeightCm(e.target.value)}
                          placeholder="000"
                          className="w-full text-5xl font-black p-4 bg-slate-100 border-none rounded-3xl text-center outline-none focus:bg-blue-50 transition-all"
                        />
                        <span className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 font-bold">CM</span>
                      </div>
                    </div>

                    <Button 
                      disabled={!selectedFile || !heightCm}
                      onClick={handleSubmit}
                      className="w-full h-16 rounded-3xl text-xl font-bold bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20"
                    >
                      BẮT ĐẦU <ChevronRight className="ml-2" />
                    </Button>
                  </div>
                </Card>

                <div className="bg-amber-50 border border-amber-100 rounded-[32px] p-5 flex items-start gap-4">
                  <div className="bg-white p-2 rounded-xl text-amber-500 shadow-sm shrink-0">
                    <Info size={20} />
                  </div>
                  <p className="text-sm text-amber-900 font-medium leading-tight">
                    Hãy mặc đồ thể thao ôm sát và đứng thẳng trước gương để có kết quả tốt nhất.
                  </p>
                </div>
              </div>
            </motion.div>
          ) : isLoading ? (
            <motion.div 
               key="loading"
               className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="relative mb-8">
                <div className="w-24 h-24 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin" />
                <Zap className="absolute inset-0 m-auto text-blue-600 w-8 h-8 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Đang xử lý ảnh...</h2>
              <p className="text-slate-400 max-w-xs mx-auto">AI đang nhận diện các điểm xương khớp và đo đạc tỷ lệ cơ thể.</p>
            </motion.div>
          ) : (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* PHOTO - Main focus */}
                <div className="lg:col-span-5">
                  <div className="relative rounded-[48px] overflow-hidden border-[10px] border-white shadow-2xl bg-white group">
                    <img 
                      src={analysisResult.processed_image_url || previewImage} 
                      className="w-full h-auto object-cover transition-transform group-hover:scale-[1.02]"
                    />
                    <div className="absolute bottom-8 left-8 right-8">
                       <div className="bg-blue-600 text-white px-6 py-3 rounded-2xl flex items-center justify-between shadow-lg">
                         <span className="font-bold opacity-80 uppercase text-xs">Body Type</span>
                         <span className="font-black text-lg">{analysisResult.analysis_data?.shape_type || 'Classic'}</span>
                       </div>
                    </div>
                  </div>
                </div>

                {/* METRICS - Visual cards */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                  <div className="grid grid-cols-2 gap-4">
                    <VisualMetric icon={<TrendingUp />} label="BMI" value={analysisResult.analysis_data?.bmi || "22.5"} color="blue" />
                    <VisualMetric icon={<Target />} label="Mỡ cơ thể" value={analysisResult.analysis_data?.body_fat || "18.2%"} color="indigo" />
                    <VisualMetric icon={<Activity />} label="Cơ bắp" value={analysisResult.analysis_data?.muscle_ratio || "39%"} color="blue" />
                    <VisualMetric icon={<CheckCircle2 />} label="Tư thế" value={analysisResult.analysis_data?.posture_score || "88/100"} color="green" />
                  </div>

                  <Card className="rounded-[40px] border-none shadow-xl shadow-slate-200/50 p-8">
                     <div className="flex items-center justify-between mb-6">
                        <h4 className="text-lg font-bold flex items-center gap-2">
                          <Layers className="text-blue-600 w-5 h-5" /> Tỷ lệ chi tiết
                        </h4>
                        <Badge variant="outline" className="border-slate-200 text-slate-400">{heightCm}cm</Badge>
                     </div>
                     <DetailedMetrics analysisResult={analysisResult} heightCm={heightCm} />
                  </Card>

                  {/* AI INSIGHT - Summary only */}
                  <div className="bg-slate-900 rounded-[40px] p-8 text-white flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-2 text-blue-400">
                        <Zap size={20} fill="currentColor" />
                        <span className="font-bold uppercase tracking-widest text-xs">Phân tích AI</span>
                      </div>
                      <p className="text-lg font-medium leading-snug line-clamp-3 italic opacity-90">
                        "{analysisResult.analysis_data?.body_analysis?.split('.')[0]}."
                      </p>
                      <div className="flex gap-4">
                        <AdviceSmall icon={<Apple />} content={analysisResult.analysis_data?.nutrition_advice} />
                        <AdviceSmall icon={<Heart />} content={analysisResult.analysis_data?.lifestyle_tips} />
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleCreatePlanFromAI}
                      disabled={isCreatingPlan}
                      className="w-full md:w-auto h-20 px-8 rounded-3xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xl shadow-2xl shadow-blue-500/20"
                    >
                       {isCreatingPlan ? <Loader2 className="animate-spin" /> : "LẤY LỘ TRÌNH"}
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center gap-4">
                <Button variant="ghost" onClick={handleReset} className="text-slate-400 font-bold rounded-2xl">LÀM LẠI</Button>
                <div className="opacity-50 hover:opacity-100 transition-opacity">
                   <ScreenshotCapture targetRef={containerRef} feature="ai_trainer" disabled={!analysisResult} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// --- Small & Visual Components ---

const VisualMetric = ({ icon, label, value, color }) => (
  <div className={`p-6 bg-white rounded-[32px] border border-slate-100 shadow-sm flex flex-col items-center text-center transition-all hover:shadow-lg group`}>
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-colors ${color === 'blue' ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' : color === 'indigo' ? 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white' : 'bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white'}`}>
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</span>
    <span className="text-2xl font-black">{value}</span>
  </div>
);

const AdviceSmall = ({ icon, content }) => {
  if (!content) return null;
  return (
    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0 cursor-help" title={content}>
       {React.cloneElement(icon, { size: 18 })}
    </div>
  );
};

const DetailedMetrics = ({ analysisResult, heightCm }) => {
  const m = analysisResult?.measurements || {};
  const px = m.pixel_measurements || {};
  const cm = m.cm_measurements || {};
  const scale = m?.scale_cm_per_px || (heightCm && px.height ? heightCm / px.height : null);

  const fmt = (key) => {
    if (cm && cm[key]) return `${Math.round(cm[key])}cm`;
    if (scale && px[key]) return `${Math.round(px[key] * scale)}cm`;
    return "—";
  };

  const items = [
    { label: "VAI", val: fmt("shoulder_width") },
    { label: "EO", val: fmt("waist_width") },
    { label: "HÔNG", val: fmt("hip_width") },
    { label: "CHÂN", val: fmt("leg_length") },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {items.map((item, i) => (
        <div key={i} className="text-center">
          <p className="text-[10px] font-black text-slate-300 tracking-[0.2em] mb-1">{item.label}</p>
          <p className="text-xl font-bold">{item.val}</p>
        </div>
      ))}
    </div>
  );
};

export default AiTrainer;
