import Exercise from "../models/exercise.model.js";
import { sequelize } from "../config/database.js";

function normalize(str = "") {
  return String(str)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

async function fetchBestImagesForIds(ids) {
  const list = Array.from(new Set((ids || []).filter((x) => Number.isFinite(Number(x)))));
  if (!list.length) return new Map();
  const [rows] = await sequelize.query(
    `SELECT exercise_id, image_url
     FROM (
       SELECT exercise_id, image_url,
              ROW_NUMBER() OVER (PARTITION BY exercise_id ORDER BY is_primary DESC, display_order ASC, image_id ASC) AS rn
       FROM image_exercise
       WHERE exercise_id = ANY($1)
     ) s
     WHERE rn = 1`,
    { bind: [list] }
  );
  return new Map(rows.map(r => [r.exercise_id, r.image_url]));
}

const CANONICAL_CHILD = new Set([
  'upper-chest','mid-chest','lower-chest',
  'latissimus-dorsi','trapezius','rhomboids','erector-spinae','teres-major',
  'anterior-deltoid','lateral-deltoid','posterior-deltoid','rotator-cuff','serratus-anterior',
  'biceps-brachii','brachialis','brachioradialis','triceps-brachii','wrist-flexors','wrist-extensors',
  'rectus-abdominis','obliques','transversus-abdominis',
  'quadriceps','hamstrings','gluteus-maximus','gluteus-medius','gluteus-minimus','hip-adductors','hip-flexors','gastrocnemius','soleus','tibialis-anterior'
]);

const PARENT_ALIASES = new Map([
  [
    'chest',
    [
      'chest', 'nguc', 'torso',
      'pec', 'pecs',
      'upper chest', 'upper-chest',
      'mid chest', 'mid-chest',
      'lower chest', 'lower-chest',
    ]
  ],
  [
    'back',
    [
      'back', 'lung',
      'upper-back', 'upper back',
      'lower-back', 'lower back',
      'lats', 'latissimus', 'latissimus-dorsi',
      'trapezius', 'traps',
      'rhomboids', 'erector-spinae', 'teres-major',
      'neck',
    ]
  ],
  [
    'shoulders',
    [
      'shoulders', 'shoulder', 'vai', 'delts', 'deltoids',
      'anterior-deltoid', 'lateral-deltoid', 'posterior-deltoid', 'rotator-cuff', 'serratus-anterior',
    ]
  ],
  [
    'arms',
    [
      'arms', 'tay', 'upper arms', 'upper-arms', 'lower-arms', 'lower arms',
      'forearm', 'forearms',
      'biceps', 'biceps-brachii',
      'triceps', 'triceps-brachii',
      'brachialis', 'brachioradialis',
      'wrist-flexors', 'wrist-extensors',
    ]
  ],
  [
    'core',
    [
      'core', 'abs', 'abdominals', 'rectus-abdominis', 'obliques', 'transversus-abdominis',
      'bung', 'waist',
    ]
  ],
  [
    'legs',
    [
      'legs', 'chan', 'upper legs', 'upper-legs', 'lower legs', 'lower-legs',
      'quads', 'quadriceps', 'hamstrings',
      'glutes', 'glute', 'butt',
      'gluteus-maximus', 'gluteus-medius', 'gluteus-minimus',
      'hip-adductors', 'hip-flexors',
      'gastrocnemius', 'soleus', 'tibialis-anterior',
      'calf', 'calves',
    ]
  ],
]);


function guessSlugOrParent(input) {
  const raw = normalize(input);
  const candidate = raw.replace(/\s+/g, '-');
  if (CANONICAL_CHILD.has(candidate)) return { childSlug: candidate };
  for (const [parent, aliases] of PARENT_ALIASES) {
    const s = new Set(aliases.map(a => normalize(a)));
    if (s.has(raw) || s.has(candidate)) return { parentSlug: parent };
  }
  return { any: raw };
}

function parsePaging(query, defaults = { page: 1, pageSize: 15, maxPageSize: 1000 }) {
  const page = Math.max(1, parseInt(query?.page, 10) || defaults.page);
  let pageSize = parseInt(query?.pageSize, 10) || defaults.pageSize;
  if (!Number.isFinite(pageSize) || pageSize <= 0) pageSize = defaults.pageSize;
  pageSize = Math.min(pageSize, defaults.maxPageSize);
  const limit = pageSize;
  const offset = (page - 1) * pageSize;
  return { page, pageSize, limit, offset };
}

export const getExercisesByMuscleGroup = async (req, res) => {
  try {
    const { muscleGroup } = req.params;
    const guessed = guessSlugOrParent(muscleGroup);
    const { limit, offset, page, pageSize } = parsePaging(req.query);

    let rows = [];
    let total = 0;
    if (guessed.childSlug) {
      const [result] = await sequelize.query(
        `WITH classified AS (
           SELECT e.exercise_id,
                  CASE
                    WHEN bool_or(emg.impact_level = 'primary') THEN 'primary'
                    WHEN bool_or(emg.impact_level = 'secondary') THEN 'secondary'
                    WHEN bool_or(emg.impact_level = 'stabilizer') THEN 'stabilizer'
                    ELSE NULL
                  END AS impact_level
           FROM exercises e
           JOIN exercise_muscle_group emg ON emg.exercise_id = e.exercise_id
           JOIN muscle_groups mg ON mg.muscle_group_id = emg.muscle_group_id
           WHERE mg.slug = :slug
           GROUP BY e.exercise_id
         )
         SELECT e.*, c.impact_level
         FROM classified c
         JOIN exercises e ON e.exercise_id = c.exercise_id
         ORDER BY e.popularity_score DESC NULLS LAST, e.name ASC
         LIMIT :limit OFFSET :offset`,
        { replacements: { slug: guessed.childSlug, limit, offset } }
      );
      rows = result;
      const [countRows] = await sequelize.query(
        `WITH classified AS (
           SELECT e.exercise_id
           FROM exercises e
           JOIN exercise_muscle_group emg ON emg.exercise_id = e.exercise_id
           JOIN muscle_groups mg ON mg.muscle_group_id = emg.muscle_group_id
           WHERE mg.slug = :slug
           GROUP BY e.exercise_id
         )
         SELECT COUNT(*)::int AS total FROM classified`,
        { replacements: { slug: guessed.childSlug } }
      );
      total = countRows?.[0]?.total || 0;
    } else if (guessed.parentSlug) {
      const [result] = await sequelize.query(
        `WITH classified AS (
          SELECT e.exercise_id,
                 CASE
                   WHEN bool_or(emg.impact_level = 'primary') THEN 'primary'
                   WHEN bool_or(emg.impact_level = 'secondary') THEN 'secondary'
                   WHEN bool_or(emg.impact_level = 'stabilizer') THEN 'stabilizer'
                   ELSE NULL
                 END AS impact_level
          FROM exercises e
          JOIN exercise_muscle_group emg ON emg.exercise_id = e.exercise_id
          JOIN muscle_groups mg ON mg.muscle_group_id = emg.muscle_group_id
          JOIN muscle_groups parent ON parent.muscle_group_id = mg.parent_id
          WHERE parent.slug = :parent
          GROUP BY e.exercise_id
        )
        SELECT e.*, c.impact_level
        FROM classified c
        JOIN exercises e ON e.exercise_id = c.exercise_id
         ORDER BY e.popularity_score DESC NULLS LAST, e.name ASC
         LIMIT :limit OFFSET :offset`,
        { replacements: { parent: guessed.parentSlug, limit, offset } }
      );
      rows = result;
      const [countRows] = await sequelize.query(
        `WITH classified AS (
           SELECT e.exercise_id
           FROM exercises e
           JOIN exercise_muscle_group emg ON emg.exercise_id = e.exercise_id
           JOIN muscle_groups mg ON mg.muscle_group_id = emg.muscle_group_id
           JOIN muscle_groups parent ON parent.muscle_group_id = mg.parent_id
           WHERE parent.slug = :parent
           GROUP BY e.exercise_id
         )
         SELECT COUNT(*)::int AS total FROM classified`,
        { replacements: { parent: guessed.parentSlug } }
      );
      total = countRows?.[0]?.total || 0;
    } else {
      // Fallback: try by slug, then by Vietnamese/English name
      const [bySlug] = await sequelize.query(
        `WITH classified AS (
           SELECT e.exercise_id,
                  CASE
                    WHEN bool_or(emg.impact_level = 'primary') THEN 'primary'
                    WHEN bool_or(emg.impact_level = 'secondary') THEN 'secondary'
                    WHEN bool_or(emg.impact_level = 'stabilizer') THEN 'stabilizer'
                    ELSE NULL
                  END AS impact_level
           FROM exercises e
           JOIN exercise_muscle_group emg ON emg.exercise_id = e.exercise_id
           JOIN muscle_groups mg ON mg.muscle_group_id = emg.muscle_group_id
           WHERE mg.slug = :slug
           GROUP BY e.exercise_id
         )
         SELECT e.*, c.impact_level
         FROM classified c
         JOIN exercises e ON e.exercise_id = c.exercise_id
         ORDER BY e.popularity_score DESC NULLS LAST, e.name ASC
         LIMIT :limit OFFSET :offset`,
        { replacements: { slug: muscleGroup.toLowerCase().replace(/\s+/g, '-'), limit, offset } }
      );
      if (bySlug.length) {
        rows = bySlug;
        const [countRows] = await sequelize.query(
          `WITH classified AS (
             SELECT e.exercise_id
             FROM exercises e
             JOIN exercise_muscle_group emg ON emg.exercise_id = e.exercise_id
             JOIN muscle_groups mg ON mg.muscle_group_id = emg.muscle_group_id
             WHERE mg.slug = :slug
             GROUP BY e.exercise_id
           )
           SELECT COUNT(*)::int AS total FROM classified`,
          { replacements: { slug: muscleGroup.toLowerCase().replace(/\s+/g, '-') } }
        );
        total = countRows?.[0]?.total || 0;
      } else {
        const [byName] = await sequelize.query(
          `WITH classified AS (
            SELECT e.exercise_id,
                   CASE
                     WHEN bool_or(emg.impact_level = 'primary') THEN 'primary'
                     WHEN bool_or(emg.impact_level = 'secondary') THEN 'secondary'
                     WHEN bool_or(emg.impact_level = 'stabilizer') THEN 'stabilizer'
                     ELSE NULL
                   END AS impact_level
            FROM exercises e
            JOIN exercise_muscle_group emg ON emg.exercise_id = e.exercise_id
            JOIN muscle_groups mg ON mg.muscle_group_id = emg.muscle_group_id
            WHERE mg.name ILIKE :q OR mg.name_en ILIKE :q
            GROUP BY e.exercise_id
          )
          SELECT e.*, c.impact_level
          FROM classified c
          JOIN exercises e ON e.exercise_id = c.exercise_id
          ORDER BY e.popularity_score DESC NULLS LAST, e.name ASC
          LIMIT :limit OFFSET :offset`,
          { replacements: { q: `%${muscleGroup}%`, limit, offset } }
        );
        rows = byName;
        const [countRows] = await sequelize.query(
          `WITH classified AS (
             SELECT e.exercise_id
             FROM exercises e
             JOIN exercise_muscle_group emg ON emg.exercise_id = e.exercise_id
             JOIN muscle_groups mg ON mg.muscle_group_id = emg.muscle_group_id
             WHERE mg.name ILIKE :q OR mg.name_en ILIKE :q
             GROUP BY e.exercise_id
           )
           SELECT COUNT(*)::int AS total FROM classified`,
          { replacements: { q: `%${muscleGroup}%` } }
        );
        total = countRows?.[0]?.total || 0;
      }
    }

    // Prefer image from image_exercise if available
    const imgMap = await fetchBestImagesForIds(rows.map(r => r.exercise_id));
    const data = rows.map(r => ({
      id: r.exercise_id,
      name: r.name || r.name_en,
      description: r.description,
      difficulty: r.difficulty_level,
      equipment: r.equipment_needed,
      imageUrl: imgMap.get(r.exercise_id) || r.thumbnail_url || r.gif_demo_url || null,
      instructions: null,
      impact_level: r.impact_level || null,
    }));

    res.status(200).json({ success: true, data, page, pageSize, total });
  } catch (error) {
    console.error("Error fetching exercises:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching exercises",
      error: error.message,
    });
  }
};

export const getAllExercises = async (_req, res) => {
  try {
    const { limit, offset, page, pageSize } = parsePaging(_req.query);
    const { count, rows } = await Exercise.findAndCountAll({ limit, offset, order: [["popularity_score", "DESC"], ["name", "ASC"]] });
    const imgMap = await fetchBestImagesForIds(rows.map(r => r.exercise_id));
    const data = rows.map((r) => ({
      id: r.exercise_id,
      name: r.name || r.name_en,
      description: r.description,
      difficulty: r.difficulty_level,
      equipment: r.equipment_needed,
      imageUrl: imgMap.get(r.exercise_id) || r.thumbnail_url || r.gif_demo_url || null,
      instructions: null,
      impact_level: r.impact_level || null,
    }));
    res.status(200).json({ success: true, data, page, pageSize, total: count });
  } catch (error) {
    console.error("Error fetching all exercises:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching exercises",
      error: error.message,
    });
  }
};

// Filter by exercise type (compound | isolation | cardio | flexibility)
export const getExercisesByType = async (req, res) => {
  try {
    const { type } = req.params;
    const t = normalize(type).replace(/\s+/g, '-');
    const allowed = new Set(['compound', 'isolation', 'cardio', 'flexibility']);
    if (!allowed.has(t)) {
      return res.status(400).json({ success: false, message: 'Invalid exercise type', allowed: Array.from(allowed) });
    }

    const { limit, offset, page, pageSize } = parsePaging(req.query);

    const [countRows] = await sequelize.query(
      `SELECT COUNT(*)::int AS total FROM exercises WHERE exercise_type = $1`,
      { bind: [t] }
    );
    const total = countRows?.[0]?.total || 0;

    const [rows] = await sequelize.query(
      `SELECT * FROM exercises WHERE exercise_type = $1
       ORDER BY popularity_score DESC NULLS LAST, name ASC
       LIMIT $2 OFFSET $3`,
      { bind: [t, limit, offset] }
    );

    const imgMap = await fetchBestImagesForIds(rows.map(r => r.exercise_id));
    const data = rows.map((r) => ({
      id: r.exercise_id,
      name: r.name || r.name_en,
      description: r.description,
      difficulty: r.difficulty_level,
      equipment: r.equipment_needed,
      imageUrl: imgMap.get(r.exercise_id) || r.thumbnail_url || r.gif_demo_url || null,
      instructions: null,
      impact_level: null,
    }));

    return res.status(200).json({ success: true, data, page, pageSize, total });
  } catch (error) {
    console.error('Error fetching exercises by type:', error);
    return res.status(500).json({ success: false, message: 'Error fetching exercises by type', error: error.message });
  }
};

// Return steps (JSON preferred) by exercise id
export const getExerciseStepsById = async (req, res) => {
  try {
    const { exerciseId } = req.params;
    // Prefer JSON table
    const [jsonRows] = await sequelize.query(
      `SELECT steps FROM exercise_steps_json WHERE exercise_id = $1 LIMIT 1`,
      { bind: [exerciseId] }
    );
    if (jsonRows.length) {
      return res.status(200).json({ success: true, data: jsonRows[0].steps });
    }
    // Fallback to row-level steps
    const [rows] = await sequelize.query(
      `SELECT step_number, title, instruction_text, media_url, media_type
       FROM exercise_steps WHERE exercise_id = $1 ORDER BY step_number ASC`,
      { bind: [exerciseId] }
    );
    const steps = rows.map(r => ({
      step_number: r.step_number,
      instruction_text: r.instruction_text,
      title: r.title,
      media_url: r.media_url,
      media_type: r.media_type,
    }));
    return res.status(200).json({ success: true, data: steps });
  } catch (error) {
    console.error('Error fetching steps by id:', error);
    return res.status(500).json({ success: false, message: 'Error fetching steps', error: error.message });
  }
};

// Return steps by slug
export const getExerciseStepsBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const [exRows] = await sequelize.query(
      `SELECT exercise_id FROM exercises WHERE slug = $1 LIMIT 1`,
      { bind: [slug] }
    );
    if (!exRows.length) return res.status(404).json({ success: false, message: 'Exercise not found' });
    const exerciseId = exRows[0].exercise_id;
    const [jsonRows] = await sequelize.query(
      `SELECT steps FROM exercise_steps_json WHERE exercise_id = $1 LIMIT 1`,
      { bind: [exerciseId] }
    );
    if (jsonRows.length) {
      return res.status(200).json({ success: true, data: jsonRows[0].steps });
    }
    const [rows] = await sequelize.query(
      `SELECT step_number, title, instruction_text, media_url, media_type
       FROM exercise_steps WHERE exercise_id = $1 ORDER BY step_number ASC`,
      { bind: [exerciseId] }
    );
    const steps = rows.map(r => ({
      step_number: r.step_number,
      instruction_text: r.instruction_text,
      title: r.title,
      media_url: r.media_url,
      media_type: r.media_type,
    }));
    return res.status(200).json({ success: true, data: steps });
  } catch (error) {
    console.error('Error fetching steps by slug:', error);
    return res.status(500).json({ success: false, message: 'Error fetching steps', error: error.message });
  }
};

// AI advice: summarize exercises with Gemini and return guidance
export const getExerciseAiAdvice = async (req, res) => {
  try {
    const limit = Math.min(50, Math.max(5, parseInt(req.query.limit, 10) || 20));
    const rows = await Exercise.findAll({
      limit,
      order: [["popularity_score", "DESC"], ["name", "ASC"]],
      attributes: [
        ["exercise_id", "id"],
        "name",
        "name_en",
        "difficulty_level",
        "exercise_type",
        "equipment_needed",
      ],
    });

    const payload = rows.map(r => ({
      id: r.get("id"),
      name: r.name || r.name_en,
      difficulty: r.difficulty_level || null,
      type: r.exercise_type || null,
      equipment: r.equipment_needed || null,
    }));

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
    const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";

    if (!apiKey) {
      return res.json({
        success: true,
        data: {
          exercises: payload,
          ai: {
            advice: "Thiếu GEMINI_API_KEY – trả về danh sách bài tập cục bộ. Hãy thiết lập khóa API để nhận gợi ý từ AI.",
          },
          meta: { fallback: true },
        },
      });
    }

    // Simple Gemini call with version fallback (reuse pattern from nutrition.routes)
    const versions = ["v1beta", "v1"]; // try v1beta first, then v1

    const prompt = `Bạn là huấn luyện viên thể hình. Dưới đây là danh sách bài tập (JSON):\n\n${JSON.stringify(payload)}\n\nYêu cầu:\n1) In lại danh sách bài tập ở dạng gọn (name, difficulty, type, equipment).\n2) Đưa ra 3-5 lời khuyên ngắn cho người mới để sắp xếp buổi tập trong tuần (ưu tiên bài compound, tránh trùng cơ).\n\nTrả về JSON hợp lệ duy nhất với cấu trúc:\n{\n  "exercises": [{"name":"...","difficulty":"...","type":"...","equipment":"..."}],\n  "advice": ["...", "...", "..."]\n}\nKhông kèm text ngoài JSON.`;

    const postJson = async (url, body) => {
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        const err = new Error(data?.error?.message || 'Gemini API error');
        err.status = resp.status;
        err.body = data;
        throw err;
      }
      return data;
    };

    const body = {
      contents: [{ role: 'user', parts: [{ text: prompt }]}],
      generationConfig: { temperature: 0.6, maxOutputTokens: 1024 },
    };

    let outText = '';
    let lastErr = null;
    for (const v of versions) {
      const url = `https://generativelanguage.googleapis.com/${v}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
      try {
        const data = await postJson(url, body);
        outText = (data?.candidates?.[0]?.content?.parts || []).map(p => p.text).join('\n');
        if (outText) break;
      } catch (e) {
        lastErr = e;
        if (e?.status !== 404) break;
      }
    }
    if (!outText) throw lastErr || new Error('Gemini call failed');

    // Extract JSON content
    let aiJson = null;
    try {
      const i = outText.indexOf('{');
      const j = outText.lastIndexOf('}');
      aiJson = JSON.parse(outText.slice(i, j + 1));
    } catch (_) {
      aiJson = { exercises: payload.map(x => ({ name: x.name, difficulty: x.difficulty, type: x.type, equipment: x.equipment })), advice: ["Tập toàn thân 3 buổi/tuần", "Ưu tiên compound trước isolation"] };
    }

    return res.json({ success: true, data: { exercises: payload, ai: aiJson } });
  } catch (error) {
    console.error('getExerciseAiAdvice error:', error);
    return res.status(500).json({ success: false, message: 'Failed to get AI advice', error: error.message });
  }
};
