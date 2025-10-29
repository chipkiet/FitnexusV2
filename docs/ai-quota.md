AI Quota Enforcement

- Scope: Backend AI endpoints in `packages/backend/routes/nutrition.routes.js` and `packages/backend/routes/trainer.routes.js`.
- Behavior:
  - guest/Free: 5 calls per week per feature.
  - premium/admin: unlimited.
- Identity:
  - If authenticated, usage tracked per `user_id`.
  - If anonymous, usage tracked by salted hash of IP + User-Agent (no PII stored).

Configuration (packages/backend/.env):
- `AI_QUOTA_ENABLED` (1|0): turn enforcement on/off (default 1)
- `AI_QUOTA_FREE_LIMIT` (number): weekly limit for FREE/guest (default 5)
- `AI_QUOTA_SALT`: salt for anonymous hash (set per environment)

Storage:
- Table `ai_usage` with unique key `(user_id, anon_key, feature, period_key)`.
- Model: `packages/backend/models/ai.usage.model.js`
- Migration: `packages/backend/migrations/20251028145000-create-ai-usage.js`

Applied Features:
- Nutrition plan: `POST /api/nutrition/plan` and `POST /api/nutrition/plan/from-onboarding` (feature key `nutrition_plan`).
- Trainer image analysis: `POST /api/trainer/upload` (feature key `trainer_image_analyze`).

Error Shape (HTTP 429):
```
{ "success": false, "code": "AI_QUOTA_EXCEEDED", "message": "Weekly quota reached for <feature>. Upgrade to PREMIUM for unlimited access." }
```

