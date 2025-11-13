import dotenv from "dotenv";

dotenv.config();

const warnMissing = (key) => {
  const message = `[ENV] Missing required variable ${key}`;
  console.error(message);
  throw new Error(message);
};

const getEnv = (key, { required = false, fallback = null } = {}) => {
  const value = process.env[key];
  if (value != null && value !== "") {
    return value.trim();
  }
  if (fallback != null) return fallback;
  if (required) warnMissing(key);
  return "";
};

export const FRONTEND_URL = getEnv("FRONTEND_URL", { required: true });
export const BACKEND_URL = getEnv("BACKEND_URL", { required: true });
export const FRONTEND_RESET_URL = getEnv("FRONTEND_RESET_URL", {
  fallback: `${FRONTEND_URL.replace(/\/$/, "")}/reset-password`,
});
export const AI_API_URL = getEnv("AI_API_URL", { required: true });
export const ADDITIONAL_CORS_ORIGINS = getEnv("ADDITIONAL_CORS_ORIGINS", {
  fallback: "",
});

export const REDIS_URL = (() => {
  const direct = getEnv("REDIS_URL");
  if (direct) return direct;
  const host = getEnv("REDIS_HOST");
  const port = getEnv("REDIS_PORT");
  if (host && port) {
    return `redis://${host}:${port}`;
  }
  warnMissing("REDIS_URL or REDIS_HOST/REDIS_PORT");
  return "";
})();
