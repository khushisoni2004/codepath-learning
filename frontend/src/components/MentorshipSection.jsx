import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { paymentApi } from "../services/api";
import { courseCatalog } from "../data/courseCatalog";
import "../styles/mentorship.css";

const WHATSAPP_GROUP_LINK = "https://chat.whatsapp.com/KpUzqv6sRx85XEj0KvySLB?s=cl&p=a&mlu=4&amv=3";
const topics = ["Placement", "Internship", "Projects", "Resume Review", "Interview", "Career Guidance", "Higher Studies"];

const initialForm = {
  fullName: "",
  email: "",
  mobile: "",
  courseSlug: "",
  topic: topics[0],
  date: "",
  time: "",
  notes: "",
  transactionId: "",
};

function courseTitle(slug) {
  return courseCatalog.find((course) => course.slug === slug)?.title || slug;
}

export default function MentorshipSection() {
  const { user, loading } = useAuth();
  const dialogTitleId = useId();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [checkingEligibility, setCheckingEligibility] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (loading) return undefined;
    if (!user) {
      setEnrolledCourses([]);
      setCheckingEligibility(false);
      return undefined;
    }

    let cancelled = false;
    setCheckingEligibility(true);
    paymentApi("/my-courses")
      .then((data) => {
        if (!cancelled) setEnrolledCourses(Array.isArray(data.paidCourses) ? data.paidCourses : []);
      })
      .catch(() => {
        if (!cancelled) setEnrolledCourses([]);
      })
      .finally(() => {
        if (!cancelled) setCheckingEligibility(false);
      });

    return () => { cancelled = true; };
  }, [loading, user]);

  function openBooking() {
    const firstCourse = enrolledCourses[0] || "";
    setForm({
      ...initialForm,
      fullName: user?.name || user?.studentName || "",
      email: user?.email || "",
      mobile: user?.mobile || user?.phone || "",
      courseSlug: firstCourse,
    });
    setSubmitted(false);
    setDialogOpen(true);
  }

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function submitBooking(event) {
    event.preventDefault();
    setSubmitted(true);
  }

  const modal = dialogOpen ? (
    <div className="mentorship-overlay" role="dialog" aria-modal="true" aria-labelledby={dialogTitleId}>
      <section className="mentorship-modal">
        <button className="mentorship-close" type="button" onClick={() => setDialogOpen(false)} aria-label="Close">×</button>
        {!submitted ? (
          <>
            <span className="mentorship-modal-label">CAREER GUIDANCE</span>
            <h2 id={dialogTitleId}>Book One-to-One Mentorship</h2>
            <p className="mentorship-modal-intro">Share your preferred schedule and topic. Our team will verify the manual payment before confirming your session.</p>

            <form className="mentorship-form" onSubmit={submitBooking}>
              <label>Full Name<input name="fullName" value={form.fullName} onChange={updateField} required /></label>
              <label>Email<input type="email" name="email" value={form.email} onChange={updateField} required /></label>
              <label>Mobile Number<input type="tel" name="mobile" value={form.mobile} onChange={updateField} required /></label>
              <label>Purchased Course<select name="courseSlug" value={form.courseSlug} onChange={updateField} required>{enrolledCourses.map((slug) => <option value={slug} key={slug}>{courseTitle(slug)}</option>)}</select></label>
              <label>Preferred Topic<select name="topic" value={form.topic} onChange={updateField}>{topics.map((topic) => <option value={topic} key={topic}>{topic}</option>)}</select></label>
              <div className="mentorship-form-row"><label>Preferred Date<input type="date" name="date" value={form.date} onChange={updateField} required /></label><label>Preferred Time<input type="time" name="time" value={form.time} onChange={updateField} required /></label></div>
              <label>Additional Notes <span>(Optional)</span><textarea name="notes" value={form.notes} onChange={updateField} rows="3" /></label>

              <div className="mentorship-payment-box">
                <div><span className="mentorship-payment-label">MANUAL PAYMENT</span><strong>CodePath Learning</strong></div>
                <p>UPI ID: <input aria-label="UPI ID placeholder" name="upiPlaceholder" placeholder="__________" readOnly /></p>
                <div className="mentorship-qr-placeholder" aria-label="QR code placeholder">QR Code<span>Placeholder image</span></div>
                <p>Amount <input aria-label="Amount placeholder" name="amountPlaceholder" placeholder="₹ ________" readOnly /></p>
                <label>Transaction ID <span>(Optional)</span><input name="transactionId" value={form.transactionId} onChange={updateField} placeholder="You may submit without it" /></label>
              </div>

              <button className="mentorship-submit" type="submit">Submit Booking Request</button>
            </form>
          </>
        ) : (
          <div className="mentorship-success" aria-live="polite">
            <div className="mentorship-success-icon">✓</div>
            <span className="mentorship-modal-label">REQUEST RECEIVED</span>
            <h2 id={dialogTitleId}>Booking Request Submitted Successfully</h2>
            <p>Our team will verify your payment.</p>
            <p>After verification, you will receive confirmation.</p>
            <a className="mentorship-whatsapp-button" href={WHATSAPP_GROUP_LINK} target="_blank" rel="noreferrer">Join Official WhatsApp Group <span>↗</span></a>
            <small>Meeting links, announcements and session schedules will be shared only inside the official CodePath Learning WhatsApp group after manual verification.</small>
            <button className="mentorship-done-button" type="button" onClick={() => setDialogOpen(false)}>Done</button>
          </div>
        )}
      </section>
    </div>
  ) : null;

  return (
    <section className="mentorship-section" aria-labelledby="mentorship-heading">
      <div className="container mentorship-container">
        <div className="mentorship-copy">
          <span className="mentorship-eyebrow">CAREER GUIDANCE</span>
          <h2 id="mentorship-heading">One-to-One Live Mentorship</h2>
          <p>Get focused guidance for placements, internships, projects and your next career step.</p>
        </div>
        <div className="mentorship-card">
          {checkingEligibility ? <p className="mentorship-status">Checking enrollment eligibility…</p> : enrolledCourses.length ? <><span className="mentorship-card-icon">✦</span><h3>Continue with personal guidance</h3><p>Book a focused session with a mentor for any of your purchased courses.</p><button className="mentorship-book-button" type="button" onClick={openBooking}>Book One-to-One Session <span>→</span></button></> : <><span className="mentorship-card-icon">i</span><h3>Mentorship is available for enrolled students</h3><p>You must be an enrolled CodePath Learning student to book a One-to-One Mentorship Session.</p><Link className="mentorship-book-button" to="/courses">Explore Courses <span>→</span></Link></>}
        </div>
      </div>
      {modal ? createPortal(modal, document.body) : null}
    </section>
  );
}
