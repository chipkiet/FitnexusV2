import React from 'react';
import {
    User, Mail, Phone, MapPin,
    Settings, Shield, Bell,
    ChevronRight, Edit3, Camera,
    TrendingUp, Award, Activity
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const progressData = [
    { name: 'Tháng 1', weight: 80 },
    { name: 'Tháng 2', weight: 78 },
    { name: 'Tháng 3', weight: 76 },
    { name: 'Tháng 4', weight: 75.5 },
    { name: 'Tháng 5', weight: 74.2 },
    { name: 'Tháng 6', weight: 73.5 },
];

const ProfilePage = () => {
    return (
        <div className="space-y-12 animate-reveal pb-20">
            {/* Header / Profile Info */}
            <header className="flex flex-col md:flex-row gap-10 items-center md:items-start">
                <div className="relative group">
                    <div className="w-40 h-40 md:w-56 md:h-56 rounded-[56px] overflow-hidden border-8 border-white shadow-2xl relative">
                        <img
                            src="https://images.unsplash.com/photo-1541534741688-6078c64b52d3?q=80&w=2070&auto=format&fit=crop"
                            alt="Avatar"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-sm">
                            <Camera className="text-white" size={32} />
                        </div>
                    </div>
                    <div className="absolute -bottom-4 right-4 w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white border-4 border-white shadow-xl">
                        <Award size={24} />
                    </div>
                </div>

                <div className="flex-1 text-center md:text-left space-y-6 pt-4">
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-slate-900 italic uppercase italic tracking-tighter italic mr-[-2px]">ANH KIỆT</h1>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-4 py-1.5 rounded-full inline-block">Pro Athlete</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto md:mx-0">
                        {[
                            { label: 'CHIỀU CAO', value: '175 cm' },
                            { label: 'CÂN NẶNG', value: '73.5 kg' },
                            { label: 'BODY FAT', value: '14.2 %' },
                            { label: 'TUỔI', value: '24' }
                        ].map((s, i) => (
                            <div key={i} className="space-y-1">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                                <p className="text-xl font-black italic uppercase tracking-tighter text-slate-900 italic uppercase italic tracking-tighter italic mr-[-1px]">{s.value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                        <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-blue-600 transition-all active:scale-95 shadow-lg">
                            <Edit3 size={16} /> Chỉnh sửa hồ sơ
                        </button>
                        <button className="px-8 py-4 bg-white border border-slate-100 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                            <Settings size={16} /> Cài đặt
                        </button>
                    </div>
                </div>
            </header>

            <div className="grid lg:grid-cols-3 gap-10">
                {/* Progress History */}
                <div className="lg:col-span-2 bg-white p-10 rounded-[48px] border border-slate-50 shadow-soft space-y-10">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 italic uppercase italic tracking-tighter italic mr-[-2px]">LỊCH SỬ TIẾN TRÌNH</h3>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                <TrendingUp size={14} /> -6.5kg (6 tháng)
                            </div>
                        </div>
                    </div>

                    <div className="h-72 w-full animate-scale">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={progressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }} />
                                <Area type="monotone" dataKey="weight" stroke="#3B82F6" strokeWidth={4} fillOpacity={1} fill="url(#colorWeight)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Achievements / Secondary info */}
                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-[40px] border border-slate-50 shadow-soft space-y-6">
                        <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-900 italic uppercase italic tracking-tighter italic mr-[-2px]">THÀNH TÍCH</h3>
                        <div className="space-y-4">
                            {[
                                { title: '7 Days Streak', desc: 'Luyện tập liên tục 7 ngày', icon: '🔥', color: 'bg-orange-50' },
                                { title: 'First 500k Cal', desc: 'Cột mốc 500k calories', icon: '🥇', color: 'bg-emerald-50' },
                                { title: 'AI Master', desc: 'Dùng AI Trainer > 20 lần', icon: '🤖', color: 'bg-blue-50' }
                            ].map((badge, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 rounded-3xl hover:bg-slate-50 transition-colors">
                                    <div className={`w-14 h-14 ${badge.color} rounded-2xl flex items-center justify-center text-2xl shadow-sm`}>
                                        {badge.icon}
                                    </div>
                                    <div className="space-y-0.5">
                                        <h4 className="font-black text-xs uppercase tracking-tight text-slate-900 italic uppercase italic tracking-tighter italic mr-[-1px]">{badge.title}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">{badge.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full py-4 text-blue-600 font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2">
                            Xem tất cả <ChevronRight size={14} />
                        </button>
                    </div>

                    <div className="bg-blue-600 rounded-[40px] p-8 text-white space-y-4 shadow-xl shadow-blue-200">
                        <div className="flex items-center gap-3">
                            <Activity size={24} />
                            <h3 className="text-xl font-black italic uppercase italic tracking-tighter italic text-white italic uppercase italic tracking-tighter italic mr-[-2px]">TRẠNG THÁI AI</h3>
                        </div>
                        <p className="text-blue-100 font-medium text-sm italic uppercase tracking-tighter italic leading-relaxed">
                            "Cơ thể bạn đang ở trạng thái hồi phục tốt. Chỉ số mỡ cơ thể đã giảm 1.2% so với tháng trước."
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
