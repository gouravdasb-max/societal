import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api.js";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("Verifying your email address…");
  const [resending, setResending] = useState(false);

  const token = params.get("token");
  const email = params.get("email");

  useEffect(() => {
    if (!token || !email) {
      setStatus("error");
      setMessage("This verification link is incomplete.");
      return;
    }
    api.post("/auth/verify-email", { token, email })
      .then(({ data }) => {
        setStatus("success");
        setMessage(data.message);
      })
      .catch((error) => {
        setStatus("error");
        setMessage(error?.response?.data?.message || "We could not verify this email address.");
      });
  }, [token, email]);

  const resend = async () => {
    if (!email) return;
    setResending(true);
    try {
      const { data } = await api.post("/auth/resend-verification", { email });
      setMessage(data.message);
    } catch (error) {
      setMessage(error?.response?.data?.message || "Could not resend the verification email.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-shell auth-shell-single">
      <div className="auth-form-side" style={{ width: "100%", alignItems: "center", background: "var(--bg)" }}>
        <div className="auth-card" style={{ maxWidth: 480, textAlign: "center" }}>
          <div style={{ width: 68, height: 68, margin: "0 auto 18px", borderRadius: "50%", display: "grid", placeItems: "center", fontSize: 32, color: status === "success" ? "var(--success)" : status === "error" ? "var(--danger)" : "var(--accent)", background: status === "success" ? "var(--success-light)" : status === "error" ? "var(--danger-light)" : "var(--accent-light)", border: "1px solid var(--border)" }}>
            {status === "success" ? "✓" : status === "error" ? "!" : "✉"}
          </div>
          <p className="small muted" style={{ letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Societal account</p>
          <h2>{status === "success" ? "You’re verified!" : status === "error" ? "Verification needed" : "Verifying your email"}</h2>
          <p className={status === "error" ? "alert alert-error" : "muted"} style={{ marginTop: 18, lineHeight: 1.6 }}>{message}</p>
          {status === "success" && <p className="small muted" style={{ marginTop: 14 }}>Your account is ready to sign in.</p>}
          {status === "error" && email && <button className="btn btn-primary btn-block" style={{ marginTop: 18 }} onClick={resend} disabled={resending}>{resending ? "Sending…" : "Send a new verification link"}</button>}
          {status !== "verifying" && <p className="small muted" style={{ marginTop: 22, textAlign: "center" }}><Link to="/login" style={{ color: "var(--primary-dark)", fontWeight: 600 }}>Back to login</Link></p>}
        </div>
      </div>
    </div>
  );
}
