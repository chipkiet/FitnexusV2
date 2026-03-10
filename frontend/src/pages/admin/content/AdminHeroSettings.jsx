// packages/frontend/src/pages/admin/content/AdminHeroSettings.jsx
import React, { useState, useEffect } from "react";
import { getSystemContentApi, updateSystemContentApi } from "../../../lib/api";
import {
  Save,
  UploadCloud,
  Video,
  Image,
  Loader2,
  PlayCircle,
} from "lucide-react";

export default function AdminHeroSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Dữ liệu form
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    buttonText: "",
    showButton: true,
    mediaType: "video",
    mediaUrl: "",
  });

  // File upload
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null); // URL blob tạm thời

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await getSystemContentApi("dashboard_hero");
      if (res.success && res.data) {
        setFormData(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      // Tạo preview ngay lập tức
      const objectUrl = URL.createObjectURL(f);
      setPreviewUrl(objectUrl);

      // Tự động set loại
      const type = f.type.startsWith("video") ? "video" : "image";
      setFormData((prev) => ({ ...prev, mediaType: type }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = new FormData();
      // Gửi toàn bộ text setting
      data.append("content", JSON.stringify(formData));

      // Nếu có file mới thì gửi kèm
      if (file) {
        data.append("mediaFile", file);
      }

      const res = await updateSystemContentApi("dashboard_hero", data);

      if (res.success) {
        alert("Đã cập nhật thành công!");

        // QUAN TRỌNG: Cập nhật lại state bằng dữ liệu server trả về (đã có link ảnh thật)
        setFormData(res.data);

        // Reset file upload state
        setFile(null);
        setPreviewUrl(null);
      }
    } catch (error) {
      alert("Lỗi: " + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <div className="p-8 text-center">Loading settings...</div>;

  return (
    <div className="max-w-5xl p-6 mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Cấu hình Dashboard Hero
        </h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium shadow-sm transition-all"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* LEFT COLUMN: EDITOR */}
        <div className="space-y-6 lg:col-span-2">
          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <h3 className="pb-2 mb-4 text-lg font-semibold text-gray-800 border-b">
              Nội dung văn bản
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Tiêu đề chính (HTML)
                </label>
                <input
                  value={formData.title || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 font-mono text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder='VD: Chào mừng <span class="text-blue-500">User</span>'
                />
                <p className="mt-1 text-xs text-gray-500">
                  Hỗ trợ thẻ &lt;span&gt;, &lt;br&gt; để định dạng.
                </p>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Mô tả phụ
                </label>
                <textarea
                  rows={3}
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Text nút bấm
                  </label>
                  <input
                    value={formData.buttonText || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, buttonText: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.showButton || false}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          showButton: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Hiển thị nút hành động
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: MEDIA UPLOAD */}
        <div className="space-y-6">
          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <h3 className="pb-2 mb-4 text-lg font-semibold text-gray-800 border-b">
              Media nền
            </h3>

            {/* Media Preview Area */}
            <div className="relative mb-4 overflow-hidden bg-gray-900 border border-gray-300 rounded-lg aspect-video group">
              {previewUrl || formData.mediaUrl ? (
                formData.mediaType === "video" ? (
                  <video
                    key={previewUrl || formData.mediaUrl} // Force re-render when url changes
                    src={previewUrl || formData.mediaUrl}
                    className="object-cover w-full h-full opacity-90"
                    autoPlay
                    muted
                    loop
                  />
                ) : (
                  <img
                    src={previewUrl || formData.mediaUrl}
                    className="object-cover w-full h-full"
                    alt="Hero Preview"
                  />
                )
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-500">
                  <Image className="w-8 h-8 opacity-50" />
                  <span className="text-xs">Chưa có media</span>
                </div>
              )}

              {/* Type Indicator */}
              <div className="absolute px-2 py-1 text-xs font-bold text-white uppercase rounded top-2 right-2 bg-black/50 backdrop-blur">
                {formData.mediaType}
              </div>
            </div>

            {/* Toggle Type Buttons */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setFormData({ ...formData, mediaType: "video" })}
                className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                  formData.mediaType === "video"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Video size={14} /> Video
              </button>
              <button
                onClick={() => setFormData({ ...formData, mediaType: "image" })}
                className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                  formData.mediaType === "image"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Image size={14} /> Ảnh
              </button>
            </div>

            {/* Upload Box */}
            <label className="block w-full">
              <div className="flex flex-col items-center justify-center w-full gap-2 py-4 transition-all border-2 border-gray-300 border-dashed cursor-pointer rounded-xl hover:border-blue-500 hover:bg-blue-50">
                <input
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="p-2 bg-white border border-gray-200 rounded-full shadow-sm">
                  <UploadCloud className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-center">
                  <span className="text-sm font-semibold text-gray-700">
                    {file ? "Đã chọn: " + file.name : "Nhấn để tải lên"}
                  </span>
                  {!file && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      MP4, JPG, PNG (Max 100MB)
                    </p>
                  )}
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
