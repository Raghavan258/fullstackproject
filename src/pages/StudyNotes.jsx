import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import './Pages.css';

const FALLBACK_NOTES = [
  { id: 1, title: 'Preamble — Word by Word Analysis', authorName: 'Priya Menon', createdAt: '2026-04-01', content: 'The preamble uses specific constitutional terms. "Sovereign" means India is not under any external authority. "Socialist" was added by the 42nd Amendment in 1976. "Secular" implies equal treatment of all religions by the state.', tag: 'Preamble' },
  { id: 2, title: 'Fundamental Rights Summary Sheet', authorName: 'Dr. Rao', createdAt: '2026-03-28', content: 'Six categories: Right to Equality (14-18), Right to Freedom (19-22), Right Against Exploitation (23-24), Right to Religion (25-28), Cultural/Education Rights (29-30), Constitutional Remedies (32). Article 31 (Right to Property) was removed by the 44th Amendment.', tag: 'Rights' },
  { id: 3, title: 'Constitution vs. Ordinary Law', authorName: 'Adv. Sharma', createdAt: '2026-03-20', content: 'The Constitution is supreme — all laws must be consistent with it. Any law inconsistent with fundamental rights is void under Article 13. This is called the doctrine of "unconstitutionality." The Supreme Court and High Courts have the power of judicial review.', tag: 'Constitutional Law' },
  { id: 4, title: 'Directive Principles vs Fundamental Rights', authorName: 'Priya Menon', createdAt: '2026-03-15', content: 'DPSPs are non-justiciable guidelines for the state. Though courts cannot enforce them, they are fundamental to governance. The Minerva Mills case (1980) balanced both — neither Fundamental Rights nor DPSPs can be said to be absolutely superior over the other.', tag: 'DPSP' },
  { id: 5, title: 'Emergency Provisions in India', authorName: 'Dr. Rao', createdAt: '2026-03-10', content: 'Three types of emergency: National Emergency (Art. 352) on threat of war or armed rebellion; State Emergency (Art. 356) — President\'s Rule; Financial Emergency (Art. 360). During National Emergency, Right to Freedom (Art. 19) is suspended, but Art. 20 & 21 cannot be suspended.', tag: 'Emergency' },
  { id: 6, title: 'Landmark Cases Every Citizen Must Know', authorName: 'Adv. Sharma', createdAt: '2026-03-05', content: 'Key cases: Kesavananda Bharati (1973) — Basic Structure Doctrine; Maneka Gandhi (1978) — expanded scope of Art. 21; Vishaka (1997) — sexual harassment guidelines; K.S. Puttaswamy (2017) — Right to Privacy as a fundamental right; Navtej Singh Johar (2018) — decriminalized Section 377.', tag: 'Case Studies' },
];

export default function StudyNotes() {
  const [notes, setNotes] = useState(FALLBACK_NOTES);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [tagFilter, setTagFilter] = useState('All');

  const TAGS = ['All', ...new Set(FALLBACK_NOTES.map(n => n.tag))];

  useEffect(() => {
    setLoading(true);
    const endpoint = search ? `/study-notes?search=${encodeURIComponent(search)}&size=20` : '/study-notes?size=20';
    api.get(endpoint)
      .then(res => {
        const data = res.data?.content || res.data;
        if (Array.isArray(data) && data.length > 0) {
          setNotes(data);
        } else {
          setNotes(FALLBACK_NOTES);
        }
      })
      .catch(() => setNotes(FALLBACK_NOTES))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (val) => {
    setSearch(val);
  };

  const filtered = notes.filter(n => {
    const q = search.toLowerCase();
    const matchSearch = !q || n.title.toLowerCase().includes(q) || (n.content || n.preview || '').toLowerCase().includes(q);
    const matchTag = tagFilter === 'All' || (n.tag === tagFilter);
    return matchSearch && matchTag;
  });

  return (
    <div className="page-content container">
      <div className="page-hero">
        <div className="section-tag">📓 Study Notes</div>
        <h1 className="page-title heading-display">Study <span className="saffron-text">Notes</span></h1>
        <p className="page-sub">Educator-authored notes on key constitutional topics. Click any note to expand.</p>
      </div>

      {/* Search + Tag filter */}
      <div className="filter-bar" style={{ marginBottom: '16px' }}>
        <input
          className="form-input search-input"
          placeholder="🔍 Search notes..."
          value={search}
          onChange={e => handleSearch(e.target.value)}
          style={{ flex: 1 }}
        />
        <select
          className="form-select"
          style={{ width: '180px', flexShrink: 0 }}
          value={tagFilter}
          onChange={e => setTagFilter(e.target.value)}
        >
          {TAGS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '16px' }}>⏳</div>
          Loading study notes...
        </div>
      ) : (
        <div className="notes-list">
          {filtered.map(n => (
            <div
              key={n.id}
              className={`note-card glass-card ${expanded === n.id ? 'note-expanded' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => setExpanded(expanded === n.id ? null : n.id)}
            >
              <div className="note-tag badge badge-saffron">{n.tag}</div>
              <h3 className="note-title">{n.title}</h3>
              <p className="note-preview">
                {expanded === n.id
                  ? (n.content || n.preview)
                  : `${((n.content || n.preview) || '').slice(0, 180)}...`
                }
              </p>
              <div className="note-footer">
                <span>✍️ {n.authorName || n.author}</span>
                <span>{n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-IN') : ''}</span>
                <button
                  className="btn btn-outline"
                  style={{ fontSize: '0.78rem', padding: '6px 14px' }}
                  onClick={e => { e.stopPropagation(); setExpanded(expanded === n.id ? null : n.id); }}
                >
                  {expanded === n.id ? '▲ Collapse' : '▼ Read Full Note'}
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              No notes match your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
