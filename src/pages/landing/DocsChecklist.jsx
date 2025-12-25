import React from 'react';
import './DocsChecklist.css';

export default function DocsChecklist() {
  const checklist = [
    'Commercial invoice & packing list',
    'Phytosanitary / health certificate (where applicable)',
    'Fumigation certificate for onions / specific cargo',
    'Certificate of origin (chamber or FTA-based)',
    'BL draft, final BL and telex release where agreed',
    'Insurance certificate (if arranged by us)',
  ];

  const sampleDocs = [
    {
      id: 'sample-invoice',
      label: 'Sample Commercial Invoice + PL',
      type: 'PDF',
      href: '/api/public/sample-docs/commercial-invoice', // replace with real endpoint or Supabase URL
    },
    {
      id: 'sample-cert-pack',
      label: 'Sample Certificates Pack (Phyto / COO)',
      type: 'PDF',
      href: '/api/public/sample-docs/certificates-pack',
    },
    {
      id: 'onboarding-kit',
      label: 'New Buyer Onboarding Checklist',
      type: 'PDF',
      href: '/api/public/sample-docs/onboarding-kit',
    },
  ];

  return (
    <section id="documentation" className="dc-section">
      <div className="dc-inner">
        <div className="dc-left">
          <p className="dc-kicker">EXPORT DOCUMENTATION & PAPERWORK</p>
          <h2 className="dc-title">
            Clean, compliant documentation for every shipment
          </h2>
          <p className="dc-subtitle">
            Documentation mistakes are expensive. Our team runs a detailed
            checklist for each shipment so BL, invoices, certificates and
            packing list match exactly with your LC / contract terms.
          </p>

          <ul className="dc-list">
            {checklist.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="dc-right">
          <div className="dc-card">
            <div className="dc-card-header">
              <div>
                <div className="dc-card-title">Sample document pack</div>
                <div className="dc-card-sub">
                  Request access and we&apos;ll share sample sets tailored to
                  your product and destination.
                </div>
              </div>
              <span className="dc-pill">For serious importers</span>
            </div>

            <div className="dc-doc-grid">
              {sampleDocs.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.href}
                  className="dc-doc-card"
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className="dc-doc-icon">📄</div>
                  <div className="dc-doc-body">
                    <div className="dc-doc-label">{doc.label}</div>
                    <div className="dc-doc-meta">{doc.type} • View / download</div>
                  </div>
                </a>
              ))}
            </div>

            <p className="dc-footnote">
              For live shipments, documents are shared via secure channels with
              tracking. Sample packs on this page contain only anonymised data
              for format reference.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
