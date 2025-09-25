import React, { useState, useRef } from 'react';
import axios from 'axios';

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
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      const response = await axios.post(`${backendUrl}/api/trainer/upload`, formData);

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
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-sky-400">Fitnexus - AI Trainer</h1>
        <p className="mt-2 text-lg text-slate-300">
          Tải lên ảnh chụp toàn thân để phân tích tỉ lệ cơ thể và nhận gợi ý bài tập
        </p>
      </header>

      {/* Upload Section */}
      <main>
        <div className="bg-slate-800 shadow-xl rounded-2xl p-6 max-w-3xl mx-auto mb-10">
          <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
            <label htmlFor="file-upload" className="w-full cursor-pointer border-2 border-dashed border-sky-500 text-sky-400 font-bold py-3 px-6 rounded-xl text-center transition-colors duration-300 hover:bg-sky-500 hover:text-slate-900">
              {selectedFile ? 'Ảnh đã được chọn!' : 'Nhấn vào đây để chọn ảnh'}
            </label>
            <input id="file-upload" type="file" accept="image/png, image/jpeg" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
            {selectedFile && <p className="text-sm text-slate-400">{selectedFile.name}</p>}
            
            <div className="flex gap-4 mt-2">
              <button type="submit" className="bg-green-500 text-white font-bold py-2 px-8 rounded-lg transition-transform duration-200 hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed disabled:scale-100" disabled={isLoading || !selectedFile}>
                {isLoading ? 'Đang xử lý...' : 'Phân tích'}
              </button>
              {selectedFile && <button type="button" onClick={handleReset} className="bg-red-500 text-white font-bold py-2 px-8 rounded-lg transition-transform duration-200 hover:scale-105">Reset</button>}
            </div>
          </form>
          {error && <p className="text-red-400 mt-4 font-semibold">{error}</p>}
        </div>

        {/* Results Section */}
        {(isLoading || analysisResult) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
            {/* Original Image */}
            <div className="bg-slate-800 shadow-xl rounded-2xl p-6">
              <h3 className="text-2xl font-bold text-sky-400 mb-4">Ảnh gốc</h3>
              {previewImage && <img src={previewImage} alt="Preview" className="rounded-lg" />}
            </div>

            {/* Processed Image & Analysis */}
            <div className="bg-slate-800 shadow-xl rounded-2xl p-6">
              <h3 className="text-2xl font-bold text-sky-400 mb-4">Kết quả phân tích</h3>
              {isLoading && (
                <div className="flex justify-center items-center h-full">
                  <div className="w-16 h-16 border-8 border-slate-600 border-t-sky-500 rounded-full animate-spin"></div>
                </div>
              )}
              {analysisResult && (
                <div>
                  <img src={analysisResult.processed_image_url} alt="Processed" className="rounded-lg mb-6" />
                  <div className="text-left text-slate-200 space-y-4">
                    <h4 className="text-xl font-bold text-sky-400">{analysisResult.analysis_data.title}</h4>
                    <ul className="list-disc list-inside space-y-1">
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
  );
};

export default AiTrainer;