import React, { useState, useEffect } from "react"; // Nhớ import useEffect
import { useFetcher, useNavigate, useParams } from "react-router-dom";
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
  Link as LinkIcon,
} from "lucide-react";

// --- Constants ---
const DIFFICULTIES = ["beginner", "intermediate", "advanced"];
const TYPES = ["compound", "isolation", "cardio", "stretching", "plyometrics"];

export default function AdminExerciseRight() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

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
    source_name: "",
    source_url: "",
  });

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

  const [galleryItems, setGalleryItems] = useState([]);
  const [instructions, setInstructions] = useState([
    { step_number: 1, instruction_text: "" },
  ]);
  const [selectedMuscles, setSelectedMuscles] = useState([]);
  const [muscleInput, setMuscleInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [muscleList, setMuscleList] = useState([]);

  useEffect(() => {
    const fetchMuscles = async () => {
      try {
        const res = await axios.get("/api/muscles");
        if (res.data.success) {
          setMuscleList(res.data.data); // data format: [{id: 1, name: "Ngực..."}, ...]
        }
      } catch (err) {
        console.error("Không tải được danh sách nhóm cơ");
      }
    };
    fetchMuscles();
  }, []);

  useEffect(() => {
    if (!isEditMode) return;

    const fetchExercise = async () => {
      try {
        setLoading(true);
        // Gọi API detail mà bạn đã update ở backend
        const res = await axios.get(`/api/exercises/detail/${id}`);
        console.log("🔥 Dữ liệu từ API detail:", res.data.data);
        if (res.data.success) {
          const data = res.data.data;

          console.log("Frontend received muscles:", data.muscles);
          // Map dữ liệu từ API vào State Form
          setFormData({
            name: data.name || "",
            name_en: data.name_en || "",
            slug: data.slug || "",
            description: data.description || "",
            difficulty_level: data.difficulty_level || "beginner",
            exercise_type: data.exercise_type || "compound",
            equipment_needed: data.equipment_needed || "",
            popularity_score: data.popularity_score || 0,
            primary_video_url: data.primary_video_url || "",
            source_name: data.source_name || "", // Load nguồn cũ
            source_url: data.source_url || "", // Load link cũ
          });

          // Map Files Preview (Nếu có ảnh/video cũ trên server)
          setPreviews({
            thumbnail: data.thumbnail_url || null,
            gif: data.gif_demo_url || null,
            video: data.video_url || null,
          });

          if (data.instructions && Array.isArray(data.instructions)) {
            setInstructions(data.instructions);
          }

          if (data.muscles && Array.isArray(data.muscles)) {
            setSelectedMuscles(data.muscles);
          } else {
            setSelectedMuscles([]);
          }

          const apiGallery = data.galleryVideos || [];

          if (Array.isArray(apiGallery) && apiGallery.length > 0) {
            const mappedGallery = apiGallery.map((vid) => ({
              id: vid.id,
              preview: vid.url,
              title: vid.title,
              file: null,
            }));
            setGalleryItems(mappedGallery);
          }
        }
      } catch (error) {
        console.error("Lỗi tải bài tập:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExercise();
  }, [id, isEditMode]);

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
      setGalleryItems((prev) => [
        ...prev,
        {
          file: file,
          preview: URL.createObjectURL(file),
          title: "Góc quay khác",
        },
      ]);
    } else {
      setFiles((prev) => ({ ...prev, [field]: file }));
      setPreviews((prev) => ({ ...prev, [field]: URL.createObjectURL(file) }));
    }
    e.target.value = null;
  };

  const removeGalleryItem = (index) =>
    setGalleryItems((prev) => prev.filter((_, i) => i !== index));

  const handleGalleryTitleChange = (index, newTitle) => {
    const newItems = [...galleryItems];
    newItems[index].title = newTitle;
    setGalleryItems(newItems);
  };

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

    const mName = muscleList.find((m) => m.id === mId)?.name;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();

      Object.keys(formData).forEach((key) => data.append(key, formData[key]));

      data.append("instructions", JSON.stringify(instructions));

      console.log("Muscles chuẩn bị gửi:", selectedMuscles);
      data.append("muscles", JSON.stringify(selectedMuscles));

      if (files.thumbnail) data.append("thumbnail", files.thumbnail);
      if (files.gif) data.append("gif", files.gif);
      if (files.video) data.append("video", files.video);

      const itemsToKeep = galleryItems
        .filter((item) => item.id && !item.file) // Lọc item đã có trên database
        .map((item) => ({ id: item.id, title: item.title }));

      data.append("gallery_items_keep", JSON.stringify(itemsToKeep));

      galleryItems.forEach((item) => {
        if (item.file) {
          data.append("gallery_videos", item.file); // Key này khớp với multer ở backend
          data.append("gallery_titles_new", item.title || "Video phụ");
        }
      });

      const url = isEditMode ? `/api/exercises/${id}` : "/api/exercises";
      const token = getToken();

      const method = isEditMode ? "put" : "post";

      const res = await axios({
        method: method,
        url: url,
        data: data,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        alert(isEditMode ? "Cập nhật thành công!" : "Thêm mới thành công!");
        navigate("/admin/content/exercises");
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1600px] pb-10 mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white border rounded-full hover:bg-gray-50"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            {isEditMode ? "Chỉnh sửa bài tập" : "Thêm bài tập mới"}
          </h1>
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm"
        >
          {loading ? (
            "Đang lưu..."
          ) : (
            <>
              <Save className="w-4 h-4" /> Lưu lại
            </>
          )}
        </button>
      </div>

      <form className="grid grid-cols-1 gap-8 xl:grid-cols-5">
        {/* Left Column */}
        <div className="space-y-6 xl:col-span-3">
          {/* INFO CARD */}
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
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-4 py-2 border rounded-lg"
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
                  className="w-full px-4 py-2 font-mono text-sm border rounded-lg bg-gray-50"
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
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* [NEW] CREDITS SECTION */}
              <div className="pt-4 mt-2 border-t border-gray-100 md:col-span-2">
                <h4 className="flex items-center gap-2 mb-3 text-sm font-bold text-gray-700">
                  <LinkIcon className="w-4 h-4 text-gray-500" /> Nguồn & Tham
                  khảo
                </h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block mb-1 text-xs text-gray-500">
                      Tên nguồn (Credits)
                    </label>
                    <input
                      name="source_name"
                      value={formData.source_name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border rounded-lg"
                      placeholder="VD: GymShark, MuscleWiki..."
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-xs text-gray-500">
                      Link bài viết gốc
                    </label>
                    <input
                      name="source_url"
                      value={formData.source_url}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border rounded-lg"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2 md:col-span-2">
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
              </div>
              <div className="grid grid-cols-2 gap-4 md:col-span-2">
                <input
                  name="equipment_needed"
                  value={formData.equipment_needed}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Dụng cụ cần thiết"
                />
                <input
                  type="number"
                  name="popularity_score"
                  value={formData.popularity_score}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Độ phổ biến (0-100)"
                />
              </div>
            </div>
          </div>

          {/* INSTRUCTIONS CARD */}
          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <Layers className="w-5 h-5 text-purple-500" /> Các bước thực
                hiện
              </h3>
              <button
                type="button"
                onClick={addStep}
                className="flex items-center text-sm text-blue-600 hover:underline"
              >
                <Plus className="w-4 h-4 mr-1" /> Thêm bước
              </button>
            </div>
            <div className="space-y-4">
              {instructions.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className="flex items-center justify-center flex-shrink-0 w-8 h-8 mt-1 text-sm font-bold text-gray-500 bg-gray-100 border rounded-lg">
                    {idx + 1}
                  </span>
                  <textarea
                    value={step.instruction_text}
                    onChange={(e) => handleStepChange(idx, e.target.value)}
                    rows={3}
                    className="flex-1 px-4 py-3 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] leading-relaxed"
                    placeholder={`Mô tả chi tiết bước ${idx + 1}...`}
                  />
                  <button
                    type="button"
                    onClick={() => removeStep(idx)}
                    className="p-2 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* MUSCLES CARD (Giữ nguyên) */}
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
                {muscleList.map((m) => (
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
                type="button"
                onClick={addMuscle}
                disabled={!muscleInput}
                className="px-4 py-2 text-sm font-medium bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Thêm
              </button>
            </div>
            <div className="space-y-2">
              {selectedMuscles.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                >
                  <span className="font-medium text-gray-700">{m.name}</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleImpact(m.id)}
                      className={`text-xs px-2 py-1 rounded border capitalize w-24 text-center ${
                        m.impact === "primary"
                          ? "bg-blue-100 text-blue-700 border-blue-200 font-bold"
                          : "bg-green-100 text-green-700 border-green-200"
                      }`}
                    >
                      {m.impact}
                    </button>
                    <button
                      type="button"
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

        {/* Right Column: Media */}
        <div className="space-y-6 xl:col-span-2">
          {/* Main Video */}
          <div className="p-5 bg-white border border-gray-200 shadow-sm rounded-xl">
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
                    Tải lên Video (Cloud)
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
            <div className="mt-4">
              <label className="block mb-1 text-xs font-medium text-gray-500">
                Link Youtube (Ref)
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

          {/* Images */}
          <div className="p-5 bg-white border border-gray-200 shadow-sm rounded-xl">
            <h4 className="flex items-center gap-2 mb-3 font-semibold text-gray-800">
              <ImageIcon className="w-4 h-4 text-green-600" /> Ảnh Bìa & GIF
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="mb-2 text-xs text-gray-500">Thumbnail</p>
                <div className="relative flex items-center justify-center h-32 overflow-hidden border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50">
                  {previews.thumbnail ? (
                    <>
                      <img
                        src={previews.thumbnail}
                        alt=""
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
              <div className="text-center">
                <p className="mb-2 text-xs text-gray-500">GIF</p>
                <div className="relative flex items-center justify-center h-32 overflow-hidden border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50">
                  {previews.gif ? (
                    <>
                      <img
                        src={previews.gif}
                        alt=""
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

          {/* Gallery Videos */}
          <div className="p-5 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <h4 className="flex items-center gap-2 font-semibold text-gray-800">
                <Video className="w-4 h-4 text-orange-500" /> Video Phụ (Góc
                quay)
              </h4>
              <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md text-sm text-gray-700 font-medium flex items-center transition">
                <Plus className="w-4 h-4 mr-1" /> Thêm video
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
                <div className="py-8 text-center border border-gray-300 border-dashed rounded-lg bg-gray-50">
                  <p className="text-sm text-gray-500">
                    Chưa có video phụ nào.
                  </p>
                </div>
              )}

              {galleryItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 transition border rounded-lg bg-gray-50 hover:border-blue-300"
                >
                  {/* Layout Dọc: Video to ở trên */}
                  <div className="relative mb-3 group">
                    <video
                      src={item.preview}
                      className="object-cover w-full bg-black border border-gray-200 rounded-lg aspect-video"
                      controls
                    />
                    {/* Nút xóa nằm góc trên video */}
                    <button
                      type="button"
                      onClick={() => removeGalleryItem(idx)}
                      className="absolute p-1.5 text-white bg-red-600 rounded-full shadow-md top-2 right-2 hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Xóa video này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Input ở dưới: Rộng rãi hơn */}
                  <div>
                    <label className="block mb-1 text-xs font-bold text-gray-500 uppercase">
                      Tiêu đề hiển thị <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) =>
                        handleGalleryTitleChange(idx, e.target.value)
                      }
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="VD: Góc nhìn ngang, Lỗi sai..."
                    />
                    <p className="mt-1 text-[10px] text-gray-400 truncate">
                      File:{" "}
                      {item.file ? item.file.name : "Video đã có trên server"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
