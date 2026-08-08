import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api.js";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const requestCode = async (event) => {
    event.preventDefault();
    setError(""); setMessage(""); setLoading(true);
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      setMessage(data.message);
      setStep("reset");
    } catch (err) {
      setError(err?.response?.data?.message || "Could not send a reset code.");
    } finally { setLoading(false); }
  };

  const reset = async (event) => {
    event.preventDefault();
    setError(""); setMessage("");
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/reset-password", { email, otp, password });
      setMessage(data.message);
      setStep("complete");
    } catch (err) {
      setError(err?.response?.data?.message || "Could not reset your password.");
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-shell auth-shell-single">
      <div className="auth-form-side" style={{ width: "100%", alignItems: "center", background: "var(--bg)" }}>
        <div className="auth-card" style={{ maxWidth: 480 }}>
          <div style={{ fontSize: 34, marginBottom: 12, textAlign: "center" }}>🔐</div>
          <h2 style={{ textAlign: "center" }}>{step === "request" ? "Reset your password" : step === "reset" ? "Enter your reset code" : "Password updated"}</h2>
          <p className="muted" style={{ textAlign: "center", margin: "10px 0 22px", lineHeight: 1.6 }}>{step === "request" ? "We’ll email a 6-digit code to reset your password." : step === "reset" ? `Enter the code sent to ${email}. It expires in 10 minutes.` : message}</p>
          {error && <div className="alert alert-error">{error}</div>}
          {message && step !== "complete" && <div className="alert alert-success">{message}</div>}
          {step === "request" && <form onSubmit={requestCode}><div className="field"><label>Email address</label><input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></div><button className="btn btn-primary btn-block" disabled={loading}>{loading ? "Sending code…" : "Email reset code"}</button></form>}
          {step === "reset" && <form onSubmit={reset}><div className="field"><label>6-digit code</label><input inputMode="numeric" pattern="[0-9]{6}" maxLength="6" required value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} placeholder="123456" style={{ letterSpacing: 6, textAlign: "center" }} /></div><div className="field"><label>New password</label><input type="password" autoComplete="new-password" minLength="8" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" /></div><div className="field"><label>Confirm new password</label><input type="password" autoComplete="new-password" minLength="8" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat your password" /></div><button className="btn btn-primary btn-block" disabled={loading}>{loading ? "Updating password…" : "Reset password"}</button><button type="button" className="btn btn-outline btn-block" style={{ marginTop: 10 }} onClick={() => setStep("request")}>Send a new code</button></form>}
          {step === "complete" && <button className="btn btn-primary btn-block" onClick={() => navigate("/login")}>Go to login</button>}
          {step !== "complete" && <p className="small muted" style={{ marginTop: 20, textAlign: "center" }}><Link to="/login" style={{ color: "var(--primary-dark)", fontWeight: 600 }}>Back to login</Link></p>}
        </div>
      </div>
    </div>
  );
}
