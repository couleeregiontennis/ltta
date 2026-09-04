import React, { useState, useRef, useEffect } from 'react';
import api from '../scripts/apiClient';
import '../styles/AskTheUmpire.css';

export const AskTheUmpire = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [askedQuestion, setAskedQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    setAskedQuestion(q);
    setQuery('');
    setLoading(true);
    setAnswer('');
    setError(null);

    try {
      const data = await api.post('/ai/ask-umpire', { query: q });
      setAnswer(data.answer || "I couldn't find an answer to that.");
    } catch (err) {
      console.error('AskTheUmpire error:', err);
      setError('Sorry, something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        className={`umpire-trigger ${isOpen ? 'hidden' : ''}`}
        onClick={() => setIsOpen(true)}
        aria-label="Ask the Umpire"
      >
        🎾 Ask the Umpire
      </button>

      {isOpen && (
        <div className="umpire-widget">
          <div className="umpire-header">
            <h3>Ask the Umpire</h3>
            <button
              className="umpire-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <div className="umpire-body">
            {askedQuestion && (
              <div className="umpire-user-query">
                <span className="umpire-query-label">You:</span> {askedQuestion}
              </div>
            )}
            {answer && <div className="umpire-response">{answer}</div>}
            {error && <div className="umpire-error">{error}</div>}
            {!answer && !loading && !error && !askedQuestion && (
              <p className="umpire-intro">
                Have a question about the rules? Ask me anything!
              </p>
            )}
            {loading && <div className="umpire-loading">Thinking...</div>}
          </div>
          <form onSubmit={handleSubmit} className="umpire-form">
            <div className="umpire-input-wrapper">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., Can I play down a level?"
                disabled={loading}
                className="umpire-input"
                maxLength={300}
                aria-describedby="umpire-query-counter"
              />
              <div id="umpire-query-counter" className="umpire-counter">
                {query.length} / 300
              </div>
            </div>
            <button type="submit" disabled={loading || !query.trim()} className="umpire-submit">
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
};
