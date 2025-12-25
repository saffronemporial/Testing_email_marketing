// src/components/Landing/SaffronTrustScore.jsx
import React, { useEffect, useState } from 'react';
import './SaffronTrustScore.css';
import { fetchLandingTrustStats } from '../../services/landingStatsService';

export default function SaffronTrustScore() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      const res = await fetchLandingTrustStats();
      if (!isMounted) return;
      if (res.success) {
        setStats(res);
        setError('');
      } else {
        setError(res.error || 'Unable to load trust metrics.');
      }
      setLoading(false);
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const score = stats?.trustScore || 0;
  const onTime = stats?.onTimeRate || 0;
  const vipCount = stats?.vipCount || 0;
  const totalClients = stats?.totalClients || 0;

  return (
    <section id="saffron-trust" className="trust-section">
      <div className="trust-inner">
        <div className="trust-header">
          <h2 className="trust-title">Saffron Trust Score™</h2>
          <p className="trust-sub">
            A live composite score combining shipment performance, client health and VIP loyalty
          </p>
        </div>

        <div className="trust-grid">
          <div className="trust-gauge-card">
            <div className="gauge-wrapper">
              <div className="gauge-ring">
                <div
                  className="gauge-fill"
                  style={{ '--trust-score': `${Math.min(score, 100)}` }}
                />
                <div className="gauge-center">
                  <span className="gauge-label">Trust Score</span>
                  {loading ? (
                    <span className="gauge-value">…</span>
                  ) : (
                    <span className="gauge-value">{score}</span>
                  )}
                  <span className="gauge-unit">/ 100</span>
                </div>
              </div>
            </div>
            <p className="gauge-footnote">
              Calculated using real client intelligence, export orders and shipment performance.
            </p>
          </div>

          <div className="trust-metrics-card">
            {error && <div className="trust-error">{error}</div>}

            <div className="metric-row">
              <div className="metric-label">On-time deliveries (last 12 months)</div>
              <div className="metric-value">{onTime.toFixed(1)}%</div>
              <div className="metric-bar">
                <div
                  className="metric-bar-fill"
                  style={{ width: `${Math.min(onTime, 100)}%` }}
                />
              </div>
            </div>

            <div className="metric-row">
              <div className="metric-label">Active client base</div>
              <div className="metric-value">
                {totalClients} clients · {vipCount} VIP
              </div>
              <div className="metric-pill-row">
                <span className="metric-pill">🌍 Multi-country clients</span>
                <span className="metric-pill">📦 Long-term contracts</span>
              </div>
            </div>

            <ul className="trust-bullets">
              <li>Verified export orders and client intelligence in Supabase</li>
              <li>Shipment punctuality, volume and VIP retention are continuously monitored</li>
              <li>No manual editing – numbers are derived from operational data</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
