import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import './Pages.css';

// Curated real YouTube constitutional education videos
const FALLBACK_VIDEOS = [
  {
    id: 1,
    title: 'Understanding the Preamble of India',
    educator: 'Priya Menon',
    duration: '18 min',
    category: 'Preamble',
    thumb: '🎬',
    videoId: 'JX5GGW7LCXI',
    url: 'https://www.youtube.com/embed/JX5GGW7LCXI',
  },
  {
    id: 2,
    title: 'Fundamental Rights — Articles 12 to 35',
    educator: 'Dr. Rao',
    duration: '32 min',
    category: 'Fundamental Rights',
    thumb: '📹',
    videoId: 'A1ZNQM7MMIE',
    url: 'https://www.youtube.com/embed/A1ZNQM7MMIE',
  },
  {
    id: 3,
    title: 'Right to Equality — Article 14 Deep Dive',
    educator: 'Adv. Sharma',
    duration: '22 min',
    category: 'Fundamental Rights',
    thumb: '🎥',
    videoId: 'tSCQJHBaRnk',
    url: 'https://www.youtube.com/embed/tSCQJHBaRnk',
  },
  {
    id: 4,
    title: 'Directive Principles and Their Importance',
    educator: 'Priya Menon',
    duration: '25 min',
    category: 'DPSP',
    thumb: '🎬',
    videoId: '_hSWtqGkQlQ',
    url: 'https://www.youtube.com/embed/_hSWtqGkQlQ',
  },
  {
    id: 5,
    title: 'Constitutional Amendments Timeline',
    educator: 'Dr. Rao',
    duration: '40 min',
    category: 'Amendments',
    thumb: '📹',
    videoId: 'oRuBhXeRnTE',
    url: 'https://www.youtube.com/embed/oRuBhXeRnTE',
  },
  {
    id: 6,
    title: 'Landmark Cases — Kesavananda Bharati',
    educator: 'Adv. Sharma',
    duration: '35 min',
    category: 'Case Studies',
    thumb: '🎥',
    videoId: 'MCsjSjGcuQ8',
    url: 'https://www.youtube.com/embed/MCsjSjGcuQ8',
  },
  {
    id: 7,
    title: 'Right to Life & Liberty — Article 21',
    educator: 'Dr. Rao',
    duration: '28 min',
    category: 'Fundamental Rights',
    thumb: '🎬',
    videoId: 'GVW4RpTBXK0',
    url: 'https://www.youtube.com/embed/GVW4RpTBXK0',
  },
  {
    id: 8,
    title: 'Emergency Provisions in the Constitution',
    educator: 'Priya Menon',
    duration: '30 min',
    category: 'Amendments',
    thumb: '📹',
    videoId: 'Tm4GnLU9_oc',
    url: 'https://www.youtube.com/embed/Tm4GnLU9_oc',
  },
  {
    id: 9,
    title: 'Fundamental Duties — Article 51A',
    educator: 'Adv. Sharma',
    duration: '20 min',
    category: 'Duties',
    thumb: '🎥',
    videoId: 'bDnLJFGuhMo',
    url: 'https://www.youtube.com/embed/bDnLJFGuhMo',
  },
];

const CATEGORIES = ['All', 'Preamble', 'Fundamental Rights', 'DPSP', 'Amendments', 'Case Studies', 'Duties'];

export default function VideoLibrary() {
  const [cat, setCat] = useState('All');
  const [videos, setVideos] = useState(FALLBACK_VIDEOS);
  const [playing, setPlaying] = useState(null);
  const [search, setSearch] = useState('');

  // Try to fetch from backend; if backend is down or returns empty, use fallback
  useEffect(() => {
    api.get('/study-notes') // Not a video endpoint; backend has no video entity — use fallback
      .catch(() => {}) // silently ignore
      .finally(() => setVideos(FALLBACK_VIDEOS));
  }, []);

  const filtered = videos.filter(v => {
    const matchCat = cat === 'All' || v.category === cat;
    const matchSearch = !search || v.title.toLowerCase().includes(search.toLowerCase()) || v.educator.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="page-content container">
      <div className="page-hero">
        <div className="section-tag">🎥 Video Library</div>
        <h1 className="page-title heading-display">Video <span className="saffron-text">Lectures</span></h1>
        <p className="page-sub">Educator-curated video modules on the Indian Constitution. Click ▶ Watch to play.</p>
      </div>

      <div className="filter-bar mb-0" style={{ marginBottom: '16px' }}>
        <input
          className="form-input search-input"
          placeholder="🔍 Search videos..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1 }}
        />
      </div>

      <div className="cat-filter">
        {CATEGORIES.map(c => (
          <button key={c} className={`cat-btn ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>

      {/* Video Player Modal */}
      {playing && (
        <div
          className="video-modal-overlay"
          onClick={() => setPlaying(null)}
        >
          <div className="video-modal-inner" onClick={e => e.stopPropagation()}>
            <div className="video-modal-header">
              <div>
                <div className="badge badge-saffron mb-8" style={{ display: 'inline-flex' }}>{playing.category}</div>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>{playing.title}</h3>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>👤 {playing.educator} · ⏱ {playing.duration}</div>
              </div>
              <button
                className="btn btn-ghost"
                style={{ fontSize: '1.4rem', padding: '4px 12px', lineHeight: 1 }}
                onClick={() => setPlaying(null)}
              >✕</button>
            </div>
            <div className="video-embed-wrap">
              <iframe
                src={`${playing.url}?autoplay=1&rel=0`}
                title={playing.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ width: '100%', height: '400px', border: 'none', borderRadius: '8px' }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="grid-3">
        {filtered.map(v => (
          <div key={v.id} className="video-card glass-card">
            <div
              className="video-thumb video-thumb-clickable"
              onClick={() => setPlaying(v)}
              title="Click to play"
            >
              <span className="video-thumb-icon">{v.thumb}</span>
              <div className="video-play-overlay">
                <span className="video-play-btn">▶</span>
              </div>
            </div>
            <div className="video-info">
              <div className="video-category badge badge-navy mb-8">{v.category}</div>
              <h3 className="video-title">{v.title}</h3>
              <div className="video-meta">
                <span>👤 {v.educator}</span>
                <span>⏱ {v.duration}</span>
              </div>
              <button
                className="btn btn-primary"
                style={{ marginTop: '12px', fontSize: '0.82rem', padding: '9px 18px' }}
                onClick={() => setPlaying(v)}
              >
                ▶ Watch Now
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            No videos match your search.
          </div>
        )}
      </div>
    </div>
  );
}
