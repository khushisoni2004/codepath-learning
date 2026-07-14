import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logoIcon from "../assets/codepath-learning-logo2.png";
import "../styles/navbar.css";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Courses", path: "/courses" },
  { label: "Notes", path: "/notes" },
  { label: "About", path: "/about" },
  { label: "Certificate", path: "/certificate-policy" },
  { label: "Login", path: "/login" },
  { label: "Verify", path: "/verify" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const profileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function closeOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", closeOutside);
    return () => document.removeEventListener("mousedown", closeOutside);
  }, []);

  function closeMenu() {
    setMenuOpen(false);
    setProfileOpen(false);
  }

  async function signOut() {
    await logout();
    closeMenu();
    navigate("/");
  }

  return (
    <header className="codepath-navbar">
      <div className="container codepath-navbar-container">
        <Link to="/" className="codepath-navbar-brand" onClick={closeMenu}>
          <div className="codepath-logo-box">
            <img src={logoIcon} alt="CodePath Learning logo" />
          </div>

          <div className="codepath-brand-text">
            <strong>CodePath Learning</strong>
            <span>Learn • Practice • Build</span>
          </div>
        </Link>

        <button
          type="button"
          className={`codepath-menu-button ${menuOpen ? "is-open" : ""}`}
          onClick={() => setMenuOpen((current) => !current)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`codepath-navbar-menu ${menuOpen ? "is-open" : ""}`}>
          <div className="codepath-nav-links">
            {navLinks.filter((link) => !(user && link.path === "/login")).map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === "/"}
                onClick={closeMenu}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {user ? (
            <div className="codepath-profile" ref={profileRef}>
              <button
                type="button"
                className="codepath-profile-button"
                onClick={() => setProfileOpen((current) => !current)}
                aria-label="Open user profile"
                aria-expanded={profileOpen}
              >
                <span aria-hidden="true">{(user.studentName || user.name || "U").charAt(0).toUpperCase()}</span>
              </button>
              {profileOpen && (
                <div className="codepath-profile-dropdown">
                  <div className="codepath-profile-heading">
                    <span>Signed in as</span>
                    <strong>{user.studentName || user.name || "Student"}</strong>
                  </div>
                  <div className="codepath-profile-details">
                    <p><span>Email</span><strong>{user.email || "Not provided"}</strong></p>
                    <p><span>Mobile</span><strong>{user.phone || user.mobile || user.whatsappNumber || "Not provided"}</strong></p>
                  </div>
                  <button type="button" className="codepath-signout-button" onClick={signOut}>Sign Out</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/register" className="codepath-register-button" onClick={closeMenu}>
              Register Now <span>→</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
