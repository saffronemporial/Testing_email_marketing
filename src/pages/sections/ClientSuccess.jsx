// src/components/public/sections/ClientSuccess.jsx
import React, { useState } from 'react';

const ClientSuccess = () => {
  const [activeClient, setActiveClient] = useState(0);

  const clients = [
    {
      id: 1,
      name: "Al Maya Group",
      location: "Dubai, UAE",
      industry: "Retail Supermarket Chain",
      logo: "🛒",
      challenge: "Inconsistent quality and supply chain disruptions affecting customer satisfaction",
      solution: "Implemented end-to-end supply chain transparency with quality verification",
      results: {
        revenue: "+38%",
        waste: "-65%", 
        satisfaction: "4.7/5.0",
        reliability: "99.5%"
      },
      testimonial: "The transparency from Indian farms to our Dubai shelves has transformed our produce business. Customer trust and satisfaction have never been higher.",
      contact: "Mr. Abdullah Al Maya, CEO",
      products: ["Pomegranates", "Grapes", "Onions"]
    },
    {
      id: 2,
      name: "Dubai Pharmaceutical Distributors",
      location: "Dubai, UAE", 
      industry: "Pharmaceutical Distribution",
      logo: "💊",
      challenge: "Regulatory compliance and quality assurance for generic medicines",
      solution: "Quality-verified, WHO-GMP certified pharmaceutical supply chain",
      results: {
        compliance: "100%",
        savings: "42%",
        delivery: "45% faster",
        growth: "28%"
      },
      testimonial: "The certified supply chain made Indian generic medicines our most profitable segment. Quality is consistently excellent.",
      contact: "Dr. Sameer Hassan, Procurement Director",
      products: ["Generic Medicines", "Ayurvedic Products"]
    },
    {
      id: 3, 
      name: "Emirates Building Materials",
      location: "Dubai, UAE",
      industry: "Construction Materials",
      logo: "🏗️",
      challenge: "Quality inconsistency in granite shipments from multiple suppliers",
      solution: "Single-window procurement with blockchain quality verification",
      results: {
        quality: "98%",
        cost: "-25%",
        delays: "-80%", 
        satisfaction: "4.9/5.0"
      },
      testimonial: "The quality grading system and reliable supply have made us the preferred supplier for luxury projects across Dubai.",
      contact: "Eng. Mohammed Al Rashid, Operations Head",
      products: ["Granite", "Marble"]
    }
  ];

  return (
    <section id="success" className="section section-light">
      <div className="container">
        <h2 className="section-title">Client Success Stories</h2>
        <p className="section-subtitle">
          See how businesses in Dubai and beyond are transforming their supply chains
        </p>

        <div className="client-showcase">
          <div className="client-stats-overview">
            <div className="stat-card">
              <div className="stat-number">150+</div>
              <div className="stat-label">Satisfied Clients</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">$25M+</div>
              <div className="stat-label">Annual Export Value</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">98%</div>
              <div className="stat-label">Client Retention</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">50+</div>
              <div className="stat-label">Countries Served</div>
            </div>
          </div>

          <div className="client-details">
            <div className="client-tabs">
              {clients.map((client, index) => (
                <button
                  key={client.id}
                  className={`client-tab ${activeClient === index ? 'active' : ''}`}
                  onClick={() => setActiveClient(index)}
                >
                  <div className="client-logo">{client.logo}</div>
                  <div className="client-info">
                    <div className="client-name">{client.name}</div>
                    <div className="client-industry">{client.industry}</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="client-content">
              {clients.map((client, index) => (
                <div 
                  key={client.id}
                  className={`client-case-study ${activeClient === index ? 'active' : ''}`}
                >
                  <div className="case-study-header">
                    <h3>{client.name} - {client.location}</h3>
                    <div className="client-products">
                      {client.products.join(" • ")}
                    </div>
                  </div>

                  <div className="case-study-grid">
                    <div className="challenge-solution">
                      <div className="problem-card">
                        <h4>🚨 The Challenge</h4>
                        <p>{client.challenge}</p>
                      </div>
                      <div className="solution-card">
                        <h4>💡 Our Solution</h4>
                        <p>{client.solution}</p>
                      </div>
                    </div>

                    <div className="results-showcase">
                      <h4>📊 Measurable Results</h4>
                      <div className="results-grid">
                        {Object.entries(client.results).map(([key, value]) => (
                          <div key={key} className="result-item">
                            <div className="result-value">{value}</div>
                            <div className="result-label">
                              {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="testimonial-section">
                    <blockquote className="testimonial">
                      "{client.testimonial}"
                    </blockquote>
                    <div className="testimonial-author">
                      — {client.contact}
                    </div>
                  </div>

                  <div className="case-study-actions">
                    <button className="btn btn-primary">
                      Download Full Case Study
                    </button>
                    <button className="btn btn-secondary">
                      Schedule Similar Solution
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClientSuccess;