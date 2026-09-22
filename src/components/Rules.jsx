import React, { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import '../styles/Rules.css';
import { LoadingSpinner } from './LoadingSpinner';

export const Rules = () => {
  const [markdown, setMarkdown] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    fetch('/rules_context.md')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch rules');
        return res.text();
      })
      .then((text) => {
        setMarkdown(text);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load rules content.');
        setLoading(false);
      });
  }, []);

  // Extract sections (H2) for the sticky side table of contents
  const tocItems = useMemo(() => {
    if (!markdown) return [];
    const lines = markdown.split('\n');
    const items = [];
    lines.forEach((line) => {
      const match = line.match(/^##\s+(.+)$/);
      if (match) {
        const title = match[1].trim();
        const id = title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');
        items.push({ title, id });
      }
    });
    return items;
  }, [markdown]);

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return (
      <div className="rules-page-loading">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rules-page">
        <div className="rules-hero">
          <h1>Rules & Guidelines</h1>
        </div>
        <div className="rules-error-card">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rules-page">
      {/* Editorial Header */}
      <header className="rules-hero">
        <div className="rules-hero-badge">Official League Handbook</div>
        <h1 className="rules-hero-title">Rules & Responsibilities</h1>
        <p className="rules-hero-subtitle">
          La Crosse Team Tennis Association · Summer Season Guidelines, Scoring & Etiquette
        </p>

        {/* Quick Search */}
        <div className="rules-search-wrapper">
          <svg className="rules-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="search"
            placeholder="Search rules (e.g. tiebreak, heat, scoring, balls)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rules-search-input"
            aria-label="Search rules"
          />
          {searchQuery && (
            <button
              type="button"
              className="rules-search-clear"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </header>

      {/* Main Layout: Sticky Sidebar Table of Contents + Reader Body */}
      <div className="rules-layout">
        {tocItems.length > 0 && (
          <aside className="rules-toc-aside" aria-label="Table of contents">
            <div className="rules-toc-card">
              <div className="rules-toc-header">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
                <span>Sections</span>
              </div>
              <nav className="rules-toc-nav">
                {tocItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => scrollToSection(item.id)}
                    className={`rules-toc-link ${activeSection === item.id ? 'active' : ''}`}
                  >
                    {item.title}
                  </button>
                ))}
              </nav>
            </div>
          </aside>
        )}

        <main className="rules-content-body">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: () => null, // Suppress markdown H1 as it is rendered cleanly in the hero
              h2: ({ children }) => {
                const text = String(children);
                const id = text
                  .toLowerCase()
                  .replace(/[^\w\s-]/g, '')
                  .replace(/\s+/g, '-');
                return (
                  <div className="rules-section-anchor" id={id}>
                    <h2 className="rules-section-title">{children}</h2>
                  </div>
                );
              },
              h3: ({ children }) => <h3 className="rules-sub-title">{children}</h3>,
              blockquote: ({ children }) => (
                <div className="rules-callout">
                  <div className="rules-callout-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                  </div>
                  <div className="rules-callout-body">{children}</div>
                </div>
              ),
              p: ({ children }) => {
                const text = String(children);
                // If this is the quick meta subtitle right under markdown H1
                if (text.includes('La Crosse Team Tennis Association') && text.includes('Updated')) {
                  return null;
                }
                return <p className="rules-paragraph">{children}</p>;
              },
              ul: ({ children }) => <ul className="rules-list">{children}</ul>,
              li: ({ children }) => <li className="rules-list-item">{children}</li>,
              strong: ({ children }) => <strong className="rules-strong">{children}</strong>,
            }}
          >
            {markdown}
          </ReactMarkdown>
        </main>
      </div>
    </div>
  );
};
