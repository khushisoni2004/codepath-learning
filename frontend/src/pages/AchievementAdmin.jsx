import { useState } from "react";
import { API_URL } from "../config/api";
import { apiFetch } from "../services/api";
import "../styles/achievement-admin.css";

const initialForm = { posterImage: "" };

export default function AchievementAdmin() {
  const [adminKey, setAdminKey] = useState("");
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function resetForm() { setForm(initialForm); }

  async function load(event) {
    event.preventDefault(); setLoading(true); setMessage("");
    try {
      const response = await apiFetch(`${API_URL}/achievements/admin`, { headers: { "x-admin-key": adminKey } });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Unable to load posters.");
      setMessage(data.achievements?.length ? "Ready to upload another achievement poster." : "Ready to upload your first achievement poster.");
    } catch (error) { setMessage(error.message); } finally { setLoading(false); }
  }

  function choosePoster(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!/image\/(jpeg|png|webp)/.test(file.type)) { setMessage("Choose a JPG, PNG or WEBP image."); return; }
    if (file.size > 2 * 1024 * 1024) { setMessage("Poster must be 2 MB or smaller."); return; }
    const reader = new FileReader();
    reader.onload = () => setForm((current) => ({ ...current, posterImage: String(reader.result || "") }));
    reader.onerror = () => setMessage("Unable to read that poster.");
    reader.readAsDataURL(file);
  }

  async function save(event) {
    event.preventDefault(); setSaving(true); setMessage("");
    try {
      const response = await apiFetch(`${API_URL}/achievements/admin`, { method: "POST", headers: { "Content-Type": "application/json", "x-admin-key": adminKey }, body: JSON.stringify(form) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Unable to save poster.");
      setMessage("Achievement poster uploaded successfully."); resetForm();
    } catch (error) { setMessage(error.message); } finally { setSaving(false); }
  }

  return <main className="achievement-admin-page"><section className="achievement-admin-shell">
    <div className="achievement-admin-heading"><span>PRIVATE ADMIN PAGE</span><h1>Upload Achievement Poster</h1><p>Add a poster directly to the student achievements page.</p></div>
    <form className="achievement-admin-key" onSubmit={load}><input type="password" value={adminKey} onChange={(event) => setAdminKey(event.target.value)} placeholder="Enter admin key" required /><button type="submit" disabled={loading}>{loading ? "Loading…" : "Open Posters"}</button></form>
    {message ? <div className="achievement-admin-message">{message}</div> : null}
    {adminKey ? <form className="poster-form" onSubmit={save}>
      <div className="achievement-form-heading"><h2>Add Poster</h2></div>
      <label className="poster-upload-field">Achievement Poster *<input type="file" accept="image/jpeg,image/png,image/webp" onChange={choosePoster} required={!form.posterImage} /><small>JPG, PNG or WEBP · maximum 2 MB</small></label>
      {form.posterImage ? <div className="poster-preview"><img src={form.posterImage} alt="Achievement poster preview" /><button type="button" onClick={() => setForm((current) => ({ ...current, posterImage: "" }))}>Remove poster</button></div> : null}
      <div className="achievement-form-actions"><button type="submit" disabled={saving}>{saving ? "Uploading…" : "Upload Poster"}</button></div>
    </form> : null}
  </section></main>;
}
