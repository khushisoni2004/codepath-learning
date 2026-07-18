import { useState } from "react";
import { useParams } from "react-router-dom";
import { API_URL } from "../config/api";
import "../styles/verification.css";

export default function VerifyCertificate() {
  const { certificateId = "" } = useParams();
  const [value, setValue] = useState(certificateId.toUpperCase());
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  async function verify(event) { event.preventDefault(); if (!value.trim()) return; setLoading(true); setResult(null); try { const response = await fetch(`${API_URL}/certificates/verify/${encodeURIComponent(value.trim())}`); const data = await response.json(); setResult(data); } catch { setResult({ valid: false, message: "Unable to connect to verification service." }); } finally { setLoading(false); } }
  return <main className="verify-page"><section className="verify-card"><span className="verify-kicker">CODEPATH LEARNING</span><h1>Certificate Verification</h1><p>Enter a certificate ID to verify its authenticity and completion details.</p><form className="verify-form" onSubmit={verify}><input value={value} onChange={(event) => setValue(event.target.value.toUpperCase())} placeholder="CPL-PY-2026-000001" aria-label="Certificate ID" /><button type="submit" disabled={loading}>{loading ? "Checking…" : "Verify Certificate"}</button></form>{result ? <div className={`verify-result ${result.valid ? "verify-valid" : "verify-invalid"}`}><div className="verify-status-icon">{result.valid ? "✓" : "×"}</div><strong>{result.valid ? "VALID CERTIFICATE" : "INVALID CERTIFICATE"}</strong><p>{result.message || (result.valid ? "This certificate is issued by CodePath Learning." : "No matching valid certificate was found.")}</p>{result.valid && <dl>{[["Certificate ID", result.certificate.certificateId], ["Student Name", result.certificate.studentName], ["Course", result.certificate.course], ["Issue Date", new Date(result.certificate.issueDate).toLocaleDateString()], ["Completion Date", new Date(result.certificate.completionDate).toLocaleDateString()], ["Instructor", result.certificate.instructor], ["Status", result.certificate.status]].map(([label, item]) => <div key={label}><dt>{label}</dt><dd>{item}</dd></div>)}</dl>}{result.valid && result.certificate.certificatePdf ? <a href={result.certificate.certificatePdf} target="_blank" rel="noreferrer">View certificate PDF ↗</a> : null}</div> : null}</section></main>;
}
