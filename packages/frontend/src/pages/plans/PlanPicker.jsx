import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useAuth } from "../../context/auth.context.jsx";
import { getMyPlansApi, addExerciseToPlanApi, listWorkoutSessionsApi, deletePlanApi, createPlanApi } from "../../lib/api.js";

// shadcn components
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Info, Book, Eye, Trash2, RefreshCw } from "lucide-react";

export default function PlanPicker() {
  // Modal hiển thị khi người dùng chưa có plan nào
  function NoPlansModal({ onClose, onCreatePlan }) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
        <Card className="w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <CardHeader>
            <CardTitle>Chưa có kế hoạch luyện tập</CardTitle>
            <CardDescription>
              Bạn cần tạo một kế hoạch trước khi thêm bài tập. Bạn có muốn tạo kế hoạch mới ngay bây giờ không?
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-3">
            <Button className="w-full" onClick={onCreatePlan}>
              Tạo kế hoạch mới
            </Button>
            <Button variant="outline" className="w-full" onClick={onClose}>
              Để sau
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Modal xác nhận xóa plan
  function DeleteConfirmationModal({ planName, onConfirm, onCancel, isDeleting }) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onCancel}>
        <Card className="w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <CardHeader>
            <CardTitle className="text-destructive">Xác nhận xóa</CardTitle>
            <CardDescription>
              Bạn có chắc chắn muốn xóa kế hoạch "<b>{planName}</b>"? Hành động này không thể hoàn tác.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex gap-4">
            <Button variant="outline" className="flex-1" onClick={onCancel} disabled={isDeleting}>
              Hủy
            </Button>
            <Button variant="destructive" className="flex-1" onClick={onConfirm} disabled={isDeleting}>
              {isDeleting ? "Đang xóa..." : "Xóa kế hoạch"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const exerciseId = useMemo(() => {
    const v = parseInt(searchParams.get("exerciseId"), 10);
    return Number.isFinite(v) && v > 0 ? v : null;
  }, [searchParams]);
  const exerciseName = useMemo(() => location.state?.exerciseName || "", [location.state]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [completedPlanIds, setCompletedPlanIds] = useState(new Set());
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [showNoPlansModal, setShowNoPlansModal] = useState(false);
  const [deletingPlan, setDeletingPlan] = useState(null); // State cho modal xóa
  const [isDeleting, setIsDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false); // State cho quick create

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMyPlansApi({ limit: 100, offset: 0 });
      const list = res?.data?.items ?? res?.data ?? [];
      const plans = Array.isArray(list) ? list : [];
      setItems(plans);

      if (plans.length === 0) {
        setShowNoPlansModal(true);
      }

      // Fetch completed sessions to partition plans
      try {
        const sess = await listWorkoutSessionsApi({ status: 'completed', limit: 100, offset: 0 });
        const itemsSess = sess?.data?.items ?? sess?.data ?? [];
        const setIds = new Set((Array.isArray(itemsSess) ? itemsSess : []).map((s) => s.plan_id).filter((v) => Number.isFinite(v)));
        setCompletedPlanIds(setIds);
      } catch { }
    } catch (e) {
      // Nếu BE chưa có endpoint list, im lặng và để người dùng tạo mới
      setShowNoPlansModal(true);
      setItems([]);
      setCompletedPlanIds(new Set());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAddToSelected = async () => {
    // Nếu chưa có plan nào, hiển thị modal yêu cầu tạo plan
    if (items.length === 0) {
      setShowNoPlansModal(true);
      return;
    }

    // Nếu có plan nhưng chưa chọn, hiển thị lỗi
    if (!exerciseId || !selectedPlanId) return; // Nút đã disabled nên trường hợp này ít xảy ra
    setSaving(true);
    setError(null);
    try {
      const resData = await addExerciseToPlanApi({
        planId: selectedPlanId,
        exercise_id: exerciseId,
        sets_recommended: 3,
        reps_recommended: "8-12",
        rest_period_seconds: 60,
      });
      // Cập nhật session current_plan_context để Exercises biết plan hiện tại
      try {
        const picked = (items || []).find((p) => p.plan_id === selectedPlanId);
        const ctx = { plan_id: selectedPlanId, name: picked?.name || "" };
        sessionStorage.setItem("current_plan_context", JSON.stringify(ctx));
      } catch { }
      // Lấy tổng số bài tập từ response nếu BE có trả về (không gọi endpoint khác)
      const planItemCount = (() => {
        const d = resData;
        if (!d || typeof d !== 'object') return undefined;
        if (typeof d.plan_item_count === 'number') return d.plan_item_count;
        if (typeof d.items_count === 'number') return d.items_count;
        if (typeof d.total_items === 'number') return d.total_items;
        if (typeof d.total === 'number') return d.total;
        if (typeof d.count === 'number') return d.count;
        if (Array.isArray(d.items)) return d.items.length;
        if (Array.isArray(d.data?.items)) return d.data.items.length;
        if (Array.isArray(d.data)) return d.data.length;
        return undefined;
      })();

      // Nếu BE trả về tên bài tập, ưu tiên dùng; nếu không fallback từ state
      const serverExerciseName = resData?.exercise_name || resData?.exercise?.name || resData?.data?.exercise?.name;
      const addedExerciseName = serverExerciseName || exerciseName || "";

      // Điều hướng về trang bài tập và hiển thị thông báo nhỏ trong sidebar
      navigate("/exercises", {
        replace: true,
        state: {
          toast: "Thêm bài tập thành công",
          addedExerciseName,
          planItemCount,
        },
      });
    } catch (e) {
      setError({ message: e?.response?.data?.message || e?.message || "Không thể thêm vào plan" });
    } finally {
      setSaving(false);
    }
  };

  const handleQuickCreate = async () => {
    if (!exerciseId) return;
    setCreating(true);
    setError(null);
    try {
      const todayStr = new Date().toLocaleDateString("vi-VN");
      const newPlan = await createPlanApi({
        name: `Giáo án mới - ${todayStr}`,
        description: "Kế hoạch được tạo nhanh từ chức năng Thêm bài tập",
        difficulty_level: "beginner",
        is_public: false,
      });

      const planId = newPlan?.plan_id || newPlan?.data?.plan_id;
      if (!planId) throw new Error("Không lấy được ID kế hoạch mới tạo");

      const resData = await addExerciseToPlanApi({
        planId,
        exercise_id: exerciseId,
        sets_recommended: 3,
        reps_recommended: "8-12",
        rest_period_seconds: 60,
      });

      try {
        const ctx = { plan_id: planId, name: `Giáo án mới - ${todayStr}` };
        sessionStorage.setItem("current_plan_context", JSON.stringify(ctx));
      } catch { }

      const planItemCount = (() => {
        const d = resData;
        if (!d || typeof d !== "object") return undefined;
        if (typeof d.plan_item_count === "number") return d.plan_item_count;
        if (typeof d.items_count === "number") return d.items_count;
        if (typeof d.total_items === "number") return d.total_items;
        if (typeof d.total === "number") return d.total;
        if (typeof d.count === "number") return d.count;
        if (Array.isArray(d.items)) return d.items.length;
        if (Array.isArray(d.data?.items)) return d.data.items.length;
        if (Array.isArray(d.data)) return d.data.length;
        return undefined;
      })();

      const serverExerciseName = resData?.exercise_name || resData?.exercise?.name || resData?.data?.exercise?.name;
      const addedExerciseName = serverExerciseName || exerciseName || "";

      navigate("/exercises", {
        replace: true,
        state: {
          toast: "Tạo kế hoạch và thêm bài tập thành công",
          addedExerciseName,
          planItemCount,
        },
      });
    } catch (e) {
      setError({
        message: e?.response?.data?.message || e?.message || "Tạo nhanh kế hoạch thất bại",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (planId) => {
    setIsDeleting(true);
    setError(null);
    try {
      await deletePlanApi(planId);
      // Xóa plan khỏi state để cập nhật UI
      setItems(prevItems => prevItems.filter(p => p.plan_id !== planId));
      if (selectedPlanId === planId) {
        setSelectedPlanId(null); // Bỏ chọn nếu plan đang được chọn bị xóa
      }
      setDeletingPlan(null); // Đóng modal
    } catch (err) {
      setError({ message: err?.response?.data?.message || "Xóa kế hoạch thất bại." });
    } finally {
      setIsDeleting(false);
    }
  };

  const pendingPlans = items.filter((p) => !completedPlanIds.has(p.plan_id));
  const completedPlans = items.filter((p) => completedPlanIds.has(p.plan_id));

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-[800px] mx-auto px-4">

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Chọn kế hoạch để thêm bài tập</h1>
          <Button variant="ghost" size="icon" onClick={load} title="Tải lại">
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {exerciseId ? (
          <div className="mb-4 text-sm text-muted-foreground">Bài tập chọn: ID <b>{exerciseId}</b></div>
        ) : (
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertTitle>Thông báo</AlertTitle>
            <AlertDescription>Không có bài tập được chọn. Hãy quay lại Thư viện để chọn.</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <Info className="h-4 w-4" />
            <AlertTitle>Lỗi</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        {/* My plans */}
        <Card className="mb-6 rounded-xl shadow-sm border">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg">Kế hoạch của tôi</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-muted-foreground py-8 text-center flex flex-col items-center justify-center">
                Đang tải danh sách plan...
              </div>
            ) : items.length === 0 ? (
              <div className="text-sm text-muted-foreground py-10 text-center flex flex-col items-center justify-center">
                <Book className="h-10 w-10 mb-4 opacity-50" />
                Bạn chưa có kế hoạch nào.
              </div>
            ) : (
              <ScrollArea className="h-fit pr-4 max-h-[500px]">
                <RadioGroup
                  value={selectedPlanId ? String(selectedPlanId) : ""}
                  onValueChange={(val) => setSelectedPlanId(Number(val))}
                  className="space-y-6"
                >
                  {/* Chưa hoàn thành */}
                  {pendingPlans.length > 0 && (
                    <div>
                      <h4 className="text-sm uppercase tracking-wider text-muted-foreground font-semibold mb-3">Chưa hoàn thành</h4>
                      <div className="space-y-2">
                        {pendingPlans.map((p) => (
                          <div
                            key={p.plan_id}
                            onClick={() => setSelectedPlanId(p.plan_id)}
                            className={`flex items-start justify-between gap-3 p-4 border rounded-lg cursor-pointer transition-colors hover:bg-slate-100 ${selectedPlanId === p.plan_id ? 'border-primary bg-primary/5' : 'border-border'}`}
                          >
                            <div className="flex items-start gap-3 flex-1">
                              <RadioGroupItem value={String(p.plan_id)} id={`plan-${p.plan_id}`} className="mt-1" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium text-foreground truncate">{p.name || '(Không có tên)'}</span>
                                  {p.difficulty_level && <Badge variant="secondary" className="capitalize">{p.difficulty_level}</Badge>}
                                </div>
                                {p.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-1">{p.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/plans/${p.plan_id}`); }}
                              >
                                Xem
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeletingPlan(p); }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Đã hoàn thành */}
                  {completedPlans.length > 0 && (
                    <div>
                      <h4 className="text-sm uppercase tracking-wider text-muted-foreground font-semibold mb-3">Đã hoàn thành</h4>
                      <div className="space-y-2">
                        {completedPlans.map((p) => (
                          <div
                            key={p.plan_id}
                            onClick={() => setSelectedPlanId(p.plan_id)}
                            className={`flex items-start justify-between gap-3 p-4 border rounded-lg cursor-pointer transition-colors hover:bg-slate-100 ${selectedPlanId === p.plan_id ? 'border-primary bg-primary/5' : 'border-border'}`}
                          >
                            <div className="flex items-start gap-3 flex-1">
                              <RadioGroupItem value={String(p.plan_id)} id={`plan-${p.plan_id}`} className="mt-1" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium text-foreground truncate">{p.name || '(Không có tên)'}</span>
                                  {p.difficulty_level && <Badge variant="secondary" className="capitalize">{p.difficulty_level}</Badge>}
                                </div>
                                {p.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-1">{p.description}</p>
                                )}
                                <div className="mt-1 text-xs text-emerald-600 font-medium tracking-wide">Đã từng hoàn thành</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/plans/${p.plan_id}`); }}
                              >
                                Xem
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeletingPlan(p); }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </RadioGroup>
              </ScrollArea>
            )}
          </CardContent>
          <Separator />
          <CardFooter className="flex items-center gap-3 pt-6 justify-end">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/exercises')}
            >
              Trở lại Thư viện
            </Button>
            <Button
              size="lg"
              disabled={(items.length > 0 && !selectedPlanId) || !exerciseId || saving}
              onClick={handleAddToSelected}
            >
              Thêm vào plan đã chọn
            </Button>
          </CardFooter>
        </Card>

        {/* Nút Giáo án mới */}
        {exerciseId && (
          <Card className="flex flex-col items-center justify-center p-6 mt-6 border-dashed border-2 bg-transparent shadow-none">
            <CardTitle className="mb-2 text-base">Chưa có kế hoạch phù hợp?</CardTitle>
            <CardDescription className="mb-4 text-center max-w-[400px]">
              Tạo nhanh một giáo án mới và tự động thêm bài tập đang chọn.
            </CardDescription>
            <Button
              disabled={creating}
              onClick={handleQuickCreate}
              variant="default"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {creating ? "Đang tạo..." : "Giáo án mới"}
            </Button>
          </Card>
        )}

        {showNoPlansModal && (
          <NoPlansModal
            onClose={() => setShowNoPlansModal(false)}
            onCreatePlan={() => navigate(`/plans/new?exerciseId=${exerciseId}`)}
          />
        )}
        {deletingPlan && (
          <DeleteConfirmationModal
            planName={deletingPlan.name}
            onConfirm={() => handleDelete(deletingPlan.plan_id)}
            onCancel={() => setDeletingPlan(null)}
            isDeleting={isDeleting}
          />
        )}
      </div>
    </div>
  );
}
