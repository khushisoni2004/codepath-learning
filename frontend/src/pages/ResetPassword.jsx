import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { API_URL } from "../config/api";
import { apiFetch } from "../services/api";
import "../styles/login.css";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const token = searchParams.get("token") || "";

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(""); setSuccess("");
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords must match.");
      return;
    }
    if (!token) {
      setError("Unable to reset password. The link may be invalid or expired.");
      return;
    }

    setLoading(true);
    try {
      const response = await apiFetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: form.password, confirmPassword: form.confirmPassword }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Unable to reset password. The link may be invalid or expired.");
      localStorage.removeItem("codepathAuthToken");
      localStorage.removeItem("codepathStudent");
      setSuccess(data.message || "Password reset successful. You can now log in with your new password.");
      setForm({ password: "", confirmPassword: "" });
    } catch (requestError) {
      setError(requestError.message);
    } finally { setLoading(false); }
  }

  return <main className="login-page"><section className="login-section">
    <div className="login-bg login-bg-one" /><div className="login-bg login-bg-two" />
    <div className="container reset-password-layout">
      <div className="login-card reset-password-card">
        <form onSubmit={handleSubmit}>
          <div className="login-card-title"><h2>Reset Password</h2><p>Choose a new password for your account.</p></div>
          <label>New Password<input type="password" name="password" value={form.password} onChange={handleChange} minLength="8" autoComplete="new-password" required /></label>
          <label>Confirm Password<input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} minLength="8" autoComplete="new-password" required /></label>
          {error && <div className="login-error" role="alert">{error}</div>}
          {success && <div className="forgot-message" role="status">{success}</div>}
          {!success && <button type="submit" disabled={loading}>{loading ? "Resetting..." : "Reset Password"}</button>}
          <div className="login-bottom-link"><Link to="/login">Back to Login</Link></div>
        </form>
      </div>
    </div>
  </section></main>;
}
