import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { getStudent, loadRazorpay, paymentApi } from "../services/api";
import ReceiptModal from "./ReceiptModal";
import "../styles/payment-modal.css";

export default function PaymentModal({ course, paid, onPaid }) {
  const student = getStudent();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState(null);
  const submittingRef = useRef(false);
  const [details, setDetails] = useState({ name: student?.studentName || "", email: student?.email || "", phone: student?.phone || "" });

  useEffect(() => {
    if (!open && !receipt) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open, receipt]);

  async function enroll(event) {
    event.preventDefault();
    if (submittingRef.current) return;
    if (!details.name.trim() || !details.email.trim() || !/^\d{10}$/.test(details.phone.trim())) {
      setError("Please enter your name, email and a valid 10-digit phone number."); return;
    }
    submittingRef.current = true;
    setLoading(true); setError("");
    try {
      if (!(await loadRazorpay())) throw new Error("Unable to load Razorpay Checkout.");
      const order = await paymentApi("/create-order", { method: "POST", body: JSON.stringify({ courseSlug: course.slug }) });
      if (order.alreadyPaid) { onPaid(course.slug); setOpen(false); return; }
      const razorpay = new window.Razorpay({
        key: order.keyId, amount: order.amount, currency: order.currency, name: "CodePath Learning",
        description: `${order.course.title} Certificate Plan`, order_id: order.orderId,
        prefill: { name: details.name.trim(), email: details.email.trim(), contact: details.phone.trim() },
        notes: { courseSlug: order.course.slug, courseTitle: order.course.title }, theme: { color: "#4f46e5" },
        handler: async (response) => {
          try {
            const verified = await paymentApi("/verify", { method: "POST", body: JSON.stringify({ courseSlug: course.slug, ...response }) });
            onPaid(course.slug); setReceipt(verified.receipt);
          } catch (verifyError) { setError(verifyError.message); setOpen(true); }
        },
      });
      razorpay.on("payment.failed", (response) => { setError(response.error?.description || "Payment was not completed."); setOpen(true); });
      setOpen(false); razorpay.open();
    } catch (requestError) { setError(requestError.message); setOpen(true); }
    finally { submittingRef.current = false; setLoading(false); }
  }

  return <>
    <button type="button" className={`buy-course-button ${paid ? "paid" : ""}`} onClick={() => { setError(""); setOpen(true); }} disabled={paid || loading}>
      {paid ? "Paid Course" : loading ? "Please wait..." : "Buy Now"}
    </button>
    {createPortal(<>{open && <div className="payment-overlay" role="dialog" aria-modal="true"><section className="payment-modal">
      <button className="payment-close" type="button" onClick={() => setOpen(false)} aria-label="Close">×</button>
      {!student?.token ? <><h2>Login Required</h2><p>Please register or login before purchasing this course.</p><div className="payment-actions"><Link to="/login">Login</Link><Link to="/register">Register</Link></div></> :
        <form className="enrollment-form" onSubmit={enroll}>
          <h2>Enroll in {course.title}</h2><p>Confirm your details before opening the secure payment options.</p>
          <label>Student Name<input type="text" value={details.name} onChange={(e) => setDetails({ ...details, name: e.target.value })} required /></label>
          <label>Email Address<input type="email" value={details.email} onChange={(e) => setDetails({ ...details, email: e.target.value })} required /></label>
          <label>Phone Number<input type="tel" inputMode="numeric" maxLength="10" value={details.phone} onChange={(e) => setDetails({ ...details, phone: e.target.value.replace(/\D/g, "") })} required /></label>
          {error && <p className="payment-error">{error}</p>}
          <button className="payment-primary" type="submit" disabled={loading}>{loading ? "Opening Payment..." : "Enroll & Pay ₹599"}</button>
        </form>}
    </section></div>}
    <ReceiptModal receipt={receipt} onClose={() => setReceipt(null)} />
    </>, document.body)}
  </>;
}
