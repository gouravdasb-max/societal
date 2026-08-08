import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout.jsx";
import Loader from "../components/Loader.jsx";
import api from "../services/api.js";
import Select from "../components/Select.jsx";

const CATEGORIES = ["maintenance", "repair", "utility", "event", "salary", "other"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function AdminExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const now = new Date();
  const [form, setForm] = useState({ title: "", amount: "", category: "maintenance", month: now.getMonth() + 1, year: now.getFullYear(), description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [showBillForm, setShowBillForm] = useState(false);
  const [billForm, setBillForm] = useState({ amount: "", month: now.getMonth() + 1, year: now.getFullYear(), description: "Monthly maintenance", residentId: "" });
  const [billSubmitting, setBillSubmitting] = useState(false);
  const [residents, setResidents] = useState([]);

  const fetchExpensesAndResidents = async () => {
    try {
      const [expRes, resRes] = await Promise.all([
        api.get("/expenses"),
        api.get("/users/residents").catch(() => ({ data: { data: [] } }))
      ]);
      setExpenses(expRes.data.data);
      setResidents(resRes.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExpensesAndResidents(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/expenses", { ...form, amount: parseFloat(form.amount) });
      setForm({ title: "", amount: "", category: "maintenance", month: now.getMonth() + 1, year: now.getFullYear(), description: "" });
      setShowForm(false);
      fetchExpensesAndResidents();
    } catch (err) {
      alert(err.response?.data?.message || "Could not log expense");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this expense?")) return;
    try {
      await api.delete(`/expenses/${id}`);
      fetchExpensesAndResidents();
    } catch (err) {
      alert(err.response?.data?.message || "Failed");
    }
  };

  const handleGenerateBills = async (e) => {
    e.preventDefault();
    setBillSubmitting(true);
    try {
      const { data } = await api.post("/bills/generate", { ...billForm, amount: parseFloat(billForm.amount) });
      alert(data.message);
      setShowBillForm(false);
    } catch (err) {
      alert(err.response?.data?.message || "Could not generate bills");
    } finally {
      setBillSubmitting(false);
    }
  };

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1>💰 Expenses & Billing</h1>
          <p>Track society expenses and generate resident bills.</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn btn-secondary" onClick={() => { setShowBillForm(!showBillForm); setShowForm(false); }}>
            {showBillForm ? "Cancel" : "Generate Bills"}
          </button>
          <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setShowBillForm(false); }}>
            {showForm ? "Cancel" : "+ Log Expense"}
          </button>
        </div>
      </div>

      {showBillForm && (
        <form className="card" style={{ marginBottom: 24, animation: "float-in .35s ease both" }} onSubmit={handleGenerateBills}>
          <h3 style={{ fontSize: 16, marginBottom: 14 }}>Generate monthly bills for all residents</h3>
          <div className="grid grid-3">
            <div className="field">
              <label>Amount (₹)</label>
              <input type="number" value={billForm.amount} onChange={(e) => setBillForm({ ...billForm, amount: e.target.value })} required min="0" />
            </div>
            <div className="field">
              <label>Month</label>
              <Select value={billForm.month} onChange={(e) => setBillForm({ ...billForm, month: parseInt(e.target.value) })}>
                {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </Select>
            </div>
            <div className="field">
              <label>Year</label>
              <input type="number" value={billForm.year} onChange={(e) => setBillForm({ ...billForm, year: parseInt(e.target.value) })} />
            </div>
          </div>
          <div className="grid grid-2">
            <div className="field">
              <label>Target Resident</label>
              <Select value={billForm.residentId} onChange={(e) => setBillForm({ ...billForm, residentId: e.target.value })}>
                <option value="">All Approved Residents</option>
                {residents.map((r) => (
                  <option key={r._id} value={r._id}>{r.fullName} {r.flatNumber ? `(Flat ${r.flatNumber})` : ""}</option>
                ))}
              </Select>
            </div>
            <div className="field">
              <label>Description</label>
              <input value={billForm.description} onChange={(e) => setBillForm({ ...billForm, description: e.target.value })} />
            </div>
          </div>
          <button className="btn btn-primary" disabled={billSubmitting}>
            {billSubmitting ? "Generating…" : "Generate Bills"}
          </button>
        </form>
      )}

      {showForm && (
        <form className="card" style={{ marginBottom: 24, animation: "float-in .35s ease both" }} onSubmit={handleCreate}>
          <div className="grid grid-2">
            <div className="field">
              <label>Title</label>
              <input name="title" value={form.title} onChange={handleChange} placeholder="Plumber repair" required />
            </div>
            <div className="field">
              <label>Amount (₹)</label>
              <input type="number" name="amount" value={form.amount} onChange={handleChange} required min="0" />
            </div>
          </div>
          <div className="grid grid-3">
            <div className="field">
              <label>Category</label>
              <Select name="category" value={form.category} onChange={handleChange}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
            <div className="field">
              <label>Month</label>
              <Select name="month" value={form.month} onChange={handleChange}>
                {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </Select>
            </div>
            <div className="field">
              <label>Year</label>
              <input type="number" name="year" value={form.year} onChange={handleChange} />
            </div>
          </div>
          <div className="field">
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Details…" />
          </div>
          <button className="btn btn-primary" disabled={submitting}>
            {submitting ? "Saving…" : "Log Expense"}
          </button>
        </form>
      )}

      {totalAmount > 0 && (
        <div className="card billing-summary-card" style={{ marginBottom: 24 }}>
          <div className="muted small" style={{ marginBottom: 4 }}>Total expenses logged</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 36, color: "var(--accent)", fontWeight: 700 }}>
            ₹{totalAmount.toLocaleString()}
          </div>
        </div>
      )}

      {loading ? (
        <Loader />
      ) : expenses.length === 0 ? (
        <div className="empty-state">
          <h3>No expenses logged</h3>
          <p>Start tracking society expenses.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {expenses.map((exp, i) => (
            <div key={exp._id} className="card" style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="flex-between">
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <strong style={{ fontSize: 15 }}>{exp.title}</strong>
                    <span className="pill pill-muted">{exp.category}</span>
                  </div>
                  <div className="muted small" style={{ marginTop: 4 }}>
                    {MONTHS[exp.month - 1]} {exp.year}
                    {exp.description && ` · ${exp.description}`}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700 }}>₹{exp.amount.toLocaleString()}</span>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(exp._id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
