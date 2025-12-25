// src/components/Landing/PartnersSection.jsx
import React from 'react';
import './PartnersSection.css';

const PartnersSection = () => {
  const partners = [
    'Dubai Fresh Markets',
    'GCC Hypermarket Group',
    'EU Specialty Importers',
    'Hotel & HORECA Buyers',
  ];

  return (
    <section id="partners" className="pt-wrapper">
      <div className="pt-inner">
        <div className="pt-header">
          <h2>Trusted by Serious Buyers</h2>
          <p>
            Our ecosystem serves importers who care about visibility, quality
            and long-term relationships – not just cheapest spot price.
          </p>
        </div>

        <div className="pt-pill-row">
          {partners.map((p) => (
            <div key={p} className="pt-pill">
              {p}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
