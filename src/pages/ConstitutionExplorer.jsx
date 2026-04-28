import React, { useState } from 'react';
import './Pages.css';

const PARTS = [
  { id: 1, part: 'Part I', title: 'The Union and its Territory', articles: '1–4', icon: '🗺️', color: '#FF6B00', desc: 'Defines India as a Union of States and outlines the territory of India.' },
  { id: 2, part: 'Part II', title: 'Citizenship', articles: '5–11', icon: '🪪', color: '#1565C0', desc: 'Provisions relating to citizenship at the commencement of the Constitution.' },
  { id: 3, part: 'Part III', title: 'Fundamental Rights', articles: '12–35', icon: '⚖️', color: '#138808', desc: 'Guarantees six fundamental rights to every Indian citizen: Equality, Freedom, Anti-Exploitation, Religion, Culture, Constitutional Remedies.' },
  { id: 4, part: 'Part IV', title: 'Directive Principles of State Policy', articles: '36–51', icon: '🎯', color: '#7B1FA2', desc: 'Non-justiciable guidelines for the state to establish a just social order.' },
  { id: 5, part: 'Part IV-A', title: 'Fundamental Duties', articles: '51A', icon: '🤝', color: '#E65100', desc: '11 duties for every citizen to uphold the values and integrity of India.' },
  { id: 6, part: 'Part V', title: 'The Union', articles: '52–151', icon: '🏛️', color: '#0D47A1', desc: 'Covers the President, Vice-President, Parliament, Supreme Court, Comptroller.' },
  { id: 7, part: 'Part VI', title: 'The States', articles: '152–237', icon: '🏙️', color: '#1B5E20', desc: 'Covers the Governor, State Legislature, High Courts, and State executive.' },
  { id: 8, part: 'Part XVIII', title: 'Emergency Provisions', articles: '352–360', icon: '🚨', color: '#B71C1C', desc: 'National Emergency (352), State Emergency (356), and Financial Emergency (360).' },
];

export default function ConstitutionExplorer() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="page-content container">
      <div className="page-hero">
        <div className="section-tag">🗺️ Constitution Explorer</div>
        <h1 className="page-title heading-display">Explore the <span className="saffron-text">Constitution</span></h1>
        <p className="page-sub">Visual exploration of all 25 Parts of the Indian Constitution. Click a part to learn more.</p>
      </div>

      <div className="explorer-grid">
        {PARTS.map(p => (
          <div
            key={p.id}
            className={`explorer-card glass-card ${selected === p.id ? 'explorer-selected' : ''}`}
            style={{'--ec': p.color}}
            onClick={() => setSelected(selected === p.id ? null : p.id)}
          >
            <div className="explorer-icon">{p.icon}</div>
            <div className="explorer-part" style={{color: p.color}}>{p.part}</div>
            <div className="explorer-title">{p.title}</div>
            <div className="explorer-articles">Articles {p.articles}</div>
            {selected === p.id && (
              <div className="explorer-desc">{p.desc}</div>
            )}
          </div>
        ))}
      </div>

      {/* Schedules section */}
      <div className="glass-card dash-section-card mt-32">
        <h3 style={{fontSize:'1rem',fontWeight:700,marginBottom:'16px'}}>📋 The 12 Schedules</h3>
        <div className="schedules-grid">
          {[
            ['1st', 'List of States & UTs and their territories'],
            ['2nd', 'Salaries of President, Governors, Judges etc.'],
            ['3rd', 'Forms of Oaths or Affirmations'],
            ['5th', 'Administration of Scheduled Areas & Tribes'],
            ['7th', 'Union, State & Concurrent Lists'],
            ['8th', '22 Official Languages of India'],
            ['9th', 'Acts protected from judicial review'],
            ['10th', 'Anti-defection law'],
          ].map(([num, desc]) => (
            <div key={num} className="schedule-item">
              <span className="sch-num">{num}</span>
              <span className="sch-desc">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
