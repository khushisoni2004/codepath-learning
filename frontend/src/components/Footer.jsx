import { Link } from "react-router-dom";
import logoIcon from "../assets/codepath-learning-logo2.png";
import ProtectedStudentResourceLink from "./ProtectedStudentResourceLink";
import "../styles/footer.css";

export default function Footer() {
  return (
    <footer className="codepath-footer">
      <div className="container codepath-footer-main">
        <div className="codepath-footer-brand">
          <Link to="/" className="codepath-footer-logo">
            <img src={logoIcon} alt="CodePath Learning logo" />
            <div>
              <strong>CodePath Learning</strong>
              <span>Learn • Practice • Build</span>
            </div>
          </Link>

          <p>
            Beginner-friendly coding education with live classes, assignments,
            practical projects and completion certificate.
          </p>
        </div>

        <div className="codepath-footer-links">
          <div>
            <h3>Pages</h3>
            <Link to="/">Home</Link>
            <Link to="/courses">Courses</Link>
            <Link to="/notes">Notes</Link>
            <Link to="/about">About</Link>
          </div>

          <div>
            <h3>Student</h3>
            <Link to="/register">Register</Link>
            <Link to="/login">Login</Link>
            <Link to="/verify">Verify</Link>
            <Link to="/certificate-policy">Certificate Policy</Link>
            <Link to="/feedback">Student Feedback</Link>
          </div>

          <div>
            <h3>Contact</h3>
            <a href="mailto:codepathlearning@gmail.com">Email Support</a>
            <ProtectedStudentResourceLink resource="whatsapp">
              WhatsApp Group
            </ProtectedStudentResourceLink>
          </div>
        </div>
      </div>

      <div className="container codepath-footer-bottom">
        <span>© 2026 CodePath Learning. All rights reserved.</span>
        <span>Private skill-based learning platform.</span>
      </div>
    </footer>
  );
}
