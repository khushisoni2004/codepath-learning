import { useState } from "react";
import { API_URL } from "../config/api";
import "../styles/verification.css";

export default function AdminVerification() {
  const [adminKey, setAdminKey] = useState("");
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function loadRegistrations(event) {
    if (event) event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`${API_URL}/admin/payments`, {
        headers: { "x-admin-key": adminKey },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Unable to load registrations.");
      setRegistrations(data.registrations || []);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(registrationId, action) {
    setMessage("");
    try {
      const response = await fetch(`${API_URL}/admin/payments/${registrationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({ action: action === "approve" ? "verify" : "reject" }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Update failed.");
      setRegistrations((current) => current.map((item) => item.registrationId === registrationId ? data.registration : item));
      setMessage(action === "approve" ? `${registrationId} verified.` : `${registrationId} rejected.`);
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <main className="admin-verify-page">
      <section className="admin-verify-shell">
        <div className="admin-verify-heading">
          <span>PRIVATE ADMIN PAGE</span>
          <h1>Payment Verification</h1>
          <p>Check the UTR in your UPI or bank app first. Approve only after the payment amount and transaction reference match.</p>
        </div>

        <form className="admin-key-form" onSubmit={loadRegistrations}>
          <input type="password" value={adminKey} onChange={(event) => setAdminKey(event.target.value)} placeholder="Enter admin key" required />
          <button type="submit" disabled={loading}>{loading ? "Loading..." : "Open Records"}</button>
        </form>

        {message && <div className="admin-message">{message}</div>}

        <div className="admin-registration-list">
          {registrations.map((item) => (
            <article className="admin-registration-card" key={item.registrationId}>
              <div className="admin-registration-main">
                <strong>{item.registrationId}</strong>
                <h3>{item.studentName}</h3>
                <p>{item.course} · {item.plan}</p>
                <small>UTR: {item.utrNumber || "Not submitted"}</small>
              </div>
              <div className="admin-registration-status">
                <span>{item.paymentStatus}</span>
                <div>
                  <button type="button" className="admin-approve" onClick={() => updateStatus(item.registrationId, "approve")}>Approve</button>
                  <button type="button" className="admin-reject" onClick={() => updateStatus(item.registrationId, "reject")}>Reject</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
