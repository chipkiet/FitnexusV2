import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, getMyPlansApi, deletePlanApi } from "../../lib/api.js";
import HeaderLogin from "../../components/header/HeaderLogin.jsx";

function DeleteConfirmationModal({ planName, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onCancel}>
      <div className="w-full max-w-md p-6 mx-4 bg-white shadow-2xl rounded-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-2 text-xl font-semibold text-red-800">Xác nhận xóa</h3>
        <p className="mb-6 text-sm text-gray-600">
          Bạn có chắc chắn muốn xóa kế hoạch "<b>{planName}</b>"? Hành động này không thể hoàn tác.
        </p>
        <div className="flex gap-4">
          <button onClick={onCancel} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
            Hủy
          </button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700">
            Xóa kế hoạch
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PlanManagement() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingPlan, setDeletingPlan] = useState(null); // State for confirmation modal

  const loadPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      // Sử dụng api.get trực tiếp để đảm bảo gọi đúng endpoint
      const res = await api.get('/api/plans', { 
        params: { mine: 1, limit: 200, offset: 0 } 
      });
      const planItems = res?.data?.items ?? res?.data ?? [];
      setPlans(Array.isArray(planItems) ? planItems : []);
    } catch (e) {
      setError("Không thể tải danh sách kế hoạch.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleDelete = async (planId) => {
    try {
      await deletePlanApi(planId);
      setPlans(plans.filter((p) => p.plan_id !== planId));
      setDeletingPlan(null); // Close modal on success
    } catch (err) {
      setError("Xóa kế hoạch thất bại. Vui lòng thử lại.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderLogin />
      <div className="max-w-4xl px-4 py-10 mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Kế hoạch</h1>
          <button
            onClick={() => navigate("/plans/new")}
            className="px-4 py-2 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700"
          >
            Tạo kế hoạch mới
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 text-sm text-red-700 border border-red-200 rounded-md bg-red-50">
            {error}
          </div>
        )}

        {loading ? (
          <p>Đang tải...</p>
        ) : plans.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-500">Bạn chưa có kế hoạch nào.</p>
            <button
              onClick={() => navigate("/plans/new")}
              className="mt-4 px-4 py-2 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700"
            >
              Tạo ngay
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {plans.map((plan) => (
              <div key={plan.plan_id} className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm">
                <div className="flex-1">
                  <h2 className="font-semibold text-gray-800">{plan.name}</h2>
                  <p className="text-sm text-gray-500">{plan.description || "Không có mô tả"}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/plans/${plan.plan_id}`)}
                    className="px-3 py-1 text-sm text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50"
                  >
                    Xem
                  </button>
                  <button
                    onClick={() => navigate(`/plans/edit/${plan.plan_id}`)}
                    className="px-3 py-1 text-sm text-yellow-600 border border-yellow-200 rounded-md hover:bg-yellow-50"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => setDeletingPlan(plan)}
                    className="px-3 py-1 text-sm text-red-600 border border-red-200 rounded-md hover:bg-red-50"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {deletingPlan && (
        <DeleteConfirmationModal
          planName={deletingPlan.name}
          onConfirm={() => handleDelete(deletingPlan.plan_id)}
          onCancel={() => setDeletingPlan(null)}
        />
      )}
    </div>
  );
}