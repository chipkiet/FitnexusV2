import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Menu,
  X,
} from "lucide-react";

// --- COMPONENT: Muscle Accordion Item (Sidebar) ---
const MuscleAccordion = ({ parent, selectedId, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isParentActive = selectedId === parent.id;
  const isChildActive = parent.children?.some((c) => c.id === selectedChildId);

  // Tự động mở nếu con đang được chọn
  useEffect(() => {
    if (parent.children?.some((c) => c.id === selectedId)) {
      setIsOpen(true);
    }
  }, [selectedId, parent]);

  const hasChildren = parent.children && parent.children.length > 0;

  return (
    <div className="mb-1">
      <div
        className={`flex items-center justify-between group rounded-md transition-colors ${
          isParentActive ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50"
        }`}
      >
        {/* Click tên để filter theo Parent */}
        <button
          onClick={() => onSelect(parent)}
          className="flex items-center flex-1 gap-2 px-2 py-2 text-sm font-medium text-left"
        >
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              isParentActive
                ? "bg-blue-600"
                : "bg-gray-300 group-hover:bg-gray-400"
            }`}
          ></div>
          {parent.name}
        </button>

        {/* Click icon để mở rộng con (không filter) */}
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            className="p-2 text-gray-400 hover:text-gray-700"
          >
            {isOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Child List */}
      {isOpen && hasChildren && (
        <div className="pl-2 mt-1 ml-4 space-y-1 border-l border-gray-200">
          {parent.children.map((child) => (
            <button
              key={child.id}
              onClick={() => onSelect(child)}
              className={`w-full text-left py-1.5 px-2 text-xs rounded-md transition-colors flex items-center justify-between
                ${
                  selectedId === child.id
                    ? "text-blue-700 font-bold bg-blue-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
            >
              <span>{child.name}</span>
              {selectedId === child.id && <Check className="w-3 h-3" />}
            </button>
          ))}
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
  const pageSize = 24; // Mật độ cao hơn

  const [filterOptions, setFilterOptions] = useState({
    levels: [],
    equipments: [],
  });

  // User Context (Plan / Today)
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
          const slug = selectedMuscle.slug || selectedMuscle.name; // Fallback slug
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
    // Nếu đang chọn chính nó thì bỏ chọn, ngược lại thì chọn mới
    setSelectedMuscle((prev) => (prev?.id === muscle.id ? null : muscle));
    setPage(1);
    // Trên mobile, chọn xong thì đóng filter drawer
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

  // Sync Session
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
    <div className="min-h-screen font-sans bg-gray-50 text-zinc-900">
      <HeaderLogin />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
        {/* --- MOBILE FILTER TOGGLE --- */}
        <div className="flex items-center justify-between mb-4 lg:hidden">
          <button
            onClick={() => setShowMobileFilter(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg shadow-sm"
          >
            <Filter className="w-4 h-4" /> Bộ lọc & Danh mục
          </button>
          <span className="text-sm font-medium text-gray-500">
            {total} kết quả
          </span>
        </div>

        <div className="flex items-start gap-8">
          {/* ================= SIDEBAR (FILTERS) - 25% ================= */}
          <aside
            className={`
            fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:w-64 lg:bg-transparent lg:border-none lg:h-auto lg:block
            ${
              showMobileFilter
                ? "translate-x-0 shadow-2xl"
                : "-translate-x-full lg:shadow-none"
            }
          `}
          >
            <div className="h-full p-5 overflow-y-auto lg:p-0">
              {/* Mobile Close Button */}
              <div className="flex items-center justify-between mb-6 lg:hidden">
                <h2 className="text-lg font-bold">Bộ lọc</h2>
                <button onClick={() => setShowMobileFilter(false)}>
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* 1. WIDGETS (Plan / Today) */}
              <div className="mb-8 space-y-4">
                {/* Plan Context */}
                <div
                  className={`p-4 rounded-xl border ${
                    currentPlan
                      ? "bg-blue-50 border-blue-100"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1 text-xs font-bold text-gray-500 uppercase">
                      <Calendar className="w-3 h-3" /> Plan
                    </span>
                    {currentPlan ? (
                      <button
                        onClick={() => {
                          sessionStorage.removeItem("current_plan_context");
                          setCurrentPlan(null);
                        }}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Thoát
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate("/plans/select")}
                        className="text-xs font-bold text-blue-600 hover:underline"
                      >
                        Chọn Plan
                      </button>
                    )}
                  </div>
                  {currentPlan ? (
                    <div>
                      <div className="text-sm font-bold truncate">
                        {currentPlan.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {planItemsSet.size} bài tập
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400">
                      Chưa chọn Plan làm việc.
                    </div>
                  )}
                </div>

                {/* Today List */}
                <div className="p-4 bg-white border border-gray-200 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1 text-xs font-bold text-gray-500 uppercase">
                      <Play className="w-3 h-3" /> Hôm nay
                    </span>
                    {todayList.length > 0 && (
                      <span className="text-xs font-bold text-orange-600">
                        {todayList.length}
                      </span>
                    )}
                  </div>
                  {todayList.length === 0 ? (
                    <div className="text-xs text-gray-400">Danh sách trống</div>
                  ) : (
                    <div className="space-y-2">
                      <div className="space-y-1 overflow-y-auto max-h-32 custom-scrollbar">
                        {todayList.map((ex, i) => (
                          <div
                            key={i}
                            className="flex justify-between text-xs text-gray-700 bg-gray-50 p-1.5 rounded"
                          >
                            <span className="flex-1 truncate">{ex.name}</span>
                            <button
                              onClick={() =>
                                setTodayList((p) =>
                                  p.filter((_, idx) => idx !== i)
                                )
                              }
                              className="text-gray-400 hover:text-red-500"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => navigate("/workout/start")}
                        className="w-full py-1.5 bg-orange-600 text-white text-xs font-bold rounded hover:bg-orange-700"
                      >
                        Tập ngay
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <hr className="mb-6 border-gray-200" />

              {/* 2. SEARCH & FILTERS */}
              <div className="space-y-6">
                {/* Search */}
                <div>
                  <label className="block mb-2 text-xs font-bold text-gray-900 uppercase">
                    Tìm kiếm
                  </label>
                  <div className="relative">
                    <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Tên bài tập..."
                      className="w-full py-2 pr-3 text-sm border border-gray-300 rounded-lg outline-none pl-9 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Difficulty & Equipment */}
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
                  <div>
                    <label className="block mb-2 text-xs font-bold text-gray-900 uppercase">
                      Độ khó
                    </label>
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                      className="w-full p-2 text-sm bg-white border border-gray-300 rounded-lg outline-none focus:border-blue-500"
                    >
                      <option value="">Tất cả</option>
                      {filterOptions.levels.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 text-xs font-bold text-gray-900 uppercase">
                      Dụng cụ
                    </label>
                    <select
                      value={equipment}
                      onChange={(e) => setEquipment(e.target.value)}
                      className="w-full p-2 text-sm bg-white border border-gray-300 rounded-lg outline-none focus:border-blue-500"
                    >
                      <option value="">Tất cả</option>
                      {filterOptions.equipments.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <hr className="border-gray-200" />

                {/* 3. MUSCLE GROUP TREE */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold text-gray-900 uppercase">
                      Nhóm cơ
                    </label>
                    {selectedMuscle && (
                      <button
                        onClick={() => setSelectedMuscle(null)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Xóa lọc
                      </button>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    {/* Danh sách nhóm cơ cha */}
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
            </div>
          </aside>

          {/* Overlay for mobile sidebar */}
          {showMobileFilter && (
            <div
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setShowMobileFilter(false)}
            />
          )}

          {/* ================= MAIN CONTENT (GRID) - 75% ================= */}
          <main className="flex-1 min-w-0">
            {/* Header Result */}
            <div className="flex items-end justify-between pb-4 mb-6 border-b border-gray-200">
              <div>
                <h1 className="mb-1 text-2xl font-bold leading-none text-gray-900">
                  {selectedMuscle ? selectedMuscle.name : "Tất cả bài tập"}
                </h1>
                <p className="text-sm text-gray-500">
                  Hiển thị {total} kết quả
                </p>
              </div>

              {/* Sort (Placeholder) */}
              <div className="items-center hidden text-sm text-gray-500 sm:flex">
                Sắp xếp:{" "}
                <span className="ml-1 font-medium text-gray-900 cursor-pointer">
                  Mới nhất
                </span>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="aspect-[4/3] bg-gray-200 rounded-lg animate-pulse"></div>
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
                        className="flex flex-col h-full cursor-pointer group"
                        onClick={() => navigate(`/exercises/${ex.id}`)}
                      >
                        {/* Thumbnail */}
                        <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 mb-3 border border-gray-100 shadow-sm transition-all group-hover:shadow-md">
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
                          <div className="absolute inset-0 flex items-center justify-center gap-2 transition-opacity opacity-0 bg-black/20 group-hover:opacity-100">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setTodayList((p) =>
                                  p.find((x) => x.id === ex.id) ? p : [...p, ex]
                                );
                              }}
                              className="flex items-center justify-center transition bg-white rounded-full shadow-sm w-9 h-9 text-zinc-800 hover:bg-orange-500 hover:text-white"
                              title="Tập ngay"
                            >
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addToPlan(ex);
                              }}
                              className={`w-9 h-9 rounded-full flex items-center justify-center transition shadow-sm
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

                          {/* Mobile Add Button (Always visible on mobile) */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToPlan(ex);
                            }}
                            className={`lg:hidden absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-sm text-white ${
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
                        <div className="flex flex-col flex-1">
                          <h3
                            className="mb-1 text-sm font-bold text-gray-900 transition-colors line-clamp-2 group-hover:text-blue-600"
                            title={ex.name}
                          >
                            {ex.name}
                          </h3>
                          <div className="flex items-center gap-2 mb-1 text-xs text-gray-500">
                            <span className="capitalize">{ex.difficulty}</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span className="capitalize truncate max-w-[80px]">
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
                  <div className="flex justify-center mt-10">
                    <div className="inline-flex rounded-md shadow-sm">
                      <button
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50"
                      >
                        Trước
                      </button>
                      <span className="px-4 py-2 text-sm font-bold text-blue-600 border-t border-b border-blue-100 bg-blue-50">
                        {page}
                      </span>
                      <button
                        disabled={page * pageSize >= total}
                        onClick={() => setPage((p) => p + 1)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50"
                      >
                        Sau
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed z-50 flex items-center gap-2 px-5 py-3 text-sm font-bold text-white -translate-x-1/2 rounded-full shadow-xl bottom-6 left-1/2 bg-zinc-900 animate-in fade-in slide-in-from-bottom-4">
          <Check className="w-4 h-4 text-green-400" /> {toastMsg}
        </div>
      )}
    </div>
  );
}
