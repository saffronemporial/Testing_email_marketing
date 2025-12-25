import { useState } from "react";
import Papa from "papaparse";
import { supabase } from "../../../supabaseClient";
import "../styles/emailMarketing.css";
import "./subscriberImport.css";

export default function SubscriberImport() {
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState([]);
  const [preview, setPreview] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* -------------------------------------------------------
     CSV PARSE
  -------------------------------------------------------- */
  const handleFile = (f) => {
    setError(null);
    setFile(f);

    Papa.parse(f, {
      header: true,
      skipEmptyLines: true,
      complete: async (result) => {
        if (!result.data?.length) {
          setError("CSV file is empty or invalid");
          return;
        }

        const normalized = result.data.map((r) => ({
          email: r.email?.trim().toLowerCase(),
          name: r.name?.trim() || null,
          country: r.country?.trim() || null
        }));

        await analyzeRows(normalized);
      }
    });
  };

  /* -------------------------------------------------------
     ANALYZE & VALIDATE
  -------------------------------------------------------- */
  const analyzeRows = async (data) => {
    const emailSet = new Set();
    const unique = [];
    const duplicates = [];

    data.forEach((r) => {
      if (!r.email || !r.email.includes("@")) return;
      if (emailSet.has(r.email)) {
        duplicates.push(r);
      } else {
        emailSet.add(r.email);
        unique.push(r);
      }
    });

    const emails = unique.map((r) => r.email);

    const [{ data: existing }, { data: suppressed }] = await Promise.all([
      supabase.from("subscribers").select("email").in("email", emails),
      supabase.from("email_suppressions").select("email").in("email", emails)
    ]);

    const existingSet = new Set(existing?.map((e) => e.email));
    const suppressedSet = new Set(suppressed?.map((s) => s.email));

    const finalRows = unique.map((r) => ({
      ...r,
      status: suppressedSet.has(r.email)
        ? "suppressed"
        : existingSet.has(r.email)
        ? "duplicate"
        : "valid"
    }));

    setRows(finalRows);
    setPreview(finalRows.slice(0, 20));

    setStats({
      total: data.length,
      unique: unique.length,
      duplicates: duplicates.length,
      suppressed: finalRows.filter((r) => r.status === "suppressed").length,
      importable: finalRows.filter((r) => r.status === "valid").length
    });
  };

  /* -------------------------------------------------------
     COMMIT IMPORT
  -------------------------------------------------------- */
  const importSubscribers = async () => {
    if (!stats?.importable) return;

    setLoading(true);
    setError(null);

    const payload = rows
      .filter((r) => r.status === "valid")
      .map((r) => ({
        email: r.email,
        name: r.name,
        country: r.country,
        source: "import",
        status: "active"
      }));

    try {
      const { error } = await supabase.from("subscribers").insert(payload);
      if (error) throw error;

      setRows([]);
      setPreview([]);
      setStats(null);
      setFile(null);
    } catch {
      setError("Failed to import subscribers");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="em-fade-up subscriber-import-root">

      {/* HEADER */}
      <div className="subscriber-import-header">
        <h2>Import Subscribers</h2>
        <span className="em-muted">
          Upload clean, compliant subscriber data
        </span>
      </div>

      {/* UPLOAD */}
      <div className="em-card upload-card">
        <input
          type="file"
          accept=".csv"
          onChange={(e) => handleFile(e.target.files[0])}
        />
        <p className="em-muted">
          Required column: <strong>email</strong> | Optional: name, country
        </p>
      </div>

      {/* STATS */}
      {stats && (
        <div className="stats-grid">
          <Stat label="Total Rows" value={stats.total} />
          <Stat label="Unique" value={stats.unique} />
          <Stat label="Duplicates" value={stats.duplicates} />
          <Stat label="Suppressed" value={stats.suppressed} />
          <Stat label="Ready to Import" value={stats.importable} />
        </div>
      )}

      {/* PREVIEW */}
      {preview.length > 0 && (
        <div className="em-card preview-table">
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Country</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {preview.map((r, i) => (
                <tr key={i} className={`row-${r.status}`}>
                  <td>{r.email}</td>
                  <td>{r.name || "—"}</td>
                  <td>{r.country || "—"}</td>
                  <td>
                    <span className={`em-badge ${r.status}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ACTION */}
      {stats?.importable > 0 && (
        <div className="import-footer">
          <button
            className="em-btn-primary"
            disabled={loading}
            onClick={importSubscribers}
          >
            {loading ? "Importing…" : `Import ${stats.importable} Subscribers`}
          </button>
        </div>
      )}

      {error && <div className="em-card em-badge-danger">{error}</div>}
    </div>
  );
}

/* ---------------- INTERNAL ---------------- */

function Stat({ label, value }) {
  return (
    <div className="em-card stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
