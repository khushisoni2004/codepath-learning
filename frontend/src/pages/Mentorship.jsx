import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config/api";
import { apiFetch } from "../services/api";
import "../styles/mentorship-page.css";

const WHATSAPP_GROUP_LINK = "https://chat.whatsapp.com/KpUzqv6sRx85XEj0KvySLB?s=cl&p=a&mlu=4&amv=3";
const TOPICS = ["Placement", "Internship", "Projects", "Resume Review", "Interview", "Career Guidance", "Higher Studies"];
const PAYMENT_QR = "/mentorship-qr.png";

const sourceUser = (user) => ({
  fullName: user?.name || user?.studentName || "",
  email: user?.email || "",
  topic: TOPICS[0],
});

export default function Mentorship() {
  const { user, loading } = useAuth();
  const [status, setStatus] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState(sourceUser(null));

  async function refreshStatus() {
    if (!user) return;
    const token = localStorage.getItem("codepathAuthToken");
    try {
      const response = await apiFetch(`${API_URL}/mentorship/status`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Unable to check placement status.");
      setStatus(data.booking);
    } catch (error) { setMessage(error.message); }
  }

  useEffect(() => { if (!loading && user) refreshStatus(); }, [loading, user]);
  useEffect(() => {
    if (!user) return undefined;
    const recheck = () => refreshStatus();
    window.addEventListener("pageshow", recheck);
    window.addEventListener("focus", recheck);
    return () => { window.removeEventListener("pageshow", recheck); window.removeEventListener("focus", recheck); };
  }, [user]);

  function openBooking() { setForm(sourceUser(user)); setMessage(""); setSubmitted(false); setFormOpen(true); }
  function updateField(event) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })); }

  async function submitBooking(event) {
    event.preventDefault();
    setMessage("");
    try {
      const token = localStorage.getItem("codepathAuthToken");
      const response = await apiFetch(`${API_URL}/mentorship/bookings`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ topic: form.topic }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Unable to submit mentorship request.");
      setStatus(data.booking); setSubmitted(true);
    } catch (error) { setMessage(error.message); }
  }

  return (
    <main className="mentorship-page">
      <section className="mentorship-page-hero"><div className="container mentorship-page-hero-content"><span className="mentorship-page-eyebrow">CAREER GUIDANCE</span><h1>One-to-One <span>Live Mentorship</span></h1><p>Get focused, practical guidance for placements, internships, projects, resumes, interviews and your next career step.</p></div></section>
      <section className="mentorship-page-section"><div className="container mentorship-page-grid"><div className="mentorship-page-intro"><span className="mentorship-page-label">PLACEMENT SUPPORT</span><h2>Guidance designed around your goal.</h2><p>Login to request a 40-minute live placement guidance session with our founders and co-founders. Payment is manual and confirmed only after placement admin verification.</p><div className="mentorship-page-points"><span>✓ Login required</span><span>✓ ₹399 for 40 minutes</span><span>✓ Manual payment review</span></div></div><div className="mentorship-access-card">{loading ? <p>Preparing your secure session…</p> : !user ? <><h3>Login to continue</h3><p>Login with your CodePath Learning account to view the placement guidance payment option.</p><Link to="/login" className="mentorship-page-button">Login to Continue <span>→</span></Link></> : <><div className="mentorship-page-icon">✦</div><h3>Live Placement Guidance with our Founders and Co-Founders</h3><p>40-minute focused session for placement preparation, internships, projects, resumes and interviews.</p>{status?.status === "PAID" ? <><div className="mentorship-approved">Payment approved. Your WhatsApp access is active.</div><a href={WHATSAPP_GROUP_LINK} target="_blank" rel="noreferrer" className="mentorship-whatsapp-button">Join Official WhatsApp Group <span>↗</span></a></> : <button type="button" className="mentorship-page-button" onClick={openBooking}>Buy Now · ₹399 <span>→</span></button>}</>}</div></div></section>
      {status && status.status !== "PAID" ? <section className="mentorship-status-section"><div className="container mentorship-status-card"><div><span className="mentorship-page-label">REQUEST STATUS</span><h2>{status.status === "REJECTED" ? "Payment requires review again" : "Booking request submitted"}</h2><p>{status.status === "REJECTED" ? "Your request was not approved. Please pay using the displayed QR and submit a new request." : "Our team will verify your manual payment. WhatsApp access will unlock only after admin approval."}</p></div><button type="button" onClick={refreshStatus} className="mentorship-outline-button">Check Verification Status</button></div></section> : null}
      {status?.status === "PAID" ? <section className="mentorship-approved-section"><div className="container mentorship-approved-card"><div><span className="mentorship-page-label">ACCESS APPROVED</span><h2>Placement mentorship is active.</h2><p>Meeting links and session schedules will be shared inside the official WhatsApp group after verification.</p></div><a href={WHATSAPP_GROUP_LINK} target="_blank" rel="noreferrer" className="mentorship-whatsapp-button">Join Official WhatsApp Group <span>↗</span></a></div></section> : null}
      {formOpen ? <div className="mentorship-page-overlay" role="dialog" aria-modal="true" aria-label="Book One-to-One Mentorship"><section className="mentorship-page-modal"><button type="button" className="mentorship-page-close" aria-label="Close" onClick={() => setFormOpen(false)}>×</button>{submitted ? <div className="mentorship-submitted"><div className="mentorship-check">✓</div><h2>Booking Request Submitted Successfully</h2><p>Our team will verify your payment and unlock WhatsApp access after approval.</p><button type="button" className="mentorship-outline-button" onClick={() => setFormOpen(false)}>Done</button></div> : <><span className="mentorship-page-label">PLACEMENT MENTORSHIP</span><h2>Live Placement Guidance · ₹399 / 40 Minutes</h2>{message ? <div className="mentorship-form-error">{message}</div> : null}<form onSubmit={submitBooking} className="mentorship-booking-form"><label>Logged-in Name<input name="fullName" value={form.fullName} readOnly /></label><label>Logged-in Email<input type="email" name="email" value={form.email} readOnly /></label><label>Preferred Topic<select name="topic" value={form.topic} onChange={updateField}>{TOPICS.map((topic) => <option value={topic} key={topic}>{topic}</option>)}</select></label><div className="mentorship-manual-payment"><span className="mentorship-page-label">MANUAL PAYMENT</span><strong>CodePath Learning</strong><img src={PAYMENT_QR} alt="CodePath Learning manual payment QR code" /><p>Amount: <b>₹399</b> · 40-minute session</p><small>No UPI ID, UTR or screenshot is required. Placement admin will verify the bank credit manually before unlocking WhatsApp access.</small></div><button className="mentorship-page-button" type="submit">I Have Paid — Submit for Verification <span>→</span></button></form></>}</section></div> : null}
    </main>
  );
}
