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
  Share2,
  Play,
  ChevronRight,
  Home,
  ExternalLink,
  Youtube,
  Info,
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
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
        tones[tone] || tones.gray
      }`}
    >
      {children}
    </span>
  );
}

function SectionTitle({ children }) {
  return (
    <h3 className="flex items-center pb-2 mb-3 text-sm font-bold text-gray-900 uppercase border-b border-gray-200">
      <span className="w-1 h-4 mr-2 bg-blue-600 rounded-full"></span>
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

  // --- 1. Fetch Detail ---
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

  // --- 2. Memo Data ---
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

      // Video logic
      cloud_video: e.video_url,
      gallery_videos: e.gallery_videos || [], // Mảng các video phụ
      ref_video: e.primary_video_url,

      primaryMuscles: e.primaryMuscles || [],
      secondaryMuscles: e.secondaryMuscles || [],
      instructions: e.instructions || [],
    };
  }, [exerciseRaw]);

  // --- 3. Prepare Video Playlist ---
  // Gom video chính và gallery thành 1 danh sách để dễ chọn
  const videoPlaylist = useMemo(() => {
    if (!exercise) return [];
    const list = [];

    // Video chính (ưu tiên 1)
    if (exercise.cloud_video) {
      list.push({
        url: exercise.cloud_video,
        title: "Góc quay chính",
        isMain: true,
      });
    }

    // Video phụ
    if (exercise.gallery_videos.length) {
      exercise.gallery_videos.forEach((v, idx) => {
        if (v.url !== exercise.cloud_video) {
          list.push({
            url: v.url,
            title: v.title || `Góc tập #${idx + 1}`,
            isMain: false,
          });
        }
      });
    }
    return list;
  }, [exercise]);

  // --- 4. Init Video ---
  useEffect(() => {
    if (videoPlaylist.length > 0) {
      setCurrentVideo(videoPlaylist[0]);
    } else {
      setCurrentVideo(null);
    }
  }, [videoPlaylist]);

  // --- 5. Fetch Extra Data ---
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
        params: { limit: 8 },
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
      alert(e?.response?.data?.message || "Lỗi xử lý yêu thích");
    }
  };

  if (loading)
    return (
      <div className="py-20 text-sm text-center text-gray-500">
        Đang tải dữ liệu...
      </div>
    );
  if (error || !exercise)
    return (
      <div className="py-20 text-sm text-center text-red-500">
        {error || "Không tìm thấy bài tập"}
      </div>
    );

  return (
    <div className="min-h-screen pb-10 bg-gray-50">
      {/* --- Breadcrumb (Compact) --- */}
      <div className="sticky top-0 z-20 text-xs bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center text-gray-500">
          <button
            onClick={() => navigate("/")}
            className="flex items-center hover:text-blue-600"
          >
            <Home className="w-3.5 h-3.5 mr-1" /> Home
          </button>
          <ChevronRight className="w-3.5 h-3.5 mx-1" />
          <button
            onClick={() => navigate("/exercises")}
            className="hover:text-blue-600"
          >
            Exercises
          </button>
          <ChevronRight className="w-3.5 h-3.5 mx-1" />
          <span className="font-medium text-gray-900 truncate max-w-[200px]">
            {exercise.name}
          </span>
        </div>
      </div>

      <div className="px-4 py-4 mx-auto space-y-4 max-w-7xl">
        {/* === TOP AREA: VIDEO (LEFT) - GIF/INFO (RIGHT) === */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* --- LEFT: VIDEO PLAYER (7/12) --- */}
          <div className="flex flex-col gap-2 lg:col-span-7">
            <div className="relative w-full overflow-hidden bg-black border border-gray-300 rounded-lg shadow-md aspect-video">
              {currentVideo ? (
                <video
                  key={currentVideo.url} // Force reload when url changes
                  src={currentVideo.url}
                  className="object-contain w-full h-full"
                  controls
                  autoPlay
                  muted // Muted by default for UX
                  loop
                  playsInline
                  poster={exercise.thumb}
                />
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full text-gray-500 bg-gray-100">
                  <Play className="w-10 h-10 mb-2 opacity-50" />
                  <span className="text-xs">Chưa có video hướng dẫn</span>
                </div>
              )}
            </div>

            {/* Video Selector List */}
            {videoPlaylist.length > 0 && (
              <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                <p className="text-[11px] font-bold text-gray-400 uppercase mb-2">
                  Chọn góc quay / Biến thể:
                </p>
                <div className="flex flex-wrap gap-2">
                  {videoPlaylist.map((vid, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentVideo(vid)}
                      className={`flex items-center px-3 py-2 rounded text-xs font-medium transition-all border 
                        ${
                          currentVideo?.url === vid.url
                            ? "bg-blue-600 text-white border-blue-600 shadow-md"
                            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                        }`}
                    >
                      <Play
                        className={`w-3 h-3 mr-1.5 ${
                          currentVideo?.url === vid.url ? "fill-current" : ""
                        }`}
                      />
                      {vid.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* --- RIGHT: GIF & INFO (5/12) --- */}
          <div className="flex flex-col gap-3 lg:col-span-5">
            {/* 1. GIF Card (Always Visible) */}
            <div className="flex flex-col overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="relative aspect-[4/3] bg-gray-100 border-b border-gray-100">
                {exercise.gif ? (
                  <img
                    src={exercise.gif}
                    alt="Animation"
                    className="object-contain w-full h-full mix-blend-multiply"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-gray-400">
                    No GIF
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm">
                  DEMO GIF
                </div>
              </div>

              {/* Header Info */}
              <div className="p-4">
                <h1 className="mb-1 text-xl font-bold leading-tight text-gray-900">
                  {exercise.name}
                </h1>
                {exercise.name_en && (
                  <p className="mb-3 text-sm italic text-gray-500">
                    {exercise.name_en}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 mb-4">
                  {exercise.difficulty && (
                    <Badge tone="amber">{exercise.difficulty}</Badge>
                  )}
                  {exercise.type && (
                    <Badge tone="purple">{exercise.type}</Badge>
                  )}
                  <Badge tone="blue">
                    {exercise.equipment || "Bodyweight"}
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleAddToPlan}
                    className="flex-1 py-2 text-sm font-semibold text-white transition bg-blue-600 rounded-md shadow-sm hover:bg-blue-700"
                  >
                    + Thêm vào Plan
                  </button>
                  <button
                    onClick={handleToggleFavorite}
                    className={`px-3 py-2 border rounded-md transition hover:bg-gray-50 flex items-center ${
                      favorited
                        ? "text-red-500 border-red-200 bg-red-50"
                        : "text-gray-600 border-gray-200"
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${favorited ? "fill-current" : ""}`}
                    />
                    {favoriteCount > 0 && (
                      <span className="ml-1.5 text-xs font-medium">
                        {favoriteCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Recommendation (Compact) */}
            <div className="flex items-center justify-between p-3 text-xs border border-blue-100 rounded-lg bg-blue-50/50">
              <div className="flex-1 text-center border-r border-blue-200 last:border-0">
                <span className="block text-gray-500 mb-0.5">Sets</span>
                <span className="font-bold text-blue-800">3 - 4</span>
              </div>
              <div className="flex-1 text-center border-r border-blue-200 last:border-0">
                <span className="block text-gray-500 mb-0.5">Reps</span>
                <span className="font-bold text-blue-800">8 - 12</span>
              </div>
              <div className="flex-1 text-center">
                <span className="block text-gray-500 mb-0.5">Rest</span>
                <span className="font-bold text-blue-800">60s</span>
              </div>
            </div>

            {/* 3. Reference Link */}
            {exercise.ref_video && (
              <a
                href={exercise.ref_video}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 transition bg-white border border-gray-200 rounded-lg hover:border-blue-300 group"
              >
                <div className="flex items-center text-xs text-gray-600">
                  <Youtube className="w-4 h-4 mr-2 text-red-600" />
                  Xem video gốc trên Youtube
                </div>
                <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-blue-600" />
              </a>
            )}
          </div>
        </div>

        {/* === BOTTOM AREA: DETAILS (Dense Layout) === */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Col 1: Muscle & Description */}
          <div className="space-y-4">
            {/* Muscles */}
            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <SectionTitle>Cơ bắp tác động</SectionTitle>
              <div className="space-y-4">
                {/* Primary */}
                <div>
                  <div className="flex items-center mb-2 text-xs font-bold text-blue-800">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-1.5"></div>{" "}
                    CHÍNH
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!musclesLoading && muscles?.primary?.items?.length ? (
                      muscles.primary.items.map((m) => (
                        <div
                          key={m.id}
                          className="flex items-center px-2 py-1 text-xs text-blue-700 border border-blue-100 rounded bg-blue-50"
                        >
                          {m.name}{" "}
                          <span className="ml-1.5 opacity-60 text-[10px]">
                            ({m.percent}%)
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">
                        Đang cập nhật...
                      </span>
                    )}
                  </div>
                </div>

                {/* Secondary */}
                <div>
                  <div className="flex items-center mb-2 text-xs font-bold text-green-800">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-600 mr-1.5"></div>{" "}
                    PHỤ
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!musclesLoading && muscles?.secondary?.items?.length ? (
                      muscles.secondary.items.map((m) => (
                        <div
                          key={m.id}
                          className="flex items-center px-2 py-1 text-xs text-green-700 border border-green-100 rounded bg-green-50"
                        >
                          {m.name}{" "}
                          <span className="ml-1.5 opacity-60 text-[10px]">
                            ({m.percent}%)
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <SectionTitle>Mô tả</SectionTitle>
              <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">
                {exercise.description || "Chưa có mô tả chi tiết."}
              </p>
            </div>
          </div>

          {/* Col 2: Instructions */}
          <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm h-fit">
            <SectionTitle>Hướng dẫn thực hiện</SectionTitle>
            <div className="space-y-0">
              {exercise.instructions && exercise.instructions.length > 0 ? (
                exercise.instructions.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex gap-3 px-2 py-3 -mx-2 transition border-b border-gray-100 rounded last:border-0 hover:bg-gray-50/50"
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center mt-0.5 shadow-sm">
                      {step.step_number || idx + 1}
                    </div>
                    <div className="text-sm leading-relaxed text-gray-700">
                      {step.instruction_text ||
                        step.text ||
                        JSON.stringify(step)}
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-4 text-xs italic text-gray-400">
                  Chưa có hướng dẫn chi tiết.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* === RELATED (Bottom) === */}
        {related.length > 0 && (
          <div className="pt-6 border-t border-gray-200">
            <h3 className="mb-3 text-sm font-bold text-gray-900 uppercase">
              Bài tập liên quan
            </h3>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
              {related.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() =>
                    navigate(`/exercises/${encodeURIComponent(ex.id)}`, {
                      state: ex,
                    })
                  }
                  className="overflow-hidden transition bg-white border border-gray-200 rounded-lg cursor-pointer group hover:shadow-md hover:border-blue-300"
                >
                  <div className="relative overflow-hidden bg-gray-100 aspect-square">
                    {ex.imageUrl ? (
                      <img
                        src={ex.imageUrl}
                        alt={ex.name}
                        className="object-cover w-full h-full transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-300">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <h5 className="text-xs font-medium leading-snug text-gray-900 line-clamp-2 group-hover:text-blue-600">
                      {ex.name}
                    </h5>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
