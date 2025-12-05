import React, { useState } from "react"; // Bỏ useEffect, useMemo nếu không dùng
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { getToken } from "../../../lib/tokenManager.js";

import {
  Save,
  X,
  UploadCloud,
  Plus,
  Trash2,
  Video,
  Image as ImageIcon,
  Dumbbell,
  Layers,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

// --- Mock Data ---
const DIFFICULTIES = ["beginner", "intermediate", "advanced"];
const TYPES = ["compound", "isolation", "cardio", "stretching", "plyometrics"];
const MUSCLE_LIST = [
  { id: 1, name: "Ngực (Chest)" },
  { id: 2, name: "Lưng (Back)" },
  { id: 3, name: "Vai (Shoulders)" },
  { id: 4, name: "Tay (Arms)" },
  { id: 5, name: "Bụng (Core)" },
  { id: 6, name: "Chân (Legs)" },
  { id: 7, name: "Ngực trên" },
  { id: 8, name: "Ngực giữa" },
  { id: 15, name: "Vai trước" },
  { id: 23, name: "Tay sau (Triceps)" },
  { id: 29, name: "Đùi trước (Quads)" },
  { id: 30, name: "Đùi sau (Hamstrings)" },
  { id: 31, name: "Mông (Glutes)" },
];

export default function AdminExerciseRight() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  // --- State Form Data ---
  const [formData, setFormData] = useState({
    name: "",
    name_en: "",
    slug: "",
    description: "",
    difficulty_level: "beginner",
    exercise_type: "compound",
    equipment_needed: "",
    popularity_score: 0,
    primary_video_url: "",
  });

  // --- State Media Files (Single) ---
  const [files, setFiles] = useState({
    thumbnail: null,
    gif: null,
    video: null,
  });
  const [previews, setPreviews] = useState({
    thumbnail: null,
    gif: null,
    video: null,
  });

  // --- State Gallery (Multi) ---
  // FIX 1: Sửa tên biến đúng chính tả
  const [galleryItems, setGalleryItems] = useState([]);

  // --- State Instructions & Muscles ---
  const [instructions, setInstructions] = useState([
    { step_number: 1, instruction_text: "" },
  ]);
  const [selectedMuscles, setSelectedMuscles] = useState([]);
  const [muscleInput, setMuscleInput] = useState("");
  const [loading, setLoading] = useState(false);

  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "name" && !isEditMode) {
      const slug = value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    if (field === "gallery_videos") {
      const newItem = {
        file: file,
        preview: URL.createObjectURL(file),
        title: "Góc quay khác", // Title mặc định
      };
      setGalleryItems((prev) => [...prev, newItem]);
    } else {
      setFiles((prev) => ({ ...prev, [field]: file }));
      setPreviews((prev) => ({ ...prev, [field]: URL.createObjectURL(file) }));
    }
    e.target.value = null; // Reset input
  };

  const removeGalleryItem = (index) => {
    setGalleryItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGalleryTitleChange = (index, newTitle) => {
    const newItems = [...galleryItems];
    newItems[index].title = newTitle;
    setGalleryItems(newItems);
  };

  // ... (Các hàm addStep, removeStep, addMuscle... giữ nguyên như cũ)
  const addStep = () =>
    setInstructions([
      ...instructions,
      { step_number: instructions.length + 1, instruction_text: "" },
    ]);
  const removeStep = (index) =>
    setInstructions(
      instructions
        .filter((_, i) => i !== index)
        .map((s, i) => ({ ...s, step_number: i + 1 }))
    );
  const handleStepChange = (index, value) => {
    const n = [...instructions];
    n[index].instruction_text = value;
    setInstructions(n);
  };

  const addMuscle = () => {
    const mId = parseInt(muscleInput);
    if (!mId || selectedMuscles.find((m) => m.id === mId)) return;
    const mName = MUSCLE_LIST.find((m) => m.id === mId)?.name;
    setSelectedMuscles([
      ...selectedMuscles,
      { id: mId, impact: "primary", name: mName },
    ]);
    setMuscleInput("");
  };
  const removeMuscle = (id) =>
    setSelectedMuscles(selectedMuscles.filter((m) => m.id !== id));
  const toggleImpact = (id) =>
    setSelectedMuscles(
      selectedMuscles.map((m) =>
        m.id === id
          ? { ...m, impact: m.impact === "primary" ? "secondary" : "primary" }
          : m
      )
    );

  // --- SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();

      // 1. Text Data
      Object.keys(formData).forEach((key) => data.append(key, formData[key]));

      // 2. JSON Data
      data.append("instructions", JSON.stringify(instructions));
      data.append("muscles", JSON.stringify(selectedMuscles));

      // 3. Single Files
      if (files.thumbnail) data.append("thumbnail", files.thumbnail);
      if (files.gif) data.append("gif", files.gif);
      if (files.video) data.append("video", files.video);

      // 4. Gallery Files (FIX 2: Sửa tên biến và tên key gửi lên)
      galleryItems.forEach((item) => {
        data.append("gallery_videos", item.file);
        data.append("gallery_titles", item.title); // FIX: Thêm 's' vào cuối (gallery_titles) để khớp Backend
      });

      // 5. Call API
      const url = isEditMode ? `/api/exercises/${id}` : "/api/exercises";
      const token = getToken();

      const res = await axios.post(url, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        alert("Lưu bài tập thành công!");
        navigate("/admin/content/exercises");
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Có lỗi xảy ra";
      if (error.response?.status === 401) {
        alert("Phiên đăng nhập hết hạn.");
        navigate("/login");
      } else {
        alert(`Lỗi: ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // ... (Phần return JSX giữ nguyên như bạn đã viết, chỉ lưu ý dùng đúng biến `galleryItems`)
  return (
    <div className="max-w-6xl mx-auto">
      {/* ... Header ... */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white border rounded-full hover:bg-gray-50"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            {isEditMode ? "Chỉnh sửa" : "Thêm mới"}
          </h1>
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-70 shadow-sm font-medium"
        >
          {loading ? (
            "Đang lưu..."
          ) : (
            <>
              <Save className="w-4 h-4" /> Lưu bài tập
            </>
          )}
        </button>
      </div>

      <form
        className="grid grid-cols-1 gap-8 lg:grid-cols-3"
        onSubmit={(e) => e.preventDefault()}
      >
        {/* LEFT COLUMN (Info, Instructions, Muscles) - Giữ nguyên code của bạn */}
        <div className="space-y-6 lg:col-span-2">
          {/* ... Copy lại phần Card Basic Info, Instructions, Muscles từ code cũ ... */}
          {/* Mình lược bớt để code ngắn gọn, bạn giữ nguyên phần JSX cột trái nhé */}
          {/* Card: Basic Info */}
          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-800">
              <Dumbbell className="w-5 h-5 text-blue-500" /> Thông tin chung
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Tên bài tập (TV) <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: Đẩy ngực ngang"
                />
              </div>

              <div className="md:col-span-1">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Tên tiếng Anh
                </label>
                <input
                  name="name_en"
                  value={formData.name_en}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: Bench Press"
                />
              </div>

              <div className="md:col-span-1">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Slug (URL)
                </label>
                <input
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className="w-full px-4 py-2 font-mono text-sm text-gray-500 border rounded-lg bg-gray-50"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Mô tả ngắn
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Giới thiệu về bài tập..."
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Độ khó
                </label>
                <select
                  name="difficulty_level"
                  value={formData.difficulty_level}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border rounded-lg"
                >
                  {DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Loại bài tập
                </label>
                <select
                  name="exercise_type"
                  value={formData.exercise_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border rounded-lg"
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Dụng cụ
                </label>
                <input
                  name="equipment_needed"
                  value={formData.equipment_needed}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="VD: barbell, bench"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Độ phổ biến (0-100)
                </label>
                <input
                  type="number"
                  name="popularity_score"
                  value={formData.popularity_score}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Card: Instructions */}
          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <Layers className="w-5 h-5 text-purple-500" /> Các bước thực
                hiện
              </h3>
              <button
                onClick={addStep}
                className="flex items-center text-sm text-blue-600 hover:underline"
              >
                <Plus className="w-4 h-4 mr-1" /> Thêm bước
              </button>
            </div>

            <div className="space-y-3">
              {instructions.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className="flex items-center justify-center flex-shrink-0 w-6 h-6 mt-2 text-xs font-bold text-gray-400 bg-gray-100 rounded-full">
                    {idx + 1}
                  </span>
                  <textarea
                    value={step.instruction_text}
                    onChange={(e) => handleStepChange(idx, e.target.value)}
                    rows={2}
                    className="flex-1 px-3 py-2 text-sm border rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder={`Hướng dẫn bước ${idx + 1}...`}
                  />
                  <button
                    onClick={() => removeStep(idx)}
                    className="p-2 text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Card: Muscles */}
          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-800">
              <AlertCircle className="w-5 h-5 text-red-500" /> Nhóm cơ tác động
            </h3>

            <div className="flex gap-2 mb-4">
              <select
                value={muscleInput}
                onChange={(e) => setMuscleInput(e.target.value)}
                className="flex-1 px-4 py-2 border rounded-lg"
              >
                <option value="">-- Chọn nhóm cơ --</option>
                {MUSCLE_LIST.map((m) => (
                  <option
                    key={m.id}
                    value={m.id}
                    disabled={selectedMuscles.some((sm) => sm.id === m.id)}
                  >
                    {m.name}
                  </option>
                ))}
              </select>
              <button
                onClick={addMuscle}
                disabled={!muscleInput}
                className="px-4 py-2 text-sm font-medium bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Thêm
              </button>
            </div>

            <div className="space-y-2">
              {selectedMuscles.length === 0 && (
                <p className="text-sm italic text-gray-400">
                  Chưa chọn nhóm cơ nào.
                </p>
              )}
              {selectedMuscles.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                >
                  <span className="font-medium text-gray-700">{m.name}</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleImpact(m.id)}
                      className={`text-xs px-2 py-1 rounded border capitalize w-24 text-center transition ${
                        m.impact === "primary"
                          ? "bg-blue-100 text-blue-700 border-blue-200 font-bold"
                          : "bg-green-100 text-green-700 border-green-200"
                      }`}
                    >
                      {m.impact}
                    </button>
                    <button
                      onClick={() => removeMuscle(m.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (Media) */}
        <div className="space-y-6">
          {/* Main Video */}
          <div className="p-5 bg-white border border-gray-200 shadow-sm rounded-xl">
            {/* ... (Giữ nguyên) ... */}
            <h4 className="flex items-center gap-2 mb-3 font-semibold text-gray-800">
              <Video className="w-4 h-4 text-blue-600" /> Video Chính (Cloud)
            </h4>
            <div className="relative p-4 text-center transition border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50">
              {previews.video ? (
                <div className="relative">
                  <video
                    src={previews.video}
                    className="object-contain w-full h-40 bg-black rounded"
                    controls
                  />
                  <button
                    onClick={() => {
                      setFiles((p) => ({ ...p, video: null }));
                      setPreviews((p) => ({ ...p, video: null }));
                    }}
                    className="absolute p-1 text-white bg-red-500 rounded-full shadow -top-2 -right-2"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="block cursor-pointer">
                  <UploadCloud className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    Click để tải lên Video
                  </span>
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, "video")}
                  />
                </label>
              )}
            </div>

            {/* Youtube Fallback */}
            <div className="mt-4">
              <label className="block mb-1 text-xs font-medium text-gray-500">
                Hoặc Link Youtube (Tham khảo)
              </label>
              <input
                name="primary_video_url"
                value={formData.primary_video_url}
                onChange={handleChange}
                className="w-full px-3 py-1.5 border rounded text-sm"
                placeholder="https://youtube.com/..."
              />
            </div>
          </div>

          {/* Thumbnail & GIF */}
          <div className="p-5 bg-white border border-gray-200 shadow-sm rounded-xl">
            {/* ... (Giữ nguyên) ... */}
            <h4 className="flex items-center gap-2 mb-3 font-semibold text-gray-800">
              <ImageIcon className="w-4 h-4 text-green-600" /> Ảnh Bìa & GIF
            </h4>

            <div className="grid grid-cols-2 gap-4">
              {/* Thumb */}
              <div className="text-center">
                <p className="mb-2 text-xs text-gray-500">Thumbnail</p>
                <div className="relative flex items-center justify-center h-32 overflow-hidden border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50">
                  {previews.thumbnail ? (
                    <>
                      <img
                        src={previews.thumbnail}
                        alt="Preview"
                        className="object-cover w-full h-full"
                      />
                      <button
                        onClick={() => {
                          setFiles((p) => ({ ...p, thumbnail: null }));
                          setPreviews((p) => ({ ...p, thumbnail: null }));
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <label className="flex items-center justify-center w-full h-full cursor-pointer">
                      <Plus className="w-6 h-6 text-gray-400" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, "thumbnail")}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* GIF */}
              <div className="text-center">
                <p className="mb-2 text-xs text-gray-500">Ảnh động (GIF)</p>
                <div className="relative flex items-center justify-center h-32 overflow-hidden border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50">
                  {previews.gif ? (
                    <>
                      <img
                        src={previews.gif}
                        alt="Preview"
                        className="object-cover w-full h-full"
                      />
                      <button
                        onClick={() => {
                          setFiles((p) => ({ ...p, gif: null }));
                          setPreviews((p) => ({ ...p, gif: null }));
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <label className="flex items-center justify-center w-full h-full cursor-pointer">
                      <Plus className="w-6 h-6 text-gray-400" />
                      <input
                        type="file"
                        accept="image/gif"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, "gif")}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Gallery Videos (Sửa biến gallryItems -> galleryItems) */}
          <div className="p-5 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <h4 className="flex items-center gap-2 font-semibold text-gray-800">
                <Video className="w-4 h-4 text-orange-500" /> Video Phụ (Góc
                quay)
              </h4>
              <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 p-1.5 rounded-md text-gray-600">
                <Plus className="w-4 h-4" />
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, "gallery_videos")}
                />
              </label>
            </div>

            <div className="space-y-4">
              {galleryItems.length === 0 && (
                <p className="py-4 text-xs text-center text-gray-400">
                  Chưa có video phụ
                </p>
              )}

              {galleryItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 border rounded-lg bg-gray-50"
                >
                  <video
                    src={item.preview}
                    className="flex-shrink-0 object-cover w-24 h-16 bg-black rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">
                      Tên hiển thị
                    </label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) =>
                        handleGalleryTitleChange(idx, e.target.value)
                      }
                      className="w-full px-2 py-1 text-sm bg-white border rounded outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Nhập tên video..."
                    />
                    <p className="text-[10px] text-gray-400 mt-1 truncate">
                      {item.file.name}
                    </p>
                  </div>
                  <button
                    onClick={() => removeGalleryItem(idx)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
