import React, { useState, useEffect } from "react";
import Turnstile from "react-turnstile";
import { supabase } from "../scripts/supabaseClient";
import { useAuth } from "../context/AuthProvider";
import { LoadingSpinner } from "./LoadingSpinner";
import ReactMarkdown from 'react-markdown';
import "../styles/SuggestionBox.css";

export const SuggestionBox = () => {
  const { user, session } = useAuth();
  const [suggestion, setSuggestion] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [status, setStatus] = useState("idle"); // idle, submitting, success, error
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Fetch user's suggestion history
  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    const { data, error } = await supabase
      .from('suggestions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setHistory(data);
    }
    setLoadingHistory(false);
  };

  const handleSuggestionChange = (e) => {
    setSuggestion(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!turnstileToken) {
      setMessage("Please complete the CAPTCHA.");
      return;
    }
    if (suggestion.length < 10 || suggestion.length > 1000) {
      setMessage("Suggestion must be between 10 and 1000 characters.");
      return;
    }

    setStatus("submitting");
    setMessage("");

    try {
      const { data, error } = await supabase.functions.invoke("submit-suggestion", {
        body: {
          content: suggestion,
          captchaToken: turnstileToken,
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (error) throw error;

      setStatus("success");
      setMessage("Thank you for your feedback! Jules has received it.");
      setSuggestion("");
      setTurnstileToken("");
      fetchHistory(); // Refresh the list
    } catch (error) {
      console.error("Error submitting suggestion:", error);
      setStatus("error");
      setMessage(error.message || "Failed to submit suggestion. Please try again.");
    }
  };

  if (!user) {
    return (
      <div className="suggestion-box-page">
        <div className="suggestion-box-container">
          <h1>Suggestion Box</h1>
          <p>Please <a href="/login">log in</a> to submit suggestions and see AI feedback.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="suggestion-box-page">
      <div className="suggestion-box-container">
        <h1>Suggestion Box</h1>
        <p>We value your feedback. Submit a suggestion and Jules (our AI Agent) will review it!</p>

        {status === "success" && (
          <div className="success-message">
            <p>{message}</p>
            <button onClick={() => setStatus("idle")} className="submit-button">
              Send another
            </button>
          </div>
        )}

        {status !== "success" && (
          <form onSubmit={handleSubmit} className="suggestion-form">
            <div className="form-group">
              <label htmlFor="suggestion">
                Your Suggestion (10-1000 characters)
              </label>
              <textarea
                id="suggestion"
                value={suggestion}
                onChange={handleSuggestionChange}
                minLength={10}
                maxLength={1000}
                required
                placeholder="Type your suggestion here... e.g., 'We should add a ladder league feature.'"
                aria-describedby="suggestion-counter"
              />
              <div id="suggestion-counter" className="character-count">
                {suggestion.length} / 1000 characters
              </div>
            </div>

            <div className="captcha-container">
              <Turnstile
                sitekey={
                  import.meta.env.VITE_TURNSTILE_SITE_KEY ||
                  "1x00000000000000000000AA"
                }
                onVerify={(token) => setTurnstileToken(token)}
                onError={() => setMessage("CAPTCHA error.")}
                onExpire={() => setTurnstileToken("")}
              />
            </div>

            {message && <div className={`message ${status}`}>{message}</div>}

            <button
              type="submit"
              className="submit-button"
              disabled={
                status === "submitting" ||
                !turnstileToken ||
                suggestion.length < 10
              }
            >
              {status === "submitting" ? (
                <span className="submit-loading-content">
                  <LoadingSpinner size="sm" />
                  Submitting...
                </span>
              ) : (
                "Submit Suggestion"
              )}
            </button>
          </form>
        )}

        <hr className="divider" />

        <div className="suggestions-history">
          <h2>Your Past Suggestions</h2>
          {loadingHistory ? (
            <LoadingSpinner />
          ) : history.length === 0 ? (
            <p>No suggestions yet.</p>
          ) : (
            <ul className="history-list">
              {history.map((item) => (
                <li key={item.id} className="history-item">
                  <div className="history-content">
                    <strong>You said:</strong>
                    <p>{item.content}</p>
                    <small>{new Date(item.created_at).toLocaleDateString()}</small>
                  </div>
                  {item.jules_response && (
                    <div className="jules-response">
                      <div className="jules-header">
                        <span className="jules-avatar">🤖</span> <strong>Jules replied:</strong>
                      </div>
                      <div className="jules-text">
                        <ReactMarkdown>{item.jules_response.answer || item.jules_response.text || "Processed"}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

