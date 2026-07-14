import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logoIcon from "../assets/codepath-learning-logo2.png";
import { API_URL } from "../config/api";
import { apiFetch } from "../services/api";
import "../styles/registration.css";

const initialForm = {
  studentName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  collegeName: "",
  course: "",
  plan: "Complete Learning Plan - ₹599",
};

const courseOptions = [
  "Web Development",
  "Python Programming",
  "C Programming",
  "MySQL Database",
  "Vibe Coding with AI",
  "AI Tools for Smart Projects",
];

export default function Registration() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registration, setRegistration] = useState(null);
  const { registerAccount, refreshUser } = useAuth();

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function getWhatsAppMessage() {
    if (!registration) return "";

    return encodeURIComponent(
`CodePath Learning Registration Successful ✅

Student Name: ${registration.studentName}
Registration ID: ${registration.registrationId}
Course: ${registration.course}
Plan: ${registration.plan}
Email: ${registration.email}
WhatsApp: ${registration.phone}

Please keep this Registration ID safe for login and verification.`
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (form.password.length < 8) throw new Error("Password must be at least 8 characters.");
      if (form.password !== form.confirmPassword) throw new Error("Password and confirm password do not match.");
      if (!/^\d{10}$/.test(form.phone.trim())) throw new Error("Please enter a valid 10-digit mobile number.");

      await registerAccount({
        name: form.studentName.trim(),
        email: form.email.trim(),
        mobile: form.phone.trim(),
        password: form.password,
      });

      const response = await apiFetch(`${API_URL}/registrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: form.studentName.trim(), email: form.email.trim(), phone: form.phone.trim(),
          collegeName: form.collegeName.trim(), course: form.course, plan: form.plan,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Registration failed.");

      await refreshUser();
      setRegistration(data.registration);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (requestError) {
      setError(
        requestError instanceof TypeError
          ? "Backend is not running. Start backend on port 5001 and submit again."
          : requestError.message
      );
    } finally {
      setLoading(false);
    }
  }

  if (registration) {
    return (
      <main className="registration-page">
        <section className="registration-success-card">
          <img src={logoIcon} alt="CodePath Learning logo" className="registration-success-logo" />

          <div className="registration-success-icon">✓</div>
          <span className="registration-kicker">REGISTRATION SUCCESSFUL</span>

          <h1>Your Registration is Created</h1>
          <p>
            Your details are saved successfully. Keep your Registration ID safe
            for login and verification.
          </p>

          <div className="registration-id-box">
            <span>Your Registration ID</span>
            <strong>{registration.registrationId}</strong>
          </div>

          <div className="registration-summary">
            <div>
              <span>Student Name</span>
              <strong>{registration.studentName}</strong>
            </div>

            <div>
              <span>Email</span>
              <strong>{registration.email}</strong>
            </div>

            <div>
              <span>WhatsApp</span>
              <strong>{registration.phone}</strong>
            </div>

            <div>
              <span>Course</span>
              <strong>{registration.course}</strong>
            </div>

            <div>
              <span>Plan</span>
              <strong>{registration.plan}</strong>
            </div>

            <div>
              <span>Status</span>
              <strong>{registration.enrollmentStatus || "Registered"}</strong>
            </div>
          </div>

          <div className="registration-success-actions">
            <a
              href={`https://wa.me/?text=${getWhatsAppMessage()}`}
              target="_blank"
              rel="noreferrer"
              className="registration-whatsapp-button"
            >
              Share on WhatsApp
            </a>

            <Link to="/verify">Verify Registration</Link>
            <Link to="/login" className="registration-light-button">Student Login</Link>

            <button
              type="button"
              className="registration-light-button"
              onClick={() => {
                setRegistration(null);
                setForm(initialForm);
              }}
            >
              New Registration
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="registration-page">
      <section className="container registration-layout">
        <div className="registration-intro">
          <span className="registration-kicker">STUDENT ENROLLMENT</span>

          <h1>
            Start learning with
            <span> CodePath Learning.</span>
          </h1>

          <p>
            Fill this form to generate your unique registration ID. Your details
            will be saved for login and verification.
          </p>

          <div className="registration-feature-list">
            <div>
              <span>✓</span>
              <p>
                <strong>Live Classes</strong>
                <small>Beginner-friendly Google Meet sessions</small>
              </p>
            </div>

            <div>
              <span>✓</span>
              <p>
                <strong>Notes and Assignments</strong>
                <small>Structured learning with practical tasks</small>
              </p>
            </div>

            <div>
              <span>✓</span>
              <p>
                <strong>Registration ID</strong>
                <small>Use it for login and verification</small>
              </p>
            </div>
          </div>
        </div>

        <form className="registration-form" onSubmit={handleSubmit}>
          <div className="registration-form-heading">
            <span>ENROLLMENT FORM</span>
            <h2>Enter Student Details</h2>
            <p>Fields marked with * are required.</p>
          </div>

          <div className="registration-form-grid">
            <label className="registration-full-field">
              Full Name *
              <input
                name="studentName"
                value={form.studentName}
                onChange={handleChange}
                placeholder="Enter full name"
                required
              />
            </label>

            <label>
              Email Address *
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
              WhatsApp Number *
              <input
                type="tel"
                inputMode="numeric"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="10-digit number"
                maxLength="10"
                required
              />
            </label>

            <label>
              Password *
              <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Minimum 8 characters" minLength="8" required />
            </label>

            <label>
              Confirm Password *
              <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Re-enter password" minLength="8" required />
            </label>

            <label className="registration-full-field">
              College Name
              <input
                name="collegeName"
                value={form.collegeName}
                onChange={handleChange}
                placeholder="Enter college name"
              />
            </label>

            <label>
              Select Course *
              <select name="course" value={form.course} onChange={handleChange} required>
                <option value="">Choose course</option>
                {courseOptions.map((course) => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </label>

            <label>
              Select Plan *
              <select name="plan" value={form.plan} onChange={handleChange} required>
                <option value="Complete Learning Plan - ₹599">
                  Complete Learning Plan – ₹599
                </option>
              </select>
            </label>
          </div>

          {error && <div className="registration-error">{error}</div>}

          <button className="registration-submit" type="submit" disabled={loading}>
            {loading ? "Saving Registration..." : "Generate Registration ID"}
            <span>→</span>
          </button>

          <p className="registration-form-note">
            Already registered? <Link to="/login">Login here</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
