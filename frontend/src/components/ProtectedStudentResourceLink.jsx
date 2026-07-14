import { useId, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { paymentApi } from "../services/api";
import "../styles/payment-modal.css";

export default function ProtectedStudentResourceLink({ resource, className, children }) {
  const { user, loading } = useAuth();
  const titleId = useId();
  const [checking, setChecking] = useState(false);
  const [dialog, setDialog] = useState(null);

  async function openResource(event) {
    event.preventDefault();
    if (loading || checking) return;

    if (!user) {
      setDialog("login");
      return;
    }

    const resourceWindow = window.open("about:blank", "_blank");
    if (resourceWindow) resourceWindow.opener = null;
    setChecking(true);

    try {
      const data = await paymentApi(`/student-resource/${resource}`);
      if (resourceWindow) resourceWindow.location.replace(data.url);
      else window.location.assign(data.url);
    } catch (error) {
      resourceWindow?.close();
      setDialog(/login/i.test(error.message) ? "login" : "denied");
    } finally {
      setChecking(false);
    }
  }

  const modal = dialog ? (
    <div className="payment-overlay" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <section className="payment-modal">
        <button className="payment-close" type="button" onClick={() => setDialog(null)} aria-label="Close">×</button>
        <h2 id={titleId}>{dialog === "login" ? "Login Required" : "Access Denied"}</h2>
        <p>
          {dialog === "login"
            ? "Please login with your registered CodePath Learning account to continue."
            : "Only students who have purchased a course can access WhatsApp, Google Classroom and the enrollment form."}
        </p>
        <div className="payment-actions">
          {dialog === "login" ? <Link to="/login" onClick={() => setDialog(null)}>Login</Link> : null}
          <Link to="/courses" onClick={() => setDialog(null)}>View Courses</Link>
        </div>
      </section>
    </div>
  ) : null;

  return (
    <>
      <a href="/login" className={className} onClick={openResource} aria-busy={checking}>
        {checking ? "Checking access…" : children}
      </a>
      {modal ? createPortal(modal, document.body) : null}
    </>
  );
}
