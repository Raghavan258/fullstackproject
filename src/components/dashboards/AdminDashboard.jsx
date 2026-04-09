import React, { useState, useEffect, useCallback } from 'react';
import { api, adminApi, queryApi, studyNoteApi, articleApi } from '../../services/api.js';
import './RoleDashboard.css';

const ROLES = ['citizen', 'educator', 'legal_expert', 'admin'];
const QUERY_STATUS_COLORS = {
  PENDING: { bg: '#f59e0b22', color: '#f59e0b', label: '⏳ Pending' },
  ASSIGNED: { bg: '#3b82f622', color: '#3b82f6', label: '🔄 Assigned' },
  ANSWERED: { bg: '#22c55e22', color: '#22c55e', label: '✅ Answered' },
  CLOSED: { bg: '#6b728022', color: '#6b7280', label: '🔒 Closed' },
};

function AssignModal({ query, responders, onClose, onAssign }) {
  const [userId, setUserId] = useState('');
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Assign Query</h3>
          <button className="btn btn-ghost modal-close" onClick={onClose}>✕</button>
        </div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
          Q: {query?.question?.slice(0, 100)}…
        </div>
        <select className="form-input" style={{ marginBottom: '16px' }} value={userId}
          onChange={e => setUserId(e.target.value)}>
          <option value="">— Select Educator or Legal Expert —</option>
          {responders.map(r => (
            <option key={r.id} value={r.id}>{r.fullName} ({r.role})</option>
          ))}
        </select>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={!userId} onClick={() => onAssign(query.id, userId)}>Assign</button>
        </div>
      </div>
    </div>
  );
}

function RejectModal({ noteId, onClose, onReject }) {
  const [reason, setReason] = useState('');
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>❌ Reject Study Note</h3>
          <button className="btn btn-ghost modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label className="form-label">Rejection Reason (optional)</label>
          <textarea className="form-input" rows={3} placeholder="Explain why this note is being rejected…"
            value={reason} onChange={e => setReason(e.target.value)} style={{ resize: 'vertical' }} />
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{ background: '#ef4444', borderColor: '#ef4444' }}
            onClick={() => onReject(noteId, reason)}>Confirm Reject</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [pendingNotes, setPendingNotes] = useState([]);
  const [flaggedArticles, setFlaggedArticles] = useState([]);
  const [queries, setQueries] = useState([]);
  const [responders, setResponders] = useState([]);
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(false);
  const [assignModal, setAssignModal] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [queryFilter, setQueryFilter] = useState('ALL');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [duties, setDuties] = useState([
    'Review pending article submissions',
    'Approve educator modules in queue',
    'Check reported violations',
    'Update legal expert query assignments',
    'Publish monthly quiz set',
  ].map(d => ({ text: d, done: false })));

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };
  const setAL = (key, val) => setActionLoading(p => ({ ...p, [key]: val }));

  const fetchStats = useCallback(async () => {
    try { const res = await adminApi.getStats(); setStats(res.data || res || {}); } catch { }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await adminApi.getUsers(userRoleFilter);
      setUsers(Array.isArray(res.data) ? res.data : res.data || []);
    } catch { setUsers([]); }
  }, [userRoleFilter]);

  const fetchPendingNotes = useCallback(async () => {
    try {
      const res = await studyNoteApi.getPending();
      setPendingNotes(Array.isArray(res.data) ? res.data : []);
    } catch { setPendingNotes([]); }
  }, []);

  const fetchFlagged = useCallback(async () => {
    try {
      const res = await articleApi.getFlagged();
      setFlaggedArticles(Array.isArray(res.data) ? res.data : []);
    } catch { setFlaggedArticles([]); }
  }, []);

  const fetchQueries = useCallback(async () => {
    try {
      const res = await queryApi.getAll('all=true');
      setQueries(Array.isArray(res.data) ? res.data : []);
    } catch { setQueries([]); }
  }, []);

  const fetchResponders = useCallback(async () => {
    try {
      const [ed, le] = await Promise.all([
        adminApi.getUsers('educator'),
        adminApi.getUsers('legal_expert'),
      ]);
      setResponders([
        ...(Array.isArray(ed.data) ? ed.data : []),
        ...(Array.isArray(le.data) ? le.data : []),
      ]);
    } catch { setResponders([]); }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { if (activeTab === 'users') fetchUsers(); }, [activeTab, fetchUsers]);
  useEffect(() => {
    if (activeTab === 'moderation') { fetchPendingNotes(); fetchFlagged(); }
  }, [activeTab, fetchPendingNotes, fetchFlagged]);
  useEffect(() => {
    if (activeTab === 'queries') { fetchQueries(); fetchResponders(); }
  }, [activeTab, fetchQueries, fetchResponders]);

  // User actions
  const toggleActive = async (id) => {
    setAL(`active_${id}`, true);
    try {
      const res = await adminApi.toggleActive(id);
      setUsers(p => p.map(u => u.id === id ? (res.data || u) : u));
      showToast('✅ User status updated.');
    } catch { showToast('❌ Failed.'); }
    setAL(`active_${id}`, false);
  };

  const updateRole = async (id, role) => {
    try {
      const res = await adminApi.updateRole(id, role);
      setUsers(p => p.map(u => u.id === id ? (res.data || { ...u, role }) : u));
      showToast('✅ Role updated.');
      fetchStats();
    } catch { showToast('❌ Failed.'); }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Permanently delete this user?')) return;
    try { await adminApi.deleteUser(id); setUsers(p => p.filter(u => u.id !== id)); showToast('🗑️ User deleted.'); }
    catch { showToast('❌ Failed.'); }
  };

  // Note actions
  const approveNote = async (id) => {
    setAL(`note_${id}`, true);
    try {
      await studyNoteApi.approve(id);
      setPendingNotes(p => p.filter(n => n.id !== id));
      showToast('✅ Study note approved! Citizens can now see it.');
      fetchStats();
    } catch { showToast('❌ Failed.'); }
    setAL(`note_${id}`, false);
  };

  const rejectNote = async (id, reason) => {
    try {
      await studyNoteApi.reject(id, reason);
      setPendingNotes(p => p.filter(n => n.id !== id));
      setRejectModal(null);
      showToast('❌ Study note rejected. Educator will see the reason.');
      fetchStats();
    } catch { showToast('❌ Failed.'); }
  };

  // Article actions
  const unflagArticle = async (id) => {
    setAL(`unflag_${id}`, true);
    try {
      await articleApi.unflag(id);
      setFlaggedArticles(p => p.filter(a => a.id !== id));
      showToast('✅ Article unflagged.');
      fetchStats();
    } catch { showToast('❌ Failed.'); }
    setAL(`unflag_${id}`, false);
  };

  const deleteArticle = async (id) => {
    if (!window.confirm('Delete this article?')) return;
    try { await articleApi.remove(id); setFlaggedArticles(p => p.filter(a => a.id !== id)); showToast('🗑️ Article deleted.'); }
    catch { showToast('❌ Failed.'); }
  };

  // Query actions
  const assignQuery = async (queryId, userId) => {
    try {
      const res = await queryApi.assign(queryId, userId);
      setQueries(p => p.map(q => q.id === queryId ? (res.data || q) : q));
      setAssignModal(null);
      showToast('✅ Query assigned!');
    } catch { showToast('❌ Failed.'); }
  };

  const closeQuery = async (id) => {
    try {
      const res = await queryApi.close(id);
      setQueries(p => p.map(q => q.id === id ? (res.data || { ...q, status: 'CLOSED' }) : q));
      showToast('🔒 Query closed.');
    } catch { showToast('❌ Failed.'); }
  };

  const filteredQueries = queryFilter === 'ALL' ? queries : queries.filter(q => q.status === queryFilter);
  const filteredUsers = users.filter(u =>
    (!userSearch || u.fullName?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase()))
  );

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
      {assignModal && (
        <AssignModal query={assignModal} responders={responders} onClose={() => setAssignModal(null)} onAssign={assignQuery} />
      )}
      {rejectModal && (
        <RejectModal noteId={rejectModal} onClose={() => setRejectModal(null)} onReject={rejectNote} />
      )}

      <div className="dash-header">
        <div>
          <div className="section-tag">🛡️ Admin</div>
          <h1 className="dash-title heading-display">Platform <span className="saffron-text">Control Centre</span></h1>
          <p className="dash-sub">Manage users, approve content, assign queries, and oversee the platform.</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid-4 mb-24">
        {[
          { label: 'Total Users', val: stats.totalUsers, icon: '👥' },
          { label: 'Pending Notes', val: stats.pendingStudyNotes, icon: '📝', warn: stats.pendingStudyNotes > 0 },
          { label: 'Flagged Articles', val: stats.flaggedArticles, icon: '🚩', warn: stats.flaggedArticles > 0 },
          { label: 'Pending Queries', val: stats.pendingQueries, icon: '❓', warn: stats.pendingQueries > 0 },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-value" style={{ color: s.warn ? '#ef4444' : undefined }}>{s.val ?? '—'}</div>
            <div className="stat-label">{s.icon} {s.label}</div>
          </div>
        ))}
      </div>

      <div className="dash-tabs">
        {[
          { id: 'overview', label: '📊 Overview' },
          { id: 'users', label: '👥 Users' },
          {
            id: 'moderation', label: (stats.pendingStudyNotes > 0 || stats.flaggedArticles > 0)
              ? <span>🛡️ Moderation <span style={{ background: '#ef4444', color: 'white', borderRadius: '9999px', fontSize: '0.68rem', padding: '1px 7px', fontWeight: 800, marginLeft: 4 }}>{(stats.pendingStudyNotes || 0) + (stats.flaggedArticles || 0)}</span></span>
              : '🛡️ Moderation'
          },
          {
            id: 'queries', label: stats.pendingQueries > 0
              ? <span>❓ Queries <span style={{ background: '#f59e0b', color: '#000', borderRadius: '9999px', fontSize: '0.68rem', padding: '1px 7px', fontWeight: 800, marginLeft: 4 }}>{stats.pendingQueries}</span></span>
              : '❓ Queries'
          },
        ].map(tab => (
          <button key={tab.id} className={`dash-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}>{tab.label}</button>
        ))}
      </div>

      {/* ── Overview Tab ─────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-16">
          <div className="grid-3">
            {[
              { label: 'Citizens', val: stats.citizens, icon: '🏛️' },
              { label: 'Educators', val: stats.educators, icon: '🏫' },
              { label: 'Legal Experts', val: stats.legalExperts, icon: '⚖️' },
              { label: 'Published Articles', val: stats.publishedArticles, icon: '📄' },
              { label: 'Approved Modules', val: stats.approvedStudyNotes, icon: '✅' },
              { label: 'Total Queries', val: stats.totalQueries, icon: '❓' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-value">{s.val ?? '—'}</div>
                <div className="stat-label">{s.icon} {s.label}</div>
              </div>
            ))}
          </div>

          <div className="glass-card dash-section-card">
            <div className="section-card-header"><h3>📋 Admin Duties</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{duties.filter(d => d.done).length}/{duties.length} done</span>
            </div>
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
            <div className="section-card-header"><h3>⚡ Quick Actions</h3></div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '12px' }}>
              <button className="btn btn-ghost" onClick={() => setActiveTab('moderation')}>🔍 Review Pending Notes ({stats.pendingStudyNotes || 0})</button>
              <button className="btn btn-ghost" onClick={() => setActiveTab('queries')}>❓ Assign Queries ({stats.pendingQueries || 0})</button>
              <button className="btn btn-ghost" onClick={() => setActiveTab('moderation')}>🚩 Flagged Articles ({stats.flaggedArticles || 0})</button>
              <button className="btn btn-ghost" onClick={() => setActiveTab('users')}>👥 Manage Users</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Users Tab ─────────────────────────────────────────────────────── */}
      {activeTab === 'users' && (
        <div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <input className="form-input" style={{ flex: 1, minWidth: '200px' }} placeholder="Search by name or email…"
              value={userSearch} onChange={e => setUserSearch(e.target.value)} />
            <select className="form-input" style={{ width: '160px' }} value={userRoleFilter}
              onChange={e => { setUserRoleFilter(e.target.value); }}>
              <option value="">All Roles</option>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <button className="btn btn-ghost" onClick={fetchUsers}>🔄 Refresh</button>
          </div>

          {filteredUsers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No users found.</div>
          ) : (
            <div className="flex flex-col gap-16">
              {filteredUsers.map(u => (
                <div key={u.id} className="glass-card dash-section-card">
                  <div className="section-card-header">
                    <div>
                      <div style={{ fontWeight: 700 }}>{u.fullName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email} · {u.phone || ''}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <select className="form-input" style={{ width: '130px', padding: '4px 8px', fontSize: '0.78rem' }}
                        value={u.role} onChange={e => updateRole(u.id, e.target.value)}>
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <button className={`btn ${u.active ? 'btn-ghost' : 'btn-primary'}`}
                        style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                        onClick={() => toggleActive(u.id)} disabled={actionLoading[`active_${u.id}`]}>
                        {actionLoading[`active_${u.id}`] ? <span className="spinner" /> : (u.active ? 'Deactivate' : 'Activate')}
                      </button>
                      <button className="btn btn-ghost" style={{ fontSize: '0.75rem', padding: '4px 10px', color: '#ef4444' }}
                        onClick={() => deleteUser(u.id)}>Delete</button>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px', display: 'flex', gap: '12px' }}>
                    <span>{u.verified ? '✅ Verified' : '⏳ Unverified'}</span>
                    <span>{u.active ? '🟢 Active' : '🔴 Inactive'}</span>
                    {u.createdAt && <span>Joined {new Date(u.createdAt).toLocaleDateString('en-IN')}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Moderation Tab ────────────────────────────────────────────────── */}
      {activeTab === 'moderation' && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '12px' }}>📝 Pending Study Notes ({pendingNotes.length})</h3>
            {pendingNotes.length === 0 ? (
              <div className="glass-card dash-section-card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                ✅ No pending study notes. All clear!
              </div>
            ) : pendingNotes.map(n => (
              <div key={n.id} className="glass-card dash-section-card" style={{ marginBottom: '12px' }}>
                <div className="section-card-header">
                  <div>
                    <div style={{ fontWeight: 700 }}>{n.title}</div>
                    {n.category && <div style={{ fontSize: '0.75rem', color: 'var(--saffron)' }}>{n.category}</div>}
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      By {n.author?.fullName || 'Educator'} · {n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-IN') : ''}
                    </div>
                    <div style={{ fontSize: '0.82rem', marginTop: '8px', lineHeight: 1.6 }}>
                      {n.content?.slice(0, 200)}{n.content?.length > 200 ? '…' : ''}
                    </div>
                    {n.videoUrl && <div style={{ fontSize: '0.75rem', color: 'var(--saffron)', marginTop: '4px' }}>▶ Video: {n.videoUrl}</div>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                    <button className="btn btn-primary" style={{ fontSize: '0.78rem', padding: '6px 14px' }}
                      onClick={() => approveNote(n.id)} disabled={actionLoading[`note_${n.id}`]}>
                      {actionLoading[`note_${n.id}`] ? <span className="spinner" /> : '✅ Approve'}
                    </button>
                    <button className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '6px 14px', color: '#ef4444' }}
                      onClick={() => setRejectModal(n.id)}>❌ Reject</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <h3 style={{ fontWeight: 700, marginBottom: '12px' }}>🚩 Flagged Articles ({flaggedArticles.length})</h3>
            {flaggedArticles.length === 0 ? (
              <div className="glass-card dash-section-card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                ✅ No flagged articles. All clear!
              </div>
            ) : flaggedArticles.map(a => (
              <div key={a.id} className="glass-card dash-section-card" style={{ marginBottom: '12px' }}>
                <div className="section-card-header">
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--saffron)', fontWeight: 700 }}>{a.part}</div>
                    <div style={{ fontWeight: 700 }}>{a.title}</div>
                    {a.legalCommentary && (
                      <div style={{
                        fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px', background: 'rgba(59,130,246,0.08)',
                        borderLeft: '3px solid #3b82f6', padding: '8px 12px', borderRadius: '0 4px 4px 0'
                      }}>
                        ✍️ {a.legalCommentary.slice(0, 150)}…
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                    <button className="btn btn-primary" style={{ fontSize: '0.78rem', padding: '6px 14px' }}
                      onClick={() => unflagArticle(a.id)} disabled={actionLoading[`unflag_${a.id}`]}>
                      {actionLoading[`unflag_${a.id}`] ? <span className="spinner" /> : '✅ Unflag'}
                    </button>
                    <button className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '6px 14px', color: '#ef4444' }}
                      onClick={() => deleteArticle(a.id)}>🗑️ Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Queries Tab ───────────────────────────────────────────────────── */}
      {activeTab === 'queries' && (
        <div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{filteredQueries.length} queries shown</span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['ALL', 'PENDING', 'ASSIGNED', 'ANSWERED', 'CLOSED'].map(s => (
                <button key={s} className={`btn ${queryFilter === s ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ fontSize: '0.72rem', padding: '4px 10px' }} onClick={() => setQueryFilter(s)}>{s}</button>
              ))}
            </div>
            <button className="btn btn-ghost" style={{ marginLeft: 'auto', fontSize: '0.75rem', padding: '5px 14px' }}
              onClick={fetchQueries}>🔄 Refresh</button>
          </div>

          {filteredQueries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📭</div>
              No queries matching this filter.
            </div>
          ) : (
            <div className="flex flex-col gap-16">
              {filteredQueries.map(q => {
                const meta = QUERY_STATUS_COLORS[q.status] || QUERY_STATUS_COLORS.PENDING;
                return (
                  <div key={q.id} className="glass-card dash-section-card">
                    <div className="section-card-header">
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', gap: '12px' }}>
                          <span>👤 {q.citizen?.fullName || 'Citizen'}</span>
                          {q.assignedTo && <span>→ {q.assignedTo.fullName} ({q.assignedTo.role})</span>}
                          {q.createdAt && <span>🕐 {new Date(q.createdAt).toLocaleDateString('en-IN')}</span>}
                        </div>
                        <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{q.question}</div>
                        {q.status === 'ANSWERED' && q.answer && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                            ✅ Answered by {q.answeredBy?.fullName || 'Expert'}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end', flexShrink: 0 }}>
                        <span style={{
                          background: meta.bg, color: meta.color, border: `1px solid ${meta.color}44`,
                          borderRadius: '9999px', padding: '3px 10px', fontSize: '0.72rem', fontWeight: 700
                        }}>
                          {meta.label}
                        </span>
                        {q.status === 'PENDING' && (
                          <button className="btn btn-ghost" style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                            onClick={() => setAssignModal(q)}>Assign →</button>
                        )}
                        {q.status === 'ANSWERED' && (
                          <button className="btn btn-ghost" style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                            onClick={() => closeQuery(q.id)}>🔒 Close</button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
