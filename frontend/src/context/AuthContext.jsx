import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { API_URL } from "../config/api";
import { apiFetch } from "../services/api";

const AuthContext = createContext(null);
const TOKEN_KEY = "codepathAuthToken";

async function backendRequest(path, { method = "GET", body, token = localStorage.getItem(TOKEN_KEY) } = {}) {
  const response = await apiFetch(`${API_URL}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Unable to load account.");
  return data;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      if (!localStorage.getItem(TOKEN_KEY)) {
        setLoading(false);
        return;
      }
      try {
        const data = await backendRequest("/auth/me");
        setUser(data.user);
        localStorage.setItem("codepathStudent", JSON.stringify(data.user));
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem("codepathStudent");
      } finally { setLoading(false); }
    }
    restoreSession();
  }, []);

  function saveSession(data) {
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem("codepathStudent", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  async function login(email, password) {
    const data = await backendRequest("/auth/login", { method: "POST", body: { email, password }, token: null });
    return saveSession(data);
  }

  async function registerAccount(details) {
    const data = await backendRequest("/auth/register", { method: "POST", body: details, token: null });
    return saveSession(data);
  }

  async function refreshUser() {
    const data = await backendRequest("/auth/me");
    localStorage.setItem("codepathStudent", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    localStorage.removeItem("codepathStudent");
  }

  const value = useMemo(() => ({ user, loading, login, registerAccount, refreshUser, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
