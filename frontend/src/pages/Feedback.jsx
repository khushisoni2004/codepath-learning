import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../config/api";
import { useAuth } from "../context/AuthContext";
import { apiFetch, getStudent } from "../services/api";
import "../styles/feedback.css";

const courseOptions = [
  "Web Development", "Python Programming", "C Programming", "MySQL Database",
  "Vibe Coding with AI", "AI Tools for Smart Projects",
];
const ratingValues = [1, 2, 3, 4, 5];
const initialForm = {
  course: "",
  ratings: { overall: 0, explanation: 0, content: 0, platform: 0 },
  recommendation: "",
  likedMost: "",
  suggestions: "",
};

async function feedbackRequest(path, options = {}) {
  const token = localStorage.getItem("codepathAuthToken");
  if (!token) throw new Error("Please login to submit feedback.");
  const response = await apiFetch(`${API_URL}/feedback${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Unable to save feedback.");
  return data;
}

function RatingQuestion({ name, english, hindi, value, onChange }) {
  return (
    <fieldset className="feedback-rating-question">
      <legend><strong>{english}</strong><span>{hindi}</span></legend>
      <div className="feedback-rating-options">
        {ratingValues.map((rating) => (
          <label className={rating <= value ? "is-selected" : ""} key={rating}>
            <input type="radio" name={name} value={rating} checked={value === rating} onChange={() => onChange(name, rating)} required />
            <span aria-hidden="true">★</span><small>{rating}</small>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function Feedback() {
  const { user, loading: authLoading } = useAuth();
  const [cachedStudent] = useState(() => localStorage.getItem("codepathAuthToken") ? getStudent() : null);
  const activeUser = user || (authLoading ? cachedStudent : null);
  const userId = activeUser?.id;
  const dirtyForm = useRef(false);
  const [form, setForm] = useState(initialForm);
  const [loadingExisting, setLoadingExisting] = useState(Boolean(userId));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [savedAverage, setSavedAverage] = useState(null);

  useEffect(() => {
    if (!userId) { setLoadingExisting(false); return undefined; }
    let cancelled = false;
    setLoadingExisting(true);
    feedbackRequest("/me")
      .then((data) => {
        if (cancelled || dirtyForm.current || !data.feedback) return;
        setForm({
          course: data.feedback.course || "",
          ratings: { ...initialForm.ratings, ...data.feedback.ratings },
          recommendation: data.feedback.recommendation || "",
          likedMost: data.feedback.likedMost || "",
          suggestions: data.feedback.suggestions || "",
        });
        setSavedAverage(data.feedback.averageRating);
      })
      .catch((loadError) => { if (!cancelled) setError(loadError.message); })
      .finally(() => { if (!cancelled) setLoadingExisting(false); });
    return () => { cancelled = true; };
  }, [userId]);

  function updateRating(name, value) {
    dirtyForm.current = true;
    setForm((current) => ({ ...current, ratings: { ...current.ratings, [name]: value } }));
  }
  function updateField(event) {
    dirtyForm.current = true;
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }
  async function submitFeedback(event) {
    event.preventDefault(); setSaving(true); setMessage(""); setError("");
    try {
      const data = await feedbackRequest("", { method: "POST", body: JSON.stringify(form) });
      setMessage(data.message); setSavedAverage(data.feedback.averageRating);
    } catch (submitError) { setError(submitError.message); }
    finally { setSaving(false); }
  }

  if (authLoading && !activeUser) return <main className="feedback-page"><div className="feedback-state-card feedback-loading-card"><span className="feedback-loader" />Preparing your feedback form…</div></main>;
  if (!activeUser) {
    return <main className="feedback-page"><section className="feedback-state-card">
      <span>STUDENT FEEDBACK</span><h1>Login Required</h1>
      <p>Please login with your registered student account to submit feedback.</p>
      <p>Feedback देने के लिए अपने registered student account से login करें।</p>
      <Link to="/login">Login to Continue</Link>
    </section></main>;
  }

  return (
    <main className="feedback-page">
      <section className="feedback-hero"><div className="container">
        <span>STUDENT FEEDBACK • छात्र प्रतिक्रिया</span>
        <h1>Help us improve your learning experience.</h1>
        <p>आपकी प्रतिक्रिया हमें classes, course content और platform को बेहतर बनाने में मदद करती है।</p>
        <div className="feedback-hero-notes"><span>✓ Secure</span><span>✓ सिर्फ 2 मिनट</span><span>✓ You can update anytime</span></div>
      </div></section>
      <section className="container feedback-form-section">
        <form className="feedback-form" onSubmit={submitFeedback}>
          <div className="feedback-form-heading">
            <div><span>QUICK FEEDBACK</span><h2>Tell us about your experience</h2><p>हर सवाल का honest answer दें—आपकी पहचान सुरक्षित है।</p></div>
            {loadingExisting ? <span className="feedback-sync-pill"><i /> Syncing saved feedback…</span> : null}
          </div>
          <div className="feedback-student-row">
            <div><span>Student / छात्र</span><strong>{activeUser.studentName || activeUser.name}</strong></div>
            <div><span>Email / ईमेल</span><strong>{activeUser.email}</strong></div>
          </div>
          <label className="feedback-field"><strong>Which course did you study? <span>आपने कौन-सा course पढ़ा?</span></strong>
            <select name="course" value={form.course} onChange={updateField} required>
              <option value="">Select your course / अपना course चुनें</option>
              {courseOptions.map((course) => <option value={course} key={course}>{course}</option>)}
            </select>
          </label>
          <div className="feedback-ratings-grid">
            <RatingQuestion name="overall" english="Overall learning experience" hindi="कुल learning experience कैसा रहा?" value={form.ratings.overall} onChange={updateRating} />
            <RatingQuestion name="explanation" english="Clarity of explanations" hindi="समझाने का तरीका कितना clear था?" value={form.ratings.explanation} onChange={updateRating} />
            <RatingQuestion name="content" english="Usefulness of course content" hindi="Course content कितना उपयोगी था?" value={form.ratings.content} onChange={updateRating} />
            <RatingQuestion name="platform" english="Website and student platform" hindi="Website और student platform का experience" value={form.ratings.platform} onChange={updateRating} />
          </div>
          <fieldset className="feedback-recommendation"><legend>
            <strong>Would you recommend CodePath Learning?</strong><span>क्या आप CodePath Learning को दूसरों को recommend करेंगे?</span>
          </legend><div>
            {[["yes", "Yes / हाँ"], ["maybe", "Maybe / शायद"], ["no", "No / नहीं"]].map(([value, label]) => (
              <label key={value}><input type="radio" name="recommendation" value={value} checked={form.recommendation === value} onChange={updateField} required /><span>{label}</span></label>
            ))}
          </div></fieldset>
          <label className="feedback-field"><strong>What did you like most? <span>आपको सबसे अच्छा क्या लगा?</span></strong>
            <textarea name="likedMost" value={form.likedMost} onChange={updateField} maxLength="1000" rows="4" placeholder="Share your experience / अपना अनुभव लिखें" required />
          </label>
          <label className="feedback-field"><strong>What can we improve? <span>हम क्या बेहतर कर सकते हैं?</span></strong>
            <textarea name="suggestions" value={form.suggestions} onChange={updateField} maxLength="1000" rows="4" placeholder="Suggestions (optional) / सुझाव (optional)" />
          </label>
          {savedAverage !== null ? <p className="feedback-saved-rating">Saved rating / सेव की गई rating: <strong>{savedAverage}/5</strong></p> : null}
          {message ? <p className="feedback-success" role="status">{message} धन्यवाद!</p> : null}
          {error ? <p className="feedback-error" role="alert">{error}</p> : null}
          <button className="feedback-submit" type="submit" disabled={saving}>{saving ? "Saving… / सेव हो रहा है…" : "Submit Feedback / प्रतिक्रिया भेजें"}</button>
        </form>
      </section>
    </main>
  );
}
