import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout.jsx";
import Loader from "../components/Loader.jsx";
import api from "../services/api.js";

export default function Directory() {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchDirectory = async (q = "") => {
    try {
      const { data } = await api.get(`/users/directory${q ? `?search=${q}` : ""}`);
      setResidents(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDirectory(); }, []);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    fetchDirectory(val);
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1>👥 Resident Directory</h1>
          <p>Find and connect with your neighbours.</p>
        </div>
      </div>

      <div className="field" style={{ maxWidth: 420, marginBottom: 24 }}>
        <input
          placeholder="Search by name or flat number…"
          value={search}
          onChange={handleSearch}
          style={{ background: "rgba(255,255,255,.04)" }}
        />
      </div>

      {loading ? (
        <Loader />
      ) : residents.length === 0 ? (
        <div className="empty-state">
          <h3>No residents found</h3>
          <p>{search ? "Try a different search." : "No approved residents in the directory."}</p>
        </div>
      ) : (
        <div className="grid grid-3">
          {residents.map((r, i) => (
            <div key={r._id} className="card directory-card" style={{ animationDelay: `${i * 0.04}s` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                {r.avatar ? (
                  <img src={r.avatar} className="avatar avatar-lg" alt="" />
                ) : (
                  <div className="avatar avatar-lg">
                    {r.fullName?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{r.fullName}</div>
                  {r.flatNumber && (
                    <div className="muted small" style={{ marginTop: 2 }}>
                      <span style={{ color: "var(--accent)" }}>⌂</span> Flat {r.flatNumber}
                    </div>
                  )}
                  {r.phone && (
                    <div className="muted small" style={{ marginTop: 2 }}>
                      <span style={{ color: "var(--secondary)" }}>☏</span> {r.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
