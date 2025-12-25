import React, { useEffect, useState } from 'react';
import './PackingGallery.css';
import supabase from '../../supabaseClient';

export default function PackingGallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Try to load from Supabase products; fall back to static if anything fails
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, category, price, image_url, unit')
          .limit(6);

        if (error) {
          console.warn('PackingGallery: products fetch error', error);
          throw error;
        }

        if (!data || data.length === 0) {
          throw new Error('No products returned');
        }

        const mapped = data.map((p) => ({
          id: p.id,
          name: p.name || 'Product',
          category: p.category || 'Agro / FMCG',
          price: p.price || null,
          unit: p.unit || 'per carton',
          image:
            p.image_url ||
            'https://PLACEHOLDER_SUPABASE_PUBLIC_BUCKET_URL/example-product.jpg',
        }));

        setItems(mapped);
      } catch {
        // Fallback static cards for public landing
        setItems([
          {
            id: 'pomegranate',
            name: 'Bhagwa Pomegranates',
            category: 'Fresh fruit export',
            unit: 'per 3.5kg carton',
            price: null,
            image:
              'https://nylqihwnftbmkxuysgko.supabase.co/storage/v1/object/public/products/product-images/undefined/0.5282883439068086.JPG',
          },
          {
            id: 'onions',
            name: 'Nashik Red Onions',
            category: 'Bulk vegetable export',
            unit: 'per 25kg bag',
            price: null,
            image: 'https://nylqihwnftbmkxuysgko.supabase.co/storage/v1/object/public/Saffron_Emporial/photos/IMG_7195.JPG',
          },
          {
            id: 'grapes',
            name: 'Seedless Grapes',
            category: 'Fresh fruit / reefer',
            unit: 'per 4.5kg carton',
            price: null,
            image: 'https://nylqihwnftbmkxuysgko.supabase.co/storage/v1/object/public/Saffron_Emporial/photos/IMG_6532.jpg',
          },
          {
            id: 'banana',
            name: 'Cavendish Bananas',
            category: 'Ripening & export',
            unit: 'per 13kg carton',
            price: null,
            image: 'https://nylqihwnftbmkxuysgko.supabase.co/storage/v1/object/public/Saffron_Emporial/photos/Green%20And%20Gold%20Corporate%20Business%20Grow%20With%20Us%20Instagram%20Post.jpg',
          },
          {
            id: 'granite',
            name: 'Granite & Tiles',
            category: 'Natural stone export',
            unit: 'per container',
            price: null,
            image: 'https://nylqihwnftbmkxuysgko.supabase.co/storage/v1/object/public/Saffron_Emporial/photos/IMG_7545.JPG',
          },
          {
            id: 'toys',
            name: 'Kids Electric Toys',
            category: 'FMCG / retail',
            unit: 'per mixed pallet',
            price: null,
            image: 'https://nylqihwnftbmkxuysgko.supabase.co/storage/v1/object/public/Saffron_Emporial/Car/car.obj',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <section id="packing-gallery" className="pg-section">
      <div className="pg-inner">
        <div className="pg-header">
          <p className="pg-kicker">QUALITY, PACKING & PRESENTATION</p>
          <h2 className="pg-title">
            How your cargo actually looks when it leaves our hands
          </h2>
          <p className="pg-subtitle">
            Overseas buyers receive clear photos and videos from farms, packing
            units and container stuffing – so you can validate quality before
            and during loading.
          </p>
        </div>

        <div className="pg-grid">
          {loading && (
            <div className="pg-loading">
              <div className="pg-spinner" />
              <span>Loading product snapshots…</span>
            </div>
          )}

          {!loading &&
            items.map((item) => (
              <article key={item.id} className="pg-card">
                <div className="pg-image-wrapper">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="pg-image"
                    loading="lazy"
                  />
                  <div className="pg-image-badge">Sample visual</div>
                </div>
                <div className="pg-card-body">
                  <div className="pg-category">{item.category}</div>
                  <h3 className="pg-name">{item.name}</h3>
                  <div className="pg-meta-row">
                    <span className="pg-unit">{item.unit}</span>
                    {item.price && (
                      <span className="pg-price">
                        From&nbsp;
                        <span className="pg-price-strong">
                          {item.price.toLocaleString('en-IN', {
                            style: 'currency',
                            currency: 'INR',
                            maximumFractionDigits: 0,
                          })}
                        </span>
                      </span>
                    )}
                  </div>
                  <p className="pg-footnote">
                    Detailed specs, packaging photos and live harvest updates are
                    shared privately for confirmed RFQs.
                  </p>
                </div>
              </article>
            ))}
        </div>
      </div>
    </section>
  );
}
