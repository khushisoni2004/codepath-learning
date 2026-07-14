import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { loadRazorpay, paymentApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import ReceiptModal from "./ReceiptModal";
import "../styles/payment-modal.css";

const PAYMENT_FORM_URL = "https://docs.google.com/forms/d/1ex_D0DxLnx9hY1zRRR1X7CgwgnK9dXrpbnXVu7fLvDM/viewform";

export default function PaymentModal({ course, paid, onPaid }) {
  const { user: student } = useAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState("details");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [utrNumber, setUtrNumber] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [manualPayment, setManualPayment] = useState(null);
  const submittingRef = useRef(false);
  const [details, setDetails] = useState({
    name: student?.studentName || "",
    email: student?.email || "",
    phone: student?.phone || "",
  });

  useEffect(() => {
    if (!open && !receipt) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [open, receipt]);

  useEffect(() => {
    if (!open || step !== "pending") return undefined;
    let cancelled = false;
    const poll = async () => {
      try {
        const data = await paymentApi(`/manual-status/${course.slug}`);
        if (cancelled) return;
        setManualPayment(data.payment);
        if (data.payment?.status === "PAID" && data.payment.receipt) {
          onPaid(course.slug);
          setOpen(false);
          setReceipt(data.payment.receipt);
        } else if (data.payment?.status === "FAILED") {
          setStep("qr");
          setError("Payment verification was rejected. Check the UTR and submit a valid transaction.");
        }
      } catch {
        // A temporary polling error must not change access or payment state.
      }
    };
    const timer = window.setInterval(poll, 8000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [open, step, course.slug, onPaid]);

  function openCheckout() {
    setError("");
    setStep("details");
    setManualPayment(null);
    setOpen(true);
  }

  function continueToPaymentMethods(event) {
    event.preventDefault();
    if (!details.name.trim() || !details.email.trim() || !/^\d{10}$/.test(details.phone.trim())) {
      setError("Please enter your name, email and a valid 10-digit phone number.");
      return;
    }
    setError("");
    setStep("method");
  }

  async function payWithRazorpay() {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);
    setError("");
    try {
      if (!(await loadRazorpay())) throw new Error("Unable to load Razorpay Checkout.");
      const order = await paymentApi("/create-order", {
        method: "POST",
        body: JSON.stringify({ courseSlug: course.slug }),
      });
      if (order.alreadyPaid) { onPaid(course.slug); setOpen(false); return; }

      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "CodePath Learning",
        description: `${order.course.title} Certificate Plan`,
        order_id: order.orderId,
        prefill: { name: details.name.trim(), email: details.email.trim(), contact: details.phone.trim() },
        notes: { courseSlug: order.course.slug, courseTitle: order.course.title },
        theme: { color: "#4f46e5" },
        handler: async (response) => {
          try {
            const verified = await paymentApi("/verify", {
              method: "POST",
              body: JSON.stringify({ courseSlug: course.slug, ...response }),
            });
            onPaid(course.slug);
            setReceipt(verified.receipt);
          } catch (verificationError) {
            setError(verificationError.message);
            setStep("method");
            setOpen(true);
          }
        },
      });
      razorpay.on("payment.failed", (response) => {
        setError(response.error?.description || "Payment was not completed.");
        setStep("method");
        setOpen(true);
      });
      setOpen(false);
      razorpay.open();
    } catch (requestError) {
      setError(requestError.message);
      setOpen(true);
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  }

  async function openQrPayment() {
    setStep("qr");
    setError("");
    setChecking(true);
    try {
      const data = await paymentApi(`/manual-status/${course.slug}`);
      setManualPayment(data.payment);
      if (data.payment?.status === "PAID" && data.payment.receipt) {
        onPaid(course.slug);
        setOpen(false);
        setReceipt(data.payment.receipt);
      } else if (data.payment?.status === "PENDING") {
        setStep("pending");
      }
    } catch {
      // No previous QR submission is the normal first-payment state.
    } finally {
      setChecking(false);
    }
  }

  async function submitQrPayment(event) {
    event.preventDefault();
    const normalizedUtr = utrNumber.trim().toUpperCase().replace(/\s+/g, "");
    if (!/^[A-Z0-9-]{6,40}$/.test(normalizedUtr) || !formSubmitted) {
      setError("First submit the Google Form, then enter a valid UPI transaction ID/UTR.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await paymentApi("/manual-submit", {
        method: "POST",
        body: JSON.stringify({ courseSlug: course.slug, utrNumber: normalizedUtr, googleFormSubmitted: true }),
      });
      if (data.alreadyPaid) { onPaid(course.slug); setOpen(false); return; }
      setManualPayment(data.payment);
      setStep("pending");
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setLoading(false);
    }
  }

  async function checkPaymentNow() {
    setChecking(true);
    setError("");
    try {
      const data = await paymentApi(`/manual-status/${course.slug}`);
      setManualPayment(data.payment);
      if (data.payment?.status === "PAID" && data.payment.receipt) {
        onPaid(course.slug);
        setOpen(false);
        setReceipt(data.payment.receipt);
      } else if (data.payment?.status === "FAILED") {
        setStep("qr");
        setError("Payment verification was rejected. Check the UTR and submit a valid transaction.");
      }
    } catch (statusError) {
      setError(statusError.message);
    } finally {
      setChecking(false);
    }
  }

  return <>
    <button type="button" className={`buy-course-button ${paid ? "paid" : ""}`} onClick={openCheckout} disabled={paid || loading}>
      {paid ? "Paid Course" : loading ? "Please wait..." : "Buy Now"}
    </button>
    {createPortal(<>
      {open && <div className="payment-overlay" role="dialog" aria-modal="true" aria-label={`Buy ${course.title}`}>
        <section className={`payment-modal ${step === "qr" ? "payment-modal-wide" : ""}`}>
          <button className="payment-close" type="button" onClick={() => setOpen(false)} aria-label="Close">×</button>

          {!student ? <>
            <h2>Login Required</h2>
            <p>Please register or login before purchasing this course.</p>
            <div className="payment-actions"><Link to="/login">Login</Link><Link to="/register">Register</Link></div>
          </> : null}

          {student && step === "details" ? <form className="enrollment-form" onSubmit={continueToPaymentMethods}>
            <span className="payment-step-label">STEP 1 OF 2</span>
            <h2>Enroll in {course.title}</h2>
            <p>Confirm your details before choosing a secure payment option.</p>
            <label>Student Name<input type="text" value={details.name} onChange={(event) => setDetails({ ...details, name: event.target.value })} required /></label>
            <label>Email Address<input type="email" value={details.email} onChange={(event) => setDetails({ ...details, email: event.target.value })} required /></label>
            <label>Phone Number<input type="tel" inputMode="numeric" maxLength="10" value={details.phone} onChange={(event) => setDetails({ ...details, phone: event.target.value.replace(/\D/g, "") })} required /></label>
            {error ? <p className="payment-error" role="alert">{error}</p> : null}
            <button className="payment-primary" type="submit">Continue to Payment</button>
          </form> : null}

          {student && step === "method" ? <div className="payment-method-step">
            <span className="payment-step-label">STEP 2 OF 2</span>
            <h2>Choose Payment Method</h2>
            <p>Course fee: <strong>₹599</strong></p>
            <div className="payment-method-grid">
              <button type="button" className="payment-method-card razorpay-card" onClick={payWithRazorpay} disabled={loading}>
                <span className="payment-method-icon">R</span><strong>Razorpay</strong>
                <small>Automatic verification</small><em>Instant course unlock + receipt</em>
              </button>
              <button type="button" className="payment-method-card qr-card" onClick={openQrPayment} disabled={checking}>
                <span className="payment-method-icon">QR</span><strong>CODEPATH LEARNING QR</strong>
                <small>Direct UPI payment</small><em>Manual bank verification required</em>
              </button>
            </div>
            <div className="payment-security-note">🔒 A screenshot or form submission alone never unlocks a course.</div>
            {error ? <p className="payment-error" role="alert">{error}</p> : null}
            <button className="payment-back" type="button" onClick={() => setStep("details")}>← Back to details</button>
          </div> : null}

          {student && step === "qr" ? <form className="qr-payment-step" onSubmit={submitQrPayment}>
            <span className="payment-step-label">CODEPATH LEARNING QR</span>
            <h2>Pay ₹599 with UPI</h2>
            <div className="qr-payment-layout">
              <div className="qr-payment-image-wrap"><img src="/QR.jpg" alt="CodePath Learning UPI payment QR code" /><strong>Scan with any UPI app</strong></div>
              <div className="qr-payment-instructions">
                <ol><li>Scan and complete the ₹599 payment.</li><li>Open the secure form and upload payment screenshot with student details.</li><li>Enter the same UTR below for backend verification.</li></ol>
                <a href={PAYMENT_FORM_URL} target="_blank" rel="noopener noreferrer">Open Payment Details Form ↗</a>
                <small className="qr-form-login-note">Google sign-in is required by Google Forms for secure screenshot upload.</small>
                <label>UPI Transaction ID / UTR<input type="text" autoComplete="off" maxLength="40" value={utrNumber} onChange={(event) => setUtrNumber(event.target.value.toUpperCase().replace(/\s/g, ""))} placeholder="Enter exact UTR from bank app" required /></label>
                <label className="qr-confirmation"><input type="checkbox" checked={formSubmitted} onChange={(event) => setFormSubmitted(event.target.checked)} /><span>I submitted the Google Form with screenshot, name, number and student/registration ID.</span></label>
              </div>
            </div>
            <div className="payment-security-note warning">Course remains locked until the UTR is matched in the bank and approved.</div>
            {error ? <p className="payment-error" role="alert">{error}</p> : null}
            <button className="payment-primary" type="submit" disabled={loading}>{loading ? "Submitting securely…" : "Submit UTR for Verification"}</button>
            <button className="payment-back" type="button" onClick={() => setStep("method")}>← Choose another method</button>
          </form> : null}

          {student && step === "pending" ? <div className="manual-payment-pending">
            <div className="manual-pending-icon">⌛</div>
            <span className="payment-step-label">BANK VERIFICATION PENDING</span>
            <h2>Payment submitted securely</h2>
            <p>We will unlock <strong>{course.title}</strong> only after the UTR matches the received bank payment.</p>
            <div className="manual-payment-summary"><span>UTR</span><strong>{manualPayment?.utrNumber || utrNumber}</strong><span>Status</span><strong>{manualPayment?.status || "PENDING"}</strong></div>
            <div className="payment-security-note warning">Screenshot received ≠ payment verified. Access and receipt remain locked.</div>
            {error ? <p className="payment-error" role="alert">{error}</p> : null}
            <button className="payment-primary" type="button" onClick={checkPaymentNow} disabled={checking}>{checking ? "Checking bank approval…" : "Check Payment Status"}</button>
            <small className="manual-auto-check">This page also checks automatically every few seconds.</small>
          </div> : null}
        </section>
      </div>}
      <ReceiptModal receipt={receipt} onClose={() => setReceipt(null)} />
    </>, document.body)}
  </>;
}
