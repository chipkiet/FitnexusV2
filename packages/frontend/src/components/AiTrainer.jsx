import React, { useState, useRef } from 'react';
import api from '../lib/api.js';
import HeaderLogin from './header/HeaderLogin.jsx';

const AiTrainer = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // Giới hạn 10MB
        setError('Kích thước ảnh quá lớn. Vui lòng chọn ảnh dưới 10MB.');
        return;
      }
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
      setAnalysisResult(null);
      setError('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      setError('Vui lòng chọn một file ảnh.');
      return;
    }
    setIsLoading(true);
    setError('');
    setAnalysisResult(null);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await api.post(`/api/trainer/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data && response.data.success) {
        setAnalysisResult(response.data.data);
      } else {
        throw new Error("Phản hồi từ server không hợp lệ.");
      }
    } catch (err) {
      const serverError = err.response?.data?.errors?.[0]?.details || err.response?.data?.message || err.message;
      setError(`Đã có lỗi xảy ra: ${serverError}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReset = () => {
    setSelectedFile(null);
    setPreviewImage(null);
    setAnalysisResult(null);
    setError('');
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <HeaderLogin />
      <div className="w-full p-4 mx-auto max-w-7xl sm:p-6 lg:p-8">
      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold sm:text-5xl text-sky-400">Fitnexus - AI Trainer</h1>
        <p className="mt-2 text-lg text-slate-300">
          Tải lên ảnh chụp toàn thân để phân tích tỉ lệ cơ thể và nhận gợi ý bài tập
        </p>
      </header>

      {/* Upload Section */}
      <main>
        <div className="max-w-3xl p-6 mx-auto mb-10 shadow-xl bg-slate-800 rounded-2xl">
          <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
            <label htmlFor="file-upload" className="w-full px-6 py-3 font-bold text-center transition-colors duration-300 border-2 border-dashed cursor-pointer border-sky-500 text-sky-400 rounded-xl hover:bg-sky-500 hover:text-slate-900">
              {selectedFile ? 'Ảnh đã được chọn!' : 'Nhấn vào đây để chọn ảnh'}
            </label>
            <input id="file-upload" type="file" accept="image/png, image/jpeg" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
            {selectedFile && <p className="text-sm text-slate-400">{selectedFile.name}</p>}
            
            <div className="flex gap-4 mt-2">
              <button type="submit" className="px-8 py-2 font-bold text-white transition-transform duration-200 bg-green-500 rounded-lg hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed disabled:scale-100" disabled={isLoading || !selectedFile}>
                {isLoading ? 'Đang xử lý...' : 'Phân tích'}
              </button>
              {selectedFile && <button type="button" onClick={handleReset} className="px-8 py-2 font-bold text-white transition-transform duration-200 bg-red-500 rounded-lg hover:scale-105">Reset</button>}
            </div>
          </form>
          {error && <p className="mt-4 font-semibold text-red-400">{error}</p>}
        </div>

        {/* Results Section */}
        {(isLoading || analysisResult) && (
          <div className="grid grid-cols-1 gap-8 mt-10 lg:grid-cols-2">
            {/* Original Image */}
            <div className="p-6 shadow-xl bg-slate-800 rounded-2xl">
              <h3 className="mb-4 text-2xl font-bold text-sky-400">Ảnh gốc</h3>
              {previewImage && <img src={previewImage} alt="Preview" className="rounded-lg" />}
            </div>

            {/* Processed Image & Analysis */}
            <div className="p-6 shadow-xl bg-slate-800 rounded-2xl">
              <h3 className="mb-4 text-2xl font-bold text-sky-400">Kết quả phân tích</h3>
              {isLoading && (
                <div className="flex items-center justify-center h-full">
                  <div className="w-16 h-16 border-8 rounded-full border-slate-600 border-t-sky-500 animate-spin"></div>
                </div>
              )}
              {analysisResult && (
                <div>
                  <img src={analysisResult.processed_image_url} alt="Processed" className="mb-6 rounded-lg" />
                  <div className="space-y-4 text-left text-slate-200">
                    <h4 className="text-xl font-bold text-sky-400">{analysisResult.analysis_data.title}</h4>
                    <ul className="space-y-1 list-disc list-inside">
                      {analysisResult.analysis_data.exercises.map((ex, index) => (
                        <li key={index}>{ex}</li>
                      ))}
                    </ul>
                    <p><strong className="font-semibold text-sky-400">Lời khuyên:</strong> {analysisResult.analysis_data.advice}</p>
                  </div>
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
