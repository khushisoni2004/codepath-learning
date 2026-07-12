import { useState } from "react";
import logoIcon from "../assets/codepath-learning-logo2.png";
import "../styles/verification.css";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5001/api").replace(/\/$/, "");

export default function VerifyRegistration() {
  const [registrationId, setRegistrationId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    const id = registrationId.trim().toUpperCase();
    if (!id) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/registrations/verify/${encodeURIComponent(id)}`);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Registration not found.");
      }

      setResult(data);
    } catch (requestError) {
      setError(
        requestError instanceof TypeError
          ? "Backend is not running. Start backend on port 5001 and try again."
          : requestError.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="verify-page">
      <section className="verify-card">
        <img src={logoIcon} alt="CodePath Learning logo" className="verify-logo" />

        <span className="verify-kicker">REGISTRATION VERIFICATION</span>

        <h1>Check Registration Details</h1>

        <p>
          Enter your registration ID to verify student details saved with
          CodePath Learning.
        </p>

        <form className="verify-form" onSubmit={handleSubmit}>
          <input
            value={registrationId}
            onChange={(event) => setRegistrationId(event.target.value.toUpperCase())}
            placeholder="CPL-REG-2026-00001"
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Checking..." : "Verify"}
          </button>
        </form>

        {error && (
          <div className="verify-result verify-invalid">
            <strong>Not Found</strong>
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="verify-result verify-valid">
            <div className="verify-status-icon">✓</div>
            <strong>Registration Found</strong>
            <p>This registration ID exists in CodePath Learning records.</p>

            <dl>
              <div>
                <dt>Registration ID</dt>
                <dd>{result.registration.registrationId}</dd>
              </div>

              <div>
                <dt>Student Name</dt>
                <dd>{result.registration.studentName}</dd>
              </div>

              <div>
                <dt>Course</dt>
                <dd>{result.registration.course}</dd>
              </div>

              <div>
                <dt>Plan</dt>
                <dd>{result.registration.plan}</dd>
              </div>

              <div>
                <dt>Status</dt>
                <dd>{result.registration.enrollmentStatus}</dd>
              </div>
            </dl>
          </div>
        )}
      </section>
    </main>
  );
}
