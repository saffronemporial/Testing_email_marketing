// src/components/public/sections/ProductShowcase.jsx
import React from 'react';

const ProductShowcase = ({ products, onProductSelect }) => {
  return (
    <section className="section section-light">
      <div className="container">
        <h2 className="section-title">Premium Indian Export Products</h2>
        <p className="section-subtitle">
          Discover our curated selection of government-certified products ready for global markets
        </p>

        <div className="grid-3">
          {products.map((product) => (
            <div 
              key={product.id}
              className="card glow-effect"
              onClick={() => onProductSelect(product)}
            >
              <div className="product-header">
                <div className="product-icon-large">🌾</div>
                <div className="product-badge">{product.category}</div>
              </div>
              
              <h3 className="product-name">{product.name}</h3>
              <p className="product-description">{product.description}</p>
              
              <div className="product-features">
                {product.features.map((feature, index) => (
                  <span key={index} className="feature-tag">{feature}</span>
                ))}
              </div>

              <div className="product-pricing">
                <div className="price">{product.price}</div>
                <div className="min-order">Min: {product.minOrder}</div>
              </div>

              <button className="btn btn-primary" style={{width: '100%'}}>
                View Details & Video
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-3">
          <button className="btn btn-secondary">
            View All Products Catalog
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;