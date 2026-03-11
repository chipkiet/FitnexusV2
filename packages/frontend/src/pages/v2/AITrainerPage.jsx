import React, { useState, useCallback } from 'react';
import { Upload, Scan, Ruler, CheckCircle2, ChevronRight, Info, RefreshCcw, ShieldCheck, Zap, Activity } from 'lucide-react';

const AITrainerPage = () => {
    const [file, setFile] = useState(null);
    const [height, setHeight] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleUpload = (e) => {
        const uploadedFile = e.target.files[0];
        if (uploadedFile) {
            setFile(URL.createObjectURL(uploadedFile));
        }
    };

    const startAnalysis = () => {
        if (!file || !height) return;
        setIsAnalyzing(true);
        let p = 0;
        const interval = setInterval(() => {
            p += 4;
            setProgress(p);
            if (p >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    setIsAnalyzing(false);
                    setShowResult(true);
                }, 800);
            }
        }, 120);
    };

    const reset = () => {
        setFile(null);
        setHeight('');
        setShowResult(false);
        setProgress(0);
    };

    if (!showResult) {
        return (
            <div className="max-w-4xl mx-auto space-y-12 animate-reveal">
                {/* Hero section */}
                <header className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full font-black text-[10px] uppercase tracking-widest animate-scale">
                        <Scan size={14} className="animate-pulse" /> Fitnexus AI Biometrics
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-slate-900 leading-[0.9] italic">
                        FITNEXUS <span className="text-blue-600 italic uppercase italic tracking-tighter italic">AI TRAINER</span>
                    </h1>
                    <p className="text-lg text-slate-500 font-medium max-w-xl mx-auto leading-relaxed">
                        Tải ảnh toàn thân để AI phân tích chỉ số cơ thể và đưa ra lộ trình tập luyện tối ưu cho riêng bạn.
                    </p>
                </header>

                <div className="grid md:grid-cols-2 gap-8 items-start">
                    {/* Upload Area */}
                    <div className={`
                        relative group cursor-pointer bg-white rounded-[40px] p-8 border-2 border-dashed transition-all duration-500 shadow-soft
                        ${file ? 'border-blue-400 bg-blue-50/5' : 'border-slate-200 hover:border-blue-200 hover:bg-slate-50/50'}
                        ${isAnalyzing ? 'opacity-50 pointer-events-none' : ''}
                    `}>
                        <input
                            type="file"
                            onChange={handleUpload}
                            className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
                        />

                        <div className="aspect-[3/4] rounded-[24px] flex flex-col items-center justify-center gap-6 overflow-hidden relative">
                            {file ? (
                                <>
                                    <img src={file} alt="Preview" className="w-full h-full object-cover rounded-[24px]" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm z-10">
                                        <RefreshCcw className="text-white animate-spin-slow" size={32} />
                                    </div>
                                    {isAnalyzing && (
                                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-blue-600/20 backdrop-blur-md">
                                            <div className="w-32 h-32 relative">
                                                <svg className="w-full h-full" viewBox="0 0 100 100">
                                                    <circle className="text-white/20" strokeWidth="4" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                                                    <circle className="text-white" strokeWidth="4" strokeDasharray={`${progress * 2.82}, 282`} strokeLinecap="round" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                                                </svg>
                                                <div className="absolute inset-0 flex items-center justify-center font-black text-white text-2xl">{progress}%</div>
                                            </div>
                                            <p className="mt-4 text-white font-black uppercase tracking-widest text-xs animate-pulse">ĐANG QUÉT CƠ THỂ...</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="w-20 h-20 bg-blue-600 text-white rounded-3xl flex items-center justify-center shadow-xl shadow-blue-200 group-hover:scale-110 transition-transform">
                                        <Upload size={32} />
                                    </div>
                                    <div className="text-center px-4">
                                        <h3 className="text-xl font-black text-slate-900 mb-2 italic uppercase">Nhấn hoặc kéo ảnh vào đây</h3>
                                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest leading-relaxed">Hỗ trợ JPG, PNG • Đảm bảo đủ ánh sáng • Ảnh chụp toàn thân</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Form Input */}
                    <div className="space-y-8 h-full flex flex-col justify-center">
                        <div className="bg-white rounded-[40px] p-10 shadow-soft border border-slate-50 space-y-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 block">Chiều cao của bạn (cm)</label>
                                <div className="relative group">
                                    <Ruler className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={24} />
                                    <input
                                        type="number"
                                        value={height}
                                        onChange={(e) => setHeight(e.target.value)}
                                        placeholder="VD: 175 cm"
                                        className="w-full pl-16 pr-8 py-6 bg-slate-50 border-none rounded-[24px] font-black text-xl focus:ring-4 focus:ring-blue-50 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={startAnalysis}
                                disabled={!file || !height || isAnalyzing}
                                className={`
                                    w-full py-6 rounded-[24px] font-black text-lg uppercase tracking-widest flex items-center justify-center gap-4 transition-all shadow-xl
                                    ${file && height && !isAnalyzing
                                        ? 'bg-blue-600 text-white shadow-blue-200 hover:scale-[1.02] active:scale-95 btn-primary'
                                        : 'bg-slate-100 text-slate-300 pointer-events-none'}
                                `}
                            >
                                {isAnalyzing ? 'ĐANG PHÂN TÍCH...' : 'Bắt đầu Phân tích'} <ChevronRight size={24} />
                            </button>
                        </div>

                        <div className="p-8 bg-blue-50/50 rounded-[32px] border border-blue-50 flex gap-5 animate-reveal">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                                <Info size={24} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-black text-blue-900 text-xs uppercase tracking-widest">Mẹo chụp ảnh</h4>
                                <p className="text-xs font-medium text-slate-500 leading-relaxed italic uppercase italic tracking-tighter italic">
                                    Hãy mặc đồ thể thao ôm sát, đứng thẳng trước gương hoặc nhờ người khác chụp giúp để có kết quả chính xác nhất.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Results Dashboard
    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-reveal pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-slate-900 italic">KẾT QUẢ PHÂN TÍCH <span className="text-blue-600">AI</span></h2>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Phân tích sinh trắc học ngày 11/03/2026</p>
                </div>
                <button
                    onClick={reset}
                    className="px-8 py-5 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-xl active:scale-95"
                >
                    <RefreshCcw size={18} /> Phân tích ảnh mới
                </button>
            </header>

            <div className="grid lg:grid-cols-3 gap-10">
                {/* Left Side - Image with Overlay */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-[48px] p-4 shadow-2xl border border-slate-100 relative overflow-hidden group">
                        <div className="aspect-[3/4] relative rounded-[36px] overflow-hidden">
                            <img src={file} alt="Analyzed" className="w-full h-full object-cover" />

                            {/* HUD Overlay Simulation */}
                            <div className="absolute inset-0 p-8 pointer-events-none flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <div className="px-4 py-2 bg-blue-600 rounded-xl text-white font-black text-[8px] uppercase tracking-widest shadow-lg">SCAN: ACTIVE</div>
                                    <div className="px-4 py-2 bg-black/40 backdrop-blur-md rounded-xl text-white font-black text-[8px] uppercase tracking-widest">ID: #FIT-0829</div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                        <div className="h-[1px] flex-1 bg-white/20 relative">
                                            <div className="absolute top-0 left-[20%] w-2 h-2 bg-white rounded-full -translate-y-1/2 border border-blue-500"></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 opacity-50">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <div className="h-[1px] flex-1 bg-white/20 relative">
                                            <div className="absolute top-0 left-[60%] w-2 h-2 bg-white rounded-full -translate-y-1/2 border border-emerald-500"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Metrics Sidebars? no requested cards */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            { label: 'BMI', value: '23.4', sub: 'Bình thường', color: 'bg-blue-600', val: 70 },
                            { label: 'Body Fat %', value: '18.2%', sub: 'Athletic', color: 'bg-emerald-500', val: 55 },
                            { label: 'Muscle Ratio', value: '42.5%', sub: 'High', color: 'bg-orange-500', val: 85 },
                            { label: 'Tỉ lệ cơ thể', value: '1.42', sub: 'Lý tưởng (V-Shape)', color: 'bg-purple-600', val: 92 }
                        ].map((m, i) => (
                            <div key={i} className="bg-white p-8 rounded-[40px] shadow-soft border border-slate-50 space-y-4 group card-lift">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.label}</span>
                                    <h4 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 italic">{m.value}</h4>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                                        <span className="text-slate-400">{m.sub}</span>
                                        <span className="text-blue-600">Top 15%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${m.color} rounded-full transition-all duration-1000 ease-out`}
                                            style={{ width: `${m.val}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Insights Card */}
                    <div className="bg-slate-900 rounded-[48px] p-10 text-white relative overflow-hidden group shadow-2xl shadow-blue-100/20">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                        <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center">
                            <div className="w-24 h-24 bg-blue-600 rounded-[32px] flex items-center justify-center text-white shrink-0 shadow-xl shadow-blue-500/20">
                                <ShieldCheck size={48} />
                            </div>
                            <div className="flex-1 space-y-4 text-center md:text-left">
                                <h3 className="text-2xl md:text-4xl font-black italic uppercase italic tracking-tighter italic leading-tight">LỘ TRÌNH CHO <span className="text-blue-500">VÓC DÁNG CỦA BẠN</span></h3>
                                <p className="text-slate-400 font-medium text-lg leading-relaxed italic">
                                    "AI phân tích thấy bạn có khung vai rộng nhưng phần lưng dưới cần cải thiện độ dày. Chúng tôi khuyên bạn nên bắt đầu lộ trình
                                    <span className="text-white font-black italic uppercase italic tracking-tighter italic"> Hypertrophy V-Taper</span> để tối ưu hóa vóc dáng."
                                </p>
                            </div>
                            <button className="px-10 py-6 bg-white text-slate-900 rounded-[24px] font-black uppercase tracking-widest text-xs hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-xl shrink-0">
                                XEM LỘ TRÌNH
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AITrainerPage;
