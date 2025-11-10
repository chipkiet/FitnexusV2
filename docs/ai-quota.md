AI quota quick guide

Scope
nutrition routes and trainer routes on backend

Behavior
free or guest limited per period
premium or admin unlimited

Identity
authenticated tracked by user_id
anonymous tracked by salted hash of ip and user agent

Config in packages/backend/.env
AI_QUOTA_ENABLED 1 to enable 0 to disable
AI_QUOTA_FREE_LIMIT number of calls for free or guest
AI_QUOTA_SALT random string for anonymous hashing

Storage
table ai_usage unique key user_id anon_key feature period_key
model packages/backend/models/ai.usage.model.js
migration packages/backend/migrations/20251028145000-create-ai-usage.js

Feature keys and endpoints
nutrition_plan  POST /api/nutrition/plan  POST /api/nutrition/plan/from-onboarding
trainer_image_analyze  POST /api/trainer/upload

Error on limit
http 429
success false
code AI_QUOTA_EXCEEDED
message text explains quota reached

