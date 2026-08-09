import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout.jsx";
import Loader from "../components/Loader.jsx";
import api from "../services/api.js";
import Select from "../components/Select.jsx";

const STATUS_PILL = { pending: "pill-warning", paid: "pill-success", overdue: "pill-danger" };
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function AdminBilling() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({ upiId: "" });
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchBillsAndSettings = async () => {
    try {
      const url = filter ? `/bills/all?status=${filter}` : "/bills/all";
      const [billsRes, settingsRes] = await Promise.all([
        api.get(url),
        api.get("/users/society/settings").catch(() => ({ data: { data: {} } }))
      ]);
      setBills(billsRes.data.data);
      const s = settingsRes.data.data;
      setSettingsForm({ 
        upiId: s.upiId || "", 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBillsAndSettings(); }, [filter]);

  const handlePaid = async (id) => {
    try {
      await api.patch(`/bills/${id}/paid`);
      await api.patch(`/bills/${id}/paid`);
      fetchBillsAndSettings();
    } catch (err) {
      alert(err.response?.data?.message || "Failed");
    }
  };

  const handleOverdue = async (id) => {
    try {
      await api.patch(`/bills/${id}/overdue`);
      fetchBillsAndSettings();
    } catch (err) {
      alert(err.response?.data?.message || "Failed");
    }
  };

  const handleReject = async (id) => {
    try {
      await api.patch(`/bills/${id}/reject`);
      fetchBillsAndSettings();
    } catch (err) {
      alert(err.response?.data?.message || "Failed");
    }
  };

  const totalCollected = bills.filter((b) => b.status === "paid").reduce((s, b) => s + b.amount, 0);
  const totalPending = bills.filter((b) => b.status !== "paid").reduce((s, b) => s + b.amount, 0);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const { data } = await api.patch("/users/society/settings", settingsForm);
      alert(data.message);
      setShowSettings(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update settings");
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <AppLayout>
      <div style={{ display: "flex", flexDirection: "column", height: "100%", maxHeight: "calc(100vh - 48px)" }}>
        <div className="page-header" style={{ flexShrink: 0 }}>
          <div>
            <h1>💰 Billing</h1>
            <p>Track resident payment statuses.</p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", width: "100%" }}>
            <div className="field" style={{ marginBottom: 0, flex: 1, minWidth: 200 }}>
              <input 
                type="text" 
                placeholder="Search resident..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
              />
            </div>
            <Select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ flex: 1, minWidth: 140 }}>
              <option value="">All bills</option>
              <option value="pending">Pending</option>
              <option value="verification_pending">Verifications</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </Select>
            <button className="btn btn-secondary" onClick={() => setShowSettings(!showSettings)}>
              {showSettings ? "Close Settings" : "⚙️ Payment Receiving"}
            </button>
          </div>
        </div>

        {showSettings && (
          <form className="card" style={{ marginBottom: 20, flexShrink: 0, animation: "float-in .35s ease both", borderLeft: "4px solid var(--accent)" }} onSubmit={handleSaveSettings}>
            <h3 style={{ fontSize: 16, marginBottom: 14 }}>Society Bank Account (UPI ID)</h3>
            <p className="muted small" style={{ marginBottom: 16 }}>
              Enter your society's official UPI ID to receive payments directly with zero fees. When residents try to pay, they will be given a QR code linked strictly to this ID!
            </p>
            <div className="grid grid-2">
              <div className="field">
                <label>Official UPI ID (e.g. society@sbi)</label>
                <input value={settingsForm.upiId} onChange={(e) => setSettingsForm({ ...settingsForm, upiId: e.target.value })} placeholder="society@icici" required />
              </div>
            </div>
            <button className="btn btn-primary" disabled={savingSettings}>
              {savingSettings ? "Saving…" : "Save UPI Preferences"}
            </button>
          </form>
        )}

        <div className="grid grid-2" style={{ marginBottom: 20, flexShrink: 0 }}>
          <div className="card billing-summary-card">
            <div className="muted small" style={{ marginBottom: 4 }}>Total collected</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 32, color: "var(--success)", fontWeight: 700 }}>
              ₹{totalCollected.toLocaleString()}
            </div>
          </div>
          <div className="card billing-summary-card">
            <div className="muted small" style={{ marginBottom: 4 }}>Outstanding</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 32, color: "var(--accent)", fontWeight: 700 }}>
              ₹{totalPending.toLocaleString()}
            </div>
          </div>
        </div>

        {loading ? (
          <Loader />
        ) : bills.length === 0 ? (
          <div className="empty-state" style={{ flex: 1 }}>
            <h3>No bills found</h3>
            <p>Generate bills from the Expenses page.</p>
          </div>
        ) : (
          <div style={{
            display: "flex", 
            flexDirection: "column", 
            gap: 12, 
            flex: 1, 
            overflowY: "auto", 
            paddingRight: 8,
            paddingBottom: 24,
            borderRadius: 8,
            boxShadow: "inset 0 -20px 20px -20px rgba(0,0,0,0.5)"
          }}>
            {bills.filter((b) => (b.resident?.fullName || "").toLowerCase().includes(search.toLowerCase()) || (b.resident?.flatNumber || "").toLowerCase().includes(search.toLowerCase())).map((bill, i) => (
              <div key={bill._id} className="card" style={{ animationDelay: `${i * 0.04}s`, flexShrink: 0 }}>
                <div className="flex-between">
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <strong style={{ fontSize: 15 }}>{bill.resident?.fullName || "Resident"}</strong>
                      {bill.resident?.flatNumber && <span className="muted small">Flat {bill.resident.flatNumber}</span>}
                      <span className={`pill ${STATUS_PILL[bill.status]}`}>{bill.status}</span>
                    </div>
                    <div className="muted small" style={{ marginTop: 4 }}>
                      {MONTHS[bill.month - 1]} {bill.year} · {bill.description}
                      {bill.transactionId && ` · UTR: ${bill.transactionId}`}
                      {bill.paidAt && ` · Paid ${new Date(bill.paidAt).toLocaleDateString()}`}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700 }}>₹{bill.amount.toLocaleString()}</span>
                    
                    {bill.status === "verification_pending" && (
                      <>
                        <button className="btn btn-primary btn-sm" onClick={() => handlePaid(bill._id)}>Verify (Paid)</button>
                        <button className="btn btn-outline btn-sm" onClick={() => handleReject(bill._id)} style={{ color: "var(--danger)", borderColor: "var(--danger)" }}>Reject</button>
                      </>
                    )}

                    {bill.status === "pending" && (
                      <>
                        <button className="btn btn-secondary btn-sm" onClick={() => handlePaid(bill._id)}>Paid</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleOverdue(bill._id)}>Overdue</button>
                      </>
                    )}
                    {bill.status === "overdue" && (
                       <button className="btn btn-secondary btn-sm" onClick={() => handlePaid(bill._id)}>Mark Paid</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
