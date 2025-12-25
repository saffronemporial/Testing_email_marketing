// src/components/Landing/AskSaffronAssistant.jsx
import React, { useState, useEffect } from 'react';
import './AskSaffronAssistant.css';

export default function AskSaffronAssistant() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastAsked, setLastAsked] = useState('');

  // Example questions for quick prompts
  const exampleQuestions = [
    "What are the packing specifications for fresh pomegranates to Dubai?",
    "What quality certifications do you have for agro products?",
    "How do you handle logistics for perishable items?",
    "What documents are needed for exporting to Gulf countries?",
    "What is the typical shipping time for tiles to Saudi Arabia?"
  ];

  const handleAsk = async () => {
    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }
    
    if (question === lastAsked) {
      setError('You already asked this question. Please ask something different.');
      return;
    }

    setLoading(true);
    setError('');
    setAnswer('');
    setLastAsked(question);

    try {
      const apiEndpoint = '/api/saffron-ai-public';
      console.log('Sending request to:', apiEndpoint);
      
      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          question: question.trim(),
          timestamp: new Date().toISOString()
        }),
      });

      const responseText = await res.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response:', parseError, responseText);
        throw new Error('Invalid response from server');
      }

      if (!res.ok) {
        const errorMsg = data?.detail || data?.error || `API error: ${res.status}`;
        throw new Error(errorMsg);
      }

      setAnswer(data.answer || 'No answer returned. Please try again.');
      
    } catch (e) {
      console.error('AskSaffronAssistant error:', e);
      
      // User-friendly error messages
      if (e.message.includes('502') || e.message.includes('Bad Gateway')) {
        setError('AI service is temporarily unavailable. Please try again in a few minutes.');
      } else if (e.message.includes('rate limit')) {
        setError('Too many requests. Please wait a moment before trying again.');
      } else if (e.message.includes('network') || e.message.includes('Failed to fetch')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(`Error: ${e.message || 'Unable to reach AI assistant. Please try again.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (example) => {
    setQuestion(example);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  // Clear error when user starts typing
  useEffect(() => {
    if (error && question !== lastAsked) {
      setError('');
    }
  }, [question, error, lastAsked]);

  return (
    <section id="ask-saffron-ai" className="ai-section">
      <div className="ai-inner">
        <div className="ai-header">
          <h2 className="ai-title">Ask Saffron AI Assistant</h2>
          <p className="ai-sub">
            Get instant answers about our products, export processes, logistics, and quality standards.  
            Powered by Google Gemini AI.
          </p>
          
          {/* Example Questions */}
          <div className="ai-examples">
            <p className="ai-examples-label">Try asking:</p>
            <div className="ai-examples-grid">
              {exampleQuestions.map((example, index) => (
                <button
                  key={index}
                  className="ai-example-btn"
                  onClick={() => handleExampleClick(example)}
                  disabled={loading}
                  type="button"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="ai-grid">
          <div className="ai-input-panel">
            <label className="ai-label">Your Export Question</label>
            <textarea
              className="ai-textarea"
              rows={5}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Example: What are the packing specifications for fresh pomegranates to Dubai?"
              disabled={loading}
            />
            
            <div className="ai-char-count">
              {question.length}/1200 characters
            </div>
            
            {error && (
              <div className="ai-error">
                <span className="ai-error-icon">⚠</span>
                {error}
              </div>
            )}

            <div className="ai-actions">
              <button
                className="ai-btn"
                onClick={handleAsk}
                disabled={loading || !question.trim() || question.length > 1200}
              >
                {loading ? (
                  <>
                    <span className="ai-spinner"></span>
                    Processing...
                  </>
                ) : (
                  'Ask Saffron AI'
                )}
              </button>
              
              <button
                className="ai-btn-secondary"
                onClick={() => {
                  setQuestion('');
                  setAnswer('');
                  setError('');
                  setLastAsked('');
                }}
                disabled={loading}
                type="button"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="ai-answer-panel">
            <div className="ai-answer-header">
              <span className="ai-chip">AI Response</span>
              {answer && (
                <span className="ai-timestamp">
                  Generated just now
                </span>
              )}
            </div>
            
            <div className="ai-answer-body">
              {loading ? (
                <div className="ai-loading">
                  <div className="ai-loading-spinner"></div>
                  <p>Analyzing your export question...</p>
                  <p className="ai-loading-sub">Please wait a moment</p>
                </div>
              ) : answer ? (
                <div className="ai-answer-text">
                  {answer.split('\n').map((line, idx) => (
                    <p key={idx}>{line || <br />}</p>
                  ))}
                </div>
              ) : error ? (
                <div className="ai-placeholder error">
                  <p>Unable to generate response. Please try again.</p>
                </div>
              ) : (
                <div className="ai-placeholder">
                  <p>Your AI-generated response will appear here.</p>
                  <p className="ai-placeholder-sub">
                    Ask about export documentation, logistics, quality standards, or product specifications.
                  </p>
                </div>
              )}
            </div>
            
            {answer && !loading && (
              <div className="ai-answer-footer">
                <p className="ai-disclaimer">
                  AI-generated content. For precise requirements, please contact our export team.
                </p>
              </div>
            )}
          </div>
        </div>

        <p className="ai-footnote">
          Note: This AI assistant provides general export guidance based on industry knowledge. 
          It does not handle confidential information, pricing, or legal commitments. 
          For specific inquiries, please contact our export department directly.
        </p>
      </div>
    </section>
  );
}
