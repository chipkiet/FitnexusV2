import React from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";

/**
 * Modal nhỏ cho Resume / Restart
 * Props:
 * - activeSession: object (session từ API)
 * - currentPlanId: id kế hoạch đang mở (để hiển thị)
 * - currentPlanName: tên kế hoạch đang mở
 * - onClose, onResume, onRestart
 */
export default function ResumeRestartModal({ activeSession, currentPlanId, currentPlanName, onClose, onResume, onRestart }) {
  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const updated = new Date(timestamp);
    const diffMs = now - updated;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} ngày trước`;
    if (diffHours > 0) return `${diffHours} giờ trước`;
    if (diffMins > 0) return `${diffMins} phút trước`;
    return 'vừa xong';
  };

  const isSamePlan = Number(activeSession.plan_id) === Number(currentPlanId);

  return (
    <Dialog open={true} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="sm:max-w-md w-[90vw] p-6 bg-white shadow-2xl rounded-xl">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl font-semibold text-gray-900 mb-2">Buổi tập hiện tại</DialogTitle>
          <DialogDescription asChild>
            <div className="text-sm text-gray-600">
              <div className="mb-4">
                <div className="font-medium text-gray-900">{activeSession.plan_name || `Kế hoạch #${activeSession.plan_id}`}</div>
                <div className="mt-1">
                  Lần cuối: {getTimeAgo(activeSession.updated_at)} • Tiến độ: {activeSession.current_exercise_index + 1}/{activeSession.exercises_count}
                </div>
              </div>

              {isSamePlan ? (
                <p className="mb-4 text-gray-700">Bạn đang có một buổi tập cùng kế hoạch này. Bạn có muốn tiếp tục hay bắt đầu lại?</p>
              ) : (
                <p className="mb-4 text-gray-700">
                  Bạn đang có một buổi tập ở kế hoạch khác ({activeSession.plan_name || `#${activeSession.plan_id}`}). 
                  Bạn có thể tiếp tục buổi đó hoặc kết thúc nó và bắt đầu kế hoạch hiện tại ({currentPlanName || "khác"}).
                </p>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          <button onClick={onResume} className="w-full px-4 py-3 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors">
            Tiếp tục buổi tập
          </button>
          <button onClick={onRestart} className="w-full px-4 py-3 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Kết thúc buổi kia và bắt đầu kế hoạch này
          </button>
          <button onClick={onClose} className="w-full px-4 py-3 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            Hủy
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

ResumeRestartModal.propTypes = {
  activeSession: PropTypes.object.isRequired,
  currentPlanId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  currentPlanName: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onResume: PropTypes.func.isRequired,
  onRestart: PropTypes.func.isRequired,
};