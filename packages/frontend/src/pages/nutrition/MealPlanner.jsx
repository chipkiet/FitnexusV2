import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import HeaderLogin from '../../components/header/HeaderLogin.jsx';
import { useAuth } from '../../context/auth.context.jsx';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const MEAL_TYPES = [
  { key: 'breakfast', label: 'Sáng', icon: '🌅' },
  { key: 'lunch', label: 'Trưa', icon: '☀️' },
  { key: 'dinner', label: 'Tối', icon: '🌙' },
  { key: 'snack', label: 'Snack', icon: '🍎' },
];

const FOOD_ICONS = {
  chicken: '🍗', breast: '🍗', salmon: '🐟', tuna: '🐟', beef: '🥩',
  egg: '🥚', milk: '🥛', rice: '🍚', oat: '🥣', oatmeal: '🥣',
  bread: '🍞', potato: '🍠', sweet: '🍠', yogurt: '🫙', banana: '🍌',
  apple: '🍎', avocado: '🥑', broccoli: '🥦', spinach: '🥬',
  almond: '🌰', tofu: '🧆', protein: '💪', shake: '💪',
};
const getFoodIcon = (name = '') => {
  const lc = name.toLowerCase();
  for (const [k, v] of Object.entries(FOOD_ICONS)) if (lc.includes(k)) return v;
  return '🍽️';
};

const todayStr = () => new Date().toISOString().slice(0, 10);

// ── Week helpers ────────────────────────────────────────────────────────────
const VI_DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

/** Return array of 7 date strings centred on today */
const getWeekDays = (centreDate) => {
  const d = new Date(centreDate + 'T00:00:00');
  const result = [];
  for (let i = -3; i <= 3; i++) {
    const dd = new Date(d);
    dd.setDate(dd.getDate() + i);
    result.push(dd.toISOString().slice(0, 10));
  }
  return result;
};

const fmtShort = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  return { day: d.getDate(), dow: VI_DAYS[d.getDay()] };
};

// ── WeekStrip component ──────────────────────────────────────────────────────
function WeekStrip({ selected, onChange, datesWithMeals = new Set() }) {
  const today = todayStr();
  const days = getWeekDays(selected || today);

  const goWeek = (dir) => {
    const d = new Date((selected || today) + 'T00:00:00');
    d.setDate(d.getDate() + dir * 7);
    onChange(d.toISOString().slice(0, 10));
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6, marginBottom: 28,
      background: '#fff', border: '1px solid #E2E8F0', borderRadius: 14,
      padding: '10px 12px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
    }}>
      <button onClick={() => goWeek(-1)}
        style={{
          background: 'none', border: '1px solid #E2E8F0', borderRadius: 8,
          padding: '4px 8px', cursor: 'pointer', fontSize: 14, lineHeight: 1
        }}>‹</button>

      <div style={{ flex: 1, display: 'flex', gap: 4, justifyContent: 'center' }}>
        {days.map(d => {
          const { day, dow } = fmtShort(d);
          const isSelected = d === selected;
          const isToday = d === today;
          const hasFood = datesWithMeals.has(d);
          return (
            <motion.button
              key={d}
              whileTap={{ scale: 0.93 }}
              onClick={() => onChange(d)}
              style={{
                flex: 1, padding: '7px 4px', borderRadius: 10, border: 'none',
                cursor: 'pointer', fontFamily: 'inherit', position: 'relative',
                background: isSelected ? '#10B981' : isToday ? '#F0FDF4' : 'transparent',
                color: isSelected ? '#fff' : isToday ? '#059669' : '#475569',
                fontWeight: isSelected || isToday ? 700 : 400,
                transition: 'all 0.15s',
              }}>
              {hasFood && (
                <Bookmark
                  size={10}
                  fill="#F59E0B"
                  color="#F59E0B"
                  style={{ position: 'absolute', top: 3, right: 4 }}
                />
              )}
              <div style={{ fontSize: 10 }}>{dow}</div>
              <div style={{ fontSize: 15, marginTop: 2 }}>{day}</div>
            </motion.button>
          );
        })}
      </div>

      <button onClick={() => goWeek(1)}
        style={{
          background: 'none', border: '1px solid #E2E8F0', borderRadius: 8,
          padding: '4px 8px', cursor: 'pointer', fontSize: 14, lineHeight: 1
        }}>›</button>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function MacroBadge({ label, value, color }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      padding: '2px 8px', borderRadius: 999,
      background: color + '18', color, fontSize: 11, fontWeight: 600,
    }}>
      {label}: {value}
    </span>
  );
}

function TotalChip({ label, value, accent }) {
  return (
    <div style={{
      flex: 1, textAlign: 'center', padding: '10px 6px',
      borderRadius: 12, background: accent ? '#EEF2FF' : '#F8FAFC',
      border: `1px solid ${accent ? '#C7D2FE' : '#E2E8F0'}`,
    }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: accent ? '#6366F1' : '#1E293B' }}>{value}</div>
      <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 500, marginTop: 2 }}>{label}</div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function MealPlanner() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userId = user?.id || user?.user_id || 'guest';

  const [foods, setFoods] = useState([]);
  const [popularFoods, setPopularFoods] = useState([]);
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [mealType, setMealType] = useState('breakfast');
  const [quantity, setQuantity] = useState(100);
  const [date, setDate] = useState(todayStr());
  const [saving, setSaving] = useState(false);
  const [log, setLog] = useState({});
  const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [toast, setToast] = useState('');
  const [datesWithMeals, setDatesWithMeals] = useState(new Set());

  // Shared selected date — drives both the form and the log
  const [activeDate, setActiveDate] = useState(todayStr());

  // Keep form date in sync with week strip
  useEffect(() => { setDate(activeDate); }, [activeDate]);

  // Macro preview
  const preview = useMemo(() => {
    if (!selectedFood) return null;
    const s = quantity / 100;
    return {
      calories: (selectedFood.calories * s).toFixed(0),
      protein: (selectedFood.protein * s).toFixed(1),
      carbs: (selectedFood.carbs * s).toFixed(1),
      fat: (selectedFood.fat * s).toFixed(1),
    };
  }, [selectedFood, quantity]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2800); };

  // Load popular foods on mount
  useEffect(() => {
    axios.get(`${API}/api/foods/popular`)
      .then(r => { setPopularFoods(r.data); setFoods(r.data); })
      .catch(() => { });
  }, []);

  // Debounced USDA search
  useEffect(() => {
    if (!search.trim()) { setFoods(popularFoods); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const r = await axios.get(`${API}/api/foods/search`, { params: { q: search, limit: 20 } });
        setFoods(r.data);
      } catch {
        setFoods([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [search, popularFoods]);

  // Load dates that have meals (for Bookmark indicators)
  const loadDates = useCallback(() => {
    axios.get(`${API}/api/meals/${userId}`)
      .then(r => {
        const dates = new Set((r.data.meals || []).map(m => m.date));
        setDatesWithMeals(dates);
      })
      .catch(() => { });
  }, [userId]);

  useEffect(() => { loadDates(); }, [loadDates]);

  // Load meal log — now driven by activeDate
  const loadLog = useCallback(() => {
    const q = activeDate ? `?date=${activeDate}` : '';
    axios.get(`${API}/api/meals/${userId}/summary${q}`)
      .then(r => { setLog(r.data.meals || {}); setTotals(r.data.totals || {}); })
      .catch(() => { });
  }, [userId, activeDate]);

  useEffect(() => { loadLog(); }, [loadLog]);

  const filteredFoods = foods; // already filtered by API server-side

  const handleAdd = async () => {
    if (!selectedFood) return showToast('⚠️ Chọn thực phẩm trước');
    setSaving(true);
    try {
      const s = quantity / 100;
      await axios.post(`${API}/api/meals`, {
        user_id: userId, meal_type: mealType, food_id: selectedFood.id,
        food_name: selectedFood.name, quantity, date,
        calories: +(selectedFood.calories * s).toFixed(1),
        protein: +(selectedFood.protein * s).toFixed(1),
        carbs: +(selectedFood.carbs * s).toFixed(1),
        fat: +(selectedFood.fat * s).toFixed(1),
      });
      showToast(`✅ Đã thêm ${selectedFood.name}`);
      loadLog(); loadDates();
    } catch (e) {
      showToast(`❌ ${e.response?.data?.error || 'Lỗi lưu bữa ăn'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await axios.delete(`${API}/api/meals/${id}`);
    showToast('🗑️ Đã xóa');
    loadLog(); loadDates();
  };

  // ── Edit state ────────────────────────────────────────────────
  const [editingMeal, setEditingMeal] = useState(null);
  const [editQty, setEditQty] = useState(100);
  const [editType, setEditType] = useState('breakfast');
  const [editDate, setEditDate] = useState(todayStr());
  const [updating, setUpdating] = useState(false);

  const openEdit = (m) => {
    setEditingMeal(m);
    setEditQty(parseFloat(m.quantity_g) || 100);
    setEditType(m.meal_type);
    setEditDate(m.date);
  };

  const handleUpdate = async () => {
    if (!editingMeal) return;
    setUpdating(true);
    try {
      await axios.put(`${API}/api/meals/${editingMeal.id}`, {
        meal_type: editType,
        quantity: editQty,
        date: editDate,
      });
      showToast('✅ Đã cập nhật');
      setEditingMeal(null);
      loadLog(); loadDates();
    } catch (e) {
      showToast(`❌ ${e.response?.data?.error || 'Lỗi cập nhật'}`);
    } finally {
      setUpdating(false);
    }
  };

  const ORDER = ['breakfast', 'lunch', 'dinner', 'snack'];
  const hasMeals = ORDER.some(t => log[t]?.length);

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}>
      <HeaderLogin />

      <main style={{ paddingTop: 80, paddingBottom: 64, padding: '80px 20px 64px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>

          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', marginBottom: 20,
              background: 'none', border: '1px solid #E2E8F0', borderRadius: 10,
              color: '#64748B', fontSize: 13, fontWeight: 500,
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'border-color 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.color = '#0F172A'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#64748B'; }}
          >
            <ArrowLeft size={14} /> Quay lại
          </button>

          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', paddingTop: 28, marginBottom: 32 }}>

            <h1 style={{
              fontSize: 'clamp(28px,5vw,44px)', fontWeight: 800, color: '#0F172A',
              letterSpacing: '-0.03em', margin: 0
            }}>Kế hoạch bữa ăn</h1>
            <p style={{ fontSize: 14, color: '#64748B', marginTop: 8 }}>
              Chọn thực phẩm · Chọn bữa ăn · Lưu ngay
            </p>
          </motion.div>

          {/* Week date strip — shared for form + log */}
          <WeekStrip selected={activeDate} onChange={setActiveDate} datesWithMeals={datesWithMeals} />

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>

            {/* LEFT: Food list */}
            <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <div style={{
                background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden'
              }}>
                <div style={{ borderTop: '3px solid #10B981' }} />
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #F1F5F9', display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontSize: 18 }}>🍱</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#1E293B' }}>Chọn thực phẩm</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: '#94A3B8' }}>{foods.length} items</span>
                </div>
                <div style={{ padding: 14 }}>
                  {/* Search */}
                  <div style={{ position: 'relative', marginBottom: 12 }}>
                    <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 14 }}>
                      {searching ? '⏳' : '🔍'}
                    </span>
                    <input value={search} onChange={e => { setSearch(e.target.value); setSelectedFood(null); }}
                      placeholder="Tìm bằng tiếng Anh (e.g. chicken, rice...)"
                      style={{
                        width: '100%', padding: '8px 10px 8px 32px', border: '1px solid #E2E8F0',
                        borderRadius: 10, fontSize: 13, outline: 'none', fontFamily: 'inherit'
                      }} />
                  </div>

                  {/* Food list */}
                  <div style={{ maxHeight: 480, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {!search.trim() && foods.length === 0 && (
                      <div style={{ textAlign: 'center', padding: 28, color: '#CBD5E1', fontSize: 13 }}>
                        <div style={{ fontSize: 28, marginBottom: 8 }}>⏳</div>
                        Đang tải danh sách gợi ý…
                      </div>
                    )}
                    {!search.trim() && foods.length > 0 && (
                      <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 6, fontWeight: 600 }}>
                        ✨ Gợi ý hôm nay · Nhập tên để tìm thêm
                      </div>
                    )}
                    {search.trim() && !searching && foods.length === 0 && (
                      <div style={{ textAlign: 'center', padding: 24, color: '#CBD5E1', fontSize: 13 }}>
                        Không tìm thấy — thử từ khóa tiếng Anh
                      </div>
                    )}
                    {foods.map(f => (
                      <motion.div key={f.id} whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedFood(f)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                          border: `1px solid ${selectedFood?.id === f.id ? '#10B981' : '#E2E8F0'}`,
                          borderRadius: 10, cursor: 'pointer',
                          background: selectedFood?.id === f.id ? '#ECFDF5' : '#fff',
                          transition: 'all 0.15s',
                        }}>
                        <span style={{ fontSize: 24, width: 36, textAlign: 'center' }}>{getFoodIcon(f.name)}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#1E293B' }}>{f.name}</div>
                          <div style={{ display: 'flex', gap: 5, marginTop: 3, flexWrap: 'wrap' }}>
                            <MacroBadge label="P" value={`${f.protein}g`} color="#6366F1" />
                            <MacroBadge label="C" value={`${f.carbs}g`} color="#F59E0B" />
                            <MacroBadge label="F" value={`${f.fat}g`} color="#EF4444" />
                          </div>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#10B981', whiteSpace: 'nowrap' }}>
                          {f.calories} kcal
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* RIGHT: Form + Log */}
            <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Add meal card */}
              <div style={{
                background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden'
              }}>
                <div style={{ borderTop: '3px solid #6366F1' }} />
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #F1F5F9', display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontSize: 18 }}>➕</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#1E293B' }}>Thêm vào thực đơn</span>
                </div>
                <div style={{ padding: 16 }}>

                  {/* Selected preview */}
                  <AnimatePresence mode="wait">
                    {selectedFood ? (
                      <motion.div key="preview" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        style={{
                          background: '#ECFDF5', border: '1px solid #D1FAE5', borderRadius: 10,
                          padding: '10px 12px', marginBottom: 14
                        }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#065F46' }}>
                          {getFoodIcon(selectedFood.name)} {selectedFood.name}
                        </div>
                        {preview && (
                          <div style={{ fontSize: 11, color: '#059669', marginTop: 4 }}>
                            {quantity}g → {preview.calories} kcal · P: {preview.protein}g · C: {preview.carbs}g · F: {preview.fat}g
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        style={{ fontSize: 13, color: '#CBD5E1', marginBottom: 14, textAlign: 'center', padding: 8 }}>
                        ← Chọn thực phẩm từ danh sách
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Meal type */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{
                      fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase',
                      letterSpacing: '0.06em', marginBottom: 6
                    }}>Bữa ăn</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {MEAL_TYPES.map(m => (
                        <button key={m.key} onClick={() => setMealType(m.key)}
                          style={{
                            flex: 1, padding: '7px 0', border: `1px solid ${mealType === m.key ? '#6366F1' : '#E2E8F0'}`,
                            borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                            background: mealType === m.key ? '#EEF2FF' : '#fff',
                            color: mealType === m.key ? '#6366F1' : '#64748B'
                          }}>
                          <div>{m.icon}</div>
                          <div>{m.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity only — date now controlled by WeekStrip */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{
                      fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase',
                      letterSpacing: '0.06em', marginBottom: 5
                    }}>Số lượng (g)</div>
                    <input type="number" value={quantity} min={1}
                      onChange={e => setQuantity(parseFloat(e.target.value) || 100)}
                      style={{
                        width: '100%', padding: '8px 10px', border: '1px solid #E2E8F0',
                        borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit'
                      }} />
                    <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 5 }}>
                      📅 Lưu vào ngày <strong style={{ color: '#10B981' }}>{activeDate}</strong>
                    </div>
                  </div>

                  <motion.button whileTap={{ scale: 0.97 }} onClick={handleAdd} disabled={saving || !selectedFood}
                    style={{
                      width: '100%', padding: 12, border: 'none', borderRadius: 10,
                      fontSize: 14, fontWeight: 700, cursor: selectedFood ? 'pointer' : 'not-allowed',
                      background: selectedFood ? '#10B981' : '#D1FAE5', color: '#fff',
                      fontFamily: 'inherit', transition: 'all 0.2s',
                      boxShadow: selectedFood ? '0 4px 12px rgba(16,185,129,0.25)' : 'none'
                    }}>
                    {saving ? '⏳ Đang lưu…' : '✓ Lưu vào thực đơn'}
                  </motion.button>
                </div>
              </div>

              {/* Meal log card */}
              <div style={{
                background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden'
              }}>
                <div style={{ borderTop: '3px solid #F59E0B' }} />
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #F1F5F9', display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 18 }}>📋</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#1E293B' }}>Nhật ký bữa ăn</span>
                  <button onClick={loadLog}
                    style={{
                      marginLeft: 'auto', padding: '4px 10px', border: '1px solid #E2E8F0',
                      borderRadius: 6, fontSize: 11, cursor: 'pointer', background: '#fff', fontFamily: 'inherit'
                    }}>
                    Refresh
                  </button>
                </div>
                <div style={{ padding: 14 }}>
                  {/* Log header shows active date */}
                  <div style={{ fontSize: 12, color: '#64748B', marginBottom: 12, fontWeight: 500 }}>
                    📅 {activeDate}
                  </div>

                  {/* Log by meal type */}
                  {!hasMeals ? (
                    <div style={{ textAlign: 'center', padding: 20, color: '#CBD5E1', fontSize: 13 }}>
                      Chưa có bữa ăn nào
                    </div>
                  ) : ORDER.filter(t => log[t]?.length).map(t => {
                    const info = MEAL_TYPES.find(m => m.key === t);
                    return (
                      <div key={t} style={{ marginBottom: 12 }}>
                        <div style={{
                          fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase',
                          letterSpacing: '0.06em', marginBottom: 5
                        }}>{info.icon} {info.label}</div>
                        {log[t].map(m => (
                          <div key={m.id} style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '7px 10px', borderRadius: 8, marginBottom: 3,
                            border: '1px solid #F1F5F9', background: '#FAFAFA'
                          }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{
                                fontSize: 12, fontWeight: 600, color: '#1E293B', whiteSpace: 'nowrap',
                                overflow: 'hidden', textOverflow: 'ellipsis'
                              }}>{m.food_name}</div>
                              <div style={{ fontSize: 10, color: '#94A3B8' }}>{m.quantity_g}g · {m.calories} kcal</div>
                            </div>
                            <button onClick={() => openEdit(m)}
                              style={{
                                padding: '3px 8px', border: '1px solid #C7D2FE', borderRadius: 6,
                                fontSize: 11, cursor: 'pointer', background: '#EEF2FF', color: '#6366F1',
                                fontFamily: 'inherit'
                              }}>✏️</button>
                            <button onClick={() => handleDelete(m.id)}
                              style={{
                                padding: '3px 8px', border: '1px solid #FECACA', borderRadius: 6,
                                fontSize: 11, cursor: 'pointer', background: '#FEF2F2', color: '#DC2626',
                                fontFamily: 'inherit'
                              }}>✕</button>
                          </div>
                        ))}
                      </div>
                    );
                  })}

                  {/* Totals */}
                  {hasMeals && (
                    <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                      <TotalChip label="kcal" value={totals.calories} accent />
                      <TotalChip label="Protein" value={`${totals.protein}g`} />
                      <TotalChip label="Carbs" value={`${totals.carbs}g`} />
                      <TotalChip label="Fat" value={`${totals.fat}g`} />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
            style={{
              position: 'fixed', bottom: 24, right: 24, background: '#1E293B', color: '#fff',
              padding: '11px 18px', borderRadius: 12, fontSize: 13, fontWeight: 600,
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)', zIndex: 9999
            }}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingMeal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setEditingMeal(null)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: 20
            }}>
            <motion.div
              initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: '#fff', borderRadius: 18, width: '100%', maxWidth: 380,
                boxShadow: '0 24px 60px rgba(0,0,0,0.25)', overflow: 'hidden'
              }}>
              <div style={{ borderTop: '3px solid #6366F1' }} />
              <div style={{
                padding: '16px 20px', borderBottom: '1px solid #F1F5F9',
                display: 'flex', alignItems: 'center', gap: 10
              }}>
                <span style={{ fontSize: 18 }}>✏️</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1E293B' }}>Chỉnh sửa bữa ăn</div>
                  <div style={{ fontSize: 12, color: '#94A3B8' }}>{editingMeal.food_name}</div>
                </div>
                <button onClick={() => setEditingMeal(null)}
                  style={{
                    marginLeft: 'auto', background: 'none', border: 'none',
                    fontSize: 20, cursor: 'pointer', color: '#94A3B8', lineHeight: 1
                  }}>×</button>
              </div>
              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Meal type */}
                <div>
                  <div style={{
                    fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase',
                    letterSpacing: '0.06em', marginBottom: 6
                  }}>Bữa ăn</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {MEAL_TYPES.map(m => (
                      <button key={m.key} onClick={() => setEditType(m.key)}
                        style={{
                          flex: 1, padding: '7px 4px', border: `1px solid ${editType === m.key ? '#6366F1' : '#E2E8F0'}`,
                          borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                          background: editType === m.key ? '#EEF2FF' : '#fff',
                          color: editType === m.key ? '#6366F1' : '#64748B'
                        }}>
                        <div>{m.icon}</div>
                        <div style={{ marginTop: 2 }}>{m.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
                {/* Quantity */}
                <div>
                  <div style={{
                    fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase',
                    letterSpacing: '0.06em', marginBottom: 5
                  }}>Số lượng (g)</div>
                  <input type="number" value={editQty} min={1} onChange={e => setEditQty(parseFloat(e.target.value) || 100)}
                    style={{
                      width: '100%', padding: '9px 12px', border: '1px solid #E2E8F0',
                      borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit'
                    }} />
                </div>
                {/* Date */}
                <div>
                  <div style={{
                    fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase',
                    letterSpacing: '0.06em', marginBottom: 5
                  }}>Ngày</div>
                  <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)}
                    style={{
                      width: '100%', padding: '9px 12px', border: '1px solid #E2E8F0',
                      borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit'
                    }} />
                </div>
                {/* Actions */}
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button onClick={() => setEditingMeal(null)}
                    style={{
                      flex: 1, padding: 10, border: '1px solid #E2E8F0', borderRadius: 10,
                      fontSize: 13, fontWeight: 600, cursor: 'pointer', background: '#fff',
                      color: '#64748B', fontFamily: 'inherit'
                    }}>Huỷ</button>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={handleUpdate} disabled={updating}
                    style={{
                      flex: 2, padding: 10, border: 'none', borderRadius: 10,
                      fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                      background: '#6366F1', color: '#fff',
                      boxShadow: '0 4px 12px rgba(99,102,241,0.25)'
                    }}>
                    {updating ? '⏳ Đang lưu…' : '✓ Cập nhật'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 720px) {
          div[style*="grid-template-columns: 1fr 380px"] {
            grid-template-columns: 1fr !important;
          }
        }
        input:focus { border-color: #6366F1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.1) !important; }
      `}</style>
    </div>
  );
}
