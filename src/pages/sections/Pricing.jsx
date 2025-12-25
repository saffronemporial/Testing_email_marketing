// src/components/public/sections/Pricing.jsx
import React, { useState } from 'react';

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');

  const plans = [
    {
      name: "Starter",
      description: "Perfect for small businesses starting exports",
      price: { monthly: "$99", annually: "$949" },
      features: [
        "Up to 5 shipments/month",
        "Basic tracking & documentation",
        "Email support",
        "Quality verification",
        "Digital invoices"
      ],
      cta: "Start Exporting",
      popular: false
    },
    {
      name: "Professional",
      description: "Ideal for growing export businesses",
      price: { monthly: "$299", annually: "$2,899" },
      features: [
        "Up to 20 shipments/month",
        "Advanced tracking & analytics",
        "Priority phone support",
        "Blockchain verification",
        "Custom documentation",
        "Dedicated account manager",
        "Multi-currency payments"
      ],
      cta: "Get Started",
      popular: true
    },
    {
      name: "Enterprise",
      description: "For large-scale export operations",
      price: { monthly: "$799", annually: "$7,599" },
      features: [
        "Unlimited shipments",
        "Custom integration & API access",
        "24/7 premium support",
        "Advanced AI insights",
        "Custom compliance solutions",
        "Multiple user accounts",
        "White-label reporting",
        "Strategic consulting"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  return (
    <section id="pricing" className="section section-light">
      <div className="container">
        <h2 className="section-title">Transparent Pricing</h2>
        <p className="section-subtitle">
          No hidden costs. Everything you need for successful exports.
        </p>

        <div className="pricing-toggle">
          <div className="toggle-container">
            <span className={billingCycle === 'monthly' ? 'active' : ''}>Monthly</span>
            <button 
              className={`toggle-switch ${billingCycle === 'annually' ? 'annual' : ''}`}
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annually' : 'monthly')}
            >
              <div className="toggle-slider"></div>
            </button>
            <span className={billingCycle === 'annually' ? 'active' : ''}>
              Annually <span className="save-badge">Save 20%</span>
            </span>
          </div>
        </div>

        <div className="pricing-grid">
          {plans.map((plan, index) => (
            <div key={index} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
              {plan.popular && <div className="popular-badge">Most Popular</div>}
              
              <div className="plan-header">
                <h3 className="plan-name">{plan.name}</h3>
                <p className="plan-description">{plan.description}</p>
                
                <div className="plan-price">
                  <span className="price-amount">
                    {plan.price[billingCycle]}
                  </span>
                  <span className="price-period">
                    /{billingCycle === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>
              </div>

              <div className="plan-features">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="feature-included">
                    <span className="feature-check">✓</span>
                    {feature}
                  </div>
                ))}
              </div>

              <button className={`btn ${plan.popular ? 'btn-primary' : 'btn-secondary'} btn-large`}>
                {plan.cta}
              </button>

              <div className="plan-guarantee">
                <span className="guarantee-icon">🔒</span>
                30-day money-back guarantee
              </div>
            </div>
          ))}
        </div>

        <div className="pricing-footer">
          <div className="enterprise-contact">
            <h4>Need Custom Solutions?</h4>
            <p>Contact us for volume discounts, custom integrations, and enterprise features</p>
            <button className="btn btn-secondary">
              Contact Enterprise Team
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;