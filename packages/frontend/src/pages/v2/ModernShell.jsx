import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Dumbbell,
    Scan,
    Calendar,
    Utensils,
    User,
    LogOut,
    Menu,
    X,
    Bell,
    Search
} from 'lucide-react';
import { useAuth } from '../../context/auth.context.jsx';

const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Bảng điều khiển' },
    { path: '/ai-trainer', icon: Scan, label: 'AI Trainer' },
    { path: '/exercises', icon: Dumbbell, label: 'Bài tập' },
    { path: '/plans', icon: Calendar, label: 'Kế hoạch' },
    { path: '/nutrition', icon: Utensils, label: 'Dinh dưỡng' },
    { path: '/profile', icon: User, label: 'Cá nhân' },
];

const ModernShell = ({ children }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col md:flex-row overflow-x-hidden">
            {/* Sidebar - Desktop */}
            <aside className="hidden md:flex w-72 h-screen fixed left-0 top-0 bg-white border-r border-slate-100 flex-col p-8 z-50">
                <div className="flex items-center gap-3 mb-12">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                        <Dumbbell className="text-white" size={24} />
                    </div>
                    <span className="text-2xl font-black tracking-tight text-blue-600 italic uppercase italic tracking-tighter italic">FITNEXUS</span>
                </div>

                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all duration-300
                ${isActive
                                    ? 'bg-blue-50 text-blue-600 shadow-sm'
                                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}
              `}
                        >
                            <item.icon size={22} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="mt-auto space-y-4">
                    <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-200 rounded-full overflow-hidden">
                            {user?.avatar_url ? (
                                <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                    <User size={20} />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold truncate">{user?.username || 'Người dùng'}</p>
                            <p className="text-xs text-slate-400 truncate tracking-tight italic uppercase italic tracking-tighter italic font-black">Level 12</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-4 px-5 py-4 w-full rounded-2xl font-bold text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all duration-300"
                    >
                        <LogOut size={22} />
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 md:ml-72 flex flex-col relative min-h-screen animate-reveal">
                {/* Top bar for Desktop & Header for Mobile */}
                <header className={`
          sticky top-0 right-0 z-40 px-6 py-4 md:px-12 flex items-center justify-between transition-all duration-300
          ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-soft' : 'bg-transparent'}
        `}>
                    {/* Mobile Logo Visibility */}
                    <div className="flex md:hidden items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200">
                            <Dumbbell className="text-white" size={18} />
                        </div>
                        <span className="text-xl font-black tracking-tight text-blue-600 italic uppercase italic tracking-tighter italic">FITNEXUS</span>
                    </div>

                    {/* Page Title Context in Shell? or search? */}
                    <div className="hidden md:flex flex-1 max-w-md relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm bài tập..."
                            className="w-full pl-12 pr-6 py-3 bg-slate-50 border-none rounded-2xl font-semibold text-sm focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors bg-white shadow-soft rounded-xl">
                            <Bell size={20} />
                        </button>
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden w-10 h-10 flex items-center justify-center text-slate-400 bg-white shadow-soft rounded-xl"
                        >
                            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </header>

                {/* Content Wrapper */}
                <div className="flex-1 p-6 md:p-12 animate-scale">
                    {children}
                </div>
            </main>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 bg-white z-[60] p-8 animate-reveal">
                    <div className="flex items-center justify-between mb-12">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                                <Dumbbell className="text-white" size={24} />
                            </div>
                            <span className="text-2xl font-black tracking-tight text-blue-600">FITNEXUS</span>
                        </div>
                        <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400">
                            <X size={28} />
                        </button>
                    </div>

                    <nav className="space-y-4">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={({ isActive }) => `
                  flex items-center gap-5 px-6 py-5 rounded-2xl font-bold text-lg transition-all
                  ${isActive
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                        : 'text-slate-400'}
                `}
                            >
                                <item.icon size={26} />
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>

                    <button
                        onClick={handleLogout}
                        className="absolute bottom-12 left-8 right-8 py-5 border-2 border-slate-100 rounded-3xl font-black text-slate-400 flex items-center justify-center gap-3"
                    >
                        <LogOut size={22} /> ĐĂNG XUẤT
                    </button>
                </div>
            )}
        </div>
    );
};

export default ModernShell;
