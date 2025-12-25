// src/components/Landing/ProductsShowcase.jsx
import React, { useEffect, useState, useRef } from 'react';
import './ProductsShowcase.css';
// Adjust this import to match your existing Supabase client
import { supabase } from '../../supabaseClient';

const ProductsShowcase = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [videoPlayed, setVideoPlayed] = useState(false);
  const videoRefs = useRef([]);

  // Video URLs - Add your video URLs here
  // First one will be your company presentation video
  const videoUrls = [
    "https://nylqihwnftbmkxuysgko.supabase.co/storage/v1/object/public/Saffron_Emporial/video/Saffron_Emporial_presentation.mp4", // Your company presentation video
    // Add more video URLs here in future
    // "https://nylqihwnftbmkxuysgko.supabase.co/storage/v1/object/public/Saffron_Emporial/video/video2.mp4",
    // "https://nylqihwnftbmkxuysgko.supabase.co/storage/v1/object/public/Saffron_Emporial/video/video3.mp4",
  ];

  // Check if video has been played in this session
  useEffect(() => {
    const hasPlayed = sessionStorage.getItem('saffron_product_video_played');
    setVideoPlayed(!!hasPlayed);
  }, []);

  // Handle video autoplay logic
  useEffect(() => {
    if (!videoPlayed && videoRefs.current[currentVideoIndex]) {
      const playVideo = async () => {
        try {
          const video = videoRefs.current[currentVideoIndex];
          if (video) {
            // Set volume to 0.5 (50%) - not muted but reasonable volume
            video.volume = 0.5;
            await video.play();
            
            // Mark as played in session storage
            sessionStorage.setItem('saffron_product_video_played', 'true');
            setVideoPlayed(true);
            
            console.log('Video autoplayed successfully');
          }
        } catch (error) {
          console.warn('Autoplay prevented or video error:', error);
          // If autoplay fails, mark as played anyway
          sessionStorage.setItem('saffron_product_video_played', 'true');
          setVideoPlayed(true);
        }
      };

      // Small delay to ensure video is loaded
      const timer = setTimeout(() => {
        playVideo();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [currentVideoIndex, videoPlayed]);

  // Handle video ended
  const handleVideoEnded = (index) => {
    // If this is the current video and there are more videos, auto-advance
    if (index === currentVideoIndex && index < videoUrls.length - 1) {
      setTimeout(() => {
        setCurrentVideoIndex(index + 1);
      }, 1000); // 1 second delay before next video
    }
  };

  // Fetch products from Supabase
  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, category, grade, price_per_unit, currency, image_url')
          .eq('is_active', true)
          .order('name', { ascending: true })
          .limit(6);

        if (error) {
          console.error('ProductsShowcase: error fetching products', error);
          if (!isMounted) return;
          setProducts([]);
        } else if (isMounted && data) {
          setProducts(data);
        }
      } catch (err) {
        console.error('ProductsShowcase: unexpected error', err);
        if (isMounted) setProducts([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  // Navigation functions
  const nextVideo = () => {
    setCurrentVideoIndex((prevIndex) => 
      prevIndex === videoUrls.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevVideo = () => {
    setCurrentVideoIndex((prevIndex) => 
      prevIndex === 0 ? videoUrls.length - 1 : prevIndex - 1
    );
  };

  const goToVideo = (index) => {
    setCurrentVideoIndex(index);
  };

  return (
    <section id="products" className="ps-wrapper">
      <div className="ps-inner">
        <div className="ps-header">
          <h2>Core Export Portfolio</h2>
          <p>
            Fresh fruits, vegetables, spices, stone and value-added products
            managed end-to-end by Saffron Emporial group companies.
          </p>
        </div>

        {/* Video Carousel Section */}
        <div className="video-carousel-section">
          <div className="carousel-header">
            <h3>Company Presentation</h3>
            <p>Explore our export journey and premium quality standards</p>
          </div>
          
          <div className="video-carousel-container">
            {/* Previous Button */}
            {videoUrls.length > 1 && (
              <button 
                className="carousel-btn prev-btn" 
                onClick={prevVideo}
                aria-label="Previous video"
              >
                ◀
              </button>
            )}
            
            {/* Video Container */}
            <div className="video-main-container">
              {videoUrls.map((url, index) => (
                <div 
                  key={index} 
                  className={`video-item ${index === currentVideoIndex ? 'active' : ''}`}
                >
                  <video
                    ref={(el) => (videoRefs.current[index] = el)}
                    className="product-video"
                    controls
                    playsInline
                    preload="metadata"
                    onEnded={() => handleVideoEnded(index)}
                    poster={index === 0 ? "/placeholder-poster.jpg" : undefined} // Add poster for first video if needed
                  >
                    <source src={url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  
                  {/* Video info overlay */}
                  <div className="video-info-overlay">
                    <div className="video-title">
                      {index === 0 ? "Company Overview" : `Video ${index + 1}`}
                    </div>
                    <div className="video-description">
                      {index === 0 
                        ? "Discover Saffron Emporial's export excellence and quality standards"
                        : "Additional product showcase and company insights"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Next Button */}
            {videoUrls.length > 1 && (
              <button 
                className="carousel-btn next-btn" 
                onClick={nextVideo}
                aria-label="Next video"
              >
                ▶
              </button>
            )}
          </div>
          
          {/* Video Dots Navigation */}
          {videoUrls.length > 1 && (
            <div className="video-dots-nav">
              {videoUrls.map((_, index) => (
                <button
                  key={index}
                  className={`video-dot ${index === currentVideoIndex ? 'active' : ''}`}
                  onClick={() => goToVideo(index)}
                  aria-label={`Go to video ${index + 1}`}
                />
              ))}
            </div>
          )}
          
          {/* Video Counter */}
          <div className="video-counter">
            Video {currentVideoIndex + 1} of {videoUrls.length}
          </div>
        </div>

        {/* Products Grid */}
        <div className="ps-grid">
          {loading ? (
            <>
              <div className="ps-skeleton-card" />
              <div className="ps-skeleton-card" />
              <div className="ps-skeleton-card" />
            </>
          ) : products.length === 0 ? (
            <div className="ps-empty">
              Product catalogue will appear here once configured in Supabase.
            </div>
          ) : (
            products.map((p) => (
              <article key={p.id} className="ps-card">
                <div className="ps-img-wrapper">
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="ps-img"
                      loading="lazy"
                    />
                  ) : (
                    <div className="ps-img-placeholder">
                      <span>{p.name?.[0] || 'S'}</span>
                    </div>
                  )}
                  <div className="ps-pill-category">{p.category || 'Agro'}</div>
                </div>
                <div className="ps-body">
                  <h3>{p.name}</h3>
                  <p className="ps-grade">
                    {p.grade ? `Grade: ${p.grade}` : 'Export grade'}
                  </p>
                  <div className="ps-price-row">
                    <span className="ps-price-label">Guide price</span>
                    <span className="ps-price-value">
                      {p.price_per_unit != null
                        ? `${p.currency || 'USD'} ${p.price_per_unit}/kg`
                        : 'On request'}
                    </span>
                  </div>
                  <ul className="ps-tags">
                    <li>QC & documentation support</li>
                    <li>Door-to-port logistics</li>
                    <li>Flexible packing</li>
                  </ul>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductsShowcase;