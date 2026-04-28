import React, { useState, useEffect, useCallback } from 'react';
import { queryApi, studyNoteApi } from '../../services/api.js';
import './RoleDashboard.css';

const APPROVAL_COLOR = {
  PENDING_REVIEW: 'badge-saffron',
  APPROVED: 'badge-green',
  REJECTED: 'badge-red',
};
const APPROVAL_LABEL = {
  PENDING_REVIEW: '🔍 Pending Review',
  APPROVED: '✅ Approved',
  REJECTED: '❌ Rejected',
};

const CATEGORIES = ['Preamble', 'Fundamental Rights', 'DPSP', 'Amendments', 'Judiciary', 'Legislature', 'Executive'];

function VideoModal({ note, onClose }) {
  if (!note?.videoUrl) return null;
  const url = note.videoUrl.includes('embed') ? note.videoUrl
    : note.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/');
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-video" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>▶ {note.title}</h3>
          <button className="btn btn-ghost modal-close" onClick={onClose}>✕</button>
        </div>
        <iframe src={`${url}?autoplay=1&rel=0`} title={note.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen style={{ width: '100%', height: '360px', border: 'none', borderRadius: '8px', marginTop: '12px' }} />
      </div>
    </div>
  );
}

export default function EducatorDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('modules');
  const [modules, setModules] = useState([]);
  const [queries, setQueries] = useState([]);
  const [previewNote, setPreviewNote] = useState(null);
  const [toast, setToast] = useState('');
  const [loadingModules, setLoadingModules] = useState(false);
  const [loadingQueries, setLoadingQueries] = useState(false);
  const [saving, setSaving] = useState({});
  const [submitting, setSubmitting] = useState({});
  const [videoInputs, setVideoInputs] = useState({});
  const [replies, setReplies] = useState({});
  const [showNewNote, setShowNewNote] = useState(false);
  const [noteForm, setNoteForm] = useState({ title: '', content: '', category: CATEGORIES[0], videoUrl: '' });
  const [creating, setCreating] = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const fetchModules = useCallback(async () => {
    setLoadingModules(true);
    try {
      const res = await studyNoteApi.getMine();
      const data = res.data || res || [];
      setModules(Array.isArray(data) ? data : []);
    } catch { setModules([]); }
    setLoadingModules(false);
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

  useEffect(() => { fetchModules(); }, [fetchModules]);
  useEffect(() => {
    if (activeTab === 'queries') fetchQueries();
  }, [activeTab, fetchQueries]);

  const saveVideo = async (id) => {
    const url = videoInputs[id] || '';
    if (!url.trim()) return;
    setSaving(p => ({ ...p, [id]: true }));
    try {
      await studyNoteApi.updateVideo(id, url);
      setModules(p => p.map(m => m.id === id ? { ...m, videoUrl: url } : m));
      showToast('✅ Video URL saved!');
    } catch { showToast('❌ Failed to save video URL.'); }
    setSaving(p => ({ ...p, [id]: false }));
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
      showToast('✅ Answer submitted! The citizen will see it in their dashboard.');
    } catch { showToast('❌ Failed to submit answer.'); }
    setSubmitting(p => ({ ...p, [queryId]: false }));
  };

  const createNote = async () => {
    if (!noteForm.title.trim() || !noteForm.content.trim()) return;
    setCreating(true);
    try {
      const res = await studyNoteApi.create(noteForm);
      const newNote = res.data || res;
      setModules(p => [newNote, ...p]);
      setNoteForm({ title: '', content: '', category: CATEGORIES[0], videoUrl: '' });
      setShowNewNote(false);
      showToast('✅ Module submitted for admin review!');
      setActiveTab('modules');
    } catch { showToast('❌ Failed to create module.'); }
    setCreating(false);
  };

  const pendingQueries = queries.filter(q => q.status === 'PENDING');
  const myQueries = queries.filter(q => q.status === 'ASSIGNED');

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
      {previewNote && <VideoModal note={previewNote} onClose={() => setPreviewNote(null)} />}

      {/* New Note Modal */}
      {showNewNote && (
        <div className="modal-overlay" onClick={() => setShowNewNote(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🧩 Create Study Module</h3>
              <button className="btn btn-ghost modal-close" onClick={() => setShowNewNote(false)}>✕</button>
            </div>
            {[
              { label: 'Title', key: 'title', type: 'input', placeholder: 'e.g. Right to Equality — A Deep Dive' },
            ].map(f => (
              <div key={f.key} className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label">{f.label}</label>
                <input className="form-input" placeholder={f.placeholder} value={noteForm[f.key]}
                  onChange={e => setNoteForm(p => ({ ...p, [f.key]: e.target.value }))} />
              </div>
            ))}
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label">Category</label>
              <select className="form-input" value={noteForm.category}
                onChange={e => setNoteForm(p => ({ ...p, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label">Content</label>
              <textarea className="form-input" rows={5} placeholder="Write your study content here…"
                value={noteForm.content} onChange={e => setNoteForm(p => ({ ...p, content: e.target.value }))}
                style={{ resize: 'vertical' }} />
            </div>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">YouTube / Video URL (optional)</label>
              <input className="form-input" placeholder="https://youtube.com/watch?v=..."
                value={noteForm.videoUrl} onChange={e => setNoteForm(p => ({ ...p, videoUrl: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setShowNewNote(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={createNote} disabled={creating}>
                {creating ? <><span className="spinner" /> Creating…</> : 'Create & Submit for Review'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="dash-header">
        <div>
          <div className="section-tag">🏫 Educator</div>
          <h1 className="dash-title heading-display">Teaching <span className="saffron-text">Toolkit</span></h1>
          <p className="dash-sub">Welcome, {user?.name || 'Educator'}! Manage modules, answer queries, and create content.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowNewNote(true)}>+ New Module</button>
      </div>

      <div className="grid-4 mb-24">
        <div className="stat-card"><div className="stat-value">{modules.filter(m => m.approvalStatus === 'APPROVED').length}</div><div className="stat-label">✅ Approved</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color: '#f59e0b' }}>{modules.filter(m => m.approvalStatus === 'PENDING_REVIEW').length}</div><div className="stat-label">🔍 Pending Review</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color: '#ef4444' }}>{modules.filter(m => m.approvalStatus === 'REJECTED').length}</div><div className="stat-label">❌ Rejected</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color: '#f59e0b' }}>{myQueries.length + pendingQueries.length}</div><div className="stat-label">❓ Open Queries</div></div>
      </div>

      <div className="dash-tabs">
        {[
          { id: 'modules', label: '🧩 My Modules' },
          {
            id: 'queries', label: (myQueries.length + pendingQueries.length) > 0
              ? <span>❓ Queries <span style={{ background: '#ff4d6d', color: 'white', borderRadius: '9999px', fontSize: '0.68rem', padding: '1px 7px', fontWeight: 800, marginLeft: 4 }}>{myQueries.length + pendingQueries.length}</span></span>
              : '❓ Queries'
          },
        ].map(tab => (
          <button key={tab.id} className={`dash-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}>{tab.label}</button>
        ))}
      </div>

      {/* ── Modules Tab ─────────────────────────────────────────────────── */}
      {activeTab === 'modules' && (
        <div className="flex flex-col gap-16">
          {loadingModules ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading modules…</div>
          ) : modules.length === 0 ? (
            <div className="glass-card dash-section-card" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📭</div>
              No modules yet. Create your first one!
              <br /><button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => setShowNewNote(true)}>+ Create Module</button>
            </div>
          ) : modules.map(m => (
            <div key={m.id} className="glass-card dash-section-card">
              <div className="section-card-header">
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{m.title}</div>
                  {m.category && <div style={{ fontSize: '0.78rem', color: 'var(--saffron)', marginTop: '2px' }}>{m.category}</div>}
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {m.content?.slice(0, 80)}{m.content?.length > 80 ? '…' : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                  {m.videoUrl && (
                    <button className="btn btn-ghost" style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                      onClick={() => setPreviewNote(m)}>▶ Preview</button>
                  )}
                  <span className={`badge ${APPROVAL_COLOR[m.approvalStatus] || 'badge-saffron'}`}>
                    {APPROVAL_LABEL[m.approvalStatus] || m.approvalStatus}
                  </span>
                </div>
              </div>

              {m.approvalStatus === 'REJECTED' && m.rejectionReason && (
                <div style={{
                  marginTop: '10px', background: 'rgba(239,68,68,0.08)', borderLeft: '3px solid #ef4444',
                  padding: '10px 14px', borderRadius: '0 6px 6px 0', fontSize: '0.82rem', color: '#ef4444'
                }}>
                  ❌ Rejection reason: {m.rejectionReason}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                <input className="form-input" placeholder="Add/update YouTube video URL…"
                  value={videoInputs[m.id] || m.videoUrl || ''}
                  onChange={e => setVideoInputs(p => ({ ...p, [m.id]: e.target.value }))} />
                <button className="btn btn-primary" style={{ flexShrink: 0, fontSize: '0.82rem', padding: '0 16px' }}
                  onClick={() => saveVideo(m.id)} disabled={saving[m.id]}>
                  {saving[m.id] ? <span className="spinner" /> : 'Save URL'}
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
              {queries.length === 0 ? 'No queries yet.' : `${myQueries.length} assigned to you · ${pendingQueries.length} open for pickup`}
            </span>
            <button className="btn btn-ghost" style={{ fontSize: '0.75rem', padding: '5px 14px' }} onClick={fetchQueries}>🔄 Refresh</button>
          </div>

          {loadingQueries ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading queries…</div>
          ) : queries.filter(q => q.status !== 'CLOSED').length === 0 ? (
            <div className="glass-card dash-section-card" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📭</div>
              No open queries at the moment. Citizens' questions will appear here.
            </div>
          ) : (
            <div className="flex flex-col gap-16">
              {queries.filter(q => q.status !== 'CLOSED').map(q => (
                <div key={q.id} className="glass-card dash-section-card">
                  <div className="section-card-header">
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', gap: '12px' }}>
                        <span>👤 From: <strong>{q.citizen?.fullName || 'Citizen'}</strong></span>
                        {q.createdAt && <span>🕐 {new Date(q.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>}
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Q: {q.question}</div>
                    </div>
                    {q.status === 'PENDING' ? (
                      <button className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '5px 12px', flexShrink: 0 }}
                        onClick={() => selfAssign(q.id)}>Pick Up</button>
                    ) : (
                      <span className={`badge ${q.status === 'ANSWERED' ? 'badge-green' : 'badge-saffron'}`}>
                        {q.status === 'ANSWERED' ? '✅ Answered' : '🔄 Assigned to You'}
                      </span>
                    )}
                  </div>

                  {q.status === 'ANSWERED' ? (
                    <div style={{
                      marginTop: '12px', background: 'rgba(34,197,94,0.08)', borderLeft: '3px solid #22c55e',
                      padding: '10px 14px', borderRadius: '0 6px 6px 0', fontSize: '0.85rem'
                    }}>
                      ✅ {q.answer}
                    </div>
                  ) : q.status === 'ASSIGNED' && (
                    <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
                      <textarea className="form-input" rows={2} placeholder="Type your answer…"
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
        </div>
      )}
    </div>
  );
}
