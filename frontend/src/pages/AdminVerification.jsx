import { useState } from "react";
import { API_URL } from "../config/api";
import { apiFetch } from "../services/api";
import "../styles/verification.css";

export default function AdminVerification() {
  const [adminKey, setAdminKey] = useState("");
  const [registrations, setRegistrations] = useState([]);
  const [upiPayments, setUpiPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function loadRegistrations(event) {
    if (event) event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const headers = { "x-admin-key": adminKey };
      const [registrationResponse, upiResponse] = await Promise.all([
        apiFetch(`${API_URL}/admin/payments`, { headers }),
        apiFetch(`${API_URL}/admin/upi-payments`, { headers }),
      ]);
      const [registrationData, upiData] = await Promise.all([
        registrationResponse.json().catch(() => ({})),
        upiResponse.json().catch(() => ({})),
      ]);
      if (!registrationResponse.ok) throw new Error(registrationData.message || "Unable to load registrations.");
      if (!upiResponse.ok) throw new Error(upiData.message || "Unable to load QR payments.");
      setRegistrations(registrationData.registrations || []);
      setUpiPayments(upiData.payments || []);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateUpiPayment(paymentId, action) {
    setMessage("");
    try {
      const response = await apiFetch(`${API_URL}/admin/upi-payments/${paymentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({ action }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Payment update failed.");
      setUpiPayments((current) => current.map((item) => item._id === paymentId ? data.payment : item));
      setMessage(data.message);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function updateStatus(registrationId, action) {
    setMessage("");
    try {
      const response = await apiFetch(`${API_URL}/admin/payments/${registrationId}`, {
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

        <div className="admin-list-heading">
          <span>CODEPATH LEARNING QR</span>
          <h2>Direct UPI Payments</h2>
          <p>Match the exact UTR and ₹599 credit in the bank before approving. Screenshot alone is not proof of payment.</p>
        </div>

        <div className="admin-registration-list">
          {upiPayments.map((item) => (
            <article className="admin-registration-card" key={item._id}>
              <div className="admin-registration-main">
                <strong>{item.utrNumber}</strong>
                <h3>{item.studentName}</h3>
                <p>{item.courseTitle} · ₹{(item.amount / 100).toFixed(0)}</p>
                <small>{item.studentEmail} · {item.studentPhone || "No phone"}</small>
                <small>Submitted: {new Date(item.googleFormSubmittedAt || item.createdAt).toLocaleString()}</small>
                {item.receiptNumber ? <small>Receipt: {item.receiptNumber}</small> : null}
              </div>
              <div className="admin-registration-status">
                <span className={`admin-status-${item.status?.toLowerCase()}`}>{item.status}</span>
                {item.status !== "PAID" ? <div>
                  <button type="button" className="admin-approve" onClick={() => updateUpiPayment(item._id, "approve")}>Mark Paid</button>
                  <button type="button" className="admin-reject" onClick={() => updateUpiPayment(item._id, "reject")}>Reject</button>
                </div> : null}
              </div>
            </article>
          ))}
          {!loading && upiPayments.length === 0 ? <div className="admin-empty-state">No CODEPATH LEARNING QR submissions found.</div> : null}
        </div>

        <div className="admin-list-heading legacy-heading">
          <span>LEGACY RECORDS</span>
          <h2>Registration Payments</h2>
        </div>

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
