import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout.jsx";
import Loader from "../components/Loader.jsx";
import api from "../services/api.js";
import Select from "../components/Select.jsx";

const STATUS_PILL = { active: "pill-success", used: "pill-muted", expired: "pill-warning", cancelled: "pill-danger" };
const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default function AdminGatePasses() {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");

  const fetchPasses = async () => {
    try {
      const url = filter ? `/gatepasses/all?status=${filter}` : "/gatepasses/all";
      const { data } = await api.get(url);
      setPasses(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPasses(); }, [filter]);

  const handleStatus = async (id, status) => {
    try {
      await api.patch(`/gatepasses/${id}/status`, { status });
      fetchPasses();
    } catch (err) {
      alert(err.response?.data?.message || "Failed");
    }
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1>🎫 Gate Passes</h1>
          <p>Manage visitor entries across the society.</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", width: "100%" }}>
          <div className="field" style={{ marginBottom: 0, flex: 1, minWidth: 220 }}>
            <input 
              type="text" 
              placeholder="Search by name..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
          <Select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ flex: 1, minWidth: 140 }}>
            <option value="">All passes</option>
            <option value="active">Active</option>
            <option value="used">Used</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : passes.length === 0 ? (
        <div className="empty-state">
          <h3>No gate passes</h3>
          <p>No passes found{filter ? ` with status "${filter}"` : ""}.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {passes.filter((p) => p.visitorName.toLowerCase().includes(search.toLowerCase()) || (p.createdBy?.fullName || "").toLowerCase().includes(search.toLowerCase())).map((pass, i) => (
            <div key={pass._id} className="card" style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="flex-between">
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <strong style={{ fontSize: 15 }}>{pass.visitorName}</strong>
                    <span className={`pill ${STATUS_PILL[pass.status] || "pill-muted"}`}>{pass.status}</span>
                  </div>
                  <div className="muted small" style={{ marginTop: 4 }}>
                    {formatDate(pass.validFrom)} → {formatDate(pass.validTo)}
                    {pass.purpose && ` · ${pass.purpose}`}
                  </div>
                  <div className="muted small" style={{ marginTop: 2 }}>
                    Registered by: {pass.createdBy?.fullName} {pass.createdBy?.flatNumber && `(Flat ${pass.createdBy.flatNumber})`}
                  </div>
                </div>
                {pass.status === "active" && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => handleStatus(pass._id, "used")}>Mark Used</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleStatus(pass._id, "expired")}>Expire</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
