import { useEffect, useRef, useState } from "react";
import AppLayout from "../components/AppLayout.jsx";
import api from "../services/api.js";
import jsQR from "jsqr";

export default function GuardScanPass() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startScanning = async () => {
    setScanning(true);
    setError("");
    setResult(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err) {
      setError("Camera access denied or not available");
      setScanning(false);
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setScanning(false);
    setResult(null);
  };

  const captureFrame = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const w = videoRef.current.videoWidth;
      const h = videoRef.current.videoHeight;
      if (!w || !h) return;

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d", { willReadFrequently: true });
      canvas.width = w;
      canvas.height = h;
      context.drawImage(videoRef.current, 0, 0, w, h);

      const imageData = context.getImageData(0, 0, w, h);
      const passId = decodeQRCode(imageData);
      if (passId) {
        verifyPass(passId);
        stopScanning();
      }
    }
  };

  const decodeQRCode = (imageData) => {
    if (!imageData) return null;
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "attemptBoth",
    });
    if (code?.data) {
      try {
        const data = JSON.parse(code.data);
        return data.passId || null;
      } catch {
        return code.data.trim();
      }
    }
    return null;
  };

  const handleManualInput = async (e) => {
    e.preventDefault();
    const passId = e.target.passId.value.trim();
    if (!passId) {
      setError("Please enter a gate pass ID");
      return;
    }
    await verifyPass(passId);
    e.target.reset();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError("");

    try {
      const reader = new FileReader();

      reader.onload = async (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.width = img.width;
          canvas.height = img.height;
          context.drawImage(img, 0, 0);

          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const passId = decodeQRCode(imageData);

          if (passId) {
            verifyPass(passId);
          } else {
            setError("Could not read or parse QR code from image");
            setLoading(false);
          }
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("QR reader not available - use manual entry");
      setLoading(false);
    }
  };

  const verifyPass = async (passId) => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const { data } = await api.post("/gatepasses/scan/pass", { passId });
      setResult({ success: true, data: data.data });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to verify pass");
      setResult({ success: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let timeoutId;
    let isMounted = true;

    const loop = () => {
      if (!isMounted || !scanning) return;
      captureFrame();
      timeoutId = setTimeout(loop, 400); // 400ms between attempts prevents phone freezing
    };

    if (scanning) {
      loop();
    }

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [scanning]);

  return (
    <AppLayout>
      <div className="page-header">
        <h1>📱 Scan Gate Pass</h1>
        <p>Verify visitor gate passes using QR code or manual ID.</p>
      </div>

      <div className="grid grid-2">
                <div className="card">
          <h3 style={{ marginBottom: 14, fontSize: 17 }}>QR Scanner</h3>

          {scanning ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{
                  width: "100%",
                  borderRadius: 12,
                  marginBottom: 12,
                  backgroundColor: "#000",
                  maxHeight: 300,
                  objectFit: "cover",
                }}
              />
              <button className="btn btn-outline btn-block" onClick={stopScanning}>
                Stop Scanning
              </button>
            </>
          ) : (
            <button className="btn btn-primary btn-block" onClick={startScanning}>
              Start Camera
            </button>
          )}

          <div className="field" style={{ marginTop: 16 }}>
            <label>Or upload QR image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={scanning || loading}
            />
          </div>
        </div>

                <div className="card">
          <h3 style={{ marginBottom: 14, fontSize: 17 }}>Manual Entry</h3>
          <form onSubmit={handleManualInput}>
            <div className="field">
              <label>Gate Pass ID</label>
              <input
                type="text"
                name="passId"
                placeholder="Paste or type the pass ID"
                disabled={loading}
              />
            </div>
            <button className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Verifying..." : "Verify Pass"}
            </button>
          </form>
        </div>
      </div>

            {error && (
        <div className="alert alert-error" style={{ marginTop: 20 }}>
          {error}
        </div>
      )}

            {result && (
        <div style={{ marginTop: 20 }}>
          {result.success ? (
            <div className="card" style={{ borderLeft: "4px solid var(--primary)", background: "rgba(89, 255, 138, .06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 24 }}>✅</span>
                <strong>Gate Pass Verified</strong>
              </div>
              <div className="muted small">
                <strong>Visitor:</strong> {result.data.visitorName}
              </div>
              {result.data.createdBy && (
                <div className="muted small">
                  <strong>Resident:</strong> {result.data.createdBy.fullName} (Flat {result.data.createdBy.flatNumber || "—"})
                </div>
              )}
              <div className="muted small">
                <strong>Valid:</strong> {new Date(result.data.validFrom).toLocaleDateString()} to {new Date(result.data.validTo).toLocaleDateString()}
              </div>
              {result.data.purpose && (
                <div className="muted small">
                  <strong>Purpose:</strong> {result.data.purpose}
                </div>
              )}
              <div style={{ marginTop: 14, padding: 10, background: "rgba(89, 255, 138, .12)", borderRadius: 10, color: "var(--primary)", fontWeight: 600, textAlign: "center" }}>
                🎫 Entry Granted
              </div>
            </div>
          ) : (
            <div className="card" style={{ borderLeft: "4px solid var(--danger)", background: "rgba(255, 107, 138, .06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 24 }}>❌</span>
                <strong>Pass Invalid or Expired</strong>
              </div>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}
