import { useState } from "react";
import { API_URL } from "../config/api";
import "../styles/verification.css";

export default function CertificateAdmin() {
  const [key, setKey] = useState("");
  const [form, setForm] = useState({ studentName: "", course: "", issueDate: new Date().toISOString().slice(0, 10), completionDate: new Date().toISOString().slice(0, 10), instructor: "CodePath Learning" });
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");
  function update(event) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })); }
  async function create(event) { event.preventDefault(); setMessage(""); setResult(null); try { const response = await fetch(`${API_URL}/certificates`, { method: "POST", headers: { "Content-Type": "application/json", "X-Admin-Key": key }, body: JSON.stringify(form) }); const data = await response.json(); if (!response.ok) throw new Error(data.message || "Unable to generate certificate."); setResult(data.certificate); } catch (error) { setMessage(error.message); } }
  const verificationUrl = result?.verificationUrl || (result ? `${window.location.origin}/verify/${result.certificateId}` : "");

  return (
    <main className="verify-page">
      <section className="verify-card">
        <span className="verify-kicker">PRIVATE CERTIFICATE ADMIN</span>
        <h1>Generate Certificate ID</h1>
        <p>Each certificate receives an atomic, unique ID saved in the backend database.</p>

        <form className="verify-form" onSubmit={create}>
          <input type="password" value={key} onChange={(event) => setKey(event.target.value)} placeholder="Admin key" required />
          {Object.entries(form).map(([name, value]) => (
            <input key={name} name={name} value={value} onChange={update} placeholder={name.replace(/([A-Z])/g, " $1")} type={name.toLowerCase().includes("date") ? "date" : "text"} required />
          ))}
          <button type="submit">Generate &amp; Save Certificate</button>
        </form>

        {message ? <div className="verify-result verify-invalid"><strong>{message}</strong></div> : null}

        {result ? (
          <div className="verify-result verify-valid certificate-admin-result">
            <strong>Certificate generated</strong>
            <div className="certificate-admin-result-grid">
              <dl>
                <div>
                  <dt>Certificate ID</dt>
                  <dd>{result.certificateId}</dd>
                </div>
                <div>
                  <dt>Verify URL</dt>
                  <dd><a href={verificationUrl} target="_blank" rel="noreferrer">{verificationUrl}</a></dd>
                </div>
              </dl>
              {result.qrUrl ? (
                <div className="certificate-admin-qr">
                  <img src={result.qrUrl} alt="Certificate verification QR" />
                  <span>Scan to verify</span>
                </div>
              ) : null}
            </div>
            <p>Share this ID, QR and verification URL with the student.</p>
          </div>
        ) : null}
      </section>
    </main>
  );
}
