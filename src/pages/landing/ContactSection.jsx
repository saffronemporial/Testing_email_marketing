// src/components/Landing/ContactSection.jsx
import React, { useState } from 'react';
import './ContactSection.css';

const ContactSection = () => {
  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    message: '',
  });
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ state: 'submitting', message: '' });

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Failed to send message');
      }

      setStatus({ state: 'success', message: 'Message sent successfully.' });
      setForm({ name: '', company: '', email: '', message: '' });
    } catch (err) {
      console.error('Contact form error', err);
      setStatus({
        state: 'error',
        message: 'Something went wrong. Please try again.',
      });
    }
  };

  return (
    <section id="contact" className="ct-wrapper">
      <div className="ct-inner">
        <div className="ct-left">
          <h2>Discuss Your Next Shipment</h2>
          <p>
            Share your requirements for pomegranates, onions, grapes, bananas,
            chillies, cumin, green coconuts, granite, tiles or electric toys –
            we will respond with a structured export proposal.
          </p>
          <ul className="ct-points">
            <li>End-to-end export documentation & logistics</li>
            <li>Flexible contract structures (FOB / CFR / CIF)</li>
            <li>Dedicated account manager for GCC & EU markets</li>
          </ul>
        </div>

        <div className="ct-right">
          <form onSubmit={handleSubmit} className="ct-form">
            <div className="ct-row">
              <label>
                Full name
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Company
                <input
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                />
              </label>
            </div>
            <label className="ct-full">
              Work email
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </label>
            <label className="ct-full">
              Brief requirement
              <textarea
                name="message"
                rows={4}
                value={form.message}
                onChange={handleChange}
                required
              />
            </label>

            <button
              type="submit"
              className="ct-submit"
              disabled={status.state === 'submitting'}
            >
              {status.state === 'submitting'
                ? 'Sending...'
                : 'Send inquiry via EmailJS'}
            </button>

            {status.state === 'success' && (
              <p className="ct-status success">{status.message}</p>
            )}
            {status.state === 'error' && (
              <p className="ct-status error">{status.message}</p>
            )}
          </form>
        </div>
      </div>
      <div className="ct-footer-note">
        Saffron Emporial • Export hub for fresh produce, spices, granite and
        more – powered by transparent technology.
      </div>
    </section>
  );
};

export default ContactSection;
