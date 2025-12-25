import React from 'react';
import './HowWeWork.css';

export default function HowWeWork() {
  const steps = [
    {
      id: 1,
      label: 'Step 01',
      title: 'Share your requirement (RFQ)',
      body: 'Tell us your product, quality, packing, port of discharge and payment terms. Our team validates feasibility and checks harvest / stock position.',
      highlight: 'Typical response: within 24–48 business hours.',
    },
    {
      id: 2,
      label: 'Step 02',
      title: 'Commercial + technical offer',
      body: 'We share detailed specification, per-carton / per-MT pricing, packing photos, transit time estimates and documentation template.',
      highlight: 'You can request sample photos / videos from our pack houses.',
    },
    {
      id: 3,
      label: 'Step 03',
      title: 'Shipment planning & execution',
      body: 'Once confirmed, we block reefer space, align farmers / suppliers, supervise packing and issue all export documents until cargo is on board.',
      highlight: 'End-to-end visibility and communication at each milestone.',
    },
  ];

  return (
    <section id="how-we-work" className="hww-section">
      <div className="hww-inner">
        <div className="hww-header">
          <p className="hww-kicker">HOW BUYERS WORK WITH SAFFRON EMPORIAL</p>
          <h2 className="hww-title">
            From RFQ to reefer loading – in three clear steps
          </h2>
          <p className="hww-subtitle">
            We keep the process structured, documented and predictable so that
            importers, trading firms and supermarkets can plan volumes with
            confidence.
          </p>
        </div>

        <div className="hww-steps">
          {steps.map((step) => (
            <div key={step.id} className="hww-card">
              <div className="hww-label">{step.label}</div>
              <h3 className="hww-card-title">{step.title}</h3>
              <p className="hww-card-body">{step.body}</p>
              <p className="hww-card-highlight">{step.highlight}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
