import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout.jsx";
import Loader from "../components/Loader.jsx";
import api from "../services/api.js";
import Select from "../components/Select.jsx";

export default function AdminResidents() {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const load = () => {
    setLoading(true);
    api.get(`/users/residents${filter ? `?status=${filter}` : ""}`).then((res) => setResidents(res.data.data)).finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  const approve = async (id) => {
    await api.patch(`/users/residents/${id}/approve`);
    load();
  };

  const remove = async (id) => {
    if (!confirm("Remove this resident's account?")) return;
    await api.delete(`/users/residents/${id}`);
    load();
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1>Residents</h1>
          <p>Approve new sign-ups and manage resident accounts.</p>
        </div>
        <Select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ minWidth: 140 }}>
          <option value="">All residents</option>
          <option value="pending">Pending approval</option>
          <option value="approved">Approved</option>
        </Select>
      </div>

      {loading ? (
        <Loader />
      ) : residents.length === 0 ? (
        <div className="empty-state card"><h3>No residents found</h3></div>
      ) : (
        <div className="grid grid-2">
          {residents.map((r) => (
            <div key={r._id} className="card">
              <div className="flex-between">
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div className="avatar">{r.fullName[0].toUpperCase()}</div>
                  <div>
                    <strong style={{ fontSize: 14.5 }}>{r.fullName}</strong>
                    <p className="muted small">{r.email}</p>
                  </div>
                </div>
                <span className={`pill ${r.isApproved ? "pill-success" : "pill-warning"}`}>
                  {r.isApproved ? "Approved" : "Pending"}
                </span>
              </div>
              <div className="divider" />
              <p className="small muted">Flat: {r.flatNumber || "—"} · {r.phone || "No phone"}</p>
              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                {!r.isApproved && (
                  <button className="btn btn-secondary btn-sm" onClick={() => approve(r._id)}>Approve</button>
                )}
                <button className="btn btn-danger btn-sm" onClick={() => remove(r._id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
