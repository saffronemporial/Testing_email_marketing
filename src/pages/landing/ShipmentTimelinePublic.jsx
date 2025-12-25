// src/components/Landing/ShipmentTimelinePublic.jsx
import React, { useEffect, useState } from 'react';
import './ShipmentTimelinePublic.css';
import { fetchPublicShipmentTimeline } from '../../services/landingStatsService';

function formatDate(d) {
  if (!d) return 'TBA';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return 'TBA';
  return dt.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function ShipmentTimelinePublic() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('shipments'); // or 'rfq'
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const res = await fetchPublicShipmentTimeline();
      if (!alive) return;
      if (res.success) {
        setEvents(res.events || []);
        setError('');
      } else {
        setError(res.error || 'Unable to load shipment timeline.');
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const shipmentEvents = events.filter((e) => e.type === 'real');
  const rfqEvents = events.filter((e) => e.type === 'simulated');

  const displayEvents = viewMode === 'shipments' ? shipmentEvents : rfqEvents;

  return (
    <section id="public-shipment-timeline" className="st-section">
      <div className="st-inner">
        <div className="st-header">
          <div>
            <h2 className="st-title">Interactive Shipment & RFQ Timeline</h2>
            <p className="st-sub">
              A transparent view of Saffron Emporial&apos;s export activity and upcoming RFQs.
            </p>
          </div>
          <div className="st-toggle">
            <button
              className={`st-toggle-btn ${viewMode === 'shipments' ? 'active' : ''}`}
              onClick={() => setViewMode('shipments')}
            >
              📦 Live Shipments
            </button>
            <button
              className={`st-toggle-btn ${viewMode === 'rfq' ? 'active' : ''}`}
              onClick={() => setViewMode('rfq')}
            >
              📑 RFQ Spotlight
            </button>
          </div>
        </div>

        {error && <div className="st-error">{error}</div>}

        <div className="st-timeline-wrapper">
          {loading ? (
            <div className="st-loading">Loading timeline…</div>
          ) : displayEvents.length === 0 ? (
            <div className="st-empty">No events to display yet.</div>
          ) : (
            <div className="st-timeline">
              {displayEvents.map((ev, idx) => (
                <div key={ev.id || idx} className="st-item">
                  <div className="st-marker-col">
                    <div className={`st-dot ${ev.type === 'simulated' ? 'simulated' : ''}`} />
                    {idx !== displayEvents.length - 1 && <div className="st-line" />}
                  </div>
                  <div className="st-card">
                    <div className="st-card-header">
                      <span className="st-chip">
                        {ev.type === 'simulated' || ev.type === 'rfq' ? 'RFQ / Simulated' : 'Live Shipment'}
                      </span>
                      <span className="st-ref">{ev.reference}</span>
                    </div>
                    <div className="st-card-body">
                      <div className="st-meta-row">
                        <span className="st-label">Destination</span>
                        <span className="st-value">{ev.port || 'N/A'}</span>
                      </div>
                      {ev.estimatedDeparture && (
                        <div className="st-meta-row">
                          <span className="st-label">ETD</span>
                          <span className="st-value">{formatDate(ev.estimatedDeparture)}</span>
                        </div>
                      )}
                      {ev.estimatedArrival && (
                        <div className="st-meta-row">
                          <span className="st-label">ETA</span>
                          <span className="st-value">{formatDate(ev.estimatedArrival)}</span>
                        </div>
                      )}
                      {typeof ev.amount === 'number' && ev.amount > 0 && (
                        <div className="st-meta-row">
                          <span className="st-label">Value Received</span>
                          <span className="st-value">${Number(ev.amount).toLocaleString()}</span>
                        </div>
                      )}

                      {ev.label && (
                        <div className="st-meta-row">
                          <span className="st-label">Note</span>
                          <span className="st-value">{ev.label}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="st-footer-note">
        <div>  Real shipment data fetched from our DataBase. We do not verify Client orders on public page, please Login to check your shipment details </div>
          RFQ items are clearly labeled as opportunities.
        </div>
      </div>
    </section>
  );
}
