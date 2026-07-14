import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config/api";
import { apiFetch } from "../services/api";
import logoIcon from "../assets/codepath-learning-logo2.png";
import "../styles/login.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [student, setStudent] = useState(null);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");
  const { login } = useAuth();

  useEffect(() => {
    if (!forgotOpen) return undefined;
    function closeOnEscape(event) {
      if (event.key === "Escape") setForgotOpen(false);
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [forgotOpen]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true); setError(""); setStudent(null);
    try {
      const profile = await login(form.email.trim(), form.password);
      setStudent(profile);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (requestError) {
      setError(requestError.message);
    } finally { setLoading(false); }
  }

  function openForgotPassword() {
    setForgotEmail(form.email.trim());
    setForgotMessage("");
    setForgotOpen(true);
  }

  async function handleForgotPassword(event) {
    event.preventDefault();
    setForgotLoading(true); setForgotMessage("");
    try {
      const response = await apiFetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });
      const data = await response.json().catch(() => ({}));
      setForgotMessage(data.message || "If an account exists with this email, a reset link has been sent.");
    } catch {
      setForgotMessage("If an account exists with this email, a reset link has been sent.");
    } finally { setForgotLoading(false); }
  }

  return <main className="login-page"><section className="login-section">
    <div className="login-bg login-bg-one" /><div className="login-bg login-bg-two" />
    <div className="container login-split-layout">
      <div className="login-left-panel">
        <div className="login-brand-row"><img src={logoIcon} alt="CodePath Learning logo" /><div><strong>CodePath Learning</strong><span>Learn • Practice • Build</span></div></div>
        <h1><span className="login-title-dark">Login to</span><span className="login-title-gradient"> View Details</span></h1>
        <p>Use your registered email and password to view your course registration.</p>
        <div className="login-small-points"><span>Registration ID</span><span>Course Details</span><span>Status Check</span></div>
      </div>
      <div className="login-card">
        {!student ? <form onSubmit={handleSubmit}>
          <div className="login-card-title"><h2>Student Login</h2><p>No need to register again.</p></div>
          <label>Email Address<input type="email" name="email" value={form.email} onChange={handleChange} placeholder="student@example.com" required /></label>
          <label>Password<input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Enter password" required /></label>
          <button className="forgot-password-link" type="button" onClick={openForgotPassword}>Forgot Password?</button>
          {error && <div className="login-error">{error}</div>}
          <button type="submit" disabled={loading}>{loading ? "Checking..." : "Login"}<span>→</span></button>
          <div className="login-bottom-link">New student? <Link to="/register">Register here</Link></div>
        </form> : <div className="login-result">
          <div className="login-success-icon">✓</div><span className="login-success-label">LOGIN SUCCESSFUL</span><h2>{student.studentName || student.name}</h2><p>Your registration details</p>
          <div className="login-registration-list">{(student.registrations || []).map((item) => <article key={item.registrationId}>
            <div><span>Registration ID</span><strong>{item.registrationId}</strong></div><div><span>Course</span><strong>{item.course}</strong></div><div><span>Plan</span><strong>{item.plan}</strong></div><div><span>Enrollment Status</span><strong>{item.enrollmentStatus}</strong></div>
          </article>)}</div>
          <div className="login-actions"><Link to="/verify">Verify Registration</Link></div>
        </div>}
      </div>
    </div>
    {forgotOpen && <div className="forgot-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setForgotOpen(false); }}>
      <section className="forgot-modal" role="dialog" aria-modal="true" aria-labelledby="forgot-password-title">
        <button className="forgot-modal-close" type="button" aria-label="Close" onClick={() => setForgotOpen(false)}>×</button>
        <h2 id="forgot-password-title">Forgot Password?</h2>
        <p>Enter your registered email to receive a reset link.</p>
        <form onSubmit={handleForgotPassword}>
          <label>Email Address<input autoFocus type="email" value={forgotEmail} onChange={(event) => setForgotEmail(event.target.value)} placeholder="student@example.com" required /></label>
          {forgotMessage && <div className="forgot-message" role="status">{forgotMessage}</div>}
          <button type="submit" disabled={forgotLoading}>{forgotLoading ? "Sending..." : "Send Reset Link"}</button>
        </form>
      </section>
    </div>}
  </section></main>;
}
