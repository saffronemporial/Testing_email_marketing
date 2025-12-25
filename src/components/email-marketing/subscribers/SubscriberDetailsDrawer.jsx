// src/components/email-marketing/subscribers/SubscriberDetails.jsx

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import "../styles/emailMarketing.css";
import "./subscriberDetails.css";

export default function SubscriberDetails() {
  const { subscriberId } = useParams();

  const [loading, setLoading] = useState(true);
  const [subscriber, setSubscriber] = useState(null);
  const [logs, setLogs] = useState([]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState(null);

  /* -------------------------------------------------------
     LOAD SUBSCRIBER INTELLIGENCE
  -------------------------------------------------------- */
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const { data: s, error: sErr } = await supabase
          .from("subscribers")
          .select("*")
          .eq("id", subscriberId)
          .single();

        if (sErr) throw sErr;

        const { data: l } = await supabase
          .from("email_logs")
          .select("status, sent_at, opened_at, clicked_at")
          .eq("subscriber_id", subscriberId)
          .order("sent_at", { ascending: false });

        if (!mounted) return;

        setSubscriber(s);
        setLogs(l || []);
        setNotes(s.internal_notes || "");
      } catch (err) {
        console.error(err);
        setError("Failed to load subscriber details");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();
    return () => (mounted = false);
  }, [subscriberId]);

  /* -------------------------------------------------------
     ACTIONS
  -------------------------------------------------------- */
  const unsubscribe = async () => {
    await supabase
      .from("subscribers")
      .update({ status: "unsubscribed" })
      .eq("id", subscriberId);

    setSubscriber({ ...subscriber, status: "unsubscribed" });
  };

  const saveNotes = async () => {
    await supabase
      .from("subscribers")
      .update({ internal_notes: notes })
      .eq("id", subscriberId);
  };

  if (loading) return <div className="em-card">Loading subscriber…</div>;
  if (error) return <div className="em-card em-badge-danger">{error}</div>;

  /* -------------------------------------------------------
     ENGAGEMENT SCORE (REAL DERIVED)
  -------------------------------------------------------- */
  const opened = logs.filter(l => l.opened_at).length;
  const clicked = logs.filter(l => l.clicked_at).length;
  const sent = logs.length;

  const engagementScore =
    sent === 0 ? 0 : Math.round(((opened + clicked * 2) / (sent * 3)) * 100);

  return (
    <div className="em-fade-up subscriber-details-root">

      {/* PROFILE HEADER */}
      <div className="subscriber-profile em-card">
        <h2>{subscriber.email}</h2>

        <span className={`em-badge em-badge-${subscriber.status === "active" ? "success" : "warning"}`}>
          {subscriber.status}
        </span>

        <p>
          Joined: {new Date(subscriber.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* STATS */}
      <div className="subscriber-stats-grid">
        <Stat label="Emails Sent" value={sent} />
        <Stat label="Opened" value={opened} />
        <Stat label="Clicked" value={clicked} />
        <Stat label="Engagement %" value={engagementScore} />
      </div>

      {/* ACTIONS */}
      <div className="subscriber-actions em-card">
        <button
          className="em-btn-primary"
          onClick={unsubscribe}
          disabled={subscriber.status !== "active"}
        >
          Unsubscribe User
        </button>
      </div>

      {/* NOTES */}
      <div className="em-card">
        <h3>Internal Notes</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Admin-only notes about this subscriber"
        />
        <button className="em-btn-ghost" onClick={saveNotes}>
          Save Notes
        </button>
      </div>

      {/* TIMELINE */}
      <div className="em-card">
        <h3>Email Activity Timeline</h3>

        <div className="timeline">
          {logs.map((l, i) => (
            <div key={i} className="timeline-item">
              <strong>{l.status}</strong>
              <span>{new Date(l.sent_at).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="em-card stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
