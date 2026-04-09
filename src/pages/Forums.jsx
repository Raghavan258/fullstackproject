import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import './Pages.css';

const FALLBACK_THREADS = [
  { id: 1, topic: 'Preamble', title: 'Does "Socialist" in the Preamble restrict economic freedom?', authorName: 'Arjun S.', replyCount: 14, likeCount: 32, createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 2, topic: 'Rights', title: 'Is Freedom of Speech absolute under Article 19?', authorName: 'Meera K.', replyCount: 28, likeCount: 67, createdAt: new Date(Date.now() - 18000000).toISOString() },
  { id: 3, topic: 'Duties', title: 'How should Fundamental Duties be enforced?', authorName: 'Rahul V.', replyCount: 9, likeCount: 18, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 4, topic: 'Amendments', title: '42nd vs 44th Amendment — Key Differences', authorName: 'Priya M.', replyCount: 22, likeCount: 45, createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: 5, topic: 'Rights', title: 'Article 32 vs Article 226 — Which is more powerful?', authorName: 'Dr. Rao', replyCount: 17, likeCount: 38, createdAt: new Date(Date.now() - 259200000).toISOString() },
  { id: 6, topic: 'DPSP', title: 'Can Directive Principles override Fundamental Rights?', authorName: 'Adv. Sharma', replyCount: 31, likeCount: 72, createdAt: new Date(Date.now() - 345600000).toISOString() },
];

const TOPICS = ['All', 'Preamble', 'Rights', 'Duties', 'Amendments', 'DPSP'];

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Forums() {
  const { user } = useAuth();
  const [topic, setTopic] = useState('All');
  const [threads, setThreads] = useState(FALLBACK_THREADS);
  const [newPost, setNewPost] = useState('');
  const [newTopic, setNewTopic] = useState('Rights');
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [likedIds, setLikedIds] = useState(new Set());
  const [toast, setToast] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [replies, setReplies] = useState({});

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    setLoading(true);
    const endpoint = topic !== 'All' ? `/forums?topic=${encodeURIComponent(topic)}&size=20` : `/forums?size=20`;
    api.get(endpoint)
      .then(res => {
        const data = res.data?.content || res.data;
        if (Array.isArray(data) && data.length > 0) {
          setThreads(data);
        } else {
          const filtered = topic === 'All' ? FALLBACK_THREADS : FALLBACK_THREADS.filter(t => t.topic === topic);
          setThreads(filtered.length > 0 ? filtered : FALLBACK_THREADS);
        }
      })
      .catch(() => {
        const filtered = topic === 'All' ? FALLBACK_THREADS : FALLBACK_THREADS.filter(t => t.topic === topic);
        setThreads(filtered.length > 0 ? filtered : FALLBACK_THREADS);
      })
      .finally(() => setLoading(false));
  }, [topic]);

  const handlePost = async () => {
    if (!newPost.trim()) return;
    setPosting(true);
    try {
      const res = await api.post('/forums', { title: newPost.trim(), topic: newTopic, content: newPost.trim() });
      const created = res.data;
      setThreads(prev => [created, ...prev]);
      showToast('✅ Your discussion has been posted!');
    } catch {
      // Optimistic update (no backend)
      const fake = {
        id: Date.now(),
        topic: newTopic,
        title: newPost.trim(),
        authorName: user?.name || 'You',
        replyCount: 0,
        likeCount: 0,
        createdAt: new Date().toISOString(),
      };
      setThreads(prev => [fake, ...prev]);
      showToast('✅ Discussion posted! (offline mode)');
    }
    setNewPost('');
    setPosting(false);
  };

  const handleLike = async (id) => {
    if (likedIds.has(id)) return;
    try {
      await api.post(`/forums/${id}/like`);
    } catch {}
    setLikedIds(prev => new Set([...prev, id]));
    setThreads(prev => prev.map(t => t.id === id ? { ...t, likeCount: (t.likeCount || 0) + 1 } : t));
  };

  const toggleReplies = async (threadId) => {
    if (expandedId === threadId) { setExpandedId(null); return; }
    setExpandedId(threadId);
    if (!replies[threadId]) {
      try {
        const res = await api.get(`/forums/${threadId}/replies`);
        setReplies(prev => ({ ...prev, [threadId]: res.data || [] }));
      } catch {
        setReplies(prev => ({ ...prev, [threadId]: [] }));
      }
    }
  };

  const filtered = threads;

  return (
    <div className="page-content container">
      {/* Toast notification */}
      {toast && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', background: 'var(--saffron)', color: '#000', padding: '12px 20px', borderRadius: '8px', fontWeight: 700, zIndex: 1000, boxShadow: '0 4px 20px rgba(0,0,0,0.3)', transition: 'all 0.3s' }}>
          {toast}
        </div>
      )}

      <div className="page-hero">
        <div className="section-tag">💬 Community Forums</div>
        <h1 className="page-title heading-display">Discussion <span className="saffron-text">Forums</span></h1>
        <p className="page-sub">Discuss constitutional topics with fellow citizens, educators, and legal experts.</p>
      </div>

      {/* Topic Filter */}
      <div className="cat-filter mb-24">
        {TOPICS.map(t => (
          <button key={t} className={`cat-btn ${topic === t ? 'active' : ''}`} onClick={() => setTopic(t)}>{t}</button>
        ))}
      </div>

      {/* New Post */}
      <div className="glass-card dash-section-card mb-24">
        <h3 style={{ marginBottom: '12px', fontSize: '0.95rem', fontWeight: 700 }}>✍️ Start a New Discussion</h3>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <select
            className="form-select"
            style={{ width: '160px', flexShrink: 0 }}
            value={newTopic}
            onChange={e => setNewTopic(e.target.value)}
          >
            {TOPICS.filter(t => t !== 'All').map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <textarea
          className="form-input"
          rows={3}
          placeholder="Share your thoughts on the Constitution — ask a question, start a debate, or share insights..."
          value={newPost}
          onChange={e => setNewPost(e.target.value)}
          style={{ resize: 'vertical' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {newPost.length > 0 ? `${newPost.length} characters` : 'Be respectful and constructive'}
          </span>
          <button
            className="btn btn-primary"
            style={{ fontSize: '0.82rem', padding: '9px 20px' }}
            onClick={handlePost}
            disabled={!newPost.trim() || posting}
          >
            {posting ? <><span className="spinner" /> Posting...</> : '📢 Post Discussion'}
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '16px' }}>⏳</div>
          Loading discussions...
        </div>
      ) : (
        <div className="forum-threads">
          {filtered.map(t => (
            <div key={t.id} className="thread-card glass-card">
              <span className="badge badge-navy" style={{ marginBottom: '10px', display: 'inline-flex' }}>
                {t.topic}
              </span>
              <h3 className="thread-title">{t.title}</h3>
              <div className="thread-meta">
                <span>👤 {t.authorName || t.author}</span>
                <span>💬 {t.replyCount || 0} replies</span>
                <span
                  style={{ cursor: 'pointer', color: likedIds.has(t.id) ? 'var(--saffron)' : 'inherit', userSelect: 'none' }}
                  onClick={() => handleLike(t.id)}
                  title="Like this discussion"
                >
                  {likedIds.has(t.id) ? '❤️' : '🤍'} {t.likeCount || 0} likes
                </span>
                <span>{timeAgo(t.createdAt || new Date().toISOString())}</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button
                  className="btn btn-ghost"
                  style={{ fontSize: '0.8rem', padding: '7px 16px' }}
                  onClick={() => toggleReplies(t.id)}
                >
                  {expandedId === t.id ? '▲ Hide Replies' : '▼ View Replies →'}
                </button>
                <button
                  className="btn btn-outline"
                  style={{ fontSize: '0.8rem', padding: '7px 16px' }}
                  onClick={() => handleLike(t.id)}
                  disabled={likedIds.has(t.id)}
                >
                  {likedIds.has(t.id) ? '❤️ Liked' : '🤍 Like'}
                </button>
              </div>

              {/* Replies section */}
              {expandedId === t.id && (
                <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                  {(replies[t.id] || []).length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '20px' }}>
                      No replies yet — be the first to join this discussion!
                    </div>
                  ) : (
                    (replies[t.id] || []).map((r, i) => (
                      <div key={i} style={{ padding: '10px 14px', background: 'var(--bg-glass)', borderRadius: '8px', marginBottom: '8px', fontSize: '0.85rem' }}>
                        <span style={{ fontWeight: 600 }}>{r.authorName || r.author}</span>
                        <span style={{ color: 'var(--text-muted)', marginLeft: '8px', fontSize: '0.78rem' }}>{timeAgo(r.createdAt)}</span>
                        <div style={{ marginTop: '6px', color: 'var(--text-body)' }}>{r.content}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              No threads yet. Start the first discussion!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
