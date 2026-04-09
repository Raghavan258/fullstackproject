import React, { useState, useEffect, useCallback } from 'react';
import { queryApi, articleApi } from '../../services/api.js';
import './RoleDashboard.css';

const LANDMARK_CASES = [
  { year: '2024', name: 'Mineral Area Dev. Authority v. Steel Authority', note: 'States have power to tax mineral rights.' },
  { year: '2023', name: 'Supriyo v. Union of India', note: 'SC declined to recognise same-sex marriage as a constitutional right.' },
  { year: '2022', name: 'S.G. Vombatkere v. Union of India', note: 'Section 124A (Sedition) sent to 5-judge bench; enforcement stayed.' },
  { year: '2017', name: 'K.S. Puttaswamy v. Union of India', note: 'Right to Privacy is a fundamental right under Article 21.' },
];

export default function LegalExpertDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('commentary');
  const [articles, setArticles] = useState([]);
  const [flaggedArticles, setFlaggedArticles] = useState([]);
  const [queries, setQueries] = useState([]);
  const [commentaryInputs, setCommentaryInputs] = useState({});
  const [replies, setReplies] = useState({});
  const [toast, setToast] = useState('');
  const [saving, setSaving] = useState({});
  const [flagging, setFlagging] = useState({});
  const [submitting, setSubmitting] = useState({});
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [loadingFlagged, setLoadingFlagged] = useState(false);
  const [loadingQueries, setLoadingQueries] = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const fetchArticles = useCallback(async () => {
    setLoadingArticles(true);
    try {
      const res = await articleApi.getAll();
      const data = res.data?.content || res.content || res.data || [];
      setArticles(Array.isArray(data) ? data : []);
    } catch { setArticles([]); }
    setLoadingArticles(false);
  }, []);

  const fetchFlagged = useCallback(async () => {
    setLoadingFlagged(true);
    try {
      const res = await articleApi.getFlagged();
      const data = res.data || res || [];
      setFlaggedArticles(Array.isArray(data) ? data : []);
    } catch { setFlaggedArticles([]); }
    setLoadingFlagged(false);
  }, []);

  const fetchQueries = useCallback(async () => {
    setLoadingQueries(true);
    try {
      const res = await queryApi.getAll();
      const data = res.data || res || [];
      setQueries(Array.isArray(data) ? data : []);
    } catch { setQueries([]); }
    setLoadingQueries(false);
  }, []);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);
  useEffect(() => {
    if (activeTab === 'flagged') fetchFlagged();
    if (activeTab === 'queries') fetchQueries();
  }, [activeTab, fetchFlagged, fetchQueries]);

  const saveCommentary = async (id) => {
    const commentary = commentaryInputs[id]?.trim();
    if (!commentary) return;
    setSaving(p => ({ ...p, [id]: true }));
    try {
      const res = await articleApi.saveCommentary(id, commentary);
      const updated = res.data || res;
      setArticles(p => p.map(a => a.id === id ? { ...a, legalCommentary: updated.legalCommentary || commentary } : a));
      setCommentaryInputs(p => ({ ...p, [id]: '' }));
      showToast('✅ Commentary saved to the article!');
    } catch { showToast('❌ Failed to save commentary.'); }
    setSaving(p => ({ ...p, [id]: false }));
  };

  const flagArticle = async (id) => {
    setFlagging(p => ({ ...p, [id]: true }));
    try {
      await articleApi.flag(id);
      setArticles(p => p.map(a => a.id === id ? { ...a, flagged: true } : a));
      showToast('🚩 Article flagged for admin review!');
    } catch { showToast('❌ Failed to flag article.'); }
    setFlagging(p => ({ ...p, [id]: false }));
  };

  const selfAssign = async (queryId) => {
    try {
      const res = await queryApi.selfAssign(queryId);
      const updated = res.data || res;
      setQueries(p => p.map(q => q.id === queryId ? updated : q));
      showToast('✅ Query assigned to you!');
    } catch { showToast('❌ Could not assign query.'); }
  };

  const submitAnswer = async (queryId) => {
    const answer = replies[queryId]?.trim();
    if (!answer) return;
    setSubmitting(p => ({ ...p, [queryId]: true }));
    try {
      const res = await queryApi.answer(queryId, answer);
      const updated = res.data || res;
      setQueries(p => p.map(q => q.id === queryId ? updated : q));
      setReplies(p => ({ ...p, [queryId]: '' }));
      showToast('✅ Answer submitted!');
    } catch { showToast('❌ Failed to submit answer.'); }
    setSubmitting(p => ({ ...p, [queryId]: false }));
  };

  const myQueries = queries.filter(q => q.status === 'ASSIGNED');
  const openQueries = queries.filter(q => q.status === 'PENDING');

  return (
    <div className="role-dashboard">
      {toast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', background: 'var(--saffron)', color: '#000',
          padding: '12px 20px', borderRadius: '8px', fontWeight: 700, zIndex: 9999, boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}>
          {toast}
        </div>
      )}

      <div className="dash-header">
        <div>
          <div className="section-tag">⚖️ Legal Expert</div>
          <h1 className="dash-title heading-display">Legal <span className="saffron-text">Review Panel</span></h1>
          <p className="dash-sub">Welcome, {user?.name || 'Counsellor'}! Add commentary, flag content, and answer legal queries.</p>
        </div>
      </div>

      <div className="grid-4 mb-24">
        <div className="stat-card"><div className="stat-value">{articles.length}</div><div className="stat-label">📄 Articles</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color: '#ef4444' }}>{articles.filter(a => a.flagged).length + flaggedArticles.length}</div><div className="stat-label">🚩 Flagged</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color: '#22c55e' }}>{articles.filter(a => a.legalCommentary).length}</div><div className="stat-label">✍️ Commented</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color: '#f59e0b' }}>{myQueries.length + openQueries.length}</div><div className="stat-label">❓ Open Queries</div></div>
      </div>

      <div className="dash-tabs">
        {[
          { id: 'commentary', label: '✍️ Article Commentary' },
          { id: 'flagged', label: '🚩 Flagged Articles' },
          {
            id: 'queries', label: (myQueries.length + openQueries.length) > 0
              ? <span>❓ Queries <span style={{ background: '#ff4d6d', color: 'white', borderRadius: '9999px', fontSize: '0.68rem', padding: '1px 7px', fontWeight: 800, marginLeft: 4 }}>{myQueries.length + openQueries.length}</span></span>
              : '❓ Queries'
          },
          { id: 'cases', label: '📚 Landmark Cases' },
        ].map(tab => (
          <button key={tab.id} className={`dash-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}>{tab.label}</button>
        ))}
      </div>

      {/* ── Commentary Tab ─────────────────────────────────────────────── */}
      {activeTab === 'commentary' && (
        <div className="flex flex-col gap-16">
          {loadingArticles ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading articles…</div>
          ) : articles.length === 0 ? (
            <div className="glass-card dash-section-card" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📭</div>
              No articles found.
            </div>
          ) : articles.map(a => (
            <div key={a.id} className="glass-card dash-section-card">
              <div className="section-card-header">
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--saffron)', fontWeight: 700, marginBottom: '4px' }}>{a.part}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{a.title}</div>
                  {a.summary && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{a.summary.slice(0, 100)}…</div>}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  {a.flagged ? (
                    <span className="badge badge-red">🚩 Flagged</span>
                  ) : (
                    <button className="btn btn-ghost" style={{ fontSize: '0.75rem', padding: '4px 10px', color: '#ef4444', borderColor: '#ef444433' }}
                      onClick={() => flagArticle(a.id)} disabled={flagging[a.id]}>
                      {flagging[a.id] ? <span className="spinner" /> : '🚩 Flag'}
                    </button>
                  )}
                </div>
              </div>

              {a.legalCommentary && (
                <div style={{
                  marginTop: '10px', background: 'rgba(59,130,246,0.08)', borderLeft: '3px solid #3b82f6',
                  padding: '10px 14px', borderRadius: '0 6px 6px 0', fontSize: '0.82rem'
                }}>
                  <div style={{ fontWeight: 700, color: '#3b82f6', marginBottom: '4px', fontSize: '0.72rem' }}>CURRENT COMMENTARY</div>
                  {a.legalCommentary}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <textarea className="form-input" rows={2}
                  placeholder={a.legalCommentary ? 'Update legal commentary…' : 'Add legal commentary…'}
                  value={commentaryInputs[a.id] || ''}
                  onChange={e => setCommentaryInputs(p => ({ ...p, [a.id]: e.target.value }))}
                  style={{ resize: 'vertical' }} />
                <button className="btn btn-primary"
                  style={{ flexShrink: 0, alignSelf: 'flex-end', fontSize: '0.82rem', padding: '10px 16px' }}
                  onClick={() => saveCommentary(a.id)} disabled={saving[a.id]}>
                  {saving[a.id] ? <span className="spinner" /> : 'Save'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Flagged Tab ─────────────────────────────────────────────────── */}
      {activeTab === 'flagged' && (
        <div className="flex flex-col gap-16">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-8px' }}>
            <button className="btn btn-ghost" style={{ fontSize: '0.75rem', padding: '5px 14px' }} onClick={fetchFlagged}>🔄 Refresh</button>
          </div>
          {loadingFlagged ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading…</div>
          ) : flaggedArticles.length === 0 ? (
            <div className="glass-card dash-section-card" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>✅</div>
              No flagged articles. All content is clear!
            </div>
          ) : flaggedArticles.map(a => (
            <div key={a.id} className="glass-card dash-section-card">
              <div className="section-card-header">
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--saffron)', fontWeight: 700 }}>{a.part}</div>
                  <div style={{ fontWeight: 700 }}>{a.title}</div>
                </div>
                <span className="badge badge-red">🚩 Flagged</span>
              </div>
              {a.legalCommentary && (
                <div style={{
                  marginTop: '10px', background: 'rgba(59,130,246,0.08)', borderLeft: '3px solid #3b82f6',
                  padding: '10px 14px', borderRadius: '0 6px 6px 0', fontSize: '0.82rem'
                }}>
                  {a.legalCommentary}
                </div>
              )}
              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <textarea className="form-input" rows={2} placeholder="Update commentary before admin reviews…"
                  value={commentaryInputs[a.id] || ''}
                  onChange={e => setCommentaryInputs(p => ({ ...p, [a.id]: e.target.value }))}
                  style={{ resize: 'vertical' }} />
                <button className="btn btn-primary"
                  style={{ flexShrink: 0, alignSelf: 'flex-end', fontSize: '0.82rem', padding: '10px 16px' }}
                  onClick={() => saveCommentary(a.id)} disabled={saving[a.id]}>
                  {saving[a.id] ? <span className="spinner" /> : 'Update'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Queries Tab ─────────────────────────────────────────────────── */}
      {activeTab === 'queries' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {myQueries.length} assigned to you · {openQueries.length} open for pickup
            </span>
            <button className="btn btn-ghost" style={{ fontSize: '0.75rem', padding: '5px 14px' }} onClick={fetchQueries}>🔄 Refresh</button>
          </div>
          {loadingQueries ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading queries…</div>
          ) : queries.filter(q => q.status !== 'CLOSED').length === 0 ? (
            <div className="glass-card dash-section-card" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📭</div>
              No open queries. Citizens' legal questions will appear here.
            </div>
          ) : queries.filter(q => q.status !== 'CLOSED').map(q => (
            <div key={q.id} className="glass-card dash-section-card" style={{ marginBottom: '16px' }}>
              <div className="section-card-header">
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', gap: '12px' }}>
                    <span>👤 {q.citizen?.fullName || 'Citizen'}</span>
                    {q.createdAt && <span>🕐 {new Date(q.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>}
                  </div>
                  <div style={{ fontWeight: 600 }}>Q: {q.question}</div>
                </div>
                {q.status === 'PENDING' ? (
                  <button className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '5px 12px', flexShrink: 0 }}
                    onClick={() => selfAssign(q.id)}>Pick Up</button>
                ) : (
                  <span className={`badge ${q.status === 'ANSWERED' ? 'badge-green' : 'badge-saffron'}`}>
                    {q.status === 'ANSWERED' ? '✅ Answered' : '🔄 Assigned'}
                  </span>
                )}
              </div>
              {q.status === 'ANSWERED' ? (
                <div style={{
                  marginTop: '10px', background: 'rgba(34,197,94,0.08)', borderLeft: '3px solid #22c55e',
                  padding: '10px 14px', borderRadius: '0 6px 6px 0', fontSize: '0.85rem'
                }}>✅ {q.answer}</div>
              ) : q.status === 'ASSIGNED' && (
                <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
                  <textarea className="form-input" rows={2} placeholder="Provide your legal answer…"
                    value={replies[q.id] || ''} onChange={e => setReplies(p => ({ ...p, [q.id]: e.target.value }))}
                    style={{ resize: 'vertical' }} />
                  <button className="btn btn-primary"
                    style={{ flexShrink: 0, alignSelf: 'flex-end', fontSize: '0.82rem', padding: '10px 16px' }}
                    onClick={() => submitAnswer(q.id)} disabled={submitting[q.id]}>
                    {submitting[q.id] ? <span className="spinner" /> : 'Answer'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Cases Tab ─────────────────────────────────────────────────── */}
      {activeTab === 'cases' && (
        <div className="flex flex-col gap-16">
          <div className="glass-card dash-section-card">
            <div className="section-card-header"><h3>📚 Landmark Constitutional Cases</h3></div>
            <div className="flex flex-col gap-16" style={{ marginTop: '16px' }}>
              {LANDMARK_CASES.map(c => (
                <div key={c.name} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{
                    background: 'var(--saffron)', color: '#000', borderRadius: '6px', padding: '4px 10px',
                    fontSize: '0.72rem', fontWeight: 800, whiteSpace: 'nowrap', flexShrink: 0
                  }}>{c.year}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: '4px' }}>{c.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{c.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
