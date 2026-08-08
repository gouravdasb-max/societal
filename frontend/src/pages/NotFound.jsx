import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, textAlign: "center", padding: 20 }}>
      <div style={{ fontSize: 48 }}>🧭</div>
      <h1>Page not found</h1>
      <p className="muted">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn btn-primary" style={{ marginTop: 10 }}>Go home</Link>
    </div>
  );
}
