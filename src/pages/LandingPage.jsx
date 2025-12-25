// src/pages/LandingPage.jsx
import React, { useEffect, useState, useRef } from 'react';
import './LandingPage.css';
import { useLandingStats } from '../hooks/useLandingStats';

import ContactForm from './landing/ContactForm.jsx';
import CertificationsWall from './landing/CertificationsWall.jsx';
import HowWeWork from './landing/HowWeWork.jsx';
import ServiceLevelWidget from './landing/ServiceLevelWidget.jsx';

import GlobalFootprintMap from './landing/GlobalFootprintMap.jsx';
import PackingGallery from './landing/PackingGallery.jsx';
import DocsChecklist from './landing/DocsChecklist.jsx';

import SaffronTrustScore from './landing/SaffronTrustScore';
import ShipmentTimelinePublic from './landing/ShipmentTimelinePublic';
import LiveMarketPulseBar from './landing/LiveMarketPulseBar';
import AskSaffronAssistant from './landing/AskSaffronAssistant';
import DealRoomSpotlight from './landing/DealRoomSpotlight';
import LiveStatsStrip from './landing/LiveStatsStrip.jsx';

import HeroSection from './landing/HeroSection';
import FreightLogisticsSection from './landing/FreightLogisticsSection';
import LiveFarmSection from './landing/LiveFarmSection';
import ProductsShowcase from './landing/ProductsShowcase';
import FarmersSection from './landing/FarmersSection';
import PartnersSection from './landing/PartnersSection';
import BusinessIntelligenceSection from './landing/BusinessIntelligenceSection';

export default function LandingPage() {
  // ============ LOADER STATE ============
  const [isLoading, setIsLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);
  
  // ============ STATS STATE ============
  const {
    loading: statsLoading,
    activeClients,
    liveShipments,
    exportOrdersThisMonth,
    error: statsError
  } = useLandingStats();

  // ============ ORIENTATION WARNING HANDLER ============
  useEffect(() => {
    const handleOrientationWarning = () => {
      const warning = document.querySelector('.orientation-warning');
      if (!warning) return;
      
      // Check if user has already dismissed the warning
      const hasDismissed = sessionStorage.getItem('orientation_warning_dismissed');
      
      // Check if we're in landscape on mobile
      const isLandscape = window.matchMedia("(orientation: landscape)").matches;
      const isMobile = window.innerWidth <= 900;
      
      if (isLandscape && isMobile && !hasDismissed) {
        // Show the warning
        warning.classList.remove('warning-hidden');
        warning.classList.add('warning-auto-hide');
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
          warning.classList.add('warning-hidden');
          warning.classList.remove('warning-auto-hide');
        }, 5000);
      } else {
        // Hide the warning
        warning.classList.add('warning-hidden');
      }
    };
    
    // Initial check
    handleOrientationWarning();
    
    // Listen for orientation and resize changes
    window.addEventListener('orientationchange', handleOrientationWarning);
    window.addEventListener('resize', handleOrientationWarning);
    
    return () => {
      window.removeEventListener('orientationchange', handleOrientationWarning);
      window.removeEventListener('resize', handleOrientationWarning);
    };
  }, []);

  // ============ VIDEO LOADER HANDLING ============
  useEffect(() => {
    // Check session storage to only show loader once per session
    const hasSeenLoader = sessionStorage.getItem('saffronEmporial_loader_seen');
    
    if (hasSeenLoader) {
      setIsLoading(false);
      return;
    }

    // Force video preload
    const preloadVideo = () => {
      if (videoRef.current) {
        videoRef.current.load();
      }
    };

    preloadVideo();

    // Set timer for 6 seconds
    const timer = setTimeout(() => {
      finishLoading();
    }, 4000);

    // Setup video event listeners
    const videoElement = videoRef.current;
    let videoEnded = false;

    const handleVideoEnd = () => {
      videoEnded = true;
      finishLoading();
    };

    const handleVideoError = (e) => {
      console.error('Video loading error:', e);
      setVideoError(true);
      // If video fails, proceed after 2 seconds
      setTimeout(finishLoading, 2000);
    };

    const handleVideoLoaded = () => {
      console.log('Video loaded successfully');
    };

    if (videoElement) {
      videoElement.addEventListener('ended', handleVideoEnd);
      videoElement.addEventListener('error', handleVideoError);
      videoElement.addEventListener('loadeddata', handleVideoLoaded);
    }

    // Cleanup
    return () => {
      clearTimeout(timer);
      if (videoElement) {
        videoElement.removeEventListener('ended', handleVideoEnd);
        videoElement.removeEventListener('error', handleVideoError);
        videoElement.removeEventListener('loadeddata', handleVideoLoaded);
      }
    };
  }, []);

  const finishLoading = () => {
    sessionStorage.setItem('saffronEmporial_loader_seen', 'true');
    setIsLoading(false);
    // Ensure body scrolling is re-enabled
    document.body.style.overflow = 'auto';
  };

  // ============ SMOOTH SCROLL FUNCTIONS ============
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  };

  const handleNavClick = (sectionId, event) => {
    event.preventDefault();
    scrollToSection(sectionId);
  };

  // ============ ERROR HANDLING & FORMATTING ============
  const formatNumber = (val) => {
    if (statsError) return 'N/A';
    if (typeof val === 'number') return val.toLocaleString('en-IN');
    return '-';
  };

  // ============ LOADER COMPONENT ============
  if (isLoading) {
    // Prevent scrolling during loader
    document.body.style.overflow = 'hidden';
    
    return (
      <div className="loader-overlay">
        <div className="loader-content">
          <video
            ref={videoRef}
            className={`loader-video ${videoError ? 'video-error' : ''}`}
            autoPlay
            muted
            playsInline
            preload="auto"
            crossOrigin="anonymous"
            onCanPlayThrough={() => console.log('Video ready to play')}
          >
            <source 
              src="https://nylqihwnftbmkxuysgko.supabase.co/storage/v1/object/public/Saffron_Emporial/video/aHR0cHM6Ly9hc3NldHMuZ3Jvay5jb20vdXNlcnMvMzQ2NDU3YmQtNWIwMy00NDlkLWE1MzItZjlkOTQ0ODRiMmRiL2dlbmVyYXRlZC9kNjYyMjFjNi00ZjM1LTRmNDYtOTI1MS02MGY4OGQ1ZTE1OGEvZ2VuZXJhdGVkX3ZpZGVvX2hkLm1wNA==.mp4" 
              type="video/mp4" 
            />
            Your browser does not support the video tag.
          </video>
          
          <div className="loader-text-container">
            <div className="loader-text">
              your export Journey to the Saffron Emporial is loading
            </div>
            <div className="loader-subtext">
              Premium Export Solutions Since 2010
            </div>
          </div>
          
          <div className="loader-progress">
            <div className="loader-progress-bar"></div>
          </div>
          
          {videoError && (
            <div className="video-fallback">
              <div className="fallback-icon">⚜️</div>
              <div className="fallback-text">
                Saffron Emporial
                <div className="fallback-subtext">Loading premium experience...</div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Re-enable scrolling when loader is done
  document.body.style.overflow = 'auto';

  // ============ MAIN PAGE ============
  return (
    <div className="landing-root">
      {/* ============ PREMIUM GOLD STICKY HEADER ============ */}
      <header className="gold-sticky-header">
        <div className="header-container-1">
          {/* Left: Logo & Brand */}
          <div className="header-brand">
            <div className="gold-badge">
              <span className="badge-icon">
                <img src='https://nylqihwnftbmkxuysgko.supabase.co/storage/v1/object/public/Saffron_Emporial/logo/logo%202.png' className="logo" alt="Saffron Emporial Logo" />
              </span>
            </div>
            <div className="brand-text">
              <span className="brand-main">Saffron Emporial</span>
              <span className="brand-tagline">The Golden Standard of Natural Goodness</span>
            </div>
          </div>

          {/* Center: Navigation Links */}
          <nav className="header-nav">
            <button 
              className="nav-link" 
              onClick={(e) => handleNavClick('home', e)}
              aria-label="Go to Home section"
            >
              <span className="nav-icon">🏠</span>
              <span className="nav-text">Home</span>
            </button>
            
            <button 
              className="nav-link" 
              onClick={(e) => handleNavClick('freight-logistics', e)}
              aria-label="Go to Live Logistics section"
            >
              <span className="nav-icon">🚢</span>
              <span className="nav-text">Live Logistics</span>
              <span className="live-dot"></span>
            </button>
            
            <button 
              className="nav-link" 
              onClick={(e) => handleNavClick('business-intelligence', e)}
              aria-label="Go to Business Intelligence section"
            >
              <span className="nav-icon">📊</span>
              <span className="nav-text">Business Intel</span>
            </button>

            <button 
              className="nav-link" 
              onClick={(e) => handleNavClick('live-farm', e)}
              aria-label="Go to Live Farm section"
            >
              <span className="nav-icon">🌿</span>
              <span className="nav-text">Live Farm</span>
              <span className="live-dot red"></span>
            </button>

            <button 
              className="nav-link" 
              onClick={(e) => handleNavClick('products-showcase', e)}
              aria-label="Go to Products section"
            >
              <span className="nav-icon">📦</span>
              <span className="nav-text">Products</span>
            </button>
            
            <button 
              className="nav-link" 
              onClick={(e) => handleNavClick('contact', e)}
              aria-label="Go to Contact section"
            >
              <span className="nav-icon">📞</span>
              <span className="nav-text">Contact</span>
            </button>
          </nav>
          
          <div className="header-actions">
            <a 
              href="/login" 
              className="gold-login-btn"
              aria-label="Partner Login"
            >
              <span className="login-icon">🔐</span>
              <span className="login-text">Partner Login</span>
            </a>
          </div>
        </div>
        
        {/* Golden Accent Line */}
        <div className="gold-accent-line"></div>
      </header>

      {/* ============ MAIN CONTENT ============ */}
      
      {/* Hero Section */}
      <section id="home" className="hero-main-section">
        <HeroSection>
          <div className="hero-gradient hero-section text-white py-20 relative overflow-hidden">
            <div className="floating-emoji-container" aria-hidden>
              <div className="floating absolute top-20 left-10 text-6xl">🌱</div>
              <div className="floating absolute top-40 right-20 text-5xl" style={{ animationDelay: '0.5s' }}>📊</div>
              <div className="floating absolute bottom-32 left-20 text-4xl" style={{ animationDelay: '1s' }}>🔗</div>
              <div className="floating absolute bottom-20 right-10 text-5xl" style={{ animationDelay: '1.5s' }}>🎓</div>
            </div>

            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 fade-in">
                The Trust Engine
              </h1>
              <p className="text-2xl md:text-3xl mb-4 gradient-text">
                Radical Transparency Meets Natural Excellence
              </p>
              <p className="text-xl mb-8 max-w-4xl mx-auto">
                Experience live-streaming farms, real shipment visibility and a
                data-driven buyer console for pomegranates, onions, grapes, bananas,
                chillies, cumin, green coconuts, granite, tiles and more.
              </p>

              <div className="hero-actions space-x-4 fade-in">
                <button
                  onClick={() => scrollToSection('live-farm')}
                  className="btn btn-white"
                  aria-label="Watch Live Farm Feed"
                >
                  🔴 Watch Live Farm Feed
                </button>
                <button
                  onClick={() => scrollToSection('business-intelligence')}
                  className="btn btn-outline"
                  aria-label="View Business Intelligence"
                >
                  View Business Intelligence
                </button>
              </div>

              {/* Live Stats */}
              <div className="mt-10 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-sm">
                <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 backdrop-blur">
                  <div className="text-xs uppercase tracking-widest text-amber-200">
                    Active Buyers
                  </div>
                  <div className="text-xl font-semibold">
                    {statsLoading ? '—' : formatNumber(activeClients)}
                  </div>
                </div>
                <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 backdrop-blur">
                  <div className="text-xs uppercase tracking-widest text-amber-200">
                    Live Shipments
                  </div>
                  <div className="text-xl font-semibold">
                    {statsLoading ? '—' : formatNumber(liveShipments)}
                  </div>
                </div>
                <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 backdrop-blur">
                  <div className="text-xs uppercase tracking-widest text-amber-200">
                    Export Orders • This Month
                  </div>
                  <div className="text-xl font-semibold">
                    {statsLoading ? '—' : formatNumber(exportOrdersThisMonth)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </HeroSection>
      </section>

      {/* Live Market Pulse Bar */}
      <LiveMarketPulseBar />

      {/* Live Stats Strip */}
      <LiveStatsStrip />

      {/* Freight & Logistics Section */}
      <section id="freight-logistics">
        <FreightLogisticsSection />
      </section>

      {/* Business Intelligence Section */}
      <section id="business-intelligence">
        <BusinessIntelligenceSection />
      </section>

      {/* Global Footprint Map */}
      <section id="global-footprint">
        <GlobalFootprintMap />
      </section>

      {/* Packing Gallery */}
      <section id="packing-gallery">
        <PackingGallery />
      </section>

      {/* Documentation Checklist */}
      <section id="documentation">
        <DocsChecklist />
      </section>

      {/* Live Farm Section */}
      <section id="live-farm">
        <LiveFarmSection />
      </section>

      {/* Products Showcase */}
      <section id="products-showcase">
        <ProductsShowcase />
      </section>

      {/* Farmers Section */}
      <section id="farmers">
        <FarmersSection />
      </section>

      {/* Partners Section */}
      <section id="partners">
        <PartnersSection />
      </section>

      {/* Saffron Trust Score */}
      <section id="trust-score">
        <SaffronTrustScore />
      </section>

      {/* Shipment Timeline */}
      <section id="shipment-timeline">
        <ShipmentTimelinePublic />
      </section>

      {/* AI Assistant */}
      <section id="ai-assistant">
        <AskSaffronAssistant />
      </section>

      {/* Deal Room Spotlight */}
      <section id="deal-room">
        <DealRoomSpotlight />
      </section>

      {/* Certifications Wall */}
      <section id="certifications">
        <CertificationsWall />
      </section>

      {/* How We Work */}
      <section id="how-we-work">
        <HowWeWork />
      </section>

      {/* Service Level Widget */}
      <section id="service-level">
        <ServiceLevelWidget />
      </section>

      {/* Contact Form */}
      <section id="contact" className="contact-section">
        <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <ContactForm />
        </div>
      </section>

      {/* ============ MOBILE FRIENDLY FOOTER ============ */}
      <footer className="mobile-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <img src='https://nylqihwnftbmkxuysgko.supabase.co/storage/v1/object/public/Saffron_Emporial/logo/logo%202.png' className="logo" alt="Saffron Emporial Logo" />
            </div>
            <div className="footer-text">
              <h3>Saffron Emporial</h3>
              <p>Export Excellence Since 2020</p>
            </div>
          </div>
          <div className="footer-quick-nav">
            <button onClick={() => scrollToSection('home')}>Home</button>
            <button onClick={() => scrollToSection('products-showcase')}>Products</button>
            <button onClick={() => scrollToSection('contact')}>Contact</button>
            <a href="/login">Login</a>
          </div>
          <div className="footer-copyright">
            © {new Date().getFullYear()} Saffron Emporial. All rights reserved.
          </div>
        </div>
      </footer>

      {/* ============ ORIENTATION WARNING ============ */}
      <div className="orientation-warning">
        <div className="warning-content">
          <div className="warning-icon">📱</div>
          <div className="warning-text">
            For the best experience, please use portrait mode on mobile devices.
          </div>
          <button 
            className="warning-dismiss" 
            onClick={() => {
              // Add a class to hide the warning
              const warning = document.querySelector('.orientation-warning');
              if (warning) {
                warning.classList.add('warning-hidden');
                // Also set a flag in session storage to remember user dismissed it
                sessionStorage.setItem('orientation_warning_dismissed', 'true');
              }
            }}
            aria-label="Close warning"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}