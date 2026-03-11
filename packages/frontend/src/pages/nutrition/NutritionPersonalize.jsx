import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api, { endpoints } from '../../lib/api';
import './NutritionAI.css';
import HeaderLogin from '../../components/header/HeaderLogin.jsx';
import { useAuth } from '../../context/auth.context.jsx';
import { renderMarkdown } from '../../lib/markdown.js';
import ScreenshotCapture from '../../components/screenshot/ScreenshotCapture.jsx';

// ─── Data ─────────────────────────────────────────────────────────────────────

const GOALS = [
  {
    key: 'LOSE_WEIGHT',
    icon: '🔥',
    label: 'Giảm cân',
    labelEn: 'Fat Loss',
    desc: 'Giảm mỡ bền vững, giữ khối cơ',
    tip: 'Ăn đủ protein (1.6–2g/kg) giúp bạn no lâu và giữ cơ khi cắt calo.',
    chipColor: '#2563EB',
    chipBg: '#EFF6FF',
    chipBorder: '#BFDBFE',
  },
  {
    key: 'GAIN_WEIGHT',
    icon: '💪',
    label: 'Tăng cân',
    labelEn: 'Muscle Gain',
    desc: 'Tăng khối lượng cơ, bổ sung năng lượng',
    tip: 'Thặng dư 250–500 kcal/ngày là lý tưởng để tăng cơ mà không tăng mỡ quá nhiều.',
    chipColor: '#16A34A',
    chipBg: '#F0FDF4',
    chipBorder: '#BBF7D0',
  },
  {
    key: 'MAINTAIN',
    icon: '⚖️',
    label: 'Giữ cân',
    labelEn: 'Maintenance',
    desc: 'Duy trì vóc dáng và sức khỏe ổn định',
    tip: 'Ăn đúng TDEE giúp duy trì cân nặng trong khi vẫn cung cấp đủ dinh dưỡng.',
    chipColor: '#D97706',
    chipBg: '#FFFBEB',
    chipBorder: '#FDE68A',
  },
];

const SUGGESTION_CHIPS = [
  'Ăn chay',
  'Dị ứng hải sản',
  'Không gluten',
  'Không ăn tối sau 8h',
  'Ngân sách 100k/ngày',
  '4 bữa/ngày',
  'Tập gym buổi sáng',
  'Ít nấu ăn',
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function GoalCard({ goal, selected, onClick }) {
  const g = GOALS.find(x => x.key === goal.key);
  return (
    <motion.button
      layout
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onClick(goal.key)}
      aria-pressed={selected}
      style={{
        width: '100%', textAlign: 'left', padding: '14px 16px', borderRadius: '14px',
        cursor: 'pointer', border: `2px solid ${selected ? g.chipColor : '#E2E8F0'}`,
        background: selected ? g.chipBg : '#FFFFFF',
        boxShadow: selected ? `0 0 0 4px ${g.chipColor}18` : '0 1px 3px rgba(0,0,0,0.06)',
        transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Checkmark badge */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key="check"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 20 }}
            style={{
              position: 'absolute', top: 10, right: 10,
              width: 20, height: 20, borderRadius: '50%',
              background: g.chipColor, color: '#fff',
              fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700,
            }}
          >
            ✓
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10, flexShrink: 0,
          background: selected ? `${g.chipColor}18` : '#F8FAFC',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
        }}>
          {goal.icon}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: selected ? g.chipColor : '#1E293B' }}>
            {goal.label}
          </div>
          <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 1 }}>{goal.desc}</div>
        </div>
      </div>
    </motion.button>
  );
}

function TipCard({ goalKey }) {
  const g = GOALS.find(x => x.key === goalKey);
  if (!g) return null;
  return (
    <motion.div
      key={goalKey}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      style={{
        padding: '12px 14px', borderRadius: '12px',
        background: g.chipBg, border: `1px solid ${g.chipBorder}`,
        display: 'flex', gap: 10, alignItems: 'flex-start',
      }}
    >
      <span style={{ fontSize: 16, marginTop: 1 }}>💡</span>
      <p style={{ margin: 0, fontSize: 13, color: '#475569', lineHeight: 1.6 }}>{g.tip}</p>
    </motion.div>
  );
}

function SuggestionChip({ label, onClick, used }) {
  return (
    <motion.button
      whileTap={{ scale: 0.93 }}
      whileHover={{ y: -1 }}
      onClick={() => onClick(label)}
      style={{
        padding: '5px 12px', borderRadius: '999px', fontSize: 12, fontWeight: 500,
        border: `1px solid ${used ? '#10B981' : '#E2E8F0'}`,
        background: used ? '#ECFDF5' : '#F8FAFC',
        color: used ? '#059669' : '#475569',
        cursor: 'pointer', transition: 'all 0.15s ease',
      }}
    >
      {used ? `✓ ${label}` : `+ ${label}`}
    </motion.button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NutritionPersonalize() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [goal, setGoal] = useState('LOSE_WEIGHT');
  const [extra, setExtra] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [plan, setPlan] = useState('');
  const [usedChips, setUsedChips] = useState(new Set());
  const [showHelper, setShowHelper] = useState(false);
  const containerRef = useRef(null);
  const textareaRef = useRef(null);

  const disabled = useMemo(() => !goal || loading, [goal, loading]);
  const selectedGoalData = GOALS.find(g => g.key === goal);

  const handleChip = (label) => {
    setUsedChips(prev => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
        setExtra(e => e.replace(`, ${label}`, '').replace(label, '').replace(/^,\s*/, '').trim());
      } else {
        next.add(label);
        setExtra(e => e ? `${e.trimEnd()}, ${label}` : label);
      }
      return next;
    });
    textareaRef.current?.focus();
  };

  const submit = async () => {
    try {
      setLoading(true);
      setError(null);
      setPlan('');
      const res = await api.post(endpoints.nutrition.plan, { goal, extra });
      const data = res?.data?.data || res?.data || {};
      if (data.offTopic) {
        setError('Tôi chỉ được thiết kế để lên kế hoạch dinh dưỡng');
        return;
      }
      const text = data.text || data.plan || data.response || '';
      setPlan(String(text || 'Không có nội dung.'));
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Không thể tạo kế hoạch dinh dưỡng';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', color: '#0F172A' }}>
      <HeaderLogin />

      <ScreenshotCapture
        targetRef={containerRef}
        feature="nutrition_ai"
        disabled={!plan}
        description="Ảnh kết quả Nutrition AI"
      />

      <main ref={containerRef} style={{ maxWidth: 960, margin: '0 auto', padding: '88px 20px 80px' }}>

        {/* ── Page title + progress ───────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: 36 }}
        >
          {/* Breadcrumb / back */}
          <button
            onClick={() => navigate('/nutrition-ai')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 18,
              fontSize: 13, color: '#94A3B8', background: 'none', border: 'none',
              cursor: 'pointer', padding: 0, fontFamily: 'inherit',
            }}
          >
            <span style={{ fontSize: 16 }}>←</span> Dinh dưỡng AI
          </button>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                Tạo kế hoạch dinh dưỡng
              </h1>
              <p style={{ margin: '6px 0 0', fontSize: 14, color: '#64748B' }}>
                Trả lời 2 câu hỏi — AI sẽ tạo kế hoạch ăn uống phù hợp với bạn.
              </p>
            </div>

            {/* Step progress */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {[1, 2].map(i => (
                <React.Fragment key={i}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%', fontSize: 12, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: '#10B981', color: '#fff',
                    }}>{i}</div>
                    <span style={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>
                      {i === 1 ? 'Mục tiêu' : 'Chi tiết'}
                    </span>
                  </div>
                  {i < 2 && <div style={{ width: 28, height: 2, background: '#E2E8F0', borderRadius: 2 }} />}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ height: 3, background: '#E2E8F0', borderRadius: 4, marginTop: 16, overflow: 'hidden' }}>
            <motion.div
              initial={{ width: '50%' }}
              animate={{ width: plan ? '100%' : '50%' }}
              transition={{ duration: 0.5 }}
              style={{ height: '100%', background: '#10B981', borderRadius: 4 }}
            />
          </div>
        </motion.div>

        {/* ── Two-panel layout ────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 340px) 1fr', gap: 24, alignItems: 'start' }}>

          {/* ── LEFT: Goal selection ─────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            style={{ position: 'sticky', top: 96 }}
          >
            <div style={{
              background: '#FFFFFF', borderRadius: 18, border: '1px solid #E2E8F0',
              boxShadow: '0 2px 12px rgba(15,23,42,0.06)', overflow: 'hidden',
            }}>
              <div style={{ height: 3, background: '#10B981' }} />
              <div style={{ padding: '20px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94A3B8', marginBottom: 4 }}>
                      Bước 1
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1E293B' }}>Chọn mục tiêu</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {GOALS.map(g => (
                    <GoalCard
                      key={g.key}
                      goal={g}
                      selected={goal === g.key}
                      onClick={setGoal}
                    />
                  ))}
                </div>

                {/* Contextual tip */}
                <div style={{ marginTop: 14 }}>
                  <AnimatePresence mode="wait">
                    <TipCard key={goal} goalKey={goal} />
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── RIGHT: Details + CTA ─────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            {/* Details card */}
            <div style={{
              background: '#FFFFFF', borderRadius: 18, border: '1px solid #E2E8F0',
              boxShadow: '0 2px 12px rgba(15,23,42,0.06)', overflow: 'hidden',
            }}>
              <div style={{ height: 3, background: '#6366F1' }} />
              <div style={{ padding: '20px 20px 24px' }}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94A3B8', marginBottom: 4 }}>
                    Bước 2
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1E293B' }}>Thêm thông tin cá nhân</div>
                  <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 3 }}>Tuỳ chọn — AI sẽ cá nhân hoá kế hoạch theo thông tin này</div>
                </div>

                {/* Suggestion chips */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 8 }}>Gợi ý nhanh</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {SUGGESTION_CHIPS.map(chip => (
                      <SuggestionChip
                        key={chip}
                        label={chip}
                        onClick={handleChip}
                        used={usedChips.has(chip)}
                      />
                    ))}
                  </div>
                </div>

                {/* Textarea */}
                <div style={{ position: 'relative' }}>
                  <textarea
                    ref={textareaRef}
                    rows={5}
                    placeholder="Ví dụ: dị ứng tôm, ăn chay, không ăn sau 8h, ngân sách 100k/ngày…"
                    value={extra}
                    onChange={e => setExtra(e.target.value)}
                    style={{
                      width: '100%', boxSizing: 'border-box', padding: '12px 14px',
                      borderRadius: 12, border: '1px solid #E2E8F0',
                      fontSize: 14, color: '#334155', background: '#F8FAFC',
                      resize: 'vertical', outline: 'none', fontFamily: 'inherit', lineHeight: 1.7,
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                    }}
                    onFocus={e => { e.target.style.borderColor = '#6366F1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; }}
                    onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; }}
                  />
                  <div style={{ position: 'absolute', bottom: 10, right: 12, fontSize: 11, color: '#CBD5E1' }}>
                    {extra.length} ký tự
                  </div>
                </div>

                {/* Collapse helper */}
                <div style={{ marginTop: 10 }}>
                  <button
                    onClick={() => setShowHelper(v => !v)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      fontSize: 12, color: '#94A3B8', background: 'none',
                      border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit',
                    }}
                  >
                    <motion.span
                      animate={{ rotate: showHelper ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ display: 'inline-block', fontSize: 10 }}
                    >
                      ▶
                    </motion.span>
                    Nên ghi gì ở đây?
                  </button>

                  <AnimatePresence>
                    {showHelper && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{
                          marginTop: 10, padding: '12px 14px', borderRadius: 10,
                          background: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: 13, color: '#475569', lineHeight: 1.7,
                        }}>
                          <b style={{ color: '#1E293B' }}>Các thông tin hữu ích:</b>
                          <ul style={{ margin: '6px 0 0', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <li>Dị ứng hoặc thực phẩm không ăn được</li>
                            <li>Chế độ ăn: chay, thuần chay, keto, paleo…</li>
                            <li>Số bữa ăn mỗi ngày</li>
                            <li>Ngân sách ăn uống</li>
                            <li>Lịch tập luyện (buổi sáng/tối)</li>
                            <li>Bất kỳ điều gì bạn muốn AI biết thêm</li>
                          </ul>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* ── CTA card ───────────────────────────────── */}
            <div style={{
              background: '#FFFFFF', borderRadius: 18, border: '1px solid #E2E8F0',
              boxShadow: '0 2px 12px rgba(15,23,42,0.06)', padding: '18px 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
            }}>
              {/* Summary */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10, background: selectedGoalData?.chipBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0,
                }}>
                  {selectedGoalData?.icon}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1E293B' }}>{selectedGoalData?.label}</div>
                  <div style={{ fontSize: 12, color: '#94A3B8' }}>
                    {extra ? `+ ${[...usedChips].length || Math.ceil(extra.split(',').length)} thông tin bổ sung` : 'Chưa có thông tin thêm'}
                  </div>
                </div>
              </div>

              {/* Button */}
              <motion.button
                whileHover={!disabled ? { y: -2, boxShadow: '0 8px 24px rgba(16,185,129,0.36)' } : {}}
                whileTap={!disabled ? { scale: 0.97 } : {}}
                onClick={submit}
                disabled={disabled}
                style={{
                  padding: '12px 28px', borderRadius: '999px', fontSize: 14, fontWeight: 700,
                  border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
                  background: disabled ? '#E2E8F0' : '#10B981',
                  color: disabled ? '#9CA3AF' : '#FFFFFF',
                  boxShadow: disabled ? 'none' : '0 4px 16px rgba(16,185,129,0.28)',
                  transition: 'background 0.2s, box-shadow 0.2s',
                  display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
                }}
              >
                {loading ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.85, ease: 'linear' }}
                      style={{
                        display: 'inline-block', width: 16, height: 16,
                        border: '2px solid rgba(255,255,255,0.35)', borderTop: '2px solid #fff', borderRadius: '50%',
                      }}
                    />
                    Đang tạo kế hoạch…
                  </>
                ) : (
                  <>✨ Tạo kế hoạch ngay</>
                )}
              </motion.button>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    padding: '12px 16px', borderRadius: 12,
                    background: '#FEF2F2', border: '1px solid #FECACA',
                    color: '#DC2626', fontSize: 14, display: 'flex', gap: 8, alignItems: 'flex-start',
                  }}
                >
                  <span>⚠️</span> {error}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* ── Result card ─────────────────────────────────── */}
        <AnimatePresence>
          {plan && (
            <motion.div
              key="plan"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
              style={{
                marginTop: 24, background: '#FFFFFF', borderRadius: 18,
                border: '1px solid #E2E8F0', boxShadow: '0 4px 24px rgba(15,23,42,0.08)',
                overflow: 'hidden',
              }}
            >
              <div style={{ height: 3, background: '#6366F1' }} />
              <div style={{ padding: '22px 28px' }}>
                {/* Result header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                    style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: '#EEF2FF', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0,
                    }}
                  >
                    {selectedGoalData?.icon}
                  </motion.div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 16, fontWeight: 700, color: '#1E293B', margin: 0 }}>Kế hoạch dinh dưỡng của bạn</p>
                    <p style={{ fontSize: 12, color: '#94A3B8', margin: '2px 0 0' }}>
                      Mục tiêu: {selectedGoalData?.label} · Tạo bởi AI
                    </p>
                  </div>
                  <div style={{
                    padding: '4px 12px', borderRadius: '999px',
                    background: '#ECFDF5', border: '1px solid #D1FAE5',
                    color: '#059669', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
                  }}>
                    ✓ Hoàn thành
                  </div>
                </div>

                <div style={{ height: 1, background: '#F1F5F9', marginBottom: 18 }} />

                <div
                  className="markdown-body"
                  style={{ lineHeight: 1.8, maxHeight: '70vh', overflowY: 'auto', fontSize: 14, color: '#334155' }}
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(plan) }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Responsive: mobile single column ─────────────── */}
      <style>{`
        @media (max-width: 720px) {
          main > div:nth-child(2) {
            grid-template-columns: 1fr !important;
          }
          main > div:nth-child(2) > div:first-child {
            position: static !important;
          }
        }
      `}</style>
    </div>
  );
}
