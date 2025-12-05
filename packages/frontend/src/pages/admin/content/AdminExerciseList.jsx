import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  FileVideo,
} from "lucide-react";

// Component Badge nhỏ cho đẹp
function Badge({ children, color = "blue" }) {
  const colors = {
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
    red: "bg-red-100 text-red-800",
    yellow: "bg-yellow-100 text-yellow-800",
    gray: "bg-gray-100 text-gray-800",
  };
  return (
    <span
      className={`px-2 py-1 rounded text-xs font-semibold ${
        colors[color] || colors.gray
      }`}
    >
      {children}
    </span>
  );
}

export default function AdminExerciseList() {
  const navigate = useNavigate();

  // State
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch Data
  const fetchExercises = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/exercises", {
        params: { page, pageSize: 10, q: debouncedSearch },
      });
      if (res.data?.success) {
        setExercises(res.data.data || []);
        const total = res.data.total || 0;
        setTotalPages(Math.ceil(total / 10)); // Giả sử pageSize = 10
      }
    } catch (error) {
      console.error("Lỗi tải danh sách:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, [page, debouncedSearch]);

  // Handle Delete
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bài tập: "${name}"?`))
      return;
    try {
      // Giả định API delete (Cần tạo API này ở bước sau nếu chưa có)
      // await axios.delete(`/api/exercises/${id}`);
      alert("Chức năng xóa sẽ được kích hoạt khi có API!");
      // fetchExercises(); // Reload sau khi xóa
    } catch (error) {
      alert("Xóa thất bại");
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* --- HEADER --- */}
      <div className="flex flex-col justify-between gap-4 p-5 border-b border-gray-100 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Quản lý Bài tập</h2>
          <p className="text-sm text-gray-500">
            Danh sách toàn bộ bài tập trong hệ thống
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/content/exercises/new")}
          className="flex items-center gap-2 px-4 py-2 text-white transition bg-blue-800 rounded-lg shadow-sm hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> Thêm bài tập mới
        </button>
      </div>

      {/* --- TOOLBAR --- */}
      <div className="flex items-center gap-4 p-4 border-b border-gray-100 bg-gray-50">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên bài tập..."
            className="w-full py-2 pr-4 border border-gray-300 rounded-md pl-9 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* --- TABLE --- */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs font-semibold text-gray-600 uppercase bg-gray-50">
              <th className="p-4 border-b">Media</th>
              <th className="p-4 border-b">Tên bài tập</th>
              <th className="p-4 border-b">Độ khó / Loại</th>
              <th className="p-4 border-b">Dụng cụ</th>
              <th className="p-4 text-center border-b">Hành động</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {loading ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : exercises.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">
                  Không tìm thấy bài tập nào.
                </td>
              </tr>
            ) : (
              exercises.map((ex) => (
                <tr
                  key={ex.id}
                  className="transition border-b hover:bg-gray-50 last:border-0"
                >
                  <td className="w-24 p-4">
                    <div className="relative w-16 h-12 overflow-hidden bg-gray-200 rounded">
                      {ex.imageUrl ? (
                        <img
                          src={ex.imageUrl}
                          alt=""
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-gray-400">
                          <FileVideo className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-gray-900">{ex.name}</div>
                    <div className="text-xs text-gray-500">
                      {ex.name_en || "—"}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col items-start gap-1">
                      <Badge
                        color={
                          ex.difficulty === "beginner"
                            ? "green"
                            : ex.difficulty === "advanced"
                            ? "red"
                            : "yellow"
                        }
                      >
                        {ex.difficulty || "N/A"}
                      </Badge>
                      <span className="text-xs text-gray-500 capitalize">
                        {ex.type?.replace("-", " ") || "—"}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="capitalize">
                      {ex.equipment?.replace("-", " ") || "Bodyweight"}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => navigate(`/exercises/${ex.id}`)} // Xem chi tiết phía Client
                        title="Xem chi tiết"
                        className="p-1.5 hover:bg-blue-50 text-blue-600 rounded"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/admin/content/exercises/edit/${ex.id}`)
                        }
                        title="Chỉnh sửa"
                        className="p-1.5 hover:bg-amber-50 text-amber-600 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(ex.id, ex.name)}
                        title="Xóa"
                        className="p-1.5 hover:bg-red-50 text-red-600 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- PAGINATION --- */}
      <div className="flex items-center justify-between p-4 border-t border-gray-200">
        <span className="text-sm text-gray-500">
          Trang {page} / {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Trước
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      </div>
    </div>
  );
}
