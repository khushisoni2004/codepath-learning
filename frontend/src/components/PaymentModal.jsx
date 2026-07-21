import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { paymentApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import ReceiptModal from "./ReceiptModal";
import "../styles/payment-modal.css";

export default function PaymentModal({ course, paid, onPaid }) {
  const { user: student } = useAuth();
  const studentId = student?.id;
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState("details");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [utrNumber, setUtrNumber] = useState("");
  const [payerUpiId, setPayerUpiId] = useState("");
  const [manualPayment, setManualPayment] = useState(null);
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
    if (!studentId || paid) return undefined;
    let cancelled = false;
    paymentApi(`/manual-status/${course.slug}`)
      .then((data) => {
        if (cancelled) return;
        setManualPayment(data.payment);
        if (data.payment?.status === "PAID") onPaid(course.slug);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [studentId, paid, course.slug, onPaid]);

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
    setStep(manualPayment?.status === "PENDING" ? "pending" : "details");
    if (manualPayment?.status !== "PENDING") setManualPayment(null);
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
    const normalizedUpiId = payerUpiId.trim().toLowerCase().replace(/\s+/g, "");
    if (!/^\d{12}$/.test(normalizedUtr)) {
      setError("Enter the valid 12-digit UPI reference number (UTR/RRN) shown after payment.");
      return;
    }
    if (normalizedUpiId && !/^[a-z0-9._-]{2,100}@[a-z0-9.-]{2,64}$/.test(normalizedUpiId)) {
      setError("Enter a valid UPI ID, for example name@bank.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await paymentApi("/manual-submit", {
        method: "POST",
        body: JSON.stringify({ courseSlug: course.slug, utrNumber: normalizedUtr, payerUpiId: normalizedUpiId }),
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
    <button type="button" className={`buy-course-button ${paid ? "paid" : manualPayment?.status === "PENDING" ? "pending" : ""}`} onClick={openCheckout} disabled={paid || loading}>
      {paid ? "Paid Course" : manualPayment?.status === "PENDING" ? "Verification Pending" : loading ? "Please wait..." : "Buy Now"}
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
            <h2>Pay with CODEPATH LEARNING QR</h2>
            <p>Course fee: <strong>₹599</strong></p>
            <div className="payment-method-grid">
              <button type="button" className="payment-method-card qr-card" onClick={openQrPayment} disabled={checking}>
                <span className="payment-method-icon">QR</span><strong>CODEPATH LEARNING QR</strong>
                <small>Direct UPI payment</small><em>Manual bank verification required</em>
              </button>
            </div>
            <div className="payment-security-note">🔒 QR payments are unlocked only after the bank transaction is verified.</div>
            {error ? <p className="payment-error" role="alert">{error}</p> : null}
            <button className="payment-back" type="button" onClick={() => setStep("details")}>← Back to details</button>
          </div> : null}

          {student && step === "qr" ? <form className="qr-payment-step" onSubmit={submitQrPayment}>
            <span className="payment-step-label">CODEPATH LEARNING QR</span>
            <h2>Pay ₹599 with UPI</h2>
            <div className="qr-payment-layout">
              <div className="qr-payment-image-wrap"><img src="/payment-qr.png" alt="CodePath Learning UPI payment QR code" /><strong>Scan with any UPI app</strong></div>
              <div className="qr-payment-instructions">
                <ol><li>On a laptop, scan the QR using your phone.</li><li>On a phone, save the QR and select it from the gallery inside your UPI app.</li><li>Pay ₹599, then copy and enter the transaction ID/UTR below.</li></ol>
                <a href="/payment-qr.png" download="codepath-learning-payment-qr.png">Save QR to Phone</a>
                <small className="qr-mobile-payment-note">GPay / PhonePe / Paytm: Scan QR → Gallery → select the saved QR. No screenshot needs to be submitted to CodePath Learning.</small>
                <small className="qr-alternative-note">Payment proof required: enter the 12-digit UPI reference number.</small>
                <label>Your UPI ID (Optional)<input type="text" autoComplete="off" maxLength="165" value={payerUpiId} onChange={(event) => setPayerUpiId(event.target.value.toLowerCase().replace(/\s/g, ""))} placeholder="Example: yourname@okaxis" /></label>
                <label>12-digit UPI Reference Number / UTR (Required)<input type="text" inputMode="numeric" autoComplete="off" maxLength="12" value={utrNumber} onChange={(event) => setUtrNumber(event.target.value.replace(/\D/g, ""))} placeholder="Enter 12-digit reference number" required /></label>
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
            <h2>Verification pending — payment not confirmed</h2>
            <p>Your request is recorded. We will unlock <strong>{course.title}</strong> only after the UTR and ₹599 credit match the bank statement.</p>
            <div className="manual-payment-summary"><span>UPI ID</span><strong>{manualPayment?.payerUpiId || payerUpiId || "Not provided"}</strong><span>UTR</span><strong>{manualPayment?.utrNumber || utrNumber || "Not provided"}</strong><span>Status</span><strong>{manualPayment?.status || "PENDING"}</strong></div>
            <div className="payment-security-note warning">UTR submitted ≠ payment verified. Access and receipt remain locked until admin approval.</div>
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
