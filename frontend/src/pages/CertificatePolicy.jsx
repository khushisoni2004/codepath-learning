import { Link } from "react-router-dom";
import "../styles/certificate-policy.css";

const syllabusFiles = [
  ["Web Development", "/resources/syllabus/web-development-syllabus.pdf"],
  ["Python Programming", "/resources/syllabus/python-syllabus.pdf"],
  ["C Programming", "/resources/syllabus/c-programming-syllabus.pdf"],
  ["MySQL Database", "/resources/syllabus/mysql-syllabus.pdf"],
  ["Vibe Coding with AI", "/resources/syllabus/vibe-coding-ai-syllabus.pdf"],
  ["AI Tools for Smart Projects", "/resources/syllabus/ai-tools-projects-syllabus.pdf"],
];

const policyPoints = [
  "Training, syllabus, live classes, assignments and projects are provided by CodePath Learning.",
  "Certificate is issued by CodePath Learning after successful completion of the program.",
  "The complete course fee must be paid and verified before certificate issuance.",
  "Students must complete classes, assignments, practical tasks and final assessment.",
  "Certificate details are based on the student's registered name and course information; corrections must be requested before issuance.",
  "Certificate is a private course completion certificate for skill-based learning only.",
  "No Government, AICTE, UGC, University, Board or placement guarantee claim is made.",
  "CodePath Learning may withhold or cancel a certificate if submitted information, payment or coursework is found to be false or misused.",
];

export default function CertificatePolicy() {
  return (
    <main className="certificate-policy-page">
      <section className="certificate-policy-hero">
        <div className="certificate-policy-grid" />
        <div className="certificate-policy-glow certificate-policy-glow-one" />
        <div className="certificate-policy-glow certificate-policy-glow-two" />

        <div className="container certificate-policy-hero-content">
          <span className="certificate-policy-eyebrow">CERTIFICATE POLICY</span>

          <h1 className="certificate-policy-title">
            Certificate by <span>CodePath Learning.</span>
          </h1>

          <p>
            CodePath Learning provides beginner-friendly coding training with live
            classes, notes, assignments, practical projects and final assessment.
            Completion certificate is issued by CodePath Learning after successful
            course completion.
          </p>

          <div className="certificate-policy-actions">
            <a href="#certificate-sample" className="certificate-primary-button">
              View Certificate Sample <span>→</span>
            </a>
            <a href="/resources/syllabus/CodePath-Learning-Course-Syllabus-Pack.pdf" className="certificate-secondary-button" target="_blank" rel="noreferrer">
              Download Syllabus Pack
            </a>
          </div>
        </div>
      </section>

      <section className="certificate-program-section">
        <div className="container certificate-program-layout">
          <div className="certificate-program-content">
            <span className="certificate-section-label">CODEPATH LEARNING PROGRAM</span>
            <h2>Professional training and certification model.</h2>
            <p>
              CodePath Learning manages the complete learning process including
              course content, live classes, assignments, projects, assessment and
              certificate support for eligible students.
            </p>

            <div className="certificate-role-grid">
              <article>
                <span>01</span>
                <h3>Training Program</h3>
                <p>Live classes, Hindi-English explanation, notes, practical coding and assignments.</p>
              </article>
              <article>
                <span>02</span>
                <h3>Completion Certificate</h3>
                <p>Certificate issued by CodePath Learning after completion and assessment.</p>
              </article>
            </div>
          </div>

          <aside className="certificate-policy-box">
            <span className="certificate-section-label">TERMS &amp; CONDITIONS</span>
            <h3>Certificate eligibility and issuance</h3>
            <ul>
              {policyPoints.map((point) => (
                <li key={point}><span>✓</span>{point}</li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className="certificate-sample-section" id="certificate-sample">
        <div className="container certificate-sample-layout">
          <div>
            <span className="certificate-section-label">FINAL CERTIFICATE SAMPLE</span>
            <h2>Professional certificate format.</h2>
            <p>
              Same CodePath Learning logo, same brand theme and clean professional
              certificate wording, issued only by CodePath Learning.
            </p>
            <Link to="/register" className="certificate-primary-button">
              Register for Batch
            </Link>
          </div>

          <div className="codepath-certificate-preview certificate-template-preview">
            <img className="certificate-template-image" src="/images/codepath-certificate-template.png" alt="CodePath Learning certificate of completion sample" />
            <div className="certificate-template-msme">MSME Certified Enterprise</div>
            <div className="certificate-template-qr">
              <img src="/images/certificate-template-qr.png" alt="Certificate verification QR" />
            </div>
          </div>
        </div>
      </section>

      <section className="certificate-download-section">
        <div className="container">
          <div className="certificate-section-heading">
            <div>
              <span className="certificate-section-label">COURSE-WISE PDFs</span>
              <h2>Download syllabus files.</h2>
            </div>
            <p>Use these PDFs for student sharing, demo class and first batch enrollment.</p>
          </div>

          <div className="certificate-download-grid">
            {syllabusFiles.map(([title, href]) => (
              <a href={href} target="_blank" rel="noreferrer" className="certificate-download-card" key={title}>
                <span>PDF</span>
                <strong>{title}</strong>
                <small>Open syllabus →</small>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="certificate-poster-section">
        <div className="container certificate-poster-layout">
          <div className="certificate-poster-content">
            <span className="certificate-section-label">FIRST BATCH POSTER</span>
            <h2>Admissions Open poster ready.</h2>
            <p>
              This poster can be used for students, WhatsApp groups, college
              sharing and first batch promotion.
            </p>

            <div className="certificate-launch-actions">
              <a href="/images/codepath-admissions-poster.png" target="_blank" rel="noreferrer" className="certificate-primary-button">
                Open Poster <span>→</span>
              </a>
              <Link to="/register" className="certificate-secondary-button">
                Register Now
              </Link>
            </div>
          </div>

          <a href="/images/codepath-admissions-poster.png" target="_blank" rel="noreferrer" className="certificate-poster-card">
            <img src="/images/codepath-admissions-poster.png" alt="CodePath Learning admissions open poster" />
          </a>
        </div>
      </section>
    </main>
  );
}
