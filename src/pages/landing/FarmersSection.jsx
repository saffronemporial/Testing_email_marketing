// src/components/Landing/FarmersSection.jsx
import React from 'react';
import './FarmersSection.css';

const FarmersSection = () => {
  const stories = [
    {
      name: 'Mahesh Patil',
      region: 'Nashik, Maharashtra – Pomegranate & Grapes',
      story:
        'Transitioned from local mandi sales to export-grade packing through Saffron Emporial’s agronomy and QC support.',
    },
    {
      name: 'Rekha Ben',
      region: 'Bhavnagar, Gujarat – Onion & Chilli',
      story:
        'Implemented residue-free practices and modern curing, enabling stable onion export even in volatile price cycles.',
    },
    {
      name: 'Ravi Kumar',
      region: 'Andhra Pradesh – Banana & Coconut',
      story:
        'Moved from fragmented buyers to long-term GCC contracts with transparent pricing and logistics visibility.',
    },
  ];

  return (
    <section id="farmers" className="far-wrapper">
      <div className="far-inner">
        <div className="far-header">
          <h2>Built With Indian Farmers</h2>
          <p>
            Our group partners with growers across India to deliver consistent
            export quality – not just one-time shipments.
          </p>
        </div>

        <div className="far-grid">
          {stories.map((f) => (
            <article key={f.name} className="far-card">
              <div className="far-avatar">
                <span>{f.name[0]}</span>
              </div>
              <div className="far-body">
                <h3>{f.name}</h3>
                <p className="far-region">{f.region}</p>
                <p className="far-story">{f.story}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FarmersSection;
