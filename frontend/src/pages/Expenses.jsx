import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout.jsx";
import Loader from "../components/Loader.jsx";
import api from "../services/api.js";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/expenses")
      .then((res) => setExpenses(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1>Society Expenses</h1>
          <p>Transparency on how your society funds are utilized.</p>
        </div>
      </div>

      {totalAmount > 0 && (
        <div className="card billing-summary-card" style={{ marginBottom: 24 }}>
          <div className="muted small" style={{ marginBottom: 4 }}>Total Society Expenses</div>
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
          <p>The society has not logged any expenses yet.</p>
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
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700 }}>₹{exp.amount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
