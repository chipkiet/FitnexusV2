import React, { useState, useEffect } from 'react';
import {
    Activity,
    Flame,
    Clock,
    ChevronRight,
    Menu,
    X,
    Search,
    Instagram,
    Facebook,
    Twitter,
    Youtube,
    ArrowRight,
    Trophy,
    Target,
    Zap,
    TrendingUp,
    Layout,
    Dumbbell,
    Calendar,
    Utensils,
    Users
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const FitNexusDashboard = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Khám phá');
    const [selectedMuscle, setSelectedMuscle] = useState('Tất cả');

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);

        // Simulate initial loading for skeleton effect
        setTimeout(() => setIsLoading(false), 2000);

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const progressData = [
        { name: 'Thứ 2', val: 450 },
        { name: 'Thứ 3', val: 320 },
        { name: 'Thứ 4', val: 680 },
        { name: 'Thứ 5', val: 490 },
        { name: 'Thứ 6', val: 720 },
        { name: 'Thứ 7', val: 550 },
        { name: 'CN', val: 300 },
    ];

    const categories = ['Tất cả', 'Ngực', 'Lưng', 'Chân', 'Vai', 'Tay'];

    const exercises = [
        { id: 1, name: 'Dumbbell Chest Press', muscle: 'Ngực', level: 'Trung bình', img: '/assets/design/chest.png', tags: ['Tăng cơ', 'Sức mạnh'] },
        { id: 2, name: 'Barbell Back Squat', muscle: 'Chân', level: 'Khó', img: '/assets/design/squat.png', tags: ['Thăng bằng', 'Sức mạnh'] },
        { id: 3, name: 'Weighted Pull-ups', muscle: 'Lưng', level: 'Khó', img: 'https://images.unsplash.com/photo-1598971639058-aba71844b353?q=80&w=2070&auto=format&fit=crop', tags: ['Definition'] },
        { id: 4, name: 'Lat Pulldown', muscle: 'Lưng', level: 'Dễ', img: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=2070&auto=format&fit=crop', tags: ['Cơ bản'] },
    ];

    const SkeletonCard = () => (
        <div className="bg-white rounded-[24px] p-4 shadow-sm border border-slate-100 h-full">
            <div className="aspect-[4/5] rounded-[20px] skeleton mb-4"></div>
            <div className="h-6 w-3/4 skeleton mb-3 rounded-md"></div>
            <div className="h-4 w-1/2 skeleton mb-6 rounded-md"></div>
            <div className="h-12 w-full skeleton rounded-[16px]"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] selection:bg-blue-100 font-sans">

            {/* Dynamic Header */}
            <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'py-3' : 'py-6'}`}>
                <div className="container mx-auto px-6">
                    <div className={`flex items-center justify-between transition-all duration-500 rounded-[24px] px-6 py-3 ${scrolled ? 'glass shadow-lg shadow-blue-900/5 border-white/60 translate-y-2' : ''}`}>
                        <div className="flex items-center gap-3 group cursor-pointer">
                            <div className="w-12 h-12 bg-blue-600 rounded-[14px] flex items-center justify-center text-white shadow-lg shadow-blue-200 group-hover:rotate-6 transition-transform">
                                <Layout size={26} strokeWidth={2.5} />
                            </div>
                            <span className="text-2xl font-black tracking-tight uppercase italic font-mono text-gradient">FitNexus</span>
                        </div>

                        <nav className="hidden lg:flex items-center gap-8">
                            {['Trang chủ', 'Bài tập', 'Lịch tập', 'Kế hoạch', 'Dinh dưỡng', 'Cộng đồng'].map((item) => (
                                <a key={item} href="#" className="relative text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors py-2 group">
                                    {item}
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
                                </a>
                            ))}
                        </nav>

                        <div className="flex items-center gap-4">
                            <button className="hidden sm:block text-sm font-bold text-slate-600 hover:text-blue-600 px-4">Đăng nhập</button>
                            <button className="bg-slate-900 text-white px-8 py-3 rounded-[16px] text-sm font-bold shadow-xl shadow-slate-200 hover:bg-blue-600 hover:shadow-blue-200 transition-all active:scale-95 animate-shine">
                                Tham gia ngay
                            </button>
                            <button className="lg:hidden p-2 text-slate-800" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                                {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center pt-24 pb-16 overflow-hidden">
                {/* Background Elements */}
                <div className="absolute top-20 right-[-10%] w-[60%] aspect-square bg-blue-200/20 rounded-full blur-[120px] animate-pulse-soft"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] aspect-square bg-emerald-100/30 rounded-full blur-[100px]"></div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-20">
                        <div className="flex-[1.2] animate-reveal">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100 mb-8 animate-float">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                <span className="text-xs font-black uppercase tracking-widest text-slate-500">Live: +1,240 đang tập luyện</span>
                            </div>

                            <h1 className="text-6xl lg:text-[100px] font-black leading-[0.9] tracking-tighter mb-10 text-slate-900 drop-shadow-sm italic">
                                BẮT ĐẦU <br />
                                <span className="text-gradient">FITNESS</span> <br />
                                CỦA BẠN
                            </h1>

                            <p className="text-xl text-slate-500 mb-12 max-w-xl leading-relaxed font-semibold">
                                Nền tảng vận động tối ưu tích hợp AI, giúp bạn theo dõi tiến trình, khám phá bài tập và xây dựng cơ thể khỏe mạnh từ chuyên gia.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-6">
                                <button className="group relative px-10 py-5 bg-blue-600 text-white font-black rounded-[20px] text-lg shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 overflow-hidden">
                                    <span className="relative z-10">Bắt đầu tập luyện</span>
                                    <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform relative z-10" />
                                    <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:left-full transition-all duration-1000"></div>
                                </button>

                                <div className="flex items-center gap-4 group cursor-pointer hover:bg-white p-2 rounded-2xl transition-all">
                                    <div className="w-14 h-14 rounded-full bg-white shadow-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                        <Trophy size={26} />
                                    </div>
                                    <div>
                                        <span className="block text-sm font-black uppercase text-slate-400">Xem thành tựu</span>
                                        <span className="font-bold text-slate-900">Khám phá cộng đồng</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 relative animate-reveal [animation-delay:200ms]">
                            <div className="relative z-20 rounded-[40px] overflow-hidden shadow-[0_50px_100px_-20px_rgba(30,58,138,0.25)] border-[8px] border-white group">
                                <img
                                    src="/assets/design/hero_premium.png"
                                    alt="Premium Fitness"
                                    className="w-full h-auto scale-105 group-hover:scale-110 transition-transform duration-1000"
                                />

                                {/* Overlay Card */}
                                <div className="absolute bottom-8 left-8 right-8 glass p-6 rounded-[30px] shadow-2xl animate-float">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-emerald-500 rounded-[14px] flex items-center justify-center text-white">
                                                <Zap size={24} fill="currentColor" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-900 uppercase italic">Power Pulse</h4>
                                                <p className="text-xs font-bold text-slate-500">HIIT • 12 Phút tiếp theo</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-black text-blue-600 tracking-tighter">LEVEL 8</span>
                                            <div className="w-20 h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                                                <div className="h-full bg-blue-600 w-3/4 rounded-full"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Stat Widget */}
                            <div className="absolute -top-10 -right-10 bg-white p-6 rounded-[32px] shadow-2xl border border-slate-50 hidden xl:block animate-float [animation-delay:1s]">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-500">
                                        <Flame size={20} />
                                    </div>
                                    <div>
                                        <h5 className="font-black text-xs text-slate-400 uppercase">Streak</h5>
                                        <p className="font-black text-lg text-slate-900">12 NGÀY</p>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    {[1, 1, 1, 1, 0, 0, 0].map((v, i) => (
                                        <div key={i} className={`w-6 h-6 rounded-md ${v ? 'bg-orange-500/20 text-orange-600' : 'bg-slate-100 text-slate-300'} flex items-center justify-center text-[10px] font-bold`}>
                                            {i + 1}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Dashboard Section */}
            <section className="px-6 py-20">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Stats Area */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-3xl font-black italic uppercase tracking-tighter">Tổng quan tiến độ</h2>
                                <div className="flex gap-2">
                                    <button className="p-2 bg-white rounded-xl shadow-sm border border-slate-100"><Calendar size={20} /></button>
                                    <button className="px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100 text-sm font-bold">Tháng này</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                {[
                                    { label: 'Calories', val: '2,840', unit: 'kcal', icon: <Flame />, color: 'text-orange-500', bg: 'bg-orange-50' },
                                    { label: 'Thời gian', val: '14.5', unit: 'giờ', icon: <Clock />, color: 'text-blue-600', bg: 'bg-blue-50' },
                                    { label: 'Buổi tập', val: '08', unit: 'buổi', icon: <Activity />, color: 'text-emerald-500', bg: 'bg-emerald-50' }
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white p-6 rounded-[30px] border border-slate-100 hover:shadow-xl hover:shadow-blue-900/5 transition-all group">
                                        <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-[18px] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                            {stat.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-400 text-xs uppercase mb-2 tracking-widest">{stat.label}</h4>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-black text-slate-900">{stat.val}</span>
                                                <span className="text-sm font-bold text-slate-400 uppercase">{stat.unit}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Chart Card */}
                            <div className="bg-slate-900 rounded-[40px] p-8 md:p-10 shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full translate-x-32 -translate-y-32"></div>
                                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
                                    <div>
                                        <h3 className="text-white text-2xl font-black italic mb-2">Phân tích hiệu suất</h3>
                                        <p className="text-slate-400 font-bold text-sm">Hiệu suất tập luyện của bạn đã tăng 12% so với tuần trước.</p>
                                    </div>
                                    <div className="px-6 py-3 bg-white/10 backdrop-blur rounded-[16px] border border-white/10 text-white font-bold text-sm">
                                        Top 5% Người dùng
                                    </div>
                                </div>

                                <div className="h-[280px] w-full relative z-10">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={progressData}>
                                            <defs>
                                                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontWeight: 700, fontSize: 12 }} dy={15} />
                                            <Tooltip
                                                contentStyle={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '16px', fontWeight: 'bold' }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="val"
                                                stroke="#3B82F6"
                                                strokeWidth={4}
                                                fillOpacity={1}
                                                fill="url(#colorVal)"
                                                animationDuration={2000}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Widget Area */}
                        <div className="space-y-8">
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter">Hôm nay</h2>

                            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                                <div className="flex flex-col items-center text-center">
                                    <div className="relative w-48 h-48 mb-8">
                                        {/* Simple Progress Ring Animation with SVG */}
                                        <svg className="w-full h-full -rotate-90">
                                            <circle cx="96" cy="96" r="88" stroke="#F1F5F9" strokeWidth="12" fill="none" />
                                            <circle
                                                cx="96" cy="96" r="88"
                                                stroke="#3B82F6"
                                                strokeWidth="12"
                                                fill="none"
                                                strokeDasharray="552.92"
                                                strokeDashoffset="138.23"
                                                className="transition-all duration-1000 ease-out"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-5xl font-black text-slate-900">75%</span>
                                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Hoàn thành</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4 w-full">
                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-[20px] hover:bg-slate-100 transition-colors cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white"><Dumbbell size={16} /></div>
                                                <span className="font-bold text-sm">Tập Cardio</span>
                                            </div>
                                            <span className="text-xs font-black text-emerald-500 uppercase">Xong</span>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-[20px] hover:bg-slate-100 transition-colors cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white"><Utensils size={16} /></div>
                                                <span className="font-bold text-sm">Bữa sáng sạch</span>
                                            </div>
                                            <span className="text-xs font-black text-blue-600 uppercase italic">Tiếp theo</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Achievement Card */}
                            <div className="bg-gradient-premium rounded-[32px] p-8 text-white relative overflow-hidden group">
                                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
                                <TrendingUp className="mb-6 opacity-60" size={32} />
                                <h3 className="text-2xl font-black italic mb-4">Master Fitness</h3>
                                <p className="text-blue-100 font-bold text-sm mb-6">Bạn chỉ còn 120 điểm nữa để đạt hạng Platinum!</p>
                                <button className="w-full py-4 bg-white text-blue-600 font-black rounded-[18px] text-sm hover:scale-[1.02] active:scale-95 transition-all">
                                    Xem nhiệm vụ
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Exercises Section */}
            <section className="px-6 py-24 bg-white">
                <div className="container mx-auto">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-20 gap-10">
                        <div className="max-w-2xl animate-reveal">
                            <h3 className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs mb-4">Fitness Library</h3>
                            <h2 className="text-5xl lg:text-6xl font-black italic uppercase tracking-tighter mb-8 italic">Thư viện bài tập</h2>
                            <div className="flex flex-wrap gap-3">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedMuscle(cat)}
                                        className={`px-8 py-3 rounded-[16px] font-black text-sm transition-all ${selectedMuscle === cat ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="relative group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                                <input
                                    type="text"
                                    placeholder="Tìm bài tập..."
                                    className="pl-14 pr-8 py-5 bg-slate-50 border-none rounded-[20px] font-bold text-sm focus:ring-2 focus:ring-blue-600 w-full lg:w-80 transition-all outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                        {isLoading ? (
                            Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
                        ) : (
                            exercises.map((ex, i) => (
                                <div
                                    key={ex.id}
                                    className="group bg-white rounded-[32px] p-5 shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-blue-900/5 transition-all animate-reveal"
                                    style={{ animationDelay: `${i * 100}ms` }}
                                >
                                    <div className="relative aspect-[4/5] rounded-[24px] overflow-hidden mb-6 bg-slate-100">
                                        <img
                                            src={ex.img}
                                            alt={ex.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                        />
                                        <div className="absolute top-4 left-4 flex gap-2">
                                            {ex.tags.map(tag => (
                                                <span key={tag} className="px-3 py-1.5 bg-white/90 backdrop-blur text-[10px] font-black uppercase text-blue-600 rounded-full shadow-sm">{tag}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{ex.muscle}</span>
                                        <span className="text-[10px] font-black text-blue-600 uppercase">{ex.level}</span>
                                    </div>

                                    <h3 className="text-xl font-black text-slate-900 uppercase italic mb-8 group-hover:text-blue-600 transition-colors truncate">{ex.name}</h3>

                                    <button className="w-full py-5 bg-slate-50 group-hover:bg-blue-600 text-slate-900 group-hover:text-white font-black rounded-[20px] transition-all flex items-center justify-center gap-2">
                                        Xem chi tiết <ChevronRight size={18} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* Plans Section */}
            <section className="px-6 py-24 bg-slate-50">
                <div className="container mx-auto">
                    <div className="flex items-center gap-4 mb-20 animate-reveal">
                        <div className="w-20 h-[1px] bg-slate-300"></div>
                        <h2 className="text-4xl lg:text-5xl font-black italic uppercase tracking-tighter">Kế hoạch đặc biệt</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {[
                            { name: 'X-TREME BULK 2.0', desc: 'Thiết kế để tăng khối lượng cơ bắp tối đa trong thời gian ngắn nhất.', weeks: 12, goal: 'Hypertrophy', img: '/assets/design/plan.png' },
                            { name: 'LEAN CUT ELITE', desc: 'Đốt mỡ tầng sâu với các bài tập cường độ cao xen kẽ sức mạnh.', weeks: 8, goal: 'Fat Loss', img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop' }
                        ].map((plan, i) => (
                            <div key={i} className="group bg-white rounded-[40px] p-8 md:p-12 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-12 hover:shadow-2xl transition-all relative overflow-hidden">
                                <div className="w-full md:w-64 aspect-square rounded-[32px] overflow-hidden shrink-0 shadow-lg border-4 border-white">
                                    <img src={plan.img} alt={plan.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                </div>
                                <div className="flex flex-col justify-center animate-reveal">
                                    <div className="flex gap-3 mb-6">
                                        <span className="px-4 py-1.5 bg-blue-50 text-blue-600 font-black text-[10px] rounded-full uppercase">{plan.weeks} Tuần</span>
                                        <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 font-black text-[10px] rounded-full uppercase italic">{plan.goal}</span>
                                    </div>
                                    <h3 className="text-3xl font-black italic mb-6 uppercase tracking-tighter group-hover:text-blue-600 transition-colors leading-[0.9]">{plan.name}</h3>
                                    <p className="text-slate-500 font-bold mb-10 leading-relaxed">{plan.desc}</p>
                                    <button className="px-10 py-5 bg-slate-900 text-white font-black rounded-[20px] hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-3 w-fit">
                                        Chi tiết chương trình <ArrowRight size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white pt-32 pb-12 px-6 border-t border-slate-100 mt-20">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
                        <div className="space-y-8 flex flex-col items-center md:items-start text-center md:text-left">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-blue-600 rounded-[14px] flex items-center justify-center text-white shadow-lg">
                                    <Layout size={26} strokeWidth={2.5} />
                                </div>
                                <span className="text-2xl font-black italic uppercase italic font-mono text-gradient">FitNexus</span>
                            </div>
                            <p className="text-slate-500 font-semibold leading-relaxed max-w-xs">
                                Xây dựng nền tảng sức khỏe bền vững với công nghệ và sự kỷ luật. FitNexus đồng hành cùng bạn trên mọi hành trình.
                            </p>
                            <div className="flex gap-4">
                                {[Instagram, Facebook, Twitter, Youtube].map((Icon, i) => (
                                    <a key={i} href="#" className="w-12 h-12 rounded-[16px] border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-xl hover:shadow-blue-200 transition-all hover:-translate-y-1">
                                        <Icon size={20} />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {[
                            { title: 'Dịch vụ', links: ['Thư viện bài tập', 'Kế hoạch cá nhân', 'Dinh dưỡng AI', 'Cộng đồng'] },
                            { title: 'Công ty', links: ['Về chúng tôi', 'Blog', 'Sự nghiệp', 'Liên hệ'] },
                            { title: 'Hỗ trợ', links: ['Trung tâm trợ giúp', 'Bảo mật', 'Điều khoản', 'Câu hỏi thường gặp'] }
                        ].map((col, i) => (
                            <div key={i} className="text-center md:text-left">
                                <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-10">{col.title}</h4>
                                <ul className="space-y-5 font-bold text-slate-500">
                                    {col.links.map(link => (
                                        <li key={link}><a href="#" className="hover:text-blue-600 transition-colors flex items-center gap-2 group justify-center md:justify-start">
                                            {link} <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                        </a></li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                        <div className="flex flex-wrap justify-center gap-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-slate-900 transition-colors">Terms of Service</a>
                            <a href="#" className="hover:text-slate-900 transition-colors">Cookie Policy</a>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">© 2024 DESIGN BY FITNEXUS CORE TEAM</p>
                    </div>
                </div>
            </footer>

            {/* Background Floating Icon Bubbles */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-20">
                <div className="absolute top-[15%] left-[5%] animate-float"><Activity className="text-blue-300/30" size={100} /></div>
                <div className="absolute top-[60%] right-[10%] animate-float [animation-delay:2s]"><Zap className="text-emerald-200/30" size={120} /></div>
                <div className="absolute bottom-[20%] left-[20%] animate-float [animation-delay:4s]"><Dumbbell className="text-slate-200/30" size={80} /></div>
            </div>

        </div>
    );
};

export default FitNexusDashboard;
