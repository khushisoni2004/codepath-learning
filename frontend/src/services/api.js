import { API_URL } from "../config/api";

const REQUEST_TIMEOUT_MS = 20000;

export async function apiFetch(url, options = {}) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error("Backend request timed out. Please try again.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

export function getStudent() {
  try { return JSON.parse(localStorage.getItem("codepathStudent")); } catch { return null; }
}

export async function paymentApi(path, options = {}) {
  const student = getStudent();
  const response = await apiFetch(`${API_URL}/payments${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(student?.token ? { Authorization: `Bearer ${student.token}` } : {}),
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Payment request failed.");
  return data;
}

export function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const script = document.createElement("script");
    const timeout = window.setTimeout(() => resolve(false), 20000);
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => { window.clearTimeout(timeout); resolve(true); };
    script.onerror = () => { window.clearTimeout(timeout); resolve(false); };
    document.body.appendChild(script);
  });
}
