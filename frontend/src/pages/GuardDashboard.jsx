import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout.jsx";
import Loader from "../components/Loader.jsx";
import api from "../services/api.js";
import { useNavigate } from "react-router-dom";

export default function GuardDashboard() {
  const [stats, setStats] = useState({ total: 0, today: 0 });
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const fetchData = async () => {
    try {
      const { data } = await api.get("/gatepasses/scan/history");
      const history = data.data || [];
      setRecentScans(history);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayCount = history.filter((item) => new Date(item.scannedAt) >= today).length;

      setStats({ total: history.length, today: todayCount });
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1>🛡️ Guard Dashboard</h1>
          <p>Scan and verify visitor gate passes.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/guard/scan")}>
          + Scan Pass
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="grid grid-2" style={{ marginBottom: 28 }}>
            <div className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="muted small">Total Verified Passes</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: "var(--primary)" }}>{stats.total}</div>
            </div>
            <div className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="muted small">Verified Today</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: "var(--secondary)" }}>{stats.today}</div>
            </div>
          </div>

          <div className="flex-between" style={{ marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
            <h3 style={{ fontSize: 17, margin: 0 }}>Scan History</h3>
            <div className="field" style={{ marginBottom: 0, minWidth: 200, flex: 1 }}>
              <input 
                type="text" 
                placeholder="Search visitor name..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
              />
            </div>
          </div>
          {recentScans.length === 0 ? (
            <div className="empty-state card">
              <p>No scans yet today.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {recentScans
                .filter(scan => scan.visitorName?.toLowerCase().includes(search.toLowerCase()) || scan.createdBy?.fullName?.toLowerCase().includes(search.toLowerCase()) || scan.createdBy?.flatNumber?.toLowerCase().includes(search.toLowerCase()))
                .map((scan, i) => (
                <div key={scan._id} className="card" style={{ animationDelay: `${i * 0.06}s` }}>
                  <div className="flex-between">
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <strong style={{ fontSize: 15 }}>{scan.visitorName}</strong>
                        <span className="pill pill-success">Verified</span>
                      </div>
                      <div className="muted small" style={{ marginTop: 4 }}>
                        From: {scan.createdBy?.fullName} · Flat {scan.createdBy?.flatNumber || "—"}
                      </div>
                      <div className="muted small">
                        🕐 {formatDate(scan.scannedAt)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </AppLayout>
  );
}
