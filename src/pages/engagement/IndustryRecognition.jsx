// IndustryRecognition.jsx
import React, { useState, useEffect } from 'react';
import './IndustryRecognition.css';

const IndustryRecognition = () => {
  const [activeCategory, setActiveCategory] = useState('awards');
  const [selectedCert, setSelectedCert] = useState(null);
  const [hoveredAward, setHoveredAward] = useState(null);
  const [mediaIndex, setMediaIndex] = useState(0);

  const awardCategories = {
    awards: {
      title: 'Awards & Honors',
      icon: '🏆',
      items: [
        {
          id: 1,
          name: 'National Export Excellence Award',
          year: '2023',
          organization: 'Government of India - Ministry of Commerce',
          description: 'Recognized as top exporter in agricultural products category',
          image: '🥇',
          level: 'National',
          category: 'Export Excellence'
        },
        {
          id: 2,
          name: 'Asia Quality Leadership Award',
          year: '2023',
          organization: 'Asia Pacific Quality Organization',
          description: 'Excellence in quality management and customer satisfaction',
          image: '⭐',
          level: 'Continental',
          category: 'Quality Management'
        },
        {
          id: 3,
          name: 'Sustainable Business Champion',
          year: '2022',
          organization: 'World Trade Center',
          description: 'Leadership in sustainable and ethical business practices',
          image: '🌱',
          level: 'International',
          category: 'Sustainability'
        },
        {
          id: 4,
          name: 'Innovation in Agriculture',
          year: '2022',
          organization: 'FICCI Agriculture Summit',
          description: 'Pioneering technology integration in traditional farming',
          image: '💡',
          level: 'National',
          category: 'Innovation'
        },
        {
          id: 5,
          name: 'Best SME Exporter',
          year: '2021',
          organization: 'Export Promotion Council',
          description: 'Outstanding performance in SME export category',
          image: '📈',
          level: 'National',
          category: 'SME Excellence'
        },
        {
          id: 6,
          name: 'Global Trade Partnership',
          year: '2021',
          organization: 'Dubai Chamber of Commerce',
          description: 'Excellence in international trade relationships',
          image: '🤝',
          level: 'International',
          category: 'Trade Relations'
        }
      ]
    },
    certifications: {
      title: 'Quality Certifications',
      icon: '📜',
      items: [
        {
          id: 1,
          name: 'ISO 22000:2018',
          issuer: 'International Organization for Standardization',
          validity: '2022-2025',
          scope: 'Food Safety Management System',
          badge: 'ISO',
          level: 'International',
          verification: 'Certification No: IND-FS-894562'
        },
        {
          id: 2,
          name: 'Organic India Certification',
          issuer: 'APEDA (Agricultural and Processed Food Products Export Development Authority)',
          validity: '2023-2026',
          scope: 'Organic Farming Practices',
          badge: 'ORGANIC',
          level: 'National',
          verification: 'License: ORG/IN/2023/4872'
        },
        {
          id: 3,
          name: 'Fair Trade Certified',
          issuer: 'World Fair Trade Organization',
          validity: '2022-2025',
          scope: 'Ethical Trade and Farmer Welfare',
          badge: 'FAIR',
          level: 'International',
          verification: 'FT-Cert: WFTO/IN/2289'
        },
        {
          id: 4,
          name: 'HACCP Certification',
          issuer: 'Food Safety and Standards Authority of India',
          validity: '2023-2026',
          scope: 'Hazard Analysis Critical Control Points',
          badge: 'HACCP',
          level: 'National',
          verification: 'HACCP/IN/FSSAI/7341'
        },
        {
          id: 5,
          name: 'GlobalG.A.P.',
          issuer: 'Global Good Agricultural Practice',
          validity: '2022-2025',
          scope: 'Good Agricultural Practices',
          badge: 'G-GAP',
          level: 'International',
          verification: 'GGN: 4049872563123'
        },
        {
          id: 6,
          name: 'ISO 9001:2015',
          issuer: 'International Organization for Standardization',
          validity: '2022-2025',
          scope: 'Quality Management Systems',
          badge: 'QMS',
          level: 'International',
          verification: 'Certification No: IND-QM-563218'
        }
      ]
    },
    media: {
      title: 'Media Features',
      icon: '📰',
      items: [
        {
          id: 1,
          outlet: 'Economic Times',
          title: 'Saffron Emporial Revolutionizes Agricultural Exports with Technology',
          date: 'March 15, 2023',
          type: 'Feature Article',
          logo: 'ET',
          link: '#',
          excerpt: 'How digital transformation is creating new opportunities for Indian agricultural exports...'
        },
        {
          id: 2,
          outlet: 'Forbes India',
          title: 'The Golden Thread: Connecting Indian Farms to Global Markets',
          date: 'January 8, 2023',
          type: 'Cover Story',
          logo: 'Forbes',
          link: '#',
          excerpt: 'Saffron Emporial\'s innovative supply chain model sets new standards...'
        },
        {
          id: 3,
          outlet: 'Bloomberg',
          title: 'Digital Farming Meets Global Commerce',
          date: 'November 22, 2022',
          type: 'Business Feature',
          logo: 'Bloomberg',
          link: '#',
          excerpt: 'Technology-driven approach to traditional farming creates export boom...'
        },
        {
          id: 4,
          outlet: 'The Hindu BusinessLine',
          title: 'Exporting Quality: The Saffron Emporial Story',
          date: 'September 5, 2022',
          type: 'Interview',
          logo: 'Hindu',
          link: '#',
          excerpt: 'CEO discusses the future of agricultural exports and technology integration...'
        }
      ]
    }
  };

  const partnerships = [
    {
      id: 1,
      name: 'Indian Agricultural Research Institute',
      type: 'Research Partnership',
      focus: 'Crop Improvement & Quality Enhancement',
      logo: 'IARI',
      since: '2019',
      projects: ['Saffron Quality Grading', 'Organic Farming Techniques']
    },
    {
      id: 2,
      name: 'National Institute of Food Technology',
      type: 'Technology Development',
      focus: 'Food Processing & Preservation',
      logo: 'NIFTEM',
      since: '2020',
      projects: ['Cold Chain Optimization', 'Quality Testing Protocols']
    },
    {
      id: 3,
      name: 'Dubai Food Safety Department',
      type: 'International Standards',
      focus: 'Export Compliance & Certification',
      logo: 'DFSD',
      since: '2021',
      projects: ['International Quality Standards', 'Export Documentation']
    },
    {
      id: 4,
      name: 'University of Agricultural Sciences',
      type: 'Academic Collaboration',
      focus: 'Sustainable Farming Research',
      logo: 'UAS',
      since: '2018',
      projects: ['Water Conservation', 'Soil Health Management']
    }
  ];

  const expertEndorsements = [
    {
      id: 1,
      name: 'Dr. Sanjay Kapoor',
      title: 'Former Director, APEDA',
      organization: 'Agricultural Export Development Authority',
      endorsement: 'Saffron Emporial has set new benchmarks in quality control and export excellence. Their commitment to farmer welfare while maintaining international standards is commendable.',
      avatar: '👨‍💼',
      verified: true
    },
    {
      id: 2,
      name: 'Prof. Aisha Rahman',
      title: 'Head of Agriculture Department',
      organization: 'University of Dubai',
      endorsement: 'The technological innovation and quality assurance processes implemented by Saffron Emporial are revolutionary. They have successfully bridged traditional farming with modern commerce.',
      avatar: '👩‍🎓',
      verified: true
    },
    {
      id: 3,
      name: 'Rajiv Mehta',
      title: 'International Trade Consultant',
      organization: 'World Trade Center',
      endorsement: 'In my 20 years of trade consultancy, I have rarely seen such comprehensive quality management. Their certifications and awards are well-deserved recognition of their excellence.',
      avatar: '👨‍💻',
      verified: true
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMediaIndex((prev) => (prev + 1) % awardCategories.media.items.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCertClick = (cert) => {
    setSelectedCert(cert);
  };

  const closeCertModal = () => {
    setSelectedCert(null);
  };

  return (
    <section id="industry-recognition" className="recognition-section">
      <div className="recognition-container">
        {/* Header */}
        <div className="recognition-header">
          <h2 className="recognition-title">
            <span className="title-sparkle">Industry Recognition & Excellence</span>
          </h2>
          <p className="recognition-subtitle">
            Celebrating Excellence in Agricultural Export Innovation
          </p>
        </div>

        {/* Category Navigation */}
        <div className="category-navigation">
          {Object.entries(awardCategories).map(([key, category]) => (
            <button
              key={key}
              className={`category-tab ${activeCategory === key ? 'active' : ''}`}
              onClick={() => setActiveCategory(key)}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.title}</span>
            </button>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="recognition-grid">
          {/* Left Column - Awards & Certifications */}
          <div className="main-recognition">
            <div className="section-header">
              <h3 className="section-title">
                {awardCategories[activeCategory].icon} {awardCategories[activeCategory].title}
              </h3>
            </div>

            {activeCategory === 'awards' && (
              <div className="awards-grid">
                {awardCategories.awards.items.map((award, index) => (
                  <div
                    key={award.id}
                    className={`award-card ${hoveredAward === award.id ? 'hovered' : ''}`}
                    onMouseEnter={() => setHoveredAward(award.id)}
                    onMouseLeave={() => setHoveredAward(null)}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="award-badge">
                      <div className="award-image">{award.image}</div>
                      <div className="award-glow"></div>
                    </div>
                    <div className="award-content">
                      <h4 className="award-name">{award.name}</h4>
                      <div className="award-meta">
                        <span className="award-year">{award.year}</span>
                        <span className="award-level">{award.level}</span>
                      </div>
                      <p className="award-organization">{award.organization}</p>
                      <p className="award-description">{award.description}</p>
                      <div className="award-category">{award.category}</div>
                    </div>
                    <div className="award-ribbon"></div>
                  </div>
                ))}
              </div>
            )}

            {activeCategory === 'certifications' && (
              <div className="certifications-grid">
                {awardCategories.certifications.items.map((cert, index) => (
                  <div
                    key={cert.id}
                    className="certification-card"
                    onClick={() => handleCertClick(cert)}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="cert-badge">
                      <div className="cert-symbol">{cert.badge}</div>
                      <div className="cert-glow"></div>
                    </div>
                    <div className="cert-content">
                      <h4 className="cert-name">{cert.name}</h4>
                      <p className="cert-issuer">{cert.issuer}</p>
                      <div className="cert-meta">
                        <span className="cert-validity">Valid: {cert.validity}</span>
                        <span className="cert-level">{cert.level}</span>
                      </div>
                      <div className="cert-scope">{cert.scope}</div>
                    </div>
                    <div className="cert-verification">Verified ✓</div>
                  </div>
                ))}
              </div>
            )}

            {activeCategory === 'media' && (
              <div className="media-carousel">
                <div className="carousel-container">
                  {awardCategories.media.items.map((item, index) => (
                    <div
                      key={item.id}
                      className={`media-slide ${index === mediaIndex ? 'active' : ''}`}
                    >
                      <div className="media-outlet">
                        <div className="outlet-logo">{item.logo}</div>
                        <div className="outlet-info">
                          <h4 className="outlet-name">{item.outlet}</h4>
                          <span className="media-type">{item.type}</span>
                        </div>
                      </div>
                      <h3 className="media-title">{item.title}</h3>
                      <p className="media-excerpt">{item.excerpt}</p>
                      <div className="media-meta">
                        <span className="media-date">{item.date}</span>
                        <button className="read-more">Read Full Story →</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="carousel-indicators">
                  {awardCategories.media.items.map((_, index) => (
                    <button
                      key={index}
                      className={`indicator ${index === mediaIndex ? 'active' : ''}`}
                      onClick={() => setMediaIndex(index)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Partnerships & Endorsements */}
          <div className="sidebar-recognition">
            {/* Partnerships */}
            <div className="partnerships-section">
              <h3 className="sidebar-title">Strategic Partnerships</h3>
              <div className="partnerships-grid">
                {partnerships.map(partner => (
                  <div key={partner.id} className="partner-card">
                    <div className="partner-logo">{partner.logo}</div>
                    <div className="partner-info">
                      <h4 className="partner-name">{partner.name}</h4>
                      <p className="partner-type">{partner.type}</p>
                      <p className="partner-focus">{partner.focus}</p>
                      <div className="partner-meta">
                        <span>Since {partner.since}</span>
                        <span>{partner.projects.length} Projects</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Expert Endorsements */}
            <div className="endorsements-section">
              <h3 className="sidebar-title">Expert Endorsements</h3>
              <div className="endorsements-list">
                {expertEndorsements.map(endorsement => (
                  <div key={endorsement.id} className="endorsement-card">
                    <div className="endorsement-avatar">{endorsement.avatar}</div>
                    <div className="endorsement-content">
                      <div className="endorsement-header">
                        <h4 className="endorser-name">{endorsement.name}</h4>
                        {endorsement.verified && <span className="verified-badge">✓</span>}
                      </div>
                      <p className="endorser-title">{endorsement.title}</p>
                      <p className="endorser-org">{endorsement.organization}</p>
                      <p className="endorsement-text">"{endorsement.endorsement}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievement Stats */}
            <div className="achievement-stats">
              <h3 className="sidebar-title">Recognition Metrics</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-number">15+</div>
                  <div className="stat-label">International Awards</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">12</div>
                  <div className="stat-label">Quality Certifications</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">25+</div>
                  <div className="stat-label">Media Features</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">8</div>
                  <div className="stat-label">Research Partners</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Certification Modal */}
        {selectedCert && (
          <div className="cert-modal-overlay" onClick={closeCertModal}>
            <div className="cert-modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={closeCertModal}>×</button>
              <div className="modal-header">
                <div className="modal-badge">
                  <div className="modal-badge-symbol">{selectedCert.badge}</div>
                </div>
                <h3 className="modal-title">{selectedCert.name}</h3>
              </div>
              <div className="modal-content">
                <div className="modal-details">
                  <div className="detail-row">
                    <span className="detail-label">Issuing Authority:</span>
                    <span className="detail-value">{selectedCert.issuer}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Validity:</span>
                    <span className="detail-value">{selectedCert.validity}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Scope:</span>
                    <span className="detail-value">{selectedCert.scope}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Verification ID:</span>
                    <span className="detail-value">{selectedCert.verification}</span>
                  </div>
                </div>
                <div className="modal-actions">
                  <button className="action-btn primary">Download Certificate</button>
                  <button className="action-btn secondary">Verify Online</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default IndustryRecognition;