import React from 'react';
import { Calendar, Users, Target, Clock, Star, ChevronRight, Activity } from 'lucide-react';

const mockPlans = [
    {
        id: 1,
        name: 'V-Taper Foundation',
        duration: '8 Tuần',
        goal: 'Phát triển vóc dáng chữ V',
        level: 'Trung bình',
        intensity: 'Cao',
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop'
    },
    {
        id: 2,
        name: 'Hypertrophy Mastery',
        duration: '12 Tuần',
        goal: 'Tăng cơ toàn diện',
        level: 'Nâng cao',
        intensity: 'Rất cao',
        rating: 5.0,
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop'
    },
    {
        id: 3,
        name: 'Summer Shred',
        duration: '6 Tuần',
        goal: 'Giảm mỡ & Cắt nét',
        level: 'Mọi cấp độ',
        intensity: 'Trung bình',
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1541534741688-6078c64b52d3?q=80&w=2070&auto=format&fit=crop'
    },
];

const PlansPage = () => {
    return (
        <div className="space-y-12 animate-reveal">
            {/* Header section */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">
                        CHƯƠNG TRÌNH <br /><span className="text-blue-600">ĐỘC QUYỀN</span>
                    </h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Lộ trình tập luyện được thiết kế bởi chuyên gia</p>
                </div>

                <div className="flex gap-4">
                    <button className="px-8 py-5 bg-white border border-slate-100 rounded-[24px] font-black text-[10px] uppercase tracking-widest flex items-center gap-3 text-slate-900 shadow-soft hover:bg-slate-50 transition-all active:scale-95">
                        <Activity size={18} /> Tất cả chương trình
                    </button>
                </div>
            </header>

            {/* Plans List */}
            <div className="space-y-8">
                {mockPlans.map((plan) => (
                    <div
                        key={plan.id}
                        className="group bg-white rounded-[48px] overflow-hidden border border-slate-50 shadow-soft transition-all duration-500 hover:shadow-hover flex flex-col lg:flex-row p-4"
                    >
                        {/* Image Section */}
                        <div className="lg:w-1/3 aspect-video lg:aspect-square rounded-[36px] overflow-hidden relative">
                            <img src={plan.image} alt={plan.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>

                            <div className="absolute top-6 left-6 px-4 py-2 bg-white/20 backdrop-blur-md rounded-xl text-[8px] font-black uppercase text-white tracking-widest border border-white/20">
                                {plan.level}
                            </div>

                            <div className="absolute bottom-8 left-8 flex items-center gap-2 text-white">
                                <Star className="text-yellow-400 fill-yellow-400" size={16} />
                                <span className="font-black text-xs italic tracking-tighter italic uppercase italic tracking-tighter italic">{plan.rating} Rating</span>
                            </div>
                        </div>

                        {/* Info Section */}
                        <div className="flex-1 p-8 lg:p-12 flex flex-col justify-between space-y-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest">
                                        <Clock size={16} /> {plan.duration}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <Target size={16} /> {plan.goal}
                                    </div>
                                </div>
                                <h2 className="text-4xl lg:text-5xl font-black italic uppercase tracking-tighter text-slate-900 italic uppercase italic tracking-tighter italic mr-[-2px]">{plan.name}</h2>
                                <p className="text-slate-400 font-medium max-w-xl text-sm italic uppercase tracking-tighter italic">
                                    Chương trình trung tâm vào việc xây dựng nền tảng sức mạnh và hoàn thiện khối lượng cơ bắp cần thiết cho tỷ lệ cơ thể lý tưởng.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                <div className="flex-1 w-full space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <span>Mật độ luyện tập</span>
                                        <span className="text-blue-600">{plan.intensity}</span>
                                    </div>
                                    <div className="h-3 bg-slate-50 rounded-full overflow-hidden p-1">
                                        <div
                                            className="h-full bg-blue-600 rounded-full animate-shine relative"
                                            style={{ width: plan.id === 1 ? '65%' : plan.id === 2 ? '90%' : '45%' }}
                                        ></div>
                                    </div>
                                </div>
                                <button className="w-full sm:w-auto px-10 py-6 bg-blue-600 text-white rounded-[24px] font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                                    Bắt đầu kế hoạch <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Custom Plan Prompt */}
            <div className="bg-slate-900 rounded-[48px] p-12 text-center space-y-8 relative overflow-hidden group">
                <div className="absolute inset-0 bg-blue-600/5 mix-blend-overlay"></div>
                <div className="relative z-10 space-y-4">
                    <h3 className="text-3xl md:text-5xl font-black italic uppercase italic tracking-tighter italic text-white italic uppercase italic tracking-tighter italic mr-[-2px]">
                        KHÔNG TÌM THẤY <span className="text-blue-500">LỘ TRÌNH PHÙ HỢP?</span>
                    </h3>
                    <p className="text-slate-400 font-medium text-lg italic uppercase tracking-tighter italic">Hãy để AI của chúng tôi thiết kế riêng một kế hoạch dựa trên mục tiêu và thể trạng của bạn.</p>
                </div>
                <button className="relative z-10 px-12 py-6 bg-white text-slate-900 rounded-[24px] font-black uppercase tracking-widest text-xs hover:bg-blue-600 hover:text-white transition-all shadow-2xl active:scale-95">
                    THIẾT KẾ KẾ HOẠCH AI
                </button>
            </div>
        </div>
    );
};

export default PlansPage;
