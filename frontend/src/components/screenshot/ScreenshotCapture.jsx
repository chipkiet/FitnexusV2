import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import api from "../../lib/api.js";

export default function ScreenshotCapture({
  targetRef,
  feature,
  disabled,
  description,
}) {
  const [open, setOpen] = useState(false);
  const [selection, setSelection] = useState(null);
  const [dragging, setDragging] = useState(false);
  const dragStartRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const handleOpen = () => {
    if (!targetRef?.current) return;
    const rect = targetRef.current.getBoundingClientRect();
    setSelection({
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
    });
    setOpen(true);
    setMessage("");
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    const start = { x: e.clientX, y: e.clientY };
    dragStartRef.current = start;
    setDragging(true);
    setSelection({
      x: start.x,
      y: start.y,
      width: 0,
      height: 0,
    });
  };

  const handleMouseMove = (e) => {
    if (!dragging || !dragStartRef.current) return;
    const sx = dragStartRef.current.x;
    const sy = dragStartRef.current.y;
    const ex = e.clientX;
    const ey = e.clientY;
    const x = Math.min(sx, ex);
    const y = Math.min(sy, ey);
    const width = Math.abs(ex - sx);
    const height = Math.abs(ey - sy);
    setSelection({ x, y, width, height });
  };

  const handleMouseUp = () => {
    setDragging(false);
    dragStartRef.current = null;
  };

  const handleClose = () => {
    setOpen(false);
    setSelection(null);
    setMessage("");
    setDragging(false);
    dragStartRef.current = null;
  };

  const handleCapture = async () => {
    if (!targetRef?.current || !selection || busy) return;
    try {
      setBusy(true);
      setMessage("");

      const element = targetRef.current;
      const rect = element.getBoundingClientRect();
      const canvasFull = await html2canvas(element, {
        useCORS: true,
        backgroundColor: "#ffffff",
        scale: window.devicePixelRatio || 1,
      });

      let sx = selection.x - rect.left;
      let sy = selection.y - rect.top;
      let sw = selection.width;
      let sh = selection.height;

      sx = Math.max(0, sx);
      sy = Math.max(0, sy);
      sw = Math.min(sw, rect.width - sx);
      sh = Math.min(sh, rect.height - sy);

      if (sw <= 10 || sh <= 10) {
        setMessage("Vùng chọn quá nhỏ, hãy kéo rộng hơn.");
        return;
      }

      const scaleX = canvasFull.width / rect.width;
      const scaleY = canvasFull.height / rect.height;

      const cx = Math.round(sx * scaleX);
      const cy = Math.round(sy * scaleY);
      const cw = Math.round(sw * scaleX);
      const ch = Math.round(sh * scaleY);

      const canvasCrop = document.createElement("canvas");
      canvasCrop.width = cw;
      canvasCrop.height = ch;
      const ctx = canvasCrop.getContext("2d");
      ctx.drawImage(
        canvasFull,
        cx,
        cy,
        cw,
        ch,
        0,
        0,
        cw,
        ch
      );

      const blob = await new Promise((resolve, reject) => {
        canvasCrop.toBlob(
          (b) => {
            if (b) resolve(b);
            else reject(new Error("Không thể tạo ảnh từ canvas."));
          },
          "image/png",
          0.95
        );
      });

      const formData = new FormData();
      formData.append("file", blob, `${feature || "screenshot"}.png`);
      if (feature) formData.append("feature", feature);
      if (description) formData.append("description", description);

      const res = await api.post("/api/user-screenshots", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res?.data?.success) {
        setMessage("Đã lưu ảnh vào thư viện.");
        handleClose();
      } else {
        setMessage(res?.data?.message || "Không thể lưu ảnh.");
      }
    } catch (e) {
      console.error("ScreenshotCapture error:", e);
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Lỗi khi chụp hoặc lưu ảnh.";
      setMessage(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="fixed z-40 flex items-center justify-end bottom-6 right-4 sm:bottom-8 sm:right-8">
        <button
          type="button"
          onClick={handleOpen}
          disabled={disabled}
          className="inline-flex items-center px-3 py-2 text-xs font-medium text-rose-700 border border-rose-300 rounded-full shadow-md bg-rose-50 hover:bg-rose-100 disabled:opacity-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M4 7h3l2-2h6l2 2h3v11H4z"
            />
            <circle cx="12" cy="13" r="3.5" />
          </svg>
          <span>Chụp & lưu ảnh</span>
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[9999]"
          onMouseUp={handleMouseUp}
        >
          <div className="absolute inset-0 bg-black/60" />

          <div
            className="absolute inset-0 cursor-crosshair"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
          >
            {selection && (
              <div
                className="absolute border-2 border-dashed border-rose-400 bg-rose-200/5"
                style={{
                  left: `${selection.x}px`,
                  top: `${selection.y}px`,
                  width: `${selection.width}px`,
                  height: `${selection.height}px`,
                }}
              />
            )}
          </div>

          <div className="absolute left-1/2 transform -translate-x-1/2 bottom-6">
            <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-full shadow-lg">
              {message && (
                <span className="text-xs text-slate-600 max-w-xs">
                  {message}
                </span>
              )}
              <button
                type="button"
                className="px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50"
                onClick={handleClose}
                disabled={busy}
              >
                Hủy
              </button>
              <button
                type="button"
                className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 rounded-full hover:bg-rose-700 disabled:opacity-60"
                onClick={handleCapture}
                disabled={busy}
              >
                {busy ? "Đang lưu..." : "Chụp & lưu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
