import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const ROLES = [
  {
    icon: '🛡️',
    title: 'Admin',
    color: '#FF6B00',
    desc: 'Manages platform content, users, and monitors constitutional education quality across all modules.',
    powers: ['Content Management', 'User Oversight', 'Reports & Analytics', 'Admin Duty Checklist'],
  },
  {
    icon: '👤',
    title: 'Citizen / Student',
    color: '#138808',
    desc: 'Learns, explores, and participates in quizzes, video lectures, and community forums.',
    powers: ['Video Library', 'Study Notes', 'Quizzes & Badges', 'Constitution Explorer'],
  },
  {
    icon: '🏫',
    title: 'Educator',
    color: '#1565C0',
    desc: 'Creates and publishes educational modules, answers citizen queries, and adds video lectures.',
    powers: ['Module Pipeline', 'Video Lecture URLs', 'Citizen Query Replies', 'Teaching Toolkit'],
  },
  {
    icon: '⚖️',
    title: 'Legal Expert',
    color: '#7B1FA2',
    desc: 'Adds expert commentary, flags outdated content, and clarifies articles and landmark judgments.',
    powers: ['Expert Commentary', 'Article Clarification', 'Content Review', 'Amendment Summaries'],
  },
];

const STATS = [
  { value: '448', label: 'Constitutional Articles' },
  { value: '75+', label: 'Years of Republic' },
  { value: '50K+', label: 'Learners Enrolled' },
  { value: '12', label: 'Schedules Covered' },
];

const FEATURES = [
  { icon: '📖', title: 'Deep Article Study', desc: 'Explore every article, amendment, and schedule of the Indian Constitution with expert annotations.' },
  { icon: '🎥', title: 'Video Learning', desc: 'Educator-curated video lectures on parts, chapters, and landmark constitutional cases.' },
  { icon: '🧠', title: 'Interactive Quizzes', desc: 'Challenge yourself with auto-graded quizzes and earn badges for your progress.' },
  { icon: '🗺️', title: 'Constitution Explorer', desc: 'Visual, image-rich exploration of rights, duties, and directive principles.' },
  { icon: '💬', title: 'Community Forums', desc: 'Discuss preamble, rights, and duties with fellow citizens and educators.' },
  { icon: '🔎', title: 'Legal Insights', desc: 'Expert commentary and clarifications by verified legal practitioners.' },
];

export default function Landing() {
  const heroRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      if (heroRef.current) {
        const y = window.scrollY;
        heroRef.current.style.transform = `translateY(${y * 0.3}px)`;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="landing">
      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" ref={heroRef}>
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />
        </div>

        {/* Ashoka wheel decoration */}
        <div className="ashoka-deco" aria-hidden="true">
          <div className="ashoka-ring" />
          <div className="ashoka-ring-2" />
        </div>

        <div className="hero-content container">
          <div className="hero-badge">
            <span className="badge-dot" />
            🇮🇳 &nbsp;Constitutional Awareness Platform of India
          </div>

          <h1 className="hero-title heading-display">
            <span className="gradient-text">Know Your</span><br />
            <span className="saffron-text">Constitution,</span><br />
            Know Your Rights
          </h1>

          <p className="hero-sub">
            The most comprehensive platform to explore, learn, and understand the Indian Constitution —
            designed for citizens, students, educators, and legal experts.
          </p>

          <div className="hero-cta">
            <Link to="/register" className="btn btn-primary btn-lg" id="hero-register-btn">
              🚀 Get Started Free
            </Link>
            <Link to="/login" className="btn btn-outline btn-lg" id="hero-login-btn">
              Sign In →
            </Link>
          </div>

          {/* Preamble snippet */}
          <div className="preamble-card">
            <span className="preamble-label">Preamble of India</span>
            <p className="preamble-text">
              "WE, THE PEOPLE OF INDIA, having solemnly resolved to constitute India into a{' '}
              <strong>SOVEREIGN SOCIALIST SECULAR DEMOCRATIC REPUBLIC</strong> and to secure to all its
              citizens: JUSTICE, LIBERTY, EQUALITY and FRATERNITY..."
            </p>
          </div>
        </div>

        {/* Flag strip */}
        <div className="hero-flag-strip">
          <div className="flag-saffron" /><div className="flag-white" /><div className="flag-green" />
        </div>
      </section>

      {/* STATS */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {STATS.map(s => (
              <div className="stats-item glass-card" key={s.label}>
                <div className="stats-value saffron-text">{s.value}</div>
                <div className="stats-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section className="about-section container">
        <div className="section-tag">📜 Why This Matters</div>
        <h2 className="section-title heading-display">
          The <span className="saffron-text">Indian Constitution</span> is
          the Living Heart of Democracy
        </h2>
        <div className="about-grid">
          <div className="about-text">
            <p>
              Adopted on <strong>26 November 1949</strong>, the Indian Constitution is the world's longest
              written constitution — a supreme document that guarantees fundamental rights, establishes
              state policy directives, and lays down the framework of governance for over 1.4 billion people.
            </p>
            <p>
              Yet, surveys show that <strong>fewer than 20% of Indians</strong> have read even the Preamble.
              This platform exists to bridge that gap — making constitutional education accessible, engaging,
              and role-specific for every Indian.
            </p>
            <div className="about-highlights">
              {[
                ['📋', '448 Articles', 'Across 25 parts + 12 Schedules'],
                ['🖊️', '106 Amendments', 'Reflecting India\'s evolving democracy'],
                ['🏛️', 'Fundamental Rights', 'Articles 12–35 — your shield as a citizen'],
              ].map(([icon, title, sub]) => (
                <div className="highlight-card" key={title}>
                  <span className="hl-icon">{icon}</span>
                  <div>
                    <div className="hl-title">{title}</div>
                    <div className="hl-sub">{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="about-visual">
            <div className="constitution-book">
              <div className="book-spine" />
              <div className="book-cover">
                <div className="book-ashoka">☸</div>
                <div className="book-title-text">भारत का संविधान</div>
                <div className="book-title-text-en">Constitution of India</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROLES SECTION */}
      <section className="roles-section">
        <div className="container">
          <div className="section-tag">🎭 Platform Roles</div>
          <h2 className="section-title heading-display text-center">
            Four Roles, <span className="saffron-text">One Mission</span>
          </h2>
          <p className="section-sub text-center">
            Every participant plays a unique role in building a constitutionally literate India.
          </p>
          <div className="roles-grid">
            {ROLES.map((role, i) => (
              <div
                key={role.title}
                className="role-card glass-card anim-fadeInUp"
                style={{ '--role-color': role.color, animationDelay: `${i * 0.12}s` }}
              >
                <div className="role-icon-badge">{role.icon}</div>
                <h3 className="role-card-title" style={{ color: role.color }}>{role.title}</h3>
                <p className="role-card-desc">{role.desc}</p>
                <ul className="role-powers">
                  {role.powers.map(p => (
                    <li key={p}><span className="power-dot" style={{ background: role.color }} />{p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section container">
        <div className="section-tag">✨ Platform Features</div>
        <h2 className="section-title heading-display">
          Everything You Need to <span className="saffron-text">Learn & Teach</span>
        </h2>
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="feature-card glass-card anim-fadeInUp" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="feature-icon">{f.icon}</div>
              <h4 className="feature-title">{f.title}</h4>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BAND */}
      <section className="cta-section">
        <div className="container cta-inner">
          <div className="cta-flag-strip-v" aria-hidden="true">
            <div /><div /><div />
          </div>
          <h2 className="cta-title heading-display">
            Start Your Constitutional Journey <span className="saffron-text">Today</span>
          </h2>
          <p className="cta-sub">
            Join a growing community of informed citizens, dedicated educators, and expert legal practitioners.
          </p>
          <div className="hero-cta">
            <Link to="/register" className="btn btn-primary btn-lg">Create Free Account</Link>
            <Link to="/login"    className="btn btn-outline btn-lg">Already a Member?</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="container footer-inner">
          <div className="footer-logo">
            <span>⚖️</span>
            <span>Constitution Awareness Platform</span>
          </div>
          <p className="footer-note">
            "The Constitution is not a mere lawyer's document, it is a vehicle of Life." — Dr. B.R. Ambedkar
          </p>
          <div className="footer-strip">
            <div className="fs" style={{background:'#FF6B00'}} />
            <div className="fs" style={{background:'rgba(255,255,255,0.3)'}} />
            <div className="fs" style={{background:'#138808'}} />
          </div>
        </div>
      </footer>
    </div>
  );
}
