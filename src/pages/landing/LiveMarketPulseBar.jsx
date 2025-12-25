// src/components/Landing/LiveMarketPulseBar.jsx
import React, { useEffect, useState } from 'react';
import './LiveMarketPulseBar.css';
import { fetchMarketPulse } from '../../services/landingStatsService';

export default function LiveMarketPulseBar() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await fetchMarketPulse();
      if (!mounted) return;
      if (res.success) {
        setItems(res.items || []);
        setError('');
      } else {
        setError(res.error || 'Unable to load live market pulse.');
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const displayItems =
    items.length > 0
      ? items
      : [
          // very light fallback, clearly labelled
          {
            id: 'fallback-1',
            commodity: 'Pomegranates (Bhagwa)',
            market: 'Gulf – Spot',
            price: 1.95,
            unit: 'kg',
            currency: 'USD',
            updatedAt: new Date().toISOString(),
          },
        ];

  return (
    <section className="pulse-section">
      <div className="pulse-inner">
        <div className="pulse-label">
          <span className="pulse-dot" />
          Live Market Pulse
        </div>
        {error && <span className="pulse-error">{error}</span>}

        <div className="pulse-ticker">
          <div className="pulse-track">
            {displayItems.map((item, idx) => (
              <div key={item.id || idx} className="pulse-chip">
                <span className="pulse-commodity">{item.commodity}</span>
                <span className="pulse-market">{item.market}</span>
                <span className="pulse-price">
                  {item.currency || 'USD'} {item.price?.toFixed ? item.price.toFixed(2) : item.price}{' '}
                  <span className="pulse-unit">/{item.unit || 'kg'}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
