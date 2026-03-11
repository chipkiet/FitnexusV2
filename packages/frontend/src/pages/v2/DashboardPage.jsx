import React, { useState, useEffect } from 'react';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
    BarChart, Bar, Cell
} from 'recharts';
import {
    Zap,
    Flame,
    Clock,
    TrendingUp,
    Target,
    ChevronRight,
    Plus,
    Calendar
} from 'lucide-react';

const activityData = [
    { name: 'T2', calories: 400, mins: 45 },
    { name: 'T3', calories: 300, mins: 30 },
    { name: 'T4', calories: 600, mins: 60 },
    { name: 'T5', calories: 800, mins: 75 },
    { name: 'T6', calories: 500, mins: 50 },
    { name: 'T7', calories: 900, mins: 90 },
    { name: 'CN', calories: 450, mins: 45 },
];

const bodyProgress = [
    { month: 'Jan', weight: 75 },
    { month: 'Feb', weight: 74.2 },
    { month: 'Mar', weight: 73.5 },
];

const DashboardPage = () => {
    const [counter, setCounter] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCounter(prev => prev < 1250 ? prev + 17 : 1250);
        }, 30);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-10 animate-reveal pb-20">
            {/* Greeting */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-slate-900 italic uppercase italic tracking-tighter italic mr-[-2px]">
                        CHÀO BUỔI SÁNG, <span className="text-blue-600">KIỆT</span>
                    </h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs italic">Hôm nay là một ngày tuyệt vời để luyện tập!</p>
                </div>
                <button className="px-8 py-5 bg-blue-600 text-white rounded-[24px] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-95 transition-all">
                    <Plus size={18} /> Ghi nhận buổi tập
                </button>
            </header>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                    { label: 'CALORIES ĐÃ ĐỐT', value: counter.toLocaleString(), sub: 'kcal', icon: <Flame size={24} />, color: 'text-orange-500', bg: 'bg-orange-50' },
                    { label: 'THỜI GIAN TẬP', value: '18.5', sub: 'giờ', icon: <Clock size={24} />, color: 'text-blue-500', bg: 'bg-blue-50' },
                    { label: 'BUỔI TẬP TUẦN NÀY', value: '4', sub: '/ 5 buổi', icon: <Target size={24} />, color: 'text-emerald-500', bg: 'bg-emerald-50' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-50 shadow-soft flex flex-col justify-between h-48 group card-lift">
                        <div className="flex justify-between items-start">
                            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center shadow-sm`}>
                                {stat.icon}
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h4 className="text-5xl font-black italic uppercase tracking-tighter text-slate-900 italic uppercase italic tracking-tighter italic mr-[-2px]">{stat.value}</h4>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.sub}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Progress Chart */}
                <div className="bg-white p-10 rounded-[48px] border border-slate-50 shadow-soft space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 italic uppercase italic tracking-tighter italic mr-[-2px]">HIỆU SUẤT TUẦN</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calories đốt cháy mỗi ngày</p>
                        </div>
                        <div className="px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black flex items-center gap-2">
                            <Calendar size={14} /> 7 ngày qua
                        </div>
                    </div>

                    <div className="h-72 w-full animate-scale">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', fontBold: '900' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="calories"
                                    stroke="#3B82F6"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorCal)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right side - Body Progress & Goals */}
                <div className="space-y-8">
                    <div className="bg-slate-900 rounded-[48px] p-10 text-white space-y-8 relative overflow-hidden group shadow-2xl shadow-blue-100/20">
                        <div className="flex items-center justify-between relative z-10">
                            <h3 className="text-2xl font-black italic uppercase italic tracking-tighter italic text-white italic uppercase italic tracking-tighter italic mr-[-2px]">TIẾN TRÌNH CƠ THỂ</h3>
                            <TrendingUp className="text-blue-500" size={24} />
                        </div>

                        <div className="space-y-6 relative z-10">
                            <div className="flex justify-between items-baseline">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cân nặng mục tiêu</span>
                                <div className="text-right">
                                    <span className="text-4xl font-black italic uppercase italic tracking-tighter italic text-white italic uppercase italic tracking-tighter italic mr-[-2px]">70.0</span>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">kg</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-slate-400">
                                    <span>Hiện tại: 73.5kg</span>
                                    <span>Tiến độ: 85%</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[85%] animate-shine relative"></div>
                                </div>
                            </div>
                        </div>

                        <button className="w-full py-5 bg-white/10 backdrop-blur rounded-[24px] font-black uppercase tracking-widest text-[10px] hover:bg-white/20 transition-all border border-white/10 relative z-10">
                            CẬP NHẬT CHỈ SỐ AI
                        </button>
                    </div>

                    <div className="bg-white p-10 rounded-[48px] border border-slate-50 shadow-soft h-[260px] flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-900 italic uppercase italic tracking-tighter italic mr-[-2px]">BÀI TẬP TIẾP THEO</h3>
                            <ChevronRight className="text-slate-300" size={20} />
                        </div>
                        <div className="flex gap-6 items-center">
                            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 shrink-0">
                                <Zap size={32} />
                            </div>
                            <div className="space-y-1 overflow-hidden">
                                <h4 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 truncate italic uppercase italic tracking-tighter italic mr-[-2px]">BACK DAY</h4>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">6 bài tập • 45 phút</p>
                            </div>
                        </div>
                        <button className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-200">
                            BẮT ĐẦU BUỔI TẬP
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
