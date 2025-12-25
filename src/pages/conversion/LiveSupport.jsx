// LiveSupport.jsx
import React, { useState, useEffect } from 'react';
import './LiveSupport.css';

const LiveSupport = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isAI, setIsAI] = useState(true);
  const [expertAvailable, setExpertAvailable] = useState(true);

  const supportChannels = [
    {
      id: 'whatsapp',
      name: 'WhatsApp Business',
      number: '+91-7977133023',
      icon: '📱',
      status: 'online',
      responseTime: '2 minutes'
    },
    {
      id: 'phone',
      name: 'International Helpline',
      number: '+91-7977133023',
      icon: '📞',
      status: 'online',
      responseTime: 'Immediate'
    },
    {
      id: 'email',
      name: 'Email Support',
      address: 'Saffronemporial@gmail.com',
      icon: '✉️',
      status: 'online',
      responseTime: '4 hours'
    },
    {
      id: 'video',
      name: 'Video Consultation',
      link: 'Schedule Meeting',
      icon: '🎥',
      status: 'available',
      responseTime: '24 hours'
    }
  ];

  const expertTeam = [
    {
      id: 1,
      name: 'Dr. Priya Sharma',
      role: 'Agricultural Export Specialist',
      expertise: 'International Compliance & Quality Standards',
      experience: '12 years',
      languages: ['English', 'Hindi', 'Arabic'],
      avatar: '👩‍🔬',
      available: true
    },
    {
      id: 2,
      name: 'Rajiv Malhotra',
      role: 'Logistics Director',
      expertise: 'Global Shipping & Customs',
      experience: '15 years',
      languages: ['English', 'Hindi', 'French'],
      avatar: '👨‍💼',
      available: true
    },
    {
      id: 3,
      name: 'Aisha Khan',
      role: 'Product Quality Manager',
      expertise: 'Saffron & Spice Grading',
      experience: '8 years',
      languages: ['English', 'Urdu', 'Arabic'],
      avatar: '👩‍🌾',
      available: false
    }
  ];

  const aiResponses = [
    "I can help you with export pricing, quality specifications, and shipping timelines for our agricultural products.",
    "Based on current market rates, I can provide you with competitive pricing for bulk orders.",
    "Our saffron is ISO 22000 certified and comes with full traceability from farm to export.",
    "We guarantee 48-hour response time for all export inquiries with detailed quotations.",
    "Would you like me to connect you with our regional export specialist for customized assistance?"
  ];

  const handleSendMessage = () => {
    if (!userInput.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: userInput,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };

    setChatMessages(prev => [...prev, newMessage]);
    setUserInput('');

    // AI response simulation
    setTimeout(() => {
      const aiMessage = {
        id: Date.now() + 1,
        text: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString()
      };
      setChatMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const handleConnectExpert = () => {
    setIsAI(false);
    const expertMessage = {
      id: Date.now(),
      text: "Hello! I'm Rajiv, your export specialist. How can I assist you with your international order today?",
      sender: 'expert',
      timestamp: new Date().toLocaleTimeString()
    };
    setChatMessages(prev => [...prev, expertMessage]);
  };

  return (
    <section id="live-support" className="live-support-section">
      <div className="support-container">
        <div className="support-header">
          <h2 className="support-title">
            <span className="title-glow">24/7 Global Support</span>
          </h2>
          <p className="support-subtitle">
            Instant Assistance for International Export Inquiries
          </p>
        </div>

        <div className="support-grid">
          {/* Left Column - Contact Channels */}
          <div className="contact-channels">
            <h3 className="channels-title">Direct Contact Channels</h3>
            <div className="channels-grid">
              {supportChannels.map(channel => (
                <div key={channel.id} className="channel-card">
                  <div className="channel-icon">{channel.icon}</div>
                  <div className="channel-info">
                    <h4>{channel.name}</h4>
                    <p className="channel-detail">
                      {channel.number || channel.address || channel.link}
                    </p>
                    <div className="channel-status">
                      <span className={`status-indicator ${channel.status}`}></span>
                      Response: {channel.responseTime}
                    </div>
                  </div>
                  <div className="channel-action">
                    <button className="connect-btn">Connect</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Expert Team */}
            <div className="expert-team">
              <h3 className="experts-title">Our Export Experts</h3>
              <div className="experts-grid">
                {expertTeam.map(expert => (
                  <div key={expert.id} className="expert-card">
                    <div className="expert-avatar">{expert.avatar}</div>
                    <div className="expert-info">
                      <h4>{expert.name}</h4>
                      <p className="expert-role">{expert.role}</p>
                      <p className="expert-expertise">{expert.expertise}</p>
                      <div className="expert-meta">
                        <span>Exp: {expert.experience}</span>
                        <span className={`availability ${expert.available ? 'online' : 'offline'}`}>
                          {expert.available ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Live Chat */}
          <div className="live-chat-container">
            <div className="chat-header">
              <div className="chat-status">
                <div className={`ai-status ${isAI ? 'active' : ''}`}>
                  <span className="status-pulse"></span>
                  AI Assistant Active
                </div>
                <button 
                  className="expert-connect-btn"
                  onClick={handleConnectExpert}
                  disabled={!expertAvailable}
                >
                  Connect to Human Expert
                </button>
              </div>
            </div>

            <div className="chat-messages">
              {chatMessages.map(message => (
                <div key={message.id} className={`message ${message.sender}`}>
                  <div className="message-bubble">
                    <p>{message.text}</p>
                    <span className="message-time">{message.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="chat-input-container">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about pricing, shipping, or product quality..."
                className="chat-input"
              />
              <button onClick={handleSendMessage} className="send-btn">
                Send
              </button>
            </div>

            <div className="quick-questions">
              <h4>Quick Questions:</h4>
              <div className="quick-buttons">
                <button onClick={() => setUserInput("What's the current price for Bhagwa pomegranate?")}>
                  Pomegranate Pricing
                </button>
                <button onClick={() => setUserInput("Do you ship to Dubai?")}>
                  Shipping to Dubai
                </button>
                <button onClick={() => setUserInput("What certifications do you have?")}>
                  Quality Certifications
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Global Offices */}
        <div className="global-offices">
          <h3 className="offices-title">Our International Offices</h3>
          <div className="offices-grid">
            <div className="office-card">
              <h4>🇮🇳 India Headquarters</h4>
              <p>#7,8 Laxmi icon, Sec 44A Seawoods</p>
              <p>New Mumbai 400706, Maharashtra, India</p>
              <p>+91-7977133023</p>
            </div>
            <div className="office-card">
              <h4>🇦🇪 Dubai Distribution Hub</h4>
              <p>Dubai Multi Commodities Centre</p>
              <p>Plot No. 357-134, Jebel Ali Free Zone</p>
              <p>Dubai, United Arab Emirates</p>
            </div>
            <div className="office-card">
              <h4>🇧🇩 Bangladesh Office</h4>
              <p>Chittagong Export Processing Zone</p>
              <p>Block C-12, Commercial Area</p>
              <p>Chittagong, Bangladesh</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveSupport;