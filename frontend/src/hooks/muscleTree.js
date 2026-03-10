import { useState, useEffect } from "react";
import axios from "axios";

// Hàm helper để xây dựng cây (Logic thuần túy)
const buildHierarchy = (flatList) => {
  // Kiểm tra an toàn: Nếu không phải mảng thì trả về mảng rỗng
  if (!Array.isArray(flatList)) return [];

  const tree = [];
  const childrenMap = {};

  // 1. Tách cha và con
  flatList.forEach((m) => {
    // Tạo bản sao object để tránh lỗi mutation
    const node = { ...m, children: [] };

    if (node.parent_id) {
      if (!childrenMap[node.parent_id]) childrenMap[node.parent_id] = [];
      childrenMap[node.parent_id].push(node);
    } else {
      tree.push(node);
    }
  });

  // 2. Gắn con vào cha
  tree.forEach((root) => {
    if (childrenMap[root.id]) {
      root.children = childrenMap[root.id];
    }
  });

  return tree;
};

// Custom Hook
export function useMuscleTree() {
  const [muscleTree, setMuscleTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchMuscles = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/muscles");
        if (isMounted && res.data?.success) {
          // Xây dựng cây từ dữ liệu API
          const tree = buildHierarchy(res.data.data);
          setMuscleTree(tree);
        }
      } catch (err) {
        console.error("Error loading muscles:", err);
        if (isMounted) setError(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMuscles();

    return () => {
      isMounted = false;
    };
  }, []);

  return { muscleTree, loading, error };
}
