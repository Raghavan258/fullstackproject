import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import './Pages.css';

const FALLBACK_ARTICLES = [
  { id: 1, part: 'Part I', title: 'Article 1 — Name and Territory of the Union', summary: 'India, that is Bharat, shall be a Union of States. The States and the territories thereof shall be as specified in the First Schedule.', tags: ['Union', 'Territory'], viewCount: 8420 },
  { id: 2, part: 'Part III', title: 'Article 14 — Right to Equality', summary: 'The State shall not deny to any person equality before the law or the equal protection of the laws within the territory of India. This prohibits class legislation but permits reasonable classification.', tags: ['Fundamental Rights', 'Equality'], viewCount: 12300 },
  { id: 3, part: 'Part III', title: 'Article 19 — Freedom of Speech and Expression', summary: 'All citizens shall have the right to freedom of speech and expression, to assemble peaceably, to form associations, to move freely, and to practise any profession. Subject to reasonable restrictions.', tags: ['Fundamental Rights', 'Freedom'], viewCount: 10850 },
  { id: 4, part: 'Part III', title: 'Article 21 — Right to Life and Personal Liberty', summary: 'No person shall be deprived of his life or personal liberty except according to procedure established by law. The Supreme Court has greatly expanded its scope to include right to livelihood, privacy, health, and dignity.', tags: ['Fundamental Rights', 'Life', 'Liberty'], viewCount: 15200 },
  { id: 5, part: 'Part III', title: 'Article 21A — Right to Education', summary: 'The State shall provide free and compulsory education to all children of the age of six to fourteen years in such manner as the State may, by law, determine.', tags: ['Fundamental Rights', 'Education'], viewCount: 7630 },
  { id: 6, part: 'Part III', title: 'Article 32 — Right to Constitutional Remedies', summary: 'The right to move the Supreme Court by appropriate proceedings for the enforcement of the rights conferred by this Part is guaranteed. Dr. Ambedkar called it the "Heart and Soul of the Constitution."', tags: ['Fundamental Rights', 'Remedies'], viewCount: 9100 },
  { id: 7, part: 'Part IV-A', title: 'Article 51A — Fundamental Duties', summary: 'It shall be the duty of every citizen of India to abide by the Constitution, cherish noble ideals, uphold sovereignty, promote harmony, preserve cultural heritage, protect environment, develop scientific temper, and work towards excellence.', tags: ['Duties', 'Citizens'], viewCount: 6800 },
  { id: 8, part: 'Part V', title: 'Article 79 — Constitution of Parliament', summary: 'There shall be a Parliament for the Union which shall consist of the President and two Houses to be known respectively as the Council of States (Rajya Sabha) and the House of the People (Lok Sabha).', tags: ['Parliament', 'Union'], viewCount: 5200 },
  { id: 9, part: 'Part III', title: 'Article 17 — Abolition of Untouchability', summary: '"Untouchability" is abolished and its practice in any form is forbidden. The enforcement of any disability arising out of "Untouchability" shall be an offence punishable in accordance with law.', tags: ['Fundamental Rights', 'Equality', 'Social Justice'], viewCount: 4900 },
  { id: 10, part: 'Part XVIII', title: 'Article 352 — Proclamation of Emergency', summary: 'If the President is satisfied that a grave emergency exists whereby the security of India or of any part of the territory thereof is threatened, whether by war, external aggression, or armed rebellion, he may proclaim Emergency.', tags: ['Emergency', 'Constitutional Provisions'], viewCount: 4300 },
];

const ALL_PARTS = [...new Set(FALLBACK_ARTICLES.map(a => a.part))];

export default function Articles() {
  const [articles, setArticles] = useState(FALLBACK_ARTICLES);
  const [search, setSearch] = useState('');
  const [filterPart, setFilterPart] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchArticles = (p = 0, s = '') => {
    setLoading(true);
    const params = new URLSearchParams({ page: p, size: 10 });
    if (s) params.set('search', s);
    api.get(`/articles?${params}`)
      .then(res => {
        const content = res.data?.content;
        if (Array.isArray(content) && content.length > 0) {
          setArticles(content);
          setTotalPages(res.data.totalPages || 1);
        } else {
          setArticles(FALLBACK_ARTICLES);
          setTotalPages(1);
        }
      })
      .catch(() => {
        setArticles(FALLBACK_ARTICLES);
        setTotalPages(1);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchArticles(0, ''); }, []);

  const filtered = articles.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = !q || a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q);
    const matchPart = !filterPart || a.part === filterPart;
    return matchSearch && matchPart;
  });

  const handleSearchChange = (val) => {
    setSearch(val);
    if (!val) fetchArticles(0, '');
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') fetchArticles(0, search);
  };

  return (
    <div className="page-content container">
      <div className="page-hero">
        <div className="section-tag">📜 Constitutional Articles</div>
        <h1 className="page-title heading-display">Browse <span className="saffron-text">Articles</span></h1>
        <p className="page-sub">Explore key articles of the Indian Constitution with summaries and expert annotations.</p>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <input
          className="form-input search-input"
          placeholder="🔍 Search articles... (Press Enter to search)"
          value={search}
          onChange={e => handleSearchChange(e.target.value)}
          onKeyDown={handleSearchSubmit}
          style={{ flex: 1 }}
        />
        <select
          className="form-select"
          style={{ width: '180px', flexShrink: 0 }}
          value={filterPart}
          onChange={e => setFilterPart(e.target.value)}
        >
          <option value="">All Parts</option>
          {ALL_PARTS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <button className="btn btn-primary" style={{ flexShrink: 0, padding: '10px 20px', fontSize: '0.85rem' }} onClick={() => fetchArticles(0, search)}>
          Search
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '16px' }}>⏳</div>
          Loading articles...
        </div>
      ) : (
        <>
          <div className="articles-list">
            {filtered.map(a => (
              <div
                key={a.id}
                className={`article-card glass-card ${expanded === a.id ? 'expanded' : ''}`}
                onClick={() => setExpanded(expanded === a.id ? null : a.id)}
              >
                <div className="article-card-header">
                  <div>
                    <span className="badge badge-navy" style={{ marginBottom: '8px', display: 'inline-flex' }}>{a.part}</span>
                    <h3 className="article-title">{a.title}</h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    {a.viewCount > 0 && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>👁 {a.viewCount?.toLocaleString()}</span>
                    )}
                    <span className="article-chevron">{expanded === a.id ? '▲' : '▼'}</span>
                  </div>
                </div>
                {expanded === a.id && (
                  <div className="article-body">
                    <p className="article-summary">{a.summary}</p>
                    {a.legalCommentary && (
                      <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(255,153,51,0.08)', borderLeft: '3px solid var(--saffron)', borderRadius: '4px' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--saffron)', marginBottom: '6px' }}>⚖️ Legal Commentary</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-body)', lineHeight: 1.6 }}>{a.legalCommentary}</div>
                      </div>
                    )}
                    <div className="article-tags">
                      {(a.tags || []).map(t => (
                        <span key={t} className="badge badge-saffron">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                No articles match your search.
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '32px' }}>
              <button className="btn btn-ghost" disabled={page === 0} onClick={() => { setPage(p => p - 1); fetchArticles(page - 1, search); }}>← Prev</button>
              <span style={{ padding: '8px 16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Page {page + 1} of {totalPages}</span>
              <button className="btn btn-ghost" disabled={page >= totalPages - 1} onClick={() => { setPage(p => p + 1); fetchArticles(page + 1, search); }}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
