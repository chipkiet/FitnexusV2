/**
 * Meal Planner Routes  –  /api
 *
 * FOOD (USDA proxy — API key stays server-side):
 *   GET  /api/foods/search?q=...&limit=20    → search USDA, fallback to foods.json
 *   GET  /api/foods/:fdcId                   → USDA food detail (normalized)
 *
 * MEALS (CSV storage):
 *   POST   /api/meals                        → save a meal row
 *   GET    /api/meals/:userId                → user meals (?date=YYYY-MM-DD)
 *   GET    /api/meals/:userId/summary        → daily macro totals by meal type
 *   PUT    /api/meals/:id                    → update meal_type / quantity / date
 *   DELETE /api/meals/:id                    → remove a row
 */

import express from 'express';
import fs      from 'fs';
import path    from 'path';
import https   from 'https';
import { fileURLToPath } from 'url';

const router    = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR  = path.join(__dirname, '..', 'data');
const FOODS_PATH = path.join(DATA_DIR, 'foods.json');
const CSV_PATH   = path.join(DATA_DIR, 'meal_plans.csv');
const CSV_HEADER = 'id,user_id,meal_type,food_id,food_name,quantity_g,calories,protein,carbs,fat,date\n';

const USDA_KEY  = process.env.USDA_API_KEY || '';
const USDA_BASE = 'https://api.nal.usda.gov/fdc/v1';

// USDA nutrient IDs
const NID = { calories: 1008, protein: 1003, carbs: 1005, fat: 1004 };

// ─── USDA helpers ─────────────────────────────────────────────────────────────

/** Simple fetch via Node https (no extra deps) */
const usdaGet = (path) => new Promise((resolve, reject) => {
    const url = `${USDA_BASE}${path}${path.includes('?') ? '&' : '?'}api_key=${USDA_KEY}`;
    https.get(url, { headers: { 'Accept': 'application/json' } }, (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
            try { resolve(JSON.parse(data)); }
            catch (e) { reject(new Error('Invalid JSON from USDA')); }
        });
    }).on('error', reject);
});

/** Extract macro value from USDA nutrient array */
const getNutrient = (nutrients, nid) => {
    const n = nutrients?.find(x => x.nutrientId === nid || x.nutrient?.id === nid);
    return n ? +((n.value ?? n.amount ?? 0)).toFixed(1) : 0;
};

/** Normalize a USDA search hit or food detail → { id, name, calories, protein, carbs, fat } */
const normalize = (item) => ({
    id:       item.fdcId,
    name:     item.description || item.lowercaseDescription || 'Unknown',
    calories: getNutrient(item.foodNutrients, NID.calories),
    protein:  getNutrient(item.foodNutrients, NID.protein),
    carbs:    getNutrient(item.foodNutrients, NID.carbs),
    fat:      getNutrient(item.foodNutrients, NID.fat),
});

// ─── CSV helpers ──────────────────────────────────────────────────────────────

const loadFoodsLocal = () => {
    try { return JSON.parse(fs.readFileSync(FOODS_PATH, 'utf8')); }
    catch { return []; }
};

const ensureCsv = () => {
    if (!fs.existsSync(CSV_PATH)) fs.writeFileSync(CSV_PATH, CSV_HEADER);
};

/**
 * Parse a single CSV line respecting RFC-4180 quoted fields.
 * Handles fields like: 123,"Sweet potato, canned",45
 */
const parseCsvLine = (line) => {
    const fields = [];
    let cur = '';
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (inQuote) {
            if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; } // escaped quote
            else if (ch === '"') { inQuote = false; }                   // closing quote
            else { cur += ch; }
        } else {
            if (ch === '"') { inQuote = true; }
            else if (ch === ',') { fields.push(cur); cur = ''; }
            else { cur += ch; }
        }
    }
    fields.push(cur);
    return fields;
};

const loadMeals = () => {
    ensureCsv();
    const lines = fs.readFileSync(CSV_PATH, 'utf8').trim().split('\n');
    if (lines.length <= 1) return [];
    const headers = parseCsvLine(lines[0]);
    return lines.slice(1)
        .filter(l => l.trim())
        .map(line => {
            const vals = parseCsvLine(line);
            const obj  = {};
            headers.forEach((h, i) => { obj[h] = vals[i] ?? ''; });
            return obj;
        });
};

const appendRow = (row) => {
    ensureCsv();
    const line = [
        row.id, row.user_id, row.meal_type, row.food_id,
        `"${row.food_name}"`,
        row.quantity_g, row.calories, row.protein, row.carbs, row.fat, row.date,
    ].join(',') + '\n';
    fs.appendFileSync(CSV_PATH, line);
};

const rewriteCsv = (rows) => {
    const lines = rows.map(r =>
        [r.id, r.user_id, r.meal_type, r.food_id,
         `"${r.food_name}"`, r.quantity_g,
         r.calories, r.protein, r.carbs, r.fat, r.date].join(',')
    );
    fs.writeFileSync(CSV_PATH, CSV_HEADER + lines.join('\n') + (lines.length ? '\n' : ''));
};

/** Deduplicate foods by normalized name (case-insensitive, trim) */
const dedup = (foods) => {
    const seen = new Set();
    return foods.filter(f => {
        const key = f.name.toLowerCase().replace(/\s+/g, ' ').trim();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
};

/** Shuffle array in place and return it */
const shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

const todayStr = () => new Date().toISOString().slice(0, 10);
const genId    = () => `${Date.now()}${Math.floor(Math.random() * 900) + 100}`;

// Popular keywords rotated for the default food list
const POPULAR_TERMS = [
    'chicken', 'salmon', 'egg', 'rice', 'oatmeal', 'beef', 'tuna',
    'broccoli', 'banana', 'yogurt', 'tofu', 'spinach', 'sweet potato',
    'almonds', 'milk', 'avocado', 'shrimp', 'lentils', 'quinoa', 'bread',
];

// ─── GET /api/foods/popular ──────────────────────────────────────────────────

// Returns 10 random foods to show before user starts typing
router.get('/foods/popular', async (_req, res) => {
    if (USDA_KEY) {
        try {
            const term = POPULAR_TERMS[Math.floor(Math.random() * POPULAR_TERMS.length)];
            const data = await usdaGet(
                `/foods/search?query=${encodeURIComponent(term)}&pageSize=50&dataType=SR%20Legacy,Foundation`
            );
            const foods = dedup((data.foods || []).map(normalize)).slice(0, 10);
            return res.json(foods);
        } catch (err) {
            console.warn('[USDA] popular failed, falling back to local:', err.message);
        }
    }
    // Fallback: random 10 from local file
    const local = shuffle([...loadFoodsLocal()]).slice(0, 10);
    res.json(local);
});

// ─── GET /api/foods/search?q=...&limit=20 ─────────────────────────────────────
router.get('/foods/search', async (req, res) => {
    const q     = (req.query.q || '').trim();
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);

    if (!q) return res.json([]);

    // Try USDA first
    if (USDA_KEY) {
        try {
            const data = await usdaGet(
                `/foods/search?query=${encodeURIComponent(q)}&pageSize=${limit * 3}&dataType=SR%20Legacy,Foundation,Branded`
            );
            const foods = dedup((data.foods || []).map(normalize)).slice(0, limit);
            return res.json(foods);
        } catch (err) {
            console.warn('[USDA] search failed, falling back to local:', err.message);
        }
    }

    // Fallback: filter local foods.json
    const local = dedup(loadFoodsLocal()
        .filter(f => f.name.toLowerCase().includes(q.toLowerCase())))
        .slice(0, limit);
    res.json(local);
});

// ─── GET /api/foods/:fdcId ────────────────────────────────────────────────────
router.get('/foods/:fdcId', async (req, res) => {
    const { fdcId } = req.params;

    // Check local fallback first (integer IDs)
    const localId = parseInt(fdcId);
    if (!isNaN(localId) && localId < 100000) {
        const local = loadFoodsLocal().find(f => f.id === localId);
        if (local) return res.json(local);
    }

    if (!USDA_KEY) return res.status(503).json({ error: 'USDA_API_KEY not configured' });

    try {
        const item = await usdaGet(`/food/${fdcId}`);
        res.json(normalize(item));
    } catch (e) {
        res.status(502).json({ error: 'USDA API error', detail: e.message });
    }
});

// ─── POST /api/meals ──────────────────────────────────────────────────────────
// Body: { user_id, meal_type, food_id, food_name, quantity, date,
//         calories, protein, carbs, fat }   ← caller pre-computes from USDA data
router.post('/meals', (req, res) => {
    const { user_id, meal_type, food_id, food_name,
            quantity, date, calories, protein, carbs, fat } = req.body;

    if (!user_id)   return res.status(400).json({ error: 'user_id is required' });
    if (!meal_type) return res.status(400).json({ error: 'meal_type is required' });
    if (!food_id)   return res.status(400).json({ error: 'food_id is required' });
    if (!quantity)  return res.status(400).json({ error: 'quantity is required' });

    const VALID = ['breakfast', 'lunch', 'dinner', 'snack'];
    if (!VALID.includes(meal_type))
        return res.status(400).json({ error: `meal_type must be one of: ${VALID.join(', ')}` });

    const qty = parseFloat(quantity) || 100;

    // If caller sends pre-computed macros (from USDA), use them;
    // otherwise fall back to local foods.json scaling
    let kcal, prot, carb, ft;
    if (calories !== undefined) {
        kcal = +parseFloat(calories).toFixed(1);
        prot = +parseFloat(protein).toFixed(1);
        carb = +parseFloat(carbs).toFixed(1);
        ft   = +parseFloat(fat).toFixed(1);
    } else {
        const foods = loadFoodsLocal();
        const food  = foods.find(f => f.id === parseInt(food_id));
        if (!food) return res.status(404).json({ error: 'Food not found' });
        const s = qty / 100;
        kcal = +(food.calories * s).toFixed(1);
        prot = +(food.protein  * s).toFixed(1);
        carb = +(food.carbs    * s).toFixed(1);
        ft   = +(food.fat      * s).toFixed(1);
    }

    const row = {
        id:         genId(),
        user_id:    String(user_id),
        meal_type,
        food_id:    String(food_id),
        food_name:  food_name || `Food #${food_id}`,
        quantity_g: qty,
        calories:   kcal,
        protein:    prot,
        carbs:      carb,
        fat:        ft,
        date:       date || todayStr(),
    };

    appendRow(row);
    res.status(201).json({ message: 'Meal saved', meal: row });
});

// ─── GET /api/meals/:userId ───────────────────────────────────────────────────
router.get('/meals/:userId', (req, res) => {
    const { userId } = req.params;
    const { date }   = req.query;
    let meals = loadMeals().filter(m => m.user_id === String(userId));
    if (date) meals = meals.filter(m => m.date === date);
    res.json({ user_id: userId, count: meals.length, meals });
});

// ─── GET /api/meals/:userId/summary ──────────────────────────────────────────
router.get('/meals/:userId/summary', (req, res) => {
    const { userId } = req.params;
    const { date }   = req.query;
    let meals = loadMeals().filter(m => m.user_id === String(userId));
    if (date) meals = meals.filter(m => m.date === date);

    const totals = meals.reduce((acc, m) => ({
        calories: +(acc.calories + parseFloat(m.calories || 0)).toFixed(1),
        protein:  +(acc.protein  + parseFloat(m.protein  || 0)).toFixed(1),
        carbs:    +(acc.carbs    + parseFloat(m.carbs    || 0)).toFixed(1),
        fat:      +(acc.fat      + parseFloat(m.fat      || 0)).toFixed(1),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    const byType = {};
    meals.forEach(m => {
        if (!byType[m.meal_type]) byType[m.meal_type] = [];
        byType[m.meal_type].push(m);
    });

    res.json({ user_id: userId, date: date || 'all', totals, meals: byType });
});

// ─── DELETE /api/meals/:id ────────────────────────────────────────────────────
router.delete('/meals/:id', (req, res) => {
    const { id } = req.params;
    const meals  = loadMeals();
    const idx    = meals.findIndex(m => m.id === String(id));
    if (idx === -1) return res.status(404).json({ error: 'Meal not found' });
    meals.splice(idx, 1);
    rewriteCsv(meals);
    res.json({ message: 'Meal deleted', id });
});

// ─── PUT /api/meals/:id ───────────────────────────────────────────────────────
router.put('/meals/:id', (req, res) => {
    const { id } = req.params;
    const meals  = loadMeals();
    const idx    = meals.findIndex(m => m.id === String(id));
    if (idx === -1) return res.status(404).json({ error: 'Meal not found' });

    const meal = meals[idx];
    const { meal_type, quantity, date, calories, protein, carbs, fat } = req.body;

    const VALID = ['breakfast', 'lunch', 'dinner', 'snack'];
    if (meal_type && !VALID.includes(meal_type))
        return res.status(400).json({ error: `meal_type must be one of: ${VALID.join(', ')}` });

    if (meal_type) meal.meal_type = meal_type;
    if (date)      meal.date      = date;

    if (quantity) {
        const qty = parseFloat(quantity);
        if (!isNaN(qty) && qty > 0) {
            // If caller sends pre-computed macros (scaled already), use them
            if (calories !== undefined) {
                meal.quantity_g = qty;
                meal.calories   = +parseFloat(calories).toFixed(1);
                meal.protein    = +parseFloat(protein).toFixed(1);
                meal.carbs      = +parseFloat(carbs).toFixed(1);
                meal.fat        = +parseFloat(fat).toFixed(1);
            } else {
                // Try local foods.json scaling
                const foods = loadFoodsLocal();
                const food  = foods.find(f => f.id === parseInt(meal.food_id));
                if (food) {
                    const s = qty / 100;
                    meal.quantity_g = qty;
                    meal.calories   = +(food.calories * s).toFixed(1);
                    meal.protein    = +(food.protein  * s).toFixed(1);
                    meal.carbs      = +(food.carbs    * s).toFixed(1);
                    meal.fat        = +(food.fat      * s).toFixed(1);
                } else {
                    // Proportional scale
                    const prevQty = parseFloat(meal.quantity_g) || 100;
                    const ratio   = qty / prevQty;
                    meal.quantity_g = qty;
                    meal.calories   = +(parseFloat(meal.calories) * ratio).toFixed(1);
                    meal.protein    = +(parseFloat(meal.protein)  * ratio).toFixed(1);
                    meal.carbs      = +(parseFloat(meal.carbs)    * ratio).toFixed(1);
                    meal.fat        = +(parseFloat(meal.fat)      * ratio).toFixed(1);
                }
            }
        }
    }

    meals[idx] = meal;
    rewriteCsv(meals);
    res.json({ message: 'Meal updated', meal });
});

export default router;
