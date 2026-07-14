const configuredApiUrl = import.meta.env.VITE_API_URL;

if (import.meta.env.PROD && !configuredApiUrl) {
  throw new Error("VITE_API_URL is required for production builds.");
}

export const API_BASE_URL = (
  configuredApiUrl || "http://localhost:5001"
).replace(/\/$/, "");

export const API_URL = `${API_BASE_URL}/api`;
