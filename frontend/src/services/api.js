const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5001/api").replace(/\/$/, "");

export function getStudent() {
  try { return JSON.parse(localStorage.getItem("codepathStudent")); } catch { return null; }
}

export async function paymentApi(path, options = {}) {
  const student = getStudent();
  const response = await fetch(`${API_URL}/payments${path}`, {
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
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}
