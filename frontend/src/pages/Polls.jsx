import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout.jsx";
import Loader from "../components/Loader.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";

export default function Polls() {
  const { user } = useAuth();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPolls = async () => {
    try {
      const { data } = await api.get("/polls");
      setPolls(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPolls(); }, []);

  const handleVote = async (pollId, optionId) => {
    try {
      await api.patch(`/polls/${pollId}/vote`, { optionId });
      fetchPolls();
    } catch (err) {
      alert(err.response?.data?.message || "Could not vote");
    }
  };

  const totalVotes = (poll) => poll.options.reduce((sum, o) => sum + o.votes.length, 0);
  const hasVoted = (poll) => poll.options.some((o) => o.votes.includes(user?._id));
  const isExpired = (poll) => poll.isClosed || (poll.expiresAt && new Date(poll.expiresAt) < new Date());

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1>📊 Polls</h1>
          <p>Voice your opinion on community decisions.</p>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : polls.length === 0 ? (
        <div className="empty-state">
          <h3>No polls yet</h3>
          <p>The admin hasn't created any polls yet.</p>
        </div>
      ) : (
        <div className="poll-list">
          {polls.map((poll, i) => {
            const total = totalVotes(poll);
            const voted = hasVoted(poll);
            const expired = isExpired(poll);
            return (
              <div key={poll._id} className="card poll-card" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="flex-between" style={{ marginBottom: 14 }}>
                  <h3 style={{ fontSize: 16 }}>{poll.question}</h3>
                  <div style={{ display: "flex", gap: 8 }}>
                    {expired && <span className="pill pill-danger">Closed</span>}
                    {voted && !expired && <span className="pill pill-success">Voted</span>}
                    {!voted && !expired && <span className="pill pill-warning">Open</span>}
                  </div>
                </div>

                <div className="poll-options">
                  {poll.options.map((opt) => {
                    const pct = total > 0 ? Math.round((opt.votes.length / total) * 100) : 0;
                    const isMyVote = opt.votes.includes(user?._id);
                    return (
                      <button
                        key={opt._id}
                        className={`poll-option ${isMyVote ? "my-vote" : ""} ${voted || expired ? "show-result" : ""}`}
                        onClick={() => !voted && !expired && handleVote(poll._id, opt._id)}
                        disabled={voted || expired}
                      >
                        <div className="poll-option-bar" style={{ width: voted || expired ? `${pct}%` : "0%" }} />
                        <span className="poll-option-text">{opt.text}</span>
                        {(voted || expired) && (
                          <span className="poll-option-pct">{pct}%</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex-between" style={{ marginTop: 12 }}>
                  <span className="muted small">{total} vote{total !== 1 ? "s" : ""}</span>
                  <span className="muted small">
                    by {poll.createdBy?.fullName} · {new Date(poll.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
