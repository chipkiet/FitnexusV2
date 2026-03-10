import React, { useMemo, useState } from "react";
import { NavLink, Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/auth.context.jsx";
import {
  ChevronRight,
  Home,
  LayoutDashboard,
  Users,
  UserRound,
  IdCard,
  Unlock,
  KeyRound,
  FolderKanban,
  Dumbbell,
  Wallet,
  MessageSquare,
  LifeBuoy,
  Bell, // Dùng icon Bell làm nút toggle
  Search,
  Sun,
  PanelRightClose,
  PanelRightOpen,
  Settings,
  Layout,
} from "lucide-react";
import NotificationsDropdown from "../components/common/NotificationsDropdown.jsx"; // Vẫn giữ dropdown nếu muốn, hoặc bỏ
import { useNotificationsFeed } from "../hooks/useNotificationsFeed.js";

export default function AdminLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const notificationFeed = useNotificationsFeed({ limit: 8, autoLoad: true });
  const adminNotifications = notificationFeed.items;

  // State điều khiển thanh thông báo bên phải
  const [showNotifications, setShowNotifications] = useState(true);

  // Query params
  const currentRole = (
    new URLSearchParams(location.search).get("role") || "ALL"
  ).toUpperCase();
  const currentPlan = (
    new URLSearchParams(location.search).get("plan") || "ALL"
  ).toUpperCase();

  // State menu trái
  const [open, setOpen] = useState({
    user: true,
    content: true, // Mặc định mở Content cho tiện dev
    trainer: false,
    financial: false,
    social: false,
    support: true,
  });

  const [openRoleSub, setOpenRoleSub] = useState(false);
  const [openPlanSub, setOpenPlanSub] = useState(false);

  const isActivePath = (to) =>
    location.pathname === to || location.pathname.startsWith(to + "/");
  const toggle = (key) => setOpen((s) => ({ ...s, [key]: !s[key] }));

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition ${
      isActive ? "bg-gray-100 font-medium" : ""
    }`;

  const sections = useMemo(
    () => [
      {
        key: "user",
        icon: Users,
        label: "User Manage",
        children: [
          { icon: UserRound, label: "All Users", to: "/admin/users" },
          { icon: IdCard, label: "Admin", to: "/admin/user-detail" },
          {
            icon: FolderKanban,
            label: "Quản lý Plans",
            to: "/admin/user-plans",
          },
          { icon: Unlock, label: "Lock & Unlock", to: "/admin/lock-unlock" },
          {
            icon: KeyRound,
            label: "Reset password",
            to: "/admin/reset-password",
          },
        ],
      },
      {
        key: "content",
        icon: FolderKanban,
        label: "Content Manage",
        children: [
          { icon: ChevronRight, label: "Overview", to: "/admin/content" },
          {
            icon: Dumbbell,
            label: "Exercises",
            to: "/admin/content/exercises",
          },
        ],
      },
      {
        key: "financial",
        icon: Wallet,
        label: "Financial Manage",
        children: [
          { icon: ChevronRight, label: "Overview", to: "/admin/finance" },
        ],
      },
      {
        key: "support",
        icon: LifeBuoy,
        label: "Support Desk",
        children: [
          {
            icon: MessageSquare,
            label: "Báo lỗi người dùng",
            to: "/admin/support",
          },
        ],
      },

      {
        key: "system",
        icon: Settings, // Import icon Settings từ lucide-react
        label: "Giao diện & Nội dung",
        children: [
          { icon: Layout, label: "Dashboard Hero", to: "/admin/content/hero" },
          // Sau này thêm Feature, Banner...
        ],
      },
    ],
    []
  );

  return (
    <div className="flex flex-col min-h-screen text-gray-800 bg-gray-50">
      {/* --- TOP HEADER --- */}
      <header className="sticky top-0 z-40 bg-white border-b h-14 shrink-0">
        <div className="flex items-center justify-between w-full h-full px-4">
          {/* Left: Logo & Search */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 lg:w-60">
              <div className="w-8 h-8 bg-black rounded" />
              <div className="hidden font-semibold lg:block">FITNEXUS</div>
            </div>

            <div className="relative items-center hidden gap-2 sm:flex">
              <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
              <input
                className="w-64 rounded-md border px-9 py-1.5 text-sm outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-gray-200"
                placeholder="Search..."
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 text-gray-600">
            <Sun className="w-4 h-4 cursor-pointer hover:text-orange-500" />

            {/* Nút Toggle Notification Sidebar */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2 rounded-md transition ${
                showNotifications
                  ? "bg-blue-50 text-blue-600"
                  : "hover:bg-gray-100"
              }`}
              title={showNotifications ? "Ẩn thông báo" : "Hiện thông báo"}
            >
              {showNotifications ? (
                <PanelRightClose className="w-5 h-5" />
              ) : (
                <Bell className="w-5 h-5" />
              )}
            </button>

            <div className="w-8 h-8 bg-gray-200 border border-gray-300 rounded-full" />
          </div>
        </div>
      </header>

      {/* --- MAIN LAYOUT --- */}
      <div className="flex flex-1 overflow-hidden">
        {/* 1. SIDEBAR TRÁI (Navigation) */}
        <aside className="hidden lg:flex flex-col w-80 bg-white border-r overflow-y-auto shrink-0 h-[calc(100vh-56px)] sticky top-14">
          <div className="p-4">
            <div className="mb-2 text-xs font-bold tracking-wider text-gray-400 uppercase">
              Dashboards
            </div>
            <nav className="mb-6 space-y-1 text-sm">
              <NavLink to="/admin" end className={linkClass}>
                <Home className="w-4 h-4" /> Overview
              </NavLink>
            </nav>

            <div className="mb-2 text-xs font-bold tracking-wider text-gray-400 uppercase">
              Modules
            </div>
            <nav className="space-y-1 text-sm">
              {sections.map((sec) => {
                const SecIcon = sec.icon;
                const active = sec.children.some((c) => isActivePath(c.to));
                return (
                  <div key={sec.key}>
                    <button
                      onClick={() => toggle(sec.key)}
                      className={`flex w-full items-center justify-between rounded-md px-3 py-2 transition ${
                        active
                          ? "bg-gray-100 font-medium text-gray-900"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {SecIcon && <SecIcon className="w-4 h-4" />}
                        {sec.label}
                      </span>
                      <ChevronRight
                        className={`h-4 w-4 transition-transform duration-200 ${
                          open[sec.key] ? "rotate-90" : ""
                        }`}
                      />
                    </button>

                    {open[sec.key] && (
                      <div className="pl-4 mt-1 ml-4 space-y-1 border-l-2 border-gray-100">
                        {sec.children.map((item) => (
                          <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                              `flex items-center gap-2 px-3 py-2 rounded-md text-sm transition ${
                                isActive
                                  ? "bg-blue-50 text-blue-700 font-medium"
                                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                              }`
                            }
                            end={
                              item.to === "/admin" ||
                              item.to === "/admin/content"
                            } // Exact match logic
                          >
                            {item.icon && <item.icon className="w-3.5 h-3.5" />}
                            {item.label}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* 2. MAIN CONTENT (Center) */}
        <main className="flex-1 min-w-0 overflow-y-auto h-[calc(100vh-56px)] bg-gray-50 scroll-smooth">
          <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 border-b bg-white/80 backdrop-blur-md">
            <div className="text-sm text-gray-500">
              <Link to="/admin" className="hover:text-blue-600">
                Admin
              </Link>
              <span className="mx-2 text-gray-300">/</span>
              <span className="font-medium text-gray-900 capitalize">
                {location.pathname.split("/").pop().replace(/-/g, " ")}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="font-medium text-gray-600">
                {user?.username || user?.email}
              </span>
              <button
                onClick={logout}
                className="px-3 py-1 text-red-600 transition border border-red-100 rounded hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>

        {/* 3. SIDEBAR PHẢI (Notifications) - Collapsible */}
        <aside
          className={`
            fixed inset-y-0 right-0 z-50 bg-white border-l shadow-xl transform transition-transform duration-300 ease-in-out
            lg:relative lg:translate-x-0 lg:shadow-none lg:z-auto
            ${
              showNotifications
                ? "w-80 translate-x-0"
                : "w-0 translate-x-full lg:w-0 border-none"
            }
          `}
          style={{ overflow: "hidden" }} // Ẩn nội dung khi width = 0
        >
          <div className="flex flex-col h-full p-4 overflow-y-auto w-80">
            {" "}
            {/* Container cố định w-80 để nội dung không bị méo khi co lại */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b">
              <h3 className="flex items-center gap-2 font-bold text-gray-800">
                <Bell className="w-4 h-4 text-blue-600" /> Notifications
              </h3>
              <button
                type="button"
                className="text-xs font-medium text-blue-600 hover:underline"
                onClick={notificationFeed.markAll}
              >
                Đánh dấu đã đọc
              </button>
            </div>
            {notificationFeed.loading ? (
              <div className="flex justify-center py-4">
                <span className="loader"></span>
              </div>
            ) : adminNotifications.length === 0 ? (
              <p className="py-4 text-sm text-center text-gray-400">
                Không có thông báo mới.
              </p>
            ) : (
              <ul className="space-y-4">
                {adminNotifications.map((item) => (
                  <li key={item.notification_id} className="flex gap-3 group">
                    <div
                      className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                        item.read_at ? "bg-gray-300" : "bg-red-500"
                      }`}
                    />
                    <div>
                      <p
                        className={`text-sm text-gray-800 ${
                          item.read_at ? "" : "font-semibold"
                        }`}
                      >
                        {item.title}
                      </p>
                      {item.body && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                          {item.body}
                        </p>
                      )}
                      <p className="text-[10px] text-gray-400 mt-1">
                        {new Date(item.created_at).toLocaleString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "numeric",
                          month: "numeric",
                        })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
