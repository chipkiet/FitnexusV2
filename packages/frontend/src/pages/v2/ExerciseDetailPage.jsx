import React, { useState } from 'react';
import { ChevronLeft, Dumbbell, Zap, Play, CheckCircle2, AlertCircle, Info } from 'lucide-react';

const ExerciseDetailPage = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState('guide');

    const tabs = [
        { id: 'guide', label: 'Hướng dẫn' },
        { id: 'muscles', label: 'Nhóm cơ' },
        { id: 'errors', label: 'Lỗi thường gặp' }
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-reveal">
            {/* Navigation Header */}
            <header className="flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-black uppercase text-[10px] tracking-widest transition-colors mb-4 group"
                >
                    <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Quay lại thư viện
                </button>
            </header>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Left - Video Demo */}
                <div className="flex-1 space-y-8">
                    <div className="bg-slate-900 rounded-[48px] overflow-hidden shadow-2xl relative aspect-video group cursor-pointer group">
                        <img
                            src="https://images.unsplash.com/photo-1541534741688-6078c64b52d3?q=80&w=2070&auto=format&fit=crop"
                            alt="Demo"
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-blue-500/50 group-hover:scale-110 transition-transform">
                                <Play size={40} fill="currentColor" />
                            </div>
                        </div>
                        <div className="absolute bottom-8 left-8 flex items-center gap-3">
                            <div className="px-5 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white font-black text-[10px] uppercase tracking-widest">
                                4K ULTRA HD
                            </div>
                            <div className="px-5 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white font-black text-[10px] uppercase tracking-widest">
                                0:45 SEC
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Mobile only context? No, just cards */}
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { icon: <Dumbbell size={20} />, label: 'Dụng cụ', value: 'Thanh đòn' },
                            { icon: <Zap size={20} />, label: 'Mức độ', value: 'Nâng cao' },
                            { icon: <Info size={20} />, label: 'Type', value: 'Compound' }
                        ].map((s, i) => (
                            <div key={i} className="bg-white p-6 rounded-[32px] shadow-soft border border-slate-50 flex flex-col items-center gap-2 text-center transition-all hover:bg-slate-50">
                                <div className="text-blue-600">{s.icon}</div>
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{s.label}</span>
                                <span className="text-xs font-black text-slate-900 uppercase italic tracking-tighter italic">{s.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right - Info & Tabs */}
                <div className="flex-1 space-y-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full font-black text-[10px] uppercase tracking-widest">
                                #Lưng #Chân
                            </span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-slate-900 leading-[0.8] italic uppercase italic tracking-tighter italic mr-[-2px]">
                            BARBELL <br /><span className="text-blue-600">DEADLIFT</span>
                        </h1>
                        <p className="text-lg text-slate-400 font-medium leading-relaxed italic">
                            Bài tập deadlift là "ông vua" của các bài phát triển sức mạnh toàn thân, đặc biệt là chuỗi cơ sau (posterior chain).
                        </p>
                    </div>

                    {/* Tab Navigation */}
                    <div className="space-y-8">
                        <div className="flex bg-slate-50 p-2 rounded-[24px] gap-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                         flex-1 py-4 rounded-[18px] font-black text-[10px] uppercase tracking-widest transition-all
                                         ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}
                                     `}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="min-h-[300px] animate-scale">
                            {activeTab === 'guide' && (
                                <div className="space-y-6">
                                    {[
                                        "Đứng rộng bằng vai, thanh đòn sát cẳng chân.",
                                        "Gập hông, nắm thanh đòn, giữ lưng thẳng.",
                                        "Hít sâu, nén cơ bụng, đạp mạnh chân xuống sàn.",
                                        "Kéo thanh đòn lên theo đường thẳng sát cơ thể.",
                                        "Khóa hông ở đỉnh, không ưỡn quá đà."
                                    ].map((step, i) => (
                                        <div key={i} className="flex gap-4 group">
                                            <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors uppercase italic tracking-tighter italic">
                                                {i + 1}
                                            </span>
                                            <p className="text-slate-500 font-medium leading-relaxed uppercase italic tracking-tighter italic text-sm">{step}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'muscles' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-6 rounded-[32px] border border-slate-100 space-y-4">
                                        <h4 className="font-black text-xs uppercase tracking-widest text-blue-600">Nhóm cơ chính</h4>
                                        <ul className="space-y-3">
                                            {['Lưng dưới', 'Đùi sau', 'Mông', 'Cầu vai'].map((m) => (
                                                <li key={m} className="flex items-center gap-2 text-slate-600 font-bold text-sm uppercase italic tracking-tighter italic">
                                                    <CheckCircle2 size={16} className="text-emerald-500" /> {m}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100/50 space-y-4">
                                        <h4 className="font-black text-xs uppercase tracking-widest text-slate-400">Nhóm cơ hỗ trợ</h4>
                                        <ul className="space-y-3 opacity-60">
                                            {['Cẳng tay', 'Cơ bụng', 'Đùi trước'].map((m) => (
                                                <li key={m} className="flex items-center gap-2 text-slate-600 font-bold text-sm uppercase italic tracking-tighter italic">
                                                    <CheckCircle2 size={16} className="text-blue-400" /> {m}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'errors' && (
                                <div className="space-y-4">
                                    {[
                                        { title: "Cong lưng (Cat back)", desc: "Dễ gây chấn thương đĩa đệm lưng dưới." },
                                        { title: "Thanh đòn xa chân", desc: "Làm tăng áp lực không cần thiết lên cột sống." },
                                        { title: "Ngửa cổ quá cao", desc: "Ảnh hưởng đến đốt sống cổ và sự đồng nhất xương sống." }
                                    ].map((err, i) => (
                                        <div key={i} className="p-6 bg-orange-50 rounded-[28px] border border-orange-100 flex gap-4 transition-all hover:bg-orange-100">
                                            <AlertCircle className="text-orange-500 shrink-0" size={24} />
                                            <div className="space-y-1">
                                                <h5 className="font-black text-orange-900 text-sm italic uppercase tracking-tighter italic">{err.title}</h5>
                                                <p className="text-orange-800/60 text-xs font-semibold uppercase italic tracking-tighter italic">{err.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExerciseDetailPage;
