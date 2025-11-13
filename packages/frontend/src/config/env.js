const backendUrl = (import.meta.env?.VITE_BACKEND_URL || "").trim();
const appDownloadUrl = (import.meta.env?.VITE_APP_DOWNLOAD_URL || "").trim();

if (!backendUrl) {
  throw new Error(
    "[env] Missing VITE_BACKEND_URL. Please set it in your .env file."
  );
}

if (!appDownloadUrl) {
  throw new Error(
    "[env] Missing VITE_APP_DOWNLOAD_URL. Please set it in your .env file."
  );
}

export const env = {
  backendUrl,
  appDownloadUrl,
};
