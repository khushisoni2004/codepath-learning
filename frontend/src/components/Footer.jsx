import { Link } from "react-router-dom";
import logoIcon from "../assets/codepath-learning-logo2.png";
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
          <a className="codepath-footer-email" href="mailto:codepathlearning@gmail.com">
            codepathlearning@gmail.com
          </a>
        </div>

        <div className="codepath-footer-links">
          <div>
            <h3>Explore</h3>
            <Link to="/">Home</Link>
            <Link to="/courses">Courses</Link>
            <Link to="/mentorship">Mentorship</Link>
            <Link to="/diploma-government-careers">Government Jobs</Link>
          </div>

          <div>
            <h3>Student</h3>
            <Link to="/register">Register</Link>
            <Link to="/login">Login</Link>
            <Link to="/verify">Verify Certificate</Link>
            <Link to="/msme">MSME Registered</Link>
          </div>

          <div>
            <h3>Support</h3>
            <Link to="/about">About</Link>
            <Link to="/notes">Notes</Link>
            <Link to="/certificate-policy">Certificate Policy</Link>
            <Link to="/feedback">Feedback</Link>
          </div>

          <div>
            <h3>Admin</h3>
            <Link to="/admin/verification">Admin Payment Verification</Link>
            <Link to="/admin/placement">Placement Admin</Link>
            <Link to="/admin/certificates">Certificate Admin</Link>
          </div>
        </div>
      </div>

      <div className="container codepath-footer-bottom">
        <span>© 2026 CodePath Learning. All rights reserved.</span>
        <span>MSME Registered · UDYAM-MP-22-0041513</span>
      </div>
    </footer>
  );
}
