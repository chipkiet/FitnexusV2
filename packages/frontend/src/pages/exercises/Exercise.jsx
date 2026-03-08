import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { addExerciseToPlanApi, getPlanByIdApi } from "../../lib/api.js";
import HeaderLogin from "../../components/header/HeaderLogin.jsx";
import { useMuscleTree } from "../../hooks/muscleTree.js";
import StartWorkoutButton from "../../components/workout/StartWorkoutButton.jsx";

import {
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Plus,
  Calendar,
  Play,
  Dumbbell,
  Check,
  X,
  Menu,
  Heart,
  Bookmark,
} from "lucide-react";

// --- CUSTOM CSS FOR HIGH-END NEUTRAL AESTHETIC ---
const CustomStyles = () => (
  <style>{`
    * {
      -webkit-tap-highlight-color: transparent;
      outline: none !important;
    }
    .custom-scrollbar::-webkit-scrollbar {
      width: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.1);
      border-radius: 20px;
    }
    .floating-active {
      background: #ffffff !important;
      box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.1), 0 4px 10px -2px rgba(0, 0, 0, 0.05) !important;
      border: 1px solid rgba(0, 0, 0, 0.08) !important;
      color: #000000 !important;
    }
    .card-border-hover:hover {
      border-color: rgba(0, 0, 0, 0.1);
    }
    .letter-spacing-tight {
      letter-spacing: -0.02em;
    }
  `}</style>
);

// --- COMPONENT: Modern Muscle Accordion ---
const MuscleAccordion = ({ parent, selectedId, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isParentActive = selectedId === parent.id;
  const hasChildActive = parent.children?.some((c) => c.id === selectedId);
  const hasChildren = parent.children && parent.children.length > 0;

  // Auto open if child is active
  useEffect(() => {
    if (parent.children?.some((c) => c.id === selectedId)) {
      setIsOpen(true);
    }
  }, [selectedId, parent]);

  return (
    <div className="mb-3">
      {/* PARENT BUTTON */}
      <button
        onClick={() => {
          onSelect(parent);
          if (hasChildren) setIsOpen(!isOpen);
        }}
        className={`
          w-full flex items-center justify-between px-5 py-3.5 rounded-2xl
          transition-all duration-500 group relative select-none
          ${isParentActive
            ? "floating-active scale-[1.02]"
            : hasChildActive
              ? "text-zinc-900"
              : "text-zinc-400 hover:text-zinc-900"
          }
        `}
      >
        <div className="relative z-10 flex items-center flex-1 gap-4">
          <span
            className={`text-[14px] leading-none tracking-tight truncate ${isParentActive ? "font-black" : "font-bold"
              }`}
          >
            {parent.name}
          </span>
        </div>

        {/* Counter & Chevron */}
        <div className="relative z-10 flex items-center gap-2.5">
          {hasChildren && (
            <span
              className={`text-[9px] font-black px-1.5 py-0.5 rounded transition-colors
              ${isParentActive ? "bg-zinc-100 text-zinc-600" : "bg-zinc-50 text-zinc-300"}
            `}
            >
              {parent.children.length}
            </span>
          )}

          {hasChildren && (
            <div
              className={`
              transition-transform duration-500 
              ${isOpen ? "rotate-180" : "rotate-0"}
              ${isParentActive ? "text-zinc-900" : "text-zinc-300 group-hover:text-zinc-400"}
            `}
            >
              <ChevronDown className="w-3.5 h-3.5 stroke-[4px]" />
            </div>
          )}
        </div>
      </button>

      {/* CHILDREN LIST */}
      {hasChildren && (
        <div
          className={`
          overflow-hidden transition-all duration-500 ease-in-out
          ${isOpen ? "max-h-[1000px] opacity-100 mt-2" : "max-h-0 opacity-0"}
        `}
        >
          <div className="ml-4 space-y-1 py-1">
            {parent.children.map((child) => {
              const isChildActive = selectedId === child.id;
              return (
                <button
                  key={child.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(child);
                  }}
                  className={`
                    w-full text-left px-5 py-2.5 rounded-2xl text-[12.5px]
                    transition-all duration-300 flex items-center justify-between
                    group/child relative
                    ${isChildActive
                      ? "floating-active font-black"
                      : "text-zinc-400 hover:text-zinc-900 font-bold"
                    }
                  `}
                >
                  <span className="relative z-10 truncate">{child.name}</span>
                  {!isChildActive && (
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover/child:opacity-100 transition-all -translate-x-1 group-hover/child:translate-x-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default function Exercise() {
  const navigate = useNavigate();
  const { muscleTree } = useMuscleTree();

  // --- STATE ---
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Filters
  const [q, setQ] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState(null);
  const [level, setLevel] = useState("");
  const [equipment, setEquipment] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 24;

  const [filterOptions, setFilterOptions] = useState({
    levels: [],
    equipments: [],
  });

  // Context
  const [currentPlan, setCurrentPlan] = useState(() => {
    try {
      return JSON.parse(
        sessionStorage.getItem("current_plan_context") || "null"
      );
    } catch {
      return null;
    }
  });
  const [todayList, setTodayList] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("today_workout") || "[]");
    } catch {
      return [];
    }
  });
  const [planItemsSet, setPlanItemsSet] = useState(new Set());
  const [toastMsg, setToastMsg] = useState(null);

  // Favorites & Bookmarks logic
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("fitnexus_favorites") || "[]");
    } catch { return []; }
  });
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("fitnexus_bookmarks") || "[]");
    } catch { return []; }
  });
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  useEffect(() => {
    localStorage.setItem("fitnexus_favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem("fitnexus_bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  const toggleFavorite = (id) => {
    setFavorites(prev => {
      const current = Array.isArray(prev) ? prev : [];
      return current.includes(id) ? current.filter(i => i !== id) : [...current, id];
    });
  };
  const toggleBookmark = (id) => {
    setBookmarks(prev => {
      const current = Array.isArray(prev) ? prev : [];
      return current.includes(id) ? current.filter(i => i !== id) : [...current, id];
    });
  };

  // --- INIT & FETCH ---
  useEffect(() => {
    axios
      .get("/api/exercises/filter/meta")
      .then((res) => {
        if (res.data?.success) setFilterOptions(res.data.data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const fetchEx = async () => {
      setLoading(true);
      try {
        let url = "/api/exercises";
        if (selectedMuscle) {
          // --- LOGIC QUAN TRỌNG: Ưu tiên dùng slug chuẩn ---
          // Nếu database lưu "Ngực" là name, "nguc" là slug, ta cần dùng "nguc" để gửi lên.
          // Nhưng code cũ của bạn có thể đang dùng name để filter.
          // Hãy thử dùng slug trước, nếu API lỗi thì fallback về name.

          const slugToSend = selectedMuscle.slug || selectedMuscle.name;
          url = `/api/exercises/muscle/${encodeURIComponent(slugToSend)}`;
        }

        const res = await axios.get(url, {
          params: { page, pageSize, q, difficulty: level, equipment },
        });
        if (res.data?.success) {
          let list = res.data.data || [];
          if (showOnlyFavorites) {
            list = list.filter(ex => Array.isArray(favorites) && favorites.includes(ex.id));
          }
          setExercises(list);
          setTotal(showOnlyFavorites ? list.length : (res.data.total || 0));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    const t = setTimeout(fetchEx, 300);
    return () => clearTimeout(t);
  }, [page, q, selectedMuscle, level, equipment, showOnlyFavorites, favorites]);

  // --- ACTIONS ---
  const handleSelectMuscle = (muscle) => {
    setSelectedMuscle((prev) => (prev?.id === muscle.id ? null : muscle));
    setPage(1);
    if (window.innerWidth < 1024) setShowMobileMenu(false);
  };

  const addToPlan = async (ex) => {
    if (!currentPlan?.plan_id)
      return navigate(`/plans/select?exerciseId=${ex.id}`);
    try {
      await addExerciseToPlanApi({
        planId: currentPlan.plan_id,
        exercise_id: ex.id,
      });
      setPlanItemsSet((p) => new Set([...p, String(ex.id)]));
      setToastMsg(`Đã thêm ${ex.name}`);
      setTimeout(() => setToastMsg(null), 2000);
    } catch {
      alert("Lỗi thêm Plan");
    }
  };

  useEffect(
    () => sessionStorage.setItem("today_workout", JSON.stringify(todayList)),
    [todayList]
  );

  useEffect(() => {
    if (!currentPlan?.plan_id) return;
    getPlanByIdApi(currentPlan.plan_id)
      .then((res) => {
        const ids = new Set(
          (res?.data?.items || []).map((it) =>
            String(it.exercise?.id ?? it.exercise_id)
          )
        );
        setPlanItemsSet(ids);
      })
      .catch(() => { });
  }, [currentPlan]);

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-zinc-900 font-sans">
      <CustomStyles />
      <HeaderLogin />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-10">
        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="lg:hidden p-3 bg-white border border-zinc-200 rounded-2xl shadow-xl flex items-center gap-2 mb-8 group active:scale-95 transition-all w-full justify-center"
        >
          <Filter className="w-5 h-5 text-black group-hover:rotate-12 transition-transform" />
          <span className="text-[11px] font-black tracking-widest uppercase">FILTERS & FAVORITES</span>
        </button>

        <div className="flex gap-12 lg:gap-16">
          {/* ================= SIDEBAR ================= */}
          <aside
            className={`
            fixed inset-0 z-[60] lg:static lg:z-auto lg:block w-[320px] shrink-0
            ${showMobileMenu ? "flex" : "hidden"}
          `}
          >
            {/* Backdrop for Mobile */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setShowMobileMenu(false)}
            />

            <div className="relative w-full h-full bg-[#F5F5F5] custom-scrollbar overflow-y-auto lg:h-auto lg:bg-transparent lg:sticky lg:top-[100px]">
              {/* Sidebar Header (Mobile Only) */}
              <div className="flex items-center justify-between p-6 lg:hidden">
                <span className="text-xl font-black tracking-tighter">NAVIGATE</span>
                <button onClick={() => setShowMobileMenu(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* 1. PLAN & TODAY WIDGETS */}
              <div className="mb-10 space-y-6">
                {/* Plan Context */}
                <div
                  className={`p-6 rounded-[32px] transition-all duration-500 relative border border-transparent ${currentPlan
                    ? "bg-white shadow-2xl shadow-zinc-200/50 border-zinc-100"
                    : "bg-zinc-100/30 border-dashed border-zinc-200"
                    }`}
                >
                  <div className="flex items-baseline justify-between mb-4">
                    <span className="text-[10px] font-black tracking-[0.2em] text-zinc-400 uppercase">
                      ACTIVE PLAN
                    </span>
                    {currentPlan && (
                      <button
                        onClick={() => {
                          sessionStorage.removeItem("current_plan_context");
                          setCurrentPlan(null);
                        }}
                        className="text-[9px] font-black text-zinc-300 hover:text-red-500 transition-colors"
                      >
                        DISMISS
                      </button>
                    )}
                  </div>
                  {currentPlan ? (
                    <div>
                      <div className="text-lg font-black text-black leading-tight mb-1 tracking-tighter">
                        {currentPlan.name}
                      </div>
                      <div className="text-[11px] font-bold text-zinc-400">
                        {planItemsSet.size} CURATED ITEMS
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => navigate("/plans/select")}
                      className="w-full flex items-center justify-between py-1 group"
                    >
                      <span className="text-sm font-black text-zinc-900">Choose a Plan</span>
                      <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>

                {/* Today Goals */}
                <div className="p-6 bg-white rounded-[32px] shadow-2xl shadow-zinc-200/60 border border-zinc-100 relative group overflow-hidden">
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-[10px] font-black tracking-[0.2em] text-zinc-400 uppercase">
                      DAILY GOALS
                    </span>
                    {todayList.length > 0 && (
                      <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.4)] animate-pulse" />
                    )}
                  </div>

                  {todayList.length === 0 ? (
                    <div className="py-6 text-center">
                      <p className="text-xs font-bold text-zinc-300 mb-1">Your list is empty</p>
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Select exercises to start</p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="space-y-2 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
                        {todayList.map((ex, i) => (
                          <div
                            key={i}
                            className="flex justify-between items-center bg-zinc-50/50 p-3 rounded-2xl group/item hover:bg-zinc-100/50 transition-all border border-transparent hover:border-zinc-200/30"
                          >
                            <span className="text-xs font-black text-zinc-800 truncate pr-2">
                              {ex.name}
                            </span>
                            <button
                              onClick={() =>
                                setTodayList((p) =>
                                  p.filter((_, idx) => idx !== i)
                                )
                              }
                              className="text-zinc-300 hover:text-black transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <StartWorkoutButton
                        exercises={todayList}
                        className="w-full py-4 text-[11px] font-black tracking-[0.2em] text-white bg-black rounded-2xl shadow-xl hover:bg-zinc-800 hover:-translate-y-1 active:translate-y-0 transition-all uppercase"
                      >
                        Ignite Session
                      </StartWorkoutButton>
                    </div>
                  )}
                </div>
              </div>

              <hr className="mb-6 border-gray-200" />

              {/* 2. SEARCH & DROPDOWNS */}
              <div className="mb-10 space-y-6 px-2">
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">
                      SEARCH
                    </label>
                    {(q || level || equipment) && (
                      <button
                        onClick={() => { setQ(""); setLevel(""); setEquipment(""); }}
                        className="text-[9px] font-black text-zinc-300 hover:text-black transition-colors"
                      >
                        RESET ALL
                      </button>
                    )}
                  </div>
                  <div className="relative group">
                    <Search className="absolute w-5 h-5 text-zinc-300 transition-all -translate-y-1/2 left-5 top-1/2 group-focus-within:text-black group-focus-within:scale-110" />
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Type exercise name..."
                      className="w-full pl-14 pr-6 py-4 text-sm bg-white border border-zinc-100 shadow-2xl shadow-zinc-200/40 rounded-[20px] focus:border-black outline-none transition-all font-bold placeholder:text-zinc-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative group">
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                      className="w-full pl-5 pr-10 py-3.5 text-[11px] bg-white border border-zinc-100 rounded-[18px] outline-none focus:border-black shadow-xl shadow-zinc-200/30 appearance-none cursor-pointer font-black transition-all hover:bg-zinc-50 tracking-wider uppercase"
                    >
                      <option value="">Difficulty</option>
                      {filterOptions.levels.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute w-4 h-4 text-zinc-300 -translate-y-1/2 pointer-events-none right-4 top-1/2 group-hover:text-black transition-colors" />
                  </div>
                  <div className="relative group">
                    <select
                      value={equipment}
                      onChange={(e) => setEquipment(e.target.value)}
                      className="w-full pl-5 pr-10 py-3.5 text-[11px] bg-white border border-zinc-100 rounded-[18px] outline-none focus:border-black shadow-xl shadow-zinc-200/30 appearance-none cursor-pointer font-black transition-all hover:bg-zinc-50 tracking-wider uppercase"
                    >
                      <option value="">Equipment</option>
                      {filterOptions.equipments.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute w-4 h-4 text-zinc-300 -translate-y-1/2 pointer-events-none right-4 top-1/2 group-hover:text-black transition-colors" />
                  </div>
                </div>
              </div>

              <hr className="mb-6 border-gray-200" />

              {/* 3. MUSCLE GROUP TREE (MODERN STYLE) */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
                    <label className="text-sm font-black tracking-wide text-gray-900 uppercase">
                      Nhóm cơ
                    </label>
                  </div>
                  {selectedMuscle && (
                    <button
                      onClick={() => setSelectedMuscle(null)}
                      className="text-[10px] font-bold text-red-500 hover:text-red-700 bg-red-50 px-2 py-1 rounded-full flex items-center gap-1 hover:gap-1.5 transition-all"
                    >
                      <X className="w-3 h-3" /> Xóa lọc
                    </button>
                  )}
                </div>

                {/* ALL MUSCLES BUTTON */}
                <button
                  onClick={() => setSelectedMuscle(null)}
                  className={`
                    w-full mb-3 px-4 py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2
                    transition-all duration-200 shadow-sm
                    ${!selectedMuscle
                      ? "bg-zinc-900 text-white shadow-lg shadow-zinc-900/20 transform -translate-y-0.5"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                    }
                  `}
                >
                  <Dumbbell className="w-4 h-4" /> Toàn bộ cơ thể
                </button>

                {/* Tree */}
                <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
                  {muscleTree?.map((parent) => (
                    <MuscleAccordion
                      key={parent.id}
                      parent={parent}
                      selectedId={selectedMuscle?.id}
                      onSelect={handleSelectMuscle}
                    />
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Overlay for mobile */}
          {showMobileMenu && (
            <div
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setShowMobileMenu(false)}
            />
          )}

          {/* ================= MAIN CONTENT (GRID) ================= */}
          <main className="flex-1 min-w-0">
            {/* Header Result */}
            <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 mb-12 border-b border-zinc-200/50">
              <div>
                <nav className="flex items-center gap-2 mb-6 text-[11px] font-black text-zinc-400 uppercase tracking-[0.3em]">
                  <span>INDEX</span>
                  <div className="w-4 h-[1px] bg-zinc-300" />
                  <span className="text-zinc-900">{selectedMuscle ? selectedMuscle.name : "ALL"}</span>
                </nav>
                <h1 className="text-5xl font-black text-black leading-none mb-4 tracking-tighter letter-spacing-tight">
                  {selectedMuscle ? selectedMuscle.name : "Thư viện bài tập"}
                </h1>
                <p className="text-sm font-bold text-zinc-400">
                  <span className="text-zinc-900">{total}</span> CURATED EXERCISES
                </p>
              </div>
              <div className="mt-8 md:mt-0 flex items-center gap-6">
                <button className="flex items-center gap-3 px-6 py-2.5 bg-white border border-zinc-200 rounded-full text-[11px] font-black tracking-widest hover:border-black transition-all">
                  <span>VOTE BEST</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <div className="aspect-[4/3] bg-gray-200 rounded-xl animate-pulse"></div>
                    <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-1/2 h-3 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                  {exercises.map((ex) => {
                    const isAdded = (currentPlan?.id || currentPlan?.plan_id) && planItemsSet.has(String(ex.id));
                    return (
                      <div
                        key={ex.id}
                        className="relative flex flex-col h-full cursor-pointer group"
                        onClick={() => navigate(`/exercises/${ex.id}`)}
                      >
                        {/* Thumbnail */}
                        <div className="relative aspect-[4/3] rounded-[32px] overflow-hidden bg-[#E8E8E8] mb-6 border border-zinc-200/50 group-hover:border-black/10 group-hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] transition-all duration-700 group-hover:-translate-y-4">
                          <img
                            src={
                              ex.imageUrl ||
                              ex.thumbnail_url ||
                              "/placeholder.jpg"
                            }
                            alt={ex.name}
                            className="object-cover w-full h-full transition-transform duration-1000 group-hover:scale-105"
                            loading="lazy"
                          />

                          {/* Hover Overlay Buttons (Quick Add) */}
                          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setTodayList((p) =>
                                  p.find((x) => x.id === ex.id) ? p : [...p, ex]
                                );
                              }}
                              className="flex items-center gap-3 px-8 py-3.5 bg-white text-zinc-900 rounded-full shadow-2xl text-[11px] font-black tracking-[0.2em] hover:bg-black hover:text-white transition-all transform hover:scale-105 active:scale-95"
                            >
                              <Play className="w-4 h-4 fill-current" />
                              START WORKOUT
                            </button>
                          </div>

                          {/* Difficulty Tag */}
                          <div className="absolute top-6 left-6 px-4 py-1.5 bg-white/90 backdrop-blur-md text-[9px] font-black text-black rounded-full uppercase tracking-[0.2em] shadow-lg border border-white/20">
                            {ex.difficulty || "MODERATE"}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex flex-col flex-1 px-4">
                          <div className="flex items-center gap-3 mb-2 opacity-50">
                            <div className="w-4 h-[1px] bg-black" />
                            <span className="text-[9px] font-black text-black uppercase tracking-[0.2em]">
                              {ex.equipment || "No Equip"}
                            </span>
                          </div>
                          <h3
                            className="text-xl font-black text-black leading-tight tracking-tighter mb-4"
                            title={ex.name}
                          >
                            {ex.name}
                          </h3>
                          <div className="mt-auto flex justify-between items-center group/more">
                            <button
                              onClick={() => navigate(`/exercises/${ex.id}`)}
                              className="text-[10px] font-black text-zinc-400 group-hover/more:text-black transition-colors uppercase tracking-[0.2em] flex items-center gap-2"
                            >
                              EXPLORE
                              <ChevronRight className="w-3 h-3 group-hover/more:translate-x-1 transition-transform" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); addToPlan(ex); }}
                              className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${isAdded ? "bg-green-500 text-white" : "bg-zinc-100 text-zinc-400 hover:bg-zinc-900 hover:text-white"}`}
                            >
                              {isAdded ? <Check className="w-5 h-5 stroke-[4px]" /> : <Plus className="w-5 h-5 stroke-[4px]" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {total > pageSize && (
                  <div className="flex items-center justify-center mt-20 pb-20">
                    <div className="flex items-center gap-2 p-2 bg-zinc-100/50 rounded-[24px] border border-zinc-200/30 shadow-inner">
                      <button
                        disabled={page === 1}
                        onClick={() => {
                          setPage((p) => p - 1);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="w-12 h-12 flex items-center justify-center rounded-2xl text-zinc-400 hover:text-black hover:bg-white hover:shadow-xl transition-all disabled:opacity-20 active:scale-90"
                      >
                        <ChevronLeft className="w-5 h-5 stroke-[3px]" />
                      </button>

                      <div className="px-6 py-3 bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-black/5 flex items-center gap-3">
                        <span className="text-[10px] font-black tracking-[0.2em] uppercase text-zinc-300">
                          PAGE
                        </span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-[16px] font-black text-black leading-none">
                            {page}
                          </span>
                          <span className="text-[12px] font-black text-zinc-300">
                            /
                          </span>
                          <span className="text-[12px] font-black text-zinc-400">
                            {Math.ceil(total / pageSize)}
                          </span>
                        </div>
                      </div>

                      <button
                        disabled={page * pageSize >= total}
                        onClick={() => {
                          setPage((p) => p + 1);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="w-12 h-12 flex items-center justify-center rounded-2xl text-zinc-400 hover:text-black hover:bg-white hover:shadow-xl transition-all disabled:opacity-20 active:scale-90"
                      >
                        <ChevronRight className="w-5 h-5 stroke-[3px]" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {
        toastMsg && (
          <div className="fixed z-50 flex items-center gap-2 px-5 py-3 text-sm font-bold text-white -translate-x-1/2 rounded-full shadow-2xl bottom-6 left-1/2 bg-zinc-900/95 backdrop-blur animate-in slide-in-from-bottom-4">
            <div className="bg-green-500 p-0.5 rounded-full">
              <Check className="w-3 h-3 text-white" />
            </div>
            {toastMsg}
          </div>
        )
      }
    </div>
  );
}
