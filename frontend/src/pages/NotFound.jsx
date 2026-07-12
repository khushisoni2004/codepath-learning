import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "70vh",
        display: "grid",
        placeItems: "center",
        padding: "40px 20px",
        color: "#ffffff",
        background: "#030713",
        textAlign: "center",
      }}
    >
      <div>
        <h1 style={{ fontSize: "72px", margin: 0 }}>404</h1>

        <h2>Page not found</h2>

        <p style={{ color: "#94a3b8" }}>
          The page you requested does not exist.
        </p>

        <Link
          to="/"
          style={{
            display: "inline-block",
            marginTop: "15px",
            padding: "12px 20px",
            color: "#ffffff",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #2563eb, #7c3aed)",
            textDecoration: "none",
          }}
        >
          Return Home
        </Link>
      </div>
    </main>
  );
}
