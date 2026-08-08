import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout.jsx";
import Loader from "../components/Loader.jsx";
import api from "../services/api.js";

export default function AdminPolls() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [expiresAt, setExpiresAt] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchPolls = async () => {
    try {
      const { data } = await api.get("/polls");
      setPolls(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPolls(); }, []);

  const addOption = () => setOptions([...options, ""]);
  const removeOption = (i) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, idx) => idx !== i));
  };
  const updateOption = (i, val) => {
    const copy = [...options];
    copy[i] = val;
    setOptions(copy);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/polls", {
        question,
        options: options.filter((o) => o.trim()),
        expiresAt: expiresAt || undefined,
      });
      setQuestion("");
      setOptions(["", ""]);
      setExpiresAt("");
      setShowForm(false);
      fetchPolls();
    } catch (err) {
      alert(err.response?.data?.message || "Could not create poll");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = async (id) => {
    try {
      await api.patch(`/polls/${id}/close`);
      fetchPolls();
    } catch (err) {
      alert(err.response?.data?.message || "Failed");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this poll?")) return;
    try {
      await api.delete(`/polls/${id}`);
      fetchPolls();
    } catch (err) {
      alert(err.response?.data?.message || "Failed");
    }
  };

  const totalVotes = (poll) => poll.options.reduce((sum, o) => sum + o.votes.length, 0);

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1>📊 Polls</h1>
          <p>Create polls and see community opinions.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ New Poll"}
        </button>
      </div>

      {showForm && (
        <form className="card" style={{ marginBottom: 24, animation: "float-in .35s ease both" }} onSubmit={handleCreate}>
          <div className="field">
            <label>Question</label>
            <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="What should we decide?" required />
          </div>
          {options.map((opt, i) => (
            <div key={i} className="field" style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <input
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
                placeholder={`Option ${i + 1}`}
                style={{ flex: 1 }}
                required
              />
              {options.length > 2 && (
                <button type="button" className="btn btn-danger btn-sm" onClick={() => removeOption(i)}>✕</button>
              )}
            </div>
          ))}
          <button type="button" className="btn btn-outline btn-sm" onClick={addOption} style={{ marginBottom: 16 }}>
            + Add option
          </button>
          <div className="field">
            <label>Expires at (optional)</label>
            <input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
          </div>
          <button className="btn btn-primary" disabled={submitting}>
            {submitting ? "Creating…" : "Create Poll"}
          </button>
        </form>
      )}

      {loading ? (
        <Loader />
      ) : polls.length === 0 ? (
        <div className="empty-state">
          <h3>No polls yet</h3>
          <p>Create your first community poll.</p>
        </div>
      ) : (
        <div className="poll-list">
          {polls.map((poll, i) => {
            const total = totalVotes(poll);
            const closed = poll.isClosed || (poll.expiresAt && new Date(poll.expiresAt) < new Date());
            return (
              <div key={poll._id} className="card poll-card" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="flex-between" style={{ marginBottom: 14 }}>
                  <h3 style={{ fontSize: 16 }}>{poll.question}</h3>
                  <span className={`pill ${closed ? "pill-danger" : "pill-success"}`}>
                    {closed ? "Closed" : "Active"}
                  </span>
                </div>

                <div className="poll-options">
                  {poll.options.map((opt) => {
                    const pct = total > 0 ? Math.round((opt.votes.length / total) * 100) : 0;
                    return (
                      <div key={opt._id} className="poll-option show-result" style={{ cursor: "default" }}>
                        <div className="poll-option-bar" style={{ width: `${pct}%` }} />
                        <span className="poll-option-text">{opt.text}</span>
                        <span className="poll-option-pct">{pct}% ({opt.votes.length})</span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex-between" style={{ marginTop: 14 }}>
                  <span className="muted small">{total} total vote{total !== 1 ? "s" : ""}</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    {!closed && (
                      <button className="btn btn-outline btn-sm" onClick={() => handleClose(poll._id)}>Close</button>
                    )}
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(poll._id)}>Delete</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
