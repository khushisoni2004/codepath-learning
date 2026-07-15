import { useState } from "react";
import { API_URL } from "../config/api";
import { apiFetch } from "../services/api";
import "../styles/placement-admin.css";

const labels = { PENDING: "Pending Review", PAID: "Paid & Approved", REJECTED: "Rejected" };

export default function PlacementAdmin() {
  const [key, setKey] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function load(event) {
    event.preventDefault(); setLoading(true); setMessage("");
    try { const response = await apiFetch(`${API_URL}/admin/mentorship-bookings`, { headers: { "x-admin-key": key } }); const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.message || "Unable to load placement requests."); setBookings(data.bookings || []); }
    catch (error) { setMessage(error.message); } finally { setLoading(false); }
  }

  async function update(id, action) {
    setMessage("");
    try { const response = await apiFetch(`${API_URL}/admin/mentorship-bookings/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json", "x-admin-key": key }, body: JSON.stringify({ action }) }); const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.message || "Unable to update placement request."); setBookings((items) => items.map((item) => item._id === id ? data.booking : item)); setMessage(data.message); }
    catch (error) { setMessage(error.message); }
  }

  return <main className="placement-admin-page"><section className="placement-admin-shell"><div className="placement-admin-heading"><span>PRIVATE PLACEMENT ADMIN</span><h1>Placement Payment Verification</h1><p>Verify the ₹399 manual mentorship payment before approving WhatsApp access.</p></div><form className="placement-admin-key" onSubmit={load}><input type="password" value={key} onChange={(event) => setKey(event.target.value)} placeholder="Enter admin key" required /><button type="submit" disabled={loading}>{loading ? "Loading…" : "Open Placement Requests"}</button></form>{message ? <div className="placement-admin-message">{message}</div> : null}<div className="placement-admin-list">{bookings.map((booking) => <article className={`placement-admin-card placement-${booking.status.toLowerCase()}`} key={booking._id}><div><span className="placement-admin-record-label">MENTORSHIP REQUEST</span><h2>{booking.fullName}</h2><p>{booking.courseTitle} · {booking.topic}</p><dl><div><dt>Email</dt><dd>{booking.email}</dd></div><div><dt>Mobile</dt><dd>{booking.mobile}</dd></div><div><dt>Preferred schedule</dt><dd>{booking.preferredDate} at {booking.preferredTime}</dd></div><div><dt>UPI ID</dt><dd>{booking.payerUpiId || "Not provided"}</dd></div><div><dt>Transaction ID</dt><dd>{booking.transactionId || "Not provided"}</dd></div><div><dt>Notes</dt><dd>{booking.notes || "Not provided"}</dd></div><div><dt>Submitted</dt><dd>{new Date(booking.createdAt).toLocaleString()}</dd></div></dl></div><div className="placement-admin-actions"><span className={`placement-status placement-status-${booking.status.toLowerCase()}`}>{labels[booking.status] || booking.status}</span>{booking.status === "PENDING" ? <><button type="button" className="placement-approve" onClick={() => update(booking._id, "approve")}>✓ Mark Paid & Unlock</button><button type="button" className="placement-reject" onClick={() => update(booking._id, "reject")}>× Reject</button></> : null}{booking.status === "PAID" ? <small>WhatsApp access is active.</small> : null}</div></article>)}{!loading && bookings.length === 0 ? <div className="placement-admin-empty">No placement mentorship requests found.</div> : null}</div></section></main>;
}
