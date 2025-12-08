import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { addExerciseToPlanApi, getPlanByIdApi } from "../../lib/api.js";
import HeaderLogin from "../../components/header/HeaderLogin.jsx";
import StartWorkoutButton from "../../components/workout/StartWorkoutButton.jsx";
import { useMuscleTree } from "../../hooks/muscleTree.js";

// Icons
import {
  Search,
  ChevronDown,
  ChevronRight,
  Plus,
  Calendar,
  Play,
  Dumbbell,
  Filter,
  X,
} from "lucide-react";

// --- COMPONENT: Muscle Accordion Item ---
const MuscleAccordion = ({
  parent,
  selectedMuscle,
  onSelect,
  onToggleExpand,
  isExpanded,
}) => {
  const isSelected = selectedMuscle?.id === parent.id;
  const hasChildSelected = parent.children?.some(
    (c) => c.id === selectedMuscle?.id
  );
  const hasChildren = parent.children && parent.children.length > 0;

  return (
    <div className="border-b border-gray-100 last:border-0">
      <div
        className={`flex items-center justify-between py-2 pr-2 hover:bg-gray-50 rounded-lg transition-colors
        ${isSelected ? "bg-blue-50" : ""}`}
      >
        {/* Click tên: Chọn nhóm cơ cha */}
        <button
          onClick={() => onSelect(parent)}
          className={`flex-1 text-left text-sm font-medium px-2 py-1 truncate
            ${isSelected ? "text-blue-700 font-bold" : "text-gray-700"}
            ${hasChildSelected ? "text-blue-600" : ""}
          `}
        >
          {parent.name}
        </button>

        {/* Nút nhỏ bên cạnh: Mở rộng/Thu gọn con */}
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(parent.id);
            }}
            className={`p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-all ${
              isExpanded ? "rotate-180 bg-gray-100" : ""
            }`}
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Danh sách con */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? "max-h-96 opacity-100 mb-2" : "max-h-0 opacity-0"
        }`}
      >
        <div className="pl-4 mt-1 ml-3 space-y-1 border-l-2 border-gray-100">
          {parent.children?.map((child) => {
            const isChildActive = selectedMuscle?.id === child.id;
            return (
              <button
                key={child.id}
                onClick={() => onSelect(child)}
                className={`w-full text-left text-xs py-1.5 px-2 rounded-md block transition-colors
                      ${
                        isChildActive
                          ? "text-blue-700 bg-blue-50 font-bold border-l-2 border-blue-500"
                          : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                      }`}
              >
                {child.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default function Exercise() {
  const navigate = useNavigate();

  // --- HOOKS & STATE ---
  const { muscleTree } = useMuscleTree();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Filters
  const [q, setQ] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState(null); // {id, slug, name}
  const [level, setLevel] = useState("");
  const [equipment, setEquipment] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // UI State
  const [expandedParents, setExpandedParents] = useState({}); // { [id]: true/false }
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Metadata & Context
  const [filterOptions, setFilterOptions] = useState({
    levels: [],
    equipments: [],
  });
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

  // --- INIT ---
  useEffect(() => {
    axios
      .get("/api/exercises/filter/meta")
      .then((res) => {
        if (res.data?.success) setFilterOptions(res.data.data);
      })
      .catch(console.error);
  }, []);

  // --- FETCH ---
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

  // --- HANDLERS ---
  const handleToggleExpand = (id) => {
    setExpandedParents((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectMuscle = (muscle) => {
    if (selectedMuscle?.id === muscle.id) setSelectedMuscle(null);
    else setSelectedMuscle(muscle);
    setPage(1);
    // Tự động mở cha nếu chọn con (logic này optional)
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
      setToastMsg(`Đã thêm vào Plan!`);
      setTimeout(() => setToastMsg(null), 3000);
    } catch (e) {
      alert("Lỗi thêm Plan");
    }
  };

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

  useEffect(
    () => sessionStorage.setItem("today_workout", JSON.stringify(todayList)),
    [todayList]
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900 font-sans">
      <HeaderLogin />

      <div className="max-w-[1400px] mx-auto px-4 py-8">
        {/* Mobile Filter Toggle */}
        <div className="mb-4 lg:hidden">
          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="flex items-center justify-center w-full gap-2 py-2 font-bold bg-white border border-gray-300 rounded-lg shadow-sm"
          >
            <Filter className="w-4 h-4" />{" "}
            {isMobileFilterOpen ? "Đóng bộ lọc" : "Mở bộ lọc"}
          </button>
        </div>

        <div className="flex flex-col items-start gap-8 lg:flex-row">
          {/* ========================================================= */}
          {/* SIDEBAR (LEFT) - 25% Width */}
          {/* ========================================================= */}
          <aside
            className={`lg:w-72 flex-shrink-0 space-y-6 ${
              isMobileFilterOpen ? "block" : "hidden lg:block"
            }`}
          >
            {/* 1. PLAN / TODAY CONTEXT (Đặt lên đầu để dễ thấy) */}
            <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">
              {/* Tabs Header */}
              <div className="flex border-b border-gray-100 bg-gray-50">
                <div className="flex-1 py-3 text-xs font-bold tracking-wide text-center text-gray-700 uppercase border-r border-gray-200">
                  Active Plan
                </div>
                <div className="flex-1 py-3 text-xs font-bold tracking-wide text-center text-gray-700 uppercase">
                  Session
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* Plan Status */}
                {currentPlan ? (
                  <div className="text-sm">
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-bold text-blue-700 line-clamp-1">
                        {currentPlan.name}
                      </span>
                      <button
                        onClick={() => {
                          sessionStorage.removeItem("current_plan_context");
                          setCurrentPlan(null);
                        }}
                        className="text-[10px] text-red-500 hover:underline shrink-0 ml-2"
                      >
                        Thoát
                      </button>
                    </div>
                    <p className="mb-2 text-xs text-gray-500">
                      {planItemsSet.size} bài tập
                    </p>
                    <button
                      onClick={() => navigate(`/plans/${currentPlan.plan_id}`)}
                      className="w-full py-1.5 border border-blue-200 text-blue-700 rounded text-xs font-bold hover:bg-blue-50"
                    >
                      Quản lý Plan
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => navigate("/plans/select")}
                    className="w-full py-2 text-xs text-gray-500 border border-gray-300 border-dashed rounded-lg hover:border-blue-400 hover:text-blue-600"
                  >
                    + Chọn Plan để thêm bài tập
                  </button>
                )}

                <div className="h-[1px] bg-gray-100"></div>

                {/* Today List Status */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-700">
                      Buổi tập hôm nay
                    </span>
                    <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {todayList.length}
                    </span>
                  </div>
                  {todayList.length > 0 ? (
                    <>
                      <div className="space-y-1 mb-2 max-h-[120px] overflow-y-auto custom-scrollbar">
                        {todayList.map((ex, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between pl-2 text-xs text-gray-600 border-l-2 border-gray-200"
                          >
                            <span className="truncate">{ex.name}</span>
                            <button
                              onClick={() =>
                                setTodayList((p) =>
                                  p.filter((_, idx) => idx !== i)
                                )
                              }
                              className="text-gray-300 hover:text-red-500"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                      <StartWorkoutButton
                        exercises={todayList}
                        className="w-full py-2 text-xs font-bold text-white rounded bg-zinc-900 hover:bg-black"
                      />
                    </>
                  ) : (
                    <p className="text-[10px] text-gray-400 italic">
                      Chưa chọn bài tập nào.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 2. SEARCH */}
            <div className="p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
              <h3 className="mb-3 text-xs font-black tracking-widest text-gray-400 uppercase">
                Tìm kiếm
              </h3>
              <div className="relative">
                <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Tên bài tập..."
                  className="w-full py-2 pr-3 text-sm border border-gray-200 rounded-lg outline-none pl-9 bg-gray-50 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 3. BODY FOCUS (MUSCLE TREE) */}
            <div className="p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-black tracking-widest text-gray-400 uppercase">
                  Nhóm cơ
                </h3>
                {selectedMuscle && (
                  <button
                    onClick={() => setSelectedMuscle(null)}
                    className="text-[10px] text-red-500 hover:underline"
                  >
                    Xóa lọc
                  </button>
                )}
              </div>

              <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                {/* Option All */}
                <button
                  onClick={() => setSelectedMuscle(null)}
                  className={`w-full text-left px-2 py-2 text-sm font-bold rounded-lg transition-colors ${
                    !selectedMuscle
                      ? "bg-zinc-900 text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Tất cả cơ thể
                </button>

                {/* Tree */}
                {muscleTree.map((parent) => (
                  <MuscleAccordion
                    key={parent.id}
                    parent={parent}
                    selectedMuscle={selectedMuscle}
                    onSelect={handleSelectMuscle}
                    onToggleExpand={handleToggleExpand}
                    isExpanded={!!expandedParents[parent.id]}
                  />
                ))}
              </div>
            </div>

            {/* 4. OTHER FILTERS */}
            <div className="p-4 space-y-4 bg-white border border-gray-200 shadow-sm rounded-xl">
              <div>
                <h3 className="mb-2 text-xs font-black tracking-widest text-gray-400 uppercase">
                  Độ khó
                </h3>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none bg-gray-50 focus:border-blue-500"
                >
                  <option value="">Tất cả độ khó</option>
                  {filterOptions.levels.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <h3 className="mb-2 text-xs font-black tracking-widest text-gray-400 uppercase">
                  Dụng cụ
                </h3>
                <select
                  value={equipment}
                  onChange={(e) => setEquipment(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none bg-gray-50 focus:border-blue-500"
                >
                  <option value="">Tất cả dụng cụ</option>
                  {filterOptions.equipments.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </aside>

          {/* ========================================================= */}
          {/* MAIN CONTENT (RIGHT) - 75% Width */}
          {/* ========================================================= */}
          <main className="flex-1 min-w-0">
            {/* Header Info */}
            <div className="flex items-end justify-between pb-4 mb-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Danh sách bài tập
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Hiển thị <b>{total}</b> bài tập
                  {selectedMuscle && (
                    <span>
                      {" "}
                      cho nhóm{" "}
                      <b className="text-blue-600">{selectedMuscle.name}</b>
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
                ))}
              </div>
            ) : exercises.length === 0 ? (
              <div className="py-20 text-center bg-white border border-gray-300 border-dashed rounded-xl">
                <Dumbbell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="font-medium text-gray-500">
                  Không tìm thấy bài tập phù hợp.
                </p>
                <button
                  onClick={() => {
                    setQ("");
                    setSelectedMuscle(null);
                    setLevel("");
                    setEquipment("");
                  }}
                  className="mt-2 text-blue-600 hover:underline"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {exercises.map((ex) => (
                  <div
                    key={ex.id}
                    className="flex flex-col overflow-hidden transition-all duration-300 bg-white border border-gray-200 shadow-sm group rounded-xl hover:shadow-xl hover:-translate-y-1"
                  >
                    {/* Thumbnail */}
                    <div
                      className="relative overflow-hidden bg-gray-100 cursor-pointer aspect-video"
                      onClick={() => navigate(`/exercises/${ex.id}`)}
                    >
                      <img
                        src={
                          ex.imageUrl ||
                          ex.thumbnail_url ||
                          ex.gif_demo_url ||
                          "/placeholder.jpg"
                        }
                        alt={ex.name}
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                      />
                      {ex.difficulty && (
                        <div
                          className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase text-white shadow-sm
                                  ${
                                    ex.difficulty === "beginner"
                                      ? "bg-emerald-500"
                                      : ex.difficulty === "advanced"
                                      ? "bg-rose-500"
                                      : "bg-amber-500"
                                  }`}
                        >
                          {ex.difficulty}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex flex-col flex-1 p-4">
                      <h3
                        className="mb-1 text-base font-bold text-gray-900 transition-colors line-clamp-1 group-hover:text-blue-600"
                        title={ex.name}
                      >
                        {ex.name}
                      </h3>
                      <div className="flex items-center gap-2 mb-4 text-xs text-gray-500">
                        <span>{ex.equipment || "No Equipment"}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className="capitalize">
                          {ex.exercise_type || "Strength"}
                        </span>
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-2 mt-auto">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToPlan(ex);
                          }}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-colors border
                                  ${
                                    currentPlan?.plan_id &&
                                    planItemsSet.has(String(ex.id))
                                      ? "bg-green-50 text-green-700 border-green-200 cursor-default"
                                      : "bg-white text-gray-700 border-gray-200 hover:border-blue-500 hover:text-blue-600"
                                  }`}
                        >
                          {currentPlan?.plan_id &&
                          planItemsSet.has(String(ex.id))
                            ? "Đã có"
                            : "+ Plan"}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTodayList((p) => [...p, ex]);
                          }}
                          className="flex items-center justify-center w-10 text-gray-500 transition-colors bg-gray-100 rounded-lg hover:bg-zinc-900 hover:text-white"
                          title="Add to Today"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {total > pageSize && (
              <div className="flex justify-center gap-2 mt-10">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="px-4 py-2 text-sm font-bold text-white rounded-lg bg-zinc-900">
                  {page}
                </span>
                <button
                  disabled={page * pageSize >= total}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Toast */}
      {toastMsg && (
        <div className="fixed z-50 flex items-center gap-2 px-5 py-3 text-sm font-medium text-white rounded-lg shadow-xl bottom-6 right-6 bg-zinc-800 animate-in slide-in-from-bottom-5">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div> {toastMsg}
        </div>
      )}
    </div>
  );
}
