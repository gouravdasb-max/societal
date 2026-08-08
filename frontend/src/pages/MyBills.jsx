import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout.jsx";
import Loader from "../components/Loader.jsx";
import api from "../services/api.js";
import { getSocket, connectSocket } from "../services/socket.js";

const STATUS_PILL = { pending: "pill-warning", paid: "pill-success", overdue: "pill-danger", verification_pending: "pill-primary" };
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function MyBills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payModal, setPayModal] = useState(null);
  const [payStep, setPayStep] = useState("confirm"); // confirm -> qr -> processing -> done
  const [utrInput, setUtrInput] = useState("");

  const fetchBills = async () => {
    try {
      const { data } = await api.get("/bills/mine");
      setBills(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchBills(); 

    let socket = getSocket();
    if (!socket.connected) {
      socket = connectSocket();
    }

    if (socket) {
      const handleBillPaid = (updatedBill) => {
        setBills((prev) => prev.map((b) => (b._id === updatedBill._id ? updatedBill : b)));
        setPayStep((prev) => {
          if (prev === "processing") {
            setTimeout(() => setPayModal(null), 1500); // Close gently after 1.5s
            return "done";
          }
          return prev;
        });
        setPaying(null);
      };
      
      socket.on("bill_paid", handleBillPaid);
      return () => {
        socket.off("bill_paid", handleBillPaid);
      };
    }
  }, []);

  const totalPending = bills
    .filter((b) => b.status !== "paid")
    .reduce((sum, b) => sum + b.amount, 0);



  const openPayModal = (bill) => {
    setPayModal(bill);
    setPayStep("confirm");
    setUtrInput("");
  };

  const handleProceedToQR = () => {
    if (!payModal.society?.upiId) {
      alert("Your admin has not configured a UPI ID yet! Please ask them to update it.");
      return;
    }
    setPayStep("qr");
  };

  const handleSubmitUtr = async () => {
    if (utrInput.trim().length < 6) return alert("Please enter a valid 12-digit UTR transaction ID.");
    setPayStep("processing");
    try {
      await api.patch(`/bills/${payModal._id}/pay`, { transactionId: utrInput.trim() });
      setPayStep("done");
      setBills(prev => prev.map(b => b._id === payModal._id ? { ...b, status: "verification_pending", transactionId: utrInput.trim() } : b));
    } catch (err) {
      alert(err.response?.data?.message || "Verification submission failed");
      setPayStep("qr");
    }
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1>💰 My Bills</h1>
          <p>View and pay your maintenance bills.</p>
        </div>
      </div>

      {totalPending > 0 && (
        <div className="card billing-summary-card" style={{ marginBottom: 24 }}>
          <div className="muted small" style={{ marginBottom: 4 }}>Outstanding balance</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 36, color: "var(--accent)", fontWeight: 700 }}>
            ₹{totalPending.toLocaleString()}
          </div>
        </div>
      )}

      {loading ? (
        <Loader />
      ) : bills.length === 0 ? (
        <div className="empty-state">
          <h3>No bills yet</h3>
          <p>Your maintenance bills will appear here.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {bills.map((bill, i) => (
            <div key={bill._id} className="card" style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="flex-between">
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <strong style={{ fontSize: 15 }}>
                      {MONTHS[bill.month - 1]} {bill.year}
                    </strong>
                    <span className={`pill ${STATUS_PILL[bill.status] || "pill-muted"}`}>{bill.status}</span>
                  </div>
                  <div className="muted small" style={{ marginTop: 4 }}>
                    {bill.description}
                    {bill.paidAt && ` · Paid on ${new Date(bill.paidAt).toLocaleDateString()}`}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: bill.status === "paid" ? "var(--success)" : "var(--text)" }}>
                    ₹{bill.amount.toLocaleString()}
                  </div>
                  {bill.status === "pending" || bill.status === "overdue" ? (
                    <button className="btn btn-primary btn-sm" onClick={() => openPayModal(bill)}>
                      Pay Now
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

            {payModal && (
        <div className="modal-backdrop" onClick={() => payStep !== "processing" && setPayModal(null)}>
          <div className="card modal-card payment-modal" onClick={(e) => e.stopPropagation()}>
            {payStep === "confirm" && (
              <>
                <div className="payment-modal-header">
                  <div className="payment-modal-icon">💳</div>
                  <h3>Confirm Payment</h3>
                </div>
                <div className="payment-modal-body">
                  <div className="payment-detail-row">
                    <span className="muted">Bill for</span>
                    <strong>{MONTHS[payModal.month - 1]} {payModal.year}</strong>
                  </div>
                  <div className="payment-detail-row">
                    <span className="muted">Description</span>
                    <span>{payModal.description}</span>
                  </div>
                  <div className="divider" />
                  <div className="payment-detail-row">
                    <span className="muted" style={{ fontSize: 16 }}>Amount</span>
                    <strong style={{ fontSize: 28, fontFamily: "var(--font-display)", color: "var(--accent)" }}>
                      ₹{payModal.amount.toLocaleString()}
                    </strong>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                  <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setPayModal(null)}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleProceedToQR}>
                    Proceed with UPI
                  </button>
                </div>
              </>
            )}

            {payStep === "qr" && (
              <>
                <div className="payment-modal-header" style={{ marginBottom: 12 }}>
                   <h3>Scan to Pay</h3>
                </div>
                <div style={{ textAlign: "center", marginBottom: 16 }}>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=${payModal.society?.upiId}&pn=${payModal.society?.name || 'Society'}&tr=${payModal._id}&am=${payModal.amount}&cu=INR`)}`}
                    alt="UPI QR"
                    style={{ width: 180, height: 180, display: "block", margin: "0 auto", borderRadius: 8, background: "#fff", padding: 8 }}
                  />
                  <p className="small muted" style={{ marginTop: 12 }}>
                    Scan with GPay, PhonePe, or Paytm.<br/>Paying <strong>{payModal.society?.upiId}</strong>
                  </p>
                </div>

                <div className="field">
                  <label>After paying, enter your 12-digit UTR No.</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 319284716254" 
                    value={utrInput}
                    onChange={(e) => setUtrInput(e.target.value)}
                  />
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                  <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setPayStep("confirm")}>
                    Back
                  </button>
                  <button className="btn btn-primary" style={{ flex: 1 }} disabled={!utrInput} onClick={handleSubmitUtr}>
                    Submit Verification
                  </button>
                </div>
              </>
            )}

            {payStep === "processing" && (
              <div className="payment-processing">
                <div className="payment-spinner" />
                <h3 style={{ marginTop: 20 }}>Submitting…</h3>
                <p className="muted small" style={{ marginTop: 8 }}>Please wait.</p>
              </div>
            )}

            {payStep === "done" && (
              <div className="payment-processing">
                <div className="payment-success-icon" style={{ background: "var(--primary)" }}>✓</div>
                <h3 style={{ marginTop: 16 }}>Pending Verification</h3>
                <p className="muted small" style={{ marginTop: 8 }}>
                  Your UTR has been submitted. The admin will verify the transfer shortly.
                </p>
                <button className="btn btn-primary" style={{ marginTop: 20, width: "100%" }} onClick={() => setPayModal(null)}>
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
