import { useState } from "react";
import { Link } from "react-router-dom";
import logoIcon from "../assets/codepath-learning-logo2.png";
import { API_URL } from "../config/api";
import { apiFetch } from "../services/api";
import "../styles/login.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [student, setStudent] = useState(null);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setStudent(null);

    try {
      if (!form.email.trim()) {
        throw new Error("Please enter your registered email.");
      }

      if (!form.password) {
        throw new Error("Please enter your password.");
      }

      const response = await apiFetch(`${API_URL}/registrations/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "No registration found.");
      }

      setStudent(data);
      localStorage.setItem("codepathStudent", JSON.stringify(data));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (requestError) {
      setError(
        requestError instanceof TypeError
          ? "Backend is not running. Please start backend on port 5001."
          : requestError.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-section">
        <div className="login-bg login-bg-one" />
        <div className="login-bg login-bg-two" />

        <div className="container login-split-layout">
          <div className="login-left-panel">
            <div className="login-brand-row">
              <img src={logoIcon} alt="CodePath Learning logo" />
              <div>
                <strong>CodePath Learning</strong>
                <span>Learn • Practice • Build</span>
              </div>
            </div>

            

            <h1>
              <span className="login-title-dark">Login to</span>
              <span className="login-title-gradient"> View Details</span>
            </h1>

            <p>
              Use your registered email and password to view your course registration.
            </p>

            <div className="login-small-points">
              <span>Registration ID</span>
              <span>Course Details</span>
              <span>Status Check</span>
            </div>
          </div>

          <div className="login-card">
            {!student ? (
              <form onSubmit={handleSubmit}>
                <div className="login-card-title">
                  <h2>Student Login</h2>
                  <p>No need to register again.</p>
                </div>

                <label>
                  Email Address
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="student@example.com"
                    required
                  />
                </label>

                <label>
                  Password
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    required
                  />
                </label>

                {error && <div className="login-error">{error}</div>}

                <button type="submit" disabled={loading}>
                  {loading ? "Checking..." : "Login"}
                  <span>→</span>
                </button>

                <div className="login-bottom-link">
                  New student? <Link to="/register">Register here</Link>
                </div>
              </form>
            ) : (
              <div className="login-result">
                <div className="login-success-icon">✓</div>
                <span className="login-success-label">LOGIN SUCCESSFUL</span>
                <h2>{student.studentName}</h2>
                <p>Your registration details</p>

                <div className="login-registration-list">
                  {student.registrations.map((item) => (
                    <article key={item.registrationId}>
                      <div>
                        <span>Registration ID</span>
                        <strong>{item.registrationId}</strong>
                      </div>

                      <div>
                        <span>Course</span>
                        <strong>{item.course}</strong>
                      </div>

                      <div>
                        <span>Plan</span>
                        <strong>{item.plan}</strong>
                      </div>

                      <div>
                        <span>Payment Status</span>
                        <strong>{item.paymentStatus}</strong>
                      </div>

                      <div>
                        <span>Enrollment Status</span>
                        <strong>{item.enrollmentStatus}</strong>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="login-actions">
                  <Link to="/verify">Verify Registration</Link>
                  <button type="button" onClick={() => setStudent(null)}>
                    Login Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
