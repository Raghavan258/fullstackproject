import React from 'react';
import './Pages.css';

const SECTIONS = [
  { icon: '📜', title: 'The Preamble', color: '#FF6B00', desc: 'WE, THE PEOPLE OF INDIA, having solemnly resolved to constitute India into a SOVEREIGN SOCIALIST SECULAR DEMOCRATIC REPUBLIC and to secure to all its citizens: JUSTICE — social, economic and political; LIBERTY of thought, expression, belief, faith and worship; EQUALITY of status and of opportunity; and to promote among them all FRATERNITY assuring the dignity of the individual and the unity and integrity of the Nation.', note: 'The Preamble reflects the ideals and aspirations of the Constitution.' },
  { icon: '⚖️', title: 'Fundamental Rights (Articles 12–35)', color: '#1565C0', desc: 'Six fundamental rights guaranteed to all citizens: Right to Equality, Right to Freedom, Right against Exploitation, Right to Freedom of Religion, Cultural and Educational Rights, and Right to Constitutional Remedies.', note: 'These are justiciable — enforceable by courts.' },
  { icon: '🎯', title: 'Directive Principles (Articles 36–51)', color: '#138808', desc: 'Guidelines for the State to secure a social order for the promotion of welfare of the people. Though non-justiciable, they are fundamental in the governance of the country.', note: 'Inspired by the Irish Constitution and the Universal Declaration of Human Rights.' },
  { icon: '🤝', title: 'Fundamental Duties (Article 51A)', color: '#7B1FA2', desc: 'Eleven duties for all citizens including respecting the Constitution, promoting harmony, preserving the composite culture, and protecting the environment.', note: 'Added by the 42nd Amendment in 1976; an 11th duty added by the 86th Amendment in 2002.' },
  { icon: '🏛️', title: 'The Parliament & Executive', color: '#FF6B00', desc: 'Parts V and VI cover Union and State governments, including the President, Vice President, PM & Council of Ministers, Parliament, and Supreme Court.', note: 'India follows a Parliamentary system with a fusion of executive and legislative branches.' },
];

export default function AboutConstitution() {
  return (
    <div className="page-content container">
      <div className="page-hero">
        <div className="section-tag">📖 About</div>
        <h1 className="page-title heading-display">The Indian <span className="saffron-text">Constitution</span></h1>
        <p className="page-sub">The supreme law of India — adopted on 26 November 1949, effective from 26 January 1950.</p>
      </div>

      <div className="about-meta-grid">
        {[['📅','26 Jan 1950','Effective Date'],['📋','448','Articles'],['📖','25','Parts'],['🗂️','12','Schedules'],['✏️','106','Amendments'],['🌍','World\'s longest','Written Constitution']].map(([icon,val,label]) => (
          <div key={label} className="about-meta-card glass-card">
            <div style={{fontSize:'1.5rem',marginBottom:'8px'}}>{icon}</div>
            <div style={{fontSize:'1.2rem',fontWeight:800,color:'var(--saffron-light)'}}>{val}</div>
            <div style={{fontSize:'0.75rem',color:'var(--text-muted)',marginTop:'4px'}}>{label}</div>
          </div>
        ))}
      </div>

      <div className="sections-list">
        {SECTIONS.map(s => (
          <div key={s.title} className="about-section-card glass-card" style={{'--sc': s.color}}>
            <div className="sc-icon">{s.icon}</div>
            <div className="sc-body">
              <h3 className="sc-title" style={{color: s.color}}>{s.title}</h3>
              <p className="sc-desc">{s.desc}</p>
              <div className="sc-note">💡 {s.note}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Ambedkar quote */}
      <div className="quote-block">
        <div className="quote-icon">❝</div>
        <p className="quote-text">
          "The Constitution is not a mere lawyer's document, it is a vehicle of Life, and its spirit is always the spirit of Age."
        </p>
        <div className="quote-attr">— Dr. B.R. Ambedkar, Chief Architect of the Indian Constitution</div>
      </div>
    </div>
  );
}
