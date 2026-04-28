import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { queryApi, studyNoteApi } from '../../services/api.js';
import './RoleDashboard.css';

const STATUS_META = {
  PENDING: { label: 'Awaiting Assignment', color: '#f59e0b', icon: '⏳' },
  ASSIGNED: { label: 'Being Reviewed', color: '#3b82f6', icon: '🔄' },
  ANSWERED: { label: 'Answered', color: '#22c55e', icon: '✅' },
  CLOSED: { label: 'Closed', color: '#6b7280', icon: '🔒' },
};

const CATEGORIES = ['Preamble', 'Fundamental Rights', 'DPSP', 'Amendments', 'Judiciary', 'Legislature', 'Executive'];
const BADGES = ['📖 First Read', '🧠 Quiz Ace', '🏛️ Explorer', '⭐ Week Streak', '🗳️ Civic Voice'];
const DUTIES = [
  'Read one constitutional article today',
  'Attempt the weekly quiz',
  'Participate in a forum discussion',
  'Submit a query if you have doubts',
];

function QueryModal({ onClose, onSubmit }) {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>❓ Submit a New Query</h3>
          <button className="btn btn-ghost modal-close" onClick={onClose}>✕</button>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
          Your question will be answered by an Educator or Legal Expert.
        </p>
        <textarea
          className="form-input" rows={5} autoFocus
          placeholder="e.g. What is the difference between Article 14 and Article 15?..."
          value={text} onChange={e => setText(e.target.value)}
          style={{ resize: 'vertical', marginBottom: '12px' }}
        />
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            disabled={!text.trim() || submitting}
            onClick={async () => {
              setSubmitting(true);
              await onSubmit(text.trim());
              setSubmitting(false);
              onClose();
            }}
          >
            {submitting ? <><span className="spinner" /> Submitting…</> : '📨 Submit Query'}
          </button>
        </div>
      </div>
    </div>
  );
}

function VideoModal({ module: m, onClose }) {
  if (!m) return null;
  const embedUrl = m.videoUrl?.includes('embed') ? m.videoUrl
    : m.videoUrl?.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/');
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-video" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>▶ {m.title}</h3>
          <button className="btn btn-ghost modal-close" onClick={onClose}>✕</button>
        </div>
        <iframe src={`${embedUrl}?autoplay=1&rel=0`} title={m.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen style={{ width: '100%', height: '360px', border: 'none', borderRadius: '8px', marginTop: '12px' }} />
      </div>
    </div>
  );
}

export default function CitizenDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('learn');
  const [notes, setNotes] = useState([]);
  const [queries, setQueries] = useState([]);
  const [duties, setDuties] = useState(DUTIES.map(d => ({ text: d, done: false })));
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [previewNote, setPreviewNote] = useState(null);
  const [toast, setToast] = useState('');
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [loadingQueries, setLoadingQueries] = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const fetchNotes = useCallback(async () => {
    setLoadingNotes(true);
    try {
      const res = await studyNoteApi.getAll(0, 12);
      const data = res.data?.content || res.content || res.data || [];
      setNotes(Array.isArray(data) ? data : []);
    } catch { setNotes([]); }
    setLoadingNotes(false);
  }, []);

  const fetchQueries = useCallback(async () => {
    setLoadingQueries(true);
    try {
      const res = await queryApi.getMine();
      const data = res.data || res || [];
      setQueries(Array.isArray(data) ? data : []);
    } catch { setQueries([]); }
    setLoadingQueries(false);
  }, []);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);
  useEffect(() => {
    if (activeTab === 'queries') fetchQueries();
  }, [activeTab, fetchQueries]);

  // Auto-refresh queries every 30s while on that tab
  useEffect(() => {
    if (activeTab !== 'queries') return;
    const interval = setInterval(fetchQueries, 30000);
    return () => clearInterval(interval);
  }, [activeTab, fetchQueries]);

  const submitQuery = async (text) => {
    try {
      const res = await queryApi.submit(text);
      const newQuery = res.data || res;
      setQueries(prev => [newQuery, ...prev]);
      showToast('✅ Query submitted! An expert will respond soon.');
    } catch (e) {
      showToast('❌ Failed to submit. Please try again.');
    }
  };

  const answeredCount = queries.filter(q => q.status === 'ANSWERED').length;
  const pendingCount = queries.filter(q => q.status === 'PENDING' || q.status === 'ASSIGNED').length;

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
      {showQueryModal && <QueryModal onClose={() => setShowQueryModal(false)} onSubmit={submitQuery} />}
      {previewNote && <VideoModal module={previewNote} onClose={() => setPreviewNote(null)} />}

      <div className="dash-header">
        <div>
          <div className="section-tag">🏛️ Citizen</div>
          <h1 className="dash-title heading-display">Welcome, <span className="saffron-text">{user?.name?.split(' ')[0] || 'Citizen'}</span></h1>
          <p className="dash-sub">Explore the Constitution. Learn, query, and grow as an informed citizen.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setActiveTab('queries'); setShowQueryModal(true); }}>
          + Ask a Query
        </button>
      </div>

      {/* Stats */}
      <div className="grid-4 mb-24">
        <div className="stat-card"><div className="stat-value">{notes.length}</div><div className="stat-label">📚 Study Modules</div></div>
        <div className="stat-card"><div className="stat-value">{queries.length}</div><div className="stat-label">❓ My Queries</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color: '#22c55e' }}>{answeredCount}</div><div className="stat-label">✅ Answered</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color: '#f59e0b' }}>{pendingCount}</div><div className="stat-label">⏳ Pending</div></div>
      </div>

      {/* Tabs */}
      <div className="dash-tabs">
        {[
          { id: 'learn', label: '📚 Learn' },
          {
            id: 'queries', label: pendingCount > 0
              ? <span>❓ My Queries <span style={{ background: '#ff4d6d', color: 'white', borderRadius: '9999px', fontSize: '0.68rem', padding: '1px 7px', fontWeight: 800, marginLeft: 4 }}>{pendingCount}</span></span>
              : '❓ My Queries'
          },
          { id: 'progress', label: '🏆 Progress' },
        ].map(tab => (
          <button key={tab.id} className={`dash-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}>{tab.label}</button>
        ))}
      </div>

      {/* ── Learn Tab ─────────────────────────────────────────────────────── */}
      {activeTab === 'learn' && (
        <div>
          <div className="glass-card dash-section-card mb-24" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {[
              { to: '/articles', icon: '📄', label: 'Browse Articles' },
              { to: '/quizzes', icon: '🧠', label: 'Take a Quiz' },
              { to: '/forums', icon: '💬', label: 'Join Forums' },
              { to: '/constitution-explorer', icon: '🗺️', label: 'Explorer' },
            ].map(({ to, icon, label }) => (
              <Link key={to} to={to} className="btn btn-ghost" style={{ fontSize: '0.85rem' }}>{icon} {label}</Link>
            ))}
          </div>

          <h3 style={{ marginBottom: '16px', fontWeight: 700 }}>📚 Study Modules</h3>
          {loadingNotes ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading modules…</div>
          ) : notes.length === 0 ? (
            <div className="glass-card dash-section-card" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📭</div>
              No study modules published yet. Check back soon!
            </div>
          ) : (
            <div className="grid-3">
              {notes.map(note => (
                <div key={note.id} className="glass-card dash-section-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {note.category && (
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--saffron)', textTransform: 'uppercase', letterSpacing: 1 }}>
                      {note.category}
                    </div>
                  )}
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{note.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6, flex: 1 }}>
                    {note.content?.slice(0, 100)}{note.content?.length > 100 ? '…' : ''}
                  </div>
                  {note.author && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      By {note.author.fullName || note.author.name || 'Educator'}
                    </div>
                  )}
                  {note.videoUrl && (
                    <button className="btn btn-primary" style={{ fontSize: '0.78rem', padding: '6px 14px', alignSelf: 'flex-start' }}
                      onClick={() => setPreviewNote(note)}>
                      ▶ Watch Video
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Queries Tab ───────────────────────────────────────────────────── */}
      {activeTab === 'queries' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {queries.length === 0 ? 'No queries yet.' : `${queries.length} total · ${answeredCount} answered`}
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-ghost" style={{ fontSize: '0.75rem', padding: '5px 14px' }} onClick={fetchQueries}>🔄 Refresh</button>
              <button className="btn btn-primary" style={{ fontSize: '0.82rem' }} onClick={() => setShowQueryModal(true)}>+ New Query</button>
            </div>
          </div>

          {loadingQueries ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading queries…</div>
          ) : queries.length === 0 ? (
            <div className="glass-card dash-section-card" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>💬</div>
              You haven't submitted any queries yet.
              <br />
              <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => setShowQueryModal(true)}>Ask your first question</button>
            </div>
          ) : (
            <div className="flex flex-col gap-16">
              {queries.map(q => {
                const meta = STATUS_META[q.status] || STATUS_META.PENDING;
                return (
                  <div key={q.id} className="glass-card dash-section-card">
                    <div className="section-card-header">
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                          🕐 {q.createdAt ? new Date(q.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                        </div>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Q: {q.question}</div>
                      </div>
                      <span style={{
                        background: meta.color + '22', color: meta.color, border: `1px solid ${meta.color}44`,
                        borderRadius: '9999px', padding: '3px 10px', fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap'
                      }}>
                        {meta.icon} {meta.label}
                      </span>
                    </div>
                    {q.status === 'ANSWERED' && q.answer && (
                      <div style={{
                        marginTop: '12px', background: 'rgba(34,197,94,0.08)', borderLeft: '3px solid #22c55e',
                        padding: '12px 16px', borderRadius: '0 8px 8px 0'
                      }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#22c55e', marginBottom: '6px' }}>
                          ✅ Answered by {q.answeredBy?.fullName || q.answeredBy?.name || 'Expert'}
                          {q.updatedAt && ` · ${new Date(q.updatedAt).toLocaleDateString('en-IN')}`}
                        </div>
                        <div style={{ fontSize: '0.88rem', lineHeight: 1.7 }}>{q.answer}</div>
                      </div>
                    )}
                    {(q.status === 'PENDING' || q.status === 'ASSIGNED') && (
                      <div style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        {q.status === 'ASSIGNED' && q.assignedTo
                          ? `Assigned to ${q.assignedTo.fullName || q.assignedTo.name || 'an expert'} — response coming soon.`
                          : 'Waiting to be assigned to an educator or legal expert.'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Progress Tab ──────────────────────────────────────────────────── */}
      {activeTab === 'progress' && (
        <div className="flex flex-col gap-16">
          <div className="glass-card dash-section-card">
            <div className="section-card-header"><h3>🏆 Badges Earned</h3></div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px' }}>
              {BADGES.map(b => (
                <span key={b} style={{
                  background: 'rgba(245,158,11,0.15)', color: 'var(--saffron)',
                  border: '1px solid rgba(245,158,11,0.3)', borderRadius: '9999px', padding: '6px 14px', fontSize: '0.82rem', fontWeight: 600
                }}>
                  {b}
                </span>
              ))}
            </div>
          </div>
          <div className="glass-card dash-section-card">
            <div className="section-card-header"><h3>📋 Daily Duties</h3></div>
            <div className="flex flex-col gap-16" style={{ marginTop: '12px' }}>
              {duties.map((d, i) => (
                <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={d.done} onChange={() => setDuties(p => p.map((x, j) => j === i ? { ...x, done: !x.done } : x))} />
                  <span style={{ fontSize: '0.88rem', textDecoration: d.done ? 'line-through' : 'none', color: d.done ? 'var(--text-muted)' : 'inherit' }}>
                    {d.text}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div className="glass-card dash-section-card">
            <div className="section-card-header"><h3>📊 Query Stats</h3></div>
            <div className="grid-3" style={{ marginTop: '12px' }}>
              <div className="stat-card"><div className="stat-value">{queries.length}</div><div className="stat-label">Total Submitted</div></div>
              <div className="stat-card"><div className="stat-value" style={{ color: '#22c55e' }}>{answeredCount}</div><div className="stat-label">Answered</div></div>
              <div className="stat-card"><div className="stat-value" style={{ color: '#f59e0b' }}>{pendingCount}</div><div className="stat-label">Pending</div></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
