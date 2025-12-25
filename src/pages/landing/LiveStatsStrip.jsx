// src/components/Landing/LiveStatsStrip.jsx
import React, { useEffect, useState } from 'react';
import './LiveStatsStrip.css';
import { fetchLandingLiveStats } from '../../services/landingStatsService';

export default function LiveStatsStrip() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await fetchLandingLiveStats();
      if (!mounted) return;
      if (res.success) {
        setStats(res);
        setError('');
      } else {
        setStats(res);
        setError(res.error || '');
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const clientCount = stats?.clientCount ?? 0;
  const shipmentCount = stats?.shipmentCount ?? 0;
  const yearlyExportValue = stats?.yearlyExportValue ?? 0;
  const activeMarkets = stats?.activeMarkets ?? 0;

  // Format big numbers nicely
  const formatCurrency = (val) =>
    `USD ${Math.round(val).toLocaleString()}`;

  return (
    <section className="ls-strip">
      <div className="ls-inner">
        <div className="ls-pill">
          <span className="ls-dot" />
          <span className="ls-pill-text">Saffron Live Export Snapshot</span>
        </div>

        {error && (
          <span className="ls-error">
            Data temporarily unavailable — showing base values.
          </span>
        )}

        <div className="ls-grid">
          <div className="ls-card">
            <div className="ls-label">Active Clients</div>
            <div className="ls-value ls-animate">
              {clientCount || '—'}
            </div>
            <div className="ls-caption">
              Importers and retail chains managed on Saffron Emporial
            </div>
          </div>

          <div className="ls-card">
            <div className="ls-label">Shipments Completed</div>
            <div className="ls-value ls-animate">
              {shipmentCount || '—'}
            </div>
            <div className="ls-caption">
              End-to-end export consignments tracked across sea & land
            </div>
          </div>

          <div className="ls-card">
            <div className="ls-label">12-Month Export Volume</div>
            <div className="ls-value ls-animate">
              {yearlyExportValue ? formatCurrency(yearlyExportValue) : '—'}
            </div>
            <div className="ls-caption">
              Based on confirmed export orders recorded in Supabase
            </div>
          </div>

          <div className="ls-card">
            <div className="ls-label">Active Markets</div>
            <div className="ls-value ls-animate">
              {activeMarkets || '—'}
            </div>
            <div className="ls-caption">
              Ports and regions currently serviced by Saffron Emporial
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
