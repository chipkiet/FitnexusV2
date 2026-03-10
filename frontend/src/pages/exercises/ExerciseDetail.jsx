import React, { useEffect, useMemo, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  favoriteExercise,
  unfavoriteExercise,
  getExerciseFavoriteStatus,
} from "../../lib/api.js";
import {
  Heart,
  Play,
  ChevronRight,
  ExternalLink,
  Youtube,
  ListPlus,
  Activity,
  Dumbbell,
  Link as LinkIcon,
  Copyright,
} from "lucide-react";
import { useAuth } from "../../context/auth.context.jsx";

// --- Components nhỏ (Compact version) ---
function Badge({ children, tone = "gray" }) {
  const tones = {
    gray: "bg-gray-100 text-gray-700 border-gray-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    red: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
        tones[tone] || tones.gray
      }`}
    >
      {children}
    </span>
  );
}

function SectionTitle({ icon: Icon, children }) {
  return (
    <h3 className="flex items-center pb-2 mb-2 text-xs font-bold text-gray-800 uppercase border-b border-gray-200">
      {Icon && <Icon className="w-3.5 h-3.5 mr-1.5 text-blue-600" />}
      {children}
    </h3>
  );
}

export default function ExerciseDetail() {
  const { id: idOrSlug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // --- State ---
  const [exerciseRaw, setExerciseRaw] = useState(location.state || null);
  const [related, setRelated] = useState([]);
  const [muscles, setMuscles] = useState(null);
  const [musclesLoading, setMusclesLoading] = useState(false);
  const [loading, setLoading] = useState(!location.state);
  const [error, setError] = useState(null);

  // Video Player State
  const [currentVideo, setCurrentVideo] = useState(null);
  const [favorited, setFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);

  // Scroll top
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, behavior: "auto" });
    } catch {}
  }, [idOrSlug]);

  // --- Fetch Detail ---
  useEffect(() => {
    let alive = true;
    async function fetchDetail() {
      if (
        !exerciseRaw ||
        (String(exerciseRaw.slug) !== idOrSlug &&
          String(exerciseRaw.exercise_id) !== idOrSlug)
      ) {
        setLoading(true);
      }
      setError(null);
      try {
        const res = await axios.get(
          `/api/exercises/detail/${idOrSlug}?t=${Date.now()}`
        );
        if (alive && res.data?.success) {
          setExerciseRaw(res.data.data);
          setError(null);
        } else {
          setError("Không tìm thấy bài tập");
        }
      } catch (err) {
        if (alive) {
          console.error(err);
          setError("Lỗi tải dữ liệu bài tập");
        }
      } finally {
        if (alive) setLoading(false);
      }
    }
    fetchDetail();
    return () => {
      alive = false;
    };
  }, [idOrSlug]);

  // --- Memo Data ---
  const exercise = useMemo(() => {
    if (!exerciseRaw) return null;
    const e = exerciseRaw;
    return {
      exercise_id: e.exercise_id ?? e.id,
      name: e.name,
      name_en: e.name_en,
      slug: e.slug,
      description: e.description,
      difficulty: e.difficulty_level ?? e.difficulty,
      equipment: e.equipment_needed ?? e.equipment,
      type: e.exercise_type ?? e.type,
      thumb: e.thumbnail_url ?? e.imageUrl,
      gif: e.gif_demo_url ?? e.gifUrl,
      cloud_video: e.video_url,
      gallery_videos: e.gallery_videos || [],

      // Map đúng trường dữ liệu từ backend
      ref_video: e.primary_video_url, // Link Youtube
      source_name: e.source_name, // [NEW] Tên nguồn
      source_url: e.source_url, // [NEW] Link nguồn

      primaryMuscles: e.primaryMuscles || [],
      secondaryMuscles: e.secondaryMuscles || [],
      instructions: e.instructions || [],
    };
  }, [exerciseRaw]);

  // --- Video Playlist ---
  const videoPlaylist = useMemo(() => {
    if (!exercise) return [];
    const list = [];
    if (exercise.cloud_video) {
      list.push({
        url: exercise.cloud_video,
        title: "Video chính",
        isMain: true,
      });
    }
    if (exercise.gallery_videos.length) {
      exercise.gallery_videos.forEach((v, idx) => {
        if (v.url !== exercise.cloud_video) {
          list.push({
            url: v.url,
            title: v.title || `Biến thể ${idx + 1}`,
            isMain: false,
          });
        }
      });
    }
    return list;
  }, [exercise]);

  // --- Init Video ---
  useEffect(() => {
    if (videoPlaylist.length > 0) setCurrentVideo(videoPlaylist[0]);
    else setCurrentVideo(null);
  }, [videoPlaylist]);

  // --- Fetch Extra Data ---
  useEffect(() => {
    if (!exercise?.exercise_id) return;
    let alive = true;

    getExerciseFavoriteStatus(exercise.exercise_id)
      .then((res) => {
        if (alive && res.data) {
          setFavorited(!!res.data.favorited);
          setFavoriteCount(Number(res.data.favorite_count || 0));
        }
      })
      .catch(() => {});

    axios
      .get(`/api/exercises/id/${exercise.exercise_id}/related`, {
        params: { limit: 6 },
      })
      .then((res) => {
        if (alive && res.data?.success) setRelated(res.data.data || []);
      })
      .catch(() => {});

    (async () => {
      try {
        setMusclesLoading(true);
        const res = await axios.get(
          `/api/exercises/id/${exercise.exercise_id}/muscles`
        );
        if (alive && res?.data?.success) setMuscles(res.data.data || null);
      } catch {
      } finally {
        if (alive) setMusclesLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [exercise?.exercise_id]);

  // Handlers
  const handleAddToPlan = () => {
    if (!exercise?.exercise_id) return;
    const picker = `/plans/select?exerciseId=${encodeURIComponent(
      exercise.exercise_id
    )}`;
    if (user) navigate(picker);
    else navigate("/login", { state: { from: picker } });
  };

  const handleToggleFavorite = async () => {
    if (!user)
      return navigate("/login", {
        state: { from: `/exercises/${exercise.slug}` },
      });
    try {
      if (!favorited) {
        const r = await favoriteExercise(exercise.exercise_id);
        setFavorited(true);
        setFavoriteCount(Number(r.data.favorite_count || favoriteCount + 1));
      } else {
        const r = await unfavoriteExercise(exercise.exercise_id);
        setFavorited(false);
        setFavoriteCount(
          Number(r.data.favorite_count || Math.max(0, favoriteCount - 1))
        );
      }
    } catch (e) {
      alert(e?.response?.data?.message || "Lỗi xử lý");
    }
  };

  if (loading)
    return (
      <div className="py-20 text-xs text-center text-gray-500">Đang tải...</div>
    );
  if (error || !exercise)
    return (
      <div className="py-20 text-xs text-center text-red-500">{error}</div>
    );

  return (
    <div className="min-h-screen pb-10 bg-gray-50/50">
      {/* 1. COMPACT HEADER */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3 mx-auto max-w-7xl">
          <div className="flex items-center text-[11px] text-gray-400 mb-2">
            <button
              onClick={() => navigate("/exercises")}
              className="transition hover:text-blue-600"
            >
              Exercises
            </button>
            <ChevronRight className="w-3 h-3 mx-1" />
            <span className="font-medium text-gray-600 truncate">
              {exercise.name}
            </span>
          </div>

          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h1 className="text-xl font-bold leading-none text-gray-900 md:text-2xl">
                {exercise.name}
              </h1>
              <div className="flex items-center gap-2 mt-1.5">
                {exercise.name_en && (
                  <span className="mr-2 text-xs italic text-gray-500">
                    {exercise.name_en}
                  </span>
                )}
                <Badge tone="blue">{exercise.equipment || "Basic"}</Badge>
                {exercise.difficulty && (
                  <Badge tone="amber">{exercise.difficulty}</Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleFavorite}
                className={`flex items-center justify-center px-3 py-2 text-xs font-semibold border rounded-md transition-colors ${
                  favorited
                    ? "border-red-200 bg-red-50 text-red-600"
                    : "border-gray-200 text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Heart
                  className={`w-4 h-4 mr-1.5 ${
                    favorited ? "fill-current" : ""
                  }`}
                />
                {favoriteCount > 0 ? favoriteCount : "Lưu"}
              </button>

              <button
                onClick={handleAddToPlan}
                className="flex items-center justify-center px-4 py-2 text-xs font-bold text-white uppercase transition-all bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 active:scale-95"
              >
                <ListPlus className="w-4 h-4 mr-1.5" />
                Thêm vào Plan
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-5 mx-auto max-w-7xl">
        <div className="grid items-start grid-cols-1 gap-5 lg:grid-cols-12">
          {/* --- LEFT COLUMN: VIDEO (HERO) --- */}
          <div className="flex flex-col gap-4 lg:col-span-8">
            <div className="relative overflow-hidden bg-black border border-gray-900 shadow-lg rounded-xl aspect-video group">
              {currentVideo ? (
                <video
                  key={currentVideo.url}
                  src={currentVideo.url}
                  className="object-contain w-full h-full"
                  controls
                  autoPlay
                  muted
                  loop
                  playsInline
                  poster={exercise.thumb}
                />
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full text-gray-500">
                  <Play className="w-12 h-12 mb-2 opacity-50" />
                  <span className="text-xs">Chưa có video</span>
                </div>
              )}
            </div>

            {videoPlaylist.length > 1 && (
              <div className="flex items-center gap-2 pb-2 overflow-x-auto scrollbar-hide">
                {videoPlaylist.map((vid, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentVideo(vid)}
                    className={`flex-shrink-0 flex items-center px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                      currentVideo?.url === vid.url
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <Play className="w-3 h-3 mr-1.5" />
                    {vid.title}
                  </button>
                ))}
              </div>
            )}

            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <SectionTitle icon={ListPlus}>Hướng dẫn thực hiện</SectionTitle>
              <div className="mt-3 space-y-3">
                {exercise.instructions?.length > 0 ? (
                  exercise.instructions.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-sm leading-snug text-gray-700">
                        {step.instruction_text || step.text}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm italic text-gray-400">
                    Chưa có hướng dẫn.
                  </p>
                )}
              </div>
            </div>

            {/* Related Exercises */}
            {related.length > 0 && (
              <div className="mt-2">
                <h3 className="mb-2 text-xs font-bold text-gray-500 uppercase">
                  Có thể bạn quan tâm
                </h3>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {related.slice(0, 4).map((ex) => (
                    <div
                      key={ex.id}
                      onClick={() =>
                        navigate(`/exercises/${ex.id}`, { state: ex })
                      }
                      className="p-2 transition bg-white border border-gray-200 rounded-lg cursor-pointer group hover:border-blue-400"
                    >
                      <div className="mb-2 overflow-hidden bg-gray-100 rounded-md aspect-square">
                        <img
                          src={ex.imageUrl}
                          alt=""
                          className="object-cover w-full h-full transition group-hover:scale-105"
                        />
                      </div>
                      <div className="text-[11px] font-semibold text-gray-700 line-clamp-1 group-hover:text-blue-600">
                        {ex.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* --- RIGHT COLUMN: SIDEBAR (INFO) --- */}
          <div className="flex flex-col gap-4 lg:col-span-4">
            {/* 1. GIF PREVIEW (Đã xóa link Reference Youtube ở đây) */}
            <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Mô phỏng (GIF)
                </span>
              </div>
              <div className="aspect-[4/3] bg-gray-100 rounded border border-gray-100 overflow-hidden relative">
                {exercise.gif ? (
                  <img
                    src={exercise.gif}
                    alt="Demo"
                    className="object-contain w-full h-full mix-blend-multiply"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-xs text-gray-400">
                    No GIF
                  </div>
                )}
              </div>
            </div>

            {/* 2. QUICK STATS */}
            <div className="grid grid-cols-3 gap-2 p-3 text-center border border-blue-100 rounded-lg bg-blue-50/50">
              <div>
                <span className="block text-[10px] text-gray-500 uppercase">
                  Sets
                </span>
                <span className="block text-sm font-bold text-blue-800">
                  3-4
                </span>
              </div>
              <div className="border-l border-blue-200">
                <span className="block text-[10px] text-gray-500 uppercase">
                  Reps
                </span>
                <span className="block text-sm font-bold text-blue-800">
                  8-12
                </span>
              </div>
              <div className="border-l border-blue-200">
                <span className="block text-[10px] text-gray-500 uppercase">
                  Rest
                </span>
                <span className="block text-sm font-bold text-blue-800">
                  60s
                </span>
              </div>
            </div>

            {/* 3. MUSCLES */}
            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <SectionTitle icon={Dumbbell}>Cơ bắp tác động</SectionTitle>
              <div className="space-y-3">
                {/* Chính */}
                <div>
                  <span className="text-[10px] font-bold text-blue-600 mb-1.5 block">
                    NHÓM CƠ CHÍNH
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {!musclesLoading && muscles?.primary?.items?.length ? (
                      muscles.primary.items.map((m) => (
                        <span
                          key={m.id}
                          className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-medium rounded"
                        >
                          {m.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-gray-400">
                        Đang cập nhật...
                      </span>
                    )}
                  </div>
                </div>
                {/* Phụ */}
                {muscles?.secondary?.items?.length > 0 && (
                  <div className="pt-2 border-t border-gray-100">
                    <span className="text-[10px] font-bold text-gray-500 mb-1.5 block">
                      NHÓM CƠ PHỤ
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {muscles.secondary.items.map((m) => (
                        <span
                          key={m.id}
                          className="px-2 py-1 bg-gray-50 text-gray-600 border border-gray-200 text-[10px] rounded"
                        >
                          {m.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 4. DESCRIPTION */}
            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <SectionTitle icon={Activity}>Giới thiệu</SectionTitle>
              <p className="text-xs leading-relaxed text-justify text-gray-600">
                {exercise.description ||
                  "Bài tập này giúp phát triển sức mạnh và độ bền cơ bắp hiệu quả."}
              </p>
            </div>

            {/* 5. [NEW] REFERENCE & CREDITS SECTION */}
            {/* Đây là phần bạn đang thiếu, hiển thị link youtube và text nguồn */}
            {(exercise.ref_video ||
              exercise.source_name ||
              exercise.source_url) && (
              <div className="p-3 bg-gray-100 border border-gray-200 rounded-lg shadow-inner">
                <SectionTitle icon={LinkIcon}>Nguồn tham khảo</SectionTitle>

                <div className="mt-2 space-y-2">
                  {/* Link Youtube */}
                  {exercise.ref_video && (
                    <a
                      href={exercise.ref_video}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-2 transition bg-white border border-gray-200 rounded hover:border-red-300 hover:text-red-600 group"
                    >
                      <Youtube className="w-4 h-4 mr-2 text-red-500 transition group-hover:scale-110" />
                      <span className="text-xs font-medium text-gray-700 group-hover:text-red-600">
                        Xem video gốc trên Youtube
                      </span>
                      <ExternalLink className="w-3 h-3 ml-auto text-gray-400" />
                    </a>
                  )}

                  {/* Text Credits / Source Link */}
                  {(exercise.source_name || exercise.source_url) && (
                    <div className="flex items-start pt-2 mt-2 text-xs text-gray-500 border-t border-gray-200">
                      <Copyright className="w-3.5 h-3.5 mr-1.5 mt-0.5 flex-shrink-0" />
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-600">
                          Credit nội dung:
                        </span>
                        {exercise.source_url ? (
                          <a
                            href={exercise.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="italic text-blue-600 truncate hover:underline max-w-[200px]"
                          >
                            {exercise.source_name || exercise.source_url}
                          </a>
                        ) : (
                          <span className="italic">{exercise.source_name}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
