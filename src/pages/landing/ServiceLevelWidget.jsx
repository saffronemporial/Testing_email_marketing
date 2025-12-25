import React from 'react';
import './ServiceLevelWidget.css';

export default function ServiceLevelWidget() {
  const items = [
    {
      label: 'RFQ response',
      value: '24–48h',
      sub: 'business hours',
    },
    {
      label: 'Shipment planning',
      value: '3–7 days',
      sub: 'after confirmation*',
    },
    {
      label: 'Document dispatch',
      value: 'based on Products',
      sub: 'after vessel sailing',
    },
    {
      label: 'Buyer support',
      value: 'Multi-channel',
      sub: 'email / WhatsApp / calls',
    },
  ];

  return (
    <section className="sl-strip">
      <div className="sl-inner">
        <div className="sl-left">
          <span className="sl-pill">Service level expectations</span>
          <h3 className="sl-title">
            Clear, written commitments on how we operate with you
          </h3>
        </div>
        <div className="sl-metrics">
          {items.map((it, idx) => (
            <div key={idx} className="sl-card">
              <div className="sl-value">{it.value}</div>
              <div className="sl-label">{it.label}</div>
              <div className="sl-sub">{it.sub}</div>
            </div>
          ))}
        </div>
      </div>
      <p className="sl-footnote">
        *Timelines depend on product, season and port congestion. Exact SLAs are
        confirmed in writing for each contract / PO.
      </p>
    </section>
  );
}
