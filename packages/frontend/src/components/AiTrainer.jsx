import React, { useState, useRef } from 'react';
import api from '../lib/api.js';
import HeaderLogin from './header/HeaderLogin.jsx';

const AiTrainer = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [heightCm, setHeightCm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const [showPlan, setShowPlan] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        // Giới hạn 10MB
        setError("Kích thước ảnh quá lớn. Vui lòng chọn ảnh dưới 10MB.");
        return;
      }
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
      setAnalysisResult(null);
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      setError("Vui lòng chọn một file ảnh.");
      return;
    }
    setIsLoading(true);
    setError("");
    setAnalysisResult(null);
    setShowPlan(false);

    const formData = new FormData();
    formData.append("image", selectedFile);
    if (heightCm) {
      formData.append("known_height_cm", String(heightCm));
    }

    try {
      const response = await api.post(`/api/trainer/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data && response.data.success) {
        setAnalysisResult(response.data.data);
      } else {
        throw new Error("Phản hồi từ server không hợp lệ.");
      }
    } catch (err) {
      const serverError =
        err.response?.data?.errors?.[0]?.details ||
        err.response?.data?.message ||
        err.message;
      setError(`Đã có lỗi xảy ra: ${serverError}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewImage(null);
    setAnalysisResult(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <HeaderLogin />
      <div className="w-full p-4 mx-auto max-w-7xl sm:p-6 lg:p-8">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-blue-300 sm:text-5xl">
            Fitnexus - AI Trainer
          </h1>
          <p className="mt-2 text-lg text-slate-600">
            Tải ảnh toàn thân để phân tích chỉ số cơ thể (hiển thị cm)
          </p>
        </header>

        {/* Upload Section */}
        <main>
          <div className="max-w-3xl p-6 mx-auto mb-10 bg-white border shadow-lg rounded-2xl border-rose-200">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col items-center gap-4"
            >
              <label
                htmlFor="file-upload"
                className="w-full px-6 py-3 font-bold text-center transition-colors duration-300 border-2 border-dashed cursor-pointer rounded-xl border-rose-300 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
              >
                {selectedFile
                  ? "Ảnh đã được chọn!"
                  : "Nhấn vào đây để chọn ảnh"}
              </label>
              <input
                id="file-upload"
                type="file"
                accept="image/png, image/jpeg"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
              />
              {selectedFile && (
                <p className="text-sm font-semibold text-rose-700">
                  {selectedFile.name}
                </p>
              )}
              <div className="flex items-center w-full gap-3">
                <label
                  htmlFor="height-cm"
                  className="text-sm font-semibold text-rose-700 whitespace-nowrap"
                >
                  Chiều cao (cm, bắt buộc)
                </label>
                <input
                  id="height-cm"
                  type="number"
                  min="100"
                  max="230"
                  step="0.1"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  placeholder="VD: 175"
                  required
                  className="flex-1 px-3 py-2 bg-white border rounded-md outline-none text-rose-700 placeholder-slate-400 border-rose-300 focus:border-rose-500"
                />
              </div>

              <div className="flex gap-4 mt-2">
                <button
                  type="submit"
                  className="px-8 py-2 font-bold text-white transition-transform duration-200 rounded-lg bg-rose-500 hover:bg-rose-600 hover:scale-105 disabled:bg-rose-200 disabled:cursor-not-allowed disabled:scale-100"
                  disabled={isLoading || !selectedFile || !heightCm}
                >
                  {isLoading ? "Đang xử lý..." : "Phân tích"}
                </button>
                {selectedFile && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-8 py-2 font-bold text-white transition-transform duration-200 bg-blue-500 rounded-lg hover:bg-blue-600 hover:scale-105"
                  >
                    Reset
                  </button>
                )}
              </div>
            </form>
            {error && (
              <p className="mt-4 font-semibold text-rose-600">{error}</p>
            )}
          </div>

          {/* Results Section */}
          {(isLoading || analysisResult) && (
            <div className="grid grid-cols-1 gap-8 mt-10 lg:grid-cols-2">
              {/* Original Image */}
              <div className="p-6 bg-white border border-blue-100 shadow-lg rounded-2xl">
                <h3 className="mb-4 text-2xl font-extrabold text-rose-600">
                  Ảnh gốc
                </h3>
                {previewImage && (
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="rounded-lg shadow"
                  />
                )}
              </div>

              {/* Processed Image & Analysis */}
              <div className="p-6 bg-white border border-blue-100 shadow-lg rounded-2xl">
                <h3 className="mb-4 text-2xl font-extrabold text-rose-600">
                  Kết quả phân tích
                </h3>
                {isLoading && (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-16 h-16 border-8 rounded-full border-rose-200 border-t-rose-500 animate-spin"></div>
                  </div>
                )}
                {analysisResult && (
                  <div className="space-y-6">
                    <img
                      src={analysisResult.processed_image_url}
                      alt="Processed"
                      className="mb-2 rounded-lg shadow"
                    />
                    {/* Metrics & Assessment first */}
                    <MetricsPanel
                      analysisResult={analysisResult}
                      heightCm={heightCm}
                    />

                    {/* CTA to reveal workout plan */}
                    {!showPlan && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => setShowPlan(true)}
                          className="px-6 py-2 font-semibold text-white transition bg-blue-500 rounded-lg hover:bg-blue-400"
                        >
                          Nhận kế hoạch bài tập ngay
                        </button>
                      </div>
                    )}

                    {/* Plan and advice (hidden until user requests) */}
                    {showPlan && (
                      <div className="space-y-4">
                        <h4 className="text-xl font-bold text-rose-600">
                          {analysisResult.analysis_data.title}
                        </h4>
                        {Array.isArray(
                          analysisResult.analysis_data.exercises
                        ) &&
                          analysisResult.analysis_data.exercises.length > 0 && (
                            <ul className="space-y-1 list-disc list-inside">
                              {analysisResult.analysis_data.exercises.map(
                                (ex, index) => (
                                  <li key={index}>{ex}</li>
                                )
                              )}
                            </ul>
                          )}
                        {analysisResult.analysis_data.advice && (
                          <p>
                            <strong className="font-semibold text-blue-600">
                              Lời khuyên:
                            </strong>{" "}
                            {analysisResult.analysis_data.advice}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AiTrainer;

// --- Subcomponents ---
function MetricsPanel({ analysisResult, heightCm }) {
  const m = analysisResult?.measurements || {};
  const px = m.pixel_measurements || {};
  const cm = m.cm_measurements || {};
  const hasCmFromApi = cm && Object.keys(cm).length > 0;
  const derivedScale =
    !hasCmFromApi && heightCm && px.height
      ? Number(heightCm) / Number(px.height)
      : null;
  const useCm = hasCmFromApi || !!derivedScale;

  const fmt = (key) => {
    if (useCm) {
      const value =
        cm[key] != null
          ? Number(cm[key])
          : derivedScale && px[key] != null
          ? Number(px[key]) * derivedScale
          : null;
      if (value != null) return `${value.toFixed(1)} cm`;
    }
    if (px[key] != null) return `${Number(px[key]).toFixed(1)} px`;
    return "—";
  };

  const ratio = (key) => {
    const v = px[key];
    if (v == null) return "—";
    return Number(v).toFixed(2);
  };

  // Extra derived ratio
  const legToHeight = (() => {
    const l = px.leg_length,
      h = px.height;
    if (l && h && h > 0) return (l / h).toFixed(2);
    return "—";
  })();

  return (
    <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
      <h4 className="mb-3 text-lg font-extrabold text-rose-600">
        Chỉ số cơ thể
      </h4>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Metric label="Shoulder width" value={fmt("shoulder_width")} />
        <Metric label="Waist width" value={fmt("waist_width")} />
        <Metric label="Hip width" value={fmt("hip_width")} />
        <Metric label="Height estimate" value={fmt("height")} />
        <Metric label="Leg length" value={fmt("leg_length")} />
        <Metric
          label="Shoulder/Hip ratio"
          value={ratio("shoulder_hip_ratio")}
        />
        <Metric label="Waist/Hip ratio" value={ratio("waist_hip_ratio")} />
        <Metric label="Leg/Height ratio" value={legToHeight} />
      </div>
      {(analysisResult.analysis_data?.shape_type ||
        analysisResult.analysis_data?.somatotype) && (
        <div className="pt-3 mt-3 border-t border-rose-200">
          {analysisResult.analysis_data.shape_type && (
            <p className="font-semibold text-rose-700">
              <strong className="text-rose-700">Kiểu hình:</strong>{" "}
              {analysisResult.analysis_data.shape_type}
            </p>
          )}
          {analysisResult.analysis_data.somatotype && (
            <p className="font-semibold text-blue-700">
              <strong className="text-blue-700">Cơ địa:</strong>{" "}
              {analysisResult.analysis_data.somatotype}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 bg-white border border-blue-100 rounded-md">
      <span className="text-sm font-semibold text-rose-700">{label}</span>
      <span className="font-bold text-blue-700">{value}</span>
    </div>
  );
}
