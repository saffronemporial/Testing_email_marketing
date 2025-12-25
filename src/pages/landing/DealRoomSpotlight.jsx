// src/components/Landing/DealRoomSpotlight.jsx
import React, { useEffect, useState } from 'react';
import './DealRoomSpotlight.css';
import { fetchDealRoomSpotlight } from '../../services/landingStatsService';

export default function DealRoomSpotlight() {
  const [deals, setDeals] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await fetchDealRoomSpotlight();
      if (!mounted) return;
      if (res.success) {
        setDeals(res.deals || []);
        setErr('');
      } else {
        setErr(res.error || 'Unable to load deal room.');
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section id="deal-room" className="dr-section">
      <div className="dr-inner">
        <div className="dr-header">
          <h2 className="dr-title">Deal Room & RFQ Spotlight</h2>
          <p className="dr-sub">
            A curated window into current RFQs and recently confirmed export deals.
          </p>
        </div>

        {err && <div className="dr-error">{err}</div>}

        <div className="dr-grid">
          {deals.map((item) => (
            <div
              key={item.id}
              className={`dr-card ${item.type === 'rfq' ? 'rfq' : 'real'}`}
            >
              <div className="dr-card-header">
                <span className="dr-chip">
                  {item.type === 'rfq' ? 'RFQ / Open' : 'Confirmed Deal'}
                </span>
                <span className={`dr-status dr-status-${item.status || 'confirmed'}`}>
                  {item.status || 'confirmed'}
                </span>
              </div>
              <h3 className="dr-card-title">{item.title}</h3>
              <div className="dr-meta">
                <div className="dr-meta-row">
                  <span>Port / Market</span>
                  <span>{item.port || 'N/A'}</span>
                </div>
                {item.value > 0 && (
                  <div className="dr-meta-row">
                    <span>Value Received</span>
                    <span>${Number(item.value).toLocaleString()}</span>
                  </div>
                )}
                <div className="dr-meta-row">
                  <span>Last update</span>
                  <span>
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString()
                      : 'Recently'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="dr-cta"
                onClick={() => {
                  // public CTA only, real RFQ workflow is inside app
                  alert('For RFQ details, please login to the client portal or contact our sales team.');
                }}
              >
                View RFQ / Discuss Deal
              </button>
            </div>
          ))}
          {deals.length === 0 && !err && (
            <div className="dr-empty">No RFQs or spotlight deals at the moment.</div>
          )}
        </div>
      </div>
    </section>
  );
}
