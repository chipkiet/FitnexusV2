import React, { useState } from 'react';
import { Search, Filter, Dumbbell, Zap, ChevronRight, Play } from 'lucide-react';

const mockExercises = [
    { id: 1, name: 'Dumbbell Bench Press', muscle: 'Ngực', level: 'Trung bình', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop', equipment: 'Tạ đơn' },
    { id: 2, name: 'Barbell Squat', muscle: 'Chân', level: 'Trung bình', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop', equipment: 'Thanh đòn' },
    { id: 3, name: 'Deadlift', muscle: 'Lưng/Chân', level: 'Nâng cao', image: 'https://images.unsplash.com/photo-1541534741688-6078c64b52d3?q=80&w=2070&auto=format&fit=crop', equipment: 'Thanh đòn' },
    { id: 4, name: 'Pull Ups', muscle: 'Lưng', level: 'Trung bình', image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=2070&auto=format&fit=crop', equipment: 'Xà đơn' },
    { id: 5, name: 'Bicep Curls', muscle: 'Tay trước', level: 'Cơ bản', image: 'https://images.unsplash.com/photo-1581009146145-b5ef03a7403f?q=80&w=2070&auto=format&fit=crop', equipment: 'Tạ đơn' },
    { id: 6, name: 'Lat Pulldown', muscle: 'Lưng', level: 'Cơ bản', image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=2070&auto=format&fit=crop', equipment: 'Máy' },
];

const TrainingPage = () => {
    const [activeFilter, setActiveFilter] = useState('Tất cả');

    return (
        <div className="space-y-10 animate-reveal">
            {/* Header section */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">
                        THƯ VIỆN <br /><span className="text-blue-600">BÀI TẬP</span>
                    </h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Khám phá +500 bài tập từ chuyên gia</p>
                </div>

                <div className="flex bg-slate-50 p-2 rounded-3xl overflow-x-auto no-scrollbar gap-2 shrink-0">
                    {['Tất cả', 'Ngực', 'Lưng', 'Chân', 'Vai', 'Tay'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setActiveFilter(f)}
                            className={`
                                px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap
                                ${activeFilter === f ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}
                            `}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </header>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm tên bài tập..."
                        className="w-full pl-14 pr-8 py-5 bg-white border border-slate-100 rounded-[24px] font-bold text-slate-900 shadow-soft focus:ring-4 focus:ring-blue-50 transition-all outline-none"
                    />
                </div>
                <div className="flex gap-4">
                    <button className="px-8 py-5 bg-white border border-slate-100 rounded-[24px] font-black text-[10px] uppercase tracking-widest flex items-center gap-3 text-slate-900 shadow-soft hover:bg-slate-50 transition-all active:scale-95">
                        <Filter size={18} /> Lọc theo dụng cụ
                    </button>
                    <button className="px-8 py-5 bg-white border border-slate-100 rounded-[24px] font-black text-[10px] uppercase tracking-widest flex items-center gap-3 text-slate-900 shadow-soft hover:bg-slate-50 transition-all active:scale-95">
                        <Zap size={18} /> Mức độ
                    </button>
                </div>
            </div>

            {/* Exercise Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {mockExercises.map((ex) => (
                    <div
                        key={ex.id}
                        className="group bg-white rounded-[40px] overflow-hidden border border-slate-50 shadow-soft transition-all duration-500 hover:-translate-y-3 hover:shadow-hover cursor-pointer relative"
                    >
                        {/* Image Container */}
                        <div className="aspect-[4/3] overflow-hidden relative">
                            <img
                                src={ex.image}
                                alt={ex.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white">
                                    <Play size={20} fill="currentColor" />
                                </div>
                            </div>

                            <div className="absolute top-6 left-6 px-4 py-2 bg-white/80 backdrop-blur rounded-xl text-[8px] font-black uppercase tracking-widest shadow-sm">
                                {ex.equipment}
                            </div>
                            <div className={`
                                absolute top-6 right-6 px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest shadow-sm text-white
                                ${ex.level === 'Cơ bản' ? 'bg-emerald-500' : ex.level === 'Trung bình' ? 'bg-blue-600' : 'bg-orange-600'}
                             `}>
                                {ex.level}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8 space-y-4">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{ex.muscle}</p>
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 truncate italic">{ex.name}</h3>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                                        <Dumbbell size={14} />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Xem kỹ thuật</span>
                                </div>
                                <ChevronRight className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" size={20} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination/Load More */}
            <div className="flex justify-center pt-10">
                <button className="px-12 py-6 bg-slate-50 text-slate-900 rounded-[24px] font-black uppercase tracking-widest text-xs hover:bg-slate-900 hover:text-white transition-all active:scale-95">
                    Tải thêm bài tập
                </button>
            </div>
        </div>
    );
};

export default TrainingPage;
