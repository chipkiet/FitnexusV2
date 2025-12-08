import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { addExerciseToPlanApi, getPlanByIdApi } from "../../lib/api.js";
import HeaderLogin from "../../components/header/HeaderLogin.jsx";
import { useMuscleTree } from "../../hooks/muscleTree.js";

import {
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Plus,
  Calendar,
  Play,
  Dumbbell,
  Check,
  X,
  Menu,
} from "lucide-react";

// --- CUSTOM CSS FOR SCROLLBAR ---
const ScrollbarStyles = () => (
  <style>{`
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #d1d5db; /* Gray-300 */
      border-radius: 10px;
    }
    .custom-scrollbar:hover::-webkit-scrollbar-thumb {
      background: #9ca3af; /* Gray-400 */
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
    <div className="mb-2">
      {/* PARENT BUTTON */}
      <button
        onClick={() => {
          onSelect(parent);
          if (hasChildren) setIsOpen(!isOpen);
        }}
        className={`
          w-full flex items-center justify-between px-4 py-3 rounded-lg
          transition-all duration-200 group relative overflow-hidden select-none
          ${
            isParentActive
              ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30 scale-[1.02]"
              : hasChildActive
              ? "bg-blue-50 text-blue-700 border-2 border-blue-200"
              : "bg-white border border-gray-200 text-gray-700 hover:border-blue-300 hover:shadow-md"
          }
        `}
      >
        {/* Hover Effect Background */}
        {!isParentActive && (
          <div className="absolute inset-0 transition-opacity opacity-0 bg-gradient-to-r from-gray-50 to-transparent group-hover:opacity-100" />
        )}

        <div className="relative z-10 flex items-center flex-1 gap-3">
          {/* Indicator Dot */}
          <div
            className={`
            w-2 h-2 rounded-full transition-all shrink-0
            ${
              isParentActive
                ? "bg-white scale-125"
                : hasChildActive
                ? "bg-blue-500"
                : "bg-gray-300 group-hover:bg-blue-400"
            }
          `}
          />

          <span
            className={`font-bold text-sm truncate ${
              isParentActive ? "text-white" : "text-gray-800"
            }`}
          >
            {parent.name}
          </span>
        </div>

        {/* Counter & Chevron */}
        <div className="relative z-10 flex items-center gap-2">
          {hasChildren && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors
              ${
                isParentActive
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600"
              }`}
            >
              {parent.children.length}
            </span>
          )}

          {hasChildren && (
            <div
              className={`
              transition-transform duration-300 
              ${isOpen ? "rotate-180" : "rotate-0"}
              ${isParentActive ? "text-white" : "text-gray-400"}
            `}
            >
              <ChevronDown className="w-4 h-4" />
            </div>
          )}
        </div>
      </button>

      {/* CHILDREN LIST */}
      {hasChildren && (
        <div
          className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${isOpen ? "max-h-[500px] opacity-100 mt-2" : "max-h-0 opacity-0"}
        `}
        >
          <div className="pl-3 ml-3 space-y-1 border-l-2 border-gray-100">
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
                    w-full text-left px-3 py-2 rounded-md text-sm
                    transition-all duration-200 flex items-center justify-between
                    group/child relative overflow-hidden
                    ${
                      isChildActive
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold translate-x-1"
                        : "text-gray-600 hover:text-blue-700 hover:bg-blue-50 hover:translate-x-1"
                    }
                  `}
                >
                  <span className="relative z-10 flex items-center gap-2 truncate">
                    {isChildActive && (
                      <Check className="w-3.5 h-3.5 animate-in zoom-in-50 duration-200 shrink-0" />
                    )}
                    {child.name}
                  </span>

                  {!isChildActive && (
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover/child:opacity-100 transition-opacity text-gray-400" />
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
  const [showMobileFilter, setShowMobileFilter] = useState(false);

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
          const slug = selectedMuscle.slug || selectedMuscle.name;
          url = `/api/exercises/muscle/${slug}`;
        }
        const res = await axios.get(url, {
          params: { page, pageSize, q, difficulty: level, equipment },
        });
        if (res.data?.success) {
          setExercises(res.data.data || []);
          setTotal(res.data.total || 0);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    const t = setTimeout(fetchEx, 300);
    return () => clearTimeout(t);
  }, [page, q, selectedMuscle, level, equipment]);

  // --- ACTIONS ---
  const handleSelectMuscle = (muscle) => {
    setSelectedMuscle((prev) => (prev?.id === muscle.id ? null : muscle));
    setPage(1);
    if (window.innerWidth < 1024) setShowMobileFilter(false);
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
      .catch(() => {});
  }, [currentPlan]);

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-zinc-900 font-sans">
      <ScrollbarStyles />
      <HeaderLogin />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
        {/* --- MOBILE FILTER TOGGLE --- */}
        <div className="lg:hidden flex justify-between items-center mb-4 sticky top-0 z-30 bg-[#F9FAFB] py-2">
          <button
            onClick={() => setShowMobileFilter(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50"
          >
            <Filter className="w-4 h-4" /> Bộ lọc & Nhóm cơ
          </button>
          <span className="text-sm font-medium text-gray-500">
            {total} kết quả
          </span>
        </div>

        <div className="flex items-start gap-8">
          {/* ================= SIDEBAR (LEFT) - 280px Fixed ================= */}
          <aside
            className={`
            fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:w-[280px] lg:bg-transparent lg:border-none lg:h-auto lg:block
            ${
              showMobileFilter
                ? "translate-x-0 shadow-2xl"
                : "-translate-x-full lg:shadow-none"
            }
          `}
          >
            <div className="h-full p-5 overflow-y-auto lg:overflow-visible lg:p-0">
              {/* Mobile Close */}
              <div className="flex items-center justify-between mb-6 lg:hidden">
                <h2 className="text-lg font-bold text-gray-800">Bộ lọc</h2>
                <button
                  onClick={() => setShowMobileFilter(false)}
                  className="p-2 bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* 1. PLAN & TODAY WIDGETS */}
              <div className="mb-8 space-y-4">
                {/* Plan Context */}
                <div
                  className={`p-4 rounded-xl border shadow-sm transition-all ${
                    currentPlan
                      ? "bg-gradient-to-br from-blue-50 to-white border-blue-100"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1 text-xs font-extrabold tracking-widest text-gray-400 uppercase">
                      <Calendar className="w-3 h-3" /> Plan
                    </span>
                    {currentPlan ? (
                      <button
                        onClick={() => {
                          sessionStorage.removeItem("current_plan_context");
                          setCurrentPlan(null);
                        }}
                        className="text-xs font-bold text-red-500 hover:underline"
                      >
                        THOÁT
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate("/plans/select")}
                        className="text-xs font-bold text-blue-600 hover:underline"
                      >
                        CHỌN PLAN
                      </button>
                    )}
                  </div>
                  {currentPlan ? (
                    <div>
                      <div className="text-sm font-bold text-gray-900 truncate">
                        {currentPlan.name}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {planItemsSet.size} bài tập đang chọn
                      </div>
                    </div>
                  ) : (
                    <div className="py-1 text-xs text-gray-400">
                      Chưa chọn kế hoạch.
                    </div>
                  )}
                </div>

                {/* Today */}
                <div className="p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="flex items-center gap-1 text-xs font-extrabold tracking-widest text-gray-400 uppercase">
                      <Play className="w-3 h-3" /> Hôm nay
                    </span>
                    {todayList.length > 0 && (
                      <span className="text-[10px] font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                        {todayList.length}
                      </span>
                    )}
                  </div>
                  {todayList.length === 0 ? (
                    <div className="py-2 text-xs text-center text-gray-400 border border-gray-200 border-dashed rounded-lg">
                      Danh sách trống
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="pr-1 space-y-1 overflow-y-auto max-h-24 custom-scrollbar">
                        {todayList.map((ex, i) => (
                          <div
                            key={i}
                            className="flex justify-between items-center text-xs text-gray-700 bg-gray-50 px-2 py-1.5 rounded group hover:bg-orange-50"
                          >
                            <span className="flex-1 font-medium truncate">
                              {ex.name}
                            </span>
                            <button
                              onClick={() =>
                                setTodayList((p) =>
                                  p.filter((_, idx) => idx !== i)
                                )
                              }
                              className="text-gray-300 opacity-0 hover:text-red-500 group-hover:opacity-100"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => navigate("/workout/start")}
                        className="w-full py-2 text-xs font-bold text-white bg-orange-600 rounded-lg shadow-sm hover:bg-orange-700 shadow-orange-200"
                      >
                        Bắt đầu tập
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <hr className="mb-6 border-gray-200" />

              {/* 2. SEARCH & DROPDOWNS */}
              <div className="mb-8 space-y-5">
                <div>
                  <label className="block mb-2 text-xs font-bold text-gray-900 uppercase">
                    Tìm kiếm
                  </label>
                  <div className="relative group">
                    <Search className="absolute w-4 h-4 text-gray-400 transition-colors -translate-y-1/2 left-3 top-1/2 group-focus-within:text-blue-600" />
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Tên bài tập..."
                      className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
                  <div>
                    <label className="block mb-2 text-xs font-bold text-gray-900 uppercase">
                      Độ khó
                    </label>
                    <div className="relative">
                      <select
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="w-full pl-3 pr-8 py-2.5 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-500 shadow-sm appearance-none cursor-pointer"
                      >
                        <option value="">Tất cả</option>
                        {filterOptions.levels.map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 pointer-events-none right-3 top-1/2" />
                    </div>
                  </div>
                  <div>
                    <label className="block mb-2 text-xs font-bold text-gray-900 uppercase">
                      Dụng cụ
                    </label>
                    <div className="relative">
                      <select
                        value={equipment}
                        onChange={(e) => setEquipment(e.target.value)}
                        className="w-full pl-3 pr-8 py-2.5 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-500 shadow-sm appearance-none cursor-pointer"
                      >
                        <option value="">Tất cả</option>
                        {filterOptions.equipments.map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 pointer-events-none right-3 top-1/2" />
                    </div>
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
                    ${
                      !selectedMuscle
                        ? "bg-zinc-900 text-white shadow-lg shadow-zinc-900/20 transform -translate-y-0.5"
                        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                    }
                  `}
                >
                  <Dumbbell className="w-4 h-4" /> Toàn bộ cơ thể
                </button>

                {/* Tree */}
                <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
                  {muscleTree.map((parent) => (
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
          {showMobileFilter && (
            <div
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setShowMobileFilter(false)}
            />
          )}

          {/* ================= MAIN CONTENT (GRID) ================= */}
          <main className="flex-1 min-w-0">
            {/* Header Result */}
            <div className="flex items-end justify-between pb-2 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 leading-none mb-1.5">
                  {selectedMuscle ? selectedMuscle.name : "Tất cả bài tập"}
                </h1>
                <p className="text-sm font-medium text-gray-500">
                  Hiển thị {total} kết quả
                </p>
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
                    const isAdded =
                      currentPlan?.plan_id && planItemsSet.has(String(ex.id));
                    return (
                      <div
                        key={ex.id}
                        className="relative flex flex-col h-full cursor-pointer group"
                        onClick={() => navigate(`/exercises/${ex.id}`)}
                      >
                        {/* Thumbnail */}
                        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 mb-3 border border-gray-100 shadow-sm transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
                          <img
                            src={
                              ex.imageUrl ||
                              ex.thumbnail_url ||
                              "/placeholder.jpg"
                            }
                            alt={ex.name}
                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />

                          {/* Hover Overlay Buttons (Desktop) */}
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[1px]">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setTodayList((p) =>
                                  p.find((x) => x.id === ex.id) ? p : [...p, ex]
                                );
                              }}
                              className="flex items-center justify-center w-10 h-10 transition-all transform bg-white rounded-full shadow-lg text-zinc-800 hover:bg-orange-500 hover:text-white hover:scale-110"
                              title="Tập ngay"
                            >
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addToPlan(ex);
                              }}
                              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg transform hover:scale-110
                                 ${
                                   isAdded
                                     ? "bg-green-500 text-white"
                                     : "bg-white text-zinc-800 hover:bg-blue-600 hover:text-white"
                                 }`}
                              title="Thêm vào Plan"
                            >
                              {isAdded ? (
                                <Check className="w-5 h-5" />
                              ) : (
                                <Plus className="w-5 h-5" />
                              )}
                            </button>
                          </div>

                          {/* Difficulty Badge */}
                          <div
                            className={`absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold text-white uppercase rounded shadow-sm tracking-wider
                            ${
                              ex.difficulty === "beginner"
                                ? "bg-green-500/90"
                                : ex.difficulty === "advanced"
                                ? "bg-red-500/90"
                                : "bg-amber-500/90"
                            }
                          `}
                          >
                            {ex.difficulty || "N/A"}
                          </div>

                          {/* Mobile Add Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToPlan(ex);
                            }}
                            className={`lg:hidden absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md text-white active:scale-95 transition ${
                              isAdded ? "bg-green-500" : "bg-blue-600"
                            }`}
                          >
                            {isAdded ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Plus className="w-4 h-4" />
                            )}
                          </button>
                        </div>

                        {/* Content */}
                        <div className="flex flex-col flex-1 px-1">
                          <h3
                            className="mb-1 text-sm font-bold text-gray-900 transition-colors line-clamp-2 group-hover:text-blue-600"
                            title={ex.name}
                          >
                            {ex.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-auto">
                            <div className="h-4 w-[1px] bg-gray-300"></div>
                            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide truncate">
                              {ex.equipment || "No Equip"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {total > pageSize && (
                  <div className="flex justify-center mt-12">
                    <div className="inline-flex gap-1 p-1 bg-white border border-gray-200 rounded-lg shadow-sm">
                      <button
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                        className="px-3 py-2 text-xs font-bold text-gray-600 transition-colors rounded-md hover:bg-gray-50 hover:text-gray-900 disabled:opacity-30"
                      >
                        Prev
                      </button>
                      <span className="px-4 py-2 text-xs font-bold text-blue-600 rounded-md shadow-inner bg-blue-50">
                        Trang {page}
                      </span>
                      <button
                        disabled={page * pageSize >= total}
                        onClick={() => setPage((p) => p + 1)}
                        className="px-3 py-2 text-xs font-bold text-gray-600 transition-colors rounded-md hover:bg-gray-50 hover:text-gray-900 disabled:opacity-30"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {toastMsg && (
        <div className="fixed z-50 flex items-center gap-2 px-5 py-3 text-sm font-bold text-white -translate-x-1/2 rounded-full shadow-2xl bottom-6 left-1/2 bg-zinc-900/95 backdrop-blur animate-in slide-in-from-bottom-4">
          <div className="bg-green-500 p-0.5 rounded-full">
            <Check className="w-3 h-3 text-white" />
          </div>
          {toastMsg}
        </div>
      )}
    </div>
  );
}
