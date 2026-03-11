import React from 'react';
import { Utensils, Coffee, Sun, Moon, Plus, ChevronRight, Apple, Zap, Flame } from 'lucide-react';

const mockMeals = [
    { id: 1, type: 'Bữa sáng', name: 'Yến mạch & Trái cây', calories: 350, protein: 15, carbs: 55, fat: 8, image: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?q=80&w=2070&auto=format&fit=crop' },
    { id: 2, type: 'Bữa trưa', name: 'Ức gà áp chảo & Khoai tây', calories: 550, protein: 45, carbs: 40, fat: 12, image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=1974&auto=format&fit=crop' },
    { id: 3, type: 'Bữa tối', name: 'Salad Cá hồi & Bơ', calories: 450, protein: 35, carbs: 15, fat: 22, image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=1974&auto=format&fit=crop' },
];

const NutritionPage = () => {
    return (
        <div className="space-y-12 animate-reveal pb-20">
            {/* Header section */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">
                        DINH DƯỠNG <br /><span className="text-blue-600">THÔNG MINH</span>
                    </h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">AI gợi ý thực đơn tối ưu cho cơ bắp</p>
                </div>

                <div className="flex gap-4">
                    <button className="px-8 py-5 bg-white border border-slate-100 rounded-[24px] font-black text-[10px] uppercase tracking-widest flex items-center gap-3 text-slate-900 shadow-soft hover:bg-slate-50 transition-all active:scale-95">
                        <Apple size={18} /> Ghi nhận món ăn
                    </button>
                </div>
            </header>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Calorie Counter Card */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-slate-900 rounded-[48px] p-10 text-white space-y-10 relative overflow-hidden group shadow-2xl shadow-blue-100/20">
                        <div className="space-y-2 relative z-10">
                            <h3 className="text-2xl font-black italic uppercase italic tracking-tighter italic text-white italic uppercase italic tracking-tighter italic mr-[-2px]">DAILY CALORIES</h3>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[8px]">Mục tiêu: 2,400 kcal</p>
                        </div>

                        <div className="flex flex-col items-center justify-center space-y-4 relative z-10">
                            <div className="w-48 h-48 relative">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                    <circle className="text-white/10" strokeWidth="8" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                                    <circle className="text-blue-500" strokeWidth="8" strokeDasharray={`${1350 / 2400 * 251}, 251`} strokeLinecap="round" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-4xl font-black italic uppercase italic tracking-tighter italic text-white italic uppercase italic tracking-tighter italic mr-[-2px]">1,350</span>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">còn lại</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 relative z-10">
                            {[
                                { label: 'PRO', val: '45/180g', color: 'bg-blue-500' },
                                { label: 'CARB', val: '120/250g', color: 'bg-emerald-500' },
                                { label: 'FAT', val: '35/80g', color: 'bg-orange-500' }
                            ].map((macro, i) => (
                                <div key={i} className="text-center space-y-2">
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{macro.label}</span>
                                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                        <div className={`h-full ${macro.color} w-1/2`}></div>
                                    </div>
                                    <span className="text-[8px] font-black text-white/60">{macro.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Meal Plans */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="space-y-6">
                        {mockMeals.map((meal) => (
                            <div key={meal.id} className="bg-white p-4 rounded-[40px] border border-slate-50 shadow-soft flex items-center gap-6 group card-lift cursor-pointer">
                                <div className="w-32 h-32 rounded-[32px] overflow-hidden shrink-0">
                                    <img src={meal.image} alt={meal.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-3">
                                        {meal.type === 'Bữa sáng' ? <Coffee className="text-orange-400" size={16} /> : meal.type === 'Bữa trưa' ? <Sun className="text-yellow-500" size={16} /> : <Moon className="text-blue-600" size={16} />}
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{meal.type}</span>
                                    </div>
                                    <h4 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 italic uppercase italic tracking-tighter italic mr-[-2px]">{meal.name}</h4>
                                    <div className="flex gap-6">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest">
                                            <Flame size={14} /> {meal.calories} kcal
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">
                                            <Zap size={14} /> {meal.protein}g Protein
                                        </div>
                                    </div>
                                </div>
                                <button className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all mr-4">
                                    <Plus size={24} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="p-10 bg-blue-50/50 rounded-[48px] border border-blue-50 flex items-center justify-between group cursor-pointer hover:bg-blue-50 transition-all">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-blue-600 shadow-sm">
                                <Apple size={32} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-xl font-black italic uppercase tracking-tighter text-blue-900 italic uppercase italic tracking-tighter italic mr-[-2px]">YÊU CẦU THỰC ĐƠN AI</h4>
                                <p className="text-sm font-semibold text-blue-800/60 italic uppercase tracking-tighter italic">Tùy chỉnh bữa ăn dựa trên cân nặng và mục tiêu của bạn.</p>
                            </div>
                        </div>
                        <ChevronRight className="text-blue-300 group-hover:translate-x-1 transition-all" size={24} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NutritionPage;
