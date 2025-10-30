import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import logoDark from '../../assets/logodark.png';
import { useTheme } from '../../context/theme.context.jsx';
import { useAuth } from '../../context/auth.context.jsx';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, loading, logout, refreshUser } = useAuth();
  const { isDark } = useTheme();
  const isPremium = !!(
    user && ((user.user_type && String(user.user_type).toLowerCase() === 'premium') || user.plan === 'PREMIUM')
  );
  const isAdmin = !!(user && String(user.role || '').toUpperCase() === 'ADMIN');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const onDocClick = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  // Ensure we have latest user on mount if needed
  useEffect(() => {
    if (!user && !loading) {
      // Best-effort refresh; safe no-op if already loaded
      refreshUser().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-xl">
      <div className="flex items-center justify-between px-6 py-4 mx-auto max-w-7xl">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="shrink-0 -m-1.5 p-1.5"
        >
          <img src={isDark ? logoDark : logo} alt="Fitnexus logo" className="h-10" />
        </button>

        <nav className="items-center hidden gap-6 md:flex">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-base text-gray-800 hover:underline"
          >
            Trang chủ
          </button>
          <button
            type="button"
            onClick={() => navigate('/modeling-preview')}
            className="text-base text-gray-800 hover:underline"
          >
            Mô hình hoá
          </button>
          <button
            type="button"
            onClick={() => navigate('/exercises')}
            className="text-base text-gray-800 hover:underline"
          >
            Thư viện tập
          </button>
          <button
            type="button"
            onClick={() => navigate('/nutrition-ai')}
            className="text-base text-gray-800 hover:underline"
          >
            Dinh dưỡng
          </button>

          {user && !isPremium && !isAdmin && (
            <button
              type="button"
              onClick={() => navigate('/pricing')}
              className="px-3 py-1.5 text-sm font-semibold text-white bg-indigo-600 rounded hover:bg-indigo-700"
            >
              Nâng cấp Premium
            </button>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" aria-label="Đang tải" />
          ) : user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center justify-center w-10 h-10 text-sm font-medium text-white rounded-full bg-gradient-to-r from-blue-400 to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </button>
              {menuOpen && (
                <div className="absolute right-0 z-50 w-48 mt-2 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="px-3 py-2 text-sm text-gray-700">
                    <div className="font-semibold truncate">{user.fullName || user.username || 'Người dùng'}</div>
                    <div className="text-xs text-gray-500 truncate">{user.email || ''}</div>
                  </div>
                  <div className="h-px bg-gray-200" />
                  <button
                    onClick={async () => {
                      setMenuOpen(false);
                      await logout();
                      navigate('/login');
                    }}
                    className="block w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-100"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-sm text-gray-700 hover:underline"
            >
              Đăng nhập
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

